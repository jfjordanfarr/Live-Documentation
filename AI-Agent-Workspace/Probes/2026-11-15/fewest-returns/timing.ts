// The ranking's time before and after, the exact search's time at each cycle size on a worst case, and how far the large
// cycle's path (weighted greedy, then single moves) lands from the exact answer on every cycle of this repository.
import fs from "node:fs";
import { rankBranches as rankBefore } from "./branches-base";
import { exploreBranches, rankBranches as rankAfter } from "../../../../packages/explorer/src/client/views/localView/branches";
import { comparePrices, exactOrder, greedyOrder, improvedOrder, priceOf } from "../../../../packages/explorer/src/client/views/localView/cycle-order";
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

// The cycles of a picture, by the ranking's own weights.
function cyclesOf(nodes: any[], links: any[]): number[][][] {
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
  return out.filter(c => c.length > 1).map(c => { const files = [...c].sort(); return files.map(p => files.map(q => refs.get(`${p}\0${q}`) ?? 0)); });
}

const include = (node: any): boolean => node.archetype !== "asset";
const pictures: Array<{ id: string; nodes: any[]; links: any[]; largest: number }> = [];
for (const node of graph.nodes) {
  if (node.archetype === "asset") continue;
  const exploration = exploreBranches(node, graph, EMPTY_PIN_SET, n => n.id === node.id || include(n));
  const cycles = cyclesOf(exploration.subgraph.nodes, exploration.subgraph.links);
  pictures.push({ id: node.id, nodes: exploration.subgraph.nodes, links: exploration.subgraph.links, largest: Math.max(0, ...cycles.map(c => c.length)) });
}

// Large path against exact on every distinct cycle small enough for the exact search (up to 16 files here).
const seen = new Set<string>();
let checked = 0, same = 0, gap = 0, pairGap = 0;
const misses: string[] = [];
for (const picture of pictures) for (const weight of cyclesOf(picture.nodes, picture.links)) {
  const key = JSON.stringify(weight);
  if (seen.has(key) || weight.length > 16) continue;
  seen.add(key);
  const today = greedyOrder(weight, false);
  const exact = priceOf(exactOrder(weight, today), weight, today), large = priceOf(improvedOrder(greedyOrder(weight, true), weight, today), weight, today);
  checked++;
  if (large.backward === exact.backward && large.pairs === exact.pairs) same++;
  else misses.push(`${weight.length} files: exact ${JSON.stringify(exact)}, large path ${JSON.stringify(large)}, in ${picture.id}`);
  gap += large.backward - exact.backward; pairGap += large.pairs - exact.pairs;
  if (comparePrices(large, exact) < 0) throw new Error("below the exact answer");
}
console.log(`large path against exact: ${checked} distinct cycles of 2 to 16 files, ${same} at the exact backward and pairs; ${gap} backward references more in all, ${pairGap} pairs more`);
for (const miss of misses) console.log("  " + miss);

// The ranking's time on the largest pictures: by references, and by cycle.
const largestByLinks = [...pictures].sort((a, b) => b.links.length - a.links.length).slice(0, 2);
const largestByCycle = [...pictures].sort((a, b) => b.largest - a.largest).slice(0, 1);
const eightCycle = pictures.filter(p => p.largest >= 6 && p.largest <= 12).sort((a, b) => b.largest - a.largest).slice(0, 1);
for (const picture of [...largestByLinks, ...largestByCycle, ...eightCycle]) {
  const b = median(() => rankBefore(picture.nodes, picture.links), 41), a = median(() => rankAfter(picture.nodes, picture.links), 41);
  console.log(`rankBranches ${picture.id}: ${picture.nodes.length} files, ${picture.links.length} references, largest cycle ${picture.largest}: before ${b.toFixed(2)} ms, after ${a.toFixed(2)} ms`);
}

// The exact search's worst case at each size: every file uses every other by one to nine references.
let state = 1;
const next = (): number => (state = (state * 48271) % 2147483647) / 2147483647;
for (const n of [6, 8, 10, 11, 12, 13, 14, 16]) {
  const weight = Array.from({ length: n }, (_, p) => Array.from({ length: n }, (_, c) => (p === c ? 0 : 1 + Math.floor(next() * 9))));
  const today = greedyOrder(weight, false);
  const exact = median(() => exactOrder(weight, today), n > 13 ? 5 : 21);
  const large = median(() => improvedOrder(greedyOrder(weight, true), weight, today), 21);
  console.log(`worst case ${n} files: exact ${exact.toFixed(2)} ms, large path ${large.toFixed(2)} ms`);
}
for (const n of [25, 50]) {
  const weight = Array.from({ length: n }, (_, p) => Array.from({ length: n }, (_, c) => (p === c ? 0 : 1 + Math.floor(next() * 9))));
  const today = greedyOrder(weight, false);
  console.log(`worst case ${n} files: large path ${median(() => improvedOrder(greedyOrder(weight, true), weight, today), 11).toFixed(2)} ms`);
}
