/**
 * How a 3D picture is revealed: in what order its spheres enter and how many enter at each tick, the same in the page
 * and headlessly (2026-10-28).
 *
 * A picture is fed to the library in pieces, so that the first piece is on screen within a moment at any size and the
 * rest grows around it, each newcomer placed beside what holds it by `placeNewSpheres`. What comes first is what a
 * person asked about: the attention set (the subject, the path, the pins and what they retain), then the rest by their
 * distance over the links that pull, nearest first; ties, and spheres nothing reaches, by how connected they are, since a
 * well-connected sphere settles the places of the others. With nothing retained the picture grows from its most
 * connected sphere. The owner chose the gradual reveal for the 3D Local Map, and not for the 2D one, on 2026-10-28; the
 * order is the agent's design put to them the same day, chosen because distance from the subject keeps a person's
 * bearings. The growth is a fixed share of what is shown per tick with a floor, so that the reveal takes a number of
 * ticks that grows with the logarithm of the size and always completes (the owner's floor, 2026-10-28).
 */

import type { SpatialLink, SpatialNode } from "./forceGraphLayout";

/** How a reveal runs: the size of the first piece, the share and the least that enter at every later tick, and how many ticks the first piece settles hidden before the rest enters. */
export interface RevealSettings {
  first: number;
  share: number;
  least: number;
  warmup: number;
}

/**
 * The reveal's constants, starting values of 2026-10-28 to be measured in the layout lab and judged in pictures: a first
 * piece of 300 spheres, a tenth more at every tick and ten at the least, after the hundred hidden ticks the library has
 * given the first picture since 2026-10-03 (`6b881f00`).
 */
export const REVEAL: RevealSettings = { first: 300, share: 0.1, least: 10, warmup: 100 };

const endpointId = <N extends SpatialNode>(end: string | N): string => typeof end === "string" ? end : end.id;

/**
 * The ids of `nodes` in the order they enter the picture. `attention` names the spheres a person asked about; those
 * among the nodes enter first, most connected first, then every sphere a pulling link reaches from what has entered, a
 * layer at a time, each layer most connected first and ties by id, so that the order is the same on every machine. When
 * the reach runs out, the most connected sphere not yet entered starts the next part, until every node has entered. Which
 * links pull is the caller's to say, as the layout rules it.
 */
export function revealOrder<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], attention: ReadonlySet<string>,
  pulls: (link: SpatialLink<N>) => boolean): string[] {
  const index = new Map<string, number>();
  nodes.forEach((node, i) => { if (index.has(node.id)) throw new Error(`The reveal needs one node per id; ${JSON.stringify(node.id)} is repeated.`); index.set(node.id, i); });
  const beside: number[][] = nodes.map(() => []);
  for (const link of links) {
    if (!pulls(link)) continue;
    const a = index.get(endpointId(link.source)), b = index.get(endpointId(link.target));
    if (a === undefined || b === undefined || a === b) continue;
    beside[a].push(b); beside[b].push(a);
  }
  // Most connected first, then by id, so that the order is the same wherever it is computed.
  const before = (a: number, b: number): number => beside[b].length - beside[a].length || (nodes[a].id < nodes[b].id ? -1 : nodes[a].id > nodes[b].id ? 1 : 0);
  const entered = new Uint8Array(nodes.length);
  const order: string[] = [];
  const enter = (layer: number[]): number[] => {
    layer.sort(before);
    for (const i of layer) order.push(nodes[i].id);
    const next: number[] = [];
    for (const i of layer) for (const j of beside[i]) if (!entered[j]) { entered[j] = 1; next.push(j); }
    return next;
  };
  let layer = nodes.flatMap((node, i) => attention.has(node.id) ? [i] : []);
  for (const i of layer) entered[i] = 1;
  for (let seed = 0; order.length < nodes.length;) {
    if (!layer.length) {
      // The reach ran out: the most connected sphere not yet entered starts the next part.
      let best = -1;
      for (; seed < nodes.length; seed++) if (!entered[seed] && (best < 0 || before(seed, best) < 0)) best = seed;
      seed = 0;
      entered[best] = 1;
      layer = [best];
    }
    layer = enter(layer);
  }
  return order;
}

/**
 * How many spheres are shown after the next tick of a reveal: `shown` plus the greater of `share` of it and `least`,
 * never past `total`. A share of a tenth from a first piece of a few hundred reaches twenty thousand in some fifty ticks.
 */
export function nextRevealCount(shown: number, total: number, share: number, least: number): number {
  if (!(Number.isInteger(shown) && Number.isInteger(total) && shown >= 0 && total >= shown)) throw new Error("A reveal counts whole spheres, shown never past the total.");
  if (!(Number.isFinite(share) && share >= 0 && Number.isInteger(least) && least >= 1)) throw new Error("A reveal's share must be finite and nonnegative and its least growth a whole number of at least one.");
  return Math.min(total, shown + Math.max(least, Math.ceil(share * shown)));
}
