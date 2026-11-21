// The answers of the blind playtests' tasks on the choice before a scan (2026-11-21), written before any run: what the
// trial page shows for a folder handed through its folder input (listed whole first), with the person's patterns, by the
// page's own model run over the disk with the same listed-first source the page builds. Read only.
//
//   npx tsx --tsconfig tsconfig.base.json <this file> <folder> [--pattern <p>]...   (SHOW=<n> folders a group; TOPS=1; FIND=<text>)
import fs from "node:fs";
import path from "node:path";
import { walk, totals } from "../leave-out/choice/model.mjs";

const args = process.argv.slice(2);
const root = path.resolve(args[0]);
const person = args.flatMap((a, i) => (a === "--pattern" ? [args[i + 1]] : []));
const all: string[] = [];
const tree = new Map<string, Map<string, string>>([["", new Map()]]);
const walkDisk = (rel: string) => {
  const here = tree.get(rel)!;
  for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) { here.set(e.name, "folder"); tree.set(child, new Map()); walkDisk(child); }
    else { here.set(e.name, "file"); all.push(child); }
  }
};
walkDisk("");
const source = {
  lazy: false, label: path.basename(root), allFiles: all,
  list: async (f: string) => [...(tree.get(f) ?? new Map())].map(([name, kind]) => ({ name, kind })),
  text: async (f: string) => (fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), "utf8") : undefined)
};
const result: any = await walk(source, { evidenceApplied: true, person });
const t = totals(result);
console.log(`files ${all.length}; read ${t.read}; left out ${t.leftOutFiles}; folders left out ${t.foldersLeftOut}; not looked inside ${t.notLookedInside}`);
for (const g of result.groups) {
  const files = g.files.length + g.folders.reduce((s: number, f: any) => s + (f.files ?? 0), 0);
  console.log(`  ${g.reason}: ${g.folders.length} folders, ${files} files`);
  for (const f of g.folders.slice().sort((a: any, b: any) => (b.files ?? 0) - (a.files ?? 0)).slice(0, Number(process.env.SHOW ?? 3))) console.log(`      ${f.path}/ ${f.files}`);
  for (const f of g.files.slice(0, 3)) console.log(`      file ${f}`);
}
if (process.env.TOPS) {
  const byTop = new Map<string, number>();
  for (const f of result.kept) { const top = f.includes("/") ? f.slice(0, f.indexOf("/")) : "(top)"; byTop.set(top, (byTop.get(top) ?? 0) + 1); }
  console.log([...byTop].sort((a, b) => b[1] - a[1]));
}
if (process.env.FIND) for (const f of result.kept.filter((k: string) => k.includes(process.env.FIND!)).slice(0, 5)) console.log('kept:', f);
