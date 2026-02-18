import type {
  CoActivationEdge,
  CoActivationReport
} from "@live-documentation/shared/live-docs/analysis/coActivation";
import type { Stage0Doc } from "@live-documentation/shared/live-docs/types";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

import {
  LAYER3_PREFIX,
  MAX_ACTIVATION_TOP_EDGES,
  MAX_ACTIVATION_TOP_SOURCES,
  MAX_CLUSTER_COMPONENTS,
  MAX_TOPOLOGY_EDGES,
  MIN_CLUSTER_MEMBER_COUNT,
  MIN_CLUSTER_TOTAL_WEIGHT
} from "../constants";
import type {
  NodeMetric,
  PlanActivationSourceSummary,
  PlanActivationSummary,
  SystemDocPlan
} from "../types";
import { formatDisplayName, layer3Slug } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Co-Activation Plan Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds System-layer co-activation plans from clustered edge data.
 *
 * Each significant cluster above the minimum member/weight thresholds
 * produces one {@link SystemDocPlan} with ranked components, edges,
 * test sources, and dependency sources.
 */
export function buildCoActivationPlans(args: {
  stage0Docs: Stage0Doc[];
  stage0PathSet: Set<string>;
  coActivation?: CoActivationReport;
}): SystemDocPlan[] {
  if (!args.coActivation) {
    return [];
  }

  const docMap = new Map(args.stage0Docs.map((doc) => [doc.sourcePath, doc] as const));
  const nodeMetricMap = new Map<string, NodeMetric>();
  
  for (const node of args.coActivation.nodes ?? []) {
    const normalizedId = normalizeWorkspacePath(node.id);
    nodeMetricMap.set(normalizedId, {
      degree: node.degree,
      strength: node.strength,
      testCount: node.testCount,
      zScore: node.zScore
    });
  }

  const plans: SystemDocPlan[] = [];

  for (const cluster of args.coActivation.clusters ?? []) {
    const normalizedMembers = cluster.members
      .map((member) => normalizeWorkspacePath(member))
      .filter((member) => args.stage0PathSet.has(member));

    const uniqueMembers = Array.from(new Set(normalizedMembers));
    if (uniqueMembers.length < MIN_CLUSTER_MEMBER_COUNT) {
      continue;
    }

    const memberSet = new Set(uniqueMembers);

    if (args.coActivation.metrics && !cluster.isSignificant) {
      continue;
    }

    const clusterEdges: CoActivationEdge[] = [];
    for (const edge of args.coActivation.edges ?? []) {
      const source = normalizeWorkspacePath(edge.source);
      const target = normalizeWorkspacePath(edge.target);
      if (!memberSet.has(source) || !memberSet.has(target)) {
        continue;
      }
      if (!edge.isSignificant) {
        continue;
      }
      const dependencySources = [...edge.dependencySources]
        .map((entry) => normalizeWorkspacePath(entry))
        .sort();
      const testSources = [...edge.testSources]
        .map((entry) => normalizeWorkspacePath(entry))
        .sort();
      clusterEdges.push({
        source,
        target,
        weight: edge.weight,
        dependencySources,
        testSources,
        sharedTestCount: edge.sharedTestCount,
        sourceTestCount: edge.sourceTestCount,
        targetTestCount: edge.targetTestCount,
        pValue: edge.pValue,
        qValue: edge.qValue,
        isSignificant: edge.isSignificant
      });
    }

    if (!clusterEdges.length) {
      continue;
    }

    const totalWeight = clusterEdges.reduce((sum, edge) => sum + edge.weight, 0);
    if (totalWeight < MIN_CLUSTER_TOTAL_WEIGHT) {
      continue;
    }

    const rankedMembers = rankMembersByMetrics(uniqueMembers, nodeMetricMap);
    const selectedMembers = rankedMembers.slice(0, MAX_CLUSTER_COMPONENTS);
    const componentSet = new Set(selectedMembers);

    const nodeMetrics: Record<string, NodeMetric> = {};
    for (const member of selectedMembers) {
      nodeMetrics[member] =
        nodeMetricMap.get(member) ?? {
          degree: 0,
          strength: 0,
          testCount: 0,
          zScore: 0
        };
    }

    const relevantEdges = clusterEdges.filter((edge) => componentSet.has(edge.source) && componentSet.has(edge.target));
    if (!relevantEdges.length) {
      continue;
    }

    const sortedRelevantEdges = sortEdgesByWeight(relevantEdges);
    const trimmedEdges = sortedRelevantEdges.slice(0, MAX_TOPOLOGY_EDGES);
    const edgeTuples = trimmedEdges
      .map((edge) => ({ from: edge.source, to: edge.target }))
      .sort((left, right) => (left.from === right.from ? left.to.localeCompare(right.to) : left.from.localeCompare(right.from)));

    const { slugBase, displayName } = deriveClusterIdentity(selectedMembers, nodeMetrics, cluster.id);
    const slugSeed = `${cluster.id}-${slugBase}`;
    const slug = layer3Slug(slugSeed);
    const titleSuffix = `${displayName} Integration Cluster`;

    const topComponents = rankedMembers
      .slice(0, Math.min(rankedMembers.length, MAX_ACTIVATION_TOP_SOURCES))
      .map((member) => {
        const metric =
          nodeMetricMap.get(member) ?? {
            degree: 0,
            strength: 0,
            testCount: 0,
            zScore: 0
          };
        return {
          path: member,
          strength: metric.strength,
          degree: metric.degree,
          testCount: metric.testCount,
          zScore: metric.zScore
        };
      });

    const topEdges = sortedRelevantEdges.slice(0, MAX_ACTIVATION_TOP_EDGES).map((edge) => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      testSources: edge.testSources,
      dependencySources: edge.dependencySources,
      sharedTestCount: edge.sharedTestCount,
      pValue: edge.pValue,
      qValue: edge.qValue
    }));

    const topTestSources = collectTopSources(relevantEdges, "testSources");
    const topDependencySources = collectTopSources(relevantEdges, "dependencySources");

    const componentPaths = [...selectedMembers].sort();
    const averageWeight = relevantEdges.length ? totalWeight / relevantEdges.length : 0;
    const reportMetrics = args.coActivation.metrics;
    const significance = reportMetrics
      ? {
          edgeAlpha: reportMetrics.edgeAlpha ?? 0.01,
          clusterAlpha: reportMetrics.clusterAlpha ?? 0.01,
          clusterPValue: cluster.pValue ?? Number.NaN,
          clusterQValue: cluster.qValue ?? Number.NaN,
          clusterDensity: cluster.density ?? 0,
          expectedEdgeCount: cluster.expectedEdgeCount ?? 0,
          observedEdgeCount: cluster.edgeCount ?? relevantEdges.length,
          selectedEdgeCount: relevantEdges.length
        }
      : undefined;
    
    const activation: PlanActivationSummary = {
      clusterId: cluster.id,
      memberCount: memberSet.size,
      coveredMembers: selectedMembers.length,
      coverageRatio: selectedMembers.length / memberSet.size,
      totalWeight,
      averageWeight,
      edgeCount: relevantEdges.length,
      topComponents,
      topEdges,
      topTestSources,
      topDependencySources,
      significance
    };

    const hasRenderableDocs = componentPaths.every((path) => docMap.has(path));
    if (!hasRenderableDocs) {
      continue;
    }

    plans.push({
      id: `${LAYER3_PREFIX.integration}-${slug}`,
      archetype: "integration",
      slug,
      titleSuffix,
      componentPaths,
      edgeTuples,
      activation,
      nodeMetrics
    });
  }

  return plans;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function rankMembersByMetrics(members: string[], nodeMetricMap: Map<string, NodeMetric>): string[] {
  return [...members].sort((left, right) => {
    const leftMetric =
      nodeMetricMap.get(left) ?? {
        degree: 0,
        strength: 0,
        testCount: 0,
        zScore: 0
      };
    const rightMetric =
      nodeMetricMap.get(right) ?? {
        degree: 0,
        strength: 0,
        testCount: 0,
        zScore: 0
      };

    if (leftMetric.zScore !== rightMetric.zScore) {
      return rightMetric.zScore - leftMetric.zScore;
    }
    if (leftMetric.strength !== rightMetric.strength) {
      return rightMetric.strength - leftMetric.strength;
    }
    if (leftMetric.degree !== rightMetric.degree) {
      return rightMetric.degree - leftMetric.degree;
    }
    return left.localeCompare(right);
  });
}

