// One layout of a picture on the nominal model against a page-like model whose cards are as tall as their rows and whose
// pins stand on their rows: is the nominal model's time its own, or the placement's?
import fs from "node:fs";
import { layoutScene, planBranches, type SceneMeasurer } from "../../../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration } from "../../../../packages/explorer/src/client/views/localView/branches";
import { nominalMeasurer } from "../../../../packages/explorer/src/client/views/localView/directory-flow";
import { getDefaultTuning } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const t = getDefaultTuning().localMap;
const id = process.argv[3];
const node = graph.nodes.find((n: any) => n.id === id);
const e = exploreBranches(node, graph, EMPTY_PIN_SET, (n: any) => n.id === id || n.archetype !== "asset");
const st = { columnGap: t.columnGap, itemGap: t.itemGap, bandGap: t.bandGap, neck: t.membraneNeck, bandPadding: t.membranePadding, cardMaxWidth: t.cardMaxWidth, evenness: t.membraneEvenness, levelness: t.rowLevelness };
const b = orderExploration(e, { sweeps: t.orderSweeps });
const plan = planBranches(b, st.bandPadding);
const rowsLike = (): SceneMeasurer => ({
  widths: cap => new Map([...plan.items.keys()].map(k => [k, Math.min(240, cap ?? Infinity)])),
  measure: cardWidths => ({
    heights: new Map([...cardWidths.keys()].map(k => [k, 60 + 40 * (b.rows.get(k)?.length ?? 1)])),
    labelHeights: new Map(),
    pin: (k, _d, symbol) => { const rows = b.rows.get(k) ?? []; const at = Math.max(0, rows.indexOf(symbol ?? "__internals__")); return 60 + 40 * at + 20; }
  })
});
for (const [name, measurer] of [["nominal", () => nominalMeasurer(plan.items.keys(), x => e.closed.has(x))], ["rows", rowsLike]] as const) {
  for (let i = 0; i < 2; i++) {
    const a = performance.now();
    const scene = layoutScene(plan, b, measurer(), st);
    console.log(name, (performance.now() - a).toFixed(1), "ms, wires", scene.wires.length, "items", plan.items.size, "optimal", scene.placement.optimal);
  }
}
