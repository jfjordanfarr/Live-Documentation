/**
 * The trial page's choice as a terminal would show it before a scan: the totals, then what is left out by reason,
 * largest first, each with its folders, then what will be read, by kind and by top folder. The same model as the page,
 * walked lazily over the disk. A trial: no command is added to the product.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> [--pattern <p>]...
 *
 * As on the page, build output and packages are always left out; a `!` pattern keeps them back.
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
  const result = await walk(source, { person });
  const t = totals(result);
  const lines: string[] = [];
  const plural = (n: number, one: string): string => `${n.toLocaleString("en")} ${n === 1 ? one : `${one}s`}`;
  // The page's words: folders left out whole are not looked inside on a lazy walk, and that is said only when there are some.
  lines.push(`${path.basename(root)}: ${[`${plural(t.read, "file")} will be read`, t.leftOutFiles ? `${plural(t.leftOutFiles, "file")} left out` : "", t.notLookedInside ? `${plural(t.notLookedInside, "folder")} left out, not looked inside` : ""].filter(Boolean).join(" · ")}`);
  lines.push("", "Left out:");
  if (result.groups.length === 0) lines.push("  Nothing.");
  for (const group of result.groups) {
    const parts = [group.folders.length ? plural(group.folders.length, "folder") : "", group.files.length ? plural(group.files.length, "file") : ""].filter(Boolean).join(" · ");
    lines.push(`  ${group.reason}  (${parts})`);
    for (const [file, { folders, patterns }] of group.also) lines.push(`    Also ignored by ${file}: ${folders === group.folders.length ? `all ${folders}` : `${folders} of ${group.folders.length}`} (${[...patterns].join("  ")})`);
    // Under their top folders, as the page draws them, so that a reason of many folders is not a wall; a folder alone
    // under its top folder says the ignore file's line that also names it, as its row on the page does.
    type Member = { label: string; also?: { path: string; line: number; pattern: string } };
    const byTop = new Map<string, Member[]>();
    const members: Member[] = [...group.folders.map((folder: { path: string; also?: Member["also"] }) => ({ label: `${folder.path}/`, also: folder.also })), ...group.files.map((file: string) => ({ label: file }))];
    for (const member of members) {
      const top = member.label.indexOf("/") < member.label.length - 1 && member.label.includes("/") ? `${member.label.slice(0, member.label.indexOf("/"))}/` : "At the top";
      byTop.set(top, [...(byTop.get(top) ?? []), member]);
    }
    const tops = [...byTop].sort((a, b) => b[1].length - a[1].length);
    for (const [top, inTop] of tops.slice(0, 5)) {
      if (inTop.length > 1) lines.push(`      ${top.padEnd(40)} ${String(inTop.length).padStart(6)}`);
      else {
        lines.push(`      ${inTop[0].label}`);
        if (inTop[0].also) lines.push(`        Also ${inTop[0].also.path}, line ${inTop[0].also.line}: ${inTop[0].also.pattern}`);
      }
    }
    if (tops.length > 5) lines.push(`      and ${tops.slice(5).reduce((sum, [, inTop]) => sum + inTop.length, 0).toLocaleString("en")} more under ${plural(tops.length - 5, "other top folder")}`);
  }
  for (const note of result.notes) lines.push(`  Note: ${note.text}`);

  const summary = readSummary(result.kept);
  lines.push("", "Will be read, by kind:", ...summary.byKind.slice(0, 10).map(([kind, n]) => `  ${kind.padEnd(16)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "Will be read, by folder:", ...summary.byTop.slice(0, 10).map(([top, n]) => `  ${top.padEnd(40)} ${n.toLocaleString("en").padStart(8)}`));
  lines.push("", "To keep something, name it with ! in front: --pattern '!/packages/MyOwnPackage/'. To leave a folder out: --pattern '/DNN Platform/Tests/'; a kind of file: --pattern '*.png'.");
  lines.push(`Listed ${result.timings.listings.toLocaleString("en")} folders in ${Math.round(result.timings.totalMs)} ms (listing ${Math.round(result.timings.listMs)} ms, deciding ${Math.round(result.timings.decideMs)} ms).`);
  console.log(lines.join("\n"));
}

void main();
