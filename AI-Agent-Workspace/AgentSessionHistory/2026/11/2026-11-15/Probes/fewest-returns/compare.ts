// Picture by picture, what the new ranking changed against the old: the returning references and the columns.
import fs from "node:fs";

const [beforePath, afterPath] = process.argv.slice(2);
const before = JSON.parse(fs.readFileSync(beforePath, "utf8")), after = JSON.parse(fs.readFileSync(afterPath, "utf8"));
const byId = (rows: any[]): Map<string, any> => new Map(rows.map(r => [r.id, r]));
const report = (label: string, b: Map<string, any>, a: Map<string, any>): void => {
  let changedBack = 0, changedColumns = 0, darkChanged = 0, worse = 0;
  const changed: string[] = [];
  for (const [id, x] of b) {
    const y = a.get(id);
    if (!y || x.error) continue;
    const backDiffers = JSON.stringify(x.back) !== JSON.stringify(y.back);
    const columnsDiffer = JSON.stringify(x.columns) !== JSON.stringify(y.columns);
    if (backDiffers) changedBack++;
    if (columnsDiffer) changedColumns++;
    if ((backDiffers || columnsDiffer) && x.heuristic === 0) darkChanged++;
    if (y.heuristic > x.heuristic) worse++;
    if (backDiffers || columnsDiffer) changed.push(`${String(x.heuristic).padStart(3)} -> ${String(y.heuristic).padStart(3)} backward, pairs ${x.pairs} -> ${y.pairs}, columns ${x.columns.length} -> ${y.columns.length}${columnsDiffer && !backDiffers ? " (columns only)" : ""}${backDiffers ? "" : " (returns same)"}  scc ${x.largest}  ${id}`);
  }
  console.log(`${label}: ${b.size} pictures; returns changed in ${changedBack}, columns changed in ${changedColumns}, dark pictures changed ${darkChanged}, pictures with more returns ${worse}`);
  for (const line of changed.sort()) console.log("  " + line);
};
report("files opened alone", byId(before.rows), byId(after.rows));
report("opened directories", byId(before.directoryRows), byId(after.directoryRows));
