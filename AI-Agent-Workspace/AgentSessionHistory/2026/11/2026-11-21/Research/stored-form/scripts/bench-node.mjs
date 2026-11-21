// Research of November 21, 2026 (not product code). One measurement of one design in Node, in a fresh process, so
// that its peak memory is its own. Prints one line of JSON.
//
//   node bench-node.mjs write <design> <graph.json> <out file>
//       encode the facts; time, peak memory, bytes, gzipped bytes, base64 bytes, and the SHA-256 of the output
//   node bench-node.mjs read <design> <stored file> <shape.json>
//       cold: read the stored bytes, open, and answer the real questions, each timed; then the whole graph
//   node bench-node.mjs verify <design> <stored file> <graph.json>
//       decode the whole and hold it, field by field, to the facts it was written from
//
// <design> is a module under ./designs, without its extension.
import fs from "node:fs";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { canonical, docPathOf } from "./designs/common.mjs";

const [mode, designName, a, b] = process.argv.slice(2);
const design = await import(`./designs/${designName}.mjs`);
const ms = (t0) => +(Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1);
const peakMb = () => Math.round(process.resourceUsage().maxRSS / 1024);
const out = { mode, design: design.name, node: process.version };

if (mode === "stream" || mode === "gather") {
  // The facts handed over file by file from a file of one line per file (scale.mjs --ndjson): "stream" gives each to
  // the design's writer as it comes and holds nothing else; "gather" builds the whole graph first and then encodes it,
  // as a design that needs every fact before its first byte must.
  const { createInterface } = await import("node:readline");
  const lines = createInterface({ input: fs.createReadStream(a), crlfDelay: Infinity });
  const t0 = process.hrtime.bigint();
  let location;
  let w;
  const graph = { files: {} };
  let n = 0;
  for await (const line of lines) {
    if (!line) continue;
    if (!location) {
      const head = JSON.parse(line);
      location = { root: head.root, baseLayer: head.baseLayer, extension: head.extension };
      Object.assign(graph, location);
      if (mode === "stream") w = design.writer(location, b);
      continue;
    }
    const [path, record, outbound] = JSON.parse(line);
    n += 1;
    if (mode === "stream") await w.add(path, record, outbound);
    else graph.files[path] = { codePath: path, docPath: docPathOf(location, path), ...record, outbound, inbound: [] };
  }
  if (mode === "gather") for (const [p, f] of Object.entries(graph.files)) for (const q of f.outbound) graph.files[q].inbound.push(p);
  const bytes = mode === "stream" ? await w.finish() : await design.encode(graph);
  out.files = n;
  out.writeMs = ms(t0);
  out.peakMb = peakMb();
  if (bytes) {
    fs.writeFileSync(b, bytes);
    out.bytes = bytes.length;
    out.sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  } else {
    out.bytes = fs.statSync(b).size;
    out.sha256 = crypto.createHash("sha256").update(fs.readFileSync(b)).digest("hex");
  }
} else if (mode === "write") {
  const graph = JSON.parse(fs.readFileSync(a, "utf8"));
  const baseMb = peakMb();
  const t0 = process.hrtime.bigint();
  const bytes = await design.encode(graph);
  out.encodeMs = ms(t0);
  out.peakMbBeforeEncode = baseMb;
  out.peakMb = peakMb();
  fs.writeFileSync(b, bytes);
  out.bytes = bytes.length;
  out.gzipBytes = zlib.gzipSync(bytes, { level: 9 }).length;
  out.base64OfGzipBytes = Math.ceil(out.gzipBytes / 3) * 4;
  out.base64Bytes = Math.ceil(bytes.length / 3) * 4;
  out.sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
} else if (mode === "read") {
  const shape = JSON.parse(fs.readFileSync(b, "utf8"));
  const { hub, reachableFrom, typical } = shape.questions.subjects;
  const t0 = process.hrtime.bigint();
  const bytes = design.readsInPlace ? new Uint8Array(0) : new Uint8Array(fs.readFileSync(a));
  out.readFileMs = ms(t0);
  let t = process.hrtime.bigint();
  const reader = await design.open(bytes, a);
  out.openMs = ms(t);
  t = process.hrtime.bigint();
  out.inboundOfHub = (await reader.inbound(hub)).length;
  out.inboundMs = ms(t);
  t = process.hrtime.bigint();
  out.reachable = (await reader.reachable(reachableFrom)).length;
  out.reachableMs = ms(t);
  t = process.hrtime.bigint();
  const near = [...new Set([typical, ...(await reader.inbound(typical)), ...(await reader.outbound(typical))])];
  out.typicalNeighbourhood = (await reader.records(near)).length;
  out.typicalNeighbourhoodMs = ms(t);
  t = process.hrtime.bigint();
  const hubNear = [...new Set([hub, ...(await reader.inbound(hub)), ...(await reader.outbound(hub))])];
  out.hubNeighbourhood = (await reader.records(hubNear)).length;
  out.hubNeighbourhoodMs = ms(t);
  out.firstAnswerMs = ms(t0) - out.typicalNeighbourhoodMs - out.hubNeighbourhoodMs - out.reachableMs; // read + open + one inbound question
  out.peakMbAfterQuestions = peakMb();
  t = process.hrtime.bigint();
  const graph = await reader.all();
  out.allMs = ms(t);
  out.files = Object.keys(graph.files).length;
  out.peakMb = peakMb();
} else if (mode === "verify") {
  const facts = JSON.parse(fs.readFileSync(b, "utf8"));
  const reader = await design.open(new Uint8Array(fs.readFileSync(a)), a);
  const graph = await reader.all();
  const expected = canonical(facts);
  const actual = canonical(graph);
  out.identical = expected === actual;
  if (!out.identical) {
    let i = 0;
    while (i < expected.length && expected[i] === actual[i]) i += 1;
    out.firstDifference = { at: i, expected: expected.slice(Math.max(0, i - 120), i + 120), actual: actual.slice(Math.max(0, i - 120), i + 120) };
  }
}
console.log(JSON.stringify(out));
