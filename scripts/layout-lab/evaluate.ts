/**
 * One configuration of the layout's levers, laid out and scored: the same
 * ranking, order, scene and placement the page runs, with the capture's card
 * model in the page's place, then the routes and the signals. A baseline
 * evaluation at the page's own tuning is held to the capture's truth, so the
 * lab is known to draw the page's picture before it is trusted anywhere else.
 *
 * @module layout-lab/evaluate
 */
import { applyLayoutPreset, type LayoutPreset } from "../../packages/explorer/src/client/layout-presets";
import { payloadToSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { LocalMapTuning, SymbolOrder } from "../../packages/explorer/src/client/types";
import type { BoundaryAlignment } from "../../packages/explorer/src/client/views/localView/branch-placement";
import { candidateStarts, layoutStarts, pictureScore, signalsOf, startName, startOrder, type StartSignals } from "../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches, type Scene } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration, type BranchGraph, type Exploration } from "../../packages/explorer/src/client/views/localView/branches";
import { horizontalWire, returningLinks, standingOrders, walkCycleTrials } from "../../packages/explorer/src/client/views/localView/cycle-trials";
import { addPin, EMPTY_PIN_SET, type PinSet } from "../../packages/explorer/src/client/views/pin-state";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";
import type { Capture } from "./capture";
import type { CardMetrics } from "./card-model";
import { capturedMeasurer } from "./measurer";
import { routeScene, type Route } from "./routes";
import { retainedSubject, type ScopeRun } from "./scopes";
import { measureScene, type Signals } from "./signals";

/** The levers: the Local Map tuning the layout reads. */
export interface LabConfig {
  rankingPull: number;
  rankingTie: "fewest" | "right" | "left";
  returnCost: number;
  orderSweeps: number;
  orderSeed: number | null;
  orderStarts: number;
  crossingCost: number;
  heightCost: number;
  widthCost: number;
  symbolOrder: SymbolOrder;
  columnGap: number;
  itemGap: number;
  bandGap: number;
  membraneNeck: number;
  membranePadding: number;
  cardMaxWidth: number | null;
  membraneDepth: number | null;
  membraneEvenness: number;
  membraneSimplicity: number;
  rowLevelness: number;
}

/** The levers in the order the reports name them. */
export const LEVERS: ReadonlyArray<keyof LabConfig> = ["rankingPull", "rankingTie", "returnCost", "orderSweeps", "orderSeed", "orderStarts", "crossingCost", "heightCost", "widthCost", "symbolOrder", "columnGap", "itemGap", "bandGap", "membraneNeck", "membranePadding", "cardMaxWidth", "membraneDepth", "membraneEvenness", "membraneSimplicity", "rowLevelness"];

/** The page's own tuning: the configuration the picture was designed at. */
export function baselineConfig(preset: LayoutPreset = "relaxed"): LabConfig {
  const tuning: LocalMapTuning = applyLayoutPreset(getDefaultTuning(), preset).localMap;
  return Object.fromEntries(LEVERS.map(lever => [lever, tuning[lever]])) as unknown as LabConfig;
}

/** A configuration laid out and scored, with the exploration, the scene and the routes behind the signals. */
export interface Evaluation {
  config: LabConfig;
  signals: Signals;
  ms: number;
  branches: BranchGraph;
  scene: Scene;
  routes: Route[];
  /** Every card's metrics from the card model, by id. */
  metrics: Map<string, CardMetrics>;
  /** The start whose picture this is, and every start tried with what the page would price it at. */
  start: string;
  starts: Array<{ name: string; signals: StartSignals; score: number }>;
  /** Explicit boundary equalities used for this picture; first paint has none. */
  alignments: readonly BoundaryAlignment[];
  /**
   * What the page's continuing search would make of the picture's cycles after its first paint (2026-11-16): each other
   * order tried as the search tries it, on the capture's card model, and the picture it would leave standing; null for a
   * picture with no cycle to try.
   */
  cycleSearch: CycleSearch | null;
}

/** A cycle trial's terms: the page's signals against the standing picture, the wires' horizontal length, the returning links. */
export interface CycleTerms {
  signals: StartSignals;
  horizontal: number;
  returns: number;
}

/** The search's cycle trials on a picture: every trial with its prices, and what stands after them. */
export interface CycleSearch {
  /** Each trial with its prices, and its terms as the page's search records them: the signals with the move's churn, the ranking's two. */
  tried: Array<{ key: string; order: string[]; withChurn: number; price: number; adopted: boolean; terms: CycleTerms }>;
  /** The first-drawn picture's price as the search compares it: churn aside, its ranking's two terms added. */
  firstPrice: number;
  orders: ReadonlyMap<string, readonly string[]>;
  branches: BranchGraph;
  scene: Scene;
  price: number;
}

/** The scope's pins, every file retained whole, and its subject. */
export function scopePins(run: ScopeRun): PinSet {
  return run.scope.reduce((set, file) => addPin(set, file, "*"), EMPTY_PIN_SET);
}

/**
 * The captured filters, or for older captures the filters the page read from the retained URL they were taken at (a
 * version 1 payload without filters, which means both shown); a pinned or selected file is always kept.
 */
export function includeNode(pins: PinSet, subject: string, filters = payloadToSnapshot({ v: 1 }).filters): (node: ExplorerNodePayload) => boolean {
  const pinned = new Set(pins.entries.map(pin => pin.nodeId));
  return node => {
    if (pinned.has(node.id) || node.id === subject) return true;
    const archetype = (node.archetype || "").toLowerCase();
    return !(archetype === "asset" && !filters.showAssets || archetype === "test" && !filters.showTests);
  };
}

/** A fresh scene for one fixed order, with optional equalities for an alignment trial. */
function placeConfiguration(capture: Capture, run: ScopeRun, config: LabConfig, branches: BranchGraph, alignments: readonly BoundaryAlignment[] = []): { scene: Scene; metrics: Map<string, CardMetrics> } {
  const plan = planBranches(branches, config.membranePadding);
  const measurer = capturedMeasurer(capture, branches, { pins: scopePins(run), selected: retainedSubject(run), collapseOnPin: getDefaultTuning().localMap.collapseOnPin, symbolOrder: config.symbolOrder });
  const scene = layoutScene(plan, branches, measurer, {
    columnGap: config.columnGap, itemGap: config.itemGap, bandGap: config.bandGap, neck: config.membraneNeck, bandPadding: config.membranePadding, cardMaxWidth: config.cardMaxWidth,
    evenness: config.membraneEvenness, levelness: config.rowLevelness
  }, alignments);
  return { scene, metrics: measurer.metrics };
}

/**
 * Lays out and scores one configuration of the levers over a capture, as the page draws it first, its cycles in the greedy
 * order or the orders given (the page's session memory), and beside it what the search's cycle trials would leave.
 */
export function evaluate(capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, config: LabConfig, orders?: ReadonlyMap<string, readonly string[]>): Evaluation {
  const started = performance.now();
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const center = byId.get(retainedSubject(run));
  if (!center) throw new Error(`The bundle has no file ${JSON.stringify(retainedSubject(run))}.`);
  const pins = scopePins(run);
  const explore = (orders?: ReadonlyMap<string, readonly string[]>): Exploration => exploreBranches(center, graph, pins, includeNode(pins, retainedSubject(run), capture.filters), {
    symbolOrder: config.symbolOrder,
    ranking: { pull: config.rankingPull, tie: config.rankingTie, orders },
    membraneDepth: config.membraneDepth
  });
  const exploration = explore(orders);
  // The page's own starts and choice, with the capture's card model as the measurer; the lab has no previous picture.
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(config.orderStarts, config.orderSeed, null, ranked);
  const metricsOf = new Map<Scene, Map<string, CardMetrics>>();
  const { chosen, outcomes } = layoutStarts(starts, start => {
    const branches = orderExploration(exploration, { sweeps: config.orderSweeps, ...startOrder(start) });
    const { scene, metrics } = placeConfiguration(capture, run, config, branches);
    metricsOf.set(scene, metrics);
    return { branches, scene };
  }, { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity }, config.returnCost, null);
  const { branches, scene } = chosen;
  const metrics = metricsOf.get(scene)!;
  const routes = routeScene(scene, branches, capture, metrics, getDefaultTuning().bezier);
  const signals = measureScene(scene, branches, routes);
  const cycleSearch = exploration.ranking.cycles.some(cycle => cycle.candidates.length > 1)
    ? searchCycles(capture, run, config, explore, exploration, branches, scene, chosen.score) : null;
  return {
    config, signals, ms: performance.now() - started, branches, scene, routes, metrics, alignments: [],
    start: startName(chosen.start),
    starts: outcomes.map(outcome => ({ name: startName(outcome.start), signals: outcome.signals, score: outcome.score })),
    cycleSearch
  };
}

/**
 * The search's cycle trials as the page runs them after its first paint, by the same walk (`walkCycleTrials`): each
 * trial ranked, ordered from the standing picture's own order where its files allow, laid out on the capture's card model
 * and priced by the page's price with its churn against the standing picture, the ranking's two terms added.
 */
function searchCycles(capture: Capture, run: ScopeRun, config: LabConfig, explore: (orders?: ReadonlyMap<string, readonly string[]>) => Exploration,
  exploration: Exploration, branches: BranchGraph, scene: Scene, score: number): CycleSearch {
  const costs = { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: getDefaultTuning().localMap.churnCost,
    evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
  // The first draw's price is already the search's: `layoutStarts` priced it by `pictureScore`, churn aside.
  const firstPrice = score;
  type Walked = { orders: ReadonlyMap<string, readonly string[]>; price: number; branches: BranchGraph; scene: Scene };
  const terms: CycleTerms[] = [];
  const walk = walkCycleTrials<Walked>({ orders: standingOrders(exploration.ranking.cycles), price: firstPrice, branches, scene }, exploration.ranking.cycles, (orders, standing) => {
    const trial = explore(orders);
    const starts = candidateStarts(0, null, standing.scene.tops, trial.ranking.columns.map(column => column.map(node => node.id)));
    const trialBranches = orderExploration(trial, { sweeps: config.orderSweeps, ...startOrder(starts[starts.length - 1]) });
    const { scene: trialScene } = placeConfiguration(capture, run, config, trialBranches);
    const signals = signalsOf(trialBranches, trialScene, standing.scene.tops);
    terms.push({ signals, horizontal: horizontalWire(trialScene, trialBranches), returns: returningLinks(trialBranches) });
    return {
      picture: { orders, price: pictureScore(signalsOf(trialBranches, trialScene, null), { ...costs, churn: 0 }, config.returnCost, trialScene, trialBranches), branches: trialBranches, scene: trialScene },
      withChurn: pictureScore(signals, costs, config.returnCost, trialScene, trialBranches)
    };
  });
  return { tried: walk.tried.map((trial, index) => ({ ...trial, terms: terms[index] })), firstPrice, orders: walk.picture.orders, branches: walk.picture.branches, scene: walk.picture.scene, price: walk.picture.price };
}

/** Re-solves a shown order with explicit alignment constraints, preserving its source scene and reporting the same shape price as the page. */
export function evaluateAlignment(previous: Evaluation, capture: Capture, run: ScopeRun, alignments: readonly BoundaryAlignment[]): Evaluation {
  const started = performance.now();
  const { config, branches } = previous;
  const { scene, metrics } = placeConfiguration(capture, run, config, branches, alignments);
  const routes = routeScene(scene, branches, capture, metrics, getDefaultTuning().bezier);
  const signals = signalsOf(branches, scene, previous.scene.tops);
  const score = pictureScore(signals, { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity }, config.returnCost, scene, branches);
  return {
    config, signals: measureScene(scene, branches, routes), ms: performance.now() - started, branches, scene, routes, metrics,
    start: previous.start, starts: [{ name: previous.start, signals, score }], alignments: [...alignments], cycleSearch: previous.cycleSearch
  };
}

/** Where the baseline evaluation differs from what the page showed at capture: nothing, when the model is right. */
export function driftOf(capture: Capture, evaluation: Evaluation): string[] {
  const drift: string[] = [];
  const { scene } = evaluation;
  for (const card of Object.values(capture.cards)) {
    const item = scene.items.get(card.id);
    if (!item) { drift.push(`${card.id}: not in the lab's exploration`); continue; }
    const width = Math.min(scene.widths[item.column] - 2 * item.inset, evaluation.config.cardMaxWidth ?? Infinity);
    if (width !== card.truth.width) drift.push(`${card.id}: width ${width}, page ${card.truth.width}`);
    const height = scene.heights.get(card.id);
    if (height !== card.truth.height) drift.push(`${card.id}: height ${height}, page ${card.truth.height}`);
    const metrics = evaluation.metrics.get(card.id);
    for (const [key, offset] of Object.entries(card.truth.pins)) {
      const mine = metrics?.pins.get(key);
      const rounded = mine === undefined ? undefined : Math.round(mine + 1e-3);
      if (rounded !== offset) drift.push(`${card.id} ${key}: ${rounded ?? "no pin"}, page ${offset}`);
    }
  }
  if (scene.placement.cost !== capture.truth.placementCost) drift.push(`placement measure ${scene.placement.cost}, page ${capture.truth.placementCost}`);
  if (scene.pictureWidth !== capture.truth.pictureWidth) drift.push(`picture width ${scene.pictureWidth}, page ${capture.truth.pictureWidth}`);
  if (scene.pictureHeight !== capture.truth.pictureHeight) drift.push(`picture height ${scene.pictureHeight}, page ${capture.truth.pictureHeight}`);
  for (const box of scene.boxes) {
    if (box.kind !== "directory") continue;
    const page = capture.truth.labelHeights[box.directory];
    const model = box.insetTop - box.inset;
    if (page !== undefined && model !== page) drift.push(`label ${box.directory}: height ${model}, page ${page}`);
  }
  return drift;
}
