// Each worker's resident memory over a run of worker-driver.cjs: its peak within each fifth of its life, in MB, and
// how many tasks it had done by then (from the run's progress lines, shared out by time).
//   node memory-table.cjs <out folder of worker-driver.cjs>
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const run = JSON.parse(fs.readFileSync(path.join(process.argv[2], "summary.json"), "utf8"));
for (const [index, samples] of run.workerSamples.entries()) {
  if (samples.length === 0) continue;
  const start = samples[0][0];
  const end = samples.at(-1)[0];
  const fifths = [];
  for (let part = 0; part < 5; part += 1) {
    const from = start + ((end - start) * part) / 5;
    const to = start + ((end - start) * (part + 1)) / 5;
    const inPart = samples.filter(([time]) => time >= from && time <= to).map(([, rss]) => rss);
    fifths.push(Math.round(Math.max(0, ...inPart) / 1e6));
  }
  console.log(`worker ${index + 1}: ${samples.length} samples over ${(end - start).toFixed(0)} s; peak MB by fifth of its life: ${fifths.join(", ")}; last ${Math.round(samples.at(-1)[1] / 1e6)} MB`);
}
console.log(`commits ${run.commits}, workers ${run.workers}, tasks a worker about ${(run.commits / run.workers).toFixed(1)}`);
