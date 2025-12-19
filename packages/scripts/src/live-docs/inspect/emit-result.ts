/**
 * File-level path result emission.
 * 
 * Handles output formatting for file-level (non-symbol) path search results
 * in both human-readable text and JSON formats.
 * 
 * @module inspect/emit-result
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import { describeNode } from "./describe-node";
import { MAX_ENUMERATED_PATHS } from "./pathfind-fanout";
import type { Direction, FanoutPath, HopDescriptor, PathSearchResult } from "./types";

/**
 * Emits a successful path result.
 * 
 * @param pathNodes - Array of node IDs in the path
 * @param direction - Traversal direction used
 * @param graph - The Live Doc graph
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitPathResult(
  pathNodes: string[],
  direction: Direction,
  graph: LiveDocGraph,
  json: boolean,
  verbose: boolean
): void {
  const hops: HopDescriptor[] = [];
  for (let index = 0; index < pathNodes.length - 1; index += 1) {
    const from = pathNodes[index];
    const to = pathNodes[index + 1];
    hops.push({
      from: describeNode(graph, from, verbose),
      to: describeNode(graph, to, verbose)
    });
  }

  if (json) {
    const payload = {
      kind: "path" as const,
      direction,
      length: pathNodes.length - 1,
      from: describeNode(graph, pathNodes[0], verbose),
      to: describeNode(graph, pathNodes[pathNodes.length - 1], verbose),
      nodes: pathNodes.map((node) => describeNode(graph, node, verbose)),
      hops
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Path from ${pathNodes[0]} to ${pathNodes[pathNodes.length - 1]} (${pathNodes.length - 1} hop(s), ${direction}).`
  );
  hops.forEach((hop, index) => {
    const hopNumber = index + 1;
    const fromDoc = hop.from.docPath ? ` [${hop.from.docPath}]` : "";
    const toDoc = hop.to.docPath ? ` [${hop.to.docPath}]` : "";
    console.log(`  ${hopNumber}. ${hop.from.codePath}${fromDoc} -> ${hop.to.codePath}${toDoc}`);
  });
}

/**
 * Emits a "path not found" result with frontier information.
 * 
 * @param from - Source node code path
 * @param to - Target node code path
 * @param direction - Traversal direction used
 * @param graph - The Live Doc graph
 * @param result - The search result with frontier information
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitNotFound(
  from: string,
  to: string,
  direction: Direction,
  graph: LiveDocGraph,
  result: PathSearchResult,
  json: boolean,
  verbose: boolean
): void {
  const frontier = result.frontier;
  const payload = {
    kind: "not-found" as const,
    direction,
    from: describeNode(graph, from, verbose),
    to: describeNode(graph, to, verbose),
    visited: Array.from(result.visited).map((node) => describeNode(graph, node, verbose)),
    frontier: frontier.map((entry) => ({
      node: describeNode(graph, entry.node, verbose),
      reason: entry.reason,
      missingDependency: entry.missingDependency
    }))
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`No dependency path found from ${from} to ${to} (${direction}).`);
  if (payload.frontier.length > 0) {
    console.log("Closest reachable frontier:");
    for (const entry of payload.frontier) {
      const docInfo = entry.node.docPath ? ` [${entry.node.docPath}]` : "";
      const detail = entry.missingDependency ? ` (missing ${entry.missingDependency})` : "";
      console.log(`  - ${entry.node.codePath}${docInfo} — ${entry.reason}${detail}`);
    }
  }
}

/**
 * Emits fanout (terminal paths) result.
 * 
 * @param from - Source node code path
 * @param direction - Traversal direction used
 * @param fanout - Array of terminal paths
 * @param graph - The Live Doc graph
 * @param maxDepth - Maximum depth used
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitFanoutResult(
  from: string,
  direction: Direction,
  fanout: FanoutPath[],
  graph: LiveDocGraph,
  maxDepth: number,
  json: boolean,
  verbose: boolean
): void {
  const payload = {
    kind: "fanout" as const,
    direction,
    from: describeNode(graph, from, verbose),
    maxDepth,
    terminalPaths: fanout.map((entry) => ({
      length: entry.nodes.length - 1,
      nodes: entry.nodes.map((node) => describeNode(graph, node, verbose))
    }))
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Terminal ${direction} paths from ${from} (max depth ${maxDepth}, ${fanout.length} path(s) listed, limit ${MAX_ENUMERATED_PATHS}).`
  );
  fanout.forEach((entry, index) => {
    const step = index + 1;
    const descriptors = entry.nodes
      .map((node) => {
        const descriptor = describeNode(graph, node, verbose);
        return descriptor.docPath ? `${descriptor.codePath} [${descriptor.docPath}]` : descriptor.codePath;
      })
      .join(" -> ");
    console.log(`  ${step}. ${descriptors}`);
  });
}
