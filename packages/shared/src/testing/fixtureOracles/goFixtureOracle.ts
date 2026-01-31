import fs from "node:fs";
import path from "node:path";

/**
 * SCIP-grounded relation taxonomy.
 * All import relationships map to "references" in the canonical taxonomy.
 */
export type GoOracleEdgeRelation = "references";

export type GoOracleProvenance = "import-statement" | "manual-override";

export interface GoOracleEdge {
  source: string;
  target: string;
  relation: GoOracleEdgeRelation;
  provenance: GoOracleProvenance;
}

export interface GoOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface GoFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
}

export interface GoOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface GoOracleOverrideConfig {
  manualEdges?: GoOracleOverrideEntry[];
}

export interface GoOracleSegmentPartition {
  autoEdges: GoOracleEdge[];
  matchedManualEdges: GoOracleEdge[];
  manualEntries: GoOracleOverrideEntry[];
  missingManualEntries: GoOracleOverrideEntry[];
}

export interface GoOracleMergeResult {
  autoEdges: GoOracleEdge[];
  autoRecords: GoOracleEdgeRecord[];
  manualRecords: GoOracleEdgeRecord[];
  matchedManualRecords: GoOracleEdgeRecord[];
  mergedRecords: GoOracleEdgeRecord[];
  missingManualEntries: GoOracleOverrideEntry[];
}

const SOURCE_EXTENSION = ".go";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "vendor",
  "bin",
  "pkg"
]);

/**
 * Generates the fixture graph by analyzing Go source files.
 *
 * @remarks
 * Go packages can span multiple files. This oracle:
 * 1. Finds all .go files in the fixture
 * 2. Reads go.mod for module name
 * 3. Maps import paths to local package files
 * 4. Produces edges from each source file to its imported packages
 */
export function generateGoFixtureGraph(options: GoFixtureOracleOptions): GoOracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const moduleName = readModuleName(fixtureRoot);
  const packageIndex = buildPackageIndex(fileMap, fixtureRoot, moduleName);
  const edges = new Map<string, GoOracleEdge>();

  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    collectImportEdges({
      content,
      sourceRelativePath: relativePath,
      packageIndex,
      moduleName,
      edges
    });
  }

  return Array.from(edges.values()).sort(compareEdges);
}

export function serializeGoOracleEdges(edges: GoOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionGoOracleSegments(
  edges: GoOracleEdge[],
  overrides?: GoOracleOverrideConfig
): GoOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, GoOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: GoOracleEdge[] = [];
  const matchedManualEdges: GoOracleEdge[] = [];
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

export function mergeGoOracleEdges(
  edges: GoOracleEdge[],
  overrides?: GoOracleOverrideConfig
): GoOracleMergeResult {
  const partition = partitionGoOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromEdge)
  );

  const merged = new Map<string, GoOracleEdgeRecord>();
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

// ============================================================================
// Internal Helpers
// ============================================================================

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

      // Note: We include _test.go files so test dependencies are captured in the oracle graph
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

function readModuleName(fixtureRoot: string): string | undefined {
  const goModPath = path.join(fixtureRoot, "go.mod");
  if (!fs.existsSync(goModPath)) {
    return undefined;
  }
  
  const content = fs.readFileSync(goModPath, "utf8");
  const match = /^module\s+([^\s]+)/m.exec(content);
  return match?.[1];
}

/**
 * Builds an index mapping import paths to fixture-relative file paths.
 *
 * For a module "rosetta" with structure:
 *   src/main.go       (package main)
 *   src/models.go     (package models)
 *   src/processor.go  (package processor)
 *
 * The index maps:
 *   "rosetta/models"    â†’ "src/models.go"
 *   "rosetta/processor" â†’ "src/processor.go"
 *
 * @remarks
 * Go packages can span multiple files in the same directory.
 * We pick one representative file per package (preferring the one named after the package).
 */
