import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";

/**
 * SCIP-grounded relation taxonomy.
 * Both includes and function calls map to "references" in the canonical taxonomy.
 */
export type COracleEdgeRelation = "references";

/**
 * Tracks how a C dependency edge was discovered.
 *
 * - `"source-include"` — resolved from a `#include` directive
 * - `"function-call"` — detected via a cross-file function call site
 * - `"manual-override"` — supplied by a human-authored override entry
 */
export type COracleProvenance = "source-include" | "function-call" | "manual-override";

/**
 * A directed dependency edge in the C fixture graph.
 *
 * Includes provenance metadata so benchmark reports can attribute
 * each edge to its discovery mechanism (include, call, or override).
 */
export interface COracleEdge {
  /** Workspace-relative path of the source file. */
  source: string;
  /** Workspace-relative path of the target file. */
  target: string;
  /** Canonical SCIP relation kind (always `"references"` for C). */
  relation: COracleEdgeRelation;
  /** How this edge was discovered. */
  provenance: COracleProvenance;
}

/**
 * Provenance-free edge record used for serialisation and comparison.
 *
 * Matches the shape written to `expected.json` benchmark fixtures.
 */
export interface COracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

/**
 * Configuration for the C fixture oracle graph generator.
 */
export interface CFixtureOracleOptions {
  /** Absolute or relative path to the fixture directory root. */
  fixtureRoot: string;
  /** Optional glob patterns restricting which `.c`/`.h` files to include. */
  include?: string[];
  /** Optional glob patterns for files to exclude from analysis. */
  exclude?: string[];
}

/**
 * A human-authored edge override that supplements auto-detected edges.
 *
 * Override entries let benchmark authors declare relationships the
 * heuristic scanner cannot discover (e.g. dlopen, macro-generated calls).
 */
export interface COracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

/**
 * Container for manual override edges, typically loaded from an
 * `overrides.json` file alongside the fixture.
 */
export interface COracleOverrideConfig {
  manualEdges?: COracleOverrideEntry[];
}

/**
 * Result of partitioning auto-detected edges against manual overrides.
 *
 * Used by benchmark harnesses to report which overrides were matched
 * by heuristic discovery and which remain unmatched.
 */
export interface COracleSegmentPartition {
  /** Edges discovered by heuristic analysis that have no matching override. */
  autoEdges: COracleEdge[];
  /** Edges discovered by heuristic analysis that also appear in overrides. */
  matchedManualEdges: COracleEdge[];
  /** All override entries provided. */
  manualEntries: COracleOverrideEntry[];
  /** Override entries with no corresponding auto-detected edge. */
  missingManualEntries: COracleOverrideEntry[];
}

/**
 * Full merge result combining auto-detected and manual override edges.
 *
 * `mergedRecords` is the union used as the ground-truth expected output
 * when comparing against inference engine results in benchmark tests.
 */
export interface COracleMergeResult {
  /** All auto-detected edges (with provenance). */
  autoEdges: COracleEdge[];
  /** Auto-detected edges as provenance-free records. */
  autoRecords: COracleEdgeRecord[];
  /** Manual override entries as records. */
  manualRecords: COracleEdgeRecord[];
  /** Subset of manual records that overlap with auto-detected edges. */
  matchedManualRecords: COracleEdgeRecord[];
  /** Deduplicated union of auto + manual records (the ground truth). */
  mergedRecords: COracleEdgeRecord[];
  /** Manual entries that heuristic analysis failed to discover. */
  missingManualEntries: COracleOverrideEntry[];
}

const SOURCE_EXTENSIONS = new Set([".c", ".h"]);
const KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "switch",
  "return",
  "sizeof",
  "do",
  "case",
  "break",
  "continue",
  "goto"
]);

const DEFAULT_IGNORE_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".idea",
  ".vscode",
  "build",
  "dist",
  "out"
]);

/**
 * Generates a ground-truth dependency graph for a C fixture directory.
 *
 * Scans all `.c` and `.h` files under `fixtureRoot`, resolves `#include`
 * directives to in-tree targets, and detects cross-file function call sites
 * to produce a complete set of directed edges.
 *
 * @param options - Fixture root path and optional include/exclude globs.
 * @returns Sorted array of edges with provenance metadata.
 */