function sortEdgesByWeight(edges: CoActivationEdge[]): CoActivationEdge[] {
  return [...edges].sort((left, right) => {
    if (left.weight === right.weight) {
      if (left.source === right.source) {
        return left.target.localeCompare(right.target);
      }
      return left.source.localeCompare(right.source);
    }
    return right.weight - left.weight;
  });
}

/** Derives a human-readable slug and display name for a cluster from its top-ranked component path. */
export function deriveClusterIdentity(
  componentPaths: string[],
  nodeMetrics: Record<string, NodeMetric>,
  clusterId: string
): { slugBase: string; displayName: string } {
  if (!componentPaths.length) {
    return {
      slugBase: clusterId,
      displayName: formatDisplayName(clusterId)
    };
  }

  const weightByPrefix = new Map<string, number>();

  for (const pathCandidate of componentPaths) {
    const segments = pathCandidate.split("/").filter(Boolean);
    if (!segments.length) {
      continue;
    }

    const metric = nodeMetrics[pathCandidate];
    const weight = metric?.strength && metric.strength > 0 ? metric.strength : 1;

    const prefixes: string[] = [];
    if (segments.length >= 2) {
      prefixes.push(`${segments[0]}/${segments[1]}`);
    }
    prefixes.push(segments[0]);

    for (const prefix of prefixes) {
      weightByPrefix.set(prefix, (weightByPrefix.get(prefix) ?? 0) + weight);
    }
  }

  if (!weightByPrefix.size) {
    return {
      slugBase: clusterId,
      displayName: formatDisplayName(clusterId)
    };
  }

  const [bestPrefix] = Array.from(weightByPrefix.entries()).sort((left, right) => {
    if (left[1] === right[1]) {
      return left[0].localeCompare(right[0]);
    }
    return right[1] - left[1];
  })[0];

  return {
    slugBase: bestPrefix,
    displayName: formatDisplayName(bestPrefix)
  };
}

/** Tallies test or dependency sources across a set of co-activation edges, returning ranked summaries. */
export function collectTopSources(
  edges: CoActivationEdge[],
  key: "testSources" | "dependencySources"
): PlanActivationSourceSummary[] {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    for (const source of edge[key]) {
      if (!source) {
        continue;
      }
      const normalized = normalizeWorkspacePath(source);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => {
      if (left[1] === right[1]) {
        return left[0].localeCompare(right[0]);
      }
      return right[1] - left[1];
    })
    .slice(0, MAX_ACTIVATION_TOP_SOURCES)
    .map(([path, count]) => ({ path, count }));
}
