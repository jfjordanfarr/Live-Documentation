import path from "node:path";

import { formatRelativePathFromDoc } from "@live-documentation/shared/live-docs/core";
import type { Stage0Doc, Stage0Symbol } from "@live-documentation/shared/live-docs/types";

import {
  MAX_PUBLIC_SYMBOL_ENTRIES,
  MAX_PUBLIC_SYMBOLS_PER_ENTRY,
  VIRTUAL_NODE_PREFIX
} from "./constants";
import { formatMean, formatNumber, formatPercent, formatPValue } from "./formatting";
import type { LiveDocRenderSection, SystemDocPlan, SystemVirtualNode } from "./types";
import { layer3Slug } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// Components Section
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the "Components" section for a System-layer Live Doc.
 *
 * Lists each component path as a relative link to its Stage-0 doc, annotated
 * with strength, degree, test count, z-score, and symbol count metrics.
 */
export function renderComponentsSection(args: {
  plan: SystemDocPlan;
  stage0Docs: Map<string, Stage0Doc>;
  docDir: string;
}): LiveDocRenderSection {
  const lines: string[] = [];
  const ordered = args.plan.componentPaths.filter((path) => args.stage0Docs.has(path));

  for (const sourcePath of ordered) {
    const stage0Doc = args.stage0Docs.get(sourcePath)!;
    const relative = formatRelativePathFromDoc(
      args.docDir,
      stage0Doc.docAbsolutePath
    );
    const metrics = args.plan.nodeMetrics?.[sourcePath];
    const summaryParts: string[] = [];
    if (metrics) {
      summaryParts.push(`strength ${formatNumber(metrics.strength)}`);
      summaryParts.push(`degree ${metrics.degree}`);
      if (metrics.testCount > 0) {
        summaryParts.push(`${formatNumber(metrics.testCount)} tests`);
      }
      if (Math.abs(metrics.zScore) >= 0.05) {
        summaryParts.push(`z ${formatMean(metrics.zScore, 2)}`);
      }
    }
    const symbolCount = stage0Doc.publicSymbols?.length ?? 0;
    if (symbolCount > 0) {
      summaryParts.push(`${formatNumber(symbolCount)} symbols`);
    }
    const suffix = summaryParts.length ? ` — ${summaryParts.join(" · ")}` : "";
    lines.push(`- [${sourcePath}](${relative})${suffix}`);
  }

  if (!lines.length) {
    lines.push("_No components detected_");
  }

  return {
    name: "Components",
    lines
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Topology Section (Mermaid Diagram)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a Mermaid `graph TD` topology section for a System-layer Live Doc.
 *
 * Creates labelled nodes for each Stage-0 doc and virtual node, draws directed
 * edges, and applies archetype-based colour classes (implementation, test, asset,
 * test-summary).  Node labels are disambiguated via {@link buildDocNodeLabels}.
 */
export function renderTopologySection(args: {
  plan: SystemDocPlan;
  stage0Docs: Map<string, Stage0Doc>;
  docDir: string;
}): LiveDocRenderSection {
  const docNodes = new Map<string, Stage0Doc>();
  for (const sourcePath of args.plan.componentPaths) {
    const doc = args.stage0Docs.get(sourcePath);
    if (doc) {
      docNodes.set(sourcePath, doc);
    }
  }

  const virtualNodeMap = new Map<string, SystemVirtualNode>();
  for (const virtualNode of args.plan.virtualNodes ?? []) {
    virtualNodeMap.set(virtualNode.key, virtualNode);
  }

  const edges = new Set<string>();
  for (const edge of args.plan.edgeTuples) {
    if ((docNodes.has(edge.from) || virtualNodeMap.has(edge.from)) && (docNodes.has(edge.to) || virtualNodeMap.has(edge.to))) {
      edges.add(`${edge.from}|${edge.to}`);
    }
  }

  const lines: string[] = [];
  lines.push("```mermaid");
  lines.push("graph TD");

  const nodeIds = new Map<string, string>();
  const archetypeSet = new Set<string>();

  const docLabels = buildDocNodeLabels(Array.from(docNodes.keys()));
  const sortedDocNodes = Array.from(docNodes.entries()).sort((left, right) => left[0].localeCompare(right[0]));
  
  for (const [sourcePath, doc] of sortedDocNodes) {
    const nodeId = `node_doc_${layer3Slug(sourcePath)}`;
    nodeIds.set(sourcePath, nodeId);
    archetypeSet.add(doc.archetype);
    const label = docLabels.get(sourcePath) ?? path.basename(sourcePath);
    const relative = formatRelativePathFromDoc(args.docDir, doc.docAbsolutePath);
    lines.push(`  ${nodeId}["${label}"]`);
    lines.push(`  click ${nodeId} "${relative}" "${label}"`);
  }

  const sortedVirtualNodes = Array.from(virtualNodeMap.values()).sort((left, right) => left.key.localeCompare(right.key));
  for (const node of sortedVirtualNodes) {
    const nodeId = `node_virtual_${layer3Slug(stripVirtualNodePrefix(node.key))}`;
    nodeIds.set(node.key, nodeId);
    archetypeSet.add(node.archetype);
    lines.push(`  ${nodeId}["${node.label}"]`);
  }

  const sortedEdges = Array.from(edges).sort();
  for (const entry of sortedEdges) {
    const [from, to] = entry.split("|");
    const fromId = nodeIds.get(from);
    const toId = nodeIds.get(to);
    if (!fromId || !toId) {
      continue;
    }
    lines.push(`  ${fromId} --> ${toId}`);
  }

  for (const [sourcePath, doc] of sortedDocNodes) {
    const nodeId = nodeIds.get(sourcePath);
    if (!nodeId) {
      continue;
    }
    lines.push(`  class ${nodeId} ${doc.archetype}`);
  }

  for (const node of sortedVirtualNodes) {
    const nodeId = nodeIds.get(node.key);
    if (!nodeId) {
      continue;
    }
    lines.push(`  class ${nodeId} ${node.archetype}`);
  }

  if (archetypeSet.size) {
    lines.push("  %% class definitions");
    if (archetypeSet.has("implementation")) {
      lines.push("  classDef implementation fill:#2563eb,stroke:#0f172a,color:#ffffff");
    }
    if (archetypeSet.has("test")) {
      lines.push("  classDef test fill:#f97316,stroke:#7c2d12,color:#1f2937");
    }
    if (archetypeSet.has("asset")) {
      lines.push("  classDef asset fill:#a855f7,stroke:#581c87,color:#1f2937");
    }
    if (archetypeSet.has("test-summary")) {
      lines.push("  classDef test-summary fill:#facc15,stroke:#92400e,color:#1f2937");
    }
  }

  lines.push("```");

  return {
    name: "Topology",
    lines
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Activation Signals Section
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the "Activation Signals" section for a System-layer Live Doc.
 *
 * Includes cluster membership, coverage ratio, edge statistics, statistical
 * significance (p/q values, density), and ranked top components, cohesion
 * edges, test sources, and dependency sources.
 *
 * @returns The rendered section, or `undefined` if no activation data exists.
 */
export function renderActivationSection(args: { plan: SystemDocPlan }): LiveDocRenderSection | undefined {
  const activation = args.plan.activation;
  if (!activation) {
    return undefined;
  }

  const lines: string[] = [];
  lines.push(`- Cluster: ${activation.clusterId}`);
  lines.push(
    `- Coverage: ${activation.coveredMembers}/${activation.memberCount} (${formatPercent(activation.coverageRatio)})`
  );
  const trimmedSuffix =
    activation.significance && activation.significance.observedEdgeCount > activation.edgeCount
      ? ` (trimmed from ${formatNumber(activation.significance.observedEdgeCount)})`
      : "";
  lines.push(
    `- Edges Considered: ${formatNumber(activation.edgeCount)}${trimmedSuffix} (avg weight ${formatMean(activation.averageWeight)})`
  );
  lines.push(`- Total Weight: ${formatNumber(activation.totalWeight)}`);

  if (activation.significance) {
    const significance = activation.significance;
    lines.push(
      `- Significance: p=${formatPValue(significance.clusterPValue)}, q=${formatPValue(significance.clusterQValue)} (cluster α=${formatMean(significance.clusterAlpha, 3)})`
    );
    lines.push(
      `- Density: ${formatPercent(significance.clusterDensity)} (expected ${formatMean(significance.expectedEdgeCount, 1)} edges vs ${formatNumber(significance.observedEdgeCount)} observed; edge α=${formatMean(significance.edgeAlpha, 3)})`
    );
  }

  if (activation.topComponents.length) {
    lines.push("");
    lines.push("**Top Components (by strength)**");
    for (const component of activation.topComponents) {
      const qualifiers = [
        `strength ${formatNumber(component.strength)}`,
        `degree ${component.degree}`
      ];
      if (component.testCount > 0) {
        qualifiers.push(`${formatNumber(component.testCount)} tests`);
      }
      if (Math.abs(component.zScore) >= 0.05) {
        qualifiers.push(`z ${formatMean(component.zScore, 2)}`);
      }
      lines.push(`- ${component.path} (${qualifiers.join(", ")})`);
    }
  }

  if (activation.topEdges.length) {
    lines.push("");
    lines.push("**Top Cohesion Edges**");
    for (const edge of activation.topEdges) {
      const qualifiers: string[] = [`weight ${formatNumber(edge.weight)}`];
      if (edge.testSources.length) {
        qualifiers.push(`tests ${edge.testSources.length}`);
      }
      if (edge.sharedTestCount > 0) {
        qualifiers.push(`shared hits ${formatNumber(edge.sharedTestCount)}`);
      }
      if (edge.dependencySources.length) {
        qualifiers.push(`deps ${edge.dependencySources.length}`);
      }
      if (edge.pValue !== null) {
        qualifiers.push(`p=${formatPValue(edge.pValue)}`);
      }
      if (edge.qValue !== null) {
        qualifiers.push(`q=${formatPValue(edge.qValue)}`);
      }
      lines.push(`- ${edge.source} ↔ ${edge.target} (${qualifiers.join(", ")})`);
    }
  }

  if (activation.topTestSources.length) {
    lines.push("");
    lines.push("**Top Test Sources**");
    for (const entry of activation.topTestSources) {
      lines.push(`- ${entry.path} (${formatNumber(entry.count)})`);
    }
  }

  if (activation.topDependencySources.length) {
    lines.push("");
    lines.push("**Top Dependency Sources**");
    for (const entry of activation.topDependencySources) {
      lines.push(`- ${entry.path} (${formatNumber(entry.count)})`);
    }
  }

  return {
    name: "Activation Signals",
    lines
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Symbols Section
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the "Public Surface" section for a System-layer Live Doc.
 *
 * Lists components by descending public-symbol count, up to
 * {@link MAX_PUBLIC_SYMBOL_ENTRIES} entries with {@link MAX_PUBLIC_SYMBOLS_PER_ENTRY}
 * sample names per line.
 *
 * @returns The rendered section, or `undefined` if no components expose symbols.
 */
export function renderPublicSymbolsSection(args: {
  plan: SystemDocPlan;
  stage0Docs: Map<string, Stage0Doc>;
}): LiveDocRenderSection | undefined {
  const entries: Array<{ path: string; symbols: Stage0Symbol[] }> = [];
  for (const sourcePath of args.plan.componentPaths) {
    const doc = args.stage0Docs.get(sourcePath);
    if (!doc?.publicSymbols?.length) {
      continue;
    }
    entries.push({ path: sourcePath, symbols: doc.publicSymbols });
  }

  if (!entries.length) {
    return undefined;
  }

  entries.sort((left, right) => {
    if (left.symbols.length === right.symbols.length) {
      return left.path.localeCompare(right.path);
    }
    return right.symbols.length - left.symbols.length;
  });

  const limited = entries.slice(0, MAX_PUBLIC_SYMBOL_ENTRIES);
  const lines: string[] = [];

  for (const entry of limited) {
    const sample = entry.symbols
      .slice(0, MAX_PUBLIC_SYMBOLS_PER_ENTRY)
      .map((symbol) => symbol.name)
      .join(", ");
    const remainder = entry.symbols.length - Math.min(entry.symbols.length, MAX_PUBLIC_SYMBOLS_PER_ENTRY);
    const suffix = remainder > 0 ? `, ... +${formatNumber(remainder)} more` : "";
    lines.push(`- ${entry.path} (${formatNumber(entry.symbols.length)} symbols) – ${sample}${suffix}`);
  }

  if (entries.length > limited.length) {
    lines.push(
      `- ... ${formatNumber(entries.length - limited.length)} additional components with public symbols`
    );
  }

  return {
    name: "Public Surface",
    lines
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function buildDocNodeLabels(paths: string[]): Map<string, string> {
  const groups = new Map<string, string[]>();
  for (const sourcePath of paths) {
    const base = path.basename(sourcePath);
    const bucket = groups.get(base) ?? [];
    bucket.push(sourcePath);
    groups.set(base, bucket);
  }

  const labels = new Map<string, string>();
  const used = new Set<string>();

  for (const [, groupPaths] of groups) {
    if (groupPaths.length === 1) {
      const [only] = groupPaths;
      const label = path.basename(only);
      labels.set(only, label);
      used.add(label);
      continue;
    }

    for (const sourcePath of groupPaths) {
      const segments = sourcePath.split("/").filter(Boolean);
      let depth = 2;
      let candidate = segments.slice(-depth).join("/");
      while (used.has(candidate) && depth < segments.length) {
        depth += 1;
        candidate = segments.slice(-depth).join("/");
      }
      if (used.has(candidate)) {
        candidate = sourcePath;
      }
      labels.set(sourcePath, candidate);
      used.add(candidate);
    }
  }

  return labels;
}

function stripVirtualNodePrefix(candidate: string): string {
  return candidate.slice(VIRTUAL_NODE_PREFIX.length);
}

// buildDocNodeLabels and stripVirtualNodePrefix are intentionally module-private;
// they are only used within this file's render functions.
