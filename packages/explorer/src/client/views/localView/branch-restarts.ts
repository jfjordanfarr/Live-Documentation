import type { Scene } from "./branch-scene";
import type { BranchGraph, OrderOptions } from "./branches";

/**
 * The order step's restarts. Ranking and placement are exact, so running them
 * twice gives one answer; the order step is a local search, and where it ends
 * depends on where it begins. The page therefore runs it from several starts
 * (the ranking's own order, the order the previous picture stood its files in,
 * and a fixed set of seeded shuffles), lays each out with the exact placement,
 * prices each picture by what the placement knows the moment it is solved,
 * and keeps the cheapest. The starts are fixed, so the same pins give the
 * same picture every time.
 *
 * Pure-function module: no DOM. The renderer and the layout lab both run
 * their starts through `layoutStarts` with their own measurer, so the lab's
 * tabulation of the starts is the page's choice.
 *
 * @module branch-restarts
 */

/** Where the order step may begin: the ranking's own order, a shuffle by a seed, or the order the previous picture stood its files in. */
export type Start = { kind: "ranked" } | { kind: "seed"; seed: number } | { kind: "previous"; columns: string[][] };

/** What a start's picture costs beyond its vertical wire length, each in pixels of wire. */
export interface StartCosts {
  /** Per crossing of the order's own count, between adjacent columns. */
  crossing: number;
  /** Per pixel of the picture's height. */
  height: number;
  /** Per pair of cards in one column that stand the other way round from the previous picture. */
  churn: number;
}

/** The signals a start is priced on, every one known the moment its placement is solved. */
export interface StartSignals {
  /** The exact placement's measure: the wires' vertical length in pixels. */
  vertical: number;
  /** The order's own count of crossings between adjacent columns. */
  crossings: number;
  /** The picture's height in pixels. */
  height: number;
  /** Pairs of cards in one column that swapped places against the previous picture; none without one. */
  churn: number;
}

/** A start laid out and priced. */
export interface StartOutcome {
  start: Start;
  branches: BranchGraph;
  scene: Scene;
  signals: StartSignals;
  /** The vertical length plus the costs of the crossings, the height and the churn, in pixels of wire. */
  score: number;
}

/** A start's name, as the page and the lab's reports write it. */
export const startName = (start: Start): string => (start.kind === "seed" ? `seed ${start.seed}` : start.kind);

/** The order step's options for a start. */
export const startOrder = (start: Start): OrderOptions =>
  start.kind === "seed" ? { seed: start.seed } : start.kind === "previous" ? { start: start.columns } : {};

/**
 * The starts to try: the ranking's order first, the previous picture's when it showed any of these files, then the
 * shuffles by the seeds 1 to `seeds`. A forced seed is tried alone, so that a lever of the lab can ask for one start by
 * name and the page draws that start.
 */
export function candidateStarts(seeds: number, forced: number | null, previous: ReadonlyMap<string, number> | null, ranked: readonly (readonly string[])[]): Start[] {
  if (forced !== null) return [{ kind: "seed", seed: forced }];
  const starts: Start[] = [{ kind: "ranked" }];
  if (previous && ranked.some(column => column.some(id => previous.has(id)))) starts.push({ kind: "previous", columns: previousStart(ranked, previous) });
  for (let seed = 1; seed <= Math.max(0, Math.floor(seeds)); seed++) starts.push({ kind: "seed", seed });
  return starts;
}

/** Each ranked column in the order the previous picture stood its files, by their tops; the files it did not show follow in their ranked order. */
export function previousStart(ranked: readonly (readonly string[])[], previous: ReadonlyMap<string, number>): string[][] {
  return ranked.map(files => [
    ...files.filter(id => previous.has(id)).sort((a, b) => previous.get(a)! - previous.get(b)!),
    ...files.filter(id => !previous.has(id))
  ]);
}

/** Pairs of cards in one column that stand the other way round from the previous picture; cards that picture did not show count nothing. */
export function churnOf(columns: readonly (readonly string[])[], previous: ReadonlyMap<string, number> | null): number {
  if (!previous) return 0;
  let flipped = 0;
  for (const column of columns) {
    const shown = column.filter(id => previous.has(id));
    for (let i = 0; i < shown.length; i++) {
      for (let j = i + 1; j < shown.length; j++) if (previous.get(shown[i])! > previous.get(shown[j])!) flipped++;
    }
  }
  return flipped;
}

/** A start's price: its vertical length and what its crossings, its height and its churn cost, in pixels of wire. */
export function scoreOf(signals: StartSignals, costs: StartCosts): number {
  return signals.vertical + costs.crossing * signals.crossings + costs.height * signals.height + costs.churn * signals.churn;
}

/**
 * Lays out every start and keeps the cheapest. Of two at one price the earlier wins, so the ranking's own order stands
 * unless another start is cheaper, and the previous picture's stands before any shuffle.
 */
export function layoutStarts(
  starts: readonly Start[],
  layout: (start: Start) => { branches: BranchGraph; scene: Scene },
  costs: StartCosts,
  previous: ReadonlyMap<string, number> | null
): { chosen: StartOutcome; outcomes: StartOutcome[] } {
  if (starts.length === 0) throw new Error("The order step needs at least one start.");
  const outcomes: StartOutcome[] = starts.map(start => {
    const { branches, scene } = layout(start);
    const signals: StartSignals = {
      vertical: scene.placement.cost,
      crossings: branches.order.crossings,
      height: scene.pictureHeight,
      churn: churnOf(branches.columns.map(column => column.map(node => node.id)), previous)
    };
    return { start, branches, scene, signals, score: scoreOf(signals, costs) };
  });
  const chosen = outcomes.reduce((best, outcome) => (outcome.score < best.score ? outcome : best));
  return { chosen, outcomes };
}
