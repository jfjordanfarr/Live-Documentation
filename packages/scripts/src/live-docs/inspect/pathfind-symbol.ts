/**
 * Symbol-aware graph pathfinding using BFS.
 * 
 * Extends the file-level pathfinding to track symbol transitions through
 * the graph's rawDependencies edges.
 * 
 * @module inspect/pathfind-symbol
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import { symbolMatchesAnchor } from "./symbol-reference";
import type { Direction, SymbolHop, SymbolPathSearchResult, SymbolReference } from "./types";

/**
 * Symbol-aware path search using BFS.
 * 
 * When both from and to have symbols, finds a path where:
 * - The first hop originates from the fromSymbol (via sourceAnchor)
 * - The last hop arrives at the toSymbol (via anchor)
 * 
 * The algorithm tracks symbol transitions through the graph's rawDependencies.
 * 
 * @param graph - The Live Doc graph
 * @param from - Source symbol reference
 * @param to - Target symbol reference
 * @param direction - "outbound" or "inbound"
 * @param maxDepth - Maximum traversal depth
 * @returns Search result with path and found status
 */
export function searchSymbolPath(
  graph: LiveDocGraph,
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  maxDepth: number
): SymbolPathSearchResult {
  // Create a composite key for visited tracking using normalized anchors
  const makeKey = (hop: SymbolHop): string => 
    hop.symbol ? `${hop.codePath}#${hop.symbol.toLowerCase()}` : hop.codePath;

  const startHop: SymbolHop = { codePath: from.codePath, symbol: from.symbol };
  const visited = new Set<string>([makeKey(startHop)]);
  const queue: Array<{ hop: SymbolHop; path: SymbolHop[]; depth: number }> = [
    { hop: startHop, path: [startHop], depth: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check if we've reached the target
    if (current.hop.codePath === to.codePath) {
      // If to has a symbol, we need to match it (handle anchor format differences)
      if (!to.symbol) {
        return { path: current.path, found: true };
      }
      // Use symbolMatchesAnchor to handle format differences between user input and anchor slugs
      if (current.hop.symbol && symbolMatchesAnchor(to.symbol, current.hop.symbol)) {
        return { path: current.path, found: true };
      }
      // Also check direct match for when both are symbol names (sourceAnchor case)
      if (current.hop.symbol === to.symbol) {
        return { path: current.path, found: true };
      }
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    // Get symbol-aware neighbors
    const neighbors = getSymbolNeighbors(graph, current.hop, direction);

    for (const neighbor of neighbors) {
      const key = makeKey(neighbor);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push({
        hop: neighbor,
        path: [...current.path, neighbor],
        depth: current.depth + 1
      });
    }
  }

  return { path: undefined, found: false };
}

/**
 * Gets symbol-aware neighbors for a given hop.
 * 
 * For outbound direction:
 * - If current hop has a symbol, only follow edges where sourceAnchor matches
 * - Returns the target codePath and anchor (target symbol)
 * 
 * For inbound direction:
 * - If current hop has a symbol, only follow edges where anchor matches
 * - Returns the source codePath and sourceAnchor
 * 
 * @param graph - The Live Doc graph
 * @param current - Current hop position
 * @param direction - Traversal direction
 * @returns Array of neighboring symbol hops
 */
export function getSymbolNeighbors(
  graph: LiveDocGraph,
  current: SymbolHop,
  direction: Direction
): SymbolHop[] {
  const neighbors: SymbolHop[] = [];
  const node = graph.nodes.get(current.codePath);
  
  if (!node) {
    return neighbors;
  }

  if (direction === "outbound") {
    // Look at rawDependencies from this node
    for (const dep of node.rawDependencies) {
      if (!dep.codePath || !graph.nodes.has(dep.codePath)) {
        continue;
      }

      // If current hop has a symbol, only follow edges from that symbol
      if (current.symbol && dep.sourceAnchor && dep.sourceAnchor !== current.symbol) {
        continue;
      }

      // Add the neighbor with its target symbol (anchor)
      neighbors.push({
        codePath: dep.codePath,
        symbol: dep.anchor
      });
    }

    // Also add file-level dependencies if no symbol filter or symbol matches
    if (!current.symbol) {
      for (const depPath of node.dependencies) {
        if (!neighbors.some(n => n.codePath === depPath)) {
          neighbors.push({ codePath: depPath });
        }
      }
    }
  } else {
    // Inbound: look at nodes that depend on this one
    const inboundNodes = graph.inbound.get(current.codePath) ?? new Set<string>();
    
    for (const srcPath of inboundNodes) {
      const srcNode = graph.nodes.get(srcPath);
      if (!srcNode) {
        continue;
      }

      // Find edges from srcNode that point to current node
      for (const dep of srcNode.rawDependencies) {
        if (dep.codePath !== current.codePath) {
          continue;
        }

        // If current hop has a symbol, only follow edges to that symbol
        // Use symbolMatchesAnchor to handle format differences (user's symbol vs anchor slug)
        if (current.symbol && dep.anchor && !symbolMatchesAnchor(current.symbol, dep.anchor)) {
          continue;
        }

        // Add the source with its sourceAnchor
        neighbors.push({
          codePath: srcPath,
          symbol: dep.sourceAnchor
        });
      }

      // Also add file-level if no symbol filter
      if (!current.symbol && !neighbors.some(n => n.codePath === srcPath)) {
        neighbors.push({ codePath: srcPath });
      }
    }
  }

  return neighbors;
}