export function generateCFixtureGraph(options: CFixtureOracleOptions): COracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const relativeIndex = new Map<string, string>();
  const basenameIndex = new Map<string, string[]>();

  for (const absolutePath of fileMap.keys()) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    relativeIndex.set(relativePath, absolutePath);
    const baseName = path.posix.basename(relativePath);
    const container = basenameIndex.get(baseName);
    if (container) {
      container.push(absolutePath);
    } else {
      basenameIndex.set(baseName, [absolutePath]);
    }
  }

  const functionIndex = buildFunctionIndex(fileMap, fixtureRoot);

  const edges = new Map<string, COracleEdge>();

  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    const extension = path.extname(absolutePath).toLowerCase();
    const isTranslationUnit = extension === ".c";
    const isHeaderFile = extension === ".h";

    if (isTranslationUnit || isHeaderFile) {
      for (const includeTarget of discoverIncludes(
        absolutePath,
        content,
        fixtureRoot,
        fileMap,
        relativeIndex,
        basenameIndex
      )) {
        const key = edgeKey(relativePath, includeTarget, "references");
        if (!edges.has(key)) {
          edges.set(key, {
            source: relativePath,
            target: includeTarget,
            relation: "references",
            provenance: "source-include"
          });
        }
      }
    }

    if (!isTranslationUnit) {
      continue;
    }

    const calls = discoverCalls(content, functionIndex, relativePath);
    for (const target of calls) {
      const key = edgeKey(relativePath, target, "references");
      if (!edges.has(key)) {
        edges.set(key, {
          source: relativePath,
          target,
          relation: "references",
          provenance: "function-call"
        });
      }
    }
  }

  return Array.from(edges.values()).sort(compareEdges);
}

/**
 * Serialises C oracle edges to a deterministic JSON string.
 *
 * Strips provenance and sorts by source/target/relation to produce
 * output suitable for writing to `expected.json` fixture files.
 */
export function serializeCOracleEdges(edges: COracleEdge[]): string {
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
 * @param edges - Auto-detected edges from {@link generateCFixtureGraph}.
 * @param overrides - Optional manual override configuration.
 */
export function partitionCOracleSegments(
  edges: COracleEdge[],
  overrides?: COracleOverrideConfig
): COracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, COracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: COracleEdge[] = [];
  const matchedManualEdges: COracleEdge[] = [];
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
 * @param edges - Auto-detected edges from {@link generateCFixtureGraph}.
 * @param overrides - Optional manual override configuration.
 */
export function mergeCOracleEdges(
  edges: COracleEdge[],
  overrides?: COracleOverrideConfig
): COracleMergeResult {
  const partition = partitionCOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromEdge)
  );

  const merged = new Map<string, COracleEdgeRecord>();
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
  const files = new Map<string, string>();
  const workspaceRoot = path.resolve(root);
  const includePatterns = normalizePatterns(include, ["**/*.{c,h}"]);
  const excludePatterns = normalizePatterns(exclude, []);

  const defaultIgnore = Array.from(DEFAULT_IGNORE_DIRECTORIES).map(
    directory => `${directory}/**`
  );
  const ignorePatterns = [...defaultIgnore, ...excludePatterns];
  const seen = new Set<string>();

  for (const pattern of includePatterns) {
    const matches = globSync(pattern, {
      cwd: workspaceRoot,
      ignore: ignorePatterns,
      nodir: true,
      dot: false,
      windowsPathsNoEscape: true
    });

    for (const match of matches) {
      const absolutePath = path.join(workspaceRoot, match);
      const extension = path.extname(absolutePath).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(extension)) {
        continue;
      }
      if (seen.has(absolutePath)) {
        continue;
      }
      const content = fs.readFileSync(absolutePath, "utf8");
      files.set(absolutePath, content);
      seen.add(absolutePath);
    }
  }

  return files;
}

function normalizePatterns(
  patterns: string[] | undefined,
  fallback: string[]
): string[] {
  const source = patterns && patterns.length > 0 ? patterns : fallback;
  return source.map(pattern => normalizePattern(pattern));
}

function normalizePattern(candidate: string): string {
  const normalized = candidate.replace(/\\/g, "/");
  if (normalized.startsWith("./")) {
    return normalized.slice(2);
  }
  return normalized;
}

interface FunctionDefinition {
  name: string;
  body: string;
}

function buildFunctionIndex(fileMap: Map<string, string>, root: string): Map<string, string> {
  const index = new Map<string, string>();
  for (const [filePath, content] of fileMap) {
    if (!filePath.endsWith(".c")) {
      continue;
    }
    const stripped = stripComments(content);
    for (const definition of extractFunctionDefinitions(stripped)) {
      index.set(definition.name, toFixtureRelative(filePath, root));
    }
  }
  return index;
}

function discoverIncludes(
  filePath: string,
  content: string,
  root: string,
  fileMap: Map<string, string>,
  relativeIndex: Map<string, string>,
  basenameIndex: Map<string, string[]>
): string[] {
  const includes: string[] = [];
  const directory = path.dirname(filePath);
  const stripped = stripComments(content);
    const pattern = /#\s*include\s+([<"])([^>"]+)[>"]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(stripped))) {
    const delimiter = match[1];
    const candidate = match[2];
    const isSystemInclude = delimiter === "<";
    const resolved = resolveIncludeTarget(
      directory,
      candidate,
      root,
      fileMap,
      relativeIndex,
      basenameIndex,
      isSystemInclude
    );
    if (!resolved) {
      continue;
    }
    if (resolved === filePath) {
      continue;
    }
    const relative = toFixtureRelative(resolved, root);
    includes.push(relative);
  }

  return includes;
}

