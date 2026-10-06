/**
 * The order step's restarts tabulated: every start of a scope laid out alone,
 * with what the page prices a start at the moment its placement is solved
 * (the vertical length, the order's own crossings, the picture's height, the
 * churn against the ranked start's picture) beside what the deck would read
 * of its drawn picture (the length, the crossing spots, the samples over
 * foreign membranes, the escaping wires), and a trial of the costs: at each
 * setting of the crossing and height costs, which start the page would keep
 * and how that start stands by the full weighted score. The costs in the
 * Local Map's tuning are set from this table, so that the page's cheap choice
 * agrees with the full picture.
 *
 * @module layout-lab/restarts
 */
import type { Capture } from "./capture";
import { evaluate, type LabConfig } from "./evaluate";
import type { ScopeRun } from "./scopes";
import type { Signals } from "./signals";
import { scoreOf as fullScoreOf, type Weights } from "./sweep";
import { churnOf, scoreOf, type StartCosts, type StartSignals } from "../../packages/explorer/src/client/views/localView/branch-restarts";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** One start laid out alone: what the page would price it at, and what the deck would read of its picture. */
export interface StartRow {
  name: string;
  cheap: StartSignals;
  signals: Signals;
  ms: number;
}

/** The costs tried by default: a crossing at nothing to forty pixels of wire, a pixel of height at nothing to five. */
export const DEFAULT_COST_GRID = "crossing=0,5,10,20,40;height=0,1,2,5";

/** `crossing=a,b;height=c,d`: every combination, the churn cost nothing, since the lab has no previous picture. */
export function parseCosts(spec: string | undefined): StartCosts[] {
  const lists: Record<string, number[]> = { crossing: [0], height: [0] };
  for (const part of (spec ?? DEFAULT_COST_GRID).split(";").map(s => s.trim()).filter(Boolean)) {
    const [name, list] = part.split("=").map(s => s.trim());
    if (!(name in lists)) throw new Error(`No cost ${JSON.stringify(name)}; the costs are crossing and height.`);
    lists[name] = (list ?? "").split(",").map(s => Number(s.trim())).filter(value => Number.isFinite(value));
  }
  return lists.crossing.flatMap(crossing => lists.height.map(height => ({ crossing, height, churn: 0 })));
}

/** Every start alone: the ranked order first, then the seeds 1 to `seeds`; each start's churn is against the ranked start's picture. */
export function tabulateStarts(capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, config: LabConfig, seeds: number): StartRow[] {
  const alone = (seed: number | null) => evaluate(capture, graph, run, { ...config, orderSeed: seed, orderStarts: 0 });
  const ranked = alone(null);
  const evaluations = [ranked, ...Array.from({ length: Math.max(0, seeds) }, (_, i) => alone(i + 1))];
  return evaluations.map(evaluation => ({
    name: evaluation.start,
    cheap: { ...evaluation.starts[0].signals, churn: churnOf(evaluation.branches.columns.map(column => column.map(node => node.id)), ranked.scene.tops) },
    signals: evaluation.signals,
    ms: evaluation.ms
  }));
}

/** One setting of the costs tried: the start the page would keep, the start the full score prefers, and both by the full score. */
export interface CostTrial {
  costs: StartCosts;
  pick: StartRow;
  best: StartRow;
  pickScore: number;
  bestScore: number;
}

/** At each setting of the costs, the page's pick and the full score's, the ranked start scoring the sum of the weights by definition. */
export function trialCosts(rows: readonly StartRow[], grid: readonly StartCosts[], weights: Weights): CostTrial[] {
  if (rows.length === 0) throw new Error("No starts to try.");
  const base = rows[0].signals;
  const full = (row: StartRow): number => fullScoreOf(row.signals, base, weights);
  const best = rows.reduce((a, b) => (full(b) < full(a) ? b : a));
  return grid.map(costs => {
    const pick = rows.reduce((a, b) => (scoreOf(b.cheap, costs) < scoreOf(a.cheap, costs) ? b : a));
    return { costs, pick, best, pickScore: full(pick), bestScore: full(best) };
  });
}

