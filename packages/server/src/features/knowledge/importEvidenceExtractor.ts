import * as path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

import { LinkRelationshipKind } from "@live-documentation/shared/domain/artifacts";
import { LinkEvidence } from "@live-documentation/shared/inference/linkInference";
import {
  collectIdentifierUsage,
  extractLocalImportNames,
  hasTypeUsage,
  hasRuntimeUsage
} from "@live-documentation/shared/language/typeScriptAstUtils";

import { fileExists } from "./directoryScanner";
import { MODULE_RESOLUTION_EXTENSIONS, inferScriptKind } from "./languageInference";

/** Contextual inputs for the import/require evidence extraction pass. */
export interface ImportEvidenceContext {
  content: string;
  sourceFile: string;
  sourceUri: string;
  workspaceRoot: string;
}

interface ModuleReferenceRecord {
  specifier: string;
  context: "import" | "export" | "require" | "dynamic";
  isTypeOnly: boolean;
  localNames: string[];
}

/**
 * Extracts link evidence from import/require statements in TypeScript/JavaScript files.
 */
export async function extractImportEvidences(context: ImportEvidenceContext): Promise<LinkEvidence[]> {
  const extension = path.extname(context.sourceFile).toLowerCase();
  if (!MODULE_RESOLUTION_EXTENSIONS.includes(extension)) {
    return [];
  }

  const scriptKind = inferScriptKind(extension);
  if (scriptKind === ts.ScriptKind.Unknown) {
    return [];
  }

  const sourceFile = ts.createSourceFile(
    context.sourceFile,
    context.content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const references = collectModuleReferences(sourceFile);
  if (!references.length) {
    return [];
  }

  const identifierUsage = collectIdentifierUsage(sourceFile);
  const evidences: LinkEvidence[] = [];
  const seenTargets = new Set<string>();

  for (const reference of references) {
    const hasRuntimeBinding = hasRuntimeUsage(identifierUsage, reference.localNames);
    const hasTypeBinding = hasTypeUsage(identifierUsage, reference.localNames);

    if (!hasRuntimeBinding && !hasTypeBinding) {
      continue;
    }

    const resolved = await resolveModuleReference(reference.specifier, context);
    if (!resolved) {
      continue;
    }

    const targetUri = pathToFileURL(resolved).toString();
    const key = `${targetUri}@${reference.context}`;
    if (seenTargets.has(key)) {
      continue;
    }
    seenTargets.add(key);

    const kind: LinkRelationshipKind = hasRuntimeBinding ? "depends_on" : "references";
    const baseConfidence = reference.context === "export" ? 0.85 : 0.95;
    const confidence = hasRuntimeBinding ? baseConfidence : Math.min(baseConfidence, 0.85);

    evidences.push({
      sourceUri: context.sourceUri,
      targetUri,
      kind,
      confidence,
      rationale: formatImportRationale(reference, hasRuntimeBinding ? "runtime" : "type")
    });
  }

  return evidences;
}

function collectModuleReferences(sourceFile: ts.SourceFile): ModuleReferenceRecord[] {
  const records: ModuleReferenceRecord[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const localNames = extractLocalImportNames(node.importClause);
      records.push({
        specifier: node.moduleSpecifier.text,
        context: "import",
        isTypeOnly: node.importClause?.isTypeOnly ?? false,
        localNames
      });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      records.push({
        specifier: node.moduleSpecifier.text,
        context: "export",
        isTypeOnly: node.isTypeOnly ?? false,
        localNames: []
      });
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      records.push({
        specifier: node.moduleReference.expression.text,
        context: "import",
        isTypeOnly: node.isTypeOnly ?? false,
        localNames: [node.name.text]
      });
    } else if (ts.isCallExpression(node) && node.arguments.length === 1) {
      const arg = node.arguments[0];
      if (ts.isStringLiteral(arg)) {
        if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
          records.push({ specifier: arg.text, context: "require", isTypeOnly: false, localNames: [] });
        } else if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          records.push({ specifier: arg.text, context: "dynamic", isTypeOnly: false, localNames: [] });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return records;
}

function formatImportRationale(
  reference: ModuleReferenceRecord,
  usage: "runtime" | "type" = "runtime"
): string {
  const importLabel = usage === "type" ? "type import" : "import";

  switch (reference.context) {
    case "export":
      return usage === "type" ? `type re-export ${reference.specifier}` : `re-export ${reference.specifier}`;
    case "require":
      return `CommonJS require ${reference.specifier}`;
    case "dynamic":
      return `dynamic import(${reference.specifier})`;
    default:
      return `${importLabel} ${reference.specifier}`;
  }
}

async function resolveModuleReference(
  specifier: string,
  context: ImportEvidenceContext
): Promise<string | undefined> {
  const trimmed = specifier.trim();
  if (!trimmed) {
    return undefined;
  }

  const resolutionOrder: string[] = [];

  if (trimmed.startsWith(".")) {
    resolutionOrder.push(path.resolve(path.dirname(context.sourceFile), trimmed));
  } else if (trimmed.startsWith("/")) {
    resolutionOrder.push(path.resolve(context.workspaceRoot, trimmed.slice(1)));
  } else {
    resolutionOrder.push(path.resolve(context.workspaceRoot, trimmed));
  }

  for (const candidate of resolutionOrder) {
    const resolved = await resolveWithExtensions(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return undefined;
}

async function resolveWithExtensions(basePath: string): Promise<string | undefined> {
  if (await fileExists(basePath)) {
    return basePath;
  }

  const attempts: string[] = [];
  const ext = path.extname(basePath);

  if (ext) {
    attempts.push(basePath);
  } else {
    for (const candidateExt of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(`${basePath}${candidateExt}`);
    }
  }

  const indexBase = ext ? basePath.slice(0, basePath.length - ext.length) : basePath;
  for (const candidateExt of MODULE_RESOLUTION_EXTENSIONS) {
    attempts.push(path.join(indexBase, `index${candidateExt}`));
  }

  for (const attempt of attempts) {
    if (await fileExists(attempt)) {
      return attempt;
    }
  }

  return undefined;
}
