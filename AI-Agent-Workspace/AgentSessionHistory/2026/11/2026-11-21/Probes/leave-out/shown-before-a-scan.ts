/**
 * What a person would be shown before a scan, from the engine's `leaveOut`, two ways over one folder:
 *
 * - a lazy walk, as the product would make it: a folder is listed, each folder in it is decided before it is entered,
 *   and a folder left out is never listed; it counts what it listed and the extra listings the evidence rules asked for;
 * - a full listing, for this record only, to count what lies under the folders the walk left unlisted.
 *
 * Prints, by folder to the given depth, how many files, how many kept, and how many left out by which rule; and,
 * against the maker's manifest when given, the made build output and packages wrongly kept and the source files of
 * the kinds the readers read wrongly left out. Reads the folder and writes nothing there.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--depth 2] [--no-ignore-files] [--ignore-case]
 *     [--starting fixed|visualstudio|tfvc|evidence|nothing] [--own <folder>] [--manifest <file>]
 */
import fs from "node:fs";
import path from "node:path";

import { LANGUAGE_ADAPTERS } from "../../../../../../../packages/engine/src/live-docs/adapters/index";
import { leaveOut, type IgnoreFileText, type StartingList } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const args = process.argv.slice(2);
const option = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const root = path.resolve(args[0]);
const depth = Number(option("--depth") ?? 2);
const noIgnoreFiles = args.includes("--no-ignore-files");
const lists = path.join(__dirname, "starting-lists");
const patternsOf = (file: string): string[] => fs.readFileSync(path.join(lists, file), "utf8").split(/\r?\n/u);
const startingName = option("--starting") ?? "nothing";
const own = option("--own");
const manifest = option("--manifest") ? (JSON.parse(fs.readFileSync(option("--manifest")!, "utf8")) as { build: string[]; packages: string[] }) : undefined;
const made = new Set(manifest ? [...manifest.build, ...manifest.packages] : []);
const READ = new Set([...LANGUAGE_ADAPTERS.flatMap((adapter) => adapter.extensions), ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);

/** A folder's names, a folder's with a trailing slash, as the evidence rules ask; counted, since each is a listing. */
let evidenceListings = 0;
const namesCache = new Map<string, string[]>();
const namesIn = (folder: string): string[] => {
  const known = namesCache.get(folder);
  if (known) return known;
  evidenceListings += 1;
  let names: string[] = [];
  try {
    names = fs.readdirSync(path.join(root, folder), { withFileTypes: true }).map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name));
  } catch {
    names = [];
  }
  namesCache.set(folder, names);
  return names;
};
const starting: StartingList | undefined = startingName === "fixed" ? patternsOf("fixed-list.txt")
  : startingName === "visualstudio" ? patternsOf("VisualStudio-ignore.txt")
  : startingName === "tfvc" ? patternsOf("tfvc-default.txt")
  : startingName === "evidence" ? { evidence: namesIn }
  : undefined;

const ignoreFilesIn = (folder: string): IgnoreFileText[] => {
  if (noIgnoreFiles) return [];
  return ["gitignore", "tfignore"].map((kind) => (folder ? `${folder}/.${kind}` : `.${kind}`)).filter((file) => fs.existsSync(path.join(root, file)))
    .map((file) => ({ path: file, text: fs.readFileSync(path.join(root, file), "utf8") }));
};
const decide = leaveOut({ ignoreFiles: ignoreFilesIn, gitIgnoreCase: args.includes("--ignore-case"), startingList: starting, ownOutput: own ? [own] : [] });

