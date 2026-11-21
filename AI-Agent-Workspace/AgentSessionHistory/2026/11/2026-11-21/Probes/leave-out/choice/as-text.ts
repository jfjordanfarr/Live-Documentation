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

import { hasReader } from "../../../../../../../../packages/engine/src/config/liveDocumentationConfig";
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
    const kinds = [[".gitignore", found.filter((file) => file.kind === ".gitignore").length], [".tfignore", found.filter((file) => file.kind === ".tfignore").length]].filter(([, n]) => Number(n) > 0);
    lines.push(`Taken in: ${kinds.map(([kind, n]) => plural(Number(n), `${kind} file`)).join(" and ")}.`);
    list = ["### The folder's own ignore files", ...git.lines, ...tf.lines].join("\n");
    result = await walk(source, { list, ignoreCase });
  }
  const t = totals(result);
  lines.push(`${path.basename(root)}: ${[`${plural(t.read, "file")} will be read`, t.leftOutFiles ? `${plural(t.leftOutFiles, "file")} left out` : "", t.notLookedInside ? `${plural(t.notLookedInside, "folder")} left out, not looked inside` : ""].filter(Boolean).join(" · ")}`);
  lines.push(`The list: ${plural(list.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length, "line")}, names matched ${ignoreCase ? "without" : "with"} regard to case.`);
  // As the page shows it: a row a block of the list (from a `###` heading to the next), largest first, then its lines
  // that act, largest first; a kind a reader reads is marked `[read]`.
  // As the page says them: the kinds a reader reads first, whatever their size, then the largest others, four in all.
  const read = (kind: string): boolean => kind.startsWith(".") && hasReader(`file${kind}`);
  const kindsOf = (kinds: Map<string, number>): string => {
    const sorted = [...kinds].sort((a, b) => b[1] - a[1]);
    const code = sorted.filter(([kind]) => read(kind));
    return [...code, ...sorted.filter(([kind]) => !read(kind)).slice(0, Math.max(1, 4 - code.length))].map(([kind, n]) => `${kind} ${n}${read(kind) ? " [read]" : ""}`).join(", ");
  };
  // How many files of kinds a reader reads: the lines that leave such files out come first in their block.
  const codeIn = (kinds: Map<string, number>): number => [...kinds].reduce((sum, [kind, n]) => sum + (kind.startsWith(".") && hasReader(`file${kind}`) ? n : 0), 0);
  const said = (group: { folders: unknown[]; leftOut: number }): string => [group.folders.length ? plural(group.folders.length, "folder") : "", group.leftOut ? plural(group.leftOut, "file") : ""].filter(Boolean).join(" · ");
  lines.push("", "Left out, by block of the list:");
  for (const group of result.fixed) lines.push(`  ${group.fixed === "version control" ? "Version control's own folder" : "The tool's own output"}  (${plural(group.folders.length, "folder")}, always)`);
  if (result.lines.length === 0 && result.fixed.length === 0) lines.push("  Nothing.");
  const text = list.split("\n");
  const blocks: Array<{ title: string; first: number; last: number }> = [];
  text.forEach((line, index) => {
    if (line.startsWith("### ") || blocks.length === 0) blocks.push({ title: line.startsWith("### ") ? line.slice(4).trim() : "Lines above the first heading", first: index + 1, last: index + 1 });
    else blocks[blocks.length - 1].last = index + 1;
  });
  type Group = { line: { number: number; text: string }; folders: unknown[]; leftOut: number; kinds: Map<string, number> };
  const rows = blocks.map((block) => {
    const acting = (result.lines as Group[]).filter((group) => group.line.number >= block.first && group.line.number <= block.last)
      .sort((a, b) => codeIn(b.kinds) - codeIn(a.kinds) || b.leftOut - a.leftOut || b.folders.length - a.folders.length);
    const kinds = new Map<string, number>();
    for (const group of acting) for (const [kind, n] of group.kinds) kinds.set(kind, (kinds.get(kind) ?? 0) + n);
    return { ...block, acting, kinds, leftOut: acting.reduce((sum, group) => sum + group.leftOut, 0), folders: acting.flatMap((group) => group.folders) };
  }).filter((block) => block.acting.length > 0).sort((a, b) => b.leftOut - a.leftOut || b.folders.length - a.folders.length);
  for (const block of rows) {
    lines.push(`  ${block.title}  (${said(block)}; ${kindsOf(block.kinds)})`);
    for (const group of block.acting.slice(0, 8)) lines.push(`    ${String(group.line.number).padStart(4)}  ${group.line.text}  (${said(group)}${group.kinds.size ? `; ${kindsOf(group.kinds)}` : ""})`);
    if (block.acting.length > 8) lines.push(`          and ${plural(block.acting.length - 8, "more line")} that leave something out`);
  }
  lines.push("", "Will be read, by kind:", ...byKind(result.kept).slice(0, 10).map(([kind, n]) => `  ${kind.padEnd(16)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "Will be read, by top folder:", ...result.root.folders.slice(0, 10).map((folder: { name: string; filesKept: number }) => `  ${folder.name.padEnd(40)} ${folder.filesKept.toLocaleString("en").padStart(8)}`));
  lines.push("", "To leave a folder out, add a line naming it: /DNN Platform/Tests/; a kind of file: *.png; to keep something back: !/packages/MyOwnPackage/.");
  lines.push(`Listed ${result.timings.listings.toLocaleString("en")} folders in ${Math.round(result.timings.totalMs)} ms (listing ${Math.round(result.timings.listMs)} ms, deciding ${Math.round(result.timings.decideMs)} ms).`);
  console.log(lines.join("\n"));
}

void main();
