// The flip table on real card sizes: for each changed picture captured from the page, the first draw (the greedy order)
// and the search's cycle trials as the page runs them, on the lab's card model; the least Return Cost, in pixels of
// wire, at which the walk leaves the greedy order; what it leaves standing at a few costs; and, for item 4, whether a
// walk started from the order another picture of the same cycle adopted ends where the walk from the greedy order does.
import fs from "node:fs";
import path from "node:path";

import { readCaptureFile, type Capture } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, evaluate, type LabConfig } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { candidateStarts, scoreOf, signalsOf, startOrder } from "../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches } from "../../../../packages/explorer/src/client/views/localView/branch-scene";
import { edgeKey, exploreBranches, orderExploration, type BranchGraph } from "../../../../packages/explorer/src/client/views/localView/branches";
import { horizontalWire, returningLinks, standingOrders, walkCycleTrials } from "../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { capturedMeasurer } from "../../../../scripts/layout-lab/measurer";
import { includeNode, scopePins } from "../../../../scripts/layout-lab/evaluate";
import { retainedSubject } from "../../../../scripts/layout-lab/scopes";

const [captureDir, listPath, label, shownArg, defaultArg] = process.argv.slice(2);
const shown = (shownArg ?? "0,500,1000,1500,2000,3000").split(",").map(Number);
const defaultCost = Number(defaultArg ?? 1500);
const files = fs.readFileSync(listPath, "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") && !match[1].endsWith("/") ? [match[1]] : [];
});
const grid = Array.from({ length: 201 }, (_, i) => i * 25);
const tuning = getDefaultTuning().localMap;
type Picture = { orders: ReadonlyMap<string, readonly string[]>; price: number; branches: BranchGraph; scene: any; base: number; returns: number };