function buildPackageIndex(
  fileMap: Map<string, string>,
  fixtureRoot: string,
  moduleName: string | undefined
): Map<string, string> {
  const index = new Map<string, string>();
  
  if (!moduleName) {
    return index;
  }

  // Group files by their package (directory)
  const packageDirs = new Map<string, string[]>();
  
  for (const absolutePath of fileMap.keys()) {
    const dir = path.dirname(absolutePath);
    const existing = packageDirs.get(dir) ?? [];
    existing.push(absolutePath);
    packageDirs.set(dir, existing);
  }

  // For each package directory, determine the import path and representative file
  for (const [dir, files] of packageDirs) {
    const relativeDir = path.relative(fixtureRoot, dir).replace(/\\/g, "/");
    
    // Compute import path: moduleName + relative directory path
    const importPath = relativeDir ? `${moduleName}/${relativeDir}` : moduleName;
    
    // Pick representative file (prefer one named after the last directory segment)
    const baseName = path.basename(dir);
    const preferredFile = files.find(f => path.basename(f, ".go") === baseName) ?? files[0];
    const representativeFile = toFixtureRelative(preferredFile, fixtureRoot);
    
    index.set(importPath, representativeFile);
  }

  return index;
}

function collectImportEdges(input: {
  content: string;
  sourceRelativePath: string;
  packageIndex: Map<string, string>;
  moduleName: string | undefined;
  edges: Map<string, GoOracleEdge>;
}): void {
  const { content, sourceRelativePath, packageIndex, moduleName, edges } = input;
  
  if (!moduleName) {
    return;
  }

  const imports = parseImports(content);
  // Use SCIP-grounded relation for all imports
  const relation: GoOracleEdgeRelation = "references";
  
  for (const importPath of imports) {
    // Only consider imports from our module
    if (!importPath.startsWith(moduleName)) {
      continue;
    }
    
    const target = packageIndex.get(importPath);
    if (!target || target === sourceRelativePath) {
      continue;
    }
    
    addEdge({
      edges,
      source: sourceRelativePath,
      target,
      relation,
      provenance: "import-statement"
    });
  }
}

/**
 * Parses import statements from Go source code.
 *
 * Handles both single imports and grouped imports:
 * - import "fmt"
 * - import m "rosetta/models"
 * - import ( "fmt" \n "rosetta/models" )
 */
function parseImports(content: string): string[] {
  const imports: string[] = [];
  
  // Match single imports: import "path" or import alias "path"
  const singlePattern = /^import\s+(?:[a-zA-Z_][a-zA-Z0-9_]*\s+)?"([^"]+)"/gm;
  let match: RegExpExecArray | null;
  
  while ((match = singlePattern.exec(content)) !== null) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }
  
  // Match grouped imports
  const groupedPattern = /^import\s*\(([\s\S]*?)\)/gm;
  while ((match = groupedPattern.exec(content)) !== null) {
    const block = match[1];
    const linePattern = /(?:[a-zA-Z_][a-zA-Z0-9_]*\s+)?"([^"]+)"/g;
    let lineMatch: RegExpExecArray | null;
    while ((lineMatch = linePattern.exec(block)) !== null) {
      if (lineMatch[1]) {
        imports.push(lineMatch[1]);
      }
    }
  }
  
  return [...new Set(imports)];
}

function addEdge(input: {
  edges: Map<string, GoOracleEdge>;
  source: string;
  target: string;
  relation: GoOracleEdgeRelation;
  provenance: GoOracleProvenance;
}): void {
  const { edges, source, target, relation, provenance } = input;
  const key = `${source}::${target}`;
  // With single relation type, we just check if edge exists
  if (!edges.has(key)) {
    edges.set(key, { source, target, relation, provenance });
  }
}

function toFixtureRelative(absolutePath: string, fixtureRoot: string): string {
  return path.relative(fixtureRoot, absolutePath).replace(/\\/g, "/");
}

function compareEdges(left: GoOracleEdge, right: GoOracleEdge): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  // Relation is always 'references' now, skip comparison
  return left.provenance.localeCompare(right.provenance);
}

function toRecordFromEdge(edge: GoOracleEdge): GoOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  };
}

function toRecordFromOverride(entry: GoOracleOverrideEntry): GoOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  };
}

function compareRecords(left: GoOracleEdgeRecord, right: GoOracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function collectRecords(records: GoOracleEdgeRecord[]): GoOracleEdgeRecord[] {
  return records.sort(compareRecords);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}::${target}::${relation}`;
}
