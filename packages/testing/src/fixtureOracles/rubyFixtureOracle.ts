import fs from "node:fs";
import path from "node:path";

export type RubyOracleEdgeRelation = "requires";

export type RubyOracleProvenance = "require" | "manual-override";

export interface RubyOracleEdge {
  source: string;
  target: string;
  relation: RubyOracleEdgeRelation;
  provenance: RubyOracleProvenance;
}

export interface RubyOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface RubyFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
}

export interface RubyOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface RubyOracleOverrideConfig {
  manualEdges?: RubyOracleOverrideEntry[];
}

export interface RubyOracleSegmentPartition {
  autoEdges: RubyOracleEdge[];
  matchedManualEdges: RubyOracleEdge[];
  manualEntries: RubyOracleOverrideEntry[];
  missingManualEntries: RubyOracleOverrideEntry[];
}

export interface RubyOracleMergeResult {
  autoEdges: RubyOracleEdge[];
  autoRecords: RubyOracleEdgeRecord[];
  manualRecords: RubyOracleEdgeRecord[];
  matchedManualRecords: RubyOracleEdgeRecord[];
  mergedRecords: RubyOracleEdgeRecord[];
  missingManualEntries: RubyOracleOverrideEntry[];
}

const SOURCE_EXTENSION = ".rb";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "tmp",
  "log"
]);

export function generateRubyFixtureGraph(options: RubyFixtureOracleOptions): RubyOracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const edges = new Map<string, RubyOracleEdge>();

  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    collectRequireEdges({
      content,
      sourceAbsolutePath: absolutePath,
      sourceRelativePath: relativePath,
      fixtureRoot,
      edges
    });
  }

  return Array.from(edges.values()).sort(compareEdges);
}

export function serializeRubyOracleEdges(edges: RubyOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionRubyOracleSegments(
  edges: RubyOracleEdge[],
  overrides?: RubyOracleOverrideConfig
): RubyOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, RubyOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: RubyOracleEdge[] = [];
  const matchedManualEdges: RubyOracleEdge[] = [];
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

export function mergeRubyOracleEdges(
  edges: RubyOracleEdge[],
  overrides?: RubyOracleOverrideConfig
): RubyOracleMergeResult {
  const partition = partitionRubyOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromEdge)
  );

  const merged = new Map<string, RubyOracleEdgeRecord>();
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

function collectRequireEdges(input: {
  content: string;
  sourceAbsolutePath: string;
  sourceRelativePath: string;
  fixtureRoot: string;
  edges: Map<string, RubyOracleEdge>;
}): void {
  const { content, sourceAbsolutePath, sourceRelativePath, fixtureRoot, edges } = input;
  const pattern = /require_relative\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const relativeRequire = match[1];
    const targetAbsolute = path.resolve(path.dirname(sourceAbsolutePath), `${relativeRequire}.rb`);
    if (!fs.existsSync(targetAbsolute)) {
      continue;
    }
    const targetRelative = toFixtureRelative(targetAbsolute, fixtureRoot);
    if (targetRelative === sourceRelativePath) {
      continue;
    }
    const key = `${sourceRelativePath}::${targetRelative}`;
    if (!edges.has(key)) {
      edges.set(key, {
        source: sourceRelativePath,
        target: targetRelative,
        relation: "requires",
        provenance: "require"
      });
    }
  }
}

function toFixtureRelative(absolutePath: string, fixtureRoot: string): string {
  return path.relative(fixtureRoot, absolutePath).replace(/\\/g, "/");
}

function compareEdges(left: RubyOracleEdge, right: RubyOracleEdge): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.provenance.localeCompare(right.provenance);
}

function toRecordFromEdge(edge: RubyOracleEdge): RubyOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  };
}

function toRecordFromOverride(entry: RubyOracleOverrideEntry): RubyOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  };
}

function compareRecords(left: RubyOracleEdgeRecord, right: RubyOracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function collectRecords(records: RubyOracleEdgeRecord[]): RubyOracleEdgeRecord[] {
  return records.sort(compareRecords);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}::${target}::${relation}`;
}
