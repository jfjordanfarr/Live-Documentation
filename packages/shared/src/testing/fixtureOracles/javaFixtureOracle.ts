import fs from "node:fs";
import path from "node:path";

export type JavaOracleEdgeRelation = "imports" | "uses";

export type JavaOracleProvenance = "import-statement" | "manual-override";

export interface JavaOracleEdge {
  source: string;
  target: string;
  relation: JavaOracleEdgeRelation;
  provenance: JavaOracleProvenance;
}

export interface JavaOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface JavaFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
}

export interface JavaOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface JavaOracleOverrideConfig {
  manualEdges?: JavaOracleOverrideEntry[];
}

export interface JavaOracleSegmentPartition {
  autoEdges: JavaOracleEdge[];
  matchedManualEdges: JavaOracleEdge[];
  manualEntries: JavaOracleOverrideEntry[];
  missingManualEntries: JavaOracleOverrideEntry[];
}

export interface JavaOracleMergeResult {
  autoEdges: JavaOracleEdge[];
  autoRecords: JavaOracleEdgeRecord[];
  manualRecords: JavaOracleEdgeRecord[];
  matchedManualRecords: JavaOracleEdgeRecord[];
  mergedRecords: JavaOracleEdgeRecord[];
  missingManualEntries: JavaOracleOverrideEntry[];
}

const SOURCE_EXTENSION = ".java";
const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "target",
  "build",
  "out"
]);

const RELATION_PRECEDENCE: Record<JavaOracleEdgeRelation, number> = {
  uses: 1,
  imports: 0
};

export function generateJavaFixtureGraph(options: JavaFixtureOracleOptions): JavaOracleEdge[] {
  const fixtureRoot = path.resolve(options.fixtureRoot);
  const fileMap = collectSourceFiles(fixtureRoot, options.include, options.exclude);
  const packageIndex = buildPackageIndex(fileMap, fixtureRoot);
  const samePackageIndex = buildSamePackageIndex(fileMap, fixtureRoot);
  const edges = new Map<string, JavaOracleEdge>();

  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    collectImportEdges({
      content,
      sourceRelativePath: relativePath,
      packageIndex,
      edges
    });
    collectSamePackageEdges({
      content,
      sourceRelativePath: relativePath,
      samePackageIndex,
      edges
    });
  }

  return Array.from(edges.values()).sort(compareEdges);
}

export function serializeJavaOracleEdges(edges: JavaOracleEdge[]): string {
  const payload = edges.map(toRecordFromEdge).sort(compareRecords);
  return JSON.stringify(payload, null, 2) + "\n";
}

export function partitionJavaOracleSegments(
  edges: JavaOracleEdge[],
  overrides?: JavaOracleOverrideConfig
): JavaOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, JavaOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: JavaOracleEdge[] = [];
  const matchedManualEdges: JavaOracleEdge[] = [];
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

export function mergeJavaOracleEdges(
  edges: JavaOracleEdge[],
  overrides?: JavaOracleOverrideConfig
): JavaOracleMergeResult {
  const partition = partitionJavaOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromEdge)
  );

  const merged = new Map<string, JavaOracleEdgeRecord>();
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

function buildPackageIndex(
  fileMap: Map<string, string>,
  fixtureRoot: string
): Map<string, string> {
  const index = new Map<string, string>();
  for (const absolutePath of fileMap.keys()) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    const packageName = inferPackageName(fileMap.get(absolutePath) ?? "");
    if (packageName) {
      index.set(`${packageName}.${inferClassName(relativePath)}`, relativePath);
    }
  }
  return index;
}

function collectImportEdges(input: {
  content: string;
  sourceRelativePath: string;
  packageIndex: Map<string, string>;
  edges: Map<string, JavaOracleEdge>;
}): void {
  const { content, sourceRelativePath, packageIndex, edges } = input;
  const pattern = /^import\s+([^;]+);/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const statement = match[1].trim();
    if (statement.startsWith("java.")) {
      continue;
    }
    const target = packageIndex.get(statement);
    if (!target || target === sourceRelativePath) {
      continue;
    }
    const symbol = statement.slice(statement.lastIndexOf(".") + 1);
    const relation = classifyJavaRelation(symbol, content);
    addEdge({
      edges,
      source: sourceRelativePath,
      target,
      relation,
      provenance: "import-statement"
    });
  }
}

