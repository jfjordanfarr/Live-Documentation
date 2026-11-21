/**
 * How long the one list takes to decide a folder as the trial page's walk asks it: every folder decided before it is
 * entered, a folder left out never entered, every file in a kept folder decided. The list is the page's full one on the
 * made folder: the folder's own ignore files taken in (Use), the lines proposed from what its folders hold, and
 * GitHub's Visual Studio list. Run five times; the median is reported, with the paths decided and the list's length.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder>
 */
import fs from "node:fs";
import path from "node:path";

import { fromGitignores, fromTfignores, leaveOut, proposeLines } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const root = path.resolve(process.argv[2] ?? ".");
const children = new Map<string, Array<{ name: string; folder: boolean }>>();
const ignoreFiles: Array<{ path: string; text: string }> = [];
const walk = (relative: string): void => {
  const entries = fs.readdirSync(path.join(root, relative), { withFileTypes: true }).map((entry) => ({ name: entry.name, folder: entry.isDirectory() }));
  children.set(relative, entries);
  for (const entry of entries) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.folder) {
      if (relative === "" && entry.name === ".git") continue;
      walk(child);
    } else if (entry.name === ".gitignore" || entry.name.toLowerCase() === ".tfignore") ignoreFiles.push({ path: child, text: fs.readFileSync(path.join(root, child), "utf8") });
  }
};
walk("");
const folders = [...children.keys()].filter((folder) => folder !== "");
const names = (folder: string): string[] => (children.get(folder) ?? []).map((entry) => (entry.folder ? `${entry.name}/` : entry.name));
const git = fromGitignores(ignoreFiles.filter((file) => file.path.endsWith(".gitignore")), { folders, ignoreCase: true });
const tf = fromTfignores(ignoreFiles.filter((file) => !file.path.endsWith(".gitignore")));
const proposed = proposeLines(folders, names, true).map((each) => each.line);
const visualStudio = fs.readFileSync(path.join(import.meta.dirname, "starting-lists", "VisualStudio-ignore.txt"), "utf8");
const list = [...git.lines, ...tf.lines, ...proposed, visualStudio].join("\n");
const lines = list.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length;

const once = (): { ms: number; decided: number; kept: number } => {
  const started = performance.now();
  const decide = leaveOut({ list, ignoreCase: true, ownOutput: [".live-documentation"] });
  let decided = 0;
  let kept = 0;
  const visit = (folder: string): void => {
    for (const entry of children.get(folder) ?? []) {
      const child = folder ? `${folder}/${entry.name}` : entry.name;
      decided += 1;
      if (entry.folder) {
        if (!decide.folder(child).prunable) visit(child);
      } else if (decide.file(child).kept) kept += 1;
    }
  };
  visit("");
  return { ms: performance.now() - started, decided, kept };
};
const runs = Array.from({ length: 5 }, once);
const sorted = [...runs].sort((a, b) => a.ms - b.ms);
console.log(JSON.stringify({ folder: path.basename(root), listLines: lines, pathsDecided: runs[0].decided, filesKept: runs[0].kept, medianMs: Math.round(sorted[2].ms), runsMs: runs.map((run) => Math.round(run.ms)) }));
