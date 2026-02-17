import fs from "node:fs";
import path from "node:path";

/**
 * SCIP-grounded relation taxonomy.
 * All require relationships map to "references" in the canonical taxonomy.
 */
export type RubyOracleEdgeRelation = "references";

/**
 * Tracks how a Ruby dependency edge was discovered.
 *
 * - `"require"` — resolved from a `require_relative` statement
 * - `"manual-override"` — supplied by a human-authored override entry
 */
export type RubyOracleProvenance = "require" | "manual-override";

/**
 * A directed dependency edge in the Ruby fixture graph.
 *
 * Includes provenance metadata so benchmark reports can attribute
 * each edge to its discovery mechanism (require or override).
 */
export interface RubyOracleEdge {
  /** Workspace-relative path of the source file. */
  source: string;
  /** Workspace-relative path of the target file. */
  target: string;
  /** Canonical SCIP relation kind (always `"references"` for Ruby). */
  relation: RubyOracleEdgeRelation;
  /** How this edge was discovered. */
  provenance: RubyOracleProvenance;
}

/**
 * Provenance-free edge record used for serialisation and comparison.
 *
 * Matches the shape written to `expected.json` benchmark fixtures.
 */
export interface RubyOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

/**
 * Configuration for the Ruby fixture oracle graph generator.
 */
export interface RubyFixtureOracleOptions {
  /** Absolute or relative path to the fixture directory root. */
  fixtureRoot: string;
  /** Optional path patterns restricting which `.rb` files to include. */
  include?: string[];
  /** Optional path patterns for files to exclude from analysis. */
  exclude?: string[];
}

/**
 * A human-authored edge override that supplements auto-detected edges.
 *
 * Override entries let benchmark authors declare relationships the
 * heuristic scanner cannot discover (e.g. dynamic requires, metaprogramming).
 */
export interface RubyOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

/**
 * Container for manual override edges, typically loaded from an
 * `overrides.json` file alongside the fixture.
 */
export interface RubyOracleOverrideConfig {
  manualEdges?: RubyOracleOverrideEntry[];
}

/**
 * Result of partitioning auto-detected edges against manual overrides.
 *
 * Used by benchmark harnesses to report which overrides were matched
 * by heuristic discovery and which remain unmatched.
 */
export interface RubyOracleSegmentPartition {
  /** Edges discovered by heuristic analysis that have no matching override. */
  autoEdges: RubyOracleEdge[];
  /** Edges discovered by heuristic analysis that also appear in overrides. */
  matchedManualEdges: RubyOracleEdge[];
  /** All override entries provided. */
  manualEntries: RubyOracleOverrideEntry[];
  /** Override entries with no corresponding auto-detected edge. */
  missingManualEntries: RubyOracleOverrideEntry[];
}

/**
 * Full merge result combining auto-detected and manual override edges.
 *
 * `mergedRecords` is the union used as the ground-truth expected output
 * when comparing against inference engine results in benchmark tests.
 */
export interface RubyOracleMergeResult {
  /** All auto-detected edges (with provenance). */
  autoEdges: RubyOracleEdge[];
  /** Auto-detected edges as provenance-free records. */
  autoRecords: RubyOracleEdgeRecord[];
  /** Manual override entries as records. */
  manualRecords: RubyOracleEdgeRecord[];
  /** Subset of manual records that overlap with auto-detected edges. */
  matchedManualRecords: RubyOracleEdgeRecord[];
  /** Deduplicated union of auto + manual records (the ground truth). */
  mergedRecords: RubyOracleEdgeRecord[];
  /** Manual entries that heuristic analysis failed to discover. */
  missingManualEntries: RubyOracleOverrideEntry[];
}

const SOURCE_EXTENSION = ".rb";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "tmp",
  "log"
]);

/**
 * Generates a ground-truth dependency graph for a Ruby fixture directory.
 *
 * Recursively scans all `.rb` files under `fixtureRoot` and resolves
 * `require_relative` statements to in-tree targets to produce a
 * complete set of directed edges.
 *
 * @param options - Fixture root path and optional include/exclude path filters.
 * @returns Sorted array of edges with provenance metadata.
 */
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

/**
 * Serialises Ruby oracle edges to a deterministic JSON string.
 *
 * Strips provenance and sorts by source/target/relation to produce
 * output suitable for writing to `expected.json` fixture files.
 */
export function serializeRubyOracleEdges(edges: RubyOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

/**
 * Partitions auto-detected edges against manual override entries.
 *
 * Identifies which overrides were independently discovered by the
 * heuristic scanner and which remain unmatched — useful for auditing
 * override coverage in benchmark reports.
 *
 * @param edges - Auto-detected edges from {@link generateRubyFixtureGraph}.
 * @param overrides - Optional manual override configuration.
 */
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

/**
 * Merges auto-detected edges with manual overrides into a unified ground truth.
 *
 * The resulting `mergedRecords` array is the canonical expected output
 * that benchmark tests compare against inference engine results.
 *
 * @param edges - Auto-detected edges from {@link generateRubyFixtureGraph}.
 * @param overrides - Optional manual override configuration.
 */
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
        relation: "references",
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
