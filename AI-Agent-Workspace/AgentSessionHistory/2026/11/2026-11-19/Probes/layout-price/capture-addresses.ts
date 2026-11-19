/**
 * Captures the page's cards at any address of a built bundle, as the layout lab's `capture` does at a deck scope's pins:
 * one browser, the search off (Tuning's defaults otherwise), each address opened fresh and read by the lab's own
 * `captureFromPage`. Prints each address's decoded state (subject, pins, opened directories), which `lean.ts` needs to
 * build the exploration the page built. Run it through the browser lane.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <out dir> <name>=<bundle>|<base>|<address> ...
 */
import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import path from "node:path";

import { decompressSnapshot } from "../../../../../../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../../../../packages/explorer/src/client/persistence/local-storage";
import { captureFromPage, writeCapture } from "../../../../../../../scripts/layout-lab/capture";
import { ORIGIN, serveBundle } from "../../../../../../../scripts/layout-lab/scopes";

async function main(): Promise<void> {
  const [out, ...specs] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const spec of specs) {
      const name = spec.slice(0, spec.indexOf("=")), rest = spec.slice(spec.indexOf("=") + 1);
      const [bundle, base, address] = rest.split("|");
      const params = new URL(`${ORIGIN}${address}`).searchParams;
      const state = params.get("s") ? decompressSnapshot(params.get("s")!) : null;
      const subject = state?.selectedNodeId ?? params.get("node");
      const pins = state?.pinSet.entries ?? [];
      const open = [...(state?.openDirectories ?? [])];
      console.log(`${name}: subject ${subject}; pins ${JSON.stringify(pins)}; opened ${JSON.stringify(open)}`);
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await serveBundle(page);
      await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
      await page.goto(`${ORIGIN}${address}`);
      const capture = await captureFromPage(page, { bundle, base, scopeName: name, scope: pins.map(pin => pin.nodeId), subject: subject ?? "" } as never);
      await writeCapture({ ...capture, address, state: { subject, pins, open } } as never, path.join(out, `capture-${name}.json`));
      console.log(`${name}: ${Object.keys(capture.cards).length} cards; placement ${capture.truth.placementCost}, ${capture.truth.pictureWidth} × ${capture.truth.pictureHeight}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exit(1); });
