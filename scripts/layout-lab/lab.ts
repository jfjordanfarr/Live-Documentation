#!/usr/bin/env node
/**
 * The layout lab: a headless sweep over the Local Map's layout levers, each
 * configuration laid out by the page's own ranking, order, scene and
 * placement with a capture of the page's cards in the page's place, scored
 * on the signals the still-picture deck reads, and reported for a person to
 * read. Commands:
 *
 *   npm run layout:lab -- capture <bundle/scope> [--out <dir>]
 *   npm run layout:lab -- sweep <bundle/scope> [--capture <file>] [--grid <spec>] [--sample <n>] [--seed <n>] [--weights k=v,...] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- restarts <bundle/scope> [--capture <file>] [--starts <n>] [--costs <spec>] [--churn a,b,c] [--first <n>] [--patience <n>] [--weights k=v,...] [--config <json>] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- widen <bundle/scope> [--capture <file>] [--grid <spec>] [--starts <n>] [--churn <n>] [--first <n>] [--patience <n>] [--weights k=v,...] [--config <json>] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- refine <bundle/scope> [--capture <file>] [--starts <n>] [--churn <n>] [--patience <n>] [--config <json or @file>] [--label <name>] [--out <dir>]
 *   npm run layout:lab -- verify <bundle/scope> --config <json or @file> [--capture <file>] [--shot <png>]
 *   npm run layout:lab -- spatial <bundle/scope> [--preset compact|relaxed] [--config @export.json] [--ticks <most>] [--tests true|false] [--assets true|false] [--related-docs true|false] [--layout connections|structure] [--out <dir>]
 *   npm run layout:lab -- drift <bundle/scope> [--preset compact|relaxed] [--layout connections|structure|both] [--gravity a,b,c] [--range a,b,c] [--spring a,b,c] [--energy a,b,c] [--tether a,b,c] [--cycles <n>] [--ticks <most>] [--toggle tests|assets|none] [--label <name>] [--out <dir>]
 *
 * Every command accepts --preset compact|relaxed; refinement, verification and
 * spatial layout also accept the settings JSON exported by the page.
 *
 * The scopes are the deck's: repository/five, repository/chain, estate/five,
 * estate/chain. The bundles must be built first (`npm run live-docs:visualize`
 * and `:estate`). Reports go under the day's probe folder unless `--out` says
 * otherwise. `widen` tabulates the starts at every setting of the ranking's
 * pull and tie rule and the order's sweeps (its default grid, or `--grid`)
 * and reports which start each judge would keep at each. `drift` toggles one
 * file type out of the full 3D picture and back in for a number of cycles,
 * each change eased as the page eases it at every setting of the update
 * energy named (`--energy`, the page's default alone by default), of the
 * tether, of gravity and of the repulsion's reach, and tabulates the
 * picture's extent after each cycle beside how far the unchanged spheres
 * moved and how many ticks each change took to be still (2026-10-17, the
 * energy 2026-10-18, the motion and its tether 2026-10-21). `--ticks` is the
 * most ticks any one easing may take, in `spatial` and `drift` alike.
 */
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { captureScope, readCaptureFile, writeCapture, type Capture } from "./capture";
import { measureDrift, rangeOf, renderDriftReports, toggledArchetype, type DriftReport } from "./drift";
import { baselineConfig, driftOf, evaluate, type LabConfig } from "./evaluate";
import { refine, refinementJson, renderRefinement } from "./refine";
import { differences, renderMarkdown, toJson, type ReportRow, type RunReport } from "./report";
import { DEFAULT_WIDE_GRID, parseCosts, renderRestarts, renderWide, simulateSearch, tabulateStarts, trialCosts, widenStarts } from "./restarts";
import { findScope, loadBundleData, loadBundleGraph, scopeSlug, type ScopeRun } from "./scopes";
import { renderSpatialReport, spatialReport } from "./spatial";
import { configurations, DEFAULT_GRID, oneAtATime, parseGrid, parseWeights } from "./sweep";
import { compareTable, verifyConfig } from "./verify";
import { applyLayoutPreset, applyLayoutSettings, readLayoutSettings } from "../../packages/explorer/src/client/layout-presets";
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
    console.error("Usage: layout-lab <capture|sweep|restarts|widen|refine|verify|spatial> <bundle/scope> [--preset compact|relaxed] [options]");
    process.exit(2);
  }
  const run = findScope(scope);
  const out = options.out ?? defaultOut();
  const preset = options.preset ?? "relaxed";
  if (preset !== "compact" && preset !== "relaxed") throw new Error("Preset must be compact or relaxed.");
  const presetConfig = (): LabConfig => baselineConfig(preset);
  const readConfig = async (): Promise<Partial<LabConfig>> => {
    const spec = options.config ?? "{}";
    const parsed = JSON.parse(spec.startsWith("@") ? await fs.readFile(spec.slice(1), "utf8") : spec) as Partial<LabConfig> & { localMap?: Partial<LabConfig> };
    return parsed.localMap ?? parsed;
  };
  if (verb === "spatial") {
    const graph = await loadBundleGraph(run);
    const spec = options.config ?? "{}";
    const parsed: unknown = JSON.parse(spec.startsWith("@") ? await fs.readFile(spec.slice(1), "utf8") : spec);
    const settings = readLayoutSettings(parsed);
    const tuning = applyLayoutSettings(applyLayoutPreset(getDefaultTuning(), preset), settings).forceGraph;
    for (const name of ["tests", "assets", "related-docs"] as const) if (options[name] && options[name] !== "true" && options[name] !== "false") throw new Error(`--${name} must be true or false.`);
    const layout = options.layout ?? "connections";
    if (layout !== "connections" && layout !== "structure") throw new Error("--layout must be connections or structure.");
    const related = options["related-docs"] === "true" ? (await loadBundleData(run)).relatedDocLinks ?? [] : [];
    const report = spatialReport(graph, run, tuning, Number(options.ticks ?? 20_000), {
      showTests: options.tests !== "false", showAssets: options.assets !== "false", showRelatedDocs: options["related-docs"] === "true"
    }, related, layout);
    const label = options.label ?? `spatial-${layout}-${preset}`;
    await fs.mkdir(out, { recursive: true });
    const stem = path.join(out, `${scopeSlug(run)}-${label}`);
    await fs.writeFile(`${stem}.json`, JSON.stringify(report, null, 2) + "\n");
    await fs.writeFile(`${stem}.md`, renderSpatialReport(report));
    const memberships = report.links.filter(link => link.kind === "containment").length;
    console.log(`${report.nodes.length} nodes, ${report.links.length - memberships} reference pairs, ${memberships} containment links in the ${layout} layout; ${report.overlaps} sphere overlaps. Report at ${path.relative(process.cwd(), stem)}.{md,json}.`);
    return;
  }
  if (verb === "drift") {
    const graph = await loadBundleGraph(run);
    const base = applyLayoutPreset(getDefaultTuning(), preset).forceGraph;
    const layouts = options.layout === "both" || !options.layout ? ["connections", "structure"] as const
      : options.layout === "connections" || options.layout === "structure" ? [options.layout] as const
      : (() => { throw new Error("--layout must be connections, structure or both."); })();
    const numbers = (spec: string | undefined, fallback: readonly number[]): number[] =>
      spec ? spec.split(",").map(part => { const n = Number(part); if (!Number.isFinite(n)) throw new Error(`Not a number: ${part}`); return n; }) : [...fallback];
    const gravities = numbers(options.gravity, [0, 0.02, 0.05, 0.1]);
    const ranges = numbers(options.range, [0]);
    const energies = numbers(options.energy, [base.updateEnergy]);
    const tethers = numbers(options.tether, [base.tether]);
    const springs = numbers(options.spring, [base.linkStrength]);
    const cycles = Number(options.cycles ?? 5);
    const ticks = Number(options.ticks ?? 20_000);
    const toggle = options.toggle ?? "tests";
    const toggledKind = toggledArchetype(toggle);
    // The full picture is the cold start's (tests shown, assets hidden) with the toggled type shown, so that the toggle
    // has something to remove; `none` is the control, a reheat with no change at all.
    const include = (node: { archetype: string }): boolean => {
      const archetype = node.archetype.toLowerCase();
      if (archetype === toggledKind) return true;
      if (archetype === "asset") return options.assets === "true";
      if (archetype === "test") return options.tests !== "false";
      return true;
    };
    const toggled = (node: { archetype: string }): boolean => toggledKind !== null && node.archetype.toLowerCase() === toggledKind;
    const reports: DriftReport[] = [];
    for (const layout of layouts) for (const updateEnergy of energies) for (const tether of tethers) for (const linkStrength of springs) for (const gravity of gravities) for (const chargeRange of ranges) {
      const started = Date.now();
      const report = measureDrift(graph, include, toggled, { ...base, gravity, chargeRange, updateEnergy, tether, linkStrength }, layout, cycles, ticks);
      reports.push(report);
      const last = report.cycles[report.cycles.length - 1];
      const settles = rangeOf(report.cycles.flatMap(cycle => [cycle.settleTicks.removed, cycle.settleTicks.restored]));
      console.log(`${layout}, energy ${updateEnergy}, tether ${tether}, spring ${linkStrength}, gravity ${gravity}, reach ${chargeRange || "unbounded"}: extent ${report.start.extent.toFixed(1)} to ${last.extent.toFixed(1)} (${(last.extent / report.start.extent).toFixed(2)}x) over ${cycles} cycles; unchanged spheres moved a mean of ${(report.cycles.reduce((sum, cycle) => sum + cycle.meanMoveOfUnchanged, 0) / cycles).toFixed(1)} per restore; a change was still in ${settles} ticks; ${((Date.now() - started) / 1000).toFixed(0)} s.`);
    }
    const label = options.label ?? `drift-${toggle}-${preset}`;
    const title = toggledKind === null ? `3D Local Map drift: ${run.bundle}, a reheat with nothing toggled, the ${preset} preset` : `3D Local Map drift: ${run.bundle}, toggling ${toggle}, the ${preset} preset`;
    await fs.mkdir(out, { recursive: true });
    const stem = path.join(out, `${run.bundle}-${label}`);
    await fs.writeFile(`${stem}.json`, JSON.stringify(reports, null, 2) + "\n");
    await fs.writeFile(`${stem}.md`, renderDriftReports(reports, title));
    console.log(`Report at ${path.relative(process.cwd(), stem)}.{md,json}.`);
    return;
  }
  if (verb === "capture") {
    const capture = await captureScope(run, preset);
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
    const baseline = evaluate(capture, graph, run, presetConfig());
    const drift = driftOf(capture, baseline);
    console.log(drift.length ? `The model drifts from the page in ${drift.length} place(s):\n  ${drift.join("\n  ")}` : `The model reproduces the page to the pixel (placement measure ${baseline.signals.placementCost.toLocaleString("en-US")}, ${baseline.signals.lengthPx.toLocaleString("en-US")} px of wire).`);
    return;
  }
  if (verb === "sweep") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const startedAt = new Date().toISOString();
    const baselineConfiguration = presetConfig();
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
    const config: LabConfig = { ...presetConfig(), ...await readConfig() };
    const seeds = Number(options.starts ?? 8);
    const weights = parseWeights(options.weights);
    const rows = tabulateStarts(capture, graph, run, config, seeds);
    // The page's search over the same starts, at the page's crossing and height costs and each churn cost asked for.
    const churnCosts = (options.churn ?? "0,50,100,200,400").split(",").map(Number).filter(Number.isFinite);
    const first = Number(options.first ?? config.orderStarts);
    const patience = Number(options.patience ?? getDefaultTuning().localMap.searchPatience);
    const pageCosts = { crossing: config.crossingCost, height: config.heightCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
    const trials = trialCosts(rows, parseCosts(options.costs, pageCosts), weights);
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
    console.log(agreeing.length ? `The page agrees with the full score at ${agreeing.length} of ${trials.length} cost settings: ${agreeing.map(t => `crossing ${t.costs.crossing}, height ${t.costs.height}, evenness ${t.costs.evenness}, levelness ${t.costs.levelness}, steps ${t.costs.steps}`).join("; ")}.` : `The page agrees with the full score at none of the ${trials.length} cost settings.`);
    return;
  }
  if (verb === "widen") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const startedAt = new Date().toISOString();
    const baseline: LabConfig = { ...presetConfig(), ...await readConfig() };
    const gridSpec = options.grid ?? DEFAULT_WIDE_GRID;
    const grid = parseGrid(gridSpec);
    const seeds = Number(options.starts ?? 16);
    const weights = parseWeights(options.weights);
    const defaults = getDefaultTuning().localMap;
    const judge = { costs: { crossing: baseline.crossingCost, height: baseline.heightCost, churn: 0, evenness: baseline.membraneEvenness, levelness: baseline.rowLevelness, steps: baseline.membraneSimplicity }, churn: Number(options.churn ?? defaults.churnCost), first: Number(options.first ?? baseline.orderStarts), patience: Number(options.patience ?? defaults.searchPatience) };
    const settings = widenStarts(capture, graph, run, baseline, grid, seeds, weights, judge.costs, judge.churn, judge.first, judge.patience, (setting, done, count) => console.log(`  ${done} of ${count}: ${setting}`));
    const label = options.label ?? "wide";
    await fs.mkdir(out, { recursive: true });
    const markdown = path.join(out, `${scopeSlug(run)}-${label}.md`);
    await fs.writeFile(markdown, renderWide(run, settings, weights, capture, startedAt, gridSpec, judge));
    await fs.writeFile(path.join(out, `${scopeSlug(run)}-${label}.json`), JSON.stringify({ run: { bundle: run.bundle, scopeName: run.scopeName, subject: run.subject, files: run.scope }, capturedAt: capture.capturedAt, startedAt, baseline, grid: gridSpec, weights, judge, settings: settings.map(s => ({ ...s, search: { ...s.search, first: s.search.first.name, final: s.search.final.name, adoptions: s.search.adoptions.map(a => ({ start: a.row.name, gain: a.gain, pairs: a.pairs, tried: a.tried })) }, cheapest: s.cheapest.name, best: s.best.name })) }));
    const byEnd = [...settings].sort((a, b) => a.searchScore - b.searchScore);
    const byBest = [...settings].sort((a, b) => a.bestScore - b.bestScore);
    console.log(`${settings.length} settings, ${(settings.length * settings[0].rows.length).toLocaleString("en-US")} layouts in ${((Date.now() - Date.parse(startedAt)) / 1000).toFixed(1)} s; report at ${path.relative(process.cwd(), markdown)}.`);
    console.log(`The baseline's search ends at ${settings[0].search.final.name}, full score ${settings[0].searchScore.toFixed(3)}; the best setting by where the search ends is ${byEnd[0].setting} at ${byEnd[0].search.final.name}, ${byEnd[0].searchScore.toFixed(3)}; by its best start ${byBest[0].setting} at ${byBest[0].best.name}, ${byBest[0].bestScore.toFixed(3)}.`);
    return;
  }
  if (verb === "refine") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const config: LabConfig = { ...presetConfig(), ...await readConfig() };
    const defaults = getDefaultTuning().localMap;
    const result = refine(capture, graph, run, config, {
      searchStarts: Number(options.starts ?? defaults.searchStarts), searchPatience: Number(options.patience ?? defaults.searchPatience), churnCost: Number(options.churn ?? defaults.churnCost)
    });
    const label = options.label ?? "refine";
    await fs.mkdir(out, { recursive: true });
    const markdown = path.join(out, `${scopeSlug(run)}-${label}.md`);
    await fs.writeFile(markdown, renderRefinement(result, run, capture));
    await fs.writeFile(path.join(out, `${scopeSlug(run)}-${label}.json`), refinementJson(result, run, capture));
    console.log(`${result.state.tried} ordering seeds and ${result.alignmentTried} alignments tried; ${result.state.adopted} pictures adopted, ${result.alignmentAdopted} by alignment. Final price ${result.state.shown}, steps ${result.initial.signals.steps} → ${result.final.signals.steps}.`);
    console.log(`Report at ${path.relative(process.cwd(), markdown)}; complete trial and geometry data in its JSON companion.`);
    return;
  }
  if (verb === "verify") {
    const capture = await loadCapture(run, options);
    const graph = await loadBundleGraph(run);
    const config: LabConfig = { ...presetConfig(), ...await readConfig() };
    const lab = evaluate(capture, graph, run, config);
    const page = await verifyConfig(run, graph, config, options.shot);
    console.log(`Configuration: ${differences(config, presetConfig())}`);
    console.log(`The lab drew the start ${JSON.stringify(lab.start)}; the page drew ${JSON.stringify(page.start)} in ${page.layoutMs} ms by its own clock.`);
    console.log(compareTable(lab.signals, page));
    return;
  }
  console.error(`Unknown verb ${JSON.stringify(verb)}; use capture, sweep, restarts, widen, refine, verify or spatial.`);
  process.exit(2);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