interface SamePackageEntry {
  className: string;
  relativePath: string;
  packageName: string;
}

function buildSamePackageIndex(
  fileMap: Map<string, string>,
  fixtureRoot: string
): Map<string, SamePackageEntry[]> {
  const index = new Map<string, SamePackageEntry[]>();
  for (const [absolutePath, content] of fileMap) {
    const relativePath = toFixtureRelative(absolutePath, fixtureRoot);
    const packageName = inferPackageName(content);
    if (!packageName) continue;
    const className = inferClassName(relativePath);
    const entries = index.get(packageName) ?? [];
    entries.push({ className, relativePath, packageName });
    index.set(packageName, entries);
  }
  return index;
}

function collectSamePackageEdges(input: {
  content: string;
  sourceRelativePath: string;
  samePackageIndex: Map<string, SamePackageEntry[]>;
  edges: Map<string, JavaOracleEdge>;
}): void {
  const { content, sourceRelativePath, samePackageIndex, edges } = input;
  const sourcePackage = inferPackageName(content);
  if (!sourcePackage) return;
  
  const samePackageClasses = samePackageIndex.get(sourcePackage) ?? [];
  
  for (const entry of samePackageClasses) {
    // Skip self-references
    if (entry.relativePath === sourceRelativePath) continue;
    
    // Look for unqualified references to this class name
    // Match: ClassName. or ClassName:: or new ClassName or extends ClassName
    const escaped = escapeRegExp(entry.className);
    const usagePattern = new RegExp(
      `\\b${escaped}\\s*\\.|\\b${escaped}::|\\bnew\\s+${escaped}\\b|\\bextends\\s+${escaped}\\b|\\bimplements\\s+${escaped}\\b`,
      "g"
    );
    
    if (usagePattern.test(content)) {
      const relation = classifyJavaRelation(entry.className, content);
      addEdge({
        edges,
        source: sourceRelativePath,
        target: entry.relativePath,
        relation,
        provenance: "import-statement" // Same-package refs are implicit imports
      });
    }
  }
}

function classifyJavaRelation(symbol: string, content: string): JavaOracleEdgeRelation {
  const escaped = escapeRegExp(symbol);
  const constructorPattern = new RegExp(`new\\s+${escaped}\\b`);
  const genericPattern = new RegExp(`<\\s*${escaped}\\b`);
  const declarationPattern = new RegExp(`\\b${escaped}\\s+[A-Za-z_$][\\w$]*\\s*(=|;|,|\\))`);
  const methodReferencePattern = new RegExp(`\\b${escaped}::`);

  if (
    constructorPattern.test(content) ||
    genericPattern.test(content) ||
    declarationPattern.test(content) ||
    methodReferencePattern.test(content)
  ) {
    return "uses";
  }

  return "imports";
}

function addEdge(input: {
  edges: Map<string, JavaOracleEdge>;
  source: string;
  target: string;
  relation: JavaOracleEdgeRelation;
  provenance: JavaOracleProvenance;
}): void {
  const { edges, source, target, relation, provenance } = input;
  const key = `${source}::${target}`;
  const existing = edges.get(key);
  if (!existing || RELATION_PRECEDENCE[relation] > RELATION_PRECEDENCE[existing.relation]) {
    edges.set(key, { source, target, relation, provenance });
  }
}

function inferPackageName(content: string): string | null {
  const match = content.match(/\bpackage\s+([^;]+);/);
  return match ? match[1].trim() : null;
}

function inferClassName(relativePath: string): string {
  const basename = path.basename(relativePath, SOURCE_EXTENSION);
  return basename;
}

function toFixtureRelative(absolutePath: string, fixtureRoot: string): string {
  return path.relative(fixtureRoot, absolutePath).replace(/\\/g, "/");
}

function compareEdges(left: JavaOracleEdge, right: JavaOracleEdge): number {
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

function toRecordFromEdge(edge: JavaOracleEdge): JavaOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  };
}

function toRecordFromOverride(entry: JavaOracleOverrideEntry): JavaOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  };
}

function compareRecords(left: JavaOracleEdgeRecord, right: JavaOracleEdgeRecord): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  return left.relation.localeCompare(right.relation);
}

function collectRecords(records: JavaOracleEdgeRecord[]): JavaOracleEdgeRecord[] {
  return records.sort(compareRecords);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}::${target}::${relation}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
