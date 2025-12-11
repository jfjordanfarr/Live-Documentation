import { minimatch } from "minimatch";
import fs from "node:fs";
import path from "node:path";

export type CSharpOracleEdgeRelation = "imports" | "uses";

export type CSharpOracleProvenance = "using-directive" | "type-usage" | "manual-override";

export interface CSharpOracleEdge {
  source: string;
  target: string;
  relation: CSharpOracleEdgeRelation;
  provenance: CSharpOracleProvenance;
}

export interface CSharpOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface CSharpFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
}

export interface CSharpOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface CSharpOracleOverrideConfig {
  manualEdges?: CSharpOracleOverrideEntry[];
}

export interface CSharpOracleSegmentPartition {
  autoEdges: CSharpOracleEdge[];
  matchedManualEdges: CSharpOracleEdge[];
  manualEntries: CSharpOracleOverrideEntry[];
  missingManualEntries: CSharpOracleOverrideEntry[];
}

export interface CSharpOracleMergeResult {
  autoEdges: CSharpOracleEdge[];
  autoRecords: CSharpOracleEdgeRecord[];
  manualRecords: CSharpOracleEdgeRecord[];
  matchedManualRecords: CSharpOracleEdgeRecord[];
  mergedRecords: CSharpOracleEdgeRecord[];
  missingManualEntries: CSharpOracleOverrideEntry[];
}

interface CSharpFileMetadata {
  relativePath: string;
  namespaceName: string | null;
  definedTypes: CSharpTypeDefinition[];
  importedNamespaces: string[];
  content: string;
}

interface CSharpTypeDefinition {
  simpleName: string;
  fullName: string;
  namespaceName: string | null;
  relativePath: string;
}

interface CSharpTypeIndex {
  bySimpleName: Map<string, CSharpTypeDefinition[]>;
  byFullName: Map<string, CSharpTypeDefinition>;
}

const SOURCE_EXTENSION = ".cs";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "bin",
  "obj",
  "out",
  "packages"
]);

const BUILT_IN_IDENTIFIERS = new Set([
  "Task",
  "ValueTask",
  "String",
  "Int32",
  "Boolean",
  "Double",
  "Decimal",
  "DateTime",
  "DateTimeOffset",
  "TimeSpan",
  "Guid",
  "List",
  "Dictionary",
  "IDictionary",
  "IEnumerable",
  "IList",
  "HashSet",
  "Nullable",
  "CultureInfo"
]);

const RELATION_PRECEDENCE: Record<CSharpOracleEdgeRelation, number> = {
  uses: 1,
  imports: 0
};

export function generateCSharpFixtureGraph(options: CSharpFixtureOracleOptions): CSharpOracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const metadataByPath = new Map<string, CSharpFileMetadata>();
  const typeIndex: CSharpTypeIndex = {
    bySimpleName: new Map(),
    byFullName: new Map()
  };

  for (const [absolutePath, content] of fileMap) {
    const metadata = extractFileMetadata(absolutePath, content, fixtureRoot);
    metadataByPath.set(metadata.relativePath, metadata);

    for (const definition of metadata.definedTypes) {
      const simpleKey = definition.simpleName.toLowerCase();
      const group = typeIndex.bySimpleName.get(simpleKey) ?? [];
      group.push(definition);
      typeIndex.bySimpleName.set(simpleKey, group);
      typeIndex.byFullName.set(definition.fullName.toLowerCase(), definition);
    }
  }

  const edges = new Map<string, CSharpOracleEdge>();

  for (const metadata of metadataByPath.values()) {
    collectTypeUsageEdges({ metadata, typeIndex, edges });
  }

  return Array.from(edges.values()).sort(compareEdges);
}

