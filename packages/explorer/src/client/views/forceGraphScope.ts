/**
 * What the 3D Local Map shows: discovery, the owner's direction of 2026-10-31. The picture is what a person asked about,
 * a few hops around it over the links that connect in the layout, and nothing beyond; the last hop shown is the frontier,
 * drawn dimmed, and a click on a frontier sphere asks about it, so that the emergent structure of the software grows
 * hop by hop as the 2D Local Map's does by its pins. Before, the whole universe was drawn always, and the owner found
 * that "I can't explore my way, hop by hop ... What if _that's_ the mistake?" ([Turn 4 of the October 31 record]
 * (../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)).
 *
 * With nothing asked about, each layout has a start: in Structure the scan root's hub, with its children one hop away
 * (the owner's "sane move"); in Connections the archipelago (2026-11-02): every group's seed, the most connected file
 * of each disconnected component, the main structure one island among the rest and nothing grown, so that a click on
 * any seed pins it and grows its group by hops. The owner, asked whether islands should be reachable as landmarks:
 * "isn't the main structure an island too? ... Perhaps throw away the declared program start and just work off building
 * expandable islands?" ([Turn 3 of the November 2 record]
 * (../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-3)). A declared entry is no longer
 * the start (the rule of October 31, declared entries then the most connected file): the owner would require less
 * authorial intent of the user, and a seed that might not expand would be "a special node" (Turn 4). While anything is
 * asked about, the seeds of the groups the hops cannot reach stand in the picture dimmed, so that every group is one
 * click away; before, an island was never on any frontier and could be found only by opening the root.
 *
 * Pure-function module: no DOM. The page and the headless layout lab scope the same way.
 */

import type { SpatialLink, SpatialNode } from "./forceGraphLayout";
import type { SpatialLayout } from "../types";
import { under } from "./localView/directory-state";

/** What the start reads of a node beyond its links: a hub's directory, a document's kind, a file's entry reasons. */
export interface StartableNode extends SpatialNode {
  directoryPath?: string;
  archetype?: string;
  /** The reasons the file's doc lists it as an entry, when it does (`declared`, `program`, `command`, ...). */
  entryReasons?: readonly string[];
  codeRelativePath?: string;
}

/** Resolve a directory in the pruned containment tree, including an ancestor collapsed into its only descendant hub. */
export function directoryHubOf(nodes: readonly StartableNode[], directory: string): string | undefined {
  const exact = nodes.find(node => node.directoryPath === directory);
  if (exact) return exact.id;
  const contained = nodes.filter(node => under(node.directoryPath ?? node.codeRelativePath ?? node.id, directory));
  const hubs = contained.filter(node => node.directoryPath !== undefined)
    .sort((a, b) => a.directoryPath!.length - b.directoryPath!.length || a.id.localeCompare(b.id));
  const first = hubs[0];
  return first && contained.every(node => under(node.directoryPath ?? node.codeRelativePath ?? node.id, first.directoryPath!))
    ? first.id : undefined;
}

/** Files/documents inside a discovered directory's visible containment neighborhood, without opening its whole subtree. */
export function directoryMembersWithinHops<N extends StartableNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], directory: string, hops: number): Set<string> {
  const hub = directoryHubOf(nodes, directory);
  if (!hub) return new Set();
  const scope = spatialScope(nodes, links, new Set([hub]), hops, link => link.kind === "containment");
  return new Set(nodes.filter(node => node.directoryPath === undefined && scope.hops.has(node.id)
    && under(node.codeRelativePath ?? node.id, directory)).map(node => node.id));
}

/** A fresh 3D visit starts from declared entries when present, otherwise from the directory structure. */
export function defaultSpatialLayout(nodes: readonly Pick<StartableNode, "entryReasons">[]): SpatialLayout {
  return nodes.some(node => node.entryReasons?.includes("declared")) ? "connections" : "structure";
}

