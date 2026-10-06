#!/usr/bin/env node
/**
 * The layout lab: a headless sweep over the Local Map's layout levers, each
 * configuration laid out by the page's own ranking, order, scene and
 * placement with a capture of the page's cards in the page's place, scored
 * on the signals the still-picture deck reads, and reported for a person to
 * read. Three verbs:
 *
 *   npm run layout:lab -- capture <bundle/scope> [--out <dir>]
 *   npm run layout:lab -- sweep <bundle/scope> [--capture <file>] [--grid <spec>] [--sample <n>] [--seed <n>] [--weights k=v,...] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- verify <bundle/scope> --config <json or @file> [--capture <file>] [--shot <png>]
 *
 * The scopes are the deck's: repository/five, repository/chain, estate/five,
 * estate/chain. The bundles must be built first (`npm run live-docs:visualize`
 * and `:estate`). Reports go under the day's probe folder unless `--out` says
 * otherwise.
 */
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { captureScope, readCaptureFile, writeCapture, type Capture } from "./capture";
import { baselineConfig, driftOf, evaluate, type LabConfig } from "./evaluate";
import { differences, renderMarkdown, toJson, type ReportRow, type RunReport } from "./report";
import { findScope, loadBundleGraph, scopeSlug, type ScopeRun } from "./scopes";
import { configurations, DEFAULT_GRID, oneAtATime, parseGrid, parseWeights } from "./sweep";
import { compareTable, verifyConfig } from "./verify";

interface Args {
  verb: string;
  scope: string;
  options: Record<string, string>;
}

function parseArgs(argv: readonly string[]): Args {
  const [verb, scope, ...rest] = argv;
  const options: Record<string, string> = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const name = token.slice(2);
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith("--")) { options[name] = next; i++; }
    else options[name] = "true";
  }
  return { verb: verb ?? "", scope: scope ?? "", options };
}

const today = (): string => new Date().toISOString().slice(0, 10);

const defaultOut = (): string => path.resolve(__dirname, "../../AI-Agent-Workspace/Probes", today(), "layout-lab");

async function loadCapture(run: ScopeRun, options: Record<string, string>): Promise<Capture> {
  const file = options.capture ?? path.join(options.out ?? defaultOut(), `capture-${scopeSlug(run)}.json`);
  try {
    return await readCaptureFile(file);
  } catch {
    throw new Error(`No capture at ${file}; run \`npm run layout:lab -- capture ${run.bundle}/${run.scopeName}\` first.`);
  }
}

async function main(): Promise<void> {
  const { verb, scope, options } = parseArgs(process.argv.slice(2));
  if (!verb || !scope) {
    console.error("Usage: layout-lab <capture|sweep|verify> <bundle/scope> [options]");
    process.exit(2);
  }
  const run = findScope(scope);
  const out = options.out ?? defaultOut();
  if (verb === "capture") {
    const capture = await captureScope(run);
    const file = path.join(out, `capture-${scopeSlug(run)}.json`);
    await writeCapture(capture, file);
    console.log(`Captured ${Object.keys(capture.cards).length} cards and ${Object.keys(capture.labels).length} labels of ${run.bundle}/${run.scopeName} into ${path.relative(process.cwd(), file)} (${(await fs.stat(file)).size.toLocaleString("en-US")} bytes).`);
    if (capture.warnings.length) {
      console.log(`Pretext disagreed with the page on ${capture.warnings.length} text(s):`);
      for (const warning of capture.warnings.slice(0, 10)) console.log(`  ${warning}`);
    } else {
      console.log("Pretext agreed with the page on every text.");
    }
    // The drift check, right away: the baseline through the lab against the page just read.
    const graph = await loadBundleGraph(run);
    const baseline = evaluate(capture, graph, run, baselineConfig());
    const drift = driftOf(capture, baseline);
    console.log(drift.length ? `The model drifts from the page in ${drift.length} place(s):\n  ${drift.join("\n  ")}` : `The model reproduces the page to the pixel (placement measure ${baseline.signals.placementCost.toLocaleString("en-US")}, ${baseline.signals.lengthPx.toLocaleString("en-US")} px of wire).`);
    return;
  }
  if (verb === "sweep") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const startedAt = new Date().toISOString();
    const baselineConfiguration = baselineConfig();
    const gridSpec = options.grid ?? DEFAULT_GRID;
    const grid = parseGrid(gridSpec);
    const seed = Number(options.seed ?? 1);
    const limit = Number(options.sample ?? 400);
    const weights = parseWeights(options.weights);
    const evaluateRow = (config: LabConfig): ReportRow => {
      const found = evaluate(capture, graph, run, config);
      return { config, signals: found.signals, ms: found.ms };
    };
    const baselineEvaluation = evaluate(capture, graph, run, baselineConfiguration);
    const drift = driftOf(capture, baselineEvaluation);
    const baseline: ReportRow = { config: baselineConfiguration, signals: baselineEvaluation.signals, ms: baselineEvaluation.ms };
    const singles = oneAtATime(baselineConfiguration, grid).map(entry => ({ ...entry, row: evaluateRow(entry.config) }));
    const sampled = configurations(baselineConfiguration, grid, limit, seed);
    const rows: ReportRow[] = [baseline, ...singles.map(s => s.row)];
    const seen = new Set(rows.map(row => JSON.stringify(row.config)));
    let done = 0;
    for (const config of sampled) {
      const key = JSON.stringify(config);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(evaluateRow(config));
      if (++done % 50 === 0) console.log(`  ${done} of ${sampled.length} sampled configurations`);
    }
    const report: RunReport = { run, capturedAt: capture.capturedAt, warnings: capture.warnings, drift, baseline, oneAtATime: singles, rows, weights, grid: gridSpec, seed, startedAt, finishedAt: new Date().toISOString() };
    const label = options.label ?? startedAt.replace(/[:.]/gu, "-").slice(0, 19);
    await fs.mkdir(out, { recursive: true });
    const markdown = path.join(out, `${scopeSlug(run)}-${label}.md`);
    await fs.writeFile(markdown, renderMarkdown(report, capture));
    await fs.writeFile(path.join(out, `${scopeSlug(run)}-${label}.json`), toJson(report));
    console.log(`${rows.length} configurations in ${((Date.parse(report.finishedAt) - Date.parse(startedAt)) / 1000).toFixed(1)} s; report at ${path.relative(process.cwd(), markdown)}.`);
    if (drift.length) console.log(`The model drifts from the page in ${drift.length} place(s); see the report.`);
    const best = [...rows].sort((a, b) => a.signals.lengthPx - b.signals.lengthPx)[0];
    console.log(`Shortest: ${best.signals.lengthPx.toLocaleString("en-US")} px (baseline ${baseline.signals.lengthPx.toLocaleString("en-US")}) at ${differences(best.config, baselineConfiguration)}.`);
    return;
  }
  if (verb === "verify") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const spec = options.config ?? "{}";
    const config: LabConfig = { ...baselineConfig(), ...(JSON.parse(spec.startsWith("@") ? await fs.readFile(spec.slice(1), "utf8") : spec) as Partial<LabConfig>) };
    const lab = evaluate(capture, graph, run, config);
    const page = await verifyConfig(run, graph, config, options.shot);
    console.log(`Configuration: ${differences(config, baselineConfig())}`);
    console.log(compareTable(lab.signals, page));
    return;
  }
  console.error(`Unknown verb ${JSON.stringify(verb)}; use capture, sweep or verify.`);
  process.exit(2);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
