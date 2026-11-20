// Reads a V8 .cpuprofile and prints where its samples fall: self time by function (with its file), and inclusive time
// for the functions named, each sample counted once however deep the function recurs.
//   node profile-top.cjs <file.cpuprofile> [--top N] [--inclusive name,name,...] [--from s] [--to s]
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const [file, ...rest] = process.argv.slice(2);
const option = (name, fallback) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : fallback);
const top = Number(option("--top", "30"));
const inclusive = option("--inclusive", "").split(",").filter(Boolean);
const profile = JSON.parse(fs.readFileSync(file, "utf8"));
const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
const parent = new Map();
for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
const label = (node) => `${node.callFrame.functionName || "(anonymous)"} ${node.callFrame.url ? path.basename(node.callFrame.url) : ""}:${node.callFrame.lineNumber + 1}`;

const from = Number(option("--from", "0")) * 1e6;
const to = Number(option("--to", "1e12")) * 1e6;
const self = new Map();
const incl = new Map(inclusive.map((name) => [name, 0]));
let total = 0;
let at = profile.startTime;
profile.samples.forEach((id, index) => {
  const delta = profile.timeDeltas[index] ?? 0;
  at += delta;
  const since = at - profile.startTime;
  if (since < from || since > to) return;
  const node = nodes.get(id);
  total += delta;
  self.set(label(node), (self.get(label(node)) ?? 0) + delta);
  const seen = new Set();
  for (let cursor = id; cursor !== undefined; cursor = parent.get(cursor)) {
    const name = nodes.get(cursor).callFrame.functionName;
    if (incl.has(name) && !seen.has(name)) {
      seen.add(name);
      incl.set(name, incl.get(name) + delta);
    }
  }
});
console.log(`samples over ${(total / 1e6).toFixed(2)} s`);
for (const [name, us] of [...self].sort((a, b) => b[1] - a[1]).slice(0, top)) console.log(`${(us / 1e6).toFixed(2).padStart(8)} s  ${name}`);
if (inclusive.length > 0) {
  console.log("inclusive:");
  for (const [name, us] of incl) console.log(`${(us / 1e6).toFixed(2).padStart(8)} s  ${name}`);
}
