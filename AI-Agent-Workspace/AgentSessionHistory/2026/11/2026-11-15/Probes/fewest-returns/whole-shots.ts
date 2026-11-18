// The whole picture of a few files opened alone, after the Fit control, at 1440 by 900 with the page's default tuning,
// from a built bundle in a directory of our choosing, served from disk.
import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { localMapStill } from "../../../../tests/e2e/still-picture";

const [label, distDir, outDir] = process.argv.slice(2);
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const files = [
  "packages/explorer/src/client/views/localView/branch-renderer.ts",
  "packages/engine/src/live-docs/adapters/powershell.ts",
  "packages/engine/src/live-docs/core.ts",
  "packages/engine/src/live-docs/adapters/manifest.ts"
];

async function serve(page: Page): Promise<void> {
  await page.route(`${ORIGIN}/**`, async route => {
    let file = path.join(distDir, decodeURIComponent(new URL(route.request().url()).pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { await route.fulfill({ status: 404, body: "" }); return; }
    await route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] ?? "application/octet-stream" });
  });
}

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const file of files) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await serve(page);
      await page.goto(`${ORIGIN}/?view=local&node=${encodeURIComponent(file)}`);
      await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
      await localMapStill(page);
      await page.getByRole("button", { name: "Fit current scope" }).click();
      await page.waitForTimeout(400);
      await localMapStill(page);
      const name = `${label}-whole-${path.basename(file).replace(/\.\w+$/u, "")}.png`;
      await page.screenshot({ path: path.join(outDir, name) });
      console.log(name);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main();
