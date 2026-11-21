/**
 * The engine's `leaveOut` against git's own word on a real folder: every file and folder of it (`.git` aside), the
 * `.gitignore` files found in it, and `git check-ignore -v -n --no-index` asked of every path. Prints the counts and
 * every disagreement by its path and the line each side names, and counts what a listing cannot know: a rule from
 * outside the tree (`.git/info/exclude`, a global excludes file) and a file git tracks beneath a folder it ignores.
 * Reads the folder and writes nothing there.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder>
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { leaveOut } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const root = path.resolve(process.argv[2] ?? ".");
const entries: Array<{ path: string; folder: boolean }> = [];
const walk = (relative: string): void => {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (relative === "" && entry.name === ".git") continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    const folder = entry.isDirectory();
    entries.push({ path: child, folder });
    if (folder) walk(child);
  }
};
const listedAt = performance.now();
walk("");
const listMs = performance.now() - listedAt;

const ignoreFiles = entries.filter((entry) => !entry.folder && path.posix.basename(entry.path) === ".gitignore")
  .map((entry) => ({ path: entry.path, text: fs.readFileSync(path.join(root, entry.path), "utf8") }));
const decidedAt = performance.now();
const decide = leaveOut({ ignoreFiles });
const ours = new Map(entries.map((entry) => [entry.path, entry.folder ? decide.folder(entry.path) : decide.file(entry.path)]));
const decideMs = performance.now() - decidedAt;

const asked = spawnSync("git", ["-C", root, "check-ignore", "-v", "-n", "-z", "--no-index", "--stdin"], { input: `${entries.map((entry) => entry.path).join("\0")}\0`, encoding: "utf8", maxBuffer: 1 << 30 });
const fields = asked.stdout.split("\0");
let agree = 0;
const fromOutside: string[] = [];
const disagreements: string[] = [];
for (let i = 0; i + 3 < fields.length; i += 4) {
  const [source, line, pattern, name] = fields.slice(i, i + 4);
  const gitIgnores = source !== "" && !pattern.startsWith("!");
  const verdict = ours.get(name)!;
  const ourRule = verdict.rule?.kind === "gitignore" ? `${verdict.rule.file}:${verdict.rule.line}` : "-";
  const gitRule = source ? `${source}:${line}` : "-";
  if (!verdict.kept === gitIgnores && ourRule === gitRule) agree += 1;
  else if (source && (path.isAbsolute(source) || source.startsWith(".git/"))) fromOutside.push(`${name}  git: ${gitIgnores ? "ignored" : "kept"} by ${gitRule} (${pattern})`);
  else disagreements.push(`${name}  git: ${gitIgnores ? "ignored" : "kept"} ${gitRule} ${pattern}  ours: ${verdict.kept ? "kept" : "ignored"} ${ourRule}`);
}
const tracked = spawnSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8", maxBuffer: 1 << 30 }).stdout.split("\0").filter(Boolean);
const trackedLeftOut = tracked.filter((file) => ours.get(file)?.kept === false);
// The folders a lazy walk would leave unlisted: those reported prunable whose own folder is kept.
const prunable = [...ours].filter(([file, verdict]) => "prunable" in verdict && verdict.prunable && ours.get(path.posix.dirname(file))?.kept !== false);

console.log(JSON.stringify({
  folder: root,
  paths: entries.length,
  files: entries.filter((entry) => !entry.folder).length,
  gitignoreFiles: ignoreFiles.length,
  agree,
  disagree: disagreements.length,
  decidedByARuleOutsideTheTree: fromOutside.length,
  trackedButLeftOut: trackedLeftOut.length,
  keptByUs: [...ours.values()].filter((verdict) => verdict.kept).length,
  topmostPrunableFolders: prunable.length,
  filesUnderThem: entries.filter((entry) => !entry.folder && prunable.some(([folder]) => entry.path.startsWith(`${folder}/`))).length,
  listMs: Math.round(listMs),
  decideMs: Math.round(decideMs),
  disagreements: disagreements.slice(0, 50),
  fromOutside: fromOutside.slice(0, 20),
  trackedLeftOutSample: trackedLeftOut.slice(0, 20)
}, null, 1));
