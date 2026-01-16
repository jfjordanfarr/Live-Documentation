import fs from "node:fs";
import path from "node:path";

export type RustOracleEdgeRelation = "uses" | "imports";

export type RustOracleProvenance = "module-declaration" | "use-statement" | "manual-override";

export interface RustOracleEdge {
  source: string;
  target: string;
  relation: RustOracleEdgeRelation;
  provenance: RustOracleProvenance;
}

export interface RustOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface RustFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
}

export interface RustOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface RustOracleOverrideConfig {
  manualEdges?: RustOracleOverrideEntry[];
}

export interface RustOracleSegmentPartition {
  autoEdges: RustOracleEdge[];
  matchedManualEdges: RustOracleEdge[];
  manualEntries: RustOracleOverrideEntry[];
  missingManualEntries: RustOracleOverrideEntry[];
}

export interface RustOracleMergeResult {
  autoEdges: RustOracleEdge[];
  autoRecords: RustOracleEdgeRecord[];
  manualRecords: RustOracleEdgeRecord[];
  matchedManualRecords: RustOracleEdgeRecord[];
  mergedRecords: RustOracleEdgeRecord[];
  missingManualEntries: RustOracleOverrideEntry[];
}

const SOURCE_EXTENSION = ".rs";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "target",
  "dist",
  "build"
]);

const RELATION_PRECEDENCE: Record<RustOracleEdgeRelation, number> = {
  uses: 0,
  imports: 1
};

export function generateRustFixtureGraph(options: RustFixtureOracleOptions): RustOracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const moduleIndex = buildModuleIndex(fileMap, fixtureRoot);
  const edges = new Map<string, RustOracleEdge>();

  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    collectUseEdges({
      content,
      sourceRelativePath: relativePath,
      moduleIndex,
      edges
    });
    collectModuleReferences({
      content,
      sourceRelativePath: relativePath,
      moduleIndex,
      edges
    });
  }

  return Array.from(edges.values()).sort(compareEdges);
}

export function serializeRustOracleEdges(edges: RustOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionRustOracleSegments(
  edges: RustOracleEdge[],
  overrides?: RustOracleOverrideConfig
): RustOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, RustOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: RustOracleEdge[] = [];
  const matchedManualEdges: RustOracleEdge[] = [];
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
  };
}

export function mergeRustOracleEdges(
  edges: RustOracleEdge[],
  overrides?: RustOracleOverrideConfig
): RustOracleMergeResult {
  const partition = partitionRustOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromEdge)
  );

  const merged = new Map<string, RustOracleEdgeRecord>();
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

function collectSourceFiles(
  root: string,
  include?: string[],
  exclude?: string[]
): Map<string, string> {
  const collected = new Map<string, string>();
  const includePatterns = include?.map(pattern => path.resolve(root, pattern));
  const excludePatterns = exclude?.map(pattern => path.resolve(root, pattern)) ?? [];

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
      if (excludePatterns.some(pattern => absolutePath.startsWith(pattern))) {
        continue;
      }
      if (includePatterns && includePatterns.length > 0) {
        if (!includePatterns.some(pattern => absolutePath.startsWith(pattern))) {
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

function buildModuleIndex(
  fileMap: Map<string, string>,
  fixtureRoot: string
): Map<string, string> {
  const index = new Map<string, string>();
  for (const absolutePath of fileMap.keys()) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    const moduleName = inferModuleName(relativePath);
    if (moduleName) {
      index.set(moduleName, relativePath);
    }
  }
  return index;
}

function collectUseEdges(input: {
  content: string;
  sourceRelativePath: string;
  moduleIndex: Map<string, string>;
  edges: Map<string, RustOracleEdge>;
}): void {
  const { content, sourceRelativePath, moduleIndex, edges } = input;
  const sanitized = stripDocComments(content);
  // Match use statements at any indentation level (handles #[cfg(test)] mod tests { use ... })
  const pattern = /^\s*use\s+([^;]+);/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sanitized)) !== null) {
    const statement = match[0];
    const parsed = parseUseStatement(statement);
    if (!parsed) {
      continue;
    }
    const { moduleName, symbols } = parsed;
    const target = moduleIndex.get(moduleName);
    if (!target || target === sourceRelativePath) {
      continue;
    }
    const relation = classifyUseRelation(symbols, moduleName, moduleIndex);
    addEdge({
      edges,
      source: sourceRelativePath,
      target,
      relation,
      provenance: "use-statement"
    });
  }
}

