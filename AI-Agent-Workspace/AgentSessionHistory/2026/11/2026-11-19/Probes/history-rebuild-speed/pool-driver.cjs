// Regenerates a fixed list of commits with the history's own pool (`regenerate` of the built generator), into a
// scratch cache, and measures it: wall clock, every summarizing process from the inside (measure-child.cjs), the trees'
// writing, the processor time of everything it waited for, and the machine's processor and disk counters around it.
//
//   node pool-driver.cjs --commits <file of ids> --jobs <n> --cache <folder> --out <folder>
//        [--mode dist|tsx] [--flags "<node flags for the summarizing processes>"] [--env "K=V K=V"]
//
// Run from the checkout whose build it uses, with a private, short TMPDIR, where the trees are written. Nothing it
// does changes a summary: the summarizing process is the built one (or, with --mode tsx, the TypeScript one under tsx's
// loader, as `npm run live-docs:history` starts it), given the same task and environment as the history command gives.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { performance } = require("node:perf_hooks");
const { pathToFileURL } = require("node:url");

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
const mode = option("--mode", "dist");
const flags = option("--flags", "").split(/\s+/u).filter(Boolean);
const extraEnv = Object.fromEntries(option("--env", "").split(/\s+/u).filter(Boolean).map((pair) => [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)]));
const MEASURE = path.join(__dirname, "measure-child.cjs");
const TICK = 100;

const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const { lensOf } = require(path.join(root, "packages/engine/dist/live-docs/history/lens.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { generatorIdentity } = require(path.join(root, "packages/generator/dist/history/generatorIdentity.js"));

const realFork = childProcess.fork;
childProcess.fork = function (modulePath, args, options) {
  let module = modulePath;
  let execArgv = [...(options.execArgv ?? [])];
  const env = { ...options.env, RS_OUT: path.join(out, "children"), ...extraEnv };
  if (mode === "tsx") {
    module = modulePath.replace(/\/dist\/history\/summarizeChange\.js$/u, "/src/history/summarizeChange.ts");
    execArgv = ["--import", pathToFileURL(require.resolve("tsx", { paths: [root] })).href, ...execArgv];
    env.TSX_TSCONFIG_PATH = path.join(root, "tsconfig.base.json");
  }
  return realFork.call(this, module, args, { ...options, execArgv: [...flags, "--require", MEASURE, ...execArgv], env });
};
const { regenerate, Scratch } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));

function procStat() {
  const text = fs.readFileSync("/proc/stat", "utf8");
  const cpu = text.split("\n")[0].trim().split(/\s+/u).slice(1).map(Number);
  const ctxt = Number(/^ctxt (\d+)/mu.exec(text)[1]);
  return { user: cpu[0] + cpu[1], system: cpu[2], idle: cpu[3], iowait: cpu[4], irq: cpu[5] + cpu[6], steal: cpu[7], ctxt };
}
function diskStats() {
  const disks = {};
  for (const line of fs.readFileSync("/proc/diskstats", "utf8").split("\n")) {
    const f = line.trim().split(/\s+/u);
    if (f.length < 14 || !/^sd[a-z]$/u.test(f[2])) continue;
    disks[f[2]] = { readSectors: Number(f[5]), writeSectors: Number(f[9]), ioMs: Number(f[12]) };
  }
  return disks;
}
function selfStat() {
  const stat = fs.readFileSync("/proc/self/stat", "utf8");
  const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
  return { user: Number(f[11]) / TICK, system: Number(f[12]) / TICK, childUser: Number(f[13]) / TICK, childSystem: Number(f[14]) / TICK };
}
// The driver's own threads: processor seconds and seconds waiting on a run queue, by kind ("main" or the kernel's name).
function ownThreads() {
  const kinds = {};
  for (const tid of fs.readdirSync("/proc/self/task")) {
    try {
      const stat = fs.readFileSync(`/proc/self/task/${tid}/stat`, "utf8");
      const close = stat.lastIndexOf(")");
      const name = stat.slice(stat.indexOf("(") + 1, close);
      const f = stat.slice(close + 2).split(" ");
      const [run, wait] = fs.readFileSync(`/proc/self/task/${tid}/schedstat`, "utf8").trim().split(" ").map(Number);
      const kind = Number(tid) === process.pid ? "main" : name.replace(/[0-9]+$/u, "").trim();
      const entry = (kinds[kind] ??= { user: 0, system: 0, run: 0, wait: 0 });
      entry.user += Number(f[11]) / TICK;
      entry.system += Number(f[12]) / TICK;
      entry.run += run / 1e9;
      entry.wait += wait / 1e9;
    } catch {
      // a thread that ended meanwhile
    }
  }
  return kinds;
}
const loadavg = () => fs.readFileSync("/proc/loadavg", "utf8").split(" ").slice(0, 3).map(Number);

