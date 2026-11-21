/**
 * The trial page's choice as a terminal would show it before a scan: the ignore files found, the totals, what each line
 * of the list leaves out (with the kinds of file it leaves out), and what will be read, by kind and by top folder. The
 * same model as the page, walked lazily over the disk, the same list text the page saves. A trial: no command is added
 * to the product.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--list <file>] [--use-found] [--case]
 *
 * `--list` reads the list from a file (as the page saves it); `--use-found` takes the folder's ignore files into the
 * list, as the page's Use does; `--case` matches names with regard to case (without, by default, as on Windows).
 */
import fs from "node:fs";
import path from "node:path";

import { fromGitignores, fromTfignores } from "../../../../../../../../packages/engine/src/tooling/leaveOut";
import { byKind, totals, walk } from "./model.mjs";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const root = path.resolve(args[0]);
  const listFile = args.includes("--list") ? args[args.indexOf("--list") + 1] : undefined;
  let list = listFile ? fs.readFileSync(listFile, "utf8") : "";
  let ignoreCase = !args.includes("--case");
  const source = {
    lazy: true,
    list: async (folder: string) => fs.readdirSync(path.join(root, folder), { withFileTypes: true }).map((entry) => ({ name: entry.name, kind: entry.isDirectory() ? "folder" : "file" })),
    text: async (file: string) => (fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : undefined)
  };
  let result = await walk(source, { list, ignoreCase });
  const plural = (n: number, one: string): string => `${n.toLocaleString("en")} ${n === 1 ? one : `${one}s`}`;
  const lines: string[] = [];
  const found = result.found as Array<{ path: string; kind: string; text: string }>;
  if (found.length) lines.push(`Found ${[".gitignore", ".tfignore"].map((kind) => [kind, found.filter((file) => file.kind === kind).length] as const).filter(([, n]) => n > 0).map(([kind, n]) => plural(n, `${kind} file`)).join(" and ")}${args.includes("--use-found") ? "; taken into the list" : "; --use-found takes them into the list"}.`);
  if (args.includes("--use-found") && found.length) {
    const git = fromGitignores(found.filter((file) => file.kind === ".gitignore"));
    const tf = fromTfignores(found.filter((file) => file.kind === ".tfignore"));
    if (tf.lines.length) ignoreCase = true;
    for (const difference of [...git.differences, ...tf.differences]) lines.push(`  Not carried exactly: ${difference}`);
    list = [...git.lines, ...tf.lines].join("\n");
    result = await walk(source, { list, ignoreCase });
  }
  const t = totals(result);
  lines.push(`${path.basename(root)}: ${[`${plural(t.read, "file")} will be read`, t.leftOutFiles ? `${plural(t.leftOutFiles, "file")} left out` : "", t.notLookedInside ? `${plural(t.notLookedInside, "folder")} left out, not looked inside` : ""].filter(Boolean).join(" · ")}`);
  lines.push(`The list: ${plural(list.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length, "line")}, names matched ${ignoreCase ? "without" : "with"} regard to case.`);
  lines.push("", "Left out, by line:");
  for (const group of result.fixed) lines.push(`  ${group.fixed === "version control" ? "Version control's own folder" : "The tool's own output"}  (${plural(group.folders.length, "folder")}, always)`);
  if (result.lines.length === 0 && result.fixed.length === 0) lines.push("  Nothing.");
  for (const group of result.lines.slice(0, 40)) {
    const kinds = [...group.kinds].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([kind, n]) => `${kind} ${n}`).join(", ");
    const said = [group.folders.length ? plural(group.folders.length, "folder") : "", group.leftOut ? plural(group.leftOut, "file") : ""].filter(Boolean).join(" · ");
    lines.push(`  ${String(group.line.number).padStart(4)}  ${group.line.text}  (${said}${kinds ? `; ${kinds}` : ""})`);
  }
  if (result.lines.length > 40) lines.push(`  and ${plural(result.lines.length - 40, "more line")}`);
  lines.push("", "Will be read, by kind:", ...byKind(result.kept).slice(0, 10).map(([kind, n]) => `  ${kind.padEnd(16)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "Will be read, by top folder:", ...result.root.folders.slice(0, 10).map((folder: { name: string; filesKept: number }) => `  ${folder.name.padEnd(40)} ${folder.filesKept.toLocaleString("en").padStart(8)}`));
  lines.push("", "To leave a folder out, add a line naming it: /DNN Platform/Tests/; a kind of file: *.png; to keep something back: !/packages/MyOwnPackage/.");
  lines.push(`Listed ${result.timings.listings.toLocaleString("en")} folders in ${Math.round(result.timings.totalMs)} ms (listing ${Math.round(result.timings.listMs)} ms, deciding ${Math.round(result.timings.decideMs)} ms).`);
  console.log(lines.join("\n"));
}

void main();
