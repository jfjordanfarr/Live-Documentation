// Research of November 21, 2026 (not product code). Prints the README's tables from the raw results beside it, so
// that every number in them can be had again: `node tables.mjs <results folder>`.
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const read = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) : {});
const lines = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l)) : []);
const mb = (b) => (b === undefined ? "" : `${(b / 1e6).toFixed(2)} MB`);
const s = (ms) => (ms === undefined ? "" : ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`);
const row = (cells) => `| ${cells.join(" | ")} |`;

const node = { ...read("node.json"), ...read("node-hdf5.json") };
console.log("\n## Node, cold reads (median of three) and writes\n");
console.log(row(["Corpus / design", "On disk", "Gzipped", "Write", "Write peak", "Same bytes twice", "Read back identical", "First answer", "Reachable", "Hub's Local Map", "Whole graph", "Read peak"]));
console.log(row(Array(12).fill("---")));
for (const [k, v] of Object.entries(node)) {
  const w = v.write;
  const r = v.read;
  console.log(row([k, mb(w.bytes), mb(w.gzipBytes), s(w.encodeMs), `${w.peakMb} MB`, v.sameBytesTwice ? "yes" : "**no**", v.identical ? "yes" : "**no**", s(r.firstAnswerMs), s(r.reachableMs), s(r.hubNeighbourhoodMs), s(r.allMs), `${r.peakMb} MB`]));
}

const stream = read("stream-node.json");
console.log("\n## Node, writing from facts handed over one file at a time\n");
console.log(row(["Corpus / design / way", "Bytes", "Write", "Peak memory", "Read back identical"]));
console.log(row(Array(5).fill("---")));
for (const [k, v] of Object.entries(stream)) console.log(row([k, mb(v.bytes), s(v.writeMs), `${v.peakMb} MB`, v.identical === undefined ? "" : v.identical ? "yes" : "no"]));

for (const f of fs.readdirSync(dir).filter((x) => x.startsWith("tab-") && x.endsWith(".jsonl")).sort()) {
  const rows = lines(f);
  if (!rows.length) continue;
  console.log(`\n## ${f}\n`);
  if (rows[0].kind === "read") {
    console.log(row(["Page", "Page ready", "Out of base64", "Open", "First answer", "Reachable", "Hub's Local Map", "Whole graph", "Tab's peak"]));
    console.log(row(Array(9).fill("---")));
    for (const r of rows) console.log(row([r.page, s(r.pageReadyMs), s(r.base64Ms), s(r.openMs), s(r.firstAnswerMs), s(r.reachableMs), s(r.hubNeighbourhoodMs), s(r.allMs), r.failed ? `failed: ${r.failed.slice(0, 80)}` : `${r.rendererPeakMb} MB`]));
  } else {
    console.log(row(["Page", "Way", "Write", "Bytes", "SHA-256 (first 12)", "Tab's peak at the write's end", "Facts' hash (first 12)"]));
    console.log(row(Array(7).fill("---")));
    for (const r of rows) console.log(row([r.page, r.mode, r.failed ? `failed: ${r.failed.slice(0, 80)}` : s(r.writeMs), mb(r.bytes), (r.sha256 ?? "").slice(0, 12), r.rendererPeakMbAtWrite === undefined ? "" : `${r.rendererPeakMbAtWrite} MB`, (r.contentHash ?? "").slice(0, 12)]));
  }
}
