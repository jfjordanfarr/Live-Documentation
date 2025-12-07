import { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

import {
  ArtifactSeed,
  collectIdentifierUsage,
  extractLocalImportNames,
  hasTypeUsage,
  hasRuntimeUsage,
  LinkRelationshipKind,
  LinkEvidence,
  RelationshipHint,
  WorkspaceLinkContribution,
  WorkspaceLinkProvider
} from "@live-documentation/shared";

interface WorkspaceIndexProviderOptions {
  rootPath: string;
  implementationGlobs?: string[];
  documentationGlobs?: string[];
  scriptGlobs?: string[];
  logger?: {
    info(message: string): void;
  };
}

export const DEFAULT_CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cts",
  ".mts",
  ".cs",
  ".c",
  ".h"
]);
export const DEFAULT_DOC_EXTENSIONS = new Set([".md", ".mdx", ".markdown", ".txt", ".yaml", ".yml"]);

export type ExportedSymbolKind =
  | "class"
  | "function"
  | "variable"
  | "enum"
  | "interface"
  | "type"
  | "namespace"
  | "default"
  | "unknown";

export interface ExportedSymbolMetadata {
  name: string;
  kind: ExportedSymbolKind;
  isDefault?: boolean;
  isTypeOnly?: boolean;
}

export interface DocumentSymbolReferenceMetadata {
  symbol: string;
  context?: string;
}

interface MdmdDocumentDetails {
  layer?: string;
  identifier?: string;
  identifiers: string[];
  codePaths: string[];
  exports: string[];
  sectionSymbols: string[];
}

/**
 * Lightweight workspace indexer that seeds implementation artifacts so markdown linkage heuristics
 * have viable candidates. Intended primarily for integration and dogfooding scenarios.
 */
export function createWorkspaceIndexProvider(options: WorkspaceIndexProviderOptions): WorkspaceLinkProvider {
  const normalizedRoot = path.resolve(options.rootPath);

  return {
    id: "workspace-index",
    label: "Workspace Implementation Index",
    async collect(): Promise<WorkspaceLinkContribution> {
      const seeds: ArtifactSeed[] = [];
      const hints: RelationshipHint[] = [];
      const evidences: LinkEvidence[] = [];
      const implTargets = options.implementationGlobs ?? ["src"];
      const docTargets = options.documentationGlobs ?? [
        "docs",
        "specs",
        "templates",
        "config",
        ".mdmd",
        ".live-documentation",
        "README.md"
      ];
      const scriptTargets = options.scriptGlobs ?? ["scripts"];

      // Implementation/code
      for (const target of implTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_CODE_EXTENSIONS.has(ext)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const exportedSymbols = extractExportedSymbols(filePath, content);
            const metadata: Record<string, unknown> | undefined = exportedSymbols.length
              ? { exportedSymbols }
              : undefined;

            seeds.push({
              uri,
              layer: "code",
              language: inferLanguage(filePath),
              content,
              metadata
            });

            const directiveHints = await extractLinkHints({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            hints.push(...directiveHints);

            const pathHints = await extractPathReferenceHints({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            hints.push(...pathHints);

            const importEvidences = await extractImportEvidences({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            evidences.push(...importEvidences);
          } catch {
            // ignore
          }
        });
      }

      // Documentation/templates (as requirements layer)
      for (const target of docTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_DOC_EXTENSIONS.has(ext) && !looksLikeDocsPath(filePath)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const mdmdDetails = extractMdmdDocumentDetails(content);
            const symbolReferences = extractDocumentSymbolReferences(content, mdmdDetails);

            const metadataParts: Record<string, unknown> = {};
            if (symbolReferences.length) {
              metadataParts.symbolReferences = symbolReferences;
            }

            if (
              mdmdDetails.layer ||
              mdmdDetails.identifier ||
              mdmdDetails.identifiers.length ||
              mdmdDetails.codePaths.length ||
              mdmdDetails.exports.length ||
              mdmdDetails.sectionSymbols.length
            ) {
              metadataParts.mdmd = {
                layer: mdmdDetails.layer,
                identifier: mdmdDetails.identifier,
                identifiers: mdmdDetails.identifiers,
                codePaths: mdmdDetails.codePaths,
                exports: mdmdDetails.exports,
                sectionSymbols: mdmdDetails.sectionSymbols
              };
            }

            const metadata = Object.keys(metadataParts).length > 0 ? metadataParts : undefined;

            seeds.push({
              uri,
              layer: inferDocumentLayer(mdmdDetails.layer, filePath),
              language: inferDocLanguage(filePath),
              content,
              metadata
            });

            const context: LinkHintContext = {
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            };

            const directiveHints = await extractLinkHints(context);
            hints.push(...directiveHints);

            const pathHints = await extractPathReferenceHints(context);
            hints.push(...pathHints);

            const metadataHints = await createMdmdMetadataHints(mdmdDetails, context);
            hints.push(...metadataHints);
          } catch {
            // ignore
          }
        });
      }

      // Scripts (outside src) as code
      for (const target of scriptTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_CODE_EXTENSIONS.has(ext)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const exportedSymbols = extractExportedSymbols(filePath, content);
            const metadata: Record<string, unknown> | undefined = exportedSymbols.length
              ? { exportedSymbols }
              : undefined;

            seeds.push({
              uri,
              layer: "code",
              language: inferLanguage(filePath),
              content,
              metadata
            });

            const pathHints = await extractPathReferenceHints({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            hints.push(...pathHints);

            const importEvidences = await extractImportEvidences({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            evidences.push(...importEvidences);
          } catch {
            // ignore
          }
        });
      }

      const allTargets = [...implTargets, ...docTargets, ...scriptTargets];
      options.logger?.info(
        `[workspace-index] collected ${seeds.length} seed(s), ${hints.length} hint(s), and ${evidences.length} evidence link(s) from ${allTargets.join(",")}`
      );
      return { seeds, hints, evidences };
    }
  };
}

async function scanDirectory(root: string, onFile: (filePath: string) => Promise<void>): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(
    entries.map(async entry => {
      const resolved = path.join(root, entry.name);
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) return;
        await scanDirectory(resolved, onFile);
        return;
      }

      if (entry.isFile()) {
        await onFile(resolved);
      }
    })
  );
}

