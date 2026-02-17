import type { Stage0Doc, TargetManifest } from "../types";

const DEFAULT_EDGE_ALPHA = 0.01;
const DEFAULT_CLUSTER_ALPHA = 0.01;
const EDGE_KEY_SEPARATOR = "|||";

/**
 * Degree distribution computed from all observed dependency edges.
 * Used as the background model for significance testing.
 */
export interface DegreeDistribution {
  /** Map from node ID to its degree (sum of edge weights). */
  degrees: Map<string, number>;
  /** Total edge weight across the entire graph (sum of all dependency weights). */
  totalEdgeWeight: number;
  /** Mean degree across all nodes. */
  meanDegree: number;
}

/**
 * Configuration for the co-activation analysis builder.
 */
export interface CoActivationBuildArgs {
  /** Stage-0 Live Doc objects providing dependency and test data. */
  stage0Docs: Stage0Doc[];
  /** Optional target manifest for filtering. */
  manifest?: TargetManifest;
  /** Weight multiplier for dependency-derived edges (default 1). */
  dependencyWeight?: number;
  /** Weight multiplier for shared-test-derived edges (default 1). */
  testWeight?: number;
  /** Minimum combined weight for an edge to be retained (default 0). */
  minWeight?: number;
  /** Significance threshold for individual edges (default 0.01). */
  edgeAlpha?: number;
  /** Significance threshold for cluster detection (default 0.01). */
  clusterAlpha?: number;
}

/**
 * A weighted edge between two co-activated artifacts, enriched with
 * statistical significance and provenance metadata.
 */
export interface CoActivationEdge {
  source: string;
  target: string;
  /** Combined dependency + test weight. */
  weight: number;
  /** Source paths of dependency relationships contributing to this edge. */
  dependencySources: string[];
  /** Source paths of shared tests contributing to this edge. */
  testSources: string[];
  /** Number of tests shared between source and target. */
  sharedTestCount: number;
  /** Total tests covering the source artifact. */
  sourceTestCount: number;
  /** Total tests covering the target artifact. */
  targetTestCount: number;
  /** Statistical p-value from the degree-corrected significance test. */
  pValue: number | null;
  /** Benjamini–Hochberg corrected q-value. */
  qValue: number | null;
  /** Whether this edge passes the significance threshold. */
  isSignificant: boolean;
}

/**
 * A node in the co-activation graph with degree, strength, and z-score
 * metrics relative to the background degree distribution.
 */
export interface CoActivationNode {
  /** Live Doc source path identifier. */
  id: string;
  /** Workspace-relative path of the Live Doc. */
  docRelativePath: string;
  /** Archetype classification of the source artifact. */
  archetype: string;
  /** Number of co-activation edges incident on this node. */
  degree: number;
  /** Sum of edge weights incident on this node. */
  strength: number;
  /** Number of tests covering this artifact. */
  testCount: number;
  /** Standard score of this node’s degree relative to the graph mean. */
  zScore: number;
}

/**
 * A cluster of tightly co-activated nodes identified by the greedy
 * modularity algorithm, with statistical significance assessment.
 */
export interface CoActivationCluster {
  /** Unique cluster identifier. */
  id: string;
  /** Node IDs belonging to this cluster. */
  members: string[];
  /** Total internal edge weight. */
  weight: number;
  /** Number of internal edges. */
  edgeCount: number;
  /** Expected internal edges under the null model. */
  expectedEdgeCount: number;
  /** Edge density (edgeCount / possible edges). */
  density: number;
  /** Statistical p-value for cluster significance. */
  pValue: number;
  /** Benjamini–Hochberg corrected q-value. */
  qValue: number;
  /** Whether this cluster passes the significance threshold. */
  isSignificant: boolean;
}

/**
 * Complete co-activation analysis report including nodes, edges,
 * clusters, and aggregate metrics.
 */
