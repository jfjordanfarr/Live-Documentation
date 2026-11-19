// Runs the built generator once under Node over a folder, as the page runs it, and prints one JSON line: wall time,
// processor time, the process's peak resident memory (getrusage) and the heap's peak as sampled. The folder's
// .live-documentation is removed first, so that every run is a first run, as the page's always is.
//   node [--max-old-space-size=N] <this file> <repository root> <folder>
import { createRequire } from "node:module";
import { rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const [repo, folder] = process.argv.slice(2);
const require = createRequire(path.join(repo, "package.json"));
const { generateLiveDocs } = require(path.join(repo, "packages/generator/dist/generator.js"));
rmSync(path.join(folder, ".live-documentation"), { recursive: true, force: true });
let heapPeak = 0;
const sampler = setInterval(() => { heapPeak = Math.max(heapPeak, process.memoryUsage().heapUsed); }, 50);
const started = performance.now();
const cpu0 = process.cpuUsage();
let outcome;
try {
  const result = await generateLiveDocs({ workspaceRoot: folder, config: {}, logger: { info() {}, warn() {}, error() {} } });
  outcome = { ok: true, processed: result.processed, written: result.written };
} catch (error) {
  outcome = { ok: false, error: String(error).slice(0, 300) };
}
clearInterval(sampler);
const cpu = process.cpuUsage(cpu0);
console.log(JSON.stringify({
  folder: path.basename(folder), ...outcome,
  wallS: +((performance.now() - started) / 1000).toFixed(1), cpuS: +((cpu.user + cpu.system) / 1e6).toFixed(1),
  maxRssMB: Math.round(process.resourceUsage().maxRSS / 1024), heapPeakMB: Math.round(heapPeak / 1048576),
  heapLimitMB: Math.round(require("node:v8").getHeapStatistics().heap_size_limit / 1048576), load: os.loadavg().map((x) => x.toFixed(1)).join(" ")
}));