function shouldSkipDir(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower === ".git" ||
    lower === "node_modules" ||
    lower === "dist" ||
    lower === "out" ||
    lower === "build" ||
    lower === "coverage" ||
    lower === ".vscode" ||
    lower === ".idea" ||
    lower === ".history" ||
    lower === ".vscode-test"
  );
}

function shouldSkipPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    /\/\.git\//.test(normalized) ||
    /\/node_modules\//.test(normalized) ||
    /\/(dist|out|build|coverage)\//.test(normalized) ||
    /\/\.vscode(?:-test)?\//.test(normalized)
  );
}

function inferLanguage(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".ts":
    case ".tsx":
    case ".mts":
    case ".cts":
      return "typescript";
    case ".js":
    case ".jsx":
    case ".mjs":
      return "javascript";
    case ".cs":
      return "csharp";
    case ".c":
    case ".h":
      return "c";
    default:
      return undefined;
  }
}

function inferDocLanguage(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".md":
    case ".mdx":
    case ".markdown":
      return "markdown";
    case ".yml":
    case ".yaml":
      return "yaml";
    case ".txt":
      return "text";
    default:
      return undefined;
  }
}

const LINK_DIRECTIVE = /@link\s+([^\s]+)/g;

interface LinkHintContext {
  content: string;
  sourceFile: string;
  sourceUri: string;
  workspaceRoot: string;
}

async function extractLinkHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  const matches: RelationshipHint[] = [];
  let directive: RegExpExecArray | null;

  while ((directive = LINK_DIRECTIVE.exec(context.content)) !== null) {
    const rawReference = directive[1]?.trim();
    if (!rawReference || isExternalReference(rawReference)) {
      continue;
    }

    const targetPath = await resolveReferencePath(rawReference, context);
    if (!targetPath) {
      continue;
    }

    const targetUri = pathToFileURL(targetPath).toString();
    matches.push({
      sourceUri: targetUri,
      targetUri: context.sourceUri,
      kind: "documents",
      confidence: 0.9,
      rationale: `@link ${rawReference} directive`
    });
  }

  LINK_DIRECTIVE.lastIndex = 0;
  return matches;
}