/** The shown part of a picture: each shown sphere's hop from what was asked about, and the frontier's counts beyond. */
export interface SpatialScope {
  /**
   * Every shown id with its hop: 0 for what was asked about, then 1 up to the hops shown; and, one past the hops shown,
   * the seed of every group the hops do not reach, a containment tree by its top hub (2026-11-02), drawn dimmed as the
   * frontier is.
   */
  hops: Map<string, number>;
  /** For each shown sphere with connections the picture does not show, how many of its connected spheres are not shown. */
  beyond: Map<string, number>;
  /**
   * The groups the picture shows only by their seed: the seed's id to the group's size in files, for every disconnected
   * component of which nothing but its seed is shown, whether the seed was asked about (the archipelago) or stands
   * dimmed because the hops did not reach its group.
   */
  groups: Map<string, number>;
  /** Each such group's files by the seed's id, in id order: what `groups` counts, for a wrapper drawn around them (2026-11-05). */
  groupFiles: Map<string, readonly string[]>;
  /**
   * The files of every group the picture shows in part, but not only by its seed, that it leaves out, in id order within
   * each group: what the directory shells hold (2026-11-05, `forceGraphShells.ts`). Hubs are never hidden files.
   */
  hidden: string[];
  /** Each node's connected neighbours, as the scope walked them, for the shells' wires and rings (2026-11-05). */
  beside: Map<string, Set<string>>;
}

const endpointId = <N extends SpatialNode>(end: string | N): string => typeof end === "string" ? end : end.id;

/** Each node's connected neighbours over the links that connect in the layout, counted once however many links join a pair. */
export function connectedNeighbours<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], pulls: (link: SpatialLink<N>) => boolean): Map<string, Set<string>> {
  const beside = new Map<string, Set<string>>(nodes.map(node => [node.id, new Set<string>()]));
  for (const link of links) {
    if (!pulls(link)) continue;
    const a = endpointId(link.source), b = endpointId(link.target);
    if (a === b || !beside.has(a) || !beside.has(b)) continue;
    beside.get(a)!.add(b);
    beside.get(b)!.add(a);
  }
  return beside;
}

/**
 * The spheres shown around what was asked about: the attention set itself at hop 0, then every sphere a connecting link
 * reaches from what is shown, a hop at a time, up to `hops` hops. A sphere reached by two routes has the nearer hop.
 * Attention that is not among the nodes is ignored, as the reveal ignores it. With `hops` zero only the attention set is
 * shown. The counts beyond say, for each shown sphere, how many of its connected spheres the picture leaves out: the
 * frontier's "more here".
 */
export function spatialScope<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], attention: ReadonlySet<string>, hops: number,
  pulls: (link: SpatialLink<N>) => boolean): SpatialScope {
  if (!Number.isInteger(hops) || hops < 0) throw new Error("A picture shows a whole, nonnegative number of hops.");
  const beside = connectedNeighbours(nodes, links, pulls);
  const result = new Map<string, number>();
  let frontier: string[] = [];
  for (const node of nodes) if (attention.has(node.id)) { result.set(node.id, 0); frontier.push(node.id); }
  for (let hop = 1; hop <= hops && frontier.length; hop++) {
    const next: string[] = [];
    for (const id of frontier) for (const neighbour of beside.get(id)!) if (!result.has(neighbour)) { result.set(neighbour, hop); next.push(neighbour); }
    frontier = next;
  }
  // Every group the hops do not reach stands in the picture by its seed, one past the last hop, so that no island is
  // ever out of reach of a click; a group of which only its seed is shown, reached or asked about, is named by its size
  // in files. A group that holds directory hubs is a containment tree, whose handle is its top hub, the root when it
  // stands: a click on a hub opens its directory, so the tree is one click away as an island is (2026-11-02).
  const groups = new Map<string, number>();
  const groupFiles = new Map<string, readonly string[]>();
  const hidden: string[] = [];
  const hubs = new Map(nodes.filter(node => node.directoryPath !== undefined).map(node => [node.id, node.directoryPath!]));
  const shallower = (a: string, b: string): number => hubs.get(a)!.length - hubs.get(b)!.length || (a < b ? -1 : a > b ? 1 : 0);
  for (const [seed, members] of componentMembers(beside, seedOf(nodes))) {
    // A group of nothing but directory hubs is the tree's, never a group of the picture's.
    const files = members.filter(id => !hubs.has(id));
    if (!files.length) continue;
    const handle = members.filter(id => hubs.has(id)).sort(shallower)[0] ?? seed;
    const shown = members.filter(id => result.has(id));
    if (shown.length === 0) { result.set(handle, hops + 1); groups.set(handle, files.length); groupFiles.set(handle, files); }
    else if (shown.length === 1 && shown[0] === handle && files.length > 1) { groups.set(handle, files.length); groupFiles.set(handle, files); }
    else for (const id of files) if (!result.has(id)) hidden.push(id);
  }
  const beyond = new Map<string, number>();
  for (const id of result.keys()) {
    let count = 0;
    for (const neighbour of beside.get(id)!) if (!result.has(neighbour)) count++;
    if (count) beyond.set(id, count);
  }
  return { hops: result, beyond, groups, groupFiles, hidden, beside };
}

