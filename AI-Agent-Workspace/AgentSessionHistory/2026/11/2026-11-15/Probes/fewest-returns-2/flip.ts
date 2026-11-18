// For each picture the fewest-returns ranking changed, the least return cost at which the priced ranking leaves the
// greedy order (its returns differ from the greedy order's), and the ranking's signals at a few costs.
import fs from "node:fs";
import { exploreBranches as exploreBase, edgeKey } from "./branches-base";
import { exploreBranches } from "../../../../packages/explorer/src/client/views/localView/branches";
import { linksOf } from "../../../../packages/explorer/src/client/views/localView/directory-flow";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const ids = fs.readFileSync(process.argv[3], "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") ? [match[1]] : [];
});
const show = (process.argv[4] ?? "0,1,2,3,4,6,1000").split(",").map(Number);
const include = (node: any): boolean => node.archetype !== "asset";
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));
const explore = (fn: any, id: string, returnCost?: number): any => id.endsWith("/")
  ? fn(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([id.slice(0, -1)]), directoryFlow: true, ranking: { returnCost } })
  : fn(byId.get(id), graph, EMPTY_PIN_SET, (n: any) => n.id === id || include(n), { ranking: { returnCost } });

function signals(exploration: any): { back: string; backward: number; columns: number; spans: number; tallest: number } {
  const column = new Map<string, number>();
  exploration.ranking.columns.forEach((list: any[], i: number) => list.forEach(n => column.set(n.id, i)));
  let backward = 0, spans = 0;
  const back: string[] = [];
  for (const edge of exploration.subgraph.links) {
    if (edge.sourceId === edge.targetId || !column.has(edge.sourceId) || !column.has(edge.targetId)) continue;
    if (exploration.ranking.back.has(edgeKey(edge))) { backward += linksOf(edge); back.push(edgeKey(edge)); }
    else spans += linksOf(edge) * (column.get(edge.sourceId)! - column.get(edge.targetId)!);
  }
  return { back: back.sort().join("|"), backward, columns: exploration.ranking.columns.length, spans, tallest: Math.max(...exploration.ranking.columns.map((c: any[]) => c.length)) };
}

const grid = [...Array.from({ length: 81 }, (_, i) => i / 4), 25, 30, 40, 60, 100, 1000];
const rows: any[] = [];
for (const id of ids) {
  const greedy = signals(explore(exploreBase, id));
  const at = new Map(grid.map(a => [a, signals(explore(exploreBranches, id, a))]));
  const leaves = grid.find(a => at.get(a)!.back !== greedy.back);
  const fewest = at.get(1000)!;
  const cell = (s: any): string => `${s.backward}/${s.columns}/${s.spans}`;
  rows.push({ id, leaves, greedy, fewest, at: Object.fromEntries(show.map(a => [a, at.get(a)])) });
  console.log(`| ${id.split("/").slice(-2).join("/")} | ${leaves ?? "never"} | ${cell(greedy)} | ${show.map(a => cell(at.get(a)!) + (at.get(a)!.back === greedy.back ? "" : "*")).join(" | ")} |`);
}
fs.writeFileSync(`flip-${process.argv[5] ?? "run"}.json`, JSON.stringify(rows));
