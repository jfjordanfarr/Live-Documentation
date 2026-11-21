// Probe of November 21, 2026 (not product code): whether the rename oracle can fail. Each mutation changes one rule of
// the port as git would not have it, the oracle runs against git with the mutated port, and the number of steps that
// then differ is recorded in `results/rename-mutations.json`. A mutation git does not catch on a history is reported
// as such: that rule never decided anything there.
//   node rename-mutations.mjs <scratch folder for the mutated copies> <name>=<folder holding .git> ...
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [scratch, ...repositories] = process.argv.slice(2);
const source = fs.readFileSync(path.join(here, "renames.mjs"), "utf8");
const mutations = {
  "no file-name pass": ["if (score >= minimumByName) record(d, s, score);", "void score;"],
  "file-name pass at the plain minimum": ["const minimumByName = minimumScore + Math.trunc(0.5 * (MAX_SCORE - minimumScore));", "const minimumByName = minimumScore;"],
  "a tie replaces a kept candidate": ["if (scoreCompare(slots[worst], candidate) > 0) slots[worst] = candidate;", "if (scoreCompare(slots[worst], candidate) >= 0) slots[worst] = candidate;"],
  "no preference for a same file name among equal scores": ["if (a.score === b.score) return b.name - a.name;", "if (a.score === b.score) return 0;"],
  "CR before LF counted": ["if (isText && c === 13 && k + 1 < data.length && data[k + 1] === 10) continue;", ""],
  "exact renames take the last source": ["if (score > bestScore) {", "if (score >= bestScore) {"],
  "score rounded, not truncated": ["return b === 0 ? 0 : Math.trunc((kept * MAX_SCORE) / max);", "return b === 0 ? 0 : Math.round((kept * MAX_SCORE) / max);"]
};
fs.mkdirSync(scratch, { recursive: true });
const out = {};
for (const [label, [from, to]] of Object.entries(mutations)) {
  if (!source.includes(from)) throw new Error(`the mutation "${label}" no longer applies`);
  const file = path.join(scratch, `${label.replace(/[^a-z]+/giu, "-")}.mjs`);
  fs.writeFileSync(file, source.replace(from, to));
  out[label] = {};
  for (const repository of repositories) {
    const [name, folder] = repository.split("=");
    const line = execFileSync("node", [path.join(here, "rename-oracle.mjs"), folder, name], { env: { ...process.env, RENAMES_MODULE: file }, maxBuffer: 1 << 26 }).toString();
    out[label][name] = JSON.parse(line.slice(0, line.indexOf(',"differences"')) + "}").differenceCount;
    console.log(label, name, out[label][name]);
  }
}
fs.writeFileSync(path.join(here, "results", process.env.MUTATIONS_OUT ?? "rename-mutations.json"), `${JSON.stringify(out, null, 2)}\n`);