export function serializeCSharpOracleEdges(edges: CSharpOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionCSharpOracleSegments(
  edges: CSharpOracleEdge[],
  overrides?: CSharpOracleOverrideConfig
): CSharpOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, CSharpOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: CSharpOracleEdge[] = [];
  const matchedManualEdges: CSharpOracleEdge[] = [];
  const encountered = new Set<string>();

  for (const edge of edges) {
    const key = edgeKey(edge.source, edge.target, edge.relation);
    if (overrideMap.has(key)) {
      matchedManualEdges.push(edge);
      encountered.add(key);
    } else {
      autoEdges.push(edge);
    }
  }

  const missingManualEntries = overrideEntries.filter(entry =>
    !encountered.has(edgeKey(entry.source, entry.target, entry.relation))
  );

  return {
    autoEdges,
    matchedManualEdges,
    manualEntries: overrideEntries,
    missingManualEntries
  } satisfies CSharpOracleSegmentPartition;
}

export function mergeCSharpOracleEdges(
  edges: CSharpOracleEdge[],
  overrides?: CSharpOracleOverrideConfig
): CSharpOracleMergeResult {
  const partition = partitionCSharpOracleSegments(edges, overrides);
  const autoRecords = partition.autoEdges.map(toRecordFromEdge).sort(compareRecords);
  const manualRecords = (overrides?.manualEdges ?? []).map(toRecordFromOverride).sort(compareRecords);
  const matchedManualRecords = partition.matchedManualEdges.map(toRecordFromEdge).sort(compareRecords);

  const merged = new Map<string, CSharpOracleEdgeRecord>();
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
  } satisfies CSharpOracleMergeResult;
}

function collectSourceFiles(
  root: string,
  include?: string[],
  exclude?: string[]
): Map<string, string> {
  const collected = new Map<string, string>();

  const walk = (current: string): void => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (DEFAULT_IGNORE_DIRS.has(entry.name)) {
          continue;
        }
        walk(path.join(current, entry.name));
        continue;
      }

      if (!entry.name.endsWith(SOURCE_EXTENSION)) {
        continue;
      }

      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(root, absolutePath).replace(/\\/g, "/");

      // Check exclude patterns first
      if (exclude && exclude.length > 0) {
        const excluded = exclude.some(pattern => minimatch(relativePath, pattern, { dot: true }));
        if (excluded) {
          continue;
        }
      }

      // Check include patterns - if specified, file must match at least one
      if (include && include.length > 0) {
        const included = include.some(pattern => minimatch(relativePath, pattern, { dot: true }));
        if (!included) {
          continue;
        }
      }

      const content = fs.readFileSync(absolutePath, "utf8");
      collected.set(absolutePath, content);
    }
  };

  walk(root);
  return collected;
}

function extractFileMetadata(
  absolutePath: string,
  content: string,
  fixtureRoot: string
): CSharpFileMetadata {
  const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
  const namespaceName = extractNamespace(content);
  const definedTypes = extractTypeDefinitions({ content, namespaceName, relativePath });
  const importedNamespaces: string[] = [];

  const usingPattern = /^\s*using\s+(static\s+)?([^=;]+);/gm;
  let match: RegExpExecArray | null;

  while ((match = usingPattern.exec(content)) !== null) {
    const directive = match[2]?.trim();
    if (!directive) {
      continue;
    }

    if (directive.includes("=")) {
      // Alias imports are rare in fixtures; skip until dedicated support is required.
      continue;
    }

    if (directive.startsWith("System.")) {
      continue;
    }

    const normalized = directive.replace(/\s+/g, "");
    importedNamespaces.push(normalized);

    const segments = normalized.split(".");
    if (segments.length > 1) {
      importedNamespaces.push(segments.slice(0, -1).join("."));
    }
  }

  usingPattern.lastIndex = 0;

  return {
    relativePath,
    namespaceName,
    definedTypes,
    importedNamespaces,
    content
  } satisfies CSharpFileMetadata;
}

