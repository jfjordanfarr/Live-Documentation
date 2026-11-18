// Pictures of a few files opened alone in the 2D Local Map at arrival, at 1440 by 900 with the page's default tuning,
// from the built bundle served from disk, with what the page says it draws backward.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { ORIGIN, serveBundle } from "../../../../scripts/layout-lab/scopes";
import { localMapStill } from "../../../../tests/e2e/still-picture";

const [label, outDir] = process.argv.slice(2);
const files = [
  "packages/explorer/src/client/views/localView/branch-renderer.ts",
  "packages/engine/src/live-docs/adapters/powershell.ts",
  "packages/engine/src/live-docs/core.ts",
  "packages/engine/src/live-docs/adapters/manifest.ts"
];

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const read: string[] = [];
  try {
    for (const file of files) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await serveBundle(page);
      await page.goto(`${ORIGIN}/?view=local&node=${encodeURIComponent(file)}`);
      await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
      await localMapStill(page);
      const drawn = await page.evaluate(() => ({
        overlay: Number(document.querySelector<HTMLElement>("#map-connections")?.dataset.backwardConnections ?? 0),
        cards: document.querySelectorAll("#map-container .node-card").length,
        columns: document.querySelectorAll("#map-container .local-column").length
      }));
      const name = `${label}-${path.basename(file).replace(/\.\w+$/u, "")}.png`;
      await page.screenshot({ path: path.join(outDir, name) });
      read.push(`${name}: the page draws ${drawn.overlay} returning references, ${drawn.cards} cards`);
      console.log(read[read.length - 1]);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(outDir, `${label}.txt`), read.join("\n") + "\n");
}
void main();
