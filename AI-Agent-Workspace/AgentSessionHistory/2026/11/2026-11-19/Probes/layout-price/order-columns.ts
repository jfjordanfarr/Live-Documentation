/**
 * Two orders of one scope side by side, column by column: how many cards, how tall the column stands from its first
 * card's top to its last card's bottom, and how many of its cards keep their place in its order.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <capture.json> <bundle/scope> <seed>
 */
import { readCaptureFile } from "../../../../../../../scripts/layout-lab/capture";
import { baselineConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { findScope, loadBundleGraph } from "../../../../../../../scripts/layout-lab/scopes";
import { Lean, type Picture } from "./lean";

const [captureFile, scopeKey, seedArg] = process.argv.slice(2);

async function main(): Promise<void> {
  const run = findScope(scopeKey);
  const lean = new Lean(await readCaptureFile(captureFile), await loadBundleGraph(run), run, baselineConfig());
  const first = lean.first(), other = lean.seed(Number(seedArg));
  const stand = (p: Picture, c: number) => {
    const ids = p.branches.columns[c].map(n => n.id);
    const tops = ids.map(id => p.scene.tops.get(id)!), bottoms = ids.map(id => p.scene.tops.get(id)! + p.scene.heights.get(id)!);
    return { ids, from: Math.min(...tops), to: Math.max(...bottoms) };
  };
  console.log(`picture height: first ${first.scene.pictureHeight}, seed ${seedArg} ${other.scene.pictureHeight}`);
  first.branches.columns.forEach((_, c) => {
    const a = stand(first, c), b = stand(other, c);
    const kept = a.ids.filter((id, i) => b.ids[i] === id).length;
    console.log(`column ${c}: ${a.ids.length} cards; first stands ${a.from} to ${a.to} (${a.to - a.from} px), seed ${seedArg} ${b.from} to ${b.to} (${b.to - b.from} px); ${kept} keep their place; last card first ${a.ids[a.ids.length - 1].split("/").pop()}, seed ${b.ids[b.ids.length - 1].split("/").pop()}`);
  });
}

main().catch(error => { console.error(error); process.exit(1); });
