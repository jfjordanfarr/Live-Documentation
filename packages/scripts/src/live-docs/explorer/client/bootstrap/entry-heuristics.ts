/**
 * Entry Node Heuristics
 * 
 * Heuristics for inferring which node to focus on startup when no specific
 * node is requested via URL or config. Uses a combination of:
 * - Filename patterns (main.ts, index.ts, etc.)
 * - Path conventions (src/, packages/)
 * - Graph centrality (degree count)
 * - Archetype scoring (implementation > config > test)
 */

import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";

/** Resolver for link endpoints to node IDs */
export type LinkEndpointResolver = (endpoint: ExplorerLinkPayload["source"]) => string;

/**
 * Path fragments that indicate non-entry-point locations.
 * Files under these paths are heavily penalized in entry heuristics.
 */
const EXCLUDED_PATH_FRAGMENTS = [
  "/node_modules/",
  "/dist/",
  "/build/",
  "/coverage/",
  "/.git/",
  "/.live-documentation/",
  "/.mdmd/",
  "/docs/",
  "/specs/",
  "/ai-agent-workspace/",
  "/tests/",
  "/test/",
  "/__tests__/"
];

/**
 * Score a node for entry-point likelihood.
 * Higher scores indicate more likely entry points.
 * 
 * @param node - The node to score
 * @param degreeById - Pre-computed degree counts for graph centrality
 * @returns A score, with negative values indicating exclusion
 */
export const scoreNode = (
  node: ExplorerNodePayload,
  degreeById: Map<string, number>
): number => {
  const archetype = (node.archetype || "").toLowerCase();
  const path = (node.codeRelativePath || node.codePath || node.id || "").replace(/\\/g, "/").toLowerCase();
  const basename = path.split("/").pop() ?? "";

  // Hard excludes
  if (EXCLUDED_PATH_FRAGMENTS.some(fragment => path.includes(fragment))) {
    return -1_000_000;
  }
  if (archetype === "test") {
    return -500_000;
  }
  if (archetype === "asset") {
    return -200_000;
  }

  let score = 0;

  // Prefer implementation-ish nodes (when archetype is reliable)
  if (archetype === "implementation") {
    score += 150;
  } else if (archetype === "script") {
    score += 50;
  } else if (archetype === "config") {
    score -= 50;
  }

  // Entry-point filename heuristics (cross-language, case-insensitive)
  if (basename === "main.ts" || basename === "main.js") score += 1200;
  if (basename === "index.ts" || basename === "index.js") score += 1000;
  if (basename === "app.ts" || basename === "app.js") score += 900;
  if (basename === "server.ts" || basename === "server.js") score += 850;
  if (basename === "extension.ts" || basename === "extension.js") score += 800;
  if (basename === "cli.ts" || basename === "cli.js") score += 750;
  if (basename === "program.cs") score += 1200;
  if (basename === "startup.cs") score += 1100;
  if (basename === "global.asax.cs") score += 950;

  // Prefer conventional src locations
  if (path.includes("/src/")) score += 150;
  if (path.endsWith("/src/main.ts") || path.endsWith("/src/main.js")) score += 200;
  if (path.endsWith("/src/index.ts") || path.endsWith("/src/index.js")) score += 150;

  // Prefer common monorepo entry packages (small nudges; not required)
  if (path.startsWith("packages/server/")) score += 120;
  if (path.startsWith("packages/extension/")) score += 90;
  if (path.startsWith("packages/cli/")) score += 70;

  // Graph centrality as a tie-breaker signal
  score += Math.min(300, degreeById.get(node.id) ?? 0);

  // Shallow paths are often entrypoints
  const depth = path.split("/").filter(Boolean).length;
  score += Math.max(0, 20 - depth);

  return score;
};

/**
 * Build a degree map for all nodes in the graph.
 * Counts both inbound and outbound links for each node.
 */
export const buildDegreeMap = (
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: LinkEndpointResolver,
  nodesById: Map<string, ExplorerNodePayload>
): Map<string, number> => {
  const degreeById = new Map<string, number>();
  
  for (const link of graphData.links) {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    if (nodesById.has(sourceId)) {
      degreeById.set(sourceId, (degreeById.get(sourceId) ?? 0) + 1);
    }
    if (nodesById.has(targetId)) {
      degreeById.set(targetId, (degreeById.get(targetId) ?? 0) + 1);
    }
  }
  
  return degreeById;
};

/**
 * Infer the best default entry node when none is specified.
 * Returns null if no suitable node can be found.
 */
export const inferDefaultEntryNodeId = (
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: LinkEndpointResolver,
  nodesById: Map<string, ExplorerNodePayload>
): string | null => {
  if (!graphData.nodes || graphData.nodes.length === 0) {
    return null;
  }

  const degreeById = buildDegreeMap(graphData, resolveLinkEndpoint, nodesById);

  let best: { nodeId: string; score: number; path: string } | null = null;
  for (const node of graphData.nodes) {
    const score = scoreNode(node, degreeById);
    const path = (node.codeRelativePath || node.codePath || node.id || "").replace(/\\/g, "/");
    if (!best || score > best.score || (score === best.score && path.localeCompare(best.path) < 0)) {
      best = { nodeId: node.id, score, path };
    }
  }

  if (!best || best.score < 0) {
    return null;
  }
  return best.nodeId;
};
