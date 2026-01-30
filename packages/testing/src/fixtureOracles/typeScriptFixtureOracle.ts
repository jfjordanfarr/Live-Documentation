import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import {
  collectIdentifierUsage,
  extractLocalImportNames,
  hasRuntimeUsage,
  hasTypeUsage,
  isLikelyTypeDefinitionSpecifier
} from "@live-documentation/shared/language/typeScriptAstUtils";

export type OracleEdgeRelation = "imports" | "uses";

export type OracleEdgeProvenance = "runtime-import" | "type-import";

export interface OracleEdge {
  source: string;
  target: string;
  relation: OracleEdgeRelation;
  provenance: OracleEdgeProvenance;
}

export interface OracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface TypeScriptFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  compilerOptions?: ts.CompilerOptions;
}

export interface OracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface OracleOverrideConfig {
  manualEdges?: OracleOverrideEntry[];
}

export interface OracleSegmentPartition {
  autoEdges: OracleEdge[];
  matchedManualEdges: OracleEdge[];
  manualEntries: OracleOverrideEntry[];
  missingManualEntries: OracleOverrideEntry[];
}

export interface OracleMergeResult {
  autoEdges: OracleEdge[];
  autoRecords: OracleEdgeRecord[];
  manualRecords: OracleEdgeRecord[];
  matchedManualRecords: OracleEdgeRecord[];
  mergedRecords: OracleEdgeRecord[];
  missingManualEntries: OracleOverrideEntry[];
}

const DEFAULT_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);
const DECLARATION_EXTENSIONS = new Set([".d.ts", ".d.mts", ".d.cts"]);
const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2020,
  skipLibCheck: true,
  allowJs: true,
  esModuleInterop: true,
  resolveJsonModule: true,
  jsx: ts.JsxEmit.Preserve
};

export function generateTypeScriptFixtureGraph(
  options: TypeScriptFixtureOracleOptions
): OracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const compilerOptions = {
    ...DEFAULT_COMPILER_OPTIONS,
    baseUrl: fixtureRoot,
    rootDir: fixtureRoot,
    ...(options.compilerOptions ?? {})
  } satisfies ts.CompilerOptions;

  const filePaths = collectSourceFiles(fixtureRoot, options.include ?? []);
  const moduleHost = createModuleResolutionHost();
  const edges = new Map<string, OracleEdge>();

  for (const absolutePath of filePaths) {
    const scriptKind = inferScriptKind(absolutePath);
    const content = fs.readFileSync(absolutePath, "utf8");
    const sourceFile = ts.createSourceFile(
      absolutePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind
    );

    const identifierUsage = collectIdentifierUsage(sourceFile);

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        const localNames = extractLocalImportNames(node.importClause);
        const isTypeOnly = Boolean(node.importClause?.isTypeOnly);
        handleModuleReference({
          sourcePath: absolutePath,
          specifier,
          localNames,
          identifierUsage,
          classifier: classifyImportUsage({
            identifierUsage,
            localNames,
            isTypeOnly,
            specifier
          }),
          compilerOptions,
          fixtureRoot,
          edges,
          moduleHost
        });
      } else if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        node.moduleReference.expression &&
        ts.isStringLiteral(node.moduleReference.expression)
      ) {
        const specifier = node.moduleReference.expression.text;
        handleModuleReference({
          sourcePath: absolutePath,
          specifier,
          localNames: [node.name.text],
          identifierUsage,
          classifier: classifyImportUsage({
            identifierUsage,
            localNames: [node.name.text],
            isTypeOnly: Boolean(node.isTypeOnly),
            specifier
          }),
          compilerOptions,
          fixtureRoot,
          edges,
          moduleHost
        });
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const specifier = node.moduleSpecifier.text;
        const localNames = extractExportLocalNames(node);
        const isTypeOnly = node.isTypeOnly || localNames.every(entry => entry.isTypeOnly);
        handleModuleReference({
          sourcePath: absolutePath,
          specifier,
          localNames: localNames.map(entry => entry.name),
          identifierUsage,
          classifier: classifyExportUsage({ isTypeOnly }),
          compilerOptions,
          fixtureRoot,
          edges,
          moduleHost
        });
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
  }

  return Array.from(edges.values()).sort((left, right) => {
    if (left.source !== right.source) {
      return left.source.localeCompare(right.source);
    }
    if (left.target !== right.target) {
      return left.target.localeCompare(right.target);
    }
    if (left.relation !== right.relation) {
      return left.relation.localeCompare(right.relation);
    }
    return left.provenance.localeCompare(right.provenance);
  });
}

