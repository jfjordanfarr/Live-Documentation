// A measurement of shape (b), long-lived summarizing processes, built only to be measured: J worker processes are
// started once each, and every commit's summary is made by whichever is free, in turn, with the built generator's own
// `summarizeChange` and the same task the history command gives. The trees are written by this process exactly as the
// history writes them. Before each task a worker takes that commit's git environment into its own (one task at a time
// per worker, so nothing interleaves). Nothing is remembered on purpose between commits; whatever the engine's modules
// keep for the life of a process is kept, which is what the oracle comparison is for.
//
//   node warm-driver.cjs --commits <file> --jobs <n> --cache <folder> [--flags "..."]
//
// Run from the checkout whose build it uses, with a private, short TMPDIR. Prints one JSON line of totals.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { fork } = require("node:child_process");
const { performance } = require("node:perf_hooks");

if (process.argv[2] === "--worker") {
  const root = process.cwd();
  const { summarizeChange } = require(path.join(root, "packages/generator/dist/history/summarizeChange.js"));
  process.on("message", async ({ task, environment }) => {
    for (const [name, value] of Object.entries(environment)) process.env[name] = value;
    const cpu = process.cpuUsage();
    const began = performance.now();
    let error;
    try {
      await summarizeChange(task);
    } catch (failure) {
      error = String(failure && failure.stack ? failure.stack : failure);
    }
    const used = process.cpuUsage(cpu);
    process.send({ commit: task.commit, wall: (performance.now() - began) / 1000, user: used.user / 1e6, system: used.system / 1e6, rss: process.memoryUsage.rss(), error });
  });
  process.send({ ready: true, at: performance.now() / 1000 });
  return;
}

const root = process.cwd();
const argv = process.argv.slice(2);
const option = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback);
const jobs = Number(option("--jobs", "1"));
const cacheFolder = path.resolve(option("--cache"));
const flags = option("--flags", "").split(/\s+/u).filter(Boolean);
const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const { lensOf, summarizedConfiguration } = require(path.join(root, "packages/engine/dist/live-docs/history/lens.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { generatorIdentity } = require(path.join(root, "packages/generator/dist/history/generatorIdentity.js"));
const { Scratch, treeOptions, summaryPath, summarizingEnvironment } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));
const { TEXT_STORE_DIRECTORY } = require(path.join(root, "packages/engine/dist/live-docs/history/textStore.js"));

async function main() {
  const ids = fs.readFileSync(option("--commits"), "utf8").split("\n").filter((line) => line.trim() !== "" && !line.startsWith("#"));
  fs.mkdirSync(cacheFolder, { recursive: true });
  const versionControl = await openGitRepository(root);
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const lens = lensOf(await generatorIdentity(), configuration);
  const scratch = new Scratch();
  const began = performance.now();
  const workers = await Promise.all(
    Array.from({ length: Math.min(jobs, ids.length) }, () =>
      new Promise((resolve) => {
        const child = fork(__filename, ["--worker"], { execArgv: flags, env: summarizingEnvironment(process.env), stdio: ["ignore", "ignore", "inherit", "ipc"] });
        child.once("message", () => resolve(child));
      })
    )
  );
  const started = (performance.now() - began) / 1000;
  const results = [];
  let next = 0;
  await Promise.all(
    workers.map(async (worker) => {
      while (next < ids.length) {
        const id = ids[next++];
        const at = performance.now();
        const folder = await scratch.folder("live-docs-history-");
        const directory = path.join(folder, path.basename(folder));
        // With --tree-in-process the tree is written by a process of its own (tree-writer.cjs), as in pool-driver.cjs.
        const tree = argv.includes("--tree-in-process")
          ? await new Promise((resolve, reject) => {
              const child = fork(path.join(__dirname, "tree-writer.cjs"), [root, id, directory], { stdio: ["ignore", "ignore", "inherit", "ipc"] });
              child.once("message", (message) => (message.error ? reject(new Error(message.error)) : resolve(message)));
              child.once("error", reject);
            })
          : await versionControl.workingTree(id, directory, treeOptions(configuration, directory));
        const treeWall = (performance.now() - at) / 1000;
        const task = {
          tree: tree.root, configuration: summarizedConfiguration(configuration), lens: lens.key, commit: id,
          summaryPath: summaryPath(cacheFolder, id), textStore: path.join(cacheFolder, TEXT_STORE_DIRECTORY),
          ...(tree.unwritten.length > 0 ? { unwritten: tree.unwritten } : {})
        };
        const done = await new Promise((resolve) => {
          worker.once("message", resolve);
          worker.send({ task, environment: tree.environment });
        });
        await scratch.release(folder);
        if (done.error) throw new Error(`${id}: ${done.error}`);
        results.push({ ...done, tree: treeWall, total: (performance.now() - at) / 1000 });
        process.stderr.write(`${results.length}/${ids.length} ${id.slice(0, 8)} ${done.wall.toFixed(1)} s\n`);
      }
    })
  );
  for (const worker of workers) worker.kill();
  const wall = (performance.now() - began) / 1000;
  const n = results.length;
  const sum = (key) => results.reduce((total, entry) => total + entry[key], 0);
  console.log(JSON.stringify({ jobs, warm: true, flags: flags.join(" "), commits: n, wall: +wall.toFixed(1), wallPerCommit: +(wall / n).toFixed(2), workersStarted: +started.toFixed(2), summarizeWall: +(sum("wall") / n).toFixed(2), treeWall: +(sum("tree") / n).toFixed(2), user: +(sum("user") / n).toFixed(2), system: +(sum("system") / n).toFixed(2), peakRssMB: Math.round(Math.max(...results.map((entry) => entry.rss)) / 1e6), perCommit: results.map((entry) => [entry.commit.slice(0, 8), +entry.wall.toFixed(2), +(entry.user + entry.system).toFixed(2), Math.round(entry.rss / 1e6)]) }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
