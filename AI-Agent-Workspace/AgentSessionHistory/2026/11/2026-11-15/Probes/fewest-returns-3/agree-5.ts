// For each changed picture: the lab's walk of the search's cycle trials on a capture of the first draw, against the page's
// own search (one seed, so that it settles soon after its cycle trials), trial by trial and term by term.
import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";

import { captureFromPage } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate, includeNode, scopePins } from "../../../../scripts/layout-lab/evaluate";
import { capturedMeasurer } from "../../../../scripts/layout-lab/measurer";
import { loadBundleGraph, ORIGIN, retainedSubject, serveBundle, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { candidateStarts, signalsOf, startOrder } from "../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches } from "../../../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration } from "../../../../packages/explorer/src/client/views/localView/branches";
import { horizontalWire, returningLinks } from "../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION, getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { localMapSettled, localRetainUrl } from "../../../../tests/e2e/still-picture";

const [listPath, out, only] = process.argv.slice(2);
const files = fs.readFileSync(listPath, "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") && !match[1].endsWith("/") ? [match[1]] : [];
}).filter(file => !only || file.includes(only));

async function seeded(page: Page, localMap: Record<string, number>): Promise<void> {
  await serveBundle(page);
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap } }) });
}

async function main(): Promise<void> {
  const tuning = getDefaultTuning().localMap;
  const browser = await chromium.launch();
  const rows: unknown[] = [];
  try {
    for (const file of files) {
      const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
      const graph = await loadBundleGraph(run);
      const config = baselineConfig();
      // The lab: a capture of the first draw, its walk at the default Return Cost.
      const first = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      await seeded(first, { searchStarts: 0 });
      await first.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
      const capture = await captureFromPage(first, run);
      await first.close();
      const evaluation = evaluate(capture, graph, run, config);
      const drift = driftOf(capture, evaluation).length;
      const pins = scopePins(run);
      const explore = (orders?: ReadonlyMap<string, readonly string[]>) => exploreBranches(graph.nodes.find(n => n.id === retainedSubject(run))!, graph, pins,
        includeNode(pins, retainedSubject(run), capture.filters), { symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie, orders }, membraneDepth: config.membraneDepth });
      // Each lab trial again, term by term, as the walk laid it out.
      let standingTops = evaluation.scene.tops;
      let standingOrders = new Map(explore().ranking.cycles.map(c => [c.key, c.order] as [string, string[]]));
      const labTrials = (evaluation.cycleSearch?.tried ?? []).map(trial => {
        const orders = new Map([...standingOrders, [trial.key, trial.order]]);
        const exploration = explore(orders);
        const starts = candidateStarts(0, null, standingTops, exploration.ranking.columns.map(c => c.map(n => n.id)));
        const branches = orderExploration(exploration, { sweeps: config.orderSweeps, ...startOrder(starts[starts.length - 1]) });
        const plan = planBranches(branches, config.membranePadding);
        const scene = layoutScene(plan, branches, capturedMeasurer(capture, branches, { pins, selected: retainedSubject(run), collapseOnPin: tuning.collapseOnPin, symbolOrder: config.symbolOrder }),
          { columnGap: config.columnGap, itemGap: config.itemGap, bandGap: config.bandGap, neck: config.membraneNeck, bandPadding: config.membranePadding, cardMaxWidth: config.cardMaxWidth, evenness: config.membraneEvenness, levelness: config.rowLevelness });
        const record = { signals: signalsOf(branches, scene, standingTops), horizontal: horizontalWire(scene, branches), returns: returningLinks(branches), base: trial.price, withChurn: trial.withChurn, adopted: trial.adopted };
        if (trial.adopted) { standingTops = scene.tops; standingOrders = orders as Map<string, string[]>; }
        return record;
      });
      // The page: the search with one seed, its cycle trials recorded.
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      await seeded(page, { searchStarts: 1, searchPatience: 1 });
      await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
      await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
      let settled = true;
      await localMapSettled(page, 120_000).catch(() => { settled = false; });
      const pageSide = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
        return { trials: JSON.parse(root.dataset.searchCycleTrials ?? "[]") as Array<{ shown: number; predicted: { base: number; withChurn: number }; measured: { base: number; withChurn: number } | null; adopted: boolean }>, firstScore: root.dataset.orderScore };
      });
      await page.close();
      const labAdopted = labTrials.map(t => t.adopted), pageAdopted = pageSide.trials.map(t => t.adopted);
      const agree = JSON.stringify(labAdopted) === JSON.stringify(pageAdopted);
      rows.push({ file, drift, settled, agree, lab: { first: evaluation.cycleSearch?.firstPrice, trials: labTrials }, page: pageSide });
      console.log(`${file.split("/").pop()}: drift ${drift}, settled ${settled}, lab ${JSON.stringify(labAdopted)} page ${JSON.stringify(pageAdopted)} ${agree ? "agree" : "DISAGREE"}`);
      fs.writeFileSync(out, JSON.stringify(rows, null, 1));
    }
  } finally {
    await browser.close();
  }
}
void main();