async function main(): Promise<void> {
  const rows: any[] = [];
  const adoptedElsewhere = new Map<string, Array<{ file: string; order: string[] }>>();
  const contexts: Array<{ file: string; capture: Capture; graph: any; run: ScopeRun; config: LabConfig }> = [];
  for (const file of files) {
    const capturePath = path.join(captureDir, `${file.replaceAll("/", "__")}.json`);
    if (!fs.existsSync(capturePath)) { console.log(`| ${file} | no capture |`); continue; }
    const capture = await readCaptureFile(capturePath);
    const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
    const graph = await loadBundleGraph(run);
    const config = baselineConfig();
    contexts.push({ file, capture, graph, run, config });
    const pins = scopePins(run);
    const explore = (orders?: ReadonlyMap<string, readonly string[]>) => exploreBranches(graph.nodes.find(n => n.id === retainedSubject(run))!, graph, pins,
      includeNode(pins, retainedSubject(run), capture.filters), { symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie, orders }, membraneDepth: config.membraneDepth });
    const first = evaluate(capture, graph, run, { ...config, returnCost: 0 });
    const exploration = explore();
    const costs = { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: tuning.churnCost, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
    // Each trial's layout depends on its orders and on the standing picture it is ordered from: memoised by both.
    const memo = new Map<string, { branches: BranchGraph; scene: any; base: number; churned: number; returns: number }>();
    const layout = (orders: ReadonlyMap<string, readonly string[]>, standing: Picture) => {
      const key = JSON.stringify([[...orders], [...standing.orders]]);
      if (!memo.has(key)) {
        const trial = explore(orders);
        const starts = candidateStarts(0, null, standing.scene.tops, trial.ranking.columns.map(c => c.map(n => n.id)));
        const branches = orderExploration(trial, { sweeps: config.orderSweeps, ...startOrder(starts[starts.length - 1]) });
        const plan = planBranches(branches, config.membranePadding);
        const measurer = capturedMeasurer(capture, branches, { pins, selected: retainedSubject(run), collapseOnPin: tuning.collapseOnPin, symbolOrder: config.symbolOrder });
        const scene = layoutScene(plan, branches, measurer, { columnGap: config.columnGap, itemGap: config.itemGap, bandGap: config.bandGap, neck: config.membraneNeck,
          bandPadding: config.membranePadding, cardMaxWidth: config.cardMaxWidth, evenness: config.membraneEvenness, levelness: config.rowLevelness });
        const wire = horizontalWire(scene, branches);
        memo.set(key, { branches, scene, base: scoreOf(signalsOf(branches, scene, null), { ...costs, churn: 0 }) + wire,
          churned: scoreOf(signalsOf(branches, scene, standing.scene.tops), costs) + wire, returns: returningLinks(branches) });
      }
      return memo.get(key)!;
    };
    const firstBase = first.starts.find(s => s.name === first.start)!.score + horizontalWire(first.scene, first.branches);
    const firstReturns = returningLinks(first.branches);
    const walkAt = (cost: number, from: { orders: ReadonlyMap<string, readonly string[]>; branches: BranchGraph; scene: any; base: number; returns: number } = { orders: standingOrders(exploration.ranking.cycles), branches: first.branches, scene: first.scene, base: firstBase, returns: firstReturns }) =>
      walkCycleTrials<Picture>({ ...from, price: from.base + cost * from.returns }, exploration.ranking.cycles, (orders, standing) => {
        const laid = layout(orders, standing);
        return { picture: { orders, branches: laid.branches, scene: laid.scene, base: laid.base, returns: laid.returns, price: laid.base + cost * laid.returns }, withChurn: laid.churned + cost * laid.returns };
      });
    const backOf = (b: BranchGraph): string => b.subgraph.links.filter(l => b.back.has(edgeKey(l))).map(edgeKey).sort().join("|");
    const greedyBack = backOf(first.branches);
    const leaves = grid.find(cost => backOf(walkAt(cost).picture.branches) !== greedyBack);
    const at = Object.fromEntries(shown.map(cost => { const w = walkAt(cost); return [cost, { returns: returningLinks(w.picture.branches), columns: w.picture.branches.columns.length, moved: backOf(w.picture.branches) !== greedyBack, height: Math.round(w.picture.scene.pictureHeight), width: Math.round(w.picture.scene.pictureWidth) }]; }));
    const atDefault = walkAt(defaultCost);
    for (const [key, order] of atDefault.picture.orders) {
      if (!exploration.ranking.cycles.find(c => c.key === key)) continue;
      (adoptedElsewhere.get(key) ?? adoptedElsewhere.set(key, []).get(key)!).push({ file, order: [...order] });
    }
    const short = file.split("/").pop();
    const cell = (x: any): string => `${x.returns}/${x.columns}${x.moved ? "*" : ""}`;
    rows.push({ file, leaves, at, greedy: { returns: firstReturns, columns: first.branches.columns.length, height: Math.round(first.scene.pictureHeight), width: Math.round(first.scene.pictureWidth) },
      cycles: exploration.ranking.cycles.map(c => c.key), walkAtDefault: atDefault.tried.map(t => ({ returns: undefined, withChurn: Math.round(t.withChurn), price: Math.round(t.price), adopted: t.adopted })) });
    console.log(`| ${short} | ${leaves ?? `>${grid[grid.length - 1]}`} | ${firstReturns}/${first.branches.columns.length} | ${shown.map(cost => cell(at[cost])).join(" | ")} |`);
    // Hold on to the walk for item 4.
    (contexts[contexts.length - 1] as any).walkFrom = walkAt;
    (contexts[contexts.length - 1] as any).cycles = exploration.ranking.cycles;
    (contexts[contexts.length - 1] as any).explore = explore;
  }
  fs.writeFileSync(`real-flip-${label}.json`, JSON.stringify(rows));
  // Item 4: a picture whose cycle another picture also holds, started from the order that other picture's walk adopted.
  console.log("\nmemory: a walk from another picture's adopted order against the walk from the greedy order, at the default");
  for (const context of contexts as any[]) {
    for (const cycle of context.cycles ?? []) {
      if (cycle.candidates.length < 2) continue;
      const fromGreedy = context.walkFrom(defaultCost).picture.orders.get(cycle.key)!.join(">");
      for (const other of adoptedElsewhere.get(cycle.key) ?? []) {
        if (other.file === context.file) continue;
        const startEval = evaluate(context.capture, context.graph, context.run, { ...context.config, returnCost: defaultCost }, new Map([[cycle.key, other.order]]));
        const fromMemory = (startEval.cycleSearch?.orders.get(cycle.key) ?? other.order).join(">");
        console.log(`${context.file.split("/").pop()} from ${other.file.split("/").pop()}'s ${other.order.join(">") === cycle.order.join(">") ? "greedy" : "adopted"} order: ${fromMemory === fromGreedy ? "same" : "DIFFERENT"}`);
      }
    }
  }
}
void main();
