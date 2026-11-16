// The lab against the fewest-returns page of the first milestone (built at its commit), laid out by the lab at the same
// ranking (a return cost past every picture's flip), on the pictures where the lab drifted: whether the mended rule for
// a reference end without a row of its own brings the lab to the page.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { captureFromPage } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate } from "../../../../scripts/layout-lab/evaluate";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { explorerGraphOf } from "../../../../packages/explorer/src/shared/graph";
import { localRetainUrl } from "../../../../tests/e2e/still-picture";

const [dist, ...files] = process.argv.slice(2);
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const graph = explorerGraphOf(JSON.parse(fs.readFileSync(path.join(dist, "explorer-data.json"), "utf8")).graph);

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    for (const file of files) {
      const run = { bundle: "repository" as const, base: "/", scopeName: file, scope: [file], subject: file };
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      await page.route(`${ORIGIN}/**`, async route => {
        const name = new URL(route.request().url()).pathname;
        if (name.includes("/__pretext/")) { await route.fallback(); return; }
        let target = path.join(dist, decodeURIComponent(name));
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
        if (!fs.existsSync(target)) { await route.fulfill({ status: 404, body: "" }); return; }
        await route.fulfill({ body: fs.readFileSync(target), contentType: TYPES[path.extname(target)] ?? "application/octet-stream" });
      });
      await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
      await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
      const capture = await captureFromPage(page, run);
      const evaluation = evaluate(capture, graph, run, { ...baselineConfig(), returnCost: 1000 });
      console.log(file.split("/").pop(), "warnings", capture.warnings.length, "drift", JSON.stringify(driftOf(capture, evaluation)));
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main();
