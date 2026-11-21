/**
 * What a person would be shown before a scan, from the engine's `leaveOut` over a folder's listing: by folder, how many
 * files, how many kept, and how many left out by which rule; with the time to list and to decide. Reads the folder
 * and writes nothing there.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--depth 2] [--no-ignore-files] [--starting <file of patterns>]
 *
 * `--no-ignore-files` reads the folder as if it held no `.gitignore` or `.tfignore`, as a TFS folder may; `--starting`
 * names a starting list, one pattern a line, read by git's rules. Also prints the files a starting list leaves out
 * whose kind is source code, which a list that names a folder (`packages`, `bin`) may leave out wrongly.
 */
import fs from "node:fs";
import path from "node:path";

import { leaveOut } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const args = process.argv.slice(2);
const root = path.resolve(args[0]);
const depth = args.includes("--depth") ? Number(args[args.indexOf("--depth") + 1]) : 2;
const noIgnoreFiles = args.includes("--no-ignore-files");
const startingFile = args.includes("--starting") ? args[args.indexOf("--starting") + 1] : undefined;
const startingList = startingFile ? fs.readFileSync(startingFile, "utf8").split(/\r?\n/u) : [];
const SOURCE = /\.(cs|vb|ts|tsx|js|aspx|ascx|cshtml|sql|ps1|psm1|java|py|go|rs|c|cpp|h|hpp|csproj|vbproj|sln)$/iu;

const files: string[] = [];
const ignoreFiles: Array<{ path: string; text: string }> = [];
const listedAt = performance.now();
const walk = (relative: string): void => {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(child);
    else {
      files.push(child);
      if (!noIgnoreFiles && (entry.name === ".gitignore" || entry.name.toLowerCase() === ".tfignore")) ignoreFiles.push({ path: child, text: fs.readFileSync(path.join(root, child), "utf8") });
    }
  }
};
walk("");
const listMs = performance.now() - listedAt;
const decidedAt = performance.now();
const decide = leaveOut({ ignoreFiles, startingList });
const verdicts = files.map((file) => ({ file, verdict: decide.file(file) }));
const decideMs = performance.now() - decidedAt;

const groups = new Map<string, { files: number; kept: number; leftOut: Map<string, number> }>();
for (const { file, verdict } of verdicts) {
  const parts = file.split("/");
  const folder = parts.length > 1 ? parts.slice(0, Math.min(depth, parts.length - 1)).join("/") : "(top)";
  const group = groups.get(folder) ?? groups.set(folder, { files: 0, kept: 0, leftOut: new Map() }).get(folder)!;
  group.files += 1;
  if (verdict.kept) group.kept += 1;
  else {
    const rule = verdict.rule!;
    const name = rule.kind === "gitignore" || rule.kind === "tfignore" ? `${rule.file}:${rule.line} ${rule.pattern}` : `${rule.kind} ${rule.pattern}`;
    group.leftOut.set(name, (group.leftOut.get(name) ?? 0) + 1);
  }
}
const leftOutSource = verdicts.filter(({ file, verdict }) => !verdict.kept && verdict.rule?.kind === "starting list" && SOURCE.test(file)).map(({ file }) => file);
const total = { files: files.length, kept: verdicts.filter(({ verdict }) => verdict.kept).length };
console.log(`${root}: ${total.files} files, ${total.kept} kept, ${total.files - total.kept} left out; listed in ${Math.round(listMs)} ms, decided in ${Math.round(decideMs)} ms; ${ignoreFiles.length} ignore files${startingFile ? `; starting list ${path.basename(startingFile)} (${startingList.filter((line) => line.trim() && !line.startsWith("#")).length} patterns)` : ""}`);
console.log("folder | files | kept | left out, by rule");
for (const [folder, group] of [...groups].sort((a, b) => b[1].files - a[1].files)) {
  const rules = [...group.leftOut].sort((a, b) => b[1] - a[1]).map(([rule, count]) => `${count} by ${rule}`).join("; ");
  console.log(`${folder} | ${group.files} | ${group.kept} | ${rules || "-"}`);
}
console.log(`source files the starting list leaves out: ${leftOutSource.length}${leftOutSource.length ? `, such as ${leftOutSource.slice(0, 8).join(", ")}` : ""}`);
