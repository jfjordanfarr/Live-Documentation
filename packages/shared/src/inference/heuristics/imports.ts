import path from "node:path";
import ts from "typescript";

import { isImplementationLayer } from "./artifactLayerUtils";
import { resolveReference } from "./referenceResolver";
import { cleanupReference, computeReferenceStart, isWithinComment } from "./shared";
import {
  collectIdentifierUsage,
  extractLocalImportNames,
  hasRuntimeUsage,
  isLikelyTypeDefinitionSpecifier,
} from "../../language/typeScriptAstUtils";
import type { FallbackHeuristic, HeuristicArtifact, MatchEmitter } from "../fallbackHeuristicTypes";

const MODULE_REFERENCE_PATTERN = "(?:(?:import|export)\\s+[^\"'`]*?[\"'`]([^\"'`]+)[\"'`]|require\\(\\s*[\"'`]([^\"'`]+)[\"'`]\\s*\\))";
const MODULE_REFERENCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const PYTHON_IMPORT_PATTERN = "^\\s*import\\s+(.+)$";
const PYTHON_FROM_IMPORT_PATTERN = "^\\s*from\\s+([.\\w]+)\\s+import\\s+(.+)$";
const TYPESCRIPT_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);

type TypeScriptImportRuntimeInfo = Map<string, { hasRuntimeUsage: boolean; isTypeOnly: boolean }>;

export function createImportHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  return {
    id: "module-imports",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer);
    },
    evaluate(source, emit) {
      const content = source.content ?? "";
      const extension = path.extname(source.comparablePath).toLowerCase();

      if (!content.trim()) {
        return;
      }

      if (extension === ".py") {
        evaluatePythonImports(content, source, candidates, emit);
      }

      if (!MODULE_REFERENCE_EXTENSIONS.has(extension)) {
        return;
      }

      const runtimeInfo = buildTypeScriptImportRuntimeInfo(source);
      const pattern = new RegExp(MODULE_REFERENCE_PATTERN, "gm");

      for (const match of content.matchAll(pattern)) {
        const rawReference = match[1] ?? match[2] ?? "";
        const referenceStart = computeReferenceStart(match, rawReference);
        if (referenceStart !== null && isWithinComment(content, referenceStart)) {
          continue;
        }

        const reference = cleanupReference(rawReference);
        if (!reference) {
          continue;
        }

        const isImportOrExport = Boolean(match[1]);
        if (isImportOrExport && runtimeInfo) {
          const runtime = runtimeInfo.get(reference);
          // Skip only if the import is completely unused (no runtime AND no type usage)
          // Type-only imports ARE included because they represent real change impact
          if (runtime && !runtime.hasRuntimeUsage && !runtime.isTypeOnly) {
            continue;
          }
        }

        const resolution = resolveReference(reference, source, candidates, `import ${reference}`);
        if (!resolution) {
          continue;
        }

        emit({
          target: resolution.target,
          confidence: resolution.confidence,
          rationale: resolution.rationale,
          context: "import",
        });
      }
    },
  };
}

function evaluatePythonImports(
  content: string,
  source: HeuristicArtifact,
  candidates: readonly HeuristicArtifact[],
  emit: MatchEmitter
): void {
  const seen = new Set<string>();

  const recordReferences = (references: string[], rationale: string): void => {
    for (const reference of references) {
      if (!reference || seen.has(reference)) {
        continue;
      }

      const resolution = resolveReference(reference, source, candidates, rationale);
      if (!resolution) {
        continue;
      }

      emit({
        target: resolution.target,
        confidence: resolution.confidence,
        rationale: resolution.rationale,
        context: "import",
      });

      seen.add(reference);
    }
  };

  const fromPattern = new RegExp(PYTHON_FROM_IMPORT_PATTERN, "gm");
  for (const match of content.matchAll(fromPattern)) {
    const modulePart = stripPythonInlineComment(match[1]);
    const importSpec = stripPythonInlineComment(match[2]);
    const importedNames = splitPythonImportList(importSpec);
    const references = collectPythonReferenceCandidates(modulePart, importedNames);
    recordReferences(references, `python from import ${modulePart || "."}`);
  }

  const importPattern = new RegExp(PYTHON_IMPORT_PATTERN, "gm");
  for (const match of content.matchAll(importPattern)) {
    const modulesSpec = stripPythonInlineComment(match[1]);
    const modules = splitPythonImportList(modulesSpec);
    for (const moduleSpecifier of modules) {
      const references = collectPythonReferenceCandidates(moduleSpecifier, []);
      recordReferences(references, `python import ${moduleSpecifier}`);
    }
  }
}

