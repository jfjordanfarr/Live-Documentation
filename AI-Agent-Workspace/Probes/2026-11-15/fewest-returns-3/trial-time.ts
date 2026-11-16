// What one cycle trial costs the search on a picture: the ranking with the trial's order, the order step from the shown
// picture's own order and the placement on the card model, as the page's search does on its cached measurements.
import path from "node:path";

import { readCaptureFile } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, evaluate, includeNode, scopePins } from "../../../../scripts/layout-lab/evaluate";
import { capturedMeasurer } from "../../../../scripts/layout-lab/measurer";
import { loadBundleGraph, retainedSubject, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { candidateStarts, startOrder } from "../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches } from "../../../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration } from "../../../../packages/explorer/src/client/views/localView/branches";
import { cycleOrdersOf } from "../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";

async function main(): Promise<void> {
  const tuning = getDefaultTuning().localMap;
  for (const file of process.argv.slice(3)) {
    const capture = await readCaptureFile(path.join(process.argv[2], `${file.replaceAll("/", "__")}.json`));
    const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
    const graph = await loadBundleGraph(run);
    const config = baselineConfig();
    const pins = scopePins(run);
    const first = evaluate(capture, graph, run, config);
    const explore = (orders?: ReadonlyMap<string, readonly string[]>) => exploreBranches(graph.nodes.find(n => n.id === retainedSubject(run))!, graph, pins,
      includeNode(pins, retainedSubject(run), capture.filters), { symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie, orders }, membraneDepth: config.membraneDepth });
    const cycles = explore().ranking.cycles;
    const times: number[] = [];
    for (const trial of cycleOrdersOf(cycles)) for (let round = 0; round < 3; round++) {
      const started = performance.now();
      const exploration = explore(new Map([...cycles.map(c => [c.key, c.order] as [string, string[]]), [trial.key, trial.order]]));
      const starts = candidateStarts(0, null, first.scene.tops, exploration.ranking.columns.map(c => c.map(n => n.id)));
      const branches = orderExploration(exploration, { sweeps: config.orderSweeps, ...startOrder(starts[starts.length - 1]) });
      const plan = planBranches(branches, config.membranePadding);
      layoutScene(plan, branches, capturedMeasurer(capture, branches, { pins, selected: retainedSubject(run), collapseOnPin: tuning.collapseOnPin, symbolOrder: config.symbolOrder }),
        { columnGap: config.columnGap, itemGap: config.itemGap, bandGap: config.bandGap, neck: config.membraneNeck, bandPadding: config.membranePadding, cardMaxWidth: config.cardMaxWidth, evenness: config.membraneEvenness, levelness: config.rowLevelness });
      times.push(performance.now() - started);
    }
    times.sort((a, b) => a - b);
    console.log(`${file.split("/").pop()}: ${cycleOrdersOf(cycles).length} trials, one trial ${times[Math.floor(times.length / 2)].toFixed(0)} ms (median of ${times.length}, ${times[0].toFixed(0)} to ${times[times.length - 1].toFixed(0)})`);
  }
}
void main();