const n = (value: number): string => Math.round(value).toLocaleString("en-US");
const pct = (value: number, base: number): string => (base === 0 ? "n/a" : `${value >= base ? "+" : ""}${(((value - base) / base) * 100).toFixed(1)}%`);

/** The tabulation as a person reads it. */
export function renderRestarts(run: ScopeRun, rows: readonly StartRow[], trials: readonly CostTrial[], weights: Weights, capture: Capture, startedAt: string): string {
  const base = rows[0];
  const full = (row: StartRow): string => fullScoreOf(row.signals, base.signals, weights).toFixed(3);
  const lines: string[] = [];
  lines.push(`# Layout lab, the order step's starts: ${run.bundle}, ${run.scopeName}`, "");
  lines.push(`_Run ${startedAt}, over a capture of ${capture.capturedAt} (${capture.userAgent.replace(/^.*?(Chrome\/[\d.]+).*$/u, "$1")}). ${rows.length} starts, each laid out alone at the page's tuning. Full-score weights: ${Object.entries(weights).map(([k, v]) => `${k} ${v}`).join(", ")}; the ranked start scores ${Object.values(weights).reduce((a, b) => a + (b ?? 0), 0).toFixed(3)} by definition._`, "");
  lines.push("## Every start", "");
  lines.push("What the page prices a start at the moment its placement is solved (the first four columns), and what the deck would read of the picture it draws (the rest).", "");
  lines.push("| Start | Vertical px (placement) | Order crossings | Height px | Churn vs ranked | Length px (vs ranked) | Crossing spots (vs ranked) | Foreign samples | Escaping wires / samples | Full score | ms |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of rows) {
    const s = row.signals;
    lines.push(`| ${row.name} | ${n(row.cheap.vertical)} (${pct(row.cheap.vertical, base.cheap.vertical)}) | ${row.cheap.crossings} (${pct(row.cheap.crossings, base.cheap.crossings)}) | ${n(row.cheap.height)} | ${row.cheap.churn} | ${n(s.lengthPx)} (${pct(s.lengthPx, base.signals.lengthPx)}) | ${s.crossings.spots} (${pct(s.crossings.spots, base.signals.crossings.spots)}) | ${s.foreignSamples} | ${s.escapingWires} / ${s.escapingSamples} | ${full(row)} | ${row.ms.toFixed(0)} |`);
  }
  lines.push("", "## The costs tried", "");
  lines.push("At each setting, the start the page would keep (the cheapest by its vertical length plus the costs) and how it stands by the full score beside the start the full score prefers.", "");
  lines.push("| Crossing cost px | Height cost px | The page keeps | Its full score | The full score prefers | Its full score | Agree |");
  lines.push("| ---: | ---: | --- | ---: | --- | ---: | --- |");
  for (const trial of trials) {
    lines.push(`| ${trial.costs.crossing} | ${trial.costs.height} | ${trial.pick.name} | ${trial.pickScore.toFixed(3)} | ${trial.best.name} | ${trial.bestScore.toFixed(3)} | ${trial.pick === trial.best ? "yes" : "no"} |`);
  }
  lines.push("", "## What the numbers are", "");
  lines.push("- The vertical length is the exact placement's measure, the wires' vertical distances summed; the order's crossings are its own count between adjacent columns, a bundle's shared run counted once; the height is the picture's. The page knows these three the moment a start is placed, and prices a start by the vertical length plus the costs.");
  lines.push("- The churn is the number of pairs of cards in one column that stand the other way round from the ranked start's picture, the signal the page prices against its previous picture.");
  lines.push("- The length, the crossing spots, the foreign samples and the escaping wires are the deck's signals over the routed wires, which the page does not compute; the full score weighs them as the sweeps do.");
  return lines.join("\n") + "\n";
}