export interface CoActivationReport {
  generatedAt: string;
  metrics: {
    nodeCount: number;
    edgeCount: number;
    significantEdgeCount: number;
    clusterCount: number;
    significantClusterCount: number;
    dependencyWeight: number;
    testWeight: number;
    minWeight: number;
    edgeAlpha: number;
    clusterAlpha: number;
    totalTests: number;
    /** Total dependency edge weight used as background for degree-corrected model. */
    totalDependencyEdgeWeight: number;
    /** Mean node degree in the dependency graph. */
    meanDegree: number;
  };
  nodes: CoActivationNode[];
  edges: CoActivationEdge[];
  clusters: CoActivationCluster[];
}

interface EdgeAccumulator {
  weight: number;
  dependencySources: Set<string>;
  testSources: Set<string>;
}

type EdgeReason =
  | {
      kind: "dependency";
      source: string;
      dependencyWeight: number;
      testWeight: number;
    }
  | {
      kind: "test";
      source: string;
      dependencyWeight: number;
      testWeight: number;
    };

/**
 * Builds a complete co-activation report from Stage-0 Live Docs.
 *
 * The analysis combines dependency-graph edges with shared-test co-occurrence
 * to produce a weighted graph, then applies degree-corrected significance
 * testing and greedy modularity clustering.
 *
 * @param args - Build configuration including Stage-0 docs and weight/threshold params.
 * @returns Complete {@link CoActivationReport} with nodes, edges, and clusters.
 */
