/**
 * Pathfinding over the graph index.
 *
 * @remarks
 * Breadth-first search for the shortest path between two files, the same
 * search by symbol, and the enumeration of every terminal path away from a
 * file. Pure functions over a {@link LiveDocGraph}, for the CLI and the
 * Explorer alike.
 *
 * @module
 */

import type { LiveDocGraph } from "./graph";

/** Traversal direction for graph searches. */
export type Direction = "outbound" | "inbound" | "both";

/** Entry in the search frontier, representing a node that couldn't be explored further. */
export interface FrontierEntry {
  node: string;
  docPath?: string;
  reason: "terminal" | "max-depth" | "missing-doc";
  missingDependency?: string;
}

/** Result of a file-level path search. */
export interface PathSearchResult {
  path?: string[];
  visited: Set<string>;
  frontier: FrontierEntry[];
}

/** A terminal path in fanout enumeration. */
export interface FanoutPath {
  nodes: string[];
}

/** A reference that may include a symbol (e.g., "file.ts#SymbolName"). */
export interface SymbolReference {
  codePath: string;
  symbol?: string;
}

/** A node in a symbol-aware path, tracking both file and symbol at each hop. */
export interface SymbolHop {
  codePath: string;
  symbol?: string;
}

/** Result of a symbol-aware path search. */
export interface SymbolPathSearchResult {
  path?: SymbolHop[];
  found: boolean;
}

/** Maximum number of paths to enumerate to avoid combinatorial explosion. */
export const MAX_ENUMERATED_PATHS = 200;

// ============================================================================
// File-level search
// ============================================================================

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
      return { path: reconstructPath(parents, from, to), visited, frontier: [] };
    }

    const neighbors = getNeighbors(graph, current.node, direction);

    if (current.depth >= maxDepth) {
      frontierMap.set(`${current.node}|max-depth`, {
        node: current.node,
        docPath: graph.files[current.node]?.docPath,
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
        docPath: graph.files[current.node]?.docPath,
        reason: "terminal"
      });
    }
  }

  // An outbound search also reports what could not be followed: dependencies that resolved to no file.
  if (direction === "outbound") {
    for (const node of visited) {
      const file = graph.files[node];
      if (!file) {
        continue;
      }
      for (const edge of file.edges) {
        if (!edge.to) {
          frontierMap.set(`${node}|missing|${edge.label}`, {
            node,
            docPath: file.docPath,
            reason: "missing-doc",
            missingDependency: edge.label
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
 * @returns The neighbouring code paths
 */
export function getNeighbors(graph: LiveDocGraph, node: string, direction: Direction): readonly string[] {
  const file = graph.files[node];
  if (!file) {
    return [];
  }
  return direction === "outbound" ? file.outbound : file.inbound;
}

function reconstructPath(parents: Map<string, string>, start: string, target: string): string[] {
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
    const available = getNeighbors(graph, node, direction).filter((neighbor) => !current.path.includes(neighbor));

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

// ============================================================================
// Symbol-level search
// ============================================================================

/**
 * Symbol-aware path search using BFS.
 *
 * When both from and to have symbols, finds a path where the first hop
 * originates from the fromSymbol (the edge's `from`) and the last hop arrives
 * at the toSymbol (the edge's `toSymbol`), following the graph's edges by
 * symbol anchor at both ends.
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
  const makeKey = (hop: SymbolHop): string =>
    hop.symbol ? `${hop.codePath}#${hop.symbol.toLowerCase()}` : hop.codePath;

  const startHop: SymbolHop = { codePath: from.codePath, symbol: from.symbol };
  const visited = new Set<string>([makeKey(startHop)]);
  const queue: Array<{ hop: SymbolHop; path: SymbolHop[]; depth: number }> = [
    { hop: startHop, path: [startHop], depth: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.hop.codePath === to.codePath) {
      if (!to.symbol) {
        return { path: current.path, found: true };
      }
      if (current.hop.symbol && symbolMatchesAnchor(to.symbol, current.hop.symbol)) {
        return { path: current.path, found: true };
      }
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    for (const neighbor of getSymbolNeighbors(graph, current.hop, direction)) {
      const key = makeKey(neighbor);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push({ hop: neighbor, path: [...current.path, neighbor], depth: current.depth + 1 });
    }
  }

  return { path: undefined, found: false };
}

/**
 * The hops one step away from a hop. Outbound, an edge is followed only when
 * its `from` matches the hop's symbol; inbound, only when its `toSymbol` does.
 * Without a symbol, the file-level neighbours are added as well.
 */
function getSymbolNeighbors(graph: LiveDocGraph, current: SymbolHop, direction: Direction): SymbolHop[] {
  const neighbors: SymbolHop[] = [];
  const file = graph.files[current.codePath];
  if (!file) {
    return neighbors;
  }

  if (direction === "outbound") {
    for (const edge of file.edges) {
      if (!edge.to || edge.to === current.codePath) {
        continue;
      }
      if (current.symbol && edge.from && !symbolMatchesAnchor(current.symbol, edge.from)) {
        continue;
      }
      neighbors.push({ codePath: edge.to, symbol: edge.toSymbol });
    }
    if (!current.symbol) {
      for (const codePath of file.outbound) {
        if (!neighbors.some((neighbor) => neighbor.codePath === codePath)) {
          neighbors.push({ codePath });
        }
      }
    }
    return neighbors;
  }

  for (const sourcePath of file.inbound) {
    for (const edge of graph.files[sourcePath].edges) {
      if (edge.to !== current.codePath) {
        continue;
      }
      if (current.symbol && edge.toSymbol && !symbolMatchesAnchor(current.symbol, edge.toSymbol)) {
        continue;
      }
      neighbors.push({ codePath: sourcePath, symbol: edge.from });
    }
    if (!current.symbol && !neighbors.some((neighbor) => neighbor.codePath === sourcePath)) {
      neighbors.push({ codePath: sourcePath });
    }
  }
  return neighbors;
}

/**
 * Whether a symbol name or anchor matches an anchor slug: exactly, or by name
 * once the `symbol-` prefix is removed and case ignored.
 */
export function symbolMatchesAnchor(symbol: string, anchor: string): boolean {
  if (symbol === anchor) {
    return true;
  }
  const prefix = "symbol-";
  const normalized = anchor.startsWith(prefix) ? anchor.slice(prefix.length) : anchor;
  return symbol.toLowerCase() === normalized.toLowerCase();
}
