/**
 * A run's report: what was captured and whether the model matched the page,
 * the baseline's signals, what each lever does alone, the best configurations
 * found and the trade between length and crossings, as markdown a person
 * reads and as JSON the next analysis loads.
 *
 * @module layout-lab/report
 */
import type { Capture } from "./capture";
import { LEVERS, type LabConfig } from "./evaluate";
import type { ScopeRun } from "./scopes";
import type { Signals } from "./signals";
import { paretoFront, scoreOf, type Weights } from "./sweep";

/** One configuration's signals and the time its solve took. */
export interface ReportRow {
  config: LabConfig;
  signals: Signals;
  ms: number;
}

/** Everything a run found, for the markdown and the JSON. */
export interface RunReport {
  run: ScopeRun;
  capturedAt: string;
  warnings: string[];
  drift: string[];
  baseline: ReportRow;
  oneAtATime: Array<{ lever: keyof LabConfig; value: LabConfig[keyof LabConfig]; row: ReportRow }>;
  rows: ReportRow[];
  weights: Weights;
  grid: string;
  seed: number;
  startedAt: string;
  finishedAt: string;
}

const n = (value: number): string => Math.round(value).toLocaleString("en-US");
const pct = (value: number, base: number): string => (base === 0 ? "n/a" : `${value >= base ? "+" : ""}${(((value - base) / base) * 100).toFixed(1)}%`);
const show = (value: LabConfig[keyof LabConfig]): string => (value === null ? "none" : String(value));

/** The levers of a configuration that differ from the baseline, as `lever=value`. */
export function differences(config: LabConfig, baseline: LabConfig): string {
  const parts = LEVERS.filter(lever => config[lever] !== baseline[lever]).map(lever => `${lever}=${show(config[lever])}`);
  return parts.length ? parts.join(" ") : "baseline";
}

function signalCells(s: Signals, base: Signals): string {
  return `${n(s.lengthPx)} (${pct(s.lengthPx, base.lengthPx)}) | ${n(s.horizontalPx)} | ${n(s.verticalPx)} | ${s.crossings.spots} (${pct(s.crossings.spots, base.crossings.spots)}) | ${s.foreignSamples} | ${s.escapingWires} / ${s.escapingSamples} | ${s.passages} | ${s.backward} | ${s.columns} | ${n(s.pictureWidth)} × ${n(s.pictureHeight)} | ${n(s.placementCost)} | ${n(s.unevenness)} | ${n(s.unlevel)}`;
}

const HEADER = "| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |";
const RULE = "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |";

/** The run as a person reads it. */
export function renderMarkdown(report: RunReport, capture: Capture): string {
  const { run, baseline, weights } = report;
  const score = (row: ReportRow): string => scoreOf(row.signals, baseline.signals, weights).toFixed(3);
  const line = (label: string, row: ReportRow): string => `| ${label} | ${signalCells(row.signals, baseline.signals)} | ${score(row)} |`;
  const lines: string[] = [];
  lines.push(`# Layout lab: ${run.bundle}, ${run.scopeName}`, "");
  lines.push(`_Run started ${report.startedAt}, finished ${report.finishedAt}, over a capture of ${report.capturedAt} (${capture.userAgent.replace(/^.*?(Chrome\/[\d.]+).*$/u, "$1")}). ${report.rows.length} configurations, ${report.oneAtATime.length} of them one lever at a time, from the grid \`${report.grid}\` with seed ${report.seed}. Weights: ${Object.entries(weights).map(([k, v]) => `${k} ${v}`).join(", ")}; the baseline scores ${Object.values(weights).reduce((a, b) => a + (b ?? 0), 0).toFixed(3)} by definition._`, "");
  lines.push("## The model against the page", "");
  if (report.drift.length === 0) lines.push("The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.");
  else lines.push(`The baseline configuration differs from the page in ${report.drift.length} place${report.drift.length === 1 ? "" : "s"}:`, "", ...report.drift.map(d => `- ${d}`));
  lines.push("");
  if (report.warnings.length) lines.push(`Pretext's layout disagreed with the page by more than half a pixel on ${report.warnings.length} text${report.warnings.length === 1 ? "" : "s"} at capture:`, "", ...report.warnings.slice(0, 20).map(w => `- ${w}`), ...(report.warnings.length > 20 ? [`- and ${report.warnings.length - 20} more`] : []), "");
  else lines.push("Pretext's layout agreed with the page on every text at capture.", "");
  lines.push("## The baseline", "", HEADER, RULE, line("baseline", baseline), "");
  lines.push("## Each lever alone", "", "Every lever moved by itself from the baseline, the others held.", "");
  let current: string | null = null;
  for (const entry of report.oneAtATime) {
    if (entry.lever !== current) { current = entry.lever; lines.push("", `### ${entry.lever}`, "", HEADER, RULE); }
    lines.push(line(`${entry.lever}=${show(entry.value)}`, entry.row));
  }
  lines.push("", "## The best found, by the weighted score", "", HEADER, RULE);
  const ranked = [...report.rows].sort((a, b) => scoreOf(a.signals, baseline.signals, weights) - scoreOf(b.signals, baseline.signals, weights));
  for (const row of ranked.slice(0, 12)) lines.push(line(differences(row.config, baseline.config), row));
  lines.push("", "## The trade between length and crossings", "", "The configurations no other beats on both the length and the crossing spots, shortest first.", "", HEADER, RULE);
  for (const row of paretoFront(report.rows)) lines.push(line(differences(row.config, baseline.config), row));
  lines.push("", "## What the numbers are", "");
  lines.push("- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.");
  lines.push("- Crossing spots are the deck's own count over the same sampled routes.");
  lines.push("- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.");
  lines.push("- A note under a card the page never showed (\"+N symbols\", \"N references read back\") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.");
  lines.push(`- A solve took ${(report.rows.reduce((sum, row) => sum + row.ms, 0) / Math.max(1, report.rows.length)).toFixed(0)} ms on average.`);
  return lines.join("\n") + "\n";
}

/** The run as the next analysis loads it, the scope reduced to its names. */
export function toJson(report: RunReport): string {
  return JSON.stringify({ ...report, run: { bundle: report.run.bundle, scopeName: report.run.scopeName, subject: report.run.subject, files: report.run.scope } });
}
