/**
 * The trial page's choice as a terminal would show it before a scan: the totals, then what is left out by reason,
 * largest first, each with its folders, then what will be read, by kind and by top folder. The same model as the page,
 * walked lazily over the disk. A trial: no command is added to the product.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--offered] [--pattern <p>]...
 */
import fs from "node:fs";
import path from "node:path";

import { readSummary, totals, walk } from "./model.mjs";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const root = path.resolve(args[0]);
  const person = args.flatMap((arg, index) => (arg === "--pattern" ? [args[index + 1]] : []));
  const source = {
    lazy: true,
    list: async (folder: string) => fs.readdirSync(path.join(root, folder), { withFileTypes: true }).map((entry) => ({ name: entry.name, kind: entry.isDirectory() ? "folder" : "file" })),
    text: async (file: string) => (fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : undefined)
  };
  const result = await walk(source, { evidenceApplied: !args.includes("--offered"), person });
  const t = totals(result);
  const lines: string[] = [];
  lines.push(`${path.basename(root)}: ${t.read.toLocaleString("en")} files will be read; ${t.leftOutFiles.toLocaleString("en")} files left out where they were listed; ${t.notLookedInside.toLocaleString("en")} folders not looked inside.`);
  lines.push("", "Left out:");
  if (result.groups.length === 0) lines.push("  Nothing.");
  for (const group of result.groups) {
    const plural = (n: number, one: string): string => `${n} ${n === 1 ? one : `${one}s`}`;
    const parts = [group.folders.length ? `${plural(group.folders.length, "folder")}, not looked inside` : "", group.files.length ? plural(group.files.length, "file") : ""].filter(Boolean).join("; ");
    lines.push(`  ${group.reason}  (${parts})`);
    for (const folder of group.folders.slice(0, 5)) lines.push(`      ${folder.path}/`);
    if (group.folders.length > 5) lines.push(`      and ${group.folders.length - 5} more folders`);
    for (const file of group.files.slice(0, 3)) lines.push(`      ${file}`);
    if (group.files.length > 3) lines.push(`      and ${group.files.length - 3} more files`);
  }
  for (const { note } of result.notes) lines.push(`  Note: ${note}`);
  if (result.offered.length) {
    lines.push("", "Would also leave out, if asked:");
    for (const offer of result.offered.slice(0, 10)) lines.push(`  ${offer.reason}: ${offer.path}/`);
  }
  const summary = readSummary(result.kept);
  lines.push("", "Will be read, by kind:", ...summary.byKind.slice(0, 10).map(([kind, n]) => `  ${kind.padEnd(16)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "Will be read, by folder:", ...summary.byTop.slice(0, 10).map(([top, n]) => `  ${top.padEnd(40)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "To keep something, name it with ! in front: --pattern '!/packages/MyOwnPackage/'. To leave something out: --pattern 'docs/'.");
  lines.push(`Listed ${result.timings.listings.toLocaleString("en")} folders in ${Math.round(result.timings.totalMs)} ms (listing ${Math.round(result.timings.listMs)} ms, deciding ${Math.round(result.timings.decideMs)} ms).`);
  console.log(lines.join("\n"));
}

void main();
