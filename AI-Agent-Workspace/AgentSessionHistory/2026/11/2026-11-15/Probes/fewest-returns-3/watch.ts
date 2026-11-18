// adapters/index.ts arriving with the default search on (no tuning seeded), each build in turn: the search's status,
// counts and the look every three seconds until it has settled twice or 150 s have passed.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [out, ...specs] = process.argv.slice(2);
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const FILE = "packages/engine/src/live-docs/adapters/index.ts";

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const watch: Record<string, unknown[]> = {};
  try {
    for (const [name, dir] of specs.map(spec => spec.split("="))) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.route(`${ORIGIN}/**`, async route => {
        let file = path.join(dir, decodeURIComponent(new URL(route.request().url()).pathname));
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
        if (!fs.existsSync(file)) { await route.fulfill({ status: 404, body: "" }); return; }
        await route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] ?? "application/octet-stream" });
      });
      await page.goto(`${ORIGIN}/?view=local&node=${encodeURIComponent(FILE)}`);
      await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
      const samples: unknown[] = [];
      const started = Date.now();
      let quiet = 0;
      while (Date.now() - started < 150_000) {
        const sample = await page.evaluate(() => {
          const map = document.querySelector<HTMLElement>("#map-container")!, root = map.querySelector<HTMLElement>(".local-placed")!;
          return { status: root.dataset.searchStatus, tried: root.dataset.searchTried, next: root.dataset.searchNext, adopted: root.dataset.searchAdopted,
            alignTried: root.dataset.searchAlignmentTried, cycleTried: root.dataset.searchCycleTried, cycleAdopted: root.dataset.searchCycleAdopted,
            endpoints: root.dataset.searchEndpoints, look: map.dataset.look, filesOnly: map.hasAttribute("data-overview-files"),
            backward: document.querySelector<HTMLElement>("#map-connections")?.dataset.backwardConnections };
        });
        samples.push({ s: Math.round((Date.now() - started) / 1000), ...sample });
        if (sample.status !== "running") quiet++;
        if (quiet >= 2) break;
        await page.waitForTimeout(3000);
      }
      watch[name] = samples;
      console.log(name, JSON.stringify(samples));
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(out, JSON.stringify(watch, null, 1));
  }
}
void main();
