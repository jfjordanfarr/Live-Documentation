/**
 * How a 3D picture is revealed: in what order its spheres enter and how many enter at each frame, the same in the page
 * and headlessly (2026-10-28; the order by hops within what was asked about and the pace by frames, 2026-10-31).
 *
 * A picture is fed to the library in pieces, so that the first piece is on screen within a moment at any size and the
 * rest grows around it, each newcomer placed beside what holds it by `placeNewSpheres`. What comes first is what a
 * person asked about directly, the pins, the subject, the inspected file and a path, all at once, and with them their
 * first hop, so that the neighbourhood the 2D picture showed crosses into 3D together; then the files of an
 * open directory, by hops within the directory from its most connected file, so that a directory opened whole unfurls
 * from its hub, part by part, and its unconnected files come last together; then every sphere a connecting link reaches
 * from what was asked about, a hop at a time; and when the reach runs out, what is left part by part, the most connected
 * first, the unconnected last together. Within a layer the most connected enter first, since a well-connected sphere
 * settles the places of the others. The owner asked for the universe to "draw itself one hop at a time", so that
 * "stragglers, weird islands, and orphans, appear very last in the drawing order" ([Turn 4 of the October 31 record]
 * (../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)); before, the attention set
 * entered whole, then a tenth more at every frame, which was in before the eye could follow it.
 *
 * The pace is a share of the whole at every frame, so that a picture of any size enters over the same number of frames,
 * the tuning's `revealFrames`, at least one sphere a frame, and the order makes the hops read as waves.
 */

import type { SpatialLink, SpatialNode } from "./forceGraphLayout";
import { connectedNeighbours, mostConnectedFirst } from "./forceGraphScope";

/** What a reveal is paced by: how many ticks the first piece settles hidden before the rest enters. */
export interface RevealSettings {
  warmup: number;
}

/** The reveal's constants: the hundred hidden ticks the library has given the first picture since 2026-10-03 (`6b881f00`). */
export const REVEAL: RevealSettings = { warmup: 100 };

/** What a person asked about: directly, each thing on its own, and as a set, the files of an open directory. */
export interface RevealAttention {
  asked: ReadonlySet<string>;
  members?: ReadonlySet<string>;
}

/**
 * The ids of `nodes` in the order they enter the picture, in layers: the asked-about spheres among the nodes as the
 * first layer, and their own connections as the second; the members by hops within the members from what has entered
 * and then from their most connected, each part when the reach runs out starting a new layer, the members no link joins
 * to another member last together; then every sphere a connecting link reaches from what has entered, a layer a hop;
 * then, when the reach runs out, the most connected sphere not yet entered starting the next part, the spheres no link
 * reaches at all last together. Each layer most connected first and
 * ties by id, so that the order is the same on every machine. Which links connect is the caller's to say, as the
 * layout rules it. No layer is empty.
 */
export function revealLayers<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], attention: RevealAttention,
  pulls: (link: SpatialLink<N>) => boolean): string[][] {
  const seen = new Set<string>();
  for (const node of nodes) { if (seen.has(node.id)) throw new Error(`The reveal needs one node per id; ${JSON.stringify(node.id)} is repeated.`); seen.add(node.id); }
  const beside = connectedNeighbours(nodes, links, pulls);
  const before = mostConnectedFirst(beside);
  const entered = new Set<string>();
  const layers: string[][] = [];
  const enter = (layer: string[], by = before): void => { layer.sort(by); for (const id of layer) entered.add(id); layers.push(layer); };
  /** Every unentered neighbour of the layer within `among` (every node when undefined), each once. */
  const reach = (layer: readonly string[], among?: ReadonlySet<string>): string[] => {
    const next: string[] = [], taken = new Set<string>();
    for (const id of layer) for (const neighbour of beside.get(id)!) {
      if (entered.has(neighbour) || taken.has(neighbour) || (among && !among.has(neighbour))) continue;
      taken.add(neighbour); next.push(neighbour);
    }
    return next;
  };
  /**
   * The rest of `among`, part by part from its most connected, the unconnected within `among` last together; within a
   * directory a file's connections are counted within the directory, so that the directory unfurls from its own hub.
   */
  const parts = (among: readonly string[], within?: ReadonlySet<string>): void => {
    const inner = within ? new Map([...beside].map(([id, neighbours]) => [id, new Set([...neighbours].filter(neighbour => within.has(neighbour)))])) : beside;
    const by = within ? mostConnectedFirst(inner) : before;
    const left = among.filter(id => !entered.has(id));
    const joined = left.filter(id => inner.get(id)!.size > 0), alone = left.filter(id => inner.get(id)!.size === 0);
    while (joined.some(id => !entered.has(id))) {
      let best: string | null = null;
      for (const id of joined) if (!entered.has(id) && (best === null || by(id, best) < 0)) best = id;
      for (let layer = [best!]; layer.length; layer = reach(layer, within)) enter(layer, by);
    }
    if (alone.length) enter(alone, by);
  };
  const asked = nodes.filter(node => attention.asked.has(node.id)).map(node => node.id);
  if (asked.length) enter(asked);
  // What was asked about directly brings its own connections next, wherever they stand, so that the first piece is a
  // file with its neighbourhood and never a file beside an unconnected hub.
  const near = reach(asked);
  if (near.length) enter(near);
  const members = attention.members ? nodes.filter(node => attention.members!.has(node.id) && !entered.has(node.id)).map(node => node.id) : [];
  if (members.length) {
    const within = new Set([...asked, ...near, ...members]);
    for (let layer = reach([...asked, ...near], within); layer.length; layer = reach(layer, within)) enter(layer);
    parts(members, within);
  }
  for (let layer = reach([...entered]); layer.length; layer = reach(layer)) enter(layer);
  parts(nodes.map(node => node.id));
  return layers;
}

/** The order the layers give, flat: the attention set as what was asked about directly. */
export function revealOrder<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], attention: ReadonlySet<string>,
  pulls: (link: SpatialLink<N>) => boolean): string[] {
  return revealLayers(nodes, links, { asked: attention }, pulls).flat();
}

/**
 * How many spheres are shown after the next frame of a reveal: `shown` plus a share of `total` such that the whole
 * enters in `frames` frames, at least one sphere a frame, never past `total`. A picture of fifteen spheres and one of
 * twenty thousand both enter over the same number of frames.
 */
export function nextRevealCount(shown: number, total: number, frames: number): number {
  if (!(Number.isInteger(shown) && Number.isInteger(total) && shown >= 0 && total >= shown)) throw new Error("A reveal counts whole spheres, shown never past the total.");
  if (!(Number.isInteger(frames) && frames >= 1)) throw new Error("A reveal takes a whole number of frames, at least one.");
  return Math.min(total, shown + Math.max(1, Math.ceil(total / frames)));
}
