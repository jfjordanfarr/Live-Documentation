// The cycle choice's own time on the first draw of a few pictures: every candidate explored and laid out on the nominal
// model from the page's starts, with the page's default tuning; the median of several fresh runs.
import fs from "node:fs";
import { exploreBranches, type Exploration } from "../../../../packages/explorer/src/client/views/localView/branches";
import { chooseCycleOrders, type PicturePricing } from "../../../../packages/explorer/src/client/views/localView/cycle-choice";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const tuning = getDefaultTuning().localMap;
const pricing = (flow: boolean): PicturePricing => ({
  sceneTuning: { columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding,
    cardMaxWidth: tuning.cardMaxWidth, evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, ...(flow ? { fromTop: true } : null) },
  costs: { crossing: tuning.crossingCost, height: tuning.heightCost, width: tuning.widthCost, churn: tuning.churnCost, evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, steps: tuning.membraneSimplicity },
  seeds: tuning.orderStarts, seed: tuning.orderSeed, sweeps: tuning.orderSweeps, returnCost: tuning.returnCost
});
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));
const include = (node: any): boolean => node.archetype !== "asset";
const pictures = ["packages/engine/src/live-docs/core.ts", "packages/explorer/src/client/types.ts", "packages/explorer/src/client/views/localView/branch-renderer.ts",
  "packages/engine/src/live-docs/adapters/index.ts", "packages/explorer/src/client/views/localView/branches.ts", "packages/explorer/src/client/views/localView/"];
for (const id of pictures) {
  const explore = (orders?: ReadonlyMap<string, readonly string[]>): Exploration => id.endsWith("/")
    ? exploreBranches(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([id.slice(0, -1)]), directoryFlow: true, ranking: { orders } })
    : exploreBranches(byId.get(id) as any, graph, EMPTY_PIN_SET, (n: any) => n.id === id || include(n), { ranking: { orders } });
  const times: number[] = [], explores: number[] = [];
  let candidates = 0, cards = 0;
  for (let run = 0; run < 7; run++) {
    let t = performance.now();
    const explored = explore();
    explores.push(performance.now() - t);
    cards = explored.subgraph.nodes.length;
    candidates = explored.ranking.cycles.reduce((sum, cycle) => sum + cycle.candidates.length, 0);
    t = performance.now();
    chooseCycleOrders(explored, explore, pricing(explored.flow));
    times.push(performance.now() - t);
  }
  const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  console.log(`${id}: ${cards} cards, ${candidates} candidate orders in all: the choice ${median(times).toFixed(1)} ms (first run ${times[0].toFixed(1)}), one exploration ${median(explores).toFixed(1)} ms`);
}