export function serializeOracleEdges(edges: OracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionOracleSegments(
  edges: OracleEdge[],
  overrides?: OracleOverrideConfig
): OracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideByKey = new Map<string, OracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideByKey.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: OracleEdge[] = [];
  const matchedManualEdges: OracleEdge[] = [];
  const encounteredOverrideKeys = new Set<string>();

  for (const edge of edges) {
    const key = edgeKey(edge.source, edge.target, edge.relation);
    if (overrideByKey.has(key)) {
      matchedManualEdges.push(edge);
      encounteredOverrideKeys.add(key);
    } else {
      autoEdges.push(edge);
    }
  }

  const missingManualEntries = overrideEntries.filter(entry =>
    !encounteredOverrideKeys.has(edgeKey(entry.source, entry.target, entry.relation))
  );

  return {
    autoEdges,
    matchedManualEdges,
    manualEntries: overrideEntries,
    missingManualEntries
  };
}

export function mergeOracleEdges(
  edges: OracleEdge[],
  overrides?: OracleOverrideConfig
): OracleMergeResult {
  const partition = partitionOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords((overrides?.manualEdges ?? []).map(toRecordFromOverride));
  const matchedManualRecords = collectRecords(partition.matchedManualEdges.map(toRecordFromEdge));

  const merged = new Map<string, OracleEdgeRecord>();

  for (const record of autoRecords) {
    merged.set(edgeKey(record.source, record.target, record.relation), record);
  }

  for (const record of manualRecords) {
    merged.set(edgeKey(record.source, record.target, record.relation), record);
  }

  const mergedRecords = Array.from(merged.values()).sort(compareRecords);

  return {
    autoEdges: edges,
    autoRecords,
    manualRecords,
    matchedManualRecords,
    mergedRecords,
    missingManualEntries: partition.missingManualEntries
  };
}

interface ModuleReferenceContext {
  sourcePath: string;
  specifier: string;
  localNames: string[];
  identifierUsage: Map<string, { value: boolean; type: boolean }>;
  classifier: ImportExportClassification;
  compilerOptions: ts.CompilerOptions;
  fixtureRoot: string;
  edges: Map<string, OracleEdge>;
  moduleHost: ts.ModuleResolutionHost;
}

interface ImportExportClassification {
  relation: OracleEdgeRelation;
  provenance: OracleEdgeProvenance;
}

function classifyImportUsage(input: {
  identifierUsage: Map<string, { value: boolean; type: boolean }>;
  localNames: string[];
  isTypeOnly: boolean;
  specifier: string;
}): ImportExportClassification {
  const { identifierUsage, localNames, isTypeOnly, specifier } = input;
  const hasNames = localNames.length > 0;
  const runtimeUsage = hasNames && hasRuntimeUsage(identifierUsage, localNames);
  const typeUsage =
    isTypeOnly ||
    hasTypeUsage(identifierUsage, localNames) ||
    isLikelyTypeDefinitionSpecifier(specifier);

  if (!hasNames) {
    return {
      relation: "imports",
      provenance: "runtime-import"
    };
  }

  if (runtimeUsage) {
    return {
      relation: "imports",
      provenance: "runtime-import"
    };
  }

  if (typeUsage) {
    return {
      relation: "imports",
      provenance: "type-import"
    };
  }

  return {
    relation: "imports",
    provenance: "type-import"
  };
}

function classifyExportUsage(input: { isTypeOnly: boolean }): ImportExportClassification {
  if (input.isTypeOnly) {
    return {
      relation: "imports",
      provenance: "type-import"
    };
  }
  return {
    relation: "imports",
    provenance: "runtime-import"
  };
}

