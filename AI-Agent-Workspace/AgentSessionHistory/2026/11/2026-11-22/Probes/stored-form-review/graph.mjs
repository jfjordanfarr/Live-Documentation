// Probe of 2026-11-22 (not product code), the stored form's review: the graph's cost, n files whose paths share a
// beginning of L letters, each depending on every file. From the repository's root:
//   node --max-old-space-size=4096 <this folder>/graph.mjs $PWD/packages/stored-form/src/storedForm.ts <n> <L>
import { framesOf, paddedTo, mib } from "./lib.mjs";
const M = await import(process.argv[2]);
const [n, L] = [Number(process.argv[3]), Number(process.argv[4])];
const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
const prefix = "p".repeat(L);
const paths = Array.from({ length: n }, (_, i) => `${prefix}/${String(i).padStart(6, "0")}`);
const deps = paths.map((target) => ({ label: "x", link: "x", target, qualifiers: [] }));
const pieces = [];
const writer = M.createWriter(head, { onBytes: (b) => void pieces.push(b) });
for (const codePath of paths) await writer.add({ codePath, layer: 0, entries: [], authored: "", symbols: [], dependencies: deps });
await writer.finish().catch((e) => console.log("writer:", e.message));
const bytes = paddedTo(framesOf(Buffer.concat(pieces)));
const raw = framesOf(bytes).reduce((s, f) => s + f.raw.length, 0);
console.log(`n ${n}, prefix ${L}: file ${mib(bytes.length)}, inflates ${mib(raw)}, bound ${mib(M.inflationBound(bytes.length))}`);
let t = performance.now();
const read = await M.readScan(bytes);
console.log(`readScan ${read.ok ? "ok" : read.reason} in ${(performance.now() - t).toFixed(0)} ms`);
t = performance.now();
const view = M.graphViewOf(read.value);
view.file(paths[0]);
console.log(`graphViewOf, one file asked: ${(performance.now() - t).toFixed(0)} ms`);
t = performance.now();
M.graphOf(read.value);
console.log(`graphOf: ${(performance.now() - t).toFixed(0)} ms`);
