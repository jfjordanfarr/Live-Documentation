// Probe of November 21, 2026 (not product code): runs measure-page.mjs or measure-node.mjs over a list of runs and
// appends each JSON line to `results/<file>`; a run slowed (rate above 1) is held to two cores with `taskset -c 0,1`,
// as a Node run named "two-cores" is. Each run is a fresh browser or process.
//   node run-rows.mjs <results file> <page|node> <folder>:<rate or cores>:<task> ...
// The page runs only inside the browser lane: node scripts/browser-lane.mjs --label git-probe --max-seconds N -- node run-rows.mjs ...
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [file, kind, ...runs] = process.argv.slice(2);
for (const run of runs) {
  const [folder, setting, task] = run.split(":");
  const slowed = kind === "page" ? Number(setting) > 1 : setting === "two-cores";
  const command = kind === "page" ? ["node", path.join(here, "measure-page.mjs"), folder, setting, task] : ["node", path.join(here, "measure-node.mjs"), folder, task];
  const argv = slowed ? ["taskset", "-c", "0,1", ...command] : command;
  let line;
  try {
    line = execFileSync(argv[0], argv.slice(1), { maxBuffer: 1 << 26, timeout: 1800000 }).toString().trim().split("\n").at(-1);
  } catch (error) {
    line = JSON.stringify({ run, failed: String(error.stderr ?? error).slice(0, 600) });
  }
  if (kind === "node") line = JSON.stringify({ ...JSON.parse(line), setting });
  fs.appendFileSync(path.join(here, "results", file), `${line}\n`);
  console.log(line.slice(0, 400));
}
