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
 * agrees with the full picture. Since 2026-10-07 the table also runs the
 * page's continuing search over the same starts at each of several churn
 * costs: the first paint, each picture the search would move to, what the
 * move gains and how many pairs of cards it swaps, and where the search stops.
 * The wider space (`widenStarts`, the owner's ask of 2026-10-07) tabulates the
 * starts again at every setting of the ranking's pull and tie rule and the
 * order's sweeps, and says for each setting which start the page's price
 * keeps, which the full score prefers, and where the page's search would end.
 *
 * @module layout-lab/restarts
 */
import type { Capture } from "./capture";
import { evaluate, type LabConfig } from "./evaluate";
import { differences } from "./report";
import type { ScopeRun } from "./scopes";
import type { Signals } from "./signals";
import { configurations, scoreOf as fullScoreOf, type LeverValues, type Weights } from "./sweep";
import { churnOf, scoreOf, type StartCosts, type StartSignals } from "../../packages/explorer/src/client/views/localView/branch-restarts";
import { beginSearch, judgeStart } from "../../packages/explorer/src/client/views/localView/branch-search";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** One start laid out alone: what the page would price it at, and what the deck would read of its picture. */
export interface StartRow {
  name: string;
  /** The seed, or null for the ranking's own order. */
  seed: number | null;
  cheap: StartSignals;
  signals: Signals;
  ms: number;
  /** The files of each column, top to bottom, and each card's top, by which the churn between any two pictures is counted. */
  columns: string[][];
  tops: Record<string, number>;
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
  return evaluations.map((evaluation, index) => ({
    name: evaluation.start,
    seed: index === 0 ? null : index,
    cheap: { ...evaluation.starts[0].signals, churn: churnOf(evaluation.branches.columns.map(column => column.map(node => node.id)), ranked.scene.tops) },
    signals: evaluation.signals,
    ms: evaluation.ms,
    columns: evaluation.branches.columns.map(column => column.map(node => node.id)),
    tops: Object.fromEntries(evaluation.scene.tops)
  }));
}

/** One picture the search would move to: the start, what the move gains in the shown picture's own price, the pairs of cards it swaps, and after how many starts. */
export interface Adoption {
  row: StartRow;
  gain: number;
  pairs: number;
  tried: number;
}

/** The page's search simulated at one churn cost over the tabulated starts. */
export interface SearchTrial {
  churn: number;
  /** The first paint: the cheapest of the ranking's order and the seeds the page tries before paint. */
  first: StartRow;
  adoptions: Adoption[];
  tried: number;
  stopped: "settled" | "capped";
  final: StartRow;
}

/**
 * The page's sequence at each churn cost: the first paint is the cheapest of the ranking's order and the first
 * `orderStarts` seeds by the costs, churn aside; then each further seed in order is priced with its churn against the
 * shown picture and adopted when that beats the shown picture's own price, by the page's own judge, until the patience
 * or the last tabulated seed. The pictures must be tabulated in seed order, the ranking's first.
 */
export function simulateSearch(rows: readonly StartRow[], costs: StartCosts, churnCosts: readonly number[], orderStarts: number, patience: number): SearchTrial[] {
  const base = (row: StartRow): number => scoreOf(row.cheap, { ...costs, churn: 0 });
  const seeds = rows.filter(row => row.seed !== null).sort((a, b) => a.seed! - b.seed!);
  const last = seeds.length ? seeds[seeds.length - 1].seed! : 0;
  return churnCosts.map(churn => {
    const first = rows.filter(row => row.seed === null || row.seed <= orderStarts).reduce((best, row) => (base(row) < base(best) ? row : best));
    let shown = first;
    let state = beginSearch({ from: orderStarts + 1, to: last, patience }, base(first));
    const adoptions: Adoption[] = [];
    for (const row of seeds) {
      if (row.seed! <= orderStarts || state.status !== "running") continue;
      const pairs = churnOf(row.columns, new Map(Object.entries(shown.tops)));
      const judged = judgeStart(state, base(row) + churn * pairs, base(row));
      state = judged.state;
      if (judged.adopt) { adoptions.push({ row, gain: base(shown) - base(row), pairs, tried: state.tried }); shown = row; }
    }
    return { churn, first, adoptions, tried: state.tried, stopped: state.status === "settled" ? "settled" : "capped", final: shown };
  });
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
export function renderRestarts(run: ScopeRun, rows: readonly StartRow[], trials: readonly CostTrial[], weights: Weights, capture: Capture, startedAt: string, search?: { trials: readonly SearchTrial[]; costs: StartCosts; orderStarts: number; patience: number }): string {
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
  if (search) {
    lines.push("", "## The search, simulated", "");
    lines.push(`The page's continuing search over these starts: the first paint is the cheapest of the ranking's order and the first ${search.orderStarts} seeds; each later seed is adopted when its price with its churn against the shown picture beats the shown picture's own; the search settles after ${search.patience} starts none of which betters the best price found, churn aside, or caps at the last seed. The gain is in the shown picture's own price, churn aside; the pairs are the cards of one column that swap places.`, "");
    lines.push(`| Churn cost px/pair | First paint | Moves (seed: gain, pairs swapped, after n starts) | Starts tried | Stopped | Final | Final price at crossing ${search.costs.crossing}, height ${search.costs.height} (vs first) | Final full score |`);
    lines.push("| ---: | --- | --- | ---: | --- | --- | ---: | ---: |");
    for (const trial of search.trials) {
      const firstBase = scoreOf(trial.first.cheap, { ...search.costs, churn: 0 });
      const finalBase = scoreOf(trial.final.cheap, { ...search.costs, churn: 0 });
      const moves = trial.adoptions.length ? trial.adoptions.map(a => `${a.row.name}: −${n(a.gain)}, ${a.pairs}, after ${a.tried}`).join("; ") : "none";
      lines.push(`| ${trial.churn} | ${trial.first.name} | ${moves} | ${trial.tried} | ${trial.stopped} | ${trial.final.name} | ${n(finalBase)} (${pct(finalBase, firstBase)}) | ${full(trial.final)} |`);
    }
  }
  lines.push("", "## What the numbers are", "");
  lines.push("- The vertical length is the exact placement's measure, the wires' vertical distances summed; the order's crossings are its own count between adjacent columns, a bundle's shared run counted once; the height is the picture's. The page knows these three the moment a start is placed, and prices a start by the vertical length plus the costs.");
  lines.push("- The churn is the number of pairs of cards in one column that stand the other way round from the ranked start's picture, the signal the page prices against its previous picture.");
  lines.push("- The length, the crossing spots, the foreign samples and the escaping wires are the deck's signals over the routed wires, which the page does not compute; the full score weighs them as the sweeps do.");
  return lines.join("\n") + "\n";
}

// ─── The wider space ────────────────────────────────────────────────────

/** The levers of the ranking and the order the wider space walks by default: every pull, tie rule and sweep count the design has stood at or near. */
export const DEFAULT_WIDE_GRID = "rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8";

/** One setting of the ranking's and the order's levers: its starts, and the start each judge would keep. */
export interface WideSetting {
  config: LabConfig;
  /** The levers that differ from the page's own setting, as the reports name them, or "baseline". */
  setting: string;
  rows: StartRow[];
  /** The ranked start's full score, against the baseline setting's ranked start as every score here is. */
  rankedScore: number;
  /** The start the page's price keeps of all at this setting, and its full score. */
  cheapest: StartRow;
  cheapestScore: number;
  /** The start the full score prefers at this setting, and its score. */
  best: StartRow;
  bestScore: number;
  /** The page's search at this setting, and where it ends by the full score. */
  search: SearchTrial;
  searchScore: number;
  /** The mean time of a start in the lab, in milliseconds. */
  msPerStart: number;
}

/**
 * A setting summarized from its tabulated starts: the start the page's price keeps (the costs, churn aside), the start the
 * full score prefers against `base` (the baseline setting's ranked start), and the page's search at `churn` from the first
 * `first` seeds with the patience.
 */
export function summarizeSetting(config: LabConfig, setting: string, rows: readonly StartRow[], base: Signals, weights: Weights, costs: StartCosts, churn: number, first: number, patience: number): WideSetting {
  if (rows.length === 0) throw new Error("No starts to summarize.");
  const price = (row: StartRow): number => scoreOf(row.cheap, { ...costs, churn: 0 });
  const full = (row: StartRow): number => fullScoreOf(row.signals, base, weights);
  const cheapest = rows.reduce((a, b) => (price(b) < price(a) ? b : a));
  const best = rows.reduce((a, b) => (full(b) < full(a) ? b : a));
  const [search] = simulateSearch(rows, costs, [churn], first, patience);
  return {
    config, setting, rows: [...rows], rankedScore: full(rows[0]), cheapest, cheapestScore: full(cheapest), best, bestScore: full(best),
    search, searchScore: full(search.final), msPerStart: rows.reduce((sum, row) => sum + row.ms, 0) / rows.length
  };
}

/**
 * Every setting of the grid, the baseline first, with its starts tabulated and summarized; every full score is against
 * the baseline setting's ranked start, so the settings compare. `progress` hears each setting as it is done.
 */
export function widenStarts(
  capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, baseline: LabConfig, grid: readonly LeverValues[], seeds: number,
  weights: Weights, costs: StartCosts, churn: number, first: number, patience: number,
  progress?: (setting: string, done: number, count: number) => void
): WideSetting[] {
  const configs = configurations(baseline, grid, Number.POSITIVE_INFINITY, 0);
  const settings: WideSetting[] = [];
  let base: Signals | null = null;
  configs.forEach((config, index) => {
    const setting = differences(config, baseline);
    const rows = tabulateStarts(capture, graph, run, config, seeds);
    base ??= rows[0].signals;
    settings.push(summarizeSetting(config, setting, rows, base, weights, costs, churn, first, patience));
    progress?.(setting, index + 1, configs.length);
  });
  return settings;
}

/** The wider space as a person reads it: every setting on one line, then the settings ranked three ways. */
export function renderWide(run: ScopeRun, settings: readonly WideSetting[], weights: Weights, capture: Capture, startedAt: string, grid: string, judge: { costs: StartCosts; churn: number; first: number; patience: number }): string {
  if (settings.length === 0) throw new Error("No settings to render.");
  const starts = settings[0].rows.length;
  const lines: string[] = [];
  const startCells = (row: StartRow, score: number): string => `${row.name} | ${score.toFixed(3)} | ${n(row.signals.lengthPx)} | ${row.signals.crossings.spots} | ${row.signals.foreignSamples} | ${row.signals.escapingWires}`;
  lines.push(`# Layout lab, the wider space: ${run.bundle}, ${run.scopeName}`, "");
  lines.push(`_Run ${startedAt}, over a capture of ${capture.capturedAt} (${capture.userAgent.replace(/^.*?(Chrome\/[\d.]+).*$/u, "$1")}). ${settings.length} settings of the grid \`${grid}\`, each with ${starts} starts laid out alone (the ranking's order and the seeds 1 to ${starts - 1}), ${(settings.length * starts).toLocaleString("en-US")} layouts in all. Full-score weights: ${Object.entries(weights).map(([k, v]) => `${k} ${v}`).join(", ")}; the baseline setting's ranked start scores ${Object.values(weights).reduce((a, b) => a + (b ?? 0), 0).toFixed(3)} by definition, and every start of every setting is scored against it. The page's price is the vertical length plus ${judge.costs.crossing} px a crossing and ${judge.costs.height} px a pixel of height; the search is simulated at ${judge.churn} px a swapped pair from a first paint of the ranking's order and the first ${judge.first} seeds, with a patience of ${judge.patience}._`, "");
  lines.push("## Every setting", "");
  lines.push("For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.", "");
  lines.push("| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Spots | Foreign | Escaping | Search: first paint | Moves | Final | Its full |");
  lines.push("| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |");
  for (const s of settings) {
    const moves = s.search.adoptions.length ? s.search.adoptions.map(a => `${a.row.name} after ${a.tried}`).join("; ") : "none";
    lines.push(`| ${s.setting} | ${s.msPerStart.toFixed(0)} | ${s.rankedScore.toFixed(3)} | ${s.cheapest.name} | ${s.cheapestScore.toFixed(3)} | ${startCells(s.best, s.bestScore)} | ${s.search.first.name} | ${moves} | ${s.search.final.name} | ${s.searchScore.toFixed(3)} |`);
  }
  const ranked = (title: string, intro: string, pick: (s: WideSetting) => { row: StartRow; score: number }, count = 10): void => {
    lines.push("", `## ${title}`, "", intro, "");
    lines.push("| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |");
    lines.push("| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |");
    [...settings].map(s => ({ s, ...pick(s) })).sort((a, b) => a.score - b.score).slice(0, count).forEach((entry, index) => {
      lines.push(`| ${index + 1} | ${entry.s.setting} | ${startCells(entry.row, entry.score)} |`);
    });
  };
  ranked("The settings by where the search ends", "What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.", s => ({ row: s.search.final, score: s.searchScore }));
  ranked("The settings by their best start", "What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.", s => ({ row: s.best, score: s.bestScore }));
  ranked("The settings by the page's price", "The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.", s => ({ row: s.cheapest, score: s.cheapestScore }));
  lines.push("", "## What the numbers are", "");
  lines.push("- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.");
  lines.push("- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.");
  lines.push("- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.");
  return lines.join("\n") + "\n";
}
