// The ranking's time before (the greedy order) and now (each cycle's candidates priced by the picture's columns) on the
// largest pictures, and how many candidates each picture's cycles produce.
import fs from "node:fs";
import { rankBranches as rankBefore } from "./branches-base";
import { exploreBranches, rankBranches as rankAfter } from "../../../../packages/explorer/src/client/views/localView/branches";
import { cycleCandidates } from "../../../../packages/explorer/src/client/views/localView/cycle-order";
import { linksOf } from "../../../../packages/explorer/src/client/views/localView/directory-flow";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const median = (f: () => void, runs: number): number => {
  for (let i = 0; i < 3; i++) f();
  const times: number[] = [];
  for (let i = 0; i < runs; i++) { const t = performance.now(); f(); times.push(performance.now() - t); }
  return times.sort((a, b) => a - b)[Math.floor(runs / 2)];
};
function cycles(nodes: any[], links: any[]): number[][][] {
  const ids = nodes.map(n => n.id), present = new Set(ids);
  const edges = links.filter(e => e.sourceId !== e.targetId && present.has(e.sourceId) && present.has(e.targetId));
  const succ = new Map<string, Set<string>>(ids.map(id => [id, new Set()]));
  const refs = new Map<string, number>();
  for (const e of edges) { succ.get(e.targetId)!.add(e.sourceId); refs.set(`${e.targetId}\0${e.sourceId}`, (refs.get(`${e.targetId}\0${e.sourceId}`) ?? 0) + linksOf(e)); }
  const index = new Map<string, number>(), low = new Map<string, number>(), stack: string[] = [], on = new Set<string>(), out: string[][] = [];
  const visit = (v: string): void => {
    index.set(v, index.size); low.set(v, index.get(v)!); stack.push(v); on.add(v);
    for (const w of succ.get(v)!) { if (!index.has(w)) { visit(w); low.set(v, Math.min(low.get(v)!, low.get(w)!)); } else if (on.has(w)) low.set(v, Math.min(low.get(v)!, index.get(w)!)); }
    if (low.get(v) === index.get(v)) { const c: string[] = []; let m: string; do { m = stack.pop()!; on.delete(m); c.push(m); } while (m !== v); out.push(c); }
  };
  for (const id of [...ids].sort()) if (!index.has(id)) visit(id);
  return out.filter(c => c.length > 1).map(c => { const f = [...c].sort(); return f.map(p => f.map(q => refs.get(`${p}\0${q}`) ?? 0)); });
}
const include = (node: any): boolean => node.archetype !== "asset";
const pictures: Array<{ id: string; nodes: any[]; links: any[]; candidates: number; largest: number }> = [];
for (const node of graph.nodes) {
  if (node.archetype === "asset") continue;
  const e = exploreBranches(node, graph, EMPTY_PIN_SET, (n: any) => n.id === node.id || include(n));
  const cs = cycles(e.subgraph.nodes, e.subgraph.links);
  pictures.push({ id: node.id, nodes: e.subgraph.nodes, links: e.subgraph.links, candidates: cs.reduce((s, w) => s + cycleCandidates(w).length - 1, 0), largest: Math.max(0, ...cs.map(w => w.length)) });
}
const byCandidates = [...pictures].sort((a, b) => b.candidates - a.candidates).slice(0, 4);
const byLinks = [...pictures].sort((a, b) => b.links.length - a.links.length).slice(0, 2);
for (const p of [...byCandidates, ...byLinks]) {
  const b = median(() => rankBefore(p.nodes, p.links), 21), a = median(() => rankAfter(p.nodes, p.links), 21);
  console.log(`${p.id}: ${p.nodes.length} files, ${p.links.length} references, largest cycle ${p.largest}, ${p.candidates} candidates beyond the greedy orders: before ${b.toFixed(2)} ms, now ${a.toFixed(2)} ms`);
}
const counts = new Map<number, number>();
for (const p of pictures) counts.set(p.candidates, (counts.get(p.candidates) ?? 0) + 1);
console.log("pictures by candidates beyond the greedy orders:", JSON.stringify([...counts].sort((x, y) => x[0] - y[0])));
