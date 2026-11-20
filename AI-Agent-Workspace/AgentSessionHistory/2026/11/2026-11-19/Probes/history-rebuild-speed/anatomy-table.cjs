// One commit's anatomy from a pool-driver.cjs run of one commit: the tree, then the summarizing process's phases as
// measure-child.cjs marked them, each with its wall time, the process's processor time, the main thread's and V8's
// worker threads', and the resident memory at its end; and how much processor time other processes took meanwhile.
//   node anatomy-table.cjs <pool-driver out folder> [...]
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const PHASES = [
  ["process start to the main module", null, "main:start"],
  ["module loading", "main:start", "task:read"],
  ["authored blocks read", "task:read", "generateLiveDocs:start"],
  ["discovery (walk, ignore, scans)", "generateLiveDocs:start", "buildWorkspaceIndexes:start"],
  ["index pass", "buildWorkspaceIndexes:start", "buildWorkspaceIndexes:end"],
  ["documents and Cited By", "buildWorkspaceIndexes:end", "citingDocuments:end"],
  ["analysis pass (per file: analyse, compose, render, write)", "citingDocuments:end", "readLiveDocGraph:start"],
  ["graph read back and written", "readLiveDocGraph:start", "generateLiveDocs:end"],
  ["index read, standing files (git ls-files)", "generateLiveDocs:end", "summarizeGraph:start"],
  ["summary", "summarizeGraph:start", "summarizeGraph:end"],
  ["text store", "putTexts:start", "putTexts:end"],
  ["summary written, exit", "putTexts:end", "exit"]
];

for (const out of process.argv.slice(2)) {
  const summary = JSON.parse(fs.readFileSync(path.join(out, "summary.json"), "utf8"));
  const commit = summary.perCommit[0];
  const children = path.join(out, "children");
  const record = fs.readdirSync(children).map((name) => JSON.parse(fs.readFileSync(path.join(children, name), "utf8"))).find((entry) => entry.commit === commit.id);
  const marks = new Map(record.marks.map((mark) => [mark.label, mark]));
  const zero = { at: 0, user: 0, system: 0, rss: 0, threads: {} };
  const cpuOf = (mark, kind) => (kind ? mark.threads[kind]?.cpu ?? 0 : mark.user + mark.system);
  const own = commit.user + commit.system + (commit.gitUser ?? 0) + (commit.gitSystem ?? 0) + summary.driver.user + summary.driver.system + (summary.waited.user + summary.waited.system - commit.user - commit.system - (commit.gitUser ?? 0) - (commit.gitSystem ?? 0));
  const others = (summary.machine.user + summary.machine.system - own) / summary.wall;
  console.log(`\n${commit.id.slice(0, 8)} (position ${commit.position}), load before ${summary.loadBefore.join(" ")}, others' processor s a second ${others.toFixed(2)}`);
  console.log(`| Phase | Wall (s) | Processor s, all threads | of which the main thread | V8's worker threads | Resident MB at its end |`);
  console.log(`| --- | ---: | ---: | ---: | ---: | ---: |`);
  console.log(`| The tree, written by the pool's process | ${commit.tree.toFixed(2)} | ${commit.treeDriverCpu.toFixed(2)} (+ git) | | | |`);
  for (const [label, from, to] of PHASES) {
    const a = from === null ? zero : marks.get(from);
    const b = marks.get(to);
    if (!a || !b) continue;
    const wall = (b.at - a.at) / 1000;
    console.log(`| ${label} | ${wall.toFixed(2)} | ${(cpuOf(b) - cpuOf(a)).toFixed(2)} | ${(cpuOf(b, "main") - cpuOf(a, "main")).toFixed(2)} | ${(cpuOf(b, "node-V8Worker") - cpuOf(a, "node-V8Worker")).toFixed(2)} | ${Math.round(b.rss / 1e6) || ""} |`);
  }
  const usage = record.resourceUsage;
  console.log(`| **The summarizing process** | **${(record.exitAt / 1000).toFixed(2)}** | **${(usage.user + usage.system).toFixed(2)}** (user ${usage.user.toFixed(2)}, system ${usage.system.toFixed(2)}); git ${(record.children.user + record.children.system).toFixed(2)} | ${record.threadsAtExit.main.cpu.toFixed(2)} | ${(record.threadsAtExit["node-V8Worker"]?.cpu ?? 0).toFixed(2)} | peak ${Math.round(usage.maxRSS / 1e6)} |`);
  const grammars = Object.entries(record.grammars).map(([name, g]) => `${name.replace(/^tree-sitter-|\.wasm$/gu, "")} ${Math.round(g.wall)} ms`);
  console.log(`grammars loaded: ${grammars.join(", ") || "none"}; libuv threads ${(record.threadsAtExit["libuv-worker"]?.cpu ?? 0).toFixed(2)} s`);
  const top = Object.entries(record.functions).sort((x, y) => y[1].wall - x[1].wall).slice(0, 12).map(([name, f]) => `${name} ${f.calls}× ${(f.wall / 1000).toFixed(2)} s`);
  console.log(`inclusive: ${top.join("; ")}`);
}