function extractNamespace(content: string): string | null {
  const match = content.match(/\bnamespace\s+([A-Za-z_][A-Za-z0-9_.]*)\s*(?:;|\{)/);
  return match ? match[1].trim() : null;
}

function extractTypeDefinitions(input: {
  content: string;
  namespaceName: string | null;
  relativePath: string;
}): CSharpTypeDefinition[] {
  const { content, namespaceName, relativePath } = input;
  const pattern = /(partial\s+)?(class|struct|interface|record)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  const definitions: CSharpTypeDefinition[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const simpleName = match[3];
    if (!simpleName) {
      continue;
    }

    const fullName = namespaceName ? `${namespaceName}.${simpleName}` : simpleName;
    definitions.push({
      simpleName,
      fullName,
      namespaceName,
      relativePath
    });
  }

  pattern.lastIndex = 0;
  return definitions;
}

function collectTypeUsageEdges(input: {
  metadata: CSharpFileMetadata;
  typeIndex: CSharpTypeIndex;
  edges: Map<string, CSharpOracleEdge>;
}): void {
  const { metadata, typeIndex, edges } = input;
  const definedNames = new Set(metadata.definedTypes.map(definition => definition.simpleName));
  const candidatePattern = /\b([A-Z][A-Za-z0-9_]*)\b/g;
  const usingNamespaces = new Set(metadata.importedNamespaces.map(namespace => namespace.toLowerCase()));
  const namespaceName = metadata.namespaceName?.toLowerCase() ?? null;
  let match: RegExpExecArray | null;

  while ((match = candidatePattern.exec(metadata.content)) !== null) {
    const symbol = match[1];
    if (!symbol || definedNames.has(symbol) || BUILT_IN_IDENTIFIERS.has(symbol)) {
      continue;
    }

    const candidates = typeIndex.bySimpleName.get(symbol.toLowerCase());
    if (!candidates || candidates.length === 0) {
      continue;
    }

    const target = disambiguateType({
      candidates,
      namespaceName,
      usingNamespaces
    });

    if (!target || target.relativePath === metadata.relativePath) {
      continue;
    }

    const relation = classifyRelation(symbol, metadata.content);
    const key = `${metadata.relativePath}::${target.relativePath}`;
    const existing = edges.get(key);
    if (!existing || RELATION_PRECEDENCE[relation] > RELATION_PRECEDENCE[existing.relation]) {
      edges.set(key, {
        source: metadata.relativePath,
        target: target.relativePath,
        relation,
        provenance: "type-usage"
      });
    }
  }

  candidatePattern.lastIndex = 0;
}

function disambiguateType(input: {
  candidates: CSharpTypeDefinition[];
  namespaceName: string | null;
  usingNamespaces: Set<string>;
}): CSharpTypeDefinition | undefined {
  const { candidates, namespaceName, usingNamespaces } = input;
  if (candidates.length === 1) {
    return candidates[0];
  }

  const sameNamespace = namespaceName
    ? candidates.filter(candidate => candidate.namespaceName?.toLowerCase() === namespaceName)
    : [];
  if (sameNamespace.length === 1) {
    return sameNamespace[0];
  }

  const importedMatch = candidates.filter(candidate =>
    candidate.namespaceName && usingNamespaces.has(candidate.namespaceName.toLowerCase())
  );
  if (importedMatch.length === 1) {
    return importedMatch[0];
  }

  return undefined;
}

function classifyRelation(symbol: string, content: string): CSharpOracleEdgeRelation {
  const escaped = escapeRegExp(symbol);
  const constructorPattern = new RegExp(`new\\s+${escaped}\\b`);
  const declarationPattern = new RegExp(`\\b${escaped}\\s+[A-Za-z_][A-Za-z0-9_]*\\s*(=|;|,|\\))`);
  const genericPattern = new RegExp(`<\\s*${escaped}\\b`);
  const staticPattern = new RegExp(`\\b${escaped}\\s*\\.`);

  if (
    constructorPattern.test(content) ||
    declarationPattern.test(content) ||
    genericPattern.test(content) ||
    staticPattern.test(content)
  ) {
    return "uses";
  }

  return "imports";
}

function toFixtureRelative(absolutePath: string, fixtureRoot: string): string {
  return path.relative(fixtureRoot, absolutePath).replace(/\\/g, "/");
}

function compareEdges(left: CSharpOracleEdge, right: CSharpOracleEdge): number {
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
}

function toRecordFromEdge(edge: CSharpOracleEdge): CSharpOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  } satisfies CSharpOracleEdgeRecord;
}

function toRecordFromOverride(entry: CSharpOracleOverrideEntry): CSharpOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  } satisfies CSharpOracleEdgeRecord;
}

function compareRecords(left: CSharpOracleEdgeRecord, right: CSharpOracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}::${target}::${relation}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
