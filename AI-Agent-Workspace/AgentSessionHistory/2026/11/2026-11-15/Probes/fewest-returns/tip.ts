// What one reference that tips a two-file cycle does to a real picture: branch-renderer.ts opened alone, where
// directory-flow.ts and branch-scene.ts use each other; references are added to the lighter direction one at a time.
import fs from "node:fs";
import { edgeKey, exploreBranches, rankBranches } from "../../../../packages/explorer/src/client/views/localView/branches";
import { EMPTY_PIN_SET } from "../../../../packages/explorer/src/client/views/pin-state";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";

const graph: any = explorerGraphOf(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).graph);
const subject = graph.nodes.find((n: any) => n.id === process.argv[3]);
const exploration = exploreBranches(subject, graph, EMPTY_PIN_SET, (n: any) => n.id === subject.id || n.archetype !== "asset");
const nodes = exploration.subgraph.nodes, links = exploration.subgraph.links;
const short = (id: string): string => id.split("/").pop()!;
const between = (a: string, b: string): number => links.filter(e => e.sourceId === a && e.targetId === b).length;
const pair = links.map(e => [e.sourceId, e.targetId]).find(([a, b]) => a !== b && between(b, a) > 0)!;
const [heavy, light] = between(pair[0], pair[1]) >= between(pair[1], pair[0]) ? pair : [pair[1], pair[0]];
console.log(`${short(heavy)} uses ${short(light)} ${between(heavy, light)}, ${short(light)} uses ${short(heavy)} ${between(light, heavy)}`);
const columnsOf = (ranking: any): Map<string, number> => new Map(ranking.columns.flatMap((c: any[], i: number) => c.map(n => [n.id, i] as const)));
const base = rankBranches(nodes, links);
const baseColumns = columnsOf(base);
const returns = (ranking: any, all: any[]): string => [...new Set(all.filter(e => ranking.back.has(edgeKey(e))).map(e => `${short(e.sourceId)} uses ${short(e.targetId)}`))].join("; ");
console.log(`as it is: ${returns(base, links)}`);
const added: any[] = [];
for (let extra = 1; extra <= 4; extra++) {
  added.push({ sourceId: light, targetId: heavy, sourceSymbol: `extra${extra}`, targetSymbol: `extra${extra}`, kind: "import", direction: "inbound" });
  const all = [...links, ...added];
  const ranking = rankBranches(nodes, all);
  const columns = columnsOf(ranking);
  const moved = [...columns].filter(([id, c]) => baseColumns.get(id) !== c).map(([id, c]) => `${short(id)} ${baseColumns.get(id)}→${c}`);
  console.log(`+${extra} uses of ${short(heavy)} by ${short(light)}: returns ${returns(ranking, all)}; cards that change column: ${moved.join(", ") || "none"}`);
}
