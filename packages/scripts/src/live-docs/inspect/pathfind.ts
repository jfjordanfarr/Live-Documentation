/**
 * File-level graph pathfinding using BFS.
 * 
 * Provides breadth-first search for finding paths between nodes in the
 * Live Doc dependency graph at the file level (not symbol-aware).
 * 
 * @module inspect/pathfind
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import type { Direction, FrontierEntry, PathSearchResult } from "./types";

/**
 * Performs a BFS search from a source node to a target node.
 * 
 * @param graph - The Live Doc graph
 * @param from - Source node code path
 * @param to - Target node code path
 * @param direction - "outbound" follows dependencies, "inbound" follows dependents
 * @param maxDepth - Maximum traversal depth
 * @returns Search result with path (if found), visited nodes, and frontier
 */
export function searchGraph(
  graph: LiveDocGraph,
  from: string,
  to: string,
  direction: Direction,
  maxDepth: number
): PathSearchResult {
  const visited = new Set<string>([from]);
  const queue: Array<{ node: string; depth: number }> = [{ node: from, depth: 0 }];
  const parents = new Map<string, string>();
  const frontierMap = new Map<string, FrontierEntry>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.node === to) {
      const pathNodes = reconstructPath(parents, from, to);
      return { path: pathNodes, visited, frontier: [] };
    }

    const neighbors = getNeighbors(graph, current.node, direction);

    if (current.depth >= maxDepth) {
      frontierMap.set(`${current.node}|max-depth`, {
        node: current.node,
        docPath: graph.nodes.get(current.node)?.docPath,
        reason: "max-depth"
      });
      continue;
    }

    let enqueued = false;
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      parents.set(neighbor, current.node);
      queue.push({ node: neighbor, depth: current.depth + 1 });
      enqueued = true;
    }

    if (!enqueued) {
      frontierMap.set(`${current.node}|terminal`, {
        node: current.node,
        docPath: graph.nodes.get(current.node)?.docPath,
        reason: "terminal"
      });
    }
  }

  // Add missing dependency entries for outbound searches
  if (direction === "outbound") {
    for (const node of visited) {
      const graphNode = graph.nodes.get(node);
      if (!graphNode) {
        continue;
      }
      for (const dependency of graphNode.rawDependencies) {
        const targetId = dependency.codePath;
        if (!targetId || !graph.nodes.has(targetId)) {
          const missingKey = targetId ?? dependency.raw;
          frontierMap.set(`${node}|missing|${missingKey}`, {
            node,
            docPath: graphNode.docPath,
            reason: "missing-doc",
            missingDependency: missingKey
          });
        }
      }
    }
  }

  return { path: undefined, visited, frontier: Array.from(frontierMap.values()) };
}

/**
 * Gets the neighbors of a node based on traversal direction.
 * 
 * @param graph - The Live Doc graph
 * @param node - The node to get neighbors for
 * @param direction - "outbound" for dependencies, "inbound" for dependents
 * @returns Set of neighbor node code paths
 */
export function getNeighbors(
  graph: LiveDocGraph,
  node: string,
  direction: Direction
): Set<string> {
  if (direction === "outbound") {
    return graph.nodes.get(node)?.dependencies ?? new Set<string>();
  }
  return graph.inbound.get(node) ?? new Set<string>();
}

/**
 * Reconstructs a path from the parent map built during BFS.
 * 
 * @param parents - Map from node to its parent in the BFS tree
 * @param start - Start node
 * @param target - End node
 * @returns Array of node IDs from start to target
 */
export function reconstructPath(
  parents: Map<string, string>,
  start: string,
  target: string
): string[] {
  const reversed: string[] = [target];
  let cursor = target;
  while (cursor !== start) {
    const parent = parents.get(cursor);
    if (!parent) {
      break;
    }
    reversed.push(parent);
    cursor = parent;
  }
  return reversed.reverse();
}
