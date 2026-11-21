/**
 * The one list against Microsoft's TFVC client, counted: for each tree recorded from Team Explorer Everywhere
 * (`packages/engine/src/tooling/__fixtures__/tfignore-oracle.json`, 468 verdicts), its `.tfignore` files taken into one
 * list by the engine's `fromTfignores`, decided by `leaveOut` without regard to case, and each verdict compared:
 * whether the file is left out, and the file and line that decided. Counts what was compared, what follows `tf add`
 * (a folder it does not enter, left out whole), what lies in a version control's own folder, and what the translator
 * said it cannot carry, with every such verdict listed. The test of the same is `leaveOut.tfvc.test.ts`.
 *
 *   tsx --tsconfig tsconfig.base.json <this file>
 */
import fs from "node:fs";
import path from "node:path";

import { fromTfignores, leaveOut } from "../../../../../../../packages/engine/src/tooling/leaveOut";

interface Verdict { path: string; excluded: boolean; source: string | null; line: number | null; add: string }
const recorded = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../../../../../../../packages/engine/src/tooling/__fixtures__/tfignore-oracle.json"), "utf8")) as { trees: Array<{ name: string; tfignores: Record<string, string>; verdicts: Verdict[] }> };
const counts = { trees: 0, verdicts: 0, compared: 0, agree: 0, disagree: 0, unreachedLeftOutWhole: 0, inVersionControl: 0, setApartByASaidDifference: 0 };
const setApart: string[] = [];
const said: string[] = [];
const disagreements: string[] = [];
for (const tree of recorded.trees) {
  counts.trees += 1;
  const taken = fromTfignores(Object.entries(tree.tfignores).map(([file, text]) => ({ path: file, text })));
  said.push(...taken.differences.map((difference) => `${tree.name}: ${difference}`));
  const unsaid = new Set(taken.differences.map((difference) => /^(.*) line (\d+),/u.exec(difference)).filter((found) => found !== null).map((found) => `${found[1]}:${found[2]}`));
  const decide = leaveOut({ list: taken.lines.join("\n"), ignoreCase: true });
  for (const verdict of tree.verdicts) {
    counts.verdicts += 1;
    const ours = decide.file(verdict.path);
    const from = ours.line ? taken.from[ours.line.number - 1] : undefined;
    if (unsaid.has(`${verdict.source}:${verdict.line}`)) {
      counts.setApartByASaidDifference += 1;
      setApart.push(`${tree.name} ${verdict.path}: TFVC ${verdict.excluded ? "leaves out" : "keeps"} by ${verdict.source}:${verdict.line}; the list ${ours.kept ? "keeps" : "leaves out"}`);
    } else if (ours.fixed === "version control") counts.inVersionControl += 1;
    else if (verdict.add.startsWith("unreached:")) {
      if (!ours.kept && from !== undefined) counts.unreachedLeftOutWhole += 1;
      else disagreements.push(`${tree.name} ${verdict.path}: under ${verdict.add}, kept by the list`);
    } else {
      counts.compared += 1;
      const same = !ours.kept === verdict.excluded && (from?.file ?? null) === verdict.source && (from?.line ?? null) === verdict.line;
      if (same) counts.agree += 1;
      else {
        counts.disagree += 1;
        disagreements.push(`${tree.name} ${verdict.path}: TFVC ${verdict.excluded ? "leaves out" : "keeps"} by ${verdict.source}:${verdict.line}; the list ${ours.kept ? "keeps" : "leaves out"} by ${from ? `${from.file}:${from.line}` : "nothing"}`);
      }
    }
  }
}
console.log(JSON.stringify({ ...counts, said, setApart, disagreements }, null, 1));
