/**
 * How many lines the engine's `proposeLines` proposes for a folder, from what its folders hold, and what they leave
 * out: every folder of it listed (`.git` aside), each rule's lines counted as a name alone or exact, and the files the
 * proposed lines leave out when taken as the whole list. Reads the folder and writes nothing there.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--case]   (--case: a list that matches case)
 */
import fs from "node:fs";
import path from "node:path";

import { leaveOut, proposeLines } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const root = path.resolve(process.argv[2] ?? ".");
const ignoreCase = !process.argv.includes("--case");
const children = new Map<string, string[]>();
const files: string[] = [];
const walk = (relative: string): void => {
  const names: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (relative === "" && entry.name === ".git") continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    names.push(entry.isDirectory() ? `${entry.name}/` : entry.name);
    if (entry.isDirectory()) walk(child);
    else files.push(child);
  }
  children.set(relative, names);
};
walk("");
const folders = [...children.keys()].filter((folder) => folder !== "");
const proposed = proposeLines(folders, (folder) => children.get(folder) ?? [], ignoreCase);
const decide = leaveOut({ list: proposed.map((each) => each.line).join("\n"), ignoreCase });
const leftOut = files.filter((file) => !decide.file(file).kept);
const byRule = new Map<string, { general: number; exact: number; folders: number }>();
for (const each of proposed) {
  const counts = byRule.get(each.rule) ?? byRule.set(each.rule, { general: 0, exact: 0, folders: 0 }).get(each.rule)!;
  if (each.line.startsWith("/")) counts.exact += 1;
  else counts.general += 1;
  counts.folders += each.folders.length;
}
console.log(JSON.stringify({
  folder: path.basename(root),
  files: files.length,
  folders: folders.length,
  ignoreCase,
  lines: proposed.length,
  byRule: Object.fromEntries(byRule),
  filesLeftOut: leftOut.length,
  filesRead: files.length - leftOut.length,
  generalLines: proposed.filter((each) => !each.line.startsWith("/")).map((each) => each.line),
  firstExactLines: proposed.filter((each) => each.line.startsWith("/")).slice(0, 5).map((each) => each.line)
}, null, 1));
