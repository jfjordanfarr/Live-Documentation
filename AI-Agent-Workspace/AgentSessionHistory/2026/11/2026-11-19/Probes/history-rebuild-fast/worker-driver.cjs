// Regenerates a fixed list of commits with the history's own pool of workers (`regenerate` of the built generator)
// into a scratch cache, and measures it: the wall clock, each change's time and whether its tree was brought forward,
// every worker's resident memory sampled from /proc twice a second, and the machine's processor counters around it.
//
//   node worker-driver.cjs --commits <file of ids> --jobs <n> --cache <folder> --out <folder> [--lens-key <key>]
//
// Run from the checkout whose build it uses, with a private, short TMPDIR, where the workers keep their trees. It
// changes nothing of a summary: the task, the trees and the workers are the history command's own. `--lens-key` writes
// another key into each summary than this checkout's (the oracle's, so that its summaries can be held to the oracle's
// byte for byte); the key is a label a summary carries, and nothing it says is made from it.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { performance } = require("node:perf_hooks");

const root = process.cwd();
const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const at = argv.indexOf(name);
  return at < 0 ? fallback : argv[at + 1];
};
const commitsFile = option("--commits");
const jobs = Number(option("--jobs", "1"));
const cacheFolder = path.resolve(option("--cache"));
const out = path.resolve(option("--out"));
const lensKey = option("--lens-key");
const TICK = 100;

const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const { lensOf } = require(path.join(root, "packages/engine/dist/live-docs/history/lens.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { generatorIdentity } = require(path.join(root, "packages/generator/dist/history/generatorIdentity.js"));

// Every worker the pool starts, by pid, with its resident memory sampled while it lives.
const workers = new Map();
const realFork = childProcess.fork;
childProcess.fork = function (...args) {
  const child = realFork.apply(this, args);
  workers.set(child.pid, { started: performance.now(), samples: [] });
  child.once("exit", () => {
    workers.get(child.pid).ended = performance.now();
  });
  return child;
};
const { regenerate, Scratch } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));

const rssOf = (pid) => {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
    return Number(/^VmRSS:\s+(\d+) kB/mu.exec(status)[1]) * 1024;
  } catch {
    return undefined;
  }
};
// A process's own processor time and that of the children it waited for (git), in ticks.
const cpuOf = (pid) => {
  try {
    const fields = fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1].split(" ");
    return { own: Number(fields[11]) + Number(fields[12]), children: Number(fields[13]) + Number(fields[14]) };
  } catch {
    return undefined;
  }
};
const procStat = () => {
  const cpu = fs.readFileSync("/proc/stat", "utf8").split("\n")[0].trim().split(/\s+/u).slice(1).map(Number);
  return { busy: cpu[0] + cpu[1] + cpu[2] + cpu[5] + cpu[6], idle: cpu[3] + cpu[4] };
};
const loadavg = () => fs.readFileSync("/proc/loadavg", "utf8").split(" ").slice(0, 3).map(Number);

async function main() {
  const ids = fs.readFileSync(commitsFile, "utf8").split("\n").map((line) => line.trim()).filter((line) => line !== "" && !line.startsWith("#"));
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(cacheFolder, { recursive: true });
  const versionControl = await openGitRepository(root);
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const computed = lensOf(await generatorIdentity(), configuration);
  const lens = lensKey === undefined ? computed : { ...computed, key: lensKey };
  const mainline = await versionControl.mainline();
  const byId = new Map(mainline.map((change, index) => [change.id, { change, index }]));
  const changes = ids.map((id) => {
    const found = byId.get(id);
    if (!found) throw new Error(`${id} is not on the mainline`);
    return found.change;
  });
  const lines = [];
  let began = performance.now();
  const progress = (line) => {
    lines.push([+((performance.now() - began) / 1000).toFixed(2), line]);
    if (!/^ {2}/u.test(line)) process.stderr.write(`${line}\n`);
  };
  const sampler = setInterval(() => {
    for (const [pid, worker] of workers) {
      if (worker.ended !== undefined) continue;
      const rss = rssOf(pid);
      const cpu = cpuOf(pid);
      if (rss !== undefined) worker.samples.push([+((performance.now() - began) / 1000).toFixed(1), rss]);
      if (cpu !== undefined) worker.cpu = cpu;
    }
  }, 500);
  const before = { stat: procStat(), load: loadavg() };
  began = performance.now();
  const scratch = new Scratch();
  const result = await scratch.during(() => regenerate(changes, { store: versionControl.store, configuration, lens, cacheFolder, keepIndex: false, jobs, scratch, progress }));
  const wall = (performance.now() - began) / 1000;
  clearInterval(sampler);
  const after = { stat: procStat(), load: loadavg() };
  // A change's own line, not the warnings' summary lines, which also say "changes regenerated: ".
  const done = lines.filter(([, line]) => /^\d+\/\d+ regenerated: /u.test(line));
  const anew = done.filter(([, line]) => line.includes("its tree written anew")).length;
  const perWorker = [...workers.values()].map((worker) => ({
    samples: worker.samples.length,
    peakMB: Math.round(Math.max(0, ...worker.samples.map(([, rss]) => rss)) / 1e6),
    lastMB: Math.round((worker.samples.at(-1)?.[1] ?? 0) / 1e6),
    // As last sampled, up to half a second before the worker ended: a slight undercount.
    cpuSeconds: worker.cpu === undefined ? 0 : (worker.cpu.own + worker.cpu.children) / TICK
  }));
  const own = process.cpuUsage();
  const summary = {
    jobs,
    commits: ids.length,
    lens: lens.key,
    computedLens: computed.key,
    tmpdir: process.env.TMPDIR,
    wall: +wall.toFixed(1),
    wallPerCommit: +(wall / ids.length).toFixed(2),
    meanPerCommit: +(result.timings.reduce((sum, time) => sum + time, 0) / result.timings.length / 1000).toFixed(2),
    writtenAnew: anew,
    broughtForward: done.length - anew,
    workers: workers.size,
    reportedPeakMB: Math.round(result.peakMemory / 1e6),
    workerPeakMB: Math.max(...perWorker.map((worker) => worker.peakMB)),
    workerCpuPerCommit: +(perWorker.reduce((sum, worker) => sum + worker.cpuSeconds, 0) / ids.length).toFixed(2),
    poolCpuPerCommit: +((own.user + own.system) / 1e6 / ids.length).toFixed(2),
    machineBusy: +((after.stat.busy - before.stat.busy) / (after.stat.busy - before.stat.busy + (after.stat.idle - before.stat.idle))).toFixed(2),
    machineBusySeconds: +((after.stat.busy - before.stat.busy) / TICK).toFixed(1),
    loadBefore: before.load,
    loadAfter: after.load
  };
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify({ ...summary, perWorker, workerSamples: [...workers.values()].map((worker) => worker.samples), lines }, null, 1));
  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
