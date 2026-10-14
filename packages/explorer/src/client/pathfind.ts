/**
 * The pathfinder of the Local Map: the breadth-first search between two sets of files, in the direction the map can
 * draw, and the count of what a drawn path leaves out. The bar that asks the question is `search/search-bar.ts`.
 */

import type { ExplorerLinkPayload, ExplorerNodePayload } from "../shared/types";

/** A hop in a path result */
export interface PathHop {
  nodeId: string;
  node: ExplorerNodePayload;
  symbol?: string;
}

/** What a search between two sets of files found. */
export interface PathfindResult {
  /**
   * The hops from the start to the end when the end depends on the start. This is the only path the Local Map draws:
   * what offers stands left of what uses it, so the start must offer and the end must use. Empty when no such path
   * exists.
   */
  path: PathHop[];
  /**
   * The hops from the end to the start when only the start depends on the end: the same files, read in the direction
   * the map can draw. The map never draws a path against its reading direction; it says there is none and offers this
   * reverse question instead (the owner's rule of 2025-12-18). Empty when `path` is found or no path exists either way.
   */
  reversePath: PathHop[];
  /** Files visited by the searches, counted only when nothing is drawn. */
  searchedNodes: number;
  /** Whether a search stopped at the hop limit before reaching its target. */
  maxDepthReached: boolean;
}

function endpointId(endpoint: ExplorerLinkPayload["source"]): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/**
 * Finds the shortest path the Local Map can draw from any file of one set to any file of another, or the reverse of
 * it when only the reverse exists. A set is one file, or every file of a directory.
 *
 * A link runs from the file that depends to the file it depends on, so the map's reading direction, offers on the
 * left and uses on the right, walks a file's dependents. The search from the start along dependents reaches the end
 * exactly when the end depends on the start; the same search from the end reaches the start when the start depends
 * on the end, and that path is returned as `reversePath`, provider first, never drawn. A path has at least one hop:
 * a file that is in both sets is not its own path.
 */
export function findPath(
  fromIds: Iterable<string>,
  toIds: Iterable<string>,
  nodesById: Map<string, ExplorerNodePayload>,
  links: ExplorerLinkPayload[],
  maxHops: number = Math.max(0, nodesById.size - 1)
): PathfindResult {
  const from = new Set([...fromIds].filter(id => nodesById.has(id)));
  const to = new Set([...toIds].filter(id => nodesById.has(id)));
  const nothing: PathfindResult = { path: [], reversePath: [], searchedNodes: 0, maxDepthReached: false };
  if (from.size === 0 || to.size === 0) return nothing;

  // dependents: file -> the files that depend on it
  const dependents = new Map<string, Set<string>>();
  for (const link of links) {
    const sourceId = endpointId(link.source);
    const targetId = endpointId(link.target);
    let set = dependents.get(targetId);
    if (!set) {
      set = new Set();
      dependents.set(targetId, set);
    }
    set.add(sourceId);
  }

  const forward = directedBFS(from, to, dependents, nodesById, maxHops);
  if (forward.path) {
    return { ...nothing, path: forward.path };
  }
  const reverse = directedBFS(to, from, dependents, nodesById, maxHops);
  return {
    ...nothing,
    reversePath: reverse.path ?? [],
    searchedNodes: forward.searchedNodes + reverse.searchedNodes,
    maxDepthReached: forward.maxDepthReached || reverse.maxDepthReached
  };
}

/**
 * The references between the files of a drawn path that run against it: an
 * earlier file, which the picture shows offering, depending on a later one.
 * The path drawer leaves them out, so the bar counts them aloud.
 */
export function referencesAgainstPath(pathNodeIds: readonly string[], links: ExplorerLinkPayload[]): number {
  const position = new Map(pathNodeIds.map((id, index) => [id, index] as const));
  let count = 0;
  for (const link of links) {
    const dependent = position.get(endpointId(link.source));
    const dependency = position.get(endpointId(link.target));
    if (dependent !== undefined && dependency !== undefined && dependent < dependency) {
      count += 1;
    }
  }
  return count;
}

interface Search {
  /** The hops from a start to a target, or null when no target was reached. */
  path: PathHop[] | null;
  searchedNodes: number;
  maxDepthReached: boolean;
}

/** Breadth-first search from a set of files to another along one adjacency; every start is enqueued at depth 0. */
function directedBFS(
  starts: ReadonlySet<string>,
  targets: ReadonlySet<string>,
  adjacency: Map<string, Set<string>>,
  nodesById: Map<string, ExplorerNodePayload>,
  maxHops: number
): Search {
  const visited = new Set<string>(starts);
  const parents = new Map<string, string>();
  const queue: Array<{ nodeId: string; depth: number }> = [...starts].map(nodeId => ({ nodeId, depth: 0 }));
  let maxDepthReached = false;

  // Each file is enqueued once; the cursor avoids repeated array shifting.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { nodeId, depth } = queue[cursor];

    if (depth > 0 && targets.has(nodeId)) {
      const path: PathHop[] = [];
      let current: string | undefined = nodeId;
      while (current !== undefined) {
        const node = nodesById.get(current);
        if (node) {
          path.unshift({ nodeId: current, node });
        }
        current = parents.get(current);
      }
      return { path, searchedNodes: visited.size, maxDepthReached: false };
    }

    if (depth >= maxHops) {
      maxDepthReached ||= [...(adjacency.get(nodeId) ?? [])].some(id => nodesById.has(id) && !visited.has(id));
      continue;
    }

    for (const neighborId of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parents.set(neighborId, nodeId);
        queue.push({ nodeId: neighborId, depth: depth + 1 });
      }
    }
  }

  return { path: null, searchedNodes: visited.size, maxDepthReached };
}
