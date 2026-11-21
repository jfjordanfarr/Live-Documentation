// Probe of November 21, 2026 (not product code): how much of a history's renames is git's inexact detection, which a
// reader of `.git` would have to re-make. Asks git, on the mainline, each commit against its first parent, as the
// history asks (`-M50%`, every rename weighed), and counts the renames whose content was identical (`R100`, found by
// the blob's id alone) and those found by similarity. Prints one JSON line.
//   node count-renames.mjs <folder git runs in> <name>
import { execFileSync } from "node:child_process";

const [cwd, name] = process.argv.slice(2);
const env = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_NO_REPLACE_OBJECTS: "1" };
const start = performance.now();
const out = execFileSync("git", ["-C", cwd, "-c", "diff.relative=false", "log", "--first-parent", "--diff-merges=first-parent", "-M50%", "-l0", "--no-ext-diff", "--name-status", "-z", "--format=%x01%H", "HEAD"], { env, maxBuffer: 2 ** 31 }).toString();
const ms = Math.round(performance.now() - start);
let exact = 0;
let similar = 0;
let commitsWithSimilar = 0;
let commits = 0;
for (const chunk of out.split("\u0001").slice(1)) {
  commits += 1;
  const fields = chunk.slice(41).replace(/^\n/u, "").split("\0");
  let here = 0;
  for (let i = 0; i < fields.length && fields[i] !== ""; ) {
    const status = fields[i];
    if (status[0] === "R" || status[0] === "C") {
      if (status[0] === "R") {
        if (status === "R100") exact += 1;
        else {
          similar += 1;
          here += 1;
        }
      }
      i += 3;
    } else i += 2;
  }
  if (here > 0) commitsWithSimilar += 1;
}
console.log(JSON.stringify({ name, commits, renames: exact + similar, exact, bySimilarity: similar, commitsWithSimilarityRenames: commitsWithSimilar, gitMs: ms }));
