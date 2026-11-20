// Writes one commit's tree with the history's own writer (`workingTree` of the built git.js, with the options the
// history gives it), K at a time in this one process, as the history command's process does for its pool, and
// measures it: wall clock, this process's processor time by thread kind (the main thread, libuv's pool), and the
// removal. Nothing else runs.
//
//   node tree-bench.cjs <commit> <parent folder> [--concurrent K] [--rounds R]
//
// Run from the checkout whose build it uses. Set UV_THREADPOOL_SIZE in the environment to size libuv's pool.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const root = process.cwd();
const [commit, parent, ...rest] = process.argv.slice(2);
const option = (name, fallback) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : fallback);
const concurrent = Number(option("--concurrent", "1"));
const rounds = Number(option("--rounds", "1"));
const TICK = 100;

const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { treeOptions } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));

function threads() {
  const kinds = {};
  for (const tid of fs.readdirSync("/proc/self/task")) {
    try {
      const stat = fs.readFileSync(`/proc/self/task/${tid}/stat`, "utf8");
      const close = stat.lastIndexOf(")");
      const name = stat.slice(stat.indexOf("(") + 1, close);
      const f = stat.slice(close + 2).split(" ");
      const kind = Number(tid) === process.pid ? "main" : name.replace(/[0-9]+$/u, "").trim();
      const entry = (kinds[kind] ??= { user: 0, system: 0 });
      entry.user += Number(f[11]) / TICK;
      entry.system += Number(f[12]) / TICK;
    } catch {
      // ended meanwhile
    }
  }
  return kinds;
}
function children() {
  const stat = fs.readFileSync("/proc/self/stat", "utf8");
  const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
  return (Number(f[13]) + Number(f[14])) / TICK;
}
const diff = (a, b) => Object.fromEntries(Object.keys(b).map((kind) => [kind, { user: +(b[kind].user - (a[kind]?.user ?? 0)).toFixed(2), system: +(b[kind].system - (a[kind]?.system ?? 0)).toFixed(2) }]));

async function main() {
  const versionControl = await openGitRepository(root);
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  fs.mkdirSync(parent, { recursive: true });
  for (let round = 0; round < rounds; round += 1) {
    const before = { at: performance.now(), threads: threads(), git: children() };
    const trees = await Promise.all(
      Array.from({ length: concurrent }, async (_, index) => {
        const directory = path.join(parent, `tree-${round}-${index}`);
        const tree = await versionControl.workingTree(commit, directory, treeOptions(configuration, directory));
        return tree;
      })
    );
    const written = { at: performance.now(), threads: threads(), git: children() };
    await Promise.all(trees.map((tree) => tree.remove()));
    const removed = { at: performance.now(), threads: threads() };
    console.log(
      JSON.stringify({
        commit: commit.slice(0, 8), parent, concurrent, round, uvThreads: process.env.UV_THREADPOOL_SIZE ?? "4",
        writeWall: +((written.at - before.at) / 1000).toFixed(2), writeCpu: diff(before.threads, written.threads), gitCpu: +(written.git - before.git).toFixed(2),
        removeWall: +((removed.at - written.at) / 1000).toFixed(2), removeCpu: diff(written.threads, removed.threads), unwritten: trees[0].unwritten.length
      })
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
