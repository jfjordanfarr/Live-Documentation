// Probe of 2026-11-22 (not product code): the stored form's reads timed under bare Node, which runs the module's
// TypeScript source unchanged, against today's index.json gzipped. No loader is counted in its time or memory.
//
//   node <this folder>/read-time.mjs stored <file.bin> | json <index.json.gz> | graph <file.bin>
//     prints the time to the first answer (what depends on the most depended-on file, by name), to the whole map, and
//     the process's peak memory. `graph` also builds the graph; `stored` stops at every fact read and checked.
//   node --cpu-prof --cpu-prof-dir <dir> <this folder>/read-time.mjs stored <file.bin>, then
//   node <this folder>/read-time.mjs profile <dir>/<file>.cpuprofile
//     the profile's self time by function, largest first.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const ms = (start) => Math.round(Number(process.hrtime.bigint() - start) / 1e5) / 10;
const peak = () => Math.round(process.resourceUsage().maxRSS / 1024);

const [mode, path] = process.argv.slice(2);
const module = new URL("../../../../../../../packages/stored-form/src/storedForm.ts", import.meta.url);

if (mode === "stored" || mode === "graph") {
  const { graphOf, openScan, readScan } = await import(module.href);
  const start = process.hrtime.bigint();
  const bytes = new Uint8Array(readFileSync(path));
  const opened = await openScan(bytes);
  if (!opened.ok) throw new Error(opened.reason);
  const scan = opened.value;
  let hub = 0;
  for (let i = 0; i < scan.paths.length; i += 1) if (scan.inbound(i).length > scan.inbound(hub).length) hub = i;
  const answer = scan.inbound(hub).map((j) => scan.paths[j]);
  const firstMs = ms(start);
  const whole = await readScan(bytes);
  if (!whole.ok) throw new Error(whole.reason);
  const factsMs = ms(start);
  const graph = mode === "graph" ? graphOf(whole.value) : undefined;
  console.log(JSON.stringify({ form: mode, dependents: answer.length, firstMs, factsMs, wholeMs: ms(start), files: whole.value.files.length, graphFiles: graph ? Object.keys(graph.files).length : undefined, peakMb: peak() }));
} else if (mode === "json") {
  const start = process.hrtime.bigint();
  const graph = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  let hub = "";
  for (const [p, f] of Object.entries(graph.files)) if (!hub || f.inbound.length > graph.files[hub].inbound.length) hub = p;
  console.log(JSON.stringify({ form: "index.json.gz", dependents: graph.files[hub].inbound.length, wholeMs: ms(start), peakMb: peak() }));
} else if (mode === "profile") {
  const profile = JSON.parse(readFileSync(path, "utf8"));
  const self = new Map();
  const dt = new Map();
  profile.samples.forEach((id, i) => dt.set(id, (dt.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0)));
  let total = 0;
  for (const node of profile.nodes) {
    const t = (dt.get(node.id) ?? 0) / 1000;
    total += t;
    const key = `${node.callFrame.functionName || "(anonymous)"} ${node.callFrame.url.split("/").pop()}:${node.callFrame.lineNumber + 1}`;
    self.set(key, (self.get(key) ?? 0) + t);
  }
  const rows = [...self].sort((a, b) => b[1] - a[1]).slice(0, 25);
  console.log(`total ${Math.round(total)} ms`);
  for (const [k, t] of rows) console.log(`${t.toFixed(1).padStart(8)} ms  ${(100 * t / total).toFixed(1).padStart(5)} %  ${k}`);
} else {
  throw new Error("usage: read-time.mjs stored|graph <file.bin> | json <index.json.gz> | profile <file.cpuprofile>");
}
