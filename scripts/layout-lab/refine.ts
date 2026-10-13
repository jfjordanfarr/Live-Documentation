/**
 * The page's continuing competition, run from a capture without a browser: interleave ordering seeds with neighboring
 * membrane alignments, judge both by the shared score, and regenerate alignment candidates whenever a picture wins.
 * The lab's captured card model supplies measurements; the shared scheduler and judges supply the trial sequence.
 *
 * @module layout-lab/refine
 */
import type { Capture } from "./capture";
import { evaluate, evaluateAlignment, type Evaluation, type LabConfig } from "./evaluate";
import type { ScopeRun } from "./scopes";
import type { LocalMapTuning } from "../../packages/explorer/src/client/types";
import { alignmentCandidates } from "../../packages/explorer/src/client/views/localView/branch-alignments";
import type { BoundaryAlignment } from "../../packages/explorer/src/client/views/localView/branch-placement";
import { scoreOf, signalsOf, type StartCosts, type StartSignals } from "../../packages/explorer/src/client/views/localView/branch-restarts";
import { beginSearch, judgeAlignment, judgeStart, nextTrialKind, type SearchState } from "../../packages/explorer/src/client/views/localView/branch-search";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** The continuing search's settings, with the same names and meanings as the page's tuning. */
export type RefinementSettings = Pick<LocalMapTuning, "searchStarts" | "searchPatience" | "churnCost">;

/** One priced trial, including unsuccessful trials so the complete search can be inspected. */
export interface RefinementTrial {
  kind: "seed" | "alignment";
  seed: number | null;
  start: string;
  alignments: readonly BoundaryAlignment[];
  signals: StartSignals;
  score: number;
  base: number;
  adopted: boolean;
  /** Improvement in the shown price before this trial, with churn included; positive exactly when adopted. */
  gain: number;
}

/** The initial and final pictures and the complete competition between them. */
export interface Refinement {
  initial: Evaluation;
  final: Evaluation;
  costs: StartCosts;
  settings: RefinementSettings;
  state: SearchState;
  trials: RefinementTrial[];
  alignmentTried: number;
  alignmentAdopted: number;
}

/** Runs the same finite seed budget and alignment neighborhoods as the page, using the capture's measurements. */
export function refine(capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, config: LabConfig, settings: RefinementSettings): Refinement {
  const initial = evaluate(capture, graph, run, config);
  const costs: StartCosts = { crossing: config.crossingCost, height: config.heightCost, churn: settings.churnCost,
    evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
  const from = config.orderSeed !== null ? 1 : Math.max(0, Math.floor(config.orderStarts)) + 1;
  const to = config.orderSeed !== null ? 0 : from - 1 + Math.max(0, Math.floor(settings.searchStarts));
  const alignmentEnabled = to >= from && settings.searchPatience > 0 && costs.steps > 0;
  let shown = initial;
  let state = beginSearch({ from, to, patience: Math.floor(settings.searchPatience) }, scoreOf(signalsOf(initial.branches, initial.scene, null), { ...costs, churn: 0 }));
  let alignments = alignmentEnabled ? alignmentCandidates(shown.scene) : [];
  let alignmentIndex = 0, alignmentTried = 0, alignmentAdopted = 0;
  let preferAlignment = true;
  const trials: RefinementTrial[] = [];
  for (;;) {
    const kind = nextTrialKind(state, alignmentIndex < alignments.length, preferAlignment);
    if (!kind) break;
    preferAlignment = kind === "seed";
    const seed = state.next;
    const candidate = kind === "alignment"
      ? evaluateAlignment(shown, capture, run, alignments[alignmentIndex++])
      : { ...evaluate(capture, graph, run, { ...config, orderSeed: seed, orderStarts: 0 }), config };
    if (kind === "alignment") alignmentTried++;
    const signals = signalsOf(candidate.branches, candidate.scene, shown.scene.tops);
    const score = scoreOf(signals, costs);
    const base = scoreOf(signals, { ...costs, churn: 0 });
    const gain = state.shown - score;
    const judged = (kind === "alignment" ? judgeAlignment : judgeStart)(state, score, base);
    state = judged.state;
    trials.push({ kind, seed: kind === "seed" ? seed : null, start: candidate.start, alignments: candidate.alignments, signals, score, base, adopted: judged.adopt, gain });
    if (judged.adopt) {
      if (kind === "alignment") alignmentAdopted++;
      shown = candidate;
      alignments = alignmentEnabled ? alignmentCandidates(shown.scene) : [];
      alignmentIndex = 0;
    }
  }
  return { initial, final: shown, costs, settings, state, trials, alignmentTried, alignmentAdopted };
}

/** Serializable metrics and geometry of a picture, with enough ownership and column context to inspect its shape. */
function pictureOf(evaluation: Evaluation): object {
  return {
    start: evaluation.start, alignments: evaluation.alignments, signals: evaluation.signals,
    columns: evaluation.branches.columns.map(column => column.map(node => node.id)), tops: Object.fromEntries(evaluation.scene.tops),
    membranes: evaluation.scene.boxes.filter(box => box.kind === "directory").map(box => ({ key: box.key, directory: box.directory, items: box.items, segments: box.segments }))
  };
}

/** A complete command result without the internal maps and cyclic scene ownership links. */
export function refinementJson(result: Refinement, run: ScopeRun, capture: Capture): string {
  return JSON.stringify({
    run: { bundle: run.bundle, scopeName: run.scopeName, subject: run.subject, files: run.scope }, capturedAt: capture.capturedAt,
    config: result.initial.config, settings: result.settings, costs: result.costs, initial: pictureOf(result.initial), final: pictureOf(result.final),
    state: result.state, alignmentTried: result.alignmentTried, alignmentAdopted: result.alignmentAdopted, trials: result.trials
  });
}

/** A readable companion to the complete trial and geometry JSON. */
export function renderRefinement(result: Refinement, run: ScopeRun, capture: Capture): string {
  const lines = [
    `# Layout lab, continuing refinement: ${run.bundle}, ${run.scopeName}`, "",
    `Capture: ${capture.capturedAt}. The capture supplies measurements; the page's shared scheduler, candidates and score decide each trial.`, "",
    `Costs in wire pixels: ${Object.entries(result.costs).map(([name, value]) => `${name} ${value}`).join(", ")}.`, "",
    "| Signal | First paint | Final |", "| --- | ---: | ---: |"
  ];
  for (const key of ["placementCost", "unevenness", "steps", "unlevel", "pictureHeight", "lengthPx"] as const) {
    lines.push(`| ${key} | ${result.initial.signals[key]} | ${result.final.signals[key]} |`);
  }
  lines.push("", `${result.state.tried} ordering seeds tried (${result.state.status}); ${result.alignmentTried} alignment trials, ${result.alignmentAdopted} adopted. Final price ${result.state.shown}.`, "",
    "| Trial | Kind | Start | Price | Gain | Steps | Unevenness px | Unlevel px | Adopted |",
    "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |");
  result.trials.forEach((trial, index) => lines.push(`| ${index + 1} | ${trial.kind} | ${trial.start} | ${trial.score} | ${trial.gain} | ${trial.signals.steps} | ${trial.signals.unevenness} | ${trial.signals.unlevel} | ${trial.adopted ? "yes" : "no"} |`));
  return lines.join("\n") + "\n";
}
