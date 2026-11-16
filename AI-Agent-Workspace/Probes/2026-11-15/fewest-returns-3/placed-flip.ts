// The flip table with the placed price: for each picture the fewest-returns order changed, each candidate's placed price
// (the page's price on the nominal model, churn aside, with the wires' horizontal length) and its returning references,
// then the least Return Cost, in pixels of wire, at which the choice leaves the greedy order, and what it stands in at a
// few costs; checked against chooseCycleOrders itself at each cost shown.
import fs from "node:fs";
import { edgeKey, exploreBranches, type Exploration } from "../../../../packages/explorer/src/client/views/localView/branches";
import { chooseCycleOrders, pictureCost, returningLinks, type PicturePricing } from "../../../../packages/explorer/src/client/views/localView/cycle-choice";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const ids = fs.readFileSync(process.argv[3], "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") ? [match[1]] : [];
});
const shown = (process.argv[4] ?? "0,100,200,400,800").split(",").map(Number);
const tuning = getDefaultTuning().localMap;
const pricingAt = (returnCost: number, flow: boolean): PicturePricing => ({
  sceneTuning: { columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding,
    cardMaxWidth: tuning.cardMaxWidth, evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, ...(flow ? { fromTop: true } : null) },
  costs: { crossing: tuning.crossingCost, height: tuning.heightCost, width: tuning.widthCost, churn: tuning.churnCost, evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, steps: tuning.membraneSimplicity },
  seeds: tuning.orderStarts, seed: tuning.orderSeed, sweeps: tuning.orderSweeps, returnCost
});
const include = (node: any): boolean => node.archetype !== "asset";
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));
const explorer = (id: string) => (orders?: ReadonlyMap<string, readonly string[]>): Exploration => id.endsWith("/")
  ? exploreBranches(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([id.slice(0, -1)]), directoryFlow: true, ranking: { orders } })
  : exploreBranches(byId.get(id) as any, graph, EMPTY_PIN_SET, (n: any) => n.id === id || include(n), { ranking: { orders } });
const backOf = (e: Exploration): string => e.subgraph.links.filter(l => e.ranking.back.has(edgeKey(l))).map(edgeKey).sort().join("|");

const grid = Array.from({ length: 121 }, (_, i) => i * 25);
const rows: any[] = [];
for (const id of ids) {
  const explore = explorer(id);
  const greedy = explore();
  const flow = greedy.flow;
  // Each candidate's placed price with no return cost, and its returns, memoised by its orders.
  const memo = new Map<string, { placed: number; returns: number; back: string; columns: number }>();
  const measure = (orders: Map<string, string[]>): { placed: number; returns: number; back: string; columns: number } => {
    const key = JSON.stringify([...orders]);
    if (!memo.has(key)) {
      const e = explore(orders);
      memo.set(key, { placed: pictureCost(e, pricingAt(0, flow)), returns: returningLinks(e), back: backOf(e), columns: e.ranking.columns.length });
    }
    return memo.get(key)!;
  };
  const choose = (cost: number): { back: string; returns: number; columns: number } => {
    const orders = new Map(greedy.ranking.cycles.map(c => [c.key, c.candidates[0]] as [string, string[]]));
    let current = measure(orders);
    for (const cycle of greedy.ranking.cycles) {
      let best = current, chosen = cycle.candidates[0];
      for (const candidate of cycle.candidates.slice(1)) {
        const trial = measure(new Map([...orders, [cycle.key, candidate]]));
        if (trial.placed + cost * trial.returns < best.placed + cost * best.returns - 1e-6) { best = trial; chosen = candidate; }
      }
      orders.set(cycle.key, chosen);
      current = best;
    }
    return current;
  };
  const greedyRead = { back: backOf(greedy), returns: returningLinks(greedy), columns: greedy.ranking.columns.length };
  const leaves = grid.find(cost => choose(cost).back !== greedyRead.back);
  const at = Object.fromEntries(shown.map(cost => [cost, choose(cost)]));
  for (const cost of shown) {
    const real = chooseCycleOrders(greedy, explore, pricingAt(cost, flow)).exploration;
    if (backOf(real) !== at[cost].back) console.log(`MISMATCH ${id} at ${cost}`);
  }
  const fewest = [...memo.values()].reduce((m, x) => (x.returns < m.returns ? x : m));
  const cell = (x: { back: string; returns: number; columns: number }): string => `${x.returns}/${x.columns}${x.back === greedyRead.back ? "" : x.returns > greedyRead.returns ? " +" : x.back === fewest.back ? " F" : " o"}`;
  const short = id.endsWith("/") ? "localView/" : id.split("/").pop();
  rows.push({ id, leaves, greedy: greedyRead, at, candidates: [...memo.values()] });
  console.log(`| ${short} | ${leaves ?? `>${grid[grid.length - 1]}`} | ${cell(greedyRead)} | ${shown.map(cost => cell(at[cost])).join(" | ")} | ${[...memo.values()].map(x => `${Math.round(x.placed)}:${x.returns}`).join(" ")} |`);
}
fs.writeFileSync(`placed-flip-${process.argv[5] ?? "run"}.json`, JSON.stringify(rows));
