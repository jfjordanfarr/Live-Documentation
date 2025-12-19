/**
 * Terminal path enumeration (fanout) for graph traversal.
 * 
 * Enumerates all paths from a source node to terminal nodes (nodes with no
 * further neighbors in the specified direction).
 * 
 * @module inspect/pathfind-fanout
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import { getNeighbors } from "./pathfind";
import type { Direction, FanoutPath } from "./types";

/**
 * Maximum number of paths to enumerate to avoid combinatorial explosion.
 */
export const MAX_ENUMERATED_PATHS = 200;

/**
 * Enumerates all paths from a source node to terminal nodes.
 * 
 * A terminal node is one that has no neighbors in the specified direction,
 * or the path has reached the maximum depth.
 * 
 * @param graph - The Live Doc graph
 * @param start - Starting node code path
 * @param direction - Traversal direction
 * @param maxDepth - Maximum traversal depth
 * @returns Array of terminal paths (limited to MAX_ENUMERATED_PATHS)
 */
export function enumerateTerminalPaths(
  graph: LiveDocGraph,
  start: string,
  direction: Direction,
  maxDepth: number
): FanoutPath[] {
  const results: FanoutPath[] = [];
  const stack: Array<{ path: string[] }> = [{ path: [start] }];

  while (stack.length > 0 && results.length < MAX_ENUMERATED_PATHS) {
    const current = stack.pop()!;
    const node = current.path[current.path.length - 1];
    const neighbors = Array.from(getNeighbors(graph, node, direction));
    const available = neighbors.filter((neighbor) => !current.path.includes(neighbor));

    if (available.length === 0 || current.path.length - 1 >= maxDepth) {
      results.push({ nodes: current.path });
      continue;
    }

    for (const neighbor of available) {
      stack.push({ path: [...current.path, neighbor] });
    }
  }

  return results;
}