function resolveIncludeTarget(
  directory: string,
  candidate: string,
  root: string,
  fileMap: Map<string, string>,
  relativeIndex: Map<string, string>,
  basenameIndex: Map<string, string[]>,
  isSystemInclude: boolean
): string | null {
  const normalizedCandidate = normalizeIncludePath(candidate);
  const directAbsolute = path.resolve(directory, normalizedCandidate);

  if (isWithinRoot(directAbsolute, root) && fileMap.has(directAbsolute)) {
    return directAbsolute;
  }

  if (isSystemInclude) {
    return null;
  }

  const relativeCandidate = normalizeIncludePath(
    path.relative(root, directAbsolute)
  );
  const directRelativeMatch = relativeIndex.get(relativeCandidate);
  if (directRelativeMatch) {
    return directRelativeMatch;
  }

  const explicitMatch = relativeIndex.get(normalizedCandidate);
  if (explicitMatch) {
    return explicitMatch;
  }

  const suffixMatches: string[] = [];
  for (const [relativePath, absolutePath] of relativeIndex.entries()) {
    if (
      relativePath === normalizedCandidate ||
      relativePath.endsWith(`/${normalizedCandidate}`)
    ) {
      suffixMatches.push(absolutePath);
    }
  }

  if (suffixMatches.length === 1) {
    return suffixMatches[0];
  }

  const baseName = path.posix.basename(normalizedCandidate);
  const basenameMatches = basenameIndex.get(baseName) ?? [];
  if (basenameMatches.length === 1) {
    return basenameMatches[0];
  }

  return null;
}

function normalizeIncludePath(candidate: string): string {
  const normalized = candidate.replace(/\\/g, "/");
  return normalized.replace(/^\.\//, "");
}

function isWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return !relative.startsWith("..");
}

function discoverCalls(
  content: string,
  functionIndex: Map<string, string>,
  sourceRelative: string
): string[] {
  const stripped = stripComments(content);
  const definitions = extractFunctionDefinitions(stripped);
  const bodies = definitions.map(definition => definition.body);
  const calls: string[] = [];

  for (const body of bodies) {
    const callPattern = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let match: RegExpExecArray | null;

    while ((match = callPattern.exec(body))) {
      const name = match[1];
      if (KEYWORDS.has(name) || name === "sizeof") {
        continue;
      }
      const target = functionIndex.get(name);
      if (!target) {
        continue;
      }
      if (target === sourceRelative) {
        continue;
      }
      calls.push(target);
    }
  }

  const deduped = new Set(calls);
  return Array.from(deduped.values()).sort((left, right) => left.localeCompare(right));
}

function stripComments(content: string): string {
  const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, " ");
  return withoutBlock.replace(/\/\/.*$/gm, " ");
}

function extractFunctionDefinitions(content: string): FunctionDefinition[] {
  const results: FunctionDefinition[] = [];
  const pattern = /([A-Za-z_][A-Za-z0-9_\s*]*?)\b([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{}]*\)\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const name = match[2];
    if (KEYWORDS.has(name)) {
      continue;
    }

    const braceIndex = pattern.lastIndex - 1;
    const body = extractBlock(content, braceIndex);
    if (!body) {
      continue;
    }

    results.push({
      name,
      body
    });
  }

  return results;
}

function extractBlock(content: string, braceIndex: number): string | null {
  let depth = 0;
  let index = braceIndex;
  let end = braceIndex;

  for (; index < content.length; index += 1) {
    const char = content[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  if (depth !== 0) {
    return null;
  }

  return content.slice(braceIndex, end);
}

function toFixtureRelative(candidate: string, root: string): string {
  return path.relative(root, candidate).replace(/\\/g, "/");
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}â†’${target}#${relation}`;
}

function toRecordFromEdge(edge: COracleEdge): COracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  } satisfies COracleEdgeRecord;
}

function toRecordFromOverride(entry: COracleOverrideEntry): COracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  } satisfies COracleEdgeRecord;
}

function collectRecords(records: COracleEdgeRecord[]): COracleEdgeRecord[] {
  const map = new Map<string, COracleEdgeRecord>();
  for (const record of records) {
    const normalized = normalizeRecord(record);
    map.set(edgeKey(normalized.source, normalized.target, normalized.relation), normalized);
  }
  return Array.from(map.values()).sort(compareRecords);
}

function normalizeRecord(record: COracleEdgeRecord): COracleEdgeRecord {
  return {
    source: record.source.replace(/\\/g, "/"),
    target: record.target.replace(/\\/g, "/"),
    relation: record.relation
  } satisfies COracleEdgeRecord;
}

function compareRecords(left: COracleEdgeRecord, right: COracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function compareEdges(left: COracleEdge, right: COracleEdge): number {
  const recordComparison = compareRecords(toRecordFromEdge(left), toRecordFromEdge(right));
  if (recordComparison !== 0) {
    return recordComparison;
  }
  return left.provenance.localeCompare(right.provenance);
}
