// The root's measurement of 2026-11-15 (scratchpad fas/slack.ts), pointed at this worktree and extended: for each file
// opened alone in the 2D Local Map, and for four opened directories under the flow trial, the references the ranking
// reads backward against the least any left-to-right order of the same files could, with each picture's returning
// references and its columns kept so that two runs can be compared picture by picture.
import fs from "node:fs";
import { exploreBranches, edgeKey } from "../../../../packages/explorer/src/client/views/localView/branches";
import { linksOf } from "../../../../packages/explorer/src/client/views/localView/directory-flow";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const [bundlePath, label] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const graph: any = explorerGraphOf(data.graph);

function sccs(ids: string[], succ: Map<string, Map<string, number>>): string[][] {
  const index = new Map<string, number>(), low = new Map<string, number>(), stack: string[] = [], on = new Set<string>(), out: string[][] = [];
  const visit = (v: string): void => {
    index.set(v, index.size); low.set(v, index.get(v)!); stack.push(v); on.add(v);
    for (const w of succ.get(v)!.keys()) {
      if (!index.has(w)) { visit(w); low.set(v, Math.min(low.get(v)!, low.get(w)!)); }
      else if (on.has(w)) low.set(v, Math.min(low.get(v)!, index.get(w)!));
    }
    if (low.get(v) === index.get(v)) { const c: string[] = []; let m: string; do { m = stack.pop()!; on.delete(m); c.push(m); } while (m !== v); out.push(c); }
  };
  for (const id of ids) if (!index.has(id)) visit(id);
  return out;
}

/** Least total weight of backward edges over all orders of one component, by subsets; null when too large. */
function exact(members: string[], succ: Map<string, Map<string, number>>): number | null {
  const n = members.length;
  if (n > 22) return null;
  const at = new Map(members.map((m, i) => [m, i]));
  const w: number[][] = members.map(() => new Array(n).fill(0));
  for (const v of members) for (const [u, weight] of succ.get(v)!) if (at.has(u)) w[at.get(v)!][at.get(u)!] += weight;
  const f = new Float64Array(1 << n).fill(Infinity);
  f[0] = 0;
  for (let S = 1; S < 1 << n; S += 1) {
    let best = Infinity;
    for (let v = 0; v < n; v += 1) {
      if (!(S >> v & 1)) continue;
      const rest = S & ~(1 << v);
      let cost = f[rest];
      for (let u = 0; u < n; u += 1) if (rest >> u & 1) cost += w[v][u];
      if (cost < best) best = cost;
    }
    f[S] = best;
  }
  return f[(1 << n) - 1];
}

function measure(id: string, exploration: ReturnType<typeof exploreBranches>, ms: number): any {
  const links = exploration.subgraph.links.filter((e: any) => e.sourceId !== e.targetId);
  const columns = exploration.ranking.columns.map(column => column.map(n => n.id));
  if (!links.length) return { id, files: exploration.subgraph.nodes.length, links: 0, heuristic: 0, optimum: 0, pairs: 0, back: [], columns, ms };
  const ids = [...new Set(links.flatMap((e: any) => [e.sourceId, e.targetId]))].sort();
  const succ = new Map<string, Map<string, number>>(ids.map(i => [i, new Map()]));
  let heuristic = 0;
  const heuristicPairs = new Set<string>(), back: string[] = [];
  for (const e of links) {
    const provider = e.targetId, consumer = e.sourceId, weight = linksOf(e);
    succ.get(provider)!.set(consumer, (succ.get(provider)!.get(consumer) ?? 0) + weight);
    if (exploration.ranking.back.has(edgeKey(e))) { heuristic += weight; heuristicPairs.add([provider, consumer].sort().join("\0")); back.push(edgeKey(e)); }
  }
  let optimum = 0, largest = 0, unknown = false;
  for (const component of sccs(ids, succ)) {
    if (component.length < 2) continue;
    largest = Math.max(largest, component.length);
    const best = exact(component, succ);
    if (best === null) { unknown = true; continue; }
    optimum += best;
  }
  return { id, files: ids.length, links: links.reduce((s: number, e: any) => s + linksOf(e), 0), heuristic, pairs: heuristicPairs.size,
    optimum: unknown ? null : optimum, largest, back: back.sort(), columns, ms };
}

const rows: any[] = [];
const include = (node: any): boolean => node.archetype !== "asset";
for (const node of graph.nodes) {
  if (node.archetype === "asset" || node.kind === "directory") continue;
  let exploration, ms = 0;
  try {
    const started = performance.now();
    exploration = exploreBranches(node, graph, EMPTY_PIN_SET, n => n.id === node.id || include(n));
    ms = performance.now() - started;
  } catch (e) { rows.push({ id: node.id, error: String(e).slice(0, 80) }); continue; }
  rows.push(measure(node.id, exploration, ms));
}
const directories = label.startsWith("estate") ? [] : ["packages/explorer/src/client", "packages/explorer/src/client/views/localView", "packages/engine/src/live-docs", "scripts"];
const directoryRows = directories.map(directory => {
  const started = performance.now();
  const exploration = exploreBranches(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([directory]), directoryFlow: true });
  return measure(`${directory}/`, exploration, performance.now() - started);
});

const withLinks = rows.filter(r => !r.error);
const lit = withLinks.filter(r => r.heuristic > 0);
const slack = lit.filter(r => r.optimum !== null && r.optimum < r.heuristic);
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
console.log(JSON.stringify({
  label, pictures: withLinks.length, errors: rows.filter(r => r.error).length,
  backward: { none: withLinks.filter(r => r.heuristic === 0).length, "1-4": lit.filter(r => r.heuristic <= 4).length, "5-9": lit.filter(r => r.heuristic >= 5 && r.heuristic <= 9).length, "10+": lit.filter(r => r.heuristic >= 10).length },
  unknownOptimum: lit.filter(r => r.optimum === null).length,
  picturesWithSlack: slack.length, heuristicTotal: sum(lit.filter(r => r.optimum !== null).map(r => r.heuristic)), optimumTotal: sum(lit.filter(r => r.optimum !== null).map(r => r.optimum)),
  allBackward: sum(lit.map(r => r.heuristic)), allPairs: sum(lit.map(r => r.pairs)),
  couldGoDark: slack.filter(r => r.optimum === 0).length,
  largestComponent: Math.max(0, ...withLinks.map(r => r.largest ?? 0))
}, null, 1));
for (const r of slack.sort((a, b) => (b.heuristic - b.optimum) - (a.heuristic - a.optimum)).slice(0, 14)) console.log(`${String(r.heuristic).padStart(3)} -> ${String(r.optimum).padStart(3)}  files ${String(r.files).padStart(3)}  scc ${r.largest}  ${r.id}`);
for (const r of directoryRows) console.log("directory", JSON.stringify({ id: r.id, files: r.files, links: r.links, backward: r.heuristic, pairs: r.pairs, optimum: r.optimum, largest: r.largest, ms: Math.round(r.ms) }));
const slowest = [...withLinks].sort((a, b) => b.ms - a.ms).slice(0, 3);
for (const r of slowest) console.log("slowest", r.id, `${r.ms.toFixed(1)} ms`, `files ${r.files} links ${r.links} scc ${r.largest}`);
fs.writeFileSync(`rows-${label}.json`, JSON.stringify({ rows, directoryRows }));
