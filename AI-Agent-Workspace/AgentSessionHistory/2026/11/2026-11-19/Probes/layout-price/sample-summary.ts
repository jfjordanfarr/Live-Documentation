/**
 * The sample's table: for each captured map, whether the lab's first picture is the page's (placement measure, width,
 * height), its cards, and from `first-order.ts`'s output how much the best of its eighty orders beats the first and how
 * many orders do; with a second output folder, what another rule for the first order gives against today's first.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <capture dir> <first-order out dir> [other rule's out dir]
 */
import * as fs from "node:fs";
import path from "node:path";

import { readCaptureFile } from "../../../../../../../scripts/layout-lab/capture";
import { baselineConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, type ScopeRun } from "../../../../../../../scripts/layout-lab/scopes";
import { Lean } from "./lean";

type Row = { name: string; price: number };

async function main(): Promise<void> {
  const [caps, outs, other] = process.argv.slice(2);
  for (const file of fs.readdirSync(caps).filter(f => f.startsWith("capture-")).sort()) {
    const name = path.basename(file, ".json");
    const priced = path.join(outs, `${name}.json`);
    if (!fs.existsSync(priced)) { console.log(`${name}: not priced`); continue; }
    const capture = await readCaptureFile(path.join(caps, file));
    const run = { bundle: capture.bundle, base: capture.base, scopeName: capture.scopeName, scope: capture.files, subject: capture.subject } as ScopeRun;
    const first = new Lean(capture, await loadBundleGraph(run), run, baselineConfig()).first();
    const same = first.scene.placement.cost === capture.truth.placementCost && first.scene.pictureWidth === capture.truth.pictureWidth && first.scene.pictureHeight === capture.truth.pictureHeight;
    const rows = JSON.parse(fs.readFileSync(priced, "utf8")) as Row[];
    const base = rows[0].price;
    const seeds = rows.filter(r => r.name.startsWith("seed "));
    const best = seeds.reduce((a, b) => (b.price < a.price ? b : a));
    const better = seeds.filter(r => r.price < base);
    const big = seeds.filter(r => r.price < base * 0.99);
    let rule = "";
    if (other && fs.existsSync(path.join(other, `${name}.json`))) {
      const alt = (JSON.parse(fs.readFileSync(path.join(other, `${name}.json`), "utf8")) as Row[])[0].price;
      rule = `; the other rule's first ${(100 * (alt - base) / base).toFixed(2)} %`;
    }
    console.log(`${name}: ${capture.scopeName}, ${Object.keys(capture.cards).length} cards; lab's first ${same ? "is the page's" : `differs from the page's (placement ${first.scene.placement.cost} against ${capture.truth.placementCost}, ${first.scene.pictureWidth} × ${first.scene.pictureHeight} against ${capture.truth.pictureWidth} × ${capture.truth.pictureHeight})`}; best of 80 ${(100 * (best.price - base) / base).toFixed(2)} % (${best.name}); ${better.length} orders better, ${big.length} by more than 1 %${rule}`);
  }
}

main().catch(error => { console.error(error); process.exit(1); });