export function buildCoActivationReport(args: CoActivationBuildArgs & { now?: () => Date }): CoActivationReport {
  const dependencyWeight = args.dependencyWeight ?? 1;
  const testWeight = args.testWeight ?? 1;
  const minWeight = args.minWeight ?? 0;
  const edgeAlpha = args.edgeAlpha ?? DEFAULT_EDGE_ALPHA;
  const clusterAlpha = args.clusterAlpha ?? DEFAULT_CLUSTER_ALPHA;
  const now = args.now ?? (() => new Date());

  const docMap = new Map<string, Stage0Doc>();
  const docTestMap = new Map<string, Set<string>>();
  for (const doc of args.stage0Docs) {
    docMap.set(doc.sourcePath, doc);
    docTestMap.set(doc.sourcePath, new Set());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 1: Build degree distribution from all dependency edges.
  // This forms the background model for degree-corrected significance testing.
  // Each symbol import counts as a separate edge (MEME-style: 2 motifs = 2 hits).
  // ─────────────────────────────────────────────────────────────────────────
  const degreeDistribution = buildDegreeDistribution(args.stage0Docs, docMap, dependencyWeight);

  const allTests = new Set<string>();
  const edgeAccumulator = new Map<string, EdgeAccumulator>();

  for (const doc of args.stage0Docs) {
    if (!doc.dependencies?.length) {
      continue;
    }
    for (const dependency of doc.dependencies) {
      const targetDoc = docMap.get(dependency);
      if (!targetDoc) {
        continue;
      }
      addEdge(edgeAccumulator, doc.sourcePath, targetDoc.sourcePath, {
        kind: "dependency",
        source: doc.sourcePath,
        dependencyWeight,
        testWeight
      });
    }
  }

  if (args.manifest?.suites) {
    for (const suite of args.manifest.suites) {
      for (const test of suite.tests ?? []) {
        const testPath = (test.path ?? "").replace(/\\/g, "/");
        if (!testPath) {
          continue;
        }
        allTests.add(testPath);

        const targets = new Set<string>();
        for (const rawTarget of test.targets ?? []) {
          const normalized = rawTarget.replace(/\\/g, "/");
          if (docMap.has(normalized)) {
            targets.add(normalized);
            docTestMap.get(normalized)?.add(testPath);
          }
        }

        const orderedTargets = Array.from(targets).sort();
        for (let left = 0; left < orderedTargets.length; left += 1) {
          for (let right = left + 1; right < orderedTargets.length; right += 1) {
            addEdge(edgeAccumulator, orderedTargets[left], orderedTargets[right], {
              kind: "test",
              source: testPath,
              dependencyWeight,
              testWeight
            });
          }
        }
      }
    }
  }

  const edges: CoActivationEdge[] = [];
  for (const [key, entry] of edgeAccumulator.entries()) {
    if (entry.weight < minWeight) {
      continue;
    }
    const [source, target] = key.split(EDGE_KEY_SEPARATOR);
    const dependencySources = Array.from(entry.dependencySources).sort();
    const testSources = Array.from(entry.testSources).sort();
    edges.push({
      source,
      target,
      weight: entry.weight,
      dependencySources,
      testSources,
      sharedTestCount: testSources.length,
      sourceTestCount: 0,
      targetTestCount: 0,
      pValue: null,
      qValue: null,
      isSignificant: dependencySources.length > 0
    });
  }

  edges.sort((left, right) => {
    if (left.source === right.source) {
      return left.target.localeCompare(right.target);
    }
    return left.source.localeCompare(right.source);
  });

  const docTestCounts = new Map<string, number>();
  for (const [docPath, tests] of docTestMap.entries()) {
    docTestCounts.set(docPath, tests.size);
  }

  const totalTests = allTests.size;
  const edgesForBh: Array<{ edge: CoActivationEdge; pValue: number }> = [];

  for (const edge of edges) {
    const sourceTestCount = docTestCounts.get(edge.source) ?? 0;
    const targetTestCount = docTestCounts.get(edge.target) ?? 0;
    edge.sourceTestCount = sourceTestCount;
    edge.targetTestCount = targetTestCount;

    if (edge.sharedTestCount > 0 && totalTests > 0 && sourceTestCount > 0 && targetTestCount > 0) {
      const pValue = hypergeometricTail(totalTests, sourceTestCount, targetTestCount, edge.sharedTestCount);
      edge.pValue = pValue;
      edgesForBh.push({ edge, pValue });
    }
  }

  applyBenjaminiHochberg(edgesForBh);

  for (const { edge } of edgesForBh) {
    if (edge.qValue !== null && edge.qValue <= edgeAlpha) {
      edge.isSignificant = true;
    }
  }

  const significantEdges = edges.filter((edge) => edge.isSignificant);
  const adjacency = new Map<string, Set<string>>();
  const nodeStats = new Map<string, { degree: number; strength: number }>();

  for (const edge of significantEdges) {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);

    const left = nodeStats.get(edge.source) ?? { degree: 0, strength: 0 };
    left.degree += 1;
    left.strength += edge.weight;
    nodeStats.set(edge.source, left);

    const right = nodeStats.get(edge.target) ?? { degree: 0, strength: 0 };
    right.degree += 1;
    right.strength += edge.weight;
    nodeStats.set(edge.target, right);
  }

  const nodes: CoActivationNode[] = args.stage0Docs
    .map((doc) => {
      const stats = nodeStats.get(doc.sourcePath) ?? { degree: 0, strength: 0 };
      return {
        id: doc.sourcePath,
        docRelativePath: doc.docRelativePath,
        archetype: doc.archetype,
        degree: stats.degree,
        strength: stats.strength,
        testCount: docTestCounts.get(doc.sourcePath) ?? 0,
        zScore: 0
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const meanStrength = nodes.reduce((sum, node) => sum + node.strength, 0) / Math.max(nodes.length, 1);
  const variance =
    nodes.reduce((sum, node) => sum + (node.strength - meanStrength) ** 2, 0) / Math.max(nodes.length, 1);
  const stdDev = Math.sqrt(variance);
  for (const node of nodes) {
    node.zScore = stdDev > 0 ? (node.strength - meanStrength) / stdDev : 0;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 3: Build clusters using degree-corrected expected edge counts.
  // Instead of uniform probability, we use: E[edge(i,j)] = deg(i) * deg(j) / (2 * totalEdges)
  // ─────────────────────────────────────────────────────────────────────────
  const clusters = buildClusters({
    nodes,
    edges: significantEdges,
    adjacency,
    degreeDistribution,
    clusterAlpha
  });

  const significantClusterCount = clusters.filter((cluster) => cluster.isSignificant).length;

  return {
    generatedAt: now().toISOString(),
    metrics: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      significantEdgeCount: significantEdges.length,
      clusterCount: clusters.length,
      significantClusterCount,
      dependencyWeight,
      testWeight,
      minWeight,
      edgeAlpha,
      clusterAlpha,
      totalTests,
      totalDependencyEdgeWeight: degreeDistribution.totalEdgeWeight,
      meanDegree: degreeDistribution.meanDegree
    },
    nodes,
    edges,
    clusters
  };
}

/**
 * Serialises a co-activation report to a deterministic JSON string.
 */
export function serializeCoActivationReport(report: CoActivationReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function addEdge(
  accumulator: Map<string, EdgeAccumulator>,
  left: string,
  right: string,
  reason: EdgeReason
): void {
  if (!left || !right || left === right) {
    return;
  }

  const [source, target] = left <= right ? [left, right] : [right, left];
  const key = `${source}${EDGE_KEY_SEPARATOR}${target}`;
  let entry = accumulator.get(key);
  if (!entry) {
    entry = {
      weight: 0,
      dependencySources: new Set<string>(),
      testSources: new Set<string>()
    };
    accumulator.set(key, entry);
  }

  if (reason.kind === "dependency") {
    if (!reason.source) {
      return;
    }
    if (!entry.dependencySources.has(reason.source)) {
      entry.dependencySources.add(reason.source);
      entry.weight += reason.dependencyWeight;
    }
    return;
  }

  if (!reason.source) {
    return;
  }
  if (!entry.testSources.has(reason.source)) {
    entry.testSources.add(reason.source);
    entry.weight += reason.testWeight;
  }
}

function applyBenjaminiHochberg(pairs: Array<{ edge: CoActivationEdge; pValue: number }>): void {
  if (!pairs.length) {
    return;
  }

  const sorted = [...pairs].sort((left, right) => left.pValue - right.pValue);
  const total = sorted.length;
  let minAdjusted = Infinity;

  for (let index = total - 1; index >= 0; index -= 1) {
    const rank = index + 1;
    const p = sorted[index].pValue;
    const adjusted = Math.min((p * total) / rank, minAdjusted);
    const bounded = Math.min(adjusted, 1);
    sorted[index].edge.qValue = bounded;
    minAdjusted = bounded;
  }
}

function hypergeometricTail(total: number, successA: number, successB: number, observed: number): number {
  const upper = Math.min(successA, successB);
  let logSum = Number.NEGATIVE_INFINITY;
  for (let k = observed; k <= upper; k += 1) {
    const logTerm =
      logCombination(successA, k) +
      logCombination(total - successA, successB - k) -
      logCombination(total, successB);
    logSum = logSumExp(logSum, logTerm);
  }
  return Math.min(1, Math.exp(logSum));
}

function logCombination(n: number, k: number): number {
  if (k < 0 || k > n) {
    return Number.NEGATIVE_INFINITY;
  }
  if (k === 0 || k === n) {
    return 0;
  }
  const m = Math.min(k, n - k);
  let result = 0;
  for (let i = 1; i <= m; i += 1) {
    result += Math.log((n - m + i) / i);
  }
  return result;
}

function logSumExp(a: number, b: number): number {
  if (a === Number.NEGATIVE_INFINITY) {
    return b;
  }
  if (b === Number.NEGATIVE_INFINITY) {
    return a;
  }
  if (a < b) {
    return b + Math.log1p(Math.exp(a - b));
  }
  return a + Math.log1p(Math.exp(b - a));
}

/**
 * Build connected components from the significant edge graph.
 * Uses degree-corrected expected edge counts: E[edge(i,j)] = deg(i) * deg(j) / (2E)
 * This prevents hub nodes from making clusters appear artificially significant.
 */
function buildClusters(args: {
  nodes: CoActivationNode[];
  edges: CoActivationEdge[];
  adjacency: Map<string, Set<string>>;
  degreeDistribution: DegreeDistribution;
  clusterAlpha: number;
}): CoActivationCluster[] {
  const { nodes, edges, adjacency, degreeDistribution, clusterAlpha } = args;
  const clusters: CoActivationCluster[] = [];
  const visited = new Set<string>();
  const edgeIndex = new Map<string, CoActivationEdge>();

  for (const edge of edges) {
    edgeIndex.set(edgeKey(edge.source, edge.target), edge);
  }

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue;
    }

    if (!adjacency.has(node.id) || adjacency.get(node.id)!.size === 0) {
      visited.add(node.id);
      continue;
    }

    const members = new Set<string>();
    const queue: string[] = [node.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);
      members.add(current);

      const neighbors = adjacency.get(current);
      if (!neighbors) {
        continue;
      }

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    const memberList = Array.from(members).sort();
    if (memberList.length < 2) {
      continue;
    }

    const clusterEdges = collectClusterEdges(memberList, edgeIndex);
    if (!clusterEdges.length) {
      continue;
    }

    const totalWeight = clusterEdges.reduce((sum, edge) => sum + edge.weight, 0);
    const possibleEdges = (memberList.length * (memberList.length - 1)) / 2;
    const density = possibleEdges === 0 ? 0 : clusterEdges.length / possibleEdges;

    // Degree-corrected expected edge count: sum over all pairs of deg(i)*deg(j)/(2E)
    const expectedEdges = computeDegreeCorrectedExpectedEdges(memberList, degreeDistribution);

    // Use Poisson approximation for significance testing when expected count is small
    // For larger expected counts, binomial approximation with degree-corrected probability
    const pValue = computeDegreeCorrectedPValue(clusterEdges.length, expectedEdges, possibleEdges);

    clusters.push({
      id: `cluster-${String(clusters.length + 1).padStart(3, "0")}`,
      members: memberList,
      weight: totalWeight,
      edgeCount: clusterEdges.length,
      expectedEdgeCount: expectedEdges,
      density,
      pValue,
      qValue: pValue,
      isSignificant: false
    });
  }

  applyClusterBenjaminiHochberg(clusters);

  for (const cluster of clusters) {
    if (cluster.qValue <= clusterAlpha) {
      cluster.isSignificant = true;
    }
  }

  return clusters.sort((left, right) => left.id.localeCompare(right.id));
}

function edgeKey(left: string, right: string): string {
  return left <= right ? `${left}${EDGE_KEY_SEPARATOR}${right}` : `${right}${EDGE_KEY_SEPARATOR}${left}`;
}

function collectClusterEdges(members: string[], edgeIndex: Map<string, CoActivationEdge>): CoActivationEdge[] {
  const result: CoActivationEdge[] = [];
  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const edge = edgeIndex.get(edgeKey(members[i], members[j]));
      if (edge) {
        result.push(edge);
      }
    }
  }
  return result;
}