function handleModuleReference(context: ModuleReferenceContext): void {
  const {
    sourcePath,
    specifier,
    compilerOptions,
    fixtureRoot,
    edges,
    classifier,
    moduleHost
  } = context;

  const resolution = resolveModule(specifier, sourcePath, compilerOptions, moduleHost);
  if (!resolution) {
    return;
  }

  if (!isWithinRoot(resolution, fixtureRoot)) {
    return;
  }

  const relation = classifier.relation;
  const provenance = classifier.provenance;
  const sourceRelative = toFixtureRelative(sourcePath, fixtureRoot);
  const targetRelative = toFixtureRelative(resolution, fixtureRoot);

  const key = edgeKey(sourceRelative, targetRelative, relation);
  if (edges.has(key)) {
    return;
  }

  // If the resolution leads to a declaration file, force type-only provenance.
  const isDeclaration = DECLARATION_EXTENSIONS.has(path.extname(resolution));
  const effectiveRelation = isDeclaration ? "imports" : relation;
  const effectiveProvenance = isDeclaration ? "type-import" : provenance;

  edges.set(key, {
    source: sourceRelative,
    target: targetRelative,
    relation: effectiveRelation,
    provenance: effectiveProvenance
  });
}

function resolveModule(
  specifier: string,
  sourcePath: string,
  compilerOptions: ts.CompilerOptions,
  host: ts.ModuleResolutionHost
): string | null {
  const normalizedSpecifier = specifier.trim();
  if (!normalizedSpecifier) {
    return null;
  }

  const resolution = ts.resolveModuleName(normalizedSpecifier, sourcePath, compilerOptions, host);
  const resolvedFileName = resolution.resolvedModule?.resolvedFileName;
  if (!resolvedFileName) {
    return null;
  }

  return path.normalize(resolvedFileName);
}

function collectSourceFiles(root: string, include: string[]): string[] {
  const files: string[] = [];
  const includeSet = new Set(include.map(pattern => path.resolve(root, pattern)));

  const visit = (current: string): void => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const resolved = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(resolved);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name);
      if (!DEFAULT_EXTENSIONS.has(extension)) {
        continue;
      }

      if (includeSet.size > 0 && !includeSet.has(resolved)) {
        continue;
      }

      files.push(path.normalize(resolved));
    }
  };

  visit(root);
  return files;
}

function inferScriptKind(filePath: string): ts.ScriptKind {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".mts":
      return ts.ScriptKind.TS;
    case ".cts":
      return ts.ScriptKind.TS;
    default:
      return ts.ScriptKind.TS;
  }
}

function toFixtureRelative(candidate: string, root: string): string {
  const relative = path.relative(root, candidate);
  return relative.replace(/\\/g, "/");
}

function createModuleResolutionHost(): ts.ModuleResolutionHost {
  return {
    fileExists: fileName => {
      try {
        return fs.existsSync(fileName);
      } catch {
        return false;
      }
    },
    readFile: fileName => {
      try {
        return fs.readFileSync(fileName, "utf8");
      } catch {
        return undefined;
      }
    },
    directoryExists: directoryName => {
      try {
        return fs.statSync(directoryName).isDirectory();
      } catch {
        return false;
      }
    },
    getDirectories: directoryName => {
      try {
        return fs
          .readdirSync(directoryName, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name);
      } catch {
        return [];
      }
    },
    realpath: fileName => {
      try {
        return fs.realpathSync(fileName);
      } catch {
        return fileName;
      }
    }
  } satisfies ts.ModuleResolutionHost;
}

function extractExportLocalNames(node: ts.ExportDeclaration): Array<{ name: string; isTypeOnly: boolean }> {
  if (!node.exportClause || !ts.isNamedExports(node.exportClause)) {
    return [];
  }

  return node.exportClause.elements.map(element => ({
    name: element.name.text,
    isTypeOnly: element.isTypeOnly
  }));
}

function isWithinRoot(candidate: string, root: string): boolean {
  const normalizedRoot = path.resolve(root);
  const normalizedCandidate = path.resolve(candidate);
  return normalizedCandidate.startsWith(normalizedRoot);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}→${target}#${relation}`;
}

function toRecordFromEdge(edge: OracleEdge): OracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  };
}

function toRecordFromOverride(entry: OracleOverrideEntry): OracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  };
}

function normalizeRecord(record: OracleEdgeRecord): OracleEdgeRecord {
  return {
    source: normalizePath(record.source),
    target: normalizePath(record.target),
    relation: record.relation
  };
}

function normalizePath(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}

function compareRecords(left: OracleEdgeRecord, right: OracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function collectRecords(records: OracleEdgeRecord[]): OracleEdgeRecord[] {
  const map = new Map<string, OracleEdgeRecord>();
  for (const record of records) {
    const normalized = normalizeRecord(record);
    map.set(edgeKey(normalized.source, normalized.target, normalized.relation), normalized);
  }
  return Array.from(map.values()).sort(compareRecords);
}
