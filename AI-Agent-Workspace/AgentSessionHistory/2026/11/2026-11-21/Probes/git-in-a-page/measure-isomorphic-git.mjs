// Probe of November 21, 2026 (not product code): the same questions asked of isomorphic-git (MIT) under Node, for the
// alternative of not writing a reader. The library is installed outside the repository and named by path:
//   node measure-isomorphic-git.mjs <path to isomorphic-git's index.js> <folder holding .git> [limit]
// The newest commits first along first parents, each commit's changed paths against its first parent through the
// library's `walk` with equal subtrees pruned (its own `log({ includeChanges })` walks every parent and every subtree),
// then every changed file's bytes by `readBlob`. The changes are fingerprinted as the workload fingerprints the
// reader's, to be held to git's. Prints one JSON line.
import fs from "node:fs";
import path from "node:path";

const [library, folder, limitText] = process.argv.slice(2);
const git = await import(library);
const limit = limitText === undefined ? Infinity : Number(limitText);
const gitdir = path.join(folder, ".git");
const cache = {};
const now = () => performance.now();
const t = {};
let s = now();
const head = await git.resolveRef({ fs, gitdir, ref: "HEAD" });
const first = await git.readCommit({ fs, gitdir, oid: head, cache });
t.openMs = Math.round(now() - s);
const kind = (mode) => (mode === 0o120000 ? "link" : mode === 0o160000 ? "gitlink" : "file");
s = now();
const lines = [];
const changed = new Set();
let commits = 0;
let paths = 0;
for (let commit = first; commit !== undefined && commits < limit; ) {
  const parentId = commit.commit.parent[0];
  const list = [];
  await git.walk({
    fs,
    gitdir,
    cache,
    trees: parentId === undefined ? [git.TREE({ ref: commit.oid })] : [git.TREE({ ref: parentId }), git.TREE({ ref: commit.oid })],
    map: async (file, entries) => {
      if (file === ".") return undefined;
      const [a, b] = parentId === undefined ? [null, entries[0]] : entries;
      const [aType, bType] = [await a?.type(), await b?.type()];
      const [aId, bId] = [await a?.oid(), await b?.oid()];
      const [aMode, bMode] = [await a?.mode(), await b?.mode()];
      if (aId === bId && aMode === bMode) return null;
      const aFile = a && aType !== "tree" ? a : null;
      const bFile = b && bType !== "tree" ? b : null;
      if (aFile && bFile) list.push([kind(aMode) === kind(bMode) ? "M" : "T", file, bId, bMode]);
      else if (aFile) list.push(["D", file, aId, aMode]);
      else if (bFile) list.push(["A", file, bId, bMode]);
      return aType === "tree" || bType === "tree" ? undefined : null;
    }
  });
  paths += list.length;
  lines.push(commit.oid, ...list.map(([status, file]) => `${status} ${file}`).sort());
  for (const [status, , id, mode] of list) if (status !== "D" && mode !== 0o160000) changed.add(id);
  commits += 1;
  if (commits === 1) t.firstCommitMs = Math.round(now() - s);
  commit = parentId === undefined ? undefined : await git.readCommit({ fs, gitdir, oid: parentId, cache });
}
t.commitsMs = Math.round(now() - s);
t.changesDigest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(lines.join("\n")))), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
t.commits = commits;
t.changedPaths = paths;
t.changedBlobs = changed.size;
s = now();
let bytes = 0;
for (const oid of changed) bytes += (await git.readBlob({ fs, gitdir, oid, cache })).blob.length;
t.blobsMs = Math.round(now() - s);
t.blobMegabytes = +(bytes / 1048576).toFixed(1);
console.log(JSON.stringify({ folder: path.basename(folder), library: "isomorphic-git", result: t, peakRssMB: Math.round(process.resourceUsage().maxRSS / 1024) }));
