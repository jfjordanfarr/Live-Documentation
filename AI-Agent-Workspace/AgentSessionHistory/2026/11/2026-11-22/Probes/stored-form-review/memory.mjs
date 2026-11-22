// Probe of 2026-11-22 (not product code), the stored form's review: the memory a whole read holds of a file of one
// record of n empty symbols, within the inflation bound, against the bound the module's fuzzer holds a read to (48 MiB
// and 64 bytes a byte read). From the repository's root:
//   node --max-old-space-size=6000 <this folder>/memory.mjs $PWD/packages/stored-form/src/storedForm.ts <n>
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { framesOf, paddedTo, mib } from "./lib.mjs";
setFlagsFromString("--expose-gc");
const gc = runInNewContext("gc");
const M = await import(process.argv[2]);
const n = Number(process.argv[3]);
const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
const sym = { name: "", kind: "", flags: [], references: [], sections: [], documentation: [] };
const pieces = [];
const writer = M.createWriter(head, { onBytes: (b) => void pieces.push(b) });
await writer.add({ codePath: "a", layer: 0, entries: [], authored: "", symbols: Array.from({ length: n }, () => sym), dependencies: [] });
await writer.finish().catch((e) => console.log("writer:", e.message));
const bytes = paddedTo(framesOf(Buffer.concat(pieces)));
pieces.length = 0;
const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers + m.external; };
gc();
const base = used();
let peak = base;
const sampler = setInterval(() => { peak = Math.max(peak, used()); }, 1);
const read = await M.readScan(bytes);
peak = Math.max(peak, used());
gc();
const held = used() - base;
clearInterval(sampler);
const fuzzBound = 48 * 1048576 + 64 * bytes.length;
console.log(`${n} symbols: file ${bytes.length} B (${mib(bytes.length)}), read ${read.ok ? "ok" : read.reason}; peak ${mib(peak - base)}, held after ${mib(held)}; the fuzzer's bound ${mib(fuzzBound)}; held per file byte ${(held / bytes.length).toFixed(0)}`);
