// Probe of November 21, 2026 (not product code): the reader of `.git` held to git's own answers on one repository.
//   node oracle.mjs <host root> <git dir under it> <ref> <folder git is run in> <name> [blob sample size]
// Compares: the mainline's ids in order and each one's fields as the history reads them (`%H %P %cI %an %s`); every
// reachable commit; each mainline commit's changed paths against its first parent (`--no-renames`); the tags; the
// head's full tree; and the bytes of a sample of blobs, every blob the reader reads checked by its SHA-1 as well.
// Writes `results/oracle-<name>.json` beside this file and prints a one-line summary.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isoStrict, objectId, openRepository, subjectOf } from "./git-reader.mjs";
import { nodeHost } from "./node-host.mjs";

const [root, gitDir, ref, gitCwd, name, sampleText = "2000"] = process.argv.slice(2);
const here = path.dirname(fileURLToPath(import.meta.url));
const env = { ...process.env, GIT_NO_REPLACE_OBJECTS: "1", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" };
const git = (args, input) => execFileSync("git", ["-C", gitCwd, ...args], { env, maxBuffer: 2 ** 31, input });
const timed = async (label, times, work) => {
  const start = performance.now();
  const value = await work();
  times[label] = Math.round(performance.now() - start);
  return value;
};

const gitTimes = {};
const mineTimes = {};
const differences = [];
let differenceTotal = 0;
const byKind = {};
const differ = (what, detail) => {
  differenceTotal += 1;
  byKind[what] = (byKind[what] ?? 0) + 1;
  if (differences.length < 200) differences.push({ what, ...detail });
};

const head = (await timed("resolve", gitTimes, () => git(["rev-parse", ref]))).toString().trim();
const gitMainline = (await timed("mainline", gitTimes, () => git(["rev-list", "--first-parent", "--reverse", "--format=%x1e%H%x1f%P%x1f%cI%x1f%an%x1f%s", head])))
  .toString()
  .split("\u001e")
  .slice(1)
  .map((chunk) => chunk.split("\n", 1)[0].split("\u001f"));
const gitAll = new Set((await timed("reachable", gitTimes, () => git(["rev-list", head]))).toString().split("\n").filter(Boolean));
const gitChanges = new Map();
for (const chunk of (await timed("changes", gitTimes, () => git(["-c", "diff.relative=false", "log", "--first-parent", "--diff-merges=first-parent", "--no-renames", "--no-ext-diff", "--name-status", "-z", "--format=%x01%H", head])))
  .toString()
  .split("\u0001")
  .slice(1)) {
  const id = chunk.slice(0, 40);
  const fields = chunk.slice(41).replace(/^\n/u, "").split("\0");
  const list = [];
  for (let i = 0; i + 1 < fields.length; i += 2) list.push(`${fields[i]} ${fields[i + 1]}`);
  gitChanges.set(id, list.sort());
}
const gitTags = new Set(
  (await timed("tags", gitTimes, () => git(["for-each-ref", "--format=%(objectname) %(*objectname)", "refs/tags"])))
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(" ").filter(Boolean).at(-1))
);
const gitTree = (await timed("headTree", gitTimes, () => git(["ls-tree", "-r", "-z", "--full-tree", head])))
  .toString()
  .split("\0")
  .filter(Boolean)
  .map((line) => {
    const tab = line.indexOf("\t");
    const [mode, , id] = line.slice(0, tab).split(" ");
    return `${mode} ${id} ${line.slice(tab + 1)}`;
  });

// The reader.
const host = nodeHost(root);
const repository = await timed("open", mineTimes, () => openRepository(host, gitDir, { inflate: process.env.INFLATE, reach: root === "/" ? (absolute) => absolute.slice(1) : undefined }));
const resolved = await repository.resolve(ref === "HEAD" ? "HEAD" : ref.startsWith("refs/") ? ref : head);
if (resolved.id !== head) differ("head", { git: head, mine: resolved.id });
const mainline = await timed("mainline", mineTimes, () => repository.mainline(head));
if (mainline.length !== gitMainline.length) differ("mainline length", { git: gitMainline.length, mine: mainline.length });
for (let i = 0; i < Math.max(mainline.length, gitMainline.length); i += 1) {
  const c = mainline[i];
  const mine = c ? [c.id, c.parents.join(" "), isoStrict(c.committer), c.author.name, subjectOf(c.message)] : [];
  const theirs = gitMainline[i] ?? [];
  ["id", "parents", "date", "author", "subject"].forEach((field, f) => {
    if (mine[f] !== theirs[f]) differ(`mainline ${field}`, { at: i, git: theirs[f], mine: mine[f], encoding: c?.encoding });
  });
}
const all = await timed("reachable", mineTimes, () => repository.reachable([head]));
if (all.size !== gitAll.size) differ("reachable count", { git: gitAll.size, mine: all.size });
for (const id of gitAll) if (!all.has(id)) differ("reachable missing", { id });

