/**
 * Holds a lean first picture to the page it was captured from: cards, placement measure and picture size, and the
 * cards each has that the other has not.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <capture.json> [orderStarts]
 */
import { readCaptureFile } from "../../../../../../../scripts/layout-lab/capture";
import { baselineConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, type ScopeRun } from "../../../../../../../scripts/layout-lab/scopes";
import { Lean } from "./lean";

async function main(): Promise<void> {
  const capture = await readCaptureFile(process.argv[2]);
  const run = { bundle: capture.bundle, base: capture.base, scopeName: capture.scopeName, scope: capture.files, subject: capture.subject } as ScopeRun;
  const config = { ...baselineConfig(), ...(process.argv[3] ? { orderStarts: Number(process.argv[3]) } : null) };
  const lean = new Lean(capture, await loadBundleGraph(run), run, config);
  const first = lean.first();
  const mine = [...first.scene.items.keys()], page = Object.keys(capture.cards);
  console.log(`lab: ${mine.length} cards, placement ${first.scene.placement.cost}, ${first.scene.pictureWidth} × ${first.scene.pictureHeight}, start ${first.start}`);
  console.log(`page: ${page.length} cards, placement ${capture.truth.placementCost}, ${capture.truth.pictureWidth} × ${capture.truth.pictureHeight}`);
  console.log(`only the lab: ${mine.filter(id => !page.includes(id)).join(", ") || "none"}; only the page: ${page.filter(id => !mine.includes(id)).join(", ") || "none"}`);
  console.log(`directories: ${first.scene.boxes.filter(b => b.kind === "directory").map(b => b.directory).join(", ")}`);
}

main().catch(error => { console.error(error); process.exit(1); });
