// Probe of 2026-11-22 (not product code), the stored form's review: k frames of records of one byte each, which the
// quick open refuses by the paths' count and the whole read refuses only after inflating every frame at once. From the
// repository's root:
//   node --max-old-space-size=6000 <this folder>/frames.mjs $PWD/packages/stored-form/src/storedForm.ts <k>
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { framed, mib } from "./lib.mjs";
setFlagsFromString("--expose-gc");
const gc = runInNewContext("gc");
const M = await import(process.argv[2]);
const k = Number(process.argv[3]);
const headRaw = Buffer.from([1, 0, 0, 0, 1, 0x73, 0]);
const frames = [{ kind: 1, count: 0, raw: headRaw }];
for (let i = 0; i < k; i += 1) frames.push({ kind: 3, count: 256, raw: Buffer.from([0]) });
frames.push({ kind: 4, count: 256 * k, raw: Buffer.from([0]) }, { kind: 5, count: 256 * k, raw: Buffer.from([0]) }, { kind: 6, count: 0, raw: Buffer.alloc(32) });
const bytes = framed(frames);
const used = () => { const m = process.memoryUsage(); return m.rss; };
const fuzzUsed = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers + m.external; };
let fpeak = 0; const fs2 = setInterval(() => { fpeak = Math.max(fpeak, fuzzUsed()); }, 1); const fbase = fuzzUsed();
gc();
const base = used();
let peak = base;
const sampler = setInterval(() => { peak = Math.max(peak, used()); }, 1);
const t = performance.now();
const read = await M.readScan(bytes);
clearInterval(sampler);
peak = Math.max(peak, used());
console.log(`${k} frames: file ${mib(bytes.length)}; readScan ${read.ok ? "ok" : read.reason.slice(0, 80)} in ${(performance.now() - t).toFixed(0)} ms; rss peak above start ${mib(peak - base)}; the fuzzer's bound ${mib(48 * 1048576 + 64 * bytes.length)}`);
clearInterval(fs2); console.log(`fuzzer metric peak above start ${mib(fpeak - fbase)}`);
const t2 = performance.now();
const open = await M.openScan(bytes);
console.log(`openScan ${open.ok ? "ok" : open.reason.slice(0, 80)} in ${(performance.now() - t2).toFixed(0)} ms`);
