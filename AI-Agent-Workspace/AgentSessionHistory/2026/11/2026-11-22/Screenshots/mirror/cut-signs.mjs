// The cut's signs at the edges (Tuning's Cut Counted) under the mirror: a directory too large for the view is opened
// from the engine's pathfinder, and what the signs say is read beside what the page shows, in four states: as laid
// out; mirrored and then opened; opened and then mirrored; and that last one put back. The handle is pressed by its own
// click, not the pointer, since a mirrored picture may stand it under the sidebar until the step frames it.
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
const SUBJECT = "packages/engine/src/live-docs/pathfind.ts", HISTORY = "packages/engine/src/live-docs/history";

/** What the signs say beside what the page shows: the opened directory's cards past each edge, each counted once at the edge it reaches farthest past. */
const read = page => page.evaluate(directory => {
  const label = document.querySelector(`.local-directory-label[data-directory="${directory}"]`);
  const band = label?.closest(".local-directory-band");
  if (!band) return { missing: true };
  const frame = document.querySelector(".map-cut-signs").getBoundingClientRect();
  const past = { left: 0, right: 0, top: 0, bottom: 0 };
  for (const card of band.querySelectorAll(".node-card[data-id], .local-directory-closed[data-directory]")) {
    const rect = card.getBoundingClientRect();
    const beyond = [["left", frame.left - rect.left], ["right", rect.right - frame.right], ["top", frame.top - rect.top], ["bottom", rect.bottom - frame.bottom]];
    const farthest = beyond.filter(([, by]) => by > 0.5).sort((a, b) => b[1] - a[1])[0];
    if (farthest) past[farthest[0]]++;
  }
  const signs = [...document.querySelectorAll(".map-cut-sign:not([hidden])")].map(sign => { const r = sign.getBoundingClientRect(); return { edge: sign.dataset.edge, count: Number(sign.textContent), name: sign.getAttribute("aria-label"), x: Math.round(r.left), y: Math.round(r.top) }; });
  return { shown: Object.fromEntries(Object.entries(past).filter(([, count]) => count > 0)), said: Object.fromEntries(signs.map(sign => [sign.edge, sign.count])), signs, mirrored: document.getElementById("map-viewport").hasAttribute("data-reads") };
}, HISTORY);

const report = [];
for (const order of ["as-laid-out", "mirrored-then-opened", "opened-then-mirrored"]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, step: "least", cutCounted: "on" } } })));
  await page.goto(`${base}/?view=local&node=${encodeURIComponent(SUBJECT)}`);
  await page.waitForSelector("#map-container .node-card.local-focus");
  await page.waitForTimeout(3000);
  const mirror = async () => { await page.getByRole("button", { name: "Mirror the map" }).click(); await page.waitForTimeout(1200); };
  const open = async () => { await page.getByRole("button", { name: `Open ${HISTORY}`, exact: true }).evaluate(handle => handle.click()); await page.waitForSelector(`.local-directory-label[data-directory="${HISTORY}"]`); await page.waitForTimeout(3500); };
  if (order === "mirrored-then-opened") { await mirror(); await open(); }
  else if (order === "opened-then-mirrored") { await open(); report.push({ state: "opened, before the mirror", ...(await read(page)) }); await mirror(); }
  else await open();
  await page.mouse.move(640, 795);
  await page.screenshot({ path: path.join(out, `cut-signs-${order}.png`) });
  report.push({ state: order, ...(await read(page)) });
  if (order === "opened-then-mirrored") { await mirror(); report.push({ state: "opened, mirrored, put back", ...(await read(page)) }); }
  await context.close();
}
await browser.close();
server.close();
console.log(JSON.stringify(report, null, 1));
