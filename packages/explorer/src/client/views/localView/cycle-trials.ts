/**
 * A cycle's orders as trials of the 2D Local Map's continuing search (2026-11-16). The ranking stands each cycle of a
 * picture in one order and offers the others (`rankBranches`' `cycles`): the greedy order, the order that returns the
 * fewest references, and the orders a single move reaches between them. The first draw prices nothing; after it, the
 * search tries each other order as one more kind of trial, laid out as it lays out any trial, on the page's own
 * measurements, and priced by the page's price with the two terms a ranking changes and an order within it does not:
 * the wires' horizontal length, and the Return Cost of every reference read backward. Both are in pixels of wire, the
 * unit of every other term. It is judged by the search's own rule: adopted when its price with its churn is below the
 * shown picture's, so that a move pays for itself.
 *
 * This module holds what the page and the layout lab share: the two terms, the trials a picture offers, and the search
 * over them as a pure walk, which the lab runs with its card model where the page runs it in idle moments.
 *
 * @module views/localView/cycle-trials
 */
import type { Scene } from "./branch-scene";
import { edgeKey, type BranchGraph, type CycleOffer } from "./branches";
import { linksOf } from "./directory-flow";

/**
 * The wires' horizontal length: for every reference the picture draws forward, the distance from its provider's column's
 * right edge to its consumer's column's left edge, weighed as the placement weighs its vertical length.
 */
export function horizontalWire(scene: Pick<Scene, "lefts" | "widths">, branches: Pick<BranchGraph, "columns" | "subgraph" | "back">): number {
  const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
  let length = 0;
  for (const edge of branches.subgraph.links) {
    if (edge.sourceId === edge.targetId || branches.back.has(edgeKey(edge))) continue;
    const provider = columnOf.get(edge.targetId), consumer = columnOf.get(edge.sourceId);
    if (provider === undefined || consumer === undefined) continue;
    length += (edge.gathered ?? edge.referenceCount ?? 1) * Math.max(0, scene.lefts[consumer] - (scene.lefts[provider] + scene.widths[provider]));
  }
  return length;
}

/** The references a picture reads backward, each pair line counting the links it stands for. */
export function returningLinks(branches: Pick<BranchGraph, "subgraph" | "back">): number {
  return branches.subgraph.links.filter(edge => branches.back.has(edgeKey(edge))).reduce((sum, edge) => sum + linksOf(edge), 0);
}

/** What a ranking adds to a picture's price, in pixels of wire: its wires' horizontal length and its returns at the Return Cost. */
export function rankingTerms(scene: Pick<Scene, "lefts" | "widths">, branches: Pick<BranchGraph, "columns" | "subgraph" | "back">, returnCost: number): number {
  return horizontalWire(scene, branches) + Math.max(0, returnCost) * returningLinks(branches);
}

/** One trial: a cycle, by its key, standing in another of its offered orders. */
export interface CycleTrial {
  key: string;
  order: string[];
}

/**
 * The orders the picture's cycles offer beside the ones they stand in when the search begins, cycle by cycle and each
 * cycle's in its offered order, the greedy order first: each is tried once.
 */
export function cycleOrdersOf(cycles: readonly CycleOffer[]): CycleTrial[] {
  return cycles.flatMap(cycle => cycle.candidates.filter(order => order.join("\0") !== cycle.order.join("\0")).map(order => ({ key: cycle.key, order })));
}

/** The next trial from `from` on, past any order a trial already adopted; null when none is left. */
export function nextCycleTrial(orders: readonly CycleTrial[], standing: ReadonlyMap<string, readonly string[]>, from: number): { trial: CycleTrial; next: number } | null {
  for (let i = Math.max(0, from); i < orders.length; i++) {
    const { key, order } = orders[i];
    if (order.join("\0") !== (standing.get(key) ?? []).join("\0")) return { trial: orders[i], next: i + 1 };
  }
  return null;
}

/** The order each cycle stands in, by its key. */
export const standingOrders = (cycles: readonly CycleOffer[]): Map<string, string[]> => new Map(cycles.map(cycle => [cycle.key, cycle.order]));

/** A picture the walk holds: its cycles' orders, and its price without churn, the two terms included. */
export interface WalkedPicture {
  orders: ReadonlyMap<string, readonly string[]>;
  price: number;
}

/**
 * The search over a picture's cycle trials as a pure walk, the lab's and the tests' version of what the page does in its
 * idle moments: each trial in turn (`nextCycleTrial`), against the picture that then stands, is priced (`price`, with
 * its churn against the standing picture, and without) and adopted when its price with churn is strictly below the
 * standing picture's own, as the search judges any trial.
 */
export function walkCycleTrials<P extends WalkedPicture>(
  first: P,
  cycles: readonly CycleOffer[],
  price: (orders: ReadonlyMap<string, readonly string[]>, standing: P) => { picture: P; withChurn: number }
): { picture: P; tried: Array<{ key: string; order: string[]; withChurn: number; price: number; adopted: boolean }> } {
  const orders = cycleOrdersOf(cycles);
  let standing = first;
  const tried: Array<{ key: string; order: string[]; withChurn: number; price: number; adopted: boolean }> = [];
  for (let step = nextCycleTrial(orders, standing.orders, 0); step; step = nextCycleTrial(orders, standing.orders, step.next)) {
    const { picture, withChurn } = price(new Map([...standing.orders, [step.trial.key, step.trial.order]]), standing);
    const adopted = withChurn < standing.price;
    tried.push({ ...step.trial, withChurn, price: picture.price, adopted });
    if (adopted) standing = picture;
  }
  return { picture: standing, tried };
}
