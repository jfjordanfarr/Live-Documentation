// Times the history's word from git between each two consecutive commits of the first-parent line, as the history
// command asks it while it replays (`changesBetween` of the built git.js), one after another as the command does, and
// then K at a time, to say what the replay's calls to git cost. Run from the checkout whose history it reads.
//   node diff-cost.cjs [--parallel K]
"use strict";
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const root = process.cwd();
const parallel = Number(process.argv.includes("--parallel") ? process.argv[process.argv.indexOf("--parallel") + 1] : "1");
const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const fs = require("node:fs");
const childCpu = () => {
  const stat = fs.readFileSync("/proc/self/stat", "utf8");
  const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
  return (Number(f[13]) + Number(f[14])) / 100;
};

async function main() {
  const versionControl = await openGitRepository(root);
  const mainline = await versionControl.mainline();
  const pairs = mainline.slice(1).map((change, index) => [mainline[index].id, change.id]);
  const began = performance.now();
  const cpu = childCpu();
  const slowest = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: parallel }, async () => {
      while (next < pairs.length) {
        const [from, to] = pairs[next++];
        const at = performance.now();
        await versionControl.changesBetween(from, to);
        slowest.push([performance.now() - at, to.slice(0, 8)]);
      }
    })
  );
  slowest.sort((a, b) => b[0] - a[0]);
  console.log(
    JSON.stringify({
      pairs: pairs.length, parallel, wall: +((performance.now() - began) / 1000).toFixed(1), gitCpu: +(childCpu() - cpu).toFixed(1),
      slowest: slowest.slice(0, 5).map(([ms, id]) => `${id} ${(ms / 1000).toFixed(2)} s`)
    })
  );
}
main();
