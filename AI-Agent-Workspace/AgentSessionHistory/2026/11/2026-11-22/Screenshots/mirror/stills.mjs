// Matched pairs of the 2D Local Map as laid out and mirrored, with a geometric check of the reflection.
// usage, from the repository root after `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`:
//   node scripts/browser-lane.mjs --label mirror -- node <this file> dist/explorer <folder for the pictures> [part of one pair's name]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [site, out, only] = process.argv.slice(2);
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
  ["pathfind", "/?view=local&node=packages/explorer/src/client/pathfind.ts"],
  ["config-78-neighbours", "/?view=local&node=packages/engine/src/config/liveDocumentationConfig.ts"],
  ["branch-renderer-returning", "/?view=local&node=packages/explorer/src/client/views/localView/branch-renderer.ts"],
  ["opened-directory-doc-tools", "/?view=local&dir=scripts/doc-tools"],
  ["estate-payment-hub", "/samples/estate/?view=local&node=Hub/PaymentHub.cs"]
].filter(([name]) => !only || name.includes(only));

const browser = await chromium.launch();
const read = page => page.evaluate(() => {
  const box = element => { const r = element.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const cards = [...document.querySelectorAll("#map-container .node-card[data-id]")].map(card => ({ id: card.dataset.id, ...box(card) }));
  const dots = [...document.querySelectorAll("#map-container .symbol-anchor")].filter(dot => dot.getBoundingClientRect().width > 0 && getComputedStyle(dot).visibility !== "hidden").map(dot => {
    const card = dot.closest(".node-card"), c = card.getBoundingClientRect(), d = dot.getBoundingClientRect();
    return { side: dot.classList.contains("inbound") ? "inbound" : "outbound", rightHalf: d.left + d.width / 2 > c.left + c.width / 2 };
  });
  const wires = [...document.querySelectorAll("#map-connections path.connection-path")].map(path => {
    const total = path.getTotalLength(), m = path.getScreenCTM();
    const at = t => { const p = path.getPointAtLength(t).matrixTransform(m); return [p.x, p.y]; };
    return { key: path.dataset.connectionKey, from: at(0), to: at(total) };
  });
  const labels = [...document.querySelectorAll("#map-container .local-directory-label")].map(label => ({ text: label.textContent.trim().slice(0, 40), ...box(label) }));
  const view = document.getElementById("view-map").getBoundingClientRect();
  return { cards, dots, wires, labels, view: { x: view.left, w: view.width }, key: document.querySelector("#local-legend .legend-row--roles")?.title, reads: document.getElementById("map-viewport").getAttribute("data-reads") };
});
const report = [];
for (const [name, address] of subjects) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 } } })));
  await page.goto(base + address);
  await page.waitForSelector("#map-container .node-card, #map-container .local-directory-band", { timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(out, `${name}-as-laid-out.png`) });
  const before = await read(page);
  const button = page.getByRole("button", { name: "Mirror the map" });
  const hidden = await button.isHidden();
  if (!hidden) await button.click();
  await page.waitForTimeout(1200);
  await page.mouse.move(640, 790);
  await page.screenshot({ path: path.join(out, `${name}-mirrored.png`) });
  const after = await read(page);
  // The reflection: one axis c such that every card's centre obeys x' = 2c - x, with y and size unchanged.
  const byId = new Map(after.cards.map(card => [card.id, card]));
  const axes = before.cards.filter(card => byId.has(card.id)).map(card => (card.x + card.w / 2 + byId.get(card.id).x + byId.get(card.id).w / 2) / 2);
  const axis = axes.length ? axes.reduce((a, b) => a + b, 0) / axes.length : NaN;
  const worst = Math.max(0, ...axes.map(each => Math.abs(each - axis)));
  const moved = Math.max(0, ...before.cards.filter(card => byId.has(card.id)).map(card => Math.max(Math.abs(card.y - byId.get(card.id).y), Math.abs(card.w - byId.get(card.id).w), Math.abs(card.h - byId.get(card.id).h))));
  const wiresAfter = new Map(after.wires.map(wire => [wire.key, wire]));
  const wireWorst = Math.max(0, ...before.wires.filter(wire => wiresAfter.has(wire.key)).flatMap(wire => {
    const other = wiresAfter.get(wire.key);
    return [Math.abs(wire.from[0] + other.from[0] - 2 * axis), Math.abs(wire.to[0] + other.to[0] - 2 * axis), Math.abs(wire.from[1] - other.from[1]), Math.abs(wire.to[1] - other.to[1])];
  }));
  const sides = reading => ({ inboundRight: reading.dots.filter(dot => dot.side === "inbound" && dot.rightHalf).length, inboundLeft: reading.dots.filter(dot => dot.side === "inbound" && !dot.rightHalf).length,
    outboundRight: reading.dots.filter(dot => dot.side === "outbound" && dot.rightHalf).length, outboundLeft: reading.dots.filter(dot => dot.side === "outbound" && !dot.rightHalf).length });
  report.push({ name, buttonHidden: hidden, readsAfter: after.reads, cards: before.cards.length, cardsAfter: after.cards.length, axis: Math.round(axis), axisSpreadPx: +worst.toFixed(2), otherChangePx: +moved.toFixed(2),
    wires: before.wires.length, wiresAfter: after.wires.length, wireEndsOffMirrorPx: +wireWorst.toFixed(2), dotsBefore: sides(before), dotsAfter: sides(after), keyAfter: after.key, errors });
  await context.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(report, null, 1));
