#!/usr/bin/env node
// Holds one browser stage's cases against another's, case by case: the cases whose outcome changed, each pass's wall
// time and the stage's case time, and the cases whose time moved by more than a quarter and more than two seconds.
// A case is known by its file, line and title together, since one line can hold several cases.
//
//   node <this file> <before: cases.tsv from cases-analyse.mjs> <after: cases.jsonl from duration-reporter.cjs>
import fs from "node:fs";

const [beforePath, afterPath] = process.argv.slice(2);

const fromTsv = text => {
  const [head, ...lines] = text.split("\n").filter(Boolean);
  const names = head.split("\t");
  return lines.map(line => Object.fromEntries(line.split("\t").map((v, i) => [names[i], v])))
    .map(r => ({ ...r, line: Number(r.line), ms: Number(r.ms) }));
};
const fromJsonl = text => text.split("\n").filter(Boolean).map(line => JSON.parse(line));
const read = p => (p.endsWith(".tsv") ? fromTsv : fromJsonl)(fs.readFileSync(p, "utf8"));

const before = read(beforePath);
const after = read(afterPath);
const key = r => `${r.file}:${r.line} ${r.title}`;
const index = rows => {
  const m = new Map();
  for (const r of rows) {
    const k = key(r);
    if (m.has(k)) throw new Error(`two cases share one key: ${k}`);
    m.set(k, r);
  }
  return m;
};
const b = index(before);
const a = index(after);
const s = ms => (ms / 1000).toFixed(1);
const where = r => `${r.file}:${r.line}`;

const counts = rows => rows.reduce((c, r) => ({ ...c, [r.status]: (c[r.status] ?? 0) + 1 }), {});
const wall = (rows, pass) => {
  const of = rows.filter(r => r.pass === pass);
  if (!of.length) return 0;
  return Math.max(...of.map(r => Date.parse(r.start) + r.ms)) - Math.min(...of.map(r => Date.parse(r.start)));
};
const total = rows => rows.reduce((t, r) => t + r.ms, 0);

console.log("## Outcomes\n");
console.log("| | Cases | Passed | Failed | Skipped | Other |\n| --- | ---: | ---: | ---: | ---: | ---: |");
for (const [name, rows] of [["Before", before], ["After", after]]) {
  const c = counts(rows);
  const other = rows.length - (c.passed ?? 0) - (c.failed ?? 0) - (c.skipped ?? 0);
  console.log(`| ${name} | ${rows.length} | ${c.passed ?? 0} | ${c.failed ?? 0} | ${c.skipped ?? 0} | ${other} |`);
}
console.log("\n## Time\n");
console.log("| | First pass (wall, min) | Second pass (wall, min) | Case time (min) |\n| --- | ---: | ---: | ---: |");
for (const [name, rows] of [["Before", before], ["After", after]]) {
  console.log(`| ${name} | ${(wall(rows, "shared") / 60000).toFixed(1)} | ${(wall(rows, "alone") / 60000).toFixed(1)} | ${(total(rows) / 60000).toFixed(1)} |`);
}

const ok = st => st === "passed" || st === "skipped";
console.log("\n## Cases whose outcome changed\n");
const changed = [];
for (const [k, r] of a) {
  const o = b.get(k);
  if (!o) changed.push(`- new case, ${r.status}: ${where(r)} ${r.title}`);
  else if (o.status !== r.status) changed.push(`- ${o.status} → **${r.status}** (${s(o.ms)} s → ${s(r.ms)} s): \`${where(r)}\` ${r.title}${r.error ? `\n  - ${r.error}` : ""}`);
}
for (const [k, o] of b) if (!a.has(k)) changed.push(`- missing after (was ${o.status}): ${where(o)} ${o.title}`);
console.log(changed.length ? changed.join("\n") : "None.");
console.log("\n## Failed in both\n");
const both = [...a].filter(([k, r]) => !ok(r.status) && b.has(k) && !ok(b.get(k).status)).map(([, r]) => `- \`${where(r)}\` ${r.title} (${s(b.get(key(r)).ms)} s → ${s(r.ms)} s)`);
console.log(both.length ? both.join("\n") : "None.");

console.log("\n## Cases whose time moved by more than a quarter and more than two seconds (both runs passed)\n");
const moved = [];
for (const [k, r] of a) {
  const o = b.get(k);
  if (!o || o.status !== "passed" || r.status !== "passed") continue;
  const d = r.ms - o.ms;
  if (Math.abs(d) > 2000 && Math.abs(d) > o.ms / 4) moved.push({ r, o, d });
}
moved.sort((x, y) => y.d - x.d);
console.log("| Case | Before, s | After, s | Change |\n| --- | ---: | ---: | ---: |");
for (const { r, o, d } of moved) console.log(`| \`${where(r)}\` ${r.title.slice(0, 90)} | ${s(o.ms)} | ${s(r.ms)} | ${d > 0 ? "+" : ""}${s(d)} s (${d > 0 ? "+" : ""}${Math.round((100 * d) / o.ms)}%) |`);
const passedBoth = [...a].filter(([k, r]) => r.status === "passed" && b.get(k)?.status === "passed");
const tb = passedBoth.reduce((t, [k]) => t + b.get(k).ms, 0);
const ta = passedBoth.reduce((t, [, r]) => t + r.ms, 0);
console.log(`\nOver the ${passedBoth.length} cases that passed in both: ${s(tb)} s before, ${s(ta)} s after (${ta > tb ? "+" : ""}${((100 * (ta - tb)) / tb).toFixed(1)}%).`);
