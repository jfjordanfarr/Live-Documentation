/**
 * What the 3D Local Map shows: discovery, the owner's direction of 2026-10-31. The picture is what a person asked about,
 * a few hops around it over the links that connect in the layout, and nothing beyond; the last hop shown is the frontier,
 * drawn dimmed, and a click on a frontier sphere asks about it, so that the emergent structure of the software grows
 * hop by hop as the 2D Local Map's does by its pins. Before, the whole universe was drawn always, and the owner found
 * that "I can't explore my way, hop by hop ... What if _that's_ the mistake?" ([Turn 4 of the October 31 record]
 * (../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)).
 *
 * With nothing asked about, each layout has a start: in Structure the scan root's hub, with its children one hop away
 * (the owner's "sane move"); in Connections the files the repository declares as its entry points (`Entry: declared`,
 * the configuration's `entryPoints`), and failing those the most connected file, by the owner's "priority fallbacks" of
 * Turn 8. The entries a doc infers (a program's main, a manifest's command) are not used for the start: measured on
 * 2026-10-31 they named the integration sample programs' mains here and fixture scripts on T3 Code, and the software's
 * centre in neither.
 *
 * Pure-function module: no DOM. The page and the headless layout lab scope the same way.
 */

import type { SpatialLink, SpatialNode } from "./forceGraphLayout";
import type { SpatialLayout } from "../types";

/** What the start reads of a node beyond its links: a hub's directory, a document's kind, a file's entry reasons. */
export interface StartableNode extends SpatialNode {
  directoryPath?: string;
  archetype?: string;
  /** The reasons the file's doc lists it as an entry, when it does (`declared`, `program`, `command`, ...). */
  entryReasons?: readonly string[];
}

/** The shown part of a picture: each shown sphere's hop from what was asked about, and the frontier's counts beyond. */
export interface SpatialScope {
  /** Every shown id with its hop: 0 for what was asked about, then 1 up to the hops shown. */
  hops: Map<string, number>;
  /** For each shown sphere with connections the picture does not show, how many of its connected spheres are not shown. */
  beyond: Map<string, number>;
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
  const beyond = new Map<string, number>();
  for (const id of result.keys()) {
    let count = 0;
    for (const neighbour of beside.get(id)!) if (!result.has(neighbour)) count++;
    if (count) beyond.set(id, count);
  }
  return { hops: result, beyond };
}

/** Most connected first, then by id, so that a choice is the same on every machine. */
export function mostConnectedFirst(beside: ReadonlyMap<string, ReadonlySet<string>>): (a: string, b: string) => number {
  return (a, b) => (beside.get(b)?.size ?? 0) - (beside.get(a)?.size ?? 0) || (a < b ? -1 : a > b ? 1 : 0);
}

/**
 * Where a picture starts when nothing is asked about: in the structure layout the scan root's hub; in the connections
 * layout the files the repository declares as its entry points, and failing those the most connected file, ties by id.
 * A document or a hub is never the connections start. An empty picture has no start.
 */
export function startOf<N extends StartableNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], layout: SpatialLayout, pulls: (link: SpatialLink<N>) => boolean): Set<string> {
  if (layout === "structure") {
    const root = nodes.find(node => node.directoryPath === "");
    if (root) return new Set([root.id]);
  }
  const files = nodes.filter(node => node.directoryPath === undefined && node.archetype !== "related-doc");
  const declared = files.filter(node => node.entryReasons?.includes("declared")).map(node => node.id);
  if (declared.length) return new Set(declared);
  if (!files.length) return new Set();
  const beside = connectedNeighbours(nodes, links, pulls);
  const before = mostConnectedFirst(beside);
  let best = files[0].id;
  for (const node of files) if (before(node.id, best) < 0) best = node.id;
  return new Set([best]);
}
