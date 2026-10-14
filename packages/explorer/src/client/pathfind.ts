/**
 * The pathfinder of the Local Map: the engine's breadth-first walk over the links the map draws, asked for the
 * shortest path between two sets of files in the direction the map can draw, for every file a path can reach from
 * a set, and for the count of what a drawn path leaves out. The bar that asks is `search/search-bar.ts`.
 */

import { pathTo, reachFrom, walk, type Neighbours } from "@live-documentation/engine/live-docs/pathfind";

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

/** Every file a path can reach from a set of files, by the number of files on the path, in each direction. */
export interface Reach {
  /** The files that depend on the set, directly or through others: a path to any of them is drawn. */
  forward: Map<string, number>;
  /** The files the set depends on: a path to any of them exists only the other way, and the reverse question is offered. */
  reverse: Map<string, number>;
}

/** The two readings of the bundle's links: a file's dependents, and the files it depends on. */
export interface Adjacency {
  /** The files that depend on a file: the direction the map draws. */
  dependents: Neighbours;
  /** The files a file depends on. */
  dependencies: Neighbours;
}

function endpointId(endpoint: ExplorerLinkPayload["source"]): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/** The links read both ways. A link runs from the file that depends to the file it depends on. */
export function adjacencyOf(links: readonly ExplorerLinkPayload[]): Adjacency {
  const dependents = new Map<string, Set<string>>();
  const dependencies = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, key: string, value: string): void => {
    let set = map.get(key);
    if (!set) {
      set = new Set();
      map.set(key, set);
    }
    set.add(value);
  };
  for (const link of links) {
    const dependent = endpointId(link.source);
    const dependency = endpointId(link.target);
    add(dependents, dependency, dependent);
    add(dependencies, dependent, dependency);
  }
  const none: string[] = [];
  return {
    dependents: id => dependents.get(id) ?? none,
    dependencies: id => dependencies.get(id) ?? none
  };
}

/**
 * Finds the shortest path the Local Map can draw from any file of one set to any file of another, or the reverse of
 * it when only the reverse exists. A set is one file, or every file of a directory.
 *
 * A link runs from the file that depends to the file it depends on, so the map's reading direction, offers on the
 * left and uses on the right, walks a file's dependents. The walk from the start along dependents reaches the end
 * exactly when the end depends on the start; the same walk from the end reaches the start when the start depends on
 * the end, and that path is returned as `reversePath`, provider first, never drawn. A path has at least one hop:
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

  const { dependents } = adjacencyOf(links);
  const forward = search(from, to, dependents, nodesById, maxHops);
  if (forward.path) {
    return { ...nothing, path: forward.path };
  }
  const reverse = search(to, from, dependents, nodesById, maxHops);
  return {
    ...nothing,
    reversePath: reverse.path ?? [],
    searchedNodes: forward.searchedNodes + reverse.searchedNodes,
    maxDepthReached: forward.maxDepthReached || reverse.maxDepthReached
  };
}

/**
 * Every file a path can reach from a set of files, forward along dependents, which the map draws, and in reverse
 * along dependencies, which the reverse question offers, each with the number of files the path would show. The
 * set's own files are not listed.
 */
export function reachOf(
  fromIds: Iterable<string>,
  nodesById: Map<string, ExplorerNodePayload>,
  links: readonly ExplorerLinkPayload[]
): Reach {
  const from = [...fromIds].filter(id => nodesById.has(id));
  const { dependents, dependencies } = adjacencyOf(links);
  const files = (hops: Map<string, number>): Map<string, number> =>
    new Map([...hops].filter(([id]) => nodesById.has(id)).map(([id, count]) => [id, count + 1]));
  return { forward: files(reachFrom(from, dependents)), reverse: files(reachFrom(from, dependencies)) };
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

/** The walk from a set of files to another; a file in both sets is not its own path, so the starts are never targets. */
function search(
  starts: ReadonlySet<string>,
  targets: ReadonlySet<string>,
  neighbours: Neighbours,
  nodesById: Map<string, ExplorerNodePayload>,
  maxHops: number
): Search {
  const goals = new Set([...targets].filter(id => !starts.has(id)));
  const found = walk(starts, neighbours, maxHops, goals);
  if (found.reached !== undefined) {
    const path = pathTo(found, found.reached).flatMap(nodeId => {
      const node = nodesById.get(nodeId);
      return node ? [{ nodeId, node }] : [];
    });
    return { path, searchedNodes: found.hops.size, maxDepthReached: false };
  }
  const maxDepthReached = found.stops.some(stop =>
    stop.reason === "max-depth" && [...neighbours(stop.id)].some(id => nodesById.has(id) && !found.hops.has(id)));
  return { path: null, searchedNodes: found.hops.size, maxDepthReached };
}
