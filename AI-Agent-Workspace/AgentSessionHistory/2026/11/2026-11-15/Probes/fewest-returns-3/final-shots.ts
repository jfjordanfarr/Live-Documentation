// The last sitting's pictures and times. Each picture opened alone at 1440 by 900 twice on this build: as first drawn
// (the search off) and as the search leaves it (the page's default tuning), each after Fit, with what the page says it
// drew backward and what the search did with the cycle; side by side on sheets. Then the first draw's time of two
// pictures on this build and on main's, the search off.
import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { localMapSettled, localMapStill } from "../../../../tests/e2e/still-picture";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";

const [buildDir, mainDir, outDir] = process.argv.slice(2);
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const pictures = ["packages/engine/src/live-docs/adapters/index.ts", "packages/engine/src/live-docs/adapters/go.ts", "packages/explorer/src/client/views/localView/branch-renderer.ts",
  "packages/engine/src/live-docs/adapters/manifest.ts", "packages/engine/src/live-docs/core.ts", "packages/engine/src/live-docs/adapters/powershell.ts",
  "packages/explorer/src/client/views/localView/branches.ts", "packages/explorer/src/client/views/localView/branch-scene.ts"];
const slug = (id: string): string => id.split("/").slice(-1)[0].replace(/\.\w+$/u, "");

async function serve(page: Page, dir: string): Promise<void> {
  await page.route(`${ORIGIN}/**`, async route => {
    let file = path.join(dir, decodeURIComponent(new URL(route.request().url()).pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { await route.fulfill({ status: 404, body: "" }); return; }
    await route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] ?? "application/octet-stream" });
  });
}

async function open(browser: import("@playwright/test").Browser, dir: string, file: string, localMap: Record<string, number>): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await serve(page, dir);
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap } }) });
  await page.goto(`${ORIGIN}/?view=local&node=${encodeURIComponent(file)}`);
  await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
  return page;
}

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const log: string[] = [];
  try {
    for (const file of pictures) {
      for (const [label, localMap] of [["first", { searchStarts: 0 }], ["searched", { searchStarts: 4, searchPatience: 4 }]] as const) {
        const page = await open(browser, buildDir, file, localMap);
        const started = Date.now();
        // The search waits while files only are shown when zoomed out fully: zoom in until the rows return.
        for (let press = 0; press < 8 && await page.evaluate(() => document.querySelector("#map-container")!.hasAttribute("data-overview-files")); press++) {
          await page.evaluate(() => document.querySelector<HTMLElement>('#controls [aria-label="Zoom In"]')!.click());
          await page.waitForTimeout(600);
        }
        let settledMs = -1;
        try {
          await localMapSettled(page, 240_000);
          await localMapStill(page);
          settledMs = Date.now() - started;
        } catch {
          log.push(`${label} ${file}: the search had not settled after 240 s`);
        }
        await page.getByRole("button", { name: "Fit current scope" }).click();
        await page.waitForTimeout(400);
        await localMapStill(page);
        const read = await page.evaluate(() => {
          const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
          return { drawn: Number(document.querySelector<HTMLElement>("#map-connections")?.dataset.backwardConnections ?? 0), tried: root.dataset.searchCycleTried, adopted: root.dataset.searchCycleAdopted,
            start: root.dataset.orderStart, seeds: root.dataset.searchTried };
        });
        await page.screenshot({ path: path.join(outDir, `${label}-${slug(file)}.png`), clip: { x: 262, y: 50, width: 1178, height: 780 } });
        log.push(`${label} ${file}: drawn ${read.drawn}, cycle trials ${read.tried ?? "-"}, adopted ${read.adopted ?? "-"}, start ${read.start}, seeds tried ${read.seeds}, settled after ${settledMs} ms`);
        console.log(log[log.length - 1]);
        await page.close();
      }
    }
    // The first draw's own time, the search off, on this build and on main's.
    for (const file of ["packages/explorer/src/client/views/localView/branch-renderer.ts", "packages/explorer/src/client/views/localView/branches.ts"]) {
      for (const [label, dir] of [["this build", buildDir], ["main", mainDir]] as const) {
        const times: number[] = [];
        for (let run = 0; run < 3; run++) {
          const page = await open(browser, dir, file, { searchStarts: 0 });
          await localMapSettled(page, 60_000);
          times.push(Number(await page.evaluate(() => document.querySelector<HTMLElement>("#map-container .local-placed")!.dataset.layoutMs)));
          await page.close();
        }
        log.push(`first draw ${slug(file)} on ${label}: ${times.join(", ")} ms`);
        console.log(log[log.length - 1]);
      }
    }
    const sheet = await browser.newPage({ viewport: { width: 1200, height: 840 } });
    for (let i = 0; i < pictures.length; i += 2) {
      const pair = pictures.slice(i, i + 2);
      const img = (label: string, id: string): string => `<img src="data:image/png;base64,${fs.readFileSync(path.join(outDir, `${label}-${slug(id)}.png`)).toString("base64")}">`;
      await sheet.setContent(`<style>body{margin:0;background:#111;color:#ddd;font:13px sans-serif}div.row{display:flex;gap:6px;padding:2px}img{width:589px;height:390px}p{margin:2px 4px}</style>` +
        pair.map(id => `<p>${id}: first drawn left, as the search leaves it right</p><div class="row">${img("first", id)}${img("searched", id)}</div>`).join(""));
      await sheet.screenshot({ path: path.join(outDir, `sheet-${String(i / 2 + 1).padStart(2, "0")}.png`), fullPage: true });
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(outDir, "log.txt"), log.join("\n") + "\n");
  }
}
void main();
