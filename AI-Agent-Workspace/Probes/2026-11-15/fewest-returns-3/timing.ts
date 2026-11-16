// The first draw's time, two builds interleaved with the order alternating each round (A B, then B A), the search off,
// the same pictures: ten draws of each picture on each build, after one unrecorded warm-up draw each.
import { chromium, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { localMapSettled } from "../../../../tests/e2e/still-picture";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";

const [out, ...specs] = process.argv.slice(2);
const builds = specs.map(spec => spec.split("=") as [string, string]);
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const pictures = ["packages/explorer/src/client/views/localView/branch-renderer.ts", "packages/explorer/src/client/views/localView/branches.ts", "packages/engine/src/live-docs/adapters/index.ts"];

async function draw(browser: Browser, dir: string, file: string): Promise<{ layoutMs: number; flowShapeMs: number | null; look: string | undefined; start: string | undefined }> {
  const page: Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route(`${ORIGIN}/**`, async route => {
    let target = path.join(dir, decodeURIComponent(new URL(route.request().url()).pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) { await route.fulfill({ status: 404, body: "" }); return; }
    await route.fulfill({ body: fs.readFileSync(target), contentType: TYPES[path.extname(target)] ?? "application/octet-stream" });
  });
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  await page.goto(`${ORIGIN}/?view=local&node=${encodeURIComponent(file)}`);
  await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
  await localMapSettled(page, 60_000);
  const read = await page.evaluate(() => {
    const map = document.querySelector<HTMLElement>("#map-container")!, root = map.querySelector<HTMLElement>(".local-placed")!;
    return { layoutMs: Number(root.dataset.layoutMs), flowShapeMs: root.dataset.flowShapeMs ? Number(root.dataset.flowShapeMs) : null, look: map.dataset.look, start: root.dataset.orderStart };
  });
  await page.close();
  return read;
}

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const timing: Record<string, Record<string, number[]>> = {};
  const looks: Record<string, Record<string, string>> = {};
  try {
    for (const file of pictures) for (const [, dir] of builds) await draw(browser, dir, file);
    for (let round = 0; round < 10; round++) {
      const order = round % 2 ? [...builds].reverse() : builds;
      for (const file of pictures) {
        for (const [name, dir] of order) {
          const read = await draw(browser, dir, file);
          ((timing[file] ??= {})[name] ??= []).push(read.layoutMs);
          (looks[file] ??= {})[name] = `${read.look} ${read.start}`;
        }
      }
      console.log("round", round + 1);
    }
  } finally {
    await browser.close();
  }
  const median = (values: number[]): number => { const sorted = [...values].sort((a, b) => a - b); return (sorted[4] + sorted[5]) / 2; };
  for (const [file, byBuild] of Object.entries(timing)) {
    console.log(file.split("/").pop(), Object.entries(byBuild).map(([name, values]) => `${name} median ${median(values)} (${Math.min(...values)}-${Math.max(...values)}) ${looks[file][name]}`).join("  |  "));
  }
  fs.writeFileSync(out, JSON.stringify({ timing, looks }, null, 1));
}
void main();
