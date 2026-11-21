// Probe of November 21, 2026 (not product code): the rename port held to git on every mainline step of a repository.
//   node rename-oracle.mjs <folder holding .git> <name>
// Git's answer is `git log --first-parent --diff-merges=first-parent -M50% -l0 --name-status -z`, every record of every
// step, status letters with their scores and both paths of a rename, in git's order. Each step that git gives a
// rename is asked again exactly as the history asks it (`git diff --no-ext-diff --name-status -z -M50% -l0 <parent>
// <commit>`), and that answer too is held to the port's. Writes `results/renames-<name>.json` with every difference.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openRepository } from "./git-reader.mjs";
import { nodeHost } from "./node-host.mjs";
const { withRenames } = await import(process.env.RENAMES_MODULE ?? "./renames.mjs");

const [folder, name] = process.argv.slice(2);
const here = path.dirname(fileURLToPath(import.meta.url));
const env = { ...process.env, GIT_NO_REPLACE_OBJECTS: "1", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" };
const git = (args) => execFileSync("git", ["-C", folder, "-c", "diff.relative=false", ...args], { env, maxBuffer: 2 ** 31 }).toString();
const records = (text) => {
  const fields = text.split("\0");
  const out = [];
  for (let i = 0; i < fields.length && fields[i] !== ""; ) {
    const status = fields[i];
    if (status[0] === "R" || status[0] === "C") {
      out.push(`${status} ${fields[i + 1]} -> ${fields[i + 2]}`);
      i += 3;
    } else {
      out.push(`${status} ${fields[i + 1]}`);
      i += 2;
    }
  }
  return out;
};

let start = performance.now();
const gitSteps = new Map();
for (const chunk of git(["log", "--first-parent", "--diff-merges=first-parent", "-M50%", "-l0", "--no-ext-diff", "--name-status", "-z", "--format=%x01%H", "HEAD"]).split("\u0001").slice(1)) {
  gitSteps.set(chunk.slice(0, 40), records(chunk.slice(41).replace(/^\n/u, "")));
}
const gitMs = Math.round(performance.now() - start);

const host = nodeHost(folder);
const repository = await openRepository(host, ".git");
const head = await repository.resolve("HEAD");
const mainline = await repository.mainline(head.id);
const differences = [];
const steps = [];
let renameMs = 0;
let changesMs = 0;
let renamesFound = 0;
let similar = 0;
let diffChecked = 0;
let diffDiffering = 0;
for (let i = 0; i < mainline.length; i += 1) {
  const commit = mainline[i];
  const parent = commit.parents.length === 0 ? null : mainline[i - 1];
  let s = performance.now();
  const changes = await repository.changes(parent?.tree ?? null, commit.tree);
  changesMs += performance.now() - s;
  s = performance.now();
  const mine = (await withRenames(changes, (id) => repository.blob(id), { size: (id) => repository.size(id) })).map((r) => (r.length === 3 ? `${r[0]} ${r[1]} -> ${r[2]}` : `${r[0]} ${r[1]}`));
  const ms = performance.now() - s;
  renameMs += ms;
  const added = changes.filter(([status]) => status === "A").length;
  const deleted = changes.filter(([status]) => status === "D").length;
  steps.push({ commit: commit.id, added, deleted, renameMs: +ms.toFixed(1) });
  for (const line of mine) {
    if (line[0] === "R") {
      renamesFound += 1;
      if (!line.startsWith("R100")) similar += 1;
    }
  }
  const theirs = gitSteps.get(commit.id) ?? [];
  const compare = (label, expected) => {
    if (mine.join("\n") === expected.join("\n")) return true;
    const a = new Set(mine);
    const b = new Set(expected);
    differences.push({ against: label, commit: commit.id, added, deleted, sameRecordsOtherOrder: mine.length === expected.length && mine.every((x) => b.has(x)), onlyPort: mine.filter((x) => !b.has(x)).slice(0, 12), onlyGit: expected.filter((x) => !a.has(x)).slice(0, 12) });
    return false;
  };
  compare("log", theirs);
  if (parent !== null && theirs.some((line) => line[0] === "R")) {
    diffChecked += 1;
    const asked = records(git(["diff", "--no-ext-diff", "--name-status", "-z", "-M50%", "-l0", parent.id, commit.id]));
    if (!compare("diff", asked)) diffDiffering += 1;
  }
}
await host.close();
const worst = [...steps].sort((a, b) => b.renameMs - a.renameMs).slice(0, 5);
const largest = [...steps].sort((a, b) => b.added * b.deleted - a.added * a.deleted).slice(0, 5);
const result = {
  name,
  head: head.id,
  steps: mainline.length,
  renames: renamesFound,
  bySimilarity: similar,
  stepsAskedAsTheHistoryAsks: diffChecked,
  differenceCount: differences.length,
  differences,
  gitLogMs: gitMs,
  readerChangesMs: Math.round(changesMs),
  portMs: Math.round(renameMs),
  slowestSteps: worst,
  largestMatrices: largest,
  // Git's records, newest first, fingerprinted as the workload fingerprints the port's, so that a page's run is held to
  // git by one value.
  gitRenamesDigest: Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode([...mainline].reverse().flatMap((c) => [c.id, ...(gitSteps.get(c.id) ?? []).map((line) => line.replace(" -> ", " "))]).join("\n")))),
    (b) => b.toString(16).padStart(2, "0")
  )
    .join("")
    .slice(0, 16)
};
if (!process.env.RENAMES_MODULE) fs.writeFileSync(path.join(here, "results", `renames-${name}.json`), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, differences: differences.slice(0, 3) }).slice(0, 3000));
