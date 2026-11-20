// Prints the runs of sweep.jsonl (written by sweep.sh) as a Markdown table, per commit of the sample, joining the two
// halves of a one-at-a-time run (labels ending in "a" and "b") into one row.
//   node sweep-table.cjs <sweep.jsonl> [label-prefix ...]
"use strict";
const fs = require("node:fs");

const [file, ...wanted] = process.argv.slice(2);
const runs = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line)).filter((run) => run.result);
const rows = new Map();
for (const run of runs) {
  if (wanted.length > 0 && !wanted.some((prefix) => run.label.startsWith(prefix))) continue;
  const key = run.label.replace(/[ab]$/u, "");
  const r = run.result;
  const n = r.commits;
  const add = { label: key, jobs: r.jobs, commits: n, wall: r.wall, load: run.loadAtStart, oracle: run.oracle.replace(/^.*: /u, ""),
    processWall: r.processWall * n, treeWall: r.treeWall * n, commitWall: r.commitWall * n, user: r.user * n, system: r.system * n, git: r.gitInChild * n + r.driverGit * n,
    driver: r.driverCpu * n, mainRun: r.mainRun * n, mainWait: r.mainWait * n, otherRun: r.otherRun * n, otherWait: r.otherWait * n, peak: r.peakMB,
    driverMain: r.driverMain.user + r.driverMain.system, idle: r.machine.idle, busy: r.machine.user + r.machine.system + r.machine.irq, machineCpu: r.machine.user + r.machine.system, flags: `${r.flags} ${r.env}`.trim(), pin: run.pin };
  const prior = rows.get(key);
  if (!prior) rows.set(key, add);
  else {
    for (const field of ["machineCpu", "commits", "wall", "processWall", "treeWall", "commitWall", "user", "system", "git", "driver", "mainRun", "mainWait", "otherRun", "otherWait", "driverMain", "idle", "busy"]) prior[field] += add[field];
    prior.peak = Math.max(prior.peak, add.peak);
    prior.load += ` / ${add.load}`;
    prior.oracle += ` / ${add.oracle}`;
  }
}
const f = (value, digits = 1) => value.toFixed(digits);
console.log("| Run | Jobs | Load at start | Wall (s) | Wall a commit (s) | A commit's own wall: tree + process (s) | Processor s a commit: user / system / git / parent | Main thread a process: on a CPU / waiting (s) | Other threads: on a CPU / waiting (s) | Parent's main thread busy | Machine busy | Others' processor s a second | Peak MB | Oracle |");
console.log("| --- | ---: | --- | ---: | ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |");
for (const r of rows.values()) {
  const n = r.commits;
  console.log(
    `| ${r.label}${r.flags ? ` (${r.flags})` : ""}${r.pin ? ` [${r.pin}]` : ""} | ${r.jobs} | ${r.load} | ${f(r.wall)} | ${f(r.wall / n, 2)} | ${f(r.treeWall / n)} + ${f(r.processWall / n)} | ${f(r.user / n)} / ${f(r.system / n)} / ${f(r.git / n)} / ${f(r.driver / n)} | ${f(r.mainRun / n)} / ${f(r.mainWait / n)} | ${f(r.otherRun / n)} / ${f(r.otherWait / n)} | ${Math.round((100 * r.driverMain) / r.wall)}% | ${Math.round((100 * r.busy) / (r.busy + r.idle))}% | ${f(Math.max(0, r.machineCpu - (r.user + r.system + r.git + r.driver)) / r.wall, 2)} | ${r.peak} | ${r.oracle} |`
  );
}