function _binomialTail(trials: number, probability: number, observed: number): number {
  if (trials <= 0) {
    return 1;
  }
  if (probability <= 0) {
    return observed === 0 ? 1 : 0;
  }
  if (probability >= 1) {
    return observed === trials ? 1 : 0;
  }

  let logSum = Number.NEGATIVE_INFINITY;
  for (let k = observed; k <= trials; k += 1) {
    const logTerm =
      logCombination(trials, k) +
      k * Math.log(probability) +
      (trials - k) * Math.log(1 - probability);
    logSum = logSumExp(logSum, logTerm);
  }
  return Math.min(1, Math.exp(logSum));
}

function applyClusterBenjaminiHochberg(clusters: CoActivationCluster[]): void {
  if (!clusters.length) {
    return;
  }
  const sorted = [...clusters].sort((left, right) => left.pValue - right.pValue);
  const total = sorted.length;
  let minAdjusted = Infinity;

  for (let index = total - 1; index >= 0; index -= 1) {
    const rank = index + 1;
    const p = sorted[index].pValue;
    const adjusted = Math.min((p * total) / rank, minAdjusted);
    const bounded = Math.min(adjusted, 1);
    sorted[index].qValue = bounded;
    minAdjusted = bounded;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Degree-Corrected Background Model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the degree distribution from all dependency edges.
 * Each dependency link (not deduplicated by target) counts as a separate edge.
 * This mirrors the MEME bioinformatics approach: 2 motif instances = 2 hits.
 */
function buildDegreeDistribution(
  stage0Docs: Stage0Doc[],
  docMap: Map<string, Stage0Doc>,
  dependencyWeight: number
): DegreeDistribution {
  const degrees = new Map<string, number>();
  let totalEdgeWeight = 0;

  // Initialize all nodes with degree 0
  for (const doc of stage0Docs) {
    degrees.set(doc.sourcePath, 0);
  }

  // Count edges: each dependency link contributes to both source and target degree
  for (const doc of stage0Docs) {
    if (!doc.dependencies?.length) {
      continue;
    }

    for (const dependency of doc.dependencies) {
      // Only count edges to documents we know about (internal dependencies)
      if (!docMap.has(dependency)) {
        continue;
      }

      // Each dependency occurrence adds weight to both nodes
      const sourceWeight = dependencyWeight;
      degrees.set(doc.sourcePath, (degrees.get(doc.sourcePath) ?? 0) + sourceWeight);
      degrees.set(dependency, (degrees.get(dependency) ?? 0) + sourceWeight);
      totalEdgeWeight += sourceWeight;
    }
  }

  // Compute mean degree
  const nodeCount = stage0Docs.length;
  const meanDegree = nodeCount > 0 ? (2 * totalEdgeWeight) / nodeCount : 0;

  return {
    degrees,
    totalEdgeWeight,
    meanDegree
  };
}

/**
 * Computes degree-corrected expected edge count for a cluster.
 * Uses the configuration model: E[edge(i,j)] = deg(i) * deg(j) / (2E)
 * where E is total edge weight in the graph.
 */
function computeDegreeCorrectedExpectedEdges(
  members: string[],
  distribution: DegreeDistribution
): number {
  if (distribution.totalEdgeWeight === 0) {
    return 0;
  }

  let expected = 0;
  const denominator = 2 * distribution.totalEdgeWeight;

  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const degI = distribution.degrees.get(members[i]) ?? 0;
      const degJ = distribution.degrees.get(members[j]) ?? 0;
      expected += (degI * degJ) / denominator;
    }
  }

  return expected;
}

