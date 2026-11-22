// Probe of 2026-11-22 (not product code): the two designs that might keep a reader's cost bounded, measured before
// either is built. Each run is a fresh process, so that its peak is its own.
//
//   node <this folder>/design-a.mjs <module.ts> <scratch dir> <file.bin> <mode>
// modes:
//   whole        today's whole read: every fact built and kept (the baseline)
//   walk         design 1's validation: every section read and checked in order, nothing kept but the string table,
//                the paths and the wires; then one file's facts asked (the hub's), decoded again from its section
//   search       design 1's search: every section decoded in turn for its symbols' names, nothing else kept
//   clone        design 2: the whole read in a worker, the scan then cloned across to the caller
//   ask          design 2: the whole read in a worker, kept there; the hub's facts asked by message
//   graph-clone  design 2: the whole read and the graph in a worker, the graph cloned across
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Worker } from "node:worker_threads";

const [modulePath, scratch, file, mode] = process.argv.slice(2);
const peak = () => Math.round(process.resourceUsage().maxRSS / 1024);
const heldMb = () => {
  globalThis.gc?.();
  const m = process.memoryUsage();
  return Math.round((m.heapUsed + m.arrayBuffers + m.external) / 1048576);
};

/** The module with its quick open keeping only the section it last decoded, and decoding an asked section again. */
function lazyModule() {
  let text = readFileSync(modulePath, "utf8");
  const keep = "        chunks.set(chunksRead, decoded.files);";
  const give = "      return chunks.get(k)!;";
  if (!text.includes(keep) || !text.includes(give)) throw new Error("the quick open is not where it was");
  text = text.replace(keep, "        chunks.clear();\n        chunks.set(chunksRead, decoded.files);");
  text = text.replace(
    give,
    `      const kept = chunks.get(k);
      if (kept) return kept;
      // Asked again after the walk: every string is met, so the section is decoded alone.
      const target = chunkFrames[k];
      const first = k * CHUNK;
      const again = decodeChunk(await rawOf_(target, "a section of records"), target.count, strings, strings.length, first > 0 ? paths[first - 1] : undefined, checked).files;
      chunks.clear();
      chunks.set(k, again);
      return again;`
  );
  const out = path.join(scratch, "lazy.ts");
  writeFileSync(out, text);
  return out;
}

const bytes = new Uint8Array(readFileSync(file));
const t0 = performance.now();
const ms = () => Math.round(performance.now() - t0);

if (mode === "whole") {
  const m = await import(modulePath);
  const read = await m.readScan(bytes);
  if (!read.ok) throw new Error(read.reason);
  console.log(JSON.stringify({ mode, readMs: ms(), peakMb: peak(), heldMb: heldMb(), files: read.value.files.length }));
} else if (mode === "walk" || mode === "search") {
  const m = await import(lazyModule());
  const opened = await m.openScan(bytes);
  if (!opened.ok) throw new Error(opened.reason);
  const scan = opened.value;
  let hub = 0;
  for (let i = 0; i < scan.paths.length; i += 1) if (scan.inbound(i).length > scan.inbound(hub).length) hub = i;
  let names = 0;
  const found = [];
  for (let k = 0; k * 256 < scan.paths.length; k += 1) {
    const one = await scan.file(k * 256);
    if (!one.ok) throw new Error(one.reason);
    if (mode === "search") {
      for (let i = k * 256; i < Math.min(scan.paths.length, (k + 1) * 256); i += 1) {
        const f = await scan.file(i);
        for (const s of f.value.symbols) if (s.name.includes("Get")) found.push(s.name), (names += 1);
      }
    }
  }
  const walkMs = ms();
  const held = heldMb();
  const a = performance.now();
  const asked = await scan.file(hub);
  const askMs = Math.round(performance.now() - a);
  console.log(JSON.stringify({ mode, walkMs, askMs, hubSymbols: asked.ok ? asked.value.symbols.length : asked.reason, found: names, peakMb: peak(), heldAfterWalkMb: held }));
} else {
  const worker = new Worker(
    `import { parentPort, workerData } from "node:worker_threads";
const m = await import(workerData.module);
const read = await m.readScan(workerData.bytes);
if (!read.ok) throw new Error(read.reason);
const scan = read.value;
let hub = 0;
const counts = new Map();
for (const f of scan.files) for (const d of f.dependencies) if (d.target) counts.set(d.target, (counts.get(d.target) ?? 0) + 1);
for (const [i, f] of scan.files.entries()) if ((counts.get(f.codePath) ?? 0) > (counts.get(scan.files[hub].codePath) ?? 0)) hub = i;
if (workerData.mode === "clone") parentPort.postMessage({ scan });
else if (workerData.mode === "graph-clone") parentPort.postMessage({ graph: m.graphOf(scan) });
else {
  parentPort.postMessage({ ready: true });
  parentPort.on("message", (i) => parentPort.postMessage({ file: scan.files[i ?? hub] }));
}`,
    { eval: true, workerData: { module: modulePath, bytes, mode } }
  );
  const first = await new Promise((resolve) => worker.once("message", resolve));
  const arrivedMs = ms();
  let askMs;
  if (mode === "ask") {
    const a = performance.now();
    await new Promise((resolve) => {
      worker.once("message", resolve);
      worker.postMessage(undefined);
    });
    askMs = Math.round(performance.now() - a);
  }
  const files = first.scan?.files.length ?? (first.graph ? Object.keys(first.graph.files).length : undefined);
  const mainHeld = heldMb();
  await worker.terminate();
  console.log(JSON.stringify({ mode, arrivedMs, askMs, files, mainHeldMb: mainHeld, processPeakMb: peak() }));
}
