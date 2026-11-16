// From flip.ts's rows: at each cost from 0 to 8, which pictures stand in the greedy order, which in the fewest-returns
// order, which in another, and which return more references than the greedy order does.
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
const include = (node: any): boolean => node.archetype !== "asset";
const byId = new Map(graph.nodes.map((n: any) => [n.id, n]));
const explore = (fn: any, id: string, returnCost?: number): any => id.endsWith("/")
  ? fn(null, graph, EMPTY_PIN_SET, include, { openDirectories: new Set([id.slice(0, -1)]), directoryFlow: true, ranking: { returnCost } })
  : fn(byId.get(id), graph, EMPTY_PIN_SET, (n: any) => n.id === id || include(n), { ranking: { returnCost } });
const read = (exploration: any): { back: string; backward: number } => {
  const back = exploration.subgraph.links.filter((e: any) => exploration.ranking.back.has(edgeKey(e)));
  return { back: back.map(edgeKey).sort().join("|"), backward: back.reduce((s: number, e: any) => s + linksOf(e), 0) };
};
const costs = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20];
const short = (id: string): string => (id.endsWith("/") ? "localView/" : id.split("/").pop()!);
const states = new Map<string, string[]>();
for (const id of ids) {
  const greedy = read(explore(exploreBase, id)), fewest = read(explore(exploreBranches, id, 1000));
  states.set(id, costs.map(cost => {
    const at = read(explore(exploreBranches, id, cost));
    return at.back === greedy.back ? "G" : at.back === fewest.back ? "F" : at.backward > greedy.backward ? `+${at.backward - greedy.backward}` : "o";
  }));
}
console.log(`| picture | ${costs.join(" | ")} |`);
for (const [id, row] of states) console.log(`| ${short(id)} | ${row.join(" | ")} |`);
console.log(`| more returns than greedy | ${costs.map((_, i) => [...states.values()].filter(r => r[i].startsWith("+")).length).join(" | ")} |`);
console.log(`| greedy kept | ${costs.map((_, i) => [...states.values()].filter(r => r[i] === "G").length).join(" | ")} |`);