/**
 * Computes p-value for degree-corrected cluster significance.
 * Uses Poisson approximation when expected count is reasonable,
 * which is appropriate for sparse graphs where edge events are approximately independent.
 */
function computeDegreeCorrectedPValue(
  observedEdges: number,
  expectedEdges: number,
  _possibleEdges: number
): number {
  if (expectedEdges <= 0) {
    // No edges expected: any observed edges are maximally significant
    return observedEdges > 0 ? 0 : 1;
  }

  // Poisson tail: P(X >= observed) where X ~ Poisson(expected)
  // This is 1 - P(X < observed) = 1 - sum_{k=0}^{observed-1} e^(-λ) λ^k / k!
  return poissonTail(expectedEdges, observedEdges);
}

/**
 * Computes Poisson tail probability: P(X >= observed) where X ~ Poisson(lambda).
 * Uses log-space computation for numerical stability.
 */
function poissonTail(lambda: number, observed: number): number {
  if (lambda <= 0) {
    return observed === 0 ? 1 : 0;
  }

  // Compute P(X < observed) = sum_{k=0}^{observed-1} e^(-λ) λ^k / k!
  // Then return 1 - P(X < observed)
  let logCdf = Number.NEGATIVE_INFINITY;
  let logFactorial = 0; // log(0!) = 0

  for (let k = 0; k < observed; k += 1) {
    if (k > 0) {
      logFactorial += Math.log(k);
    }
    const logTerm = -lambda + k * Math.log(lambda) - logFactorial;
    logCdf = logSumExp(logCdf, logTerm);
  }

  const cdf = Math.exp(logCdf);
  return Math.max(0, Math.min(1, 1 - cdf));
}
