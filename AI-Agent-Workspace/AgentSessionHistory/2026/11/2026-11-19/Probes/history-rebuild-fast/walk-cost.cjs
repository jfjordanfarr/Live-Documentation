// What the check of a tree brought forward costs: the head's tree written anew by the history's writer, and then one
// recursive walk of its names (`holdsOnly` in git.ts walks it so), timed five times. Run from the worktree's root after
// `npm run build`, with a private TMPDIR:   node walk-cost.cjs <scratch folder>
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const { writeTreeAnew } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const { treeOptions } = require(path.join(root, "packages/generator/dist/history/summarizeChange.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));

async function main() {
  const scratch = path.resolve(process.argv[2]);
  const directory = path.join(scratch, "head");
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const began = performance.now();
  const store = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: root, encoding: "utf8" }).trim();
  const { written } = await writeTreeAnew(store, head, directory, treeOptions(configuration, directory));
  const wrote = performance.now() - began;
  const walks = [];
  let names = 0;
  for (let round = 0; round < 5; round += 1) {
    const start = performance.now();
    names = (await fs.promises.readdir(directory, { recursive: true, withFileTypes: true })).length;
    walks.push(+(performance.now() - start).toFixed(1));
  }
  // Since the review of 2026-11-20 the walk also takes an `lstat` of each file, to compare with its stamp.
  const stamped = [];
  for (let round = 0; round < 5; round += 1) {
    const start = performance.now();
    for (const found of await fs.promises.readdir(directory, { recursive: true, withFileTypes: true })) {
      if (found.isFile()) await fs.promises.lstat(path.join(found.parentPath, found.name));
    }
    stamped.push(+(performance.now() - start).toFixed(1));
  }
  fs.rmSync(directory, { recursive: true, force: true });
  console.log(JSON.stringify({ head: head.slice(0, 8), entries: written.size, names, writeMs: Math.round(wrote), walkMs: walks, walkWithStampsMs: stamped }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
