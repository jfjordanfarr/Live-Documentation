/**
 * Pathfinding over the graph index.
 *
 * @remarks
 * One breadth-first walk over a neighbour function, and what the CLI and the
 * Explorer ask of it: the shortest path between files, every file a path
 * reaches and how far, the same search by symbol, and the enumeration of
 * every terminal path away from a file, and what the graph's entry points
 * reach. Pure functions: the CLI feeds the walk the graph's edges, the
 * Explorer the links it draws.
 *
 * @module
 */

import type { Entry } from "./document";
import type { GraphFile, LiveDocGraph } from "./graph";

/** Traversal direction for graph searches. */
export type Direction = "outbound" | "inbound" | "both";

/** One way through the graph: outbound follows what a file depends on, inbound what depends on it. */
export type OneWay = Exclude<Direction, "both">;

/** The files one step from a file, in the direction of a walk. */
export type Neighbours = (id: string) => Iterable<string>;

/** A file the walk did not go on from: nothing new lay beyond it, or it stood at the depth limit. */
export interface WalkStop {
  id: string;
  reason: "terminal" | "max-depth";
}

/** What one breadth-first walk from a set of files found. */
export interface Walk {
  /** Every file reached, by the fewest hops from a start; the starts at 0. */
  hops: Map<string, number>;
  /** The file each reached file was first reached from; a start has none. */
  parents: Map<string, string>;
  /** The first target met, when targets were given; the walk ends there. */
  reached?: string;
  /** Where the walk stopped, in the order it met them. */
  stops: WalkStop[];
}

/**
 * Walks breadth-first from a set of files along the neighbours given: every
 * start at depth 0, each file visited once. A target is recognised as it is
 * taken from the queue, a start among the targets at once, and the walk ends
 * at the first. A file at the depth limit is not expanded and is a `max-depth`
 * stop; a file with nothing new beyond it is a `terminal` stop.
 */
export function walk(
  starts: Iterable<string>,
  neighbours: Neighbours,
  maxDepth: number = Infinity,
  targets?: ReadonlySet<string>
): Walk {
  const hops = new Map<string, number>();
  const parents = new Map<string, string>();
  const stops: WalkStop[] = [];
  const queue: string[] = [];
  for (const start of starts) {
    if (!hops.has(start)) {
      hops.set(start, 0);
      queue.push(start);
    }
  }

  // Each file is enqueued once; the cursor avoids repeated array shifting.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const id = queue[cursor];
    const depth = hops.get(id)!;
    if (targets?.has(id)) {
      return { hops, parents, reached: id, stops };
    }
    if (depth >= maxDepth) {
      stops.push({ id, reason: "max-depth" });
      continue;
    }
    let expanded = false;
    for (const next of neighbours(id)) {
      if (hops.has(next)) {
        continue;
      }
      hops.set(next, depth + 1);
      parents.set(next, id);
      queue.push(next);
      expanded = true;
    }
    if (!expanded) {
      stops.push({ id, reason: "terminal" });
    }
  }

  return { hops, parents, stops };
}

/** The files from a start of the walk to a file it reached, the start first. */
export function pathTo(found: Walk, id: string): string[] {
  const path: string[] = [];
  for (let cursor: string | undefined = id; cursor !== undefined; cursor = found.parents.get(cursor)) {
    path.unshift(cursor);
  }
  return path;
}

/** Every file a path reaches from the starts, with the fewest hops to it; the starts themselves are not listed. */
export function reachFrom(starts: Iterable<string>, neighbours: Neighbours, maxDepth: number = Infinity): Map<string, number> {
  const from = [...starts];
  const reached = walk(from, neighbours, maxDepth).hops;
  for (const start of from) {
    reached.delete(start);
  }
  return reached;
}

// ============================================================================
// Reachability from the entry points
// ============================================================================

/** True when something outside the code starts the file: its doc carries an Entry line, or it is a test, which a runner starts. */
export function isEntry(file: GraphFile): boolean {
  return file.entries.length > 0 || file.archetype === "test";
}

/** A file a reachability walk starts from: an entry of the docs with its lines, or a file asked for. */
export interface Start {
  codePath: string;
  entries: Entry[];
  /** The file is a test, an entry by its archetype. */
  test: boolean;
}

