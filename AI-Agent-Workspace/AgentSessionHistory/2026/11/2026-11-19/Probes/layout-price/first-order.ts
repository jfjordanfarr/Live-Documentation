/**
 * How the first picture's order compares with every order the search could try: the first picture as the page draws it
 * (the ranking's order and seeds 1 and 2, the cheapest kept), then each seed from 1 to N alone, priced by the page's
 * price churn aside, and the first picture's starts swept more times. Prints each picture's terms against the first's,
 * which columns' orders differ from the first's, and the milliseconds each took (give the load beside them).
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <capture.json> <bundle/scope> <N> [out.json]
 */
import * as fs from "node:fs";

import { signalsOf } from "../../../../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { rankingTerms } from "../../../../../../../packages/explorer/src/client/views/localView/cycle-trials";
import { readCaptureFile } from "../../../../../../../scripts/layout-lab/capture";
import { baselineConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { findScope, loadBundleGraph } from "../../../../../../../scripts/layout-lab/scopes";
import { Lean, type Picture } from "./lean";

const [captureFile, scopeKey, countArg, outFile] = process.argv.slice(2);
const TERMS = ["vertical", "crossings", "height", "width", "unevenness", "steps", "unlevel", "ranking"] as const;

async function main(): Promise<void> {
  const capture = await readCaptureFile(captureFile);
  const run = findScope(scopeKey);
  const graph = await loadBundleGraph(run);
  const config = baselineConfig();
  const lean = new Lean(capture, graph, run, config);
  const row = (name: string, picture: Picture, ms: number) => {
    const s = signalsOf(picture.branches, picture.scene, null);
    return { name, ms: Math.round(ms), price: lean.price(picture), vertical: s.vertical, crossings: s.crossings, height: s.height, width: s.width, unevenness: s.unevenness, steps: s.steps, unlevel: s.unlevel,
      ranking: rankingTerms(picture.scene, picture.branches, config.returnCost), columns: picture.branches.columns.map(c => c.map(n => n.id)) };
  };
  const timed = (name: string, make: () => Picture) => { const t = performance.now(); const p = make(); return row(name, p, performance.now() - t); };
  const firstPicture = lean.first();
  const first = timed(`first (${firstPicture.start})`, () => lean.first());
  const rows = [first];
  for (let seed = 1; seed <= Number(countArg); seed++) rows.push(timed(`seed ${seed}`, () => lean.seed(seed)));
  for (const sweeps of [8, 16, 32]) rows.push(timed(`first, ${sweeps} sweeps`, () => lean.first(sweeps)));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(rows));
  const seeds = rows.filter(r => r.name.startsWith("seed "));
  const best = seeds.reduce((a, b) => (b.price < a.price ? b : a));
  const pct = (price: number): string => `${(100 * (price - first.price) / first.price).toFixed(2)} %`;
  console.log(`${scopeKey}: first ${first.price} (${first.name}); best of ${seeds.length} seeds ${best.name} ${best.price} (${pct(best.price)}); seeds cheaper than the first: ${seeds.filter(r => r.price < first.price).length}`);
  for (const r of [first, best, ...rows.filter(r => r.name.includes("sweeps"))]) {
    const diff = TERMS.map(k => `${k} ${r[k] - first[k]}`).join(", ");
    const changed = r.columns.map((column, c) => (JSON.stringify(column) === JSON.stringify(first.columns[c]) ? null : c)).filter(c => c !== null);
    console.log(`  ${r.name}: ${r.price} (${pct(r.price)}), ${r.ms} ms; against the first: ${diff}; columns ordered otherwise: ${changed.join(" ") || "none"} of ${r.columns.length}`);
  }
}

main().catch(error => { console.error(error); process.exit(1); });