function parseUseStatement(statement: string): {
  moduleName: string;
  symbols: string[];
} | null {
  // Strip leading whitespace then the 'use' keyword
  const trimmed = statement.trim().replace(/^use\s+/, "").replace(/;$/, "").trim();
  if (!trimmed) {
    return null;
  }

  const withoutAlias = trimmed.split(/\s+as\s+/)[0];
  const braceIndex = withoutAlias.indexOf("{");
  if (braceIndex !== -1) {
    const prefix = withoutAlias.slice(0, braceIndex).replace(/::\s*$/, "");
    const body = withoutAlias.slice(braceIndex + 1, withoutAlias.lastIndexOf("}"));
    const moduleName = resolveModuleName(prefix);
    if (!moduleName) {
      return null;
    }
    const symbols = body
      .split(",")
      .map(part => part.trim())
      .filter(Boolean)
      .map(entry => entry.replace(/::.*$/, ""));
    return { moduleName, symbols };
  }

  const segments = withoutAlias.split("::").map(part => part.trim()).filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const cleanedSegments = dropContextualSegments(segments);
  if (cleanedSegments.length === 0) {
    return null;
  }

  if (cleanedSegments.length === 1) {
    return { moduleName: cleanedSegments[0], symbols: [] };
  }

  const moduleName = cleanedSegments[cleanedSegments.length - 2];
  const symbol = cleanedSegments[cleanedSegments.length - 1];
  return { moduleName, symbols: [symbol] };
}

function classifyUseRelation(
  symbols: string[],
  moduleName: string,
  moduleIndex: Map<string, string>
): RustOracleEdgeRelation {
  if (symbols.length === 0) {
    return moduleIndex.has(moduleName) ? "imports" : "uses";
  }
  if (symbols.every(symbol => /^\p{Lu}/u.test(symbol))) {
    return "uses";
  }
  if (!moduleIndex.has(moduleName)) {
    return "imports";
  }
  return symbols.some(symbol => symbol.includes("::")) ? "uses" : "imports";
}

function collectModuleReferences(input: {
  content: string;
  sourceRelativePath: string;
  moduleIndex: Map<string, string>;
  edges: Map<string, RustOracleEdge>;
}): void {
  const { content, sourceRelativePath, moduleIndex, edges } = input;
  const sanitized = stripDocComments(content);
  const pattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)::[a-zA-Z_][a-zA-Z0-9_]*/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sanitized)) !== null) {
    const moduleName = match[1];
    const target = moduleIndex.get(moduleName);
    if (!target || target === sourceRelativePath) {
      continue;
    }
    addEdge({
      edges,
      source: sourceRelativePath,
      target,
      relation: "imports",
      provenance: "module-declaration"
    });
  }
}

function dropContextualSegments(segments: string[]): string[] {
  const [first, ...rest] = segments;
  if (first === "crate" || first === "self" || first === "super") {
    return rest.length > 0 ? rest : [first];
  }
  return segments;
}

function resolveModuleName(prefix: string): string | null {
  const segments = prefix.split("::").map(part => part.trim()).filter(Boolean);
  if (segments.length === 0) {
    return null;
  }
  const cleaned = dropContextualSegments(segments);
  if (cleaned.length === 0) {
    return null;
  }
  return cleaned[cleaned.length - 1];
}

function addEdge(input: {
  edges: Map<string, RustOracleEdge>;
  source: string;
  target: string;
  relation: RustOracleEdgeRelation;
  provenance: RustOracleProvenance;
}): void {
  const { edges, source, target, relation, provenance } = input;
  const key = `${source}::${target}`;
  const existing = edges.get(key);
  if (!existing || RELATION_PRECEDENCE[relation] > RELATION_PRECEDENCE[existing.relation]) {
    edges.set(key, { source, target, relation, provenance });
  }
}

function inferModuleName(relativePath: string): string | null {
  if (!relativePath.endsWith(SOURCE_EXTENSION)) {
    return null;
  }
  const withoutExtension = relativePath.slice(0, -SOURCE_EXTENSION.length);
  if (withoutExtension.endsWith(path.sep + "mod")) {
    return path.basename(path.dirname(withoutExtension));
  }
  return path.basename(withoutExtension);
}

function toFixtureRelative(absolutePath: string, fixtureRoot: string): string {
  return path.relative(fixtureRoot, absolutePath).replace(/\\/g, "/");
}

function compareEdges(left: RustOracleEdge, right: RustOracleEdge): number {
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

function toRecordFromEdge(edge: RustOracleEdge): RustOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  };
}

function toRecordFromOverride(entry: RustOracleOverrideEntry): RustOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  };
}

function compareRecords(left: RustOracleEdgeRecord, right: RustOracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function collectRecords(records: RustOracleEdgeRecord[]): RustOracleEdgeRecord[] {
  return records.sort(compareRecords);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}::${target}::${relation}`;
}

function stripDocComments(content: string): string {
  // Remove block Rustdoc comments (/** ... */) first so any embedded use statements are ignored.
  const withoutBlockDocs = content.replace(/\/\*\*[\s\S]*?\*\//g, "");
  // Remove single-line Rustdoc comments (/// ...).
  return withoutBlockDocs.replace(/\/\/\/.*$/gm, "");
}