function stripPythonInlineComment(segment: string | undefined): string {
  if (!segment) {
    return "";
  }

  const [withoutComment] = segment.split("#", 1);
  return withoutComment.replace(/[()]/g, " ").trim();
}

function splitPythonImportList(segment: string): string[] {
  if (!segment) {
    return [];
  }

  return segment
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.replace(/\s+as\s+[\w.]+$/i, ""));
}

function collectPythonReferenceCandidates(
  moduleSpecifier: string | undefined,
  importedNames: string[]
): string[] {
  const references = new Set<string>();
  const resolution = resolvePythonModule(moduleSpecifier);

  const push = (value: string): void => {
    if (value.trim().length > 0) {
      references.add(value);
    }
  };

  const modulePath = resolution.pathSegments.length > 0 ? resolution.pathSegments.join("/") : "";

  if (modulePath) {
    push(`${resolution.prefix}${modulePath}`);
    push(modulePath);
    push(`${resolution.prefix}${modulePath}.py`);
    push(`${resolution.prefix}${modulePath}/__init__`);
  }

  const sanitizedNames = importedNames
    .map((name) => name.replace(/[()]/g, "").trim())
    .filter((name) => name.length > 0 && name !== "*")
    .map((name) => name.replace(/\./g, "/"));

  if (!modulePath && sanitizedNames.length === 0) {
    push(resolution.prefix);
  }

  for (const name of sanitizedNames) {
    if (modulePath) {
      push(`${resolution.prefix}${modulePath}/${name}`);
      push(`${modulePath}/${name}`);
    } else {
      push(`${resolution.prefix}${name}`);
      push(name);
    }
  }

  return Array.from(references);
}

function resolvePythonModule(moduleSpecifier: string | undefined): {
  prefix: string;
  pathSegments: string[];
} {
  if (!moduleSpecifier) {
    return { prefix: "./", pathSegments: [] };
  }

  const trimmed = moduleSpecifier.trim();
  if (!trimmed) {
    return { prefix: "./", pathSegments: [] };
  }

  let leadingDots = 0;
  while (leadingDots < trimmed.length && trimmed[leadingDots] === ".") {
    leadingDots += 1;
  }

  const remainder = trimmed.slice(leadingDots).replace(/^\.+/, "");
  const pathSegments = remainder
    .split(".")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (leadingDots === 0 || leadingDots === 1) {
    return { prefix: "./", pathSegments };
  }

  return {
    prefix: "../".repeat(leadingDots - 1),
    pathSegments,
  };
}

function buildTypeScriptImportRuntimeInfo(source: HeuristicArtifact): TypeScriptImportRuntimeInfo | null {
  if (!source.content) {
    return null;
  }

  const extension = path.extname(source.comparablePath);
  if (!TYPESCRIPT_EXTENSIONS.has(extension)) {
    return null;
  }

  const scriptKind = inferTypeScriptScriptKind(extension);
  if (scriptKind === ts.ScriptKind.Unknown) {
    return null;
  }

  const sourceFile = ts.createSourceFile(
    source.comparablePath,
    source.content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const identifierUsage = collectIdentifierUsage(sourceFile);
  const runtimeInfo: TypeScriptImportRuntimeInfo = new Map();

  const register = (specifier: string, localNames: string[], typeOnly: boolean): void => {
    if (!specifier) {
      return;
    }

    const existing = runtimeInfo.get(specifier) ?? { hasRuntimeUsage: false, isTypeOnly: true };
    const treatAsTypeOnly = typeOnly || isLikelyTypeDefinitionSpecifier(specifier);

    if (treatAsTypeOnly) {
      runtimeInfo.set(specifier, existing);
      return;
    }

    const hasRuntimeBinding = hasRuntimeUsage(identifierUsage, localNames);
    if (hasRuntimeBinding) {
      existing.hasRuntimeUsage = true;
      existing.isTypeOnly = false;
    }

    runtimeInfo.set(specifier, existing);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const localNames = extractLocalImportNames(node.importClause);
      const isTypeOnly = node.importClause?.isTypeOnly ?? false;
      register(node.moduleSpecifier.text, localNames, isTypeOnly);
      return;
    }

    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      register(node.moduleReference.expression.text, [node.name.text], node.isTypeOnly ?? false);
      return;
    }

    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const isTypeOnly = Boolean(node.isTypeOnly) ||
        (!!node.exportClause &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.length > 0 &&
          node.exportClause.elements.every((element) => element.isTypeOnly));
      register(specifier, [], isTypeOnly);
      return;
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return runtimeInfo.size ? runtimeInfo : null;
}

function inferTypeScriptScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.Unknown;
  }
}
