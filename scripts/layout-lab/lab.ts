#!/usr/bin/env node
/**
 * The layout lab: a headless sweep over the Local Map's layout levers, each
 * configuration laid out by the page's own ranking, order, scene and
 * placement with a capture of the page's cards in the page's place, scored
 * on the signals the still-picture deck reads, and reported for a person to
 * read. Four verbs:
 *
 *   npm run layout:lab -- capture <bundle/scope> [--out <dir>]
 *   npm run layout:lab -- sweep <bundle/scope> [--capture <file>] [--grid <spec>] [--sample <n>] [--seed <n>] [--weights k=v,...] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- restarts <bundle/scope> [--capture <file>] [--starts <n>] [--costs <spec>] [--churn a,b,c] [--first <n>] [--patience <n>] [--weights k=v,...] [--config <json>] [--label <name>] [--out <dir>]
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
import { parseCosts, renderRestarts, simulateSearch, tabulateStarts, trialCosts } from "./restarts";
import { findScope, loadBundleGraph, scopeSlug, type ScopeRun } from "./scopes";
import { configurations, DEFAULT_GRID, oneAtATime, parseGrid, parseWeights } from "./sweep";
import { compareTable, verifyConfig } from "./verify";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";

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
    console.error("Usage: layout-lab <capture|sweep|restarts|verify> <bundle/scope> [options]");
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
  if (verb === "restarts") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const startedAt = new Date().toISOString();
    const config: LabConfig = { ...baselineConfig(), ...(JSON.parse(options.config ?? "{}") as Partial<LabConfig>) };
    const seeds = Number(options.starts ?? 8);
    const weights = parseWeights(options.weights);
    const rows = tabulateStarts(capture, graph, run, config, seeds);
    const trials = trialCosts(rows, parseCosts(options.costs), weights);
    // The page's search over the same starts, at the page's crossing and height costs and each churn cost asked for.
    const churnCosts = (options.churn ?? "0,50,100,200,400").split(",").map(Number).filter(Number.isFinite);
    const first = Number(options.first ?? config.orderStarts);
    const patience = Number(options.patience ?? getDefaultTuning().localMap.searchPatience);
    const pageCosts = { crossing: config.crossingCost, height: config.heightCost, churn: 0 };
    const search = { trials: simulateSearch(rows, pageCosts, churnCosts, first, patience), costs: pageCosts, orderStarts: first, patience };
    const label = options.label ?? "restarts";
    await fs.mkdir(out, { recursive: true });
    const markdown = path.join(out, `${scopeSlug(run)}-${label}.md`);
    await fs.writeFile(markdown, renderRestarts(run, rows, trials, weights, capture, startedAt, search));
    await fs.writeFile(path.join(out, `${scopeSlug(run)}-${label}.json`), JSON.stringify({ run: { bundle: run.bundle, scopeName: run.scopeName, subject: run.subject, files: run.scope }, capturedAt: capture.capturedAt, startedAt, config, weights, rows, trials: trials.map(t => ({ ...t, pick: t.pick.name, best: t.best.name })), search: { orderStarts: first, patience, trials: search.trials.map(t => ({ churn: t.churn, first: t.first.name, adoptions: t.adoptions.map(a => ({ start: a.row.name, gain: a.gain, pairs: a.pairs, tried: a.tried })), tried: t.tried, stopped: t.stopped, final: t.final.name })) } }));
    for (const trial of search.trials) console.log(`Search at churn ${trial.churn}: first paint ${trial.first.name}; ${trial.adoptions.length} move(s)${trial.adoptions.length ? ` (${trial.adoptions.map(a => `${a.row.name} −${Math.round(a.gain).toLocaleString("en-US")} px, ${a.pairs} pairs`).join("; ")})` : ""}; ${trial.tried} starts tried, ${trial.stopped}; final ${trial.final.name}.`);
    const shortest = [...rows].sort((a, b) => a.cheap.vertical - b.cheap.vertical)[0];
    const agreeing = trials.filter(t => t.pick === t.best);
    console.log(`${rows.length} starts in ${((Date.now() - Date.parse(startedAt)) / 1000).toFixed(1)} s; report at ${path.relative(process.cwd(), markdown)}.`);
    console.log(`Shortest vertical: ${shortest.name} at ${shortest.cheap.vertical.toLocaleString("en-US")} px (ranked ${rows[0].cheap.vertical.toLocaleString("en-US")}); the full score prefers ${trials[0]?.best.name ?? "n/a"}.`);
    console.log(agreeing.length ? `The page agrees with the full score at ${agreeing.length} of ${trials.length} cost settings: ${agreeing.map(t => `crossing ${t.costs.crossing}, height ${t.costs.height}`).join("; ")}.` : `The page agrees with the full score at none of the ${trials.length} cost settings.`);
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
    console.log(`The lab drew the start ${JSON.stringify(lab.start)}; the page drew ${JSON.stringify(page.start)} in ${page.layoutMs} ms by its own clock.`);
    console.log(compareTable(lab.signals, page));
    return;
  }
  console.error(`Unknown verb ${JSON.stringify(verb)}; use capture, sweep, restarts or verify.`);
  process.exit(2);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
