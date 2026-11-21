// Research of November 21, 2026 (not product code). Writing in Node from facts handed over file by file, both ways:
// "stream" (each file to the design's writer as it comes) and "gather" (every file held, then written). One fresh
// process each; the stored output of each is held to the facts by bench-node's verify where facts are given.
//
//   node run-stream.mjs <ndjson folder> <work folder> <results.json> <corpus> [<facts.json to verify against>]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [ndjsonDir, workDir, resultsPath, corpus, factsPath] = process.argv.slice(2);
const run = (...args) => JSON.parse(execFileSync(process.execPath, ["--max-old-space-size=6000", path.join(here, "bench-node.mjs"), ...args], { encoding: "utf8", maxBuffer: 1 << 26 }).trim().split("\n").pop());
const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, "utf8")) : {};
fs.mkdirSync(workDir, { recursive: true });
const input = path.join(ndjsonDir, `${corpus}.ndjson`);
const plan = [
  ["d0-json", "gather"],
  ["d1-press", "gather"],
  ["d1s-press-stream", "stream"],
  ["d2-sqlite-node", "gather"],
  ["d2-sqlite-node", "stream"],
  ["d3-ledger", "gather"],
  ["d3-ledger", "stream"],
  ["d4-parts", "gather"],
  ["d4-parts", "stream"]
];
for (const [design, mode] of plan) {
  const stored = path.join(workDir, `${corpus}.${design}.${mode}.bin`);
  const r = run(mode, design, input, stored);
  if (factsPath) r.identical = run("verify", design === "d2-sqlite-node" && mode === "stream" ? "d2-sqlite-disk" : design, stored, factsPath).identical;
  results[`${corpus}/${design}/${mode}`] = r;
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(corpus, design, mode, r.bytes, r.writeMs, r.peakMb, r.identical);
}
