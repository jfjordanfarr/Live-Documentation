// The Unconnected trial (Tuning → 2D Layout → Unconnected): two files pinned whole under Shown, Dimmed and Folded, and
// Folded with its count pressed, at 1,440 by 900, the suite's stilled search (`searchStarts: 0`) and nothing else
// remembered. Prints, for each picture, what the page holds: the card's rows drawn and faded, its count line, its box
// against the view, the wires drawn, and any two drawn rows of the card that overlap.
// usage, from the repository root after `npm run build` and `npm run live-docs:visualize`:
//   node scripts/browser-lane.mjs --label unconnected -- node <this file> dist/explorer <folder for the pictures>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import lzString from "lz-string";

const { compressToEncodedURIComponent } = lzString;

const [site, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".md": "text/markdown" };
const server = http.createServer((req, res) => {
  let file = path.join(site, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const subjects = [
  ["powershell-ast", "tests/integration/programs/powershell/rollout/expected/powershell-ast.json"],
  ["graph-ts", "packages/engine/src/live-docs/graph.ts"]
];
// A link that carries the 2D map's settings says its arrival too, the default when it does not name one, so the arrival
// held at reading size rides the link beside the lever rather than the stored tuning.
const address = (file, unconnected, arrival) => `/?s=${compressToEncodedURIComponent(JSON.stringify({
  v: 1, w: "map", n: file, p: [{ n: file, s: "*" }],
  ...(unconnected === "shown" && !arrival ? {} : { l: { localMap: { ...(unconnected === "shown" ? {} : { unconnected }), ...(arrival ? { arrival } : {}) } } })
}))}`;

const browser = await chromium.launch();
const read = (page, file) => page.evaluate(id => {
  const card = document.querySelector(`#map-container .node-card[data-id="${CSS.escape(id)}"]`);
  const view = document.getElementById("view-map").getBoundingClientRect();
  const rect = card.getBoundingClientRect();
  const rows = [...card.querySelectorAll(".symbol-row:not(.internals-row)")];
  const drawn = rows.filter(row => !row.classList.contains("branch-symbol-hidden") && [...row.children].some(child => child.getClientRects().length));
  const boxes = drawn.map(row => row.querySelector(".symbol-label-wrapper").getBoundingClientRect());
  let overlaps = 0;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) overlaps++;
  }
  const counts = [...card.querySelectorAll(":scope > .local-disclosure")].map(note => note.textContent.trim());
  // A card's rows inside its box: the last drawn row's bottom against the card's.
  const lastBottom = Math.max(0, ...boxes.map(box => box.bottom));
  const band = card.closest(".local-directory-band, .local-membrane-band")?.getBoundingClientRect();
  return {
    rows: rows.length, drawn: drawn.length, faded: drawn.filter(row => row.classList.contains("branch-symbol-muted")).length,
    counts, card: { top: Math.round(rect.top - view.top), bottom: Math.round(rect.bottom - view.top), height: Math.round(rect.height) },
    view: Math.round(view.height), rowsInsideCard: lastBottom <= rect.bottom + 0.5, overlaps,
    wires: document.querySelectorAll("#map-connections path.connection-path").length,
    cards: document.querySelectorAll("#map-container .node-card[data-id]").length,
    band: band ? { top: Math.round(band.top - view.top), bottom: Math.round(band.bottom - view.top) } : null,
    scale: new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")).transform).a
  };
}, file);

const report = [];
for (const [name, file] of subjects) {
  for (const choice of ["shown", "dimmed", "folded"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(String(error)));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 } } })));
    await page.goto(base + address(file, choice));
    await page.waitForSelector("#map-container .node-card", { timeout: 60000 });
    await page.waitForTimeout(4500);
    await page.mouse.move(720, 895);
    await page.screenshot({ path: path.join(out, `${name}-${choice}.png`) });
    report.push({ picture: `${name}-${choice}.png`, ...(await read(page, file)), errors });
    await context.close();
  }
  // Folded again at reading size, the arrival held there, where the card's count line is drawn and can be pressed: the
  // picture before the press, then after it, the press made from the keyboard.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 } } })));
  await page.goto(base + address(file, "folded", "reading"));
  await page.waitForSelector("#map-container .node-card", { timeout: 60000 });
  await page.waitForTimeout(4500);
  await page.mouse.move(720, 895);
  await page.screenshot({ path: path.join(out, `${name}-folded-reading-size.png`) });
  report.push({ picture: `${name}-folded-reading-size.png`, ...(await read(page, file)), errors });
  const count = page.locator(`#map-container .node-card[data-id="${file}"] > button.local-disclosure:not(.local-back-references):not([data-outside])`);
  if (await count.count()) {
    await count.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    await page.mouse.move(720, 895);
    await page.screenshot({ path: path.join(out, `${name}-folded-count-pressed.png`) });
    report.push({ picture: `${name}-folded-count-pressed.png`, ...(await read(page, file)), errors });
  }
  await context.close();
}
console.log(JSON.stringify(report, null, 1));
await browser.close();
server.close();
