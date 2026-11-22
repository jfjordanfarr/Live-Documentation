// The mirrored 2D Local Map away from reading size and under the wire's panel: the far looks, a wire answering a
// rested pointer, and the type badges, each beside the same state as laid out.
// usage, from the repository root after `npm run build` and `npm run live-docs:visualize`:
//   node scripts/browser-lane.mjs --label mirror -- node <this file> dist/explorer <folder for the pictures>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [site, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  let file = path.join(site, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const report = [];

for (const mirrored of [false, true]) {
  const tag = mirrored ? "mirrored" : "as-laid-out";
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, wireAnswers: "on" } } })));
  await page.goto(`${base}/?view=local&node=packages/explorer/src/client/pathfind.ts`);
  await page.waitForSelector("#map-container .node-card");
  await page.waitForTimeout(3000);
  if (mirrored) await page.getByRole("button", { name: "Mirror the map" }).click();
  await page.waitForTimeout(800);

  // The type badges of one row, close up: the arrows and their order.
  const badges = page.locator("#map-container .node-card.local-focus .type-refs-indicator").first();
  if (await badges.count()) {
    const box = await badges.boundingBox();
    if (box) await page.screenshot({ path: path.join(out, `type-badges-${tag}.png`), clip: { x: box.x - 140, y: box.y - 12, width: 300, height: 40 } });
  }

  // A wire answering the pointer resting on it: the longest wire drawn, at its middle.
  const at = await page.evaluate(() => {
    const paths = [...document.querySelectorAll("#map-connections path.connection-path")].filter(each => each.getTotalLength() > 120);
    const view = document.getElementById("view-map").getBoundingClientRect();
    for (const each of paths) {
      const p = each.getPointAtLength(each.getTotalLength() / 2).matrixTransform(each.getScreenCTM());
      if (p.x > view.left + 60 && p.x < view.right - 60 && p.y > view.top + 80 && p.y < view.bottom - 120 && !document.elementFromPoint(p.x, p.y)?.closest(".node-card")) return { x: p.x, y: p.y };
    }
    return null;
  });
  if (at) {
    await page.mouse.move(at.x - 30, at.y - 30);
    await page.mouse.move(at.x, at.y, { steps: 6 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, `wire-answer-${tag}.png`) });
    const panel = await page.evaluate(() => {
      const panel = document.querySelector(".wire-answer, .local-wire-answer, [class*='wire-answer']");
      if (!panel) return null;
      const r = panel.getBoundingClientRect();
      return { cls: panel.className.toString(), text: (panel.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    });
    report.push({ tag, pointer: at, panel });
    await page.mouse.move(640, 795);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  // The far looks: presses of Zoom Out until the look changes, a picture at each look reached.
  const seen = new Set([await page.evaluate(() => document.getElementById("map-container").dataset.look)]);
  for (let press = 1; press <= 9; press++) {
    await page.getByRole("button", { name: "Zoom Out" }).click();
    await page.waitForTimeout(900);
    const look = await page.evaluate(() => document.getElementById("map-container").dataset.look);
    if (seen.has(look)) continue;
    seen.add(look);
    await page.mouse.move(640, 795);
    await page.screenshot({ path: path.join(out, `look-${look}-${tag}.png`) });
    report.push({ tag, look, presses: press });
  }
  // Fit, so that the whole picture and its edges are judged at the overview.
  await page.getByRole("button", { name: /Fit current scope|Follow pins/ }).click();
  await page.waitForTimeout(1500);
  await page.mouse.move(640, 795);
  await page.screenshot({ path: path.join(out, `fit-whole-${tag}.png`) });
  report.push({ tag, errors });
  await context.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(report, null, 1));