async function extractPathReferenceHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  // Heuristic: string-literal paths like './templates/x', '../docs/y', '/absolute/z', or containing
  // key folders (docs, templates) or known extensions (.md, .hbs, .json).
  const PATH_LIKE = /["'`]([^"'`\n]*\/(?:[^"'`\n]+))["'`]/g;
  const candidates: RelationshipHint[] = [];
  let match: RegExpExecArray | null;

  while ((match = PATH_LIKE.exec(context.content)) !== null) {
    const ref = (match[1] ?? "").trim();
    if (!ref || isExternalReference(ref)) continue;
    // Throttle obvious non-paths: require slash and filter out common URL-like prefixes handled elsewhere
    if (!ref.includes("/")) continue;

    // Light relevance filter to cut false positives
    const lowered = ref.toLowerCase();
    const looksRelevant =
      lowered.startsWith("./") ||
      lowered.startsWith("../") ||
      lowered.startsWith("/") ||
      lowered.includes("docs/") ||
      lowered.includes("templates/") ||
      /\.(md|mdx|markdown|hbs|ejs|njk|liquid|json|yaml|yml|txt)$/i.test(lowered);
    if (!looksRelevant) continue;

    const targetPath = await resolveReferencePath(ref, context);
    if (!targetPath) continue;

    const targetUri = pathToFileURL(targetPath).toString();
    candidates.push({
      sourceUri: targetUri,
      targetUri: context.sourceUri,
      kind: "documents",
      confidence: 0.75,
      rationale: `string path reference ${ref}`
    });
  }

  PATH_LIKE.lastIndex = 0;

  const resolveHints = await extractPathFunctionHints(context);
  candidates.push(...resolveHints);

  return candidates;
}

function isExternalReference(reference: string): boolean {
  return /^(https?:)?\/\//i.test(reference);
}

