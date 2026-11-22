// Second reading of 2026-11-22 (README.md beside this file), not product code: is every graph disagreement explained by one cause? The module's graph with its unlinked dependencies'
// edges taken out, set beside a reader's; prints the first differing file otherwise.
import { readFileSync } from "node:fs";
import { docPathOf, graphOf, readScan } from "../../../../../../../packages/stored-form/src/storedForm";
const canonical = (v: unknown): string => JSON.stringify(v, (_k, x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x as Record<string, unknown>).filter(([, y]) => y !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x));
const [fpk, out] = process.argv.slice(2);
const r = await readScan(new Uint8Array(readFileSync(fpk)));
if (!r.ok) throw new Error(r.reason);
const g = graphOf(r.value);
const mine = Object.values(g.files).map((f) => ({ path: f.codePath, document: docPathOf(r.value.head.location, f.codePath), edges: f.edges.filter((e) => e.link !== undefined), outbound: f.outbound, inbound: f.inbound, documentation: f.documentation, documentedBy: f.documentedBy }));
const theirs = (JSON.parse(readFileSync(out, "utf8")) as { files: unknown[] }).files;
let same = mine.length === theirs.length;
for (let i = 0; i < Math.max(mine.length, theirs.length); i += 1) {
  const a = canonical(mine[i]); const b = canonical(theirs[i]);
  if (a !== b) { same = false; console.log(`file ${i}\n module (unlinked dependency edges out): ${a.slice(0, 600)}\n reader: ${b.slice(0, 600)}`); break; }
}
const unlinked = Object.values(g.files).reduce((n, f) => n + f.edges.filter((e) => e.link === undefined).length, 0);
console.log(same ? `same once the module's ${unlinked} unlinked dependency edges are out` : "differs otherwise");
