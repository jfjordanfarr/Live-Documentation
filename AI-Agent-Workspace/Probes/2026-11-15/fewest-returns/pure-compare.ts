// For every picture whose ranking changed, the ranking's own signals before and after: the references read backward and
// the pairs they return between, the columns, the column spans of the forward references (the sum the ranking
// minimises, each weighted by its links) and the tallest column's cards.
import fs from "node:fs";
import { edgeKey as edgeKeyBefore, exploreBranches as exploreBefore } from "./branches-base";
import { edgeKey, exploreBranches as exploreAfter } from "../../../../packages/explorer/src/client/views/localView/branches";
import { linksOf } from "../../../../packages/explorer/src/client/views/localView/directory-flow";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const ids = fs.readFileSync(process.argv[3], "utf8").split("\n").flatMap(line => (/\s(\S+)$/u.exec(line.trim()) && line.includes("->") ? [/\s(\S+)$/u.exec(line.trim())![1]] : []));
const include = (node: any): boolean => node.archetype !== "asset";
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));

function signals(exploration: any, key: (edge: any) => string): any {
  const column = new Map<string, number>();
  exploration.ranking.columns.forEach((list: any[], i: number) => list.forEach(n => column.set(n.id, i)));
  let backward = 0, spans = 0;
  const pairs = new Set<string>();
  for (const edge of exploration.subgraph.links) {
    if (edge.sourceId === edge.targetId || !column.has(edge.sourceId) || !column.has(edge.targetId)) continue;
    if (exploration.ranking.back.has(key(edge))) { backward += linksOf(edge); pairs.add([edge.sourceId, edge.targetId].sort().join("\0")); }
    else spans += linksOf(edge) * (column.get(edge.sourceId)! - column.get(edge.targetId)!);
  }
  return { backward, pairs: pairs.size, columns: exploration.ranking.columns.length, spans, tallest: Math.max(...exploration.ranking.columns.map((c: any[]) => c.length)) };
}

const rows: string[] = [];
const totals = { before: { backward: 0, pairs: 0, columns: 0, spans: 0, tallest: 0 }, after: { backward: 0, pairs: 0, columns: 0, spans: 0, tallest: 0 } };
for (const id of ids) {
  const directory = id.endsWith("/");
  const explore = (fn: typeof exploreAfter): any => directory
    ? fn(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([id.slice(0, -1)]), directoryFlow: true })
    : fn(byId.get(id) as any, graph, EMPTY_PIN_SET, (n: any) => n.id === id || include(n));
  const b = signals(explore(exploreBefore as any), edgeKeyBefore), a = signals(explore(exploreAfter), edgeKey);
  for (const k of Object.keys(totals.before) as Array<keyof typeof totals.before>) { totals.before[k] += b[k]; totals.after[k] += a[k]; }
  rows.push(`| ${id} | ${b.backward} → ${a.backward} | ${b.pairs} → ${a.pairs} | ${b.columns} → ${a.columns} | ${b.spans} → ${a.spans} | ${b.tallest} → ${a.tallest} |`);
}
console.log("| picture | backward | pairs | columns | spans | tallest column |\n| --- | --- | --- | --- | --- | --- |");
console.log(rows.join("\n"));
console.log(`| all ${ids.length} | ${totals.before.backward} → ${totals.after.backward} | ${totals.before.pairs} → ${totals.after.pairs} | ${totals.before.columns} → ${totals.after.columns} | ${totals.before.spans} → ${totals.after.spans} | ${totals.before.tallest} → ${totals.after.tallest} |`);
