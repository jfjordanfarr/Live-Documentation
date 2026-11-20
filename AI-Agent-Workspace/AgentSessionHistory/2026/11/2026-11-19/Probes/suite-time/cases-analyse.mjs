#!/usr/bin/env node
// Tables from the per-case lines `duration-reporter.cjs` wrote: time by spec file, by the map a case first opens, the
// slowest cases with what their steps spent the time on, and every case that did not pass.
//
//   node <this file> <cases.jsonl> [--slowest 40] [--tsv out.tsv]
import fs from "node:fs";

const [input] = process.argv.slice(2);
const arg = (name, fallback) => { const at = process.argv.indexOf(`--${name}`); return at >= 0 ? process.argv[at + 1] : fallback; };
const slowest = Number(arg("slowest", "40"));
const rows = fs.readFileSync(input, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));

/** The map a case opens first, by its first address. */
export const mapOf = first => {
  if (!first) return "none (no navigation)";
  const p = first.replace(/^https?:\/\/[^/]+/, "");
  if (p.startsWith("about:")) return "about:blank / set content";
  const m = p.match(/^\/samples\/([^/?]+)(?:\/([^/?]+))?/);
  if (!m) return "this repository";
  if (m[1] === "rosetta") return "Rosetta";
  if (m[1].startsWith("history")) return "history samples";
  return m[1];
};

const s = ms => (ms / 1000).toFixed(1);
const total = rows.reduce((a, r) => a + r.ms, 0);
const group = (key) => {
  const g = new Map();
  for (const r of rows) {
    const k = key(r);
    const e = g.get(k) ?? { cases: 0, ms: 0, failed: 0 };
    e.cases += 1; e.ms += r.ms; if (r.status !== "passed" && r.status !== "skipped") e.failed += 1;
    g.set(k, e);
  }
  return [...g].sort((a, b) => b[1].ms - a[1].ms);
};
const wall = passName => {
  const of = rows.filter(r => r.pass === passName);
  if (!of.length) return 0;
  const start = Math.min(...of.map(r => Date.parse(r.start)));
  const end = Math.max(...of.map(r => Date.parse(r.start) + r.ms));
  return end - start;
};

console.log(`cases ${rows.length}; case time ${s(total)} s (${(total / 60000).toFixed(1)} min); first pass wall ${(wall("shared") / 60000).toFixed(1)} min over ${rows.filter(r => r.pass === "shared").length} cases; second pass wall ${(wall("alone") / 60000).toFixed(1)} min over ${rows.filter(r => r.pass === "alone").length}`);
const statuses = {};
for (const r of rows) statuses[r.status] = (statuses[r.status] ?? 0) + 1;
console.log("statuses", JSON.stringify(statuses));

const kinds = {};
for (const r of rows) for (const [k, v] of Object.entries(r.times)) kinds[k] = (kinds[k] ?? 0) + v;
console.log("\ncase time by what the steps did (s, share):");
for (const [k, v] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${s(v).padStart(8)}  ${(100 * v / total).toFixed(1)}%`);
console.log(`  pauses written as waitForTimeout: ${rows.reduce((a, r) => a + r.pauses, 0)} calls`);

console.log("\n| Spec file | Cases | Case time (s) | Share | Mean (s) | Failed |\n| --- | ---: | ---: | ---: | ---: | ---: |");
for (const [k, e] of group(r => r.file)) console.log(`| ${k} | ${e.cases} | ${s(e.ms)} | ${(100 * e.ms / total).toFixed(1)}% | ${s(e.ms / e.cases)} | ${e.failed} |`);

console.log("\n| Map first opened | Cases | Case time (s) | Share | Mean (s) |\n| --- | ---: | ---: | ---: | ---: |");
for (const [k, e] of group(r => mapOf(r.first))) console.log(`| ${k} | ${e.cases} | ${s(e.ms)} | ${(100 * e.ms / total).toFixed(1)}% | ${s(e.ms / e.cases)} |`);

const top = k => (r) => Object.entries(r.times).sort((a, b) => b[1] - a[1]).slice(0, k).map(([n, v]) => `${n} ${s(v)}`).join(", ");
console.log(`\n| # | Case | s | Pass | Map | Where the time went |\n| ---: | --- | ---: | --- | --- | --- |`);
[...rows].sort((a, b) => b.ms - a.ms).slice(0, slowest).forEach((r, i) => console.log(`| ${i + 1} | ${r.file}:${r.line} ${r.title.slice(0, 70).replace(/\|/g, "/")} | ${s(r.ms)} | ${r.pass} | ${mapOf(r.first)} | ${top(4)(r)}; ${r.navigations} loads, ${r.pauses} pauses |`));

console.log("\nnot passed:");
for (const r of rows.filter(r => r.status !== "passed" && r.status !== "skipped")) console.log(`  ${r.file}:${r.line} [${r.pass}] ${r.status} ${s(r.ms)} s: ${r.title.slice(0, 90)} :: ${r.error ?? ""}`);

const out = arg("tsv");
if (out) {
  const header = ["file", "line", "pass", "worker", "start", "ms", "status", "map", "navigations", "pauses", "hooks", "navigate", "waitForFunction", "evaluate", "expect", "pause", "gesture", "screenshot", "query", "waitForOther", "other", "title"];
  const lines = [header.join("\t"), ...rows.map(r => [r.file, r.line, r.pass, r.worker, r.start, r.ms, r.status, mapOf(r.first), r.navigations, r.pauses,
    ...["hooks", "navigate", "waitForFunction", "evaluate", "expect", "pause", "gesture", "screenshot", "query", "waitForOther", "other"].map(k => r.times[k] ?? 0), r.title.replace(/\t/g, " ")].join("\t"))];
  fs.writeFileSync(out, lines.join("\n") + "\n");
}