async function main() {
  const ids = fs.readFileSync(commitsFile, "utf8").split("\n").filter((line) => line.trim() !== "" && !line.startsWith("#")).map((line) => line.trim());
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(cacheFolder, { recursive: true });
  const versionControl = await openGitRepository(root);
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const lens = lensOf(await generatorIdentity(), configuration);
  const mainline = await versionControl.mainline();
  const byId = new Map(mainline.map((change, index) => [change.id, { change, index }]));
  const changes = ids.map((id) => {
    const found = byId.get(id);
    if (!found) throw new Error(`${id} is not on the mainline`);
    return found.change;
  });

  const trees = {};
  const workingTree = versionControl.workingTree.bind(versionControl);
  // With --tree-in-process each tree is written by a process of its own (tree-writer.cjs), the same writer with the
  // same options, so that the pool's one process no longer writes every tree on its main thread.
  const treeInProcess = argv.includes("--tree-in-process");
  const writeElsewhere = (change, directory) =>
    new Promise((resolve, reject) => {
      const child = realFork(path.join(__dirname, "tree-writer.cjs"), [root, change, directory], { stdio: ["ignore", "ignore", "inherit", "ipc"] });
      child.once("message", (message) => (message.error ? reject(new Error(message.error)) : resolve(message)));
      child.once("error", reject);
    });
  versionControl.workingTree = async (change, directory, options) => {
    const began = performance.now();
    const cpu = process.cpuUsage();
    let tree;
    let writerCpu;
    if (treeInProcess) {
      const written = await writeElsewhere(change, directory);
      writerCpu = written.cpu;
      const remove = () => Promise.all([fs.promises.rm(directory, { recursive: true, force: true }), fs.promises.rm(`${directory}.index`, { force: true })]).then(() => undefined);
      tree = { root: written.root, environment: written.environment, unwritten: written.unwritten, remove };
    } else {
      tree = await workingTree(change, directory, options);
    }
    const used = process.cpuUsage(cpu);
    trees[change] = { began, wall: (performance.now() - began) / 1000, driverCpu: (used.user + used.system) / 1e6, writerCpu };
    return tree;
  };
  const ended = {};
  const progress = (line) => {
    const done = /regenerated: ([0-9a-f]{8}) in ([0-9.]+) s/u.exec(line);
    if (done) {
      ended[done[1]] = performance.now();
      process.stderr.write(`${line}\n`);
    } else if (!/^ {2}/u.test(line)) {
      process.stderr.write(`${line}\n`);
    }
  };

  const before = { at: performance.now(), stat: procStat(), disks: diskStats(), self: selfStat(), load: loadavg(), threads: ownThreads() };
  const scratch = new Scratch();
  const result = await scratch.during(() =>
    regenerate(changes, { versionControl, configuration, lens, cacheFolder, keepIndex: false, jobs, scratch, progress })
  );
  const after = { at: performance.now(), stat: procStat(), disks: diskStats(), self: selfStat(), load: loadavg(), threads: ownThreads() };
  const driverThreads = Object.fromEntries(Object.entries(after.threads).map(([kind, t]) => [kind, Object.fromEntries(Object.entries(t).map(([key, value]) => [key, +(value - (before.threads[kind]?.[key] ?? 0)).toFixed(2)]))]));

  const children = {};
  for (const name of fs.readdirSync(path.join(out, "children"))) {
    const child = JSON.parse(fs.readFileSync(path.join(out, "children", name), "utf8"));
    if (child.commit) children[child.commit] = child;
  }
  const delta = (key) => after.stat[key] - before.stat[key];
  const machine = { user: delta("user") / TICK, system: delta("system") / TICK, idle: delta("idle") / TICK, iowait: delta("iowait") / TICK, irq: delta("irq") / TICK, steal: delta("steal") / TICK, contextSwitches: delta("ctxt") };
  const disks = Object.fromEntries(Object.keys(after.disks).map((disk) => [disk, { readMB: ((after.disks[disk].readSectors - before.disks[disk].readSectors) * 512) / 1e6, writeMB: ((after.disks[disk].writeSectors - before.disks[disk].writeSectors) * 512) / 1e6, busyS: (after.disks[disk].ioMs - before.disks[disk].ioMs) / 1000 }]).filter(([, value]) => value.readMB + value.writeMB > 0));
  const waited = { user: after.self.childUser - before.self.childUser, system: after.self.childSystem - before.self.childSystem };
  const own = { user: after.self.user - before.self.user, system: after.self.system - before.self.system };
  const summary = {
    jobs, mode, flags, extraEnv, tmpdir: process.env.TMPDIR, commits: ids.length, lens: lens.key,
    wall: (after.at - before.at) / 1000,
    loadBefore: before.load, loadAfter: after.load,
    machine, disks, waited, driver: own, driverThreads,
    peakMemory: result.peakMemory,
    perCommit: changes.map((change) => {
      const child = children[change.id] ?? {};
      const usage = child.resourceUsage ?? {};
      const threads = child.threadsAtExit ?? {};
      return {
        id: change.id, position: byId.get(change.id).index,
        tree: trees[change.id]?.wall, treeDriverCpu: trees[change.id]?.driverCpu, treeWriterCpu: trees[change.id]?.writerCpu,
        total: ended[change.id.slice(0, 8)] && trees[change.id] ? (ended[change.id.slice(0, 8)] - trees[change.id].began) / 1000 : undefined,
        process: child.exitAt !== undefined ? child.exitAt / 1000 : undefined,
        user: usage.user, system: usage.system, maxRSS: usage.maxRSS, gitUser: child.children?.user, gitSystem: child.children?.system,
        threads
      };
    })
  };
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 1));
  const sum = (key) => summary.perCommit.reduce((total, entry) => total + (entry[key] ?? 0), 0);
  const n = summary.perCommit.length;
  const mainRun = summary.perCommit.reduce((total, entry) => total + (entry.threads.main?.run ?? 0), 0);
  const mainWait = summary.perCommit.reduce((total, entry) => total + (entry.threads.main?.wait ?? 0), 0);
  const otherRun = summary.perCommit.reduce((total, entry) => total + Object.entries(entry.threads).filter(([kind]) => kind !== "main").reduce((s, [, t]) => s + t.run, 0), 0);
  const otherWait = summary.perCommit.reduce((total, entry) => total + Object.entries(entry.threads).filter(([kind]) => kind !== "main").reduce((s, [, t]) => s + t.wait, 0), 0);
  console.log(
    JSON.stringify({
      jobs, mode, flags: flags.join(" "), env: option("--env", ""), commits: n,
      wall: +summary.wall.toFixed(1), wallPerCommit: +(summary.wall / n).toFixed(2),
      processWall: +(sum("process") / n).toFixed(2), treeWall: +(sum("tree") / n).toFixed(2), commitWall: +(sum("total") / n).toFixed(2),
      user: +(sum("user") / n).toFixed(2), system: +(sum("system") / n).toFixed(2), gitInChild: +((sum("gitUser") + sum("gitSystem")) / n).toFixed(2),
      driverCpu: +((own.user + own.system) / n).toFixed(2), driverGit: +((waited.user + waited.system - sum("user") - sum("system") - sum("gitUser") - sum("gitSystem")) / n).toFixed(2),
      mainRun: +(mainRun / n).toFixed(2), mainWait: +(mainWait / n).toFixed(2), otherRun: +(otherRun / n).toFixed(2), otherWait: +(otherWait / n).toFixed(2),
      peakMB: Math.round(result.peakMemory / 1e6), driverMain: driverThreads.main, driverMainShare: +((driverThreads.main.user + driverThreads.main.system) / summary.wall).toFixed(2), machine, loadBefore: before.load
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