// The lazy walk.
const walkedAt = performance.now();
let listed = 0;
let folders = 0;
const kept: string[] = [];
const unlisted: Array<{ folder: string; rule: string; notes: number }> = [];
const ruleName = (verdict: ReturnType<typeof decide.file>): string => {
  const rule = verdict.rule!;
  return rule.kind === "gitignore" || rule.kind === "tfignore" ? `${rule.file}:${rule.line} ${rule.pattern}` : rule.kind === "own output" ? `own output ${rule.folder}` : `${rule.kind} ${rule.pattern}`;
};
const leftOutFiles: Array<{ file: string; rule: string }> = [];
const walk = (folder: string): void => {
  folders += 1;
  for (const entry of fs.readdirSync(path.join(root, folder), { withFileTypes: true })) {
    listed += 1;
    const child = folder ? `${folder}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const verdict = decide.folder(child);
      if (verdict.prunable) unlisted.push({ folder: child, rule: ruleName(verdict), notes: verdict.notes?.length ?? 0 });
      else walk(child);
    } else {
      const verdict = decide.file(child);
      if (verdict.kept) kept.push(child);
      else leftOutFiles.push({ file: child, rule: ruleName(verdict) });
    }
  }
};
walk("");
const walkMs = performance.now() - walkedAt;

// The full listing, to count what lies under the folders left unlisted.
const all: string[] = [];
const listAll = (folder: string): void => {
  for (const entry of fs.readdirSync(path.join(root, folder), { withFileTypes: true })) {
    const child = folder ? `${folder}/${entry.name}` : entry.name;
    if (entry.isDirectory()) listAll(child);
    else all.push(child);
  }
};
listAll("");
const keptSet = new Set(kept);
const ruleOf = new Map<string, string>(leftOutFiles.map(({ file, rule }) => [file, rule]));
for (const { folder, rule } of unlisted) for (const file of all) if (file.startsWith(`${folder}/`)) ruleOf.set(file, `${rule} (folder left out whole)`);

const groups = new Map<string, { files: number; kept: number; leftOut: Map<string, number> }>();
for (const file of all) {
  const parts = file.split("/");
  const folder = parts.length > 1 ? parts.slice(0, Math.min(depth, parts.length - 1)).join("/") : "(top)";
  const group = groups.get(folder) ?? groups.set(folder, { files: 0, kept: 0, leftOut: new Map() }).get(folder)!;
  group.files += 1;
  if (keptSet.has(file)) group.kept += 1;
  else {
    const rule = ruleOf.get(file) ?? "?";
    group.leftOut.set(rule, (group.leftOut.get(rule) ?? 0) + 1);
  }
}
const wronglyKept = kept.filter((file) => made.has(file));
const wronglyLeftOut = all.filter((file) => !keptSet.has(file) && !made.has(file) && READ.has(path.extname(file).toLowerCase()));

console.log(`${path.basename(root)}: ${all.length} files; starting list ${startingName}${args.includes("--ignore-case") ? ", .gitignore without regard to case" : ""}${noIgnoreFiles ? ", ignore files not read" : ""}`);
console.log(`kept ${kept.length}, left out ${all.length - kept.length}; the lazy walk listed ${listed} entries in ${folders} folders, left ${unlisted.length} folders unlisted, and the evidence rules listed ${evidenceListings} folders more; walk and decide ${Math.round(walkMs)} ms`);
if (manifest) console.log(`made output wrongly kept: ${wronglyKept.length} of ${made.size}; source files of the kinds the readers read wrongly left out: ${wronglyLeftOut.length}${wronglyLeftOut.length ? `, such as ${wronglyLeftOut.slice(0, 6).join(", ")}` : ""}`);
else console.log(`source files of the kinds the readers read left out: ${wronglyLeftOut.length}${wronglyLeftOut.length ? `, such as ${wronglyLeftOut.slice(0, 6).join(", ")}` : ""}`);
console.log(`notes on folders left out whole: ${unlisted.filter((entry) => entry.notes > 0).length}`);
console.log("folder | files | kept | left out, by rule");
for (const [folder, group] of [...groups].sort((a, b) => b[1].files - a[1].files)) {
  const rules = [...group.leftOut].sort((a, b) => b[1] - a[1]).map(([rule, count]) => `${count} by ${rule}`).join("; ");
  console.log(`${folder} | ${group.files} | ${group.kept} | ${rules || "-"}`);
}