const blobIds = new Set();
let changedPaths = 0;
await timed("changes", mineTimes, async () => {
  for (let i = 0; i < mainline.length; i += 1) {
    const c = mainline[i];
    const parentTree = i === 0 || c.parents.length === 0 ? null : mainline[i - 1].tree;
    const list = await repository.changes(parentTree, c.tree);
    changedPaths += list.length;
    for (const [status, , id, mode] of list) if (status !== "D" && mode !== "160000") blobIds.add(id);
    const mine = list.map(([status, file]) => `${status} ${file}`).sort();
    const theirs = gitChanges.get(c.id) ?? [];
    if (mine.join("\n") !== theirs.join("\n")) {
      const a = new Set(mine);
      const b = new Set(theirs);
      differ("changed paths", { commit: c.id, onlyMine: mine.filter((x) => !b.has(x)).slice(0, 10), onlyGit: theirs.filter((x) => !a.has(x)).slice(0, 10) });
    }
  }
});
const tags = await timed("tags", mineTimes, () => repository.tagged());
for (const id of gitTags) if (!tags.has(id)) differ("tag missing", { id });
if (tags.size !== gitTags.size) differ("tag count", { git: gitTags.size, mine: tags.size });
const tree = (await timed("headTree", mineTimes, async () => repository.files((await repository.commit(head)).tree))).map(([file, id, mode]) => `${mode} ${id} ${file}`);
if (tree.join("\n") !== gitTree.join("\n")) differ("head tree", { git: gitTree.length, mine: tree.length, firstDifferent: tree.findIndex((line, i) => line !== gitTree[i]) });

// Every blob the history changed, read and checked by its id; a seeded sample held byte for byte to git's.
let blobBytes = 0;
let badIds = 0;
await timed("everyChangedBlobVerified", mineTimes, async () => {
  for (const id of blobIds) {
    const data = await repository.blob(id);
    blobBytes += data.length;
    if ((await objectId("blob", data)) !== id) {
      badIds += 1;
      differ("blob id", { id });
    }
  }
});
let seed = 2166136261;
const random = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0) / 2 ** 32);
const pool = [...blobIds];
const sample = [];
for (let i = 0; i < Math.min(Number(sampleText), pool.length); i += 1) sample.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
const batch = git(["cat-file", "--batch"], sample.map((id) => `${id}\n`).join(""));
let at = 0;
let sampleDiffering = 0;
for (const id of sample) {
  const lineEnd = batch.indexOf(0x0a, at);
  const size = Number(batch.subarray(at, lineEnd).toString().split(" ")[2]);
  const theirs = batch.subarray(lineEnd + 1, lineEnd + 1 + size);
  at = lineEnd + 1 + size + 1;
  if (Buffer.compare(Buffer.from(await repository.blob(id)), theirs) !== 0) {
    sampleDiffering += 1;
    differ("blob bytes", { id });
  }
}
await host.close();

const result = {
  name,
  head,
  // Git's own changes, newest first, fingerprinted as the workload fingerprints the reader's, so that a page's run
  // can be held to git by one value.
  gitChangesDigest: Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode([...gitMainline].reverse().flatMap(([id]) => [id, ...(gitChanges.get(id) ?? [])]).join("\n")))),
    (b) => b.toString(16).padStart(2, "0")
  )
    .join("")
    .slice(0, 16),
  mainline: mainline.length,
  reachable: all.size,
  tags: tags.size,
  changedPaths,
  changedBlobs: blobIds.size,
  changedBlobMegabytes: +(blobBytes / 1048576).toFixed(1),
  headFiles: tree.length,
  blobsHeldToGit: sample.length,
  blobsDifferingFromGit: sampleDiffering,
  blobsFailingTheirId: badIds,
  packs: repository.packs.length,
  looseObjects: repository.loose.size,
  notes: repository.notes,
  refusals: repository.refusals,
  differenceCount: differenceTotal,
  differencesByKind: byKind,
  differences,
  gitMs: gitTimes,
  readerMs: mineTimes,
  hostCalls: host.counts
};
fs.mkdirSync(path.join(here, "results"), { recursive: true });
fs.writeFileSync(path.join(here, "results", `oracle-${name}${process.env.INFLATE ? `-${process.env.INFLATE}` : ""}.json`), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ name, mainline: result.mainline, reachable: result.reachable, changedPaths, changedBlobs: blobIds.size, differences: differenceTotal, byKind, readerMs: mineTimes, gitMs: gitTimes }));
