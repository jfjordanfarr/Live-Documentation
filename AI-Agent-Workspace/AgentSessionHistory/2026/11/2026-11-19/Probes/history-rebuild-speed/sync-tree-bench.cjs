// How much of the tree writer's cost is its asynchronous file handling rather than the disk: writes one commit's tree
// with synchronous calls, one thread, the same blobs from `git cat-file --batch` and the same rule for what is written
// empty (`treeOptions` of the built regenerate.js), then writes it again with the history's own writer and compares
// the two trees file by file (names, bytes, executable bits). A measurement only: it leaves out what the real writer
// guards against (links, names a disk cannot hold, clashes), and says how many entries it left out so.
//   node sync-tree-bench.cjs <commit> <parent folder>
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawn } = require("node:child_process");
const { performance } = require("node:perf_hooks");

const root = process.cwd();
const [commit, parent] = process.argv.slice(2);
const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { treeOptions } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));

const cpu = () => {
  const usage = process.resourceUsage();
  const stat = fs.readFileSync("/proc/self/stat", "utf8");
  const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
  return { self: (usage.userCPUTime + usage.systemCPUTime) / 1e6, system: usage.systemCPUTime / 1e6, children: (Number(f[13]) + Number(f[14])) / 100 };
};

async function writeSync(directory, options) {
  const listing = execFileSync("git", ["-C", root, "ls-tree", "-r", "-z", "--full-tree", commit], { maxBuffer: 1 << 30, encoding: "utf8" });
  const entries = [];
  let skipped = 0;
  for (const line of listing.split("\0")) {
    if (line === "") continue;
    const tab = line.indexOf("\t");
    const [mode, , id] = line.slice(0, tab).split(" ");
    const relative = line.slice(tab + 1);
    if (mode !== "100644" && mode !== "100755") {
      skipped += 1;
      continue;
    }
    entries.push({ mode, id, relative, empty: options.contentless(relative) });
  }
  fs.mkdirSync(directory);
  const folders = new Set();
  const place = (relative) => {
    const parts = relative.split("/");
    for (let depth = 1; depth < parts.length; depth += 1) {
      const folder = parts.slice(0, depth).join("/");
      if (folders.has(folder)) continue;
      try {
        fs.mkdirSync(path.join(directory, folder));
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
      }
      folders.add(folder);
    }
    return path.join(directory, ...parts);
  };
  const write = (entry, bytes) => fs.writeFileSync(place(entry.relative), bytes, { flag: "wx", mode: entry.mode === "100755" ? 0o777 : 0o666 });
  for (const entry of entries) if (entry.empty) write(entry, Buffer.alloc(0));
  const blobs = entries.filter((entry) => !entry.empty);
  const reader = spawn("git", ["-C", root, "cat-file", "--batch"], { stdio: ["pipe", "pipe", "inherit"] });
  reader.stdin.end(blobs.map((entry) => `${entry.id}\n`).join(""));
  let pending = Buffer.alloc(0);
  let next = 0;
  for await (const chunk of reader.stdout) {
    pending = pending.length === 0 ? chunk : Buffer.concat([pending, chunk]);
    for (;;) {
      const lineEnd = pending.indexOf(0x0a);
      if (lineEnd < 0) break;
      const size = Number(pending.subarray(0, lineEnd).toString("latin1").split(" ")[2]);
      if (pending.length < lineEnd + 1 + size + 1) break;
      write(blobs[next++], pending.subarray(lineEnd + 1, lineEnd + 1 + size));
      pending = pending.subarray(lineEnd + 1 + size + 1);
    }
  }
  return { files: entries.length, skipped, blobs: next };
}

function compare(a, b) {
  const list = (folder) => fs.readdirSync(folder, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => path.relative(folder, path.join(entry.parentPath, entry.name))).sort();
  const left = list(a);
  const right = new Set(list(b));
  let onlyInFirst = 0;
  let differ = 0;
  for (const file of left) {
    if (!right.has(file)) onlyInFirst += 1;
    else {
      right.delete(file);
      const x = fs.statSync(path.join(a, file));
      const y = fs.statSync(path.join(b, file));
      if ((x.mode & 0o111) !== (y.mode & 0o111) || !fs.readFileSync(path.join(a, file)).equals(fs.readFileSync(path.join(b, file)))) differ += 1;
    }
  }
  return { files: left.length, onlyInTheRealOne: onlyInFirst, onlyInTheSyncOne: right.size, differ };
}

(async () => {
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  fs.mkdirSync(parent, { recursive: true });
  const syncTree = path.join(parent, "sync");
  const realTree = path.join(parent, "real");
  let before = cpu();
  let began = performance.now();
  const written = await writeSync(syncTree, treeOptions(configuration, syncTree));
  let after = cpu();
  const sync = { wall: +((performance.now() - began) / 1000).toFixed(2), cpu: +(after.self - before.self).toFixed(2), system: +(after.system - before.system).toFixed(2), git: +(after.children - before.children).toFixed(2), ...written };
  const versionControl = await openGitRepository(root);
  before = cpu();
  began = performance.now();
  const tree = await versionControl.workingTree(commit, realTree, treeOptions(configuration, realTree));
  after = cpu();
  const real = { wall: +((performance.now() - began) / 1000).toFixed(2), cpu: +(after.self - before.self).toFixed(2), system: +(after.system - before.system).toFixed(2), git: +(after.children - before.children).toFixed(2), unwritten: tree.unwritten.length };
  console.log(JSON.stringify({ commit: commit.slice(0, 8), sync, real, same: compare(realTree, syncTree) }));
  fs.rmSync(parent, { recursive: true, force: true });
})();