/** Most connected first, then by id, so that a choice is the same on every machine. */
export function mostConnectedFirst(beside: ReadonlyMap<string, ReadonlySet<string>>): (a: string, b: string) => number {
  return (a, b) => (beside.get(b)?.size ?? 0) - (beside.get(a)?.size ?? 0) || (a < b ? -1 : a > b ? 1 : 0);
}

/**
 * Whether a node may seed its group: a file, never a directory hub or a document, so that a group's handle is a file a
 * person can pin and read; a group with no file at all (a document shown alone) is seeded by its most connected member.
 */
function seedOf(nodes: readonly (SpatialNode & { archetype?: string })[]): (id: string) => boolean {
  const files = new Set(nodes.filter(node => node.directoryPath === undefined && node.archetype !== "related-doc").map(node => node.id));
  return id => files.has(id);
}

/**
 * Each disconnected component by its seed, with its members: the seed is the most connected member that may seed, ties
 * by id, so that the choice is the same on every machine; a component with no such member is seeded by its most
 * connected member. The walk visits every node once, so a picture of thousands of lone files costs what it holds.
 */
export function componentMembers(beside: ReadonlyMap<string, ReadonlySet<string>>, maySeed: (id: string) => boolean = () => true): Map<string, string[]> {
  const unseen = new Set(beside.keys()), components = new Map<string, string[]>();
  const before = mostConnectedFirst(beside);
  for (const seed of beside.keys()) {
    if (!unseen.delete(seed)) continue;
    const queue = [seed];
    let best: string | null = null, fallback = seed;
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      if (maySeed(id) && (best === null || before(id, best) < 0)) best = id;
      if (before(id, fallback) < 0) fallback = id;
      for (const next of beside.get(id) ?? []) if (unseen.delete(next)) queue.push(next);
    }
    components.set(best ?? fallback, queue.sort());
  }
  return components;
}

/** One real file and member count for each disconnected component, including isolates; ties are deterministic. */
export function componentLandmarks(beside: ReadonlyMap<string, ReadonlySet<string>>, maySeed?: (id: string) => boolean): Map<string, number> {
  return new Map([...componentMembers(beside, maySeed)].map(([seed, members]) => [seed, members.length]));
}

/**
 * Where a picture starts when nothing is asked about: in the structure layout the scan root's hub, with the hops around
 * it; in the connections layout the archipelago, every group's seed and nothing grown, so the caller shows no hops
 * around this start (`startHops`). A document or a hub seeds a group only when it holds no file. An empty picture has
 * no start.
 */
export function startOf<N extends StartableNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], layout: SpatialLayout, pulls: (link: SpatialLink<N>) => boolean): Set<string> {
  if (layout === "structure") {
    const root = nodes.find(node => node.directoryPath === "");
    if (root) return new Set([root.id]);
  }
  const hubs = new Set(nodes.filter(node => node.directoryPath !== undefined).map(node => node.id));
  return new Set([...componentMembers(connectedNeighbours(nodes, links, pulls), seedOf(nodes))]
    .filter(([, members]) => !members.every(id => hubs.has(id))).map(([seed]) => seed));
}

/** How many hops a layout's start shows around itself: a tree's root with its children, an archipelago's seeds alone. */
export function startHops(layout: SpatialLayout, hops: number): number {
  return layout === "structure" ? hops : 0;
}
