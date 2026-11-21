// Research of November 21, 2026 (not product code). Every Node measurement, one fresh process each, into one file.
//
//   node run-node.mjs <facts folder> <work folder> <results.json> [design ...]
//
// <facts folder> holds <corpus>.json (facts.cjs) and <corpus>.shape.json (shape.mjs) for each corpus. Each design is
// written twice (the two outputs' hashes say whether the same facts gave the same bytes), verified against the facts
// it was written from, then read cold three times; the read with the median first answer is kept, with the spread.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [factsDir, workDir, resultsPath, ...only] = process.argv.slice(2);
const designs = only.length ? only : ["d0-json", "d1-press", "d2-sqlite-node", "d2-sqlite-disk", "d3-ledger", "d4-parts"];
const corpora = fs.readdirSync(factsDir).filter((f) => f.endsWith(".shape.json")).map((f) => f.replace(".shape.json", ""));
const run = (...args) => JSON.parse(execFileSync(process.execPath, ["--max-old-space-size=4000", path.join(here, "bench-node.mjs"), ...args], { encoding: "utf8" }).trim().split("\n").pop());
const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, "utf8")) : {};
fs.mkdirSync(workDir, { recursive: true });
for (const corpus of corpora) {
  const facts = path.join(factsDir, `${corpus}.json`);
  const shape = path.join(factsDir, `${corpus}.shape.json`);
  for (const design of designs) {
    const stored = path.join(workDir, `${corpus}.${design}.bin`);
    const write = run("write", design, facts, stored);
    const again = run("write", design, facts, `${stored}.again`);
    fs.rmSync(`${stored}.again`);
    const verify = run("verify", design, stored, facts);
    const reads = [0, 1, 2].map(() => run("read", design, stored, shape)).sort((a, b) => a.firstAnswerMs - b.firstAnswerMs);
    results[`${corpus}/${design}`] = { corpus, write, sameBytesTwice: write.sha256 === again.sha256, identical: verify.identical, read: reads[1], firstAnswerMsRange: [reads[0].firstAnswerMs, reads[2].firstAnswerMs] };
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(corpus, design, write.bytes, write.encodeMs, reads[1].firstAnswerMs, verify.identical);
  }
}