async function resolveReferencePath(reference: string, context: LinkHintContext): Promise<string | undefined> {
  const normalized = reference.replace(/\\/g, "/");
  const candidates = new Set<string>();
  candidates.add(path.resolve(path.dirname(context.sourceFile), normalized));
  candidates.add(path.resolve(context.workspaceRoot, normalized.replace(/^\.\//, "")));

  if (!path.extname(normalized)) {
    const extensions = [".md", ".markdown", ".mdx", ".txt"];
    for (const ext of extensions) {
      candidates.add(path.resolve(path.dirname(context.sourceFile), `${normalized}${ext}`));
      candidates.add(path.resolve(context.workspaceRoot, `${normalized}${ext}`));
    }
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function isLikelyBinaryFile(filePath: string): Promise<boolean> {
  try {
    const fh = await fs.open(filePath, "r");
    const { size } = await fh.stat();
    const sampleSize = Math.min(size, 2048);
    const buf = Buffer.alloc(sampleSize);
    await fh.read(buf, 0, sampleSize, 0);
    await fh.close();

    // Contains NUL byte → binary
    if (buf.includes(0)) return true;

    // If too many non-printable characters, treat as binary.
    // We also allow UTF-8 multi-byte sequences (bytes 0x80-0xF4) so that files
    // containing Unicode characters (box drawings, emoji, etc.) aren't rejected.
    let nonPrintable = 0;
    for (let i = 0; i < sampleSize; i++) {
      const c = buf[i];
      // allow tab(9), lf(10), cr(13), common whitespace, printable ASCII 32-126,
      // and UTF-8 continuation/leading bytes (0x80-0xF4)
      const printable =
        c === 9 ||
        c === 10 ||
        c === 13 ||
        (c >= 32 && c <= 126) ||
        (c >= 0x80 && c <= 0xf4);
      if (!printable) nonPrintable++;
    }
    return nonPrintable / sampleSize > 0.2;
  } catch {
    return false;
  }
}

function looksLikeDocsPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes("/docs/") ||
    normalized.includes("/specs/") ||
    normalized.includes("/templates/") ||
    normalized.includes("/config/") ||
    normalized.includes("/.mdmd/") ||
    normalized.includes("/.live-documentation/") ||
    normalized.endsWith("readme.md")
  );
}

function inferDocumentLayer(metadataLayer: string | undefined, filePath: string): ArtifactSeed["layer"] {
  if (metadataLayer) {
    const normalized = metadataLayer.trim().toLowerCase();
    if (normalized === "1" || normalized === "layer 1" || normalized === "vision") {
      return "vision";
    }
    if (normalized === "2" || normalized === "layer 2" || normalized === "requirements") {
      return "requirements";
    }
    if (normalized === "3" || normalized === "layer 3" || normalized === "architecture") {
      return "architecture";
    }
    if (normalized === "4" || normalized === "layer 4" || normalized === "implementation") {
      return "implementation";
    }
  }

  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();
  if (normalizedPath.includes("/.mdmd/layer-1/")) {
    return "vision";
  }
  if (normalizedPath.includes("/.mdmd/layer-2/")) {
    return "requirements";
  }
  if (normalizedPath.includes("/.mdmd/layer-3/")) {
    return "architecture";
  }
  if (normalizedPath.includes("/.mdmd/layer-4/")) {
    return "implementation";
  }
  if (normalizedPath.includes("/.live-documentation/system/")) {
    return "architecture";
  }
  if (normalizedPath.includes("/.live-documentation/source/")) {
    return "implementation";
  }
  return "requirements";
}

async function extractPathFunctionHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  const hints: RelationshipHint[] = [];
  const FUNCTION_PATTERN = /\b(?:path\.)?(resolve|join)\s*\(/gi;
  let match: RegExpExecArray | null;

  while ((match = FUNCTION_PATTERN.exec(context.content)) !== null) {
    const openParenIndex = match.index + match[0].lastIndexOf("(");
    const closeParenIndex = findMatchingParen(context.content, openParenIndex);
    if (closeParenIndex === -1) {
      continue;
    }

    const argsSegment = context.content.slice(openParenIndex + 1, closeParenIndex);
    const literalMatches = Array.from(argsSegment.matchAll(/["'`]([^"'`]+)["'`]/g)).map(value => value[1].trim());
    if (!literalMatches.length) {
      continue;
    }

    const joined = literalMatches.join("/");
    const candidateRefs = new Set<string>();
    if (joined) {
      candidateRefs.add(joined);
    }

    if (literalMatches.length > 1) {
      candidateRefs.add(`${literalMatches[0]}/${literalMatches.slice(1).join("/")}`);
    }

    for (const ref of candidateRefs) {
      const targetPath = await resolveReferencePath(ref, context);
      if (!targetPath) {
        continue;
      }

      const targetUri = pathToFileURL(targetPath).toString();
      hints.push({
        sourceUri: targetUri,
        targetUri: context.sourceUri,
        kind: "documents",
        confidence: 0.7,
        rationale: `${match[1]} string reference ${ref}`
      });
    }
  }

  return hints;
}

function extractExportedSymbols(filePath: string, content: string): ExportedSymbolMetadata[] {
  const extension = path.extname(filePath).toLowerCase();
  if (!DEFAULT_CODE_EXTENSIONS.has(extension)) {
    return [];
  }

  if (extension === ".cs") {
    return [];
  }

  const scriptKind = inferScriptKind(extension);
  if (scriptKind === ts.ScriptKind.Unknown) {
    return [];
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);
  const collected = new Map<string, ExportedSymbolMetadata>();

  const record = (entry: ExportedSymbolMetadata): void => {
    if (!entry.name) {
      return;
    }
    collected.set(entry.name, entry);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      const name = resolveExportAssignmentName(statement);
      if (name) {
        record({
          name,
          kind: "default",
          isDefault: true
        });
      }
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const specifier of statement.exportClause.elements) {
          const name = specifier.name.text;
          record({
            name,
            kind: specifier.isTypeOnly ? "type" : "unknown",
            isTypeOnly: specifier.isTypeOnly
          });
        }
        continue;
      }

      if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) {
        const name = statement.exportClause.name.text;
        record({
          name,
          kind: "namespace"
        });
        continue;
      }

      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      record({
        name,
        kind: "function",
        isDefault: name === "default"
      });
      continue;
    }

    if (ts.isClassDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      record({
        name,
        kind: "class",
        isDefault: name === "default"
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "interface"
      });
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "type"
      });
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      const name = statement.name.text;
      record({
        name,
        kind: "enum"
      });
      continue;
    }

    if (ts.isModuleDeclaration(statement)) {
      const name = statement.name.getText(sourceFile);
      if (name) {
        record({
          name,
          kind: "namespace"
        });
      }
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const kind = inferVariableKind(statement);
      const names = collectBindingNames(statement.declarationList);
      for (const name of names) {
        record({
          name,
          kind
        });
      }
      continue;
    }

  }

  return Array.from(collected.values());
}

function resolveExportAssignmentName(statement: ts.ExportAssignment): string | undefined {
  if (ts.isIdentifier(statement.expression)) {
    return statement.expression.text;
  }

  if (ts.isPropertyAccessExpression(statement.expression)) {
    return statement.expression.getText();
  }

  return "default";
}

function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function hasDefaultModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

function inferVariableKind(statement: ts.VariableStatement): ExportedSymbolKind {
  const flags = ts.getCombinedNodeFlags(statement.declarationList);
  if (flags & ts.NodeFlags.Const) return "variable";
  if (flags & ts.NodeFlags.Let) return "variable";
  return "variable";
}

function collectBindingNames(list: ts.VariableDeclarationList): string[] {
  const names: string[] = [];
  for (const declaration of list.declarations) {
    collectNamesFromBinding(declaration.name, names);
  }
  return names;
}

function collectNamesFromBinding(binding: ts.BindingName, output: string[]): void {
  if (ts.isIdentifier(binding)) {
    output.push(binding.text);
    return;
  }

  if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) {
    for (const element of binding.elements) {
      if (ts.isBindingElement(element)) {
        collectNamesFromBinding(element.name, output);
      }
    }
  }
}

const MODULE_RESOLUTION_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs", ".json"];

interface ImportEvidenceContext {
  content: string;
  sourceFile: string;
  sourceUri: string;
  workspaceRoot: string;
}

async function extractImportEvidences(context: ImportEvidenceContext): Promise<LinkEvidence[]> {
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

interface ModuleReferenceRecord {
  specifier: string;
  context: "import" | "export" | "require" | "dynamic";
  isTypeOnly: boolean;
  localNames: string[];
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
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
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

function formatImportRationale(reference: ModuleReferenceRecord, usage: "runtime" | "type" = "runtime"): string {
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

async function resolveModuleReference(specifier: string, context: ImportEvidenceContext): Promise<string | undefined> {
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

function inferScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".mjs":
    case ".js":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

const SYMBOL_REFERENCE_PATTERN = /`([^`]+)`/g;

function extractMdmdDocumentDetails(content: string): MdmdDocumentDetails {
  const metadata = parseMdmdMetadata(content);
  const sectionSymbols = collectSectionSymbols(content, resolveSectionSymbolTargets(metadata.layer));

  return {
    layer: metadata.layer,
    identifier: metadata.identifiers[0],
    identifiers: metadata.identifiers,
    codePaths: metadata.codePaths,
    exports: metadata.exports,
    sectionSymbols
  };
}

async function createMdmdMetadataHints(
  details: MdmdDocumentDetails,
  context: LinkHintContext
): Promise<RelationshipHint[]> {
  if (!details.codePaths.length) {
    return [];
  }

  const hints: RelationshipHint[] = [];
  for (const reference of details.codePaths) {
    const resolved = await resolveReferencePath(reference, context);
    if (!resolved) {
      continue;
    }

    const targetUri = pathToFileURL(resolved).toString();
    hints.push({
      sourceUri: context.sourceUri,
      targetUri,
      kind: "documents",
      confidence: 0.9,
      rationale: "metadata code path"
    });
  }

  return hints;
}

function extractDocumentSymbolReferences(
  content: string,
  mdmdDetails?: MdmdDocumentDetails
): DocumentSymbolReferenceMetadata[] {
  const references = new Map<string, DocumentSymbolReferenceMetadata>();

  const register = (symbol: string, context: string): void => {
    const trimmed = symbol.trim();
    if (!trimmed || !looksLikeSymbolIdentifier(trimmed)) {
      return;
    }
    references.set(trimmed, {
      symbol: trimmed,
      context
    });
  };

  if (mdmdDetails) {
    for (const symbol of mdmdDetails.sectionSymbols) {
      register(symbol, "section-heading");
    }

    for (const symbol of mdmdDetails.exports) {
      register(symbol, "metadata-export");
    }

    for (const symbol of mdmdDetails.identifiers) {
      register(symbol, "metadata-identifier");
    }
  }

  let match: RegExpExecArray | null;
  while ((match = SYMBOL_REFERENCE_PATTERN.exec(content)) !== null) {
    const snippet = (match[1] ?? "").trim();
    if (!snippet) {
      continue;
    }

    if (!shouldRegisterInlineCode(snippet, mdmdDetails)) {
      continue;
    }

    register(snippet, "inline-code");
  }

  return Array.from(references.values());
}

function parseMdmdMetadata(content: string): {
  layer?: string;
  identifiers: string[];
  codePaths: string[];
  exports: string[];
} {
  const lines = content.split(/\r?\n/);
  const headingPattern = /^(#{1,6})\s+(.*)$/;
  const bulletPattern = /^\s*-\s*(.+)$/;
  const linkTargetPattern = /\(([^)]+)\)/g;
  const linkTextPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  let inMetadata = false;
  let metadataLevel = 0;
  const codePaths = new Set<string>();
  const exports = new Set<string>();
  let layer: string | undefined;
  const identifiers = new Set<string>();

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim().toLowerCase();

      if (!inMetadata && title === "metadata") {
        inMetadata = true;
        metadataLevel = level;
        continue;
      }

      if (inMetadata && level <= metadataLevel) {
        break;
      }

      continue;
    }

    if (!inMetadata) {
      continue;
    }

    const bulletMatch = line.match(bulletPattern);
    if (!bulletMatch) {
      continue;
    }

    const entry = bulletMatch[1].trim();
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const rawKey = entry.slice(0, separatorIndex).trim();
    const key = normalizeMetadataKey(rawKey);
    const value = entry.slice(separatorIndex + 1).trim();
    if (!value) {
      continue;
    }

    switch (key) {
      case "layer":
        layer = value;
        break;
      case "capability id":
      case "capability ids":
      case "requirement id":
      case "requirement ids":
      case "component id":
      case "component ids":
      case "implementation id":
      case "implementation ids": {
        const fragments = splitMetadataList(value, linkTextPattern);
        for (const fragment of fragments) {
          const token = extractSymbolToken(fragment);
          if (token && isPotentialMdmdSymbol(token)) {
            identifiers.add(token);
          }
        }
        break;
      }
      case "exports": {
        for (const fragment of splitMetadataList(value, linkTextPattern)) {
          const cleaned = fragment.replace(/`/g, "").trim();
          if (!cleaned) {
            continue;
          }
          const token = extractSymbolToken(cleaned);
          if (token) {
            exports.add(token);
          }
        }
        break;
      }
      case "code path":
      case "code paths":
      case "codepath": {
        let hasLinks = false;
        let linkMatch: RegExpExecArray | null;
        while ((linkMatch = linkTargetPattern.exec(value)) !== null) {
          const reference = (linkMatch[1] ?? "").trim();
          if (reference) {
            codePaths.add(reference);
            hasLinks = true;
          }
        }
        if (!hasLinks) {
          codePaths.add(value);
        }
        linkTargetPattern.lastIndex = 0;
        break;
      }
      default:
        break;
    }
  }

  return {
    layer,
    identifiers: Array.from(identifiers),
    codePaths: Array.from(codePaths),
    exports: Array.from(exports)
  };
}

function collectSectionSymbols(content: string, sectionTitles: string[]): string[] {
  const lines = content.split(/\r?\n/);
  const headingPattern = /^(#{1,6})\s+(.*)$/;
  const targets = new Set(sectionTitles.map((entry) => entry.trim().toLowerCase()));
  const collected = new Set<string>();

  let inSection = false;
  let sectionLevel = 0;

  for (const line of lines) {
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const normalized = title.toLowerCase();

      if (targets.has(normalized)) {
        inSection = true;
        sectionLevel = level;
        continue;
      }

      if (inSection && level <= sectionLevel) {
        inSection = false;
      }

      if (inSection && level > sectionLevel) {
        const candidate = extractSymbolToken(title);
        if (candidate && isPotentialMdmdSymbol(candidate)) {
          collected.add(candidate);
        }
      }

      continue;
    }
  }

  return Array.from(collected);
}

function resolveSectionSymbolTargets(layer?: string): string[] {
  const targets = new Set<string>(["Public Symbols", "Exported Symbols"]);

  switch (layer) {
    case "1":
      targets.add("Capabilities");
      break;
    case "2":
      targets.add("Requirements");
      targets.add("Linked Components");
      targets.add("Linked Implementations");
      break;
    case "3":
      targets.add("Components");
      targets.add("Linked Implementations");
      break;
    case "4":
      targets.add("Linked Components");
      break;
    default:
      targets.add("Capabilities");
      targets.add("Requirements");
      targets.add("Components");
      targets.add("Linked Components");
      targets.add("Linked Implementations");
      break;
  }

  return Array.from(targets);
}

function looksLikeSymbolIdentifier(candidate: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(candidate);
}

function isPotentialMdmdSymbol(candidate: string): boolean {
  if (!candidate) {
    return false;
  }

  if (looksLikeSymbolIdentifier(candidate)) {
    return true;
  }

  return /^[A-Z]{2,}[A-Z0-9_-]*-[A-Za-z0-9_-]+$/.test(candidate);
}

function extractSymbolToken(title: string): string {
  const sanitized = stripSymbolWrappers(stripSymbolAnchor(title));
  const separators = [" – ", " — ", " - ", " —", " –", ":", "—", "–"];
  for (const separator of separators) {
    const index = sanitized.indexOf(separator);
    if (index !== -1) {
      return stripSymbolWrappers(sanitized.slice(0, index));
    }
  }
  const trimmed = sanitized.trim();
  const whitespaceIndex = trimmed.indexOf(" ");
  if (whitespaceIndex !== -1) {
    return stripSymbolWrappers(trimmed.slice(0, whitespaceIndex));
  }
  return stripSymbolWrappers(trimmed);
}

function stripSymbolAnchor(value: string): string {
  return value.replace(/\s*\{#[^}]+\}\s*$/, "").trim();
}

function stripSymbolWrappers(value: string): string {
  let candidate = value.trim();
  if (!candidate) {
    return candidate;
  }

  const wrappers: Array<[string, string]> = [
    ["`", "`"],
    ["**", "**"],
    ["_", "_"],
    ["*", "*"]
  ];

  let mutated = true;
  while (mutated && candidate.length > 0) {
    mutated = false;
    for (const [start, end] of wrappers) {
      if (candidate.startsWith(start) && candidate.endsWith(end) && candidate.length >= start.length + end.length) {
        candidate = candidate.slice(start.length, candidate.length - end.length).trim();
        mutated = true;
      }
    }
  }

  return candidate;
}

function normalizeMetadataKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitMetadataList(value: string, linkPattern: RegExp): string[] {
  let normalized = value;
  linkPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(value)) !== null) {
    const replacement = (match[1] ?? "").trim();
    normalized = normalized.replace(match[0], replacement);
  }
  linkPattern.lastIndex = 0;
  normalized = normalized.replace(/`/g, "");

  return normalized
    .split(/[,;]/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0);
}

function shouldRegisterInlineCode(symbol: string, details?: MdmdDocumentDetails): boolean {
  if (!symbol) {
    return false;
  }

  if (details) {
    if (
      details.exports.includes(symbol) ||
      details.sectionSymbols.includes(symbol) ||
      details.identifiers.includes(symbol)
    ) {
      return true;
    }
  }

  if (symbol.includes("-") && isPotentialMdmdSymbol(symbol)) {
    return true;
  }

  return false;
}

function findMatchingParen(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    const char = source[i];
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}
