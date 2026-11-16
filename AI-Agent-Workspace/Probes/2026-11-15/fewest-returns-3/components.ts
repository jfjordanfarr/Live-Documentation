// The page's price of each order a picture's search walks through, term by term, on real card sizes: why the search
// keeps or leaves the greedy order.
import path from "node:path";

import { readCaptureFile } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, evaluate } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { signalsOf } from "../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { horizontalWire, returningLinks } from "../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";

async function main(): Promise<void> {
  const t = getDefaultTuning().localMap;
  for (const file of process.argv.slice(3)) {
    const capture = await readCaptureFile(path.join(process.argv[2], `${file.replaceAll("/", "__")}.json`));
    const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
    const graph = await loadBundleGraph(run);
    const first = evaluate(capture, graph, run, { ...baselineConfig(), returnCost: 0 });
    const describe = (label: string, branches: any, scene: any, tops: ReadonlyMap<string, number> | null): void => {
      const s = signalsOf(branches, scene, tops);
      const terms = { vertical: s.vertical, crossings: t.crossingCost * s.crossings, height: t.heightCost * s.height, width: t.widthCost * s.width,
        shape: t.membraneEvenness * s.unevenness + t.rowLevelness * s.unlevel + t.membraneSimplicity * s.steps, churn: t.churnCost * s.churn, horizontal: horizontalWire(scene, branches) };
      const total = Object.values(terms).reduce((a, b) => a + b, 0);
      console.log(`${file.split("/").pop()} ${label}: returns ${returningLinks(branches)}, columns ${branches.columns.length}, ${Object.entries(terms).map(([k, v]) => `${k} ${Math.round(v)}`).join(", ")}, all ${Math.round(total)}`);
    };
    describe("greedy", first.branches, first.scene, null);
    for (const trial of first.cycleSearch?.tried ?? []) console.log(`  trial ${trial.order.length} files: price ${Math.round(trial.price)}, with churn ${Math.round(trial.withChurn)}, adopted ${trial.adopted}`);
    if (first.cycleSearch && first.cycleSearch.branches !== first.branches) describe("searched", first.cycleSearch.branches, first.cycleSearch.scene, first.scene.tops);
  }
}
void main();
