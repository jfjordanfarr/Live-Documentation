/**
 * One configuration of the layout's levers, laid out and scored: the same
 * ranking, order, scene and placement the page runs, with the capture's card
 * model in the page's place, then the routes and the signals. A baseline
 * evaluation at the page's own tuning is held to the capture's truth, so the
 * lab is known to draw the page's picture before it is trusted anywhere else.
 *
 * @module layout-lab/evaluate
 */
import type { Capture } from "./capture";
import type { CardMetrics } from "./card-model";
import { capturedMeasurer } from "./measurer";
import { routeScene, type Route } from "./routes";
import { retainedSubject, type ScopeRun } from "./scopes";
import { measureScene, type Signals } from "./signals";
import { applyLayoutPreset, type LayoutPreset } from "../../packages/explorer/src/client/layout-presets";
import { payloadToSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { LocalMapTuning, SymbolOrder } from "../../packages/explorer/src/client/types";
import type { BoundaryAlignment } from "../../packages/explorer/src/client/views/localView/branch-placement";
import { candidateStarts, layoutStarts, scoreOf, signalsOf, startName, startOrder, type StartSignals } from "../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches, type Scene } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration, type BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import { addPin, EMPTY_PIN_SET, type PinSet } from "../../packages/explorer/src/client/views/pin-state";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

/** The levers: the Local Map tuning the layout reads. */
export interface LabConfig {
  rankingPull: number;
  rankingTie: "fewest" | "right" | "left";
  orderSweeps: number;
  orderSeed: number | null;
  orderStarts: number;
  crossingCost: number;
  heightCost: number;
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
export const LEVERS: ReadonlyArray<keyof LabConfig> = ["rankingPull", "rankingTie", "orderSweeps", "orderSeed", "orderStarts", "crossingCost", "heightCost", "symbolOrder", "columnGap", "itemGap", "bandGap", "membraneNeck", "membranePadding", "cardMaxWidth", "membraneDepth", "membraneEvenness", "membraneSimplicity", "rowLevelness"];

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

/** Lays out and scores one configuration of the levers over a capture. */
export function evaluate(capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, config: LabConfig): Evaluation {
  const started = performance.now();
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const center = byId.get(retainedSubject(run));
  if (!center) throw new Error(`The bundle has no file ${JSON.stringify(retainedSubject(run))}.`);
  const pins = scopePins(run);
  const exploration = exploreBranches(center, graph, pins, includeNode(pins, retainedSubject(run), capture.filters), {
    symbolOrder: config.symbolOrder,
    ranking: { pull: config.rankingPull, tie: config.rankingTie },
    membraneDepth: config.membraneDepth
  });
  // The page's own starts and choice, with the capture's card model as the measurer; the lab has no previous picture.
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(config.orderStarts, config.orderSeed, null, ranked);
  const metricsOf = new Map<Scene, Map<string, CardMetrics>>();
  const { chosen, outcomes } = layoutStarts(starts, start => {
    const branches = orderExploration(exploration, { sweeps: config.orderSweeps, ...startOrder(start) });
    const { scene, metrics } = placeConfiguration(capture, run, config, branches);
    metricsOf.set(scene, metrics);
    return { branches, scene };
  }, { crossing: config.crossingCost, height: config.heightCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity }, null);
  const { branches, scene } = chosen;
  const metrics = metricsOf.get(scene)!;
  const routes = routeScene(scene, branches, capture, metrics, getDefaultTuning().bezier);
  const signals = measureScene(scene, branches, routes);
  return {
    config, signals, ms: performance.now() - started, branches, scene, routes, metrics, alignments: [],
    start: startName(chosen.start),
    starts: outcomes.map(outcome => ({ name: startName(outcome.start), signals: outcome.signals, score: outcome.score }))
  };
}

/** Re-solves a shown order with explicit alignment constraints, preserving its source scene and reporting the same shape price as the page. */
export function evaluateAlignment(previous: Evaluation, capture: Capture, run: ScopeRun, alignments: readonly BoundaryAlignment[]): Evaluation {
  const started = performance.now();
  const { config, branches } = previous;
  const { scene, metrics } = placeConfiguration(capture, run, config, branches, alignments);
  const routes = routeScene(scene, branches, capture, metrics, getDefaultTuning().bezier);
  const signals = signalsOf(branches, scene, previous.scene.tops);
  const score = scoreOf(signals, { crossing: config.crossingCost, height: config.heightCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity });
  return {
    config, signals: measureScene(scene, branches, routes), ms: performance.now() - started, branches, scene, routes, metrics,
    start: previous.start, starts: [{ name: previous.start, signals, score }], alignments: [...alignments]
  };
}

/** Where the baseline evaluation differs from what the page showed at capture: nothing, when the model is right. */
export function driftOf(capture: Capture, evaluation: Evaluation): string[] {
  const drift: string[] = [];
  const { scene } = evaluation;
  for (const card of Object.values(capture.cards)) {
    const item = scene.items.get(card.id);
    if (!item) { drift.push(`${card.id}: not in the lab's exploration`); continue; }
    const width = scene.widths[item.column] - 2 * item.inset;
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
