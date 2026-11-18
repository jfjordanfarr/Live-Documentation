// A small picture where a two-file cycle keeps the greedy order at a small return cost because the fewest-returns order
// costs more columns than the return it saves, and leaves it at a large cost.
import { edgeKey, rankBranches } from "../../../../packages/explorer/src/client/views/localView/branches";

const node = (id: string): any => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`, archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] });
const ref = (s: string, t: string, sym: string): any => ({ sourceId: s, targetId: t, targetSymbol: sym, direction: "outbound", kind: "dependency" });
let state = 7;
const next = (): number => (state = (state * 48271) % 2147483647) / 2147483647;
const names = ["a", "b", "c", "d", "e"];
for (let trial = 0; trial < 20000; trial++) {
  const links: any[] = [ref("a", "b", "x"), ref("a", "b", "y"), ref("b", "a", "x")];
  for (const s of names) for (const t of names) if (s !== t && !(["a", "b"].includes(s) && ["a", "b"].includes(t)) && next() < 0.25) {
    const k = 1 + Math.floor(next() * 3);
    for (let i = 0; i < k; i++) links.push(ref(s, t, `s${i}`));
  }
  const files = names.map(node);
  const back = (cost: number): string => [...rankBranches(files, links, { returnCost: cost }).back].sort().join("|");
  const small = rankBranches(files, links, { returnCost: 1 }), large = rankBranches(files, links, { returnCost: 100 });
  // Only the two-file cycle: nothing else may return.
  const greedyReturns = links.filter(l => l.sourceId === "a" && l.targetId === "b").map(edgeKey).sort().join("|");
  if (back(1) !== greedyReturns || back(100) === greedyReturns) continue;
  if (large.back.size !== 1) continue;
  console.log(JSON.stringify(links.filter(l => !(["a", "b"].includes(l.sourceId) && ["a", "b"].includes(l.targetId))).map(l => `${l.sourceId}>${l.targetId}`)));
  console.log("small", small.columns.map(c => c.map(n => n.id).join("")).join(" "), "large", large.columns.map(c => c.map(n => n.id).join("")).join(" "));
  if (links.length < 12) break;
}
