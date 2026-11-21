/**
 * A measurement before building (the tenth leg): for each line of a list that leaves files out, how many of those files
 * the evidence rules also call build output or packages (they lie in a folder `proposeLines` would name), and how
 * many are "the rest", left out by the line's name pattern alone; with the files a reader would read among each part,
 * and the rest's folders by how many code files they hold. Lists measured: GitHub's Visual Studio list, a typed
 * `packages/` and a typed `build/`, each alone. Reads the folder and writes nothing there.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <folder> > listings/evidence-split-<folder>.json
 */
import fs from "node:fs";
import path from "node:path";

import { hasReader } from "../../../../../../../packages/engine/src/config/liveDocumentationConfig";
import { leaveOut, proposeLines } from "../../../../../../../packages/engine/src/tooling/leaveOut";

const root = path.resolve(process.argv[2] ?? ".");
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
const evidence = proposeLines(folders, (folder) => children.get(folder) ?? [], true).flatMap((each) => each.folders).map((folder) => `${folder.toLowerCase()}/`);
const byEvidence = (file: string): boolean => evidence.some((folder) => file.toLowerCase().startsWith(folder));

const visualStudio = fs.readFileSync(path.join(import.meta.dirname, "starting-lists", "VisualStudio-ignore.txt"), "utf8");
const measured: Record<string, unknown> = {};
for (const [name, list] of [["GitHub's Visual Studio list", visualStudio], ["packages/ typed alone", "packages/\n"], ["build/ typed alone", "build/\n"]] as const) {
  const decide = leaveOut({ list, ignoreCase: true });
  const lines = new Map<string, { evidence: number; evidenceCode: number; rest: number; restCode: number; restCodeFolders: Map<string, number> }>();
  for (const file of files) {
    const verdict = decide.file(file);
    if (verdict.kept || !verdict.line) continue;
    const key = `${verdict.line.number} ${verdict.line.text}`;
    const counts = lines.get(key) ?? lines.set(key, { evidence: 0, evidenceCode: 0, rest: 0, restCode: 0, restCodeFolders: new Map() }).get(key)!;
    const code = hasReader(file);
    if (byEvidence(file)) {
      counts.evidence += 1;
      if (code) counts.evidenceCode += 1;
    } else {
      counts.rest += 1;
      if (code) {
        counts.restCode += 1;
        const folder = file.slice(0, file.lastIndexOf("/"));
        counts.restCodeFolders.set(folder, (counts.restCodeFolders.get(folder) ?? 0) + 1);
      }
    }
  }
  measured[name] = Object.fromEntries([...lines].sort((a, b) => b[1].evidence + b[1].rest - a[1].evidence - a[1].rest).map(([line, counts]) => [line, {
    evidence: counts.evidence, evidenceCode: counts.evidenceCode, rest: counts.rest, restCode: counts.restCode,
    restCodeFolders: Object.fromEntries([...counts.restCodeFolders].sort((a, b) => b[1] - a[1]).slice(0, 6))
  }]));
}
console.log(JSON.stringify({ folder: path.basename(root), files: files.length, evidenceFolders: evidence.length, measured }, null, 1));
