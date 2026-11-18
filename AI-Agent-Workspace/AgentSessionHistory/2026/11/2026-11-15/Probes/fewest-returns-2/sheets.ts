// Whole pictures (after Fit) of every changed picture in two builds, and contact sheets with each pair side by side.
// Usage: sheets.ts <list> <distA> <labelA> <distB> <labelB> <outDir>
import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { localMapStill } from "../../../../tests/e2e/still-picture";

const [listPath, distA, labelA, distB, labelB, outDir] = process.argv.slice(2);
const DIRECTORY_LINK = "/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H2nH1albUCWhAdgC6kwPAO5k6WDNQBqokAF0AvkA";
const ids = fs.readFileSync(listPath, "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") ? [match[1]] : [];
});
const ORIGIN = "http://lab.local";
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const slug = (id: string): string => id.endsWith("/") ? "localView-directory" : id.split("/").slice(-2).join("-").replace(/\.\w+$/u, "");

async function serve(page: Page, dir: string): Promise<void> {
  await page.route(`${ORIGIN}/**`, async route => {
    let file = path.join(dir, decodeURIComponent(new URL(route.request().url()).pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { await route.fulfill({ status: 404, body: "" }); return; }
    await route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] ?? "application/octet-stream" });
  });
}

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const [dir, label] of [[distA, labelA], [distB, labelB]]) {
      for (const id of ids) {
        const file = path.join(outDir, `${label}-${slug(id)}.png`);
        if (fs.existsSync(file)) continue;
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await serve(page, dir);
        await page.goto(`${ORIGIN}${id.endsWith("/") ? DIRECTORY_LINK : `/?view=local&node=${encodeURIComponent(id)}`}`);
        await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
        await localMapStill(page);
        await page.getByRole("button", { name: "Fit current scope" }).click();
        await page.waitForTimeout(400);
        await localMapStill(page);
        const backward = await page.evaluate(() => Number(document.querySelector<HTMLElement>("#map-connections")?.dataset.backwardConnections ?? 0));
        await page.screenshot({ path: file, clip: { x: 262, y: 50, width: 1178, height: 780 } });
        fs.appendFileSync(path.join(outDir, "drawn.txt"), `${label} ${id} ${backward}\n`);
        await page.close();
      }
    }
    // Two pairs to a sheet, each picture at half size, the first build on the left.
    const sheet = await browser.newPage({ viewport: { width: 1200, height: 840 } });
    for (let i = 0; i < ids.length; i += 2) {
      const pair = ids.slice(i, i + 2);
      const img = (label: string, id: string): string => `<img src="data:image/png;base64,${fs.readFileSync(path.join(outDir, `${label}-${slug(id)}.png`)).toString("base64")}">`;
      await sheet.setContent(`<style>body{margin:0;background:#111;color:#ddd;font:13px sans-serif}div.row{display:flex;gap:6px;padding:2px}img{width:589px;height:390px}p{margin:2px 4px}</style>` +
        pair.map(id => `<p>${id} — ${labelA} left, ${labelB} right</p><div class="row">${img(labelA, id)}${img(labelB, id)}</div>`).join(""));
      await sheet.screenshot({ path: path.join(outDir, `sheet-${String(i / 2 + 1).padStart(2, "0")}.png`), fullPage: true });
    }
  } finally {
    await browser.close();
  }
}
void main();