/** What is reachable along dependencies from the graph's entry points, or from the files asked for. */
export interface Reachability {
  /** `entries` when the starts are the graph's entry points; `asked` when they were given. */
  from: "entries" | "asked";
  /** The files walked from, in path order. */
  starts: Start[];
  /** Every file a path reaches from a start, nearest first and then by path; the starts themselves are not listed. */
  reached: { codePath: string; hops: number }[];
  /** The files of the graph that no path from a start reaches, in path order. */
  unreachable: string[];
  /** The files that only a path from a test reaches, in path order; empty when the starts were given. */
  testsOnly: string[];
}

/**
 * Walks from the graph's entry points, or from the files asked for, along what
 * each depends on: one walk from every start, and, from the entries, a second
 * from the entries that are not tests, so that what only a test reaches is told
 * apart. A file asked for that the graph does not hold is left out.
 *
 * @param graph - The graph to walk.
 * @param asked - The files to walk from; the graph's entry points when absent.
 * @param maxDepth - The most hops a path takes.
 * @param entry - Which files are entry points: by default {@link isEntry}; a graph that carries entry marks without their Entry lines, as a past change's shape does, names its own.
 */
export function reachability(
  graph: LiveDocGraph,
  asked?: readonly string[],
  maxDepth: number = Infinity,
  entry: (file: GraphFile) => boolean = isEntry
): Reachability {
  const files = Object.keys(graph.files).sort(compare);
  const startPaths = asked ? [...new Set(asked)].filter((id) => graph.files[id]).sort(compare) : files.filter((id) => entry(graph.files[id]));
  const starts: Start[] = startPaths.map((codePath) => ({ codePath, entries: graph.files[codePath].entries, test: graph.files[codePath].archetype === "test" }));
  const neighbours = (id: string): readonly string[] => getNeighbors(graph, id, "outbound");
  const fromAll = reachFrom(startPaths, neighbours, maxDepth);
  const reached = [...fromAll].map(([codePath, hops]) => ({ codePath, hops })).sort((a, b) => a.hops - b.hops || compare(a.codePath, b.codePath));
  const startSet = new Set(startPaths);
  const unreachable = files.filter((id) => !startSet.has(id) && !fromAll.has(id));
  let testsOnly: string[] = [];
  if (!asked) {
    const fromCode = reachFrom(starts.filter((start) => !start.test).map((start) => start.codePath), neighbours, maxDepth);
    testsOnly = files.filter((id) => fromAll.has(id) && !fromCode.has(id));
  }
  return { from: asked ? "asked" : "entries", starts, reached, unreachable, testsOnly };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

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
 * The shortest path from one file to another, by the walk, with the frontier
 * the CLI reports when there is none: where the walk stopped and why, and, on
 * an outbound search, the dependencies that resolved to no file.
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
  direction: OneWay,
  maxDepth: number
): PathSearchResult {
  const found = walk([from], (id) => getNeighbors(graph, id, direction), maxDepth, new Set([to]));
  const visited = new Set(found.hops.keys());
  if (found.reached !== undefined) {
    return { path: pathTo(found, to), visited, frontier: [] };
  }

  const frontier: FrontierEntry[] = found.stops.map((stop) => ({
    node: stop.id,
    docPath: graph.files[stop.id]?.docPath,
    reason: stop.reason
  }));

  // An outbound search also reports what could not be followed: dependencies that resolved to no file.
  if (direction === "outbound") {
    const missing = new Map<string, FrontierEntry>();
    for (const node of visited) {
      const file = graph.files[node];
      if (!file) {
        continue;
      }
      for (const edge of file.edges) {
        if (!edge.to) {
          missing.set(`${node}|${edge.label}`, {
            node,
            docPath: file.docPath,
            reason: "missing-doc",
            missingDependency: edge.label
          });
        }
      }
    }
    frontier.push(...missing.values());
  }

  return { path: undefined, visited, frontier };
}

/**
 * Gets the neighbors of a node based on traversal direction.
 *
 * @param graph - The Live Doc graph
 * @param node - The node to get neighbors for
 * @param direction - "outbound" for dependencies, "inbound" for dependents
 * @returns The neighbouring code paths
 */
export function getNeighbors(graph: LiveDocGraph, node: string, direction: OneWay): readonly string[] {
  const file = graph.files[node];
  if (!file) {
    return [];
  }
  return direction === "outbound" ? file.outbound : file.inbound;
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
  direction: OneWay,
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
  direction: OneWay,
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
function getSymbolNeighbors(graph: LiveDocGraph, current: SymbolHop, direction: OneWay): SymbolHop[] {
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
