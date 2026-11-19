// Takes this probe's pictures of three built Explorers, in one browser hold.
//
//   node scripts/browser-lane.mjs --label scans -- node <this file> <site-a> <site-b> <site-declared> <out-dir>
//
// Each site is a folder `live-docs:visualize` wrote. They are served here on ports 8930 to 8932 by a small static
// server of this script's own, and pictured at 1440 by 900. What a person would click is clicked where the page
// says a thing stands; a wire is pinned through the page's own handle (`window.__worldMap`), since a wire's
// screen point is not offered by it.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const [siteA, siteB, siteDeclared, out] = process.argv.slice(2);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };

function serve(root, port) {
  const server = createServer(async (request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, "http://x").pathname)).replace(/^\/+/u, "");
    try {
      const body = await readFile(join(root, path === "" ? "index.html" : path));
      response.writeHead(200, { "content-type": TYPES[extname(path || "index.html")] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

const servers = await Promise.all([serve(siteA, 8930), serve(siteB, 8931), serve(siteDeclared, 8932)]);
const browser = await chromium.launch();
const notes = [];

async function open(port) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (message) => { if (message.type() === "error") notes.push(`${port} console: ${message.text()}`); });
  await page.goto(`http://127.0.0.1:${port}/?view=world`);
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 30_000 });
  await page.evaluate(() => { window.__worldMap.instant(true); window.localStorage.clear(); window.__worldMap.reset(); });
  await page.waitForTimeout(400);
  return page;
}

async function shot(page, name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${name}.png`) });
  notes.push(`${name}: ${await page.locator("#view-world .world-crumbs").innerText().catch(() => "(no crumbs)")}`);
}

// (a) The board and its configuration in the common parent.
let page = await open(8930);
await shot(page, "a-1-whole-board");
let [x, y] = await page.evaluate(() => window.__worldMap.screenPointOf("payments"));
await page.mouse.click(x, y);
await shot(page, "a-2-payments-pinned");
await page.evaluate(() => window.__worldMap.unpin());
const roads = await page.evaluate(() => window.__worldMap.roads());
notes.push(`a roads: ${roads.join(" | ")}`);
const road = roads.find((id) => id.startsWith("hub>payments")) ?? roads[0];
await page.evaluate((id) => window.__worldMap.pin("road", id), road);
await shot(page, "a-3-wire-hub-payments-pinned");
await page.evaluate(() => window.__worldMap.unpin());
[x, y] = await page.evaluate(() => window.__worldMap.screenPointOf("portal"));
await page.mouse.dblclick(x, y);
await page.waitForTimeout(2500);
await page.screenshot({ path: join(out, "a-4-portal-entered.png") });
notes.push(`a-4: url ${page.url()}`);
await page.close();

// (b) The board in a sibling maps/ folder, every From outside the workspace.
page = await open(8931);
await shot(page, "b-1-whole-board");
const wanting = page.locator("#view-world .world-crumbs .w-wanting");
if (await wanting.count()) {
  await wanting.click();
  await shot(page, "b-2-wanting-listed");
}
[x, y] = await page.evaluate(() => window.__worldMap.screenPointOf("portal"));
await page.mouse.click(0, 0);
await page.mouse.click(x, y);
await shot(page, "b-3-portal-pinned");
await page.close();

// The declared half: Oracle imagined, the linked server a door it serves.
page = await open(8932);
await shot(page, "d-1-whole-board");
[x, y] = await page.evaluate(() => window.__worldMap.screenPointOf("sqlserver"));
await page.mouse.click(x, y);
await shot(page, "d-2-sqlserver-pinned");
await page.evaluate(() => window.__worldMap.unpin());
[x, y] = await page.evaluate(() => window.__worldMap.screenPointOf("oracle"));
await page.mouse.click(x, y);
await shot(page, "d-3-oracle-pinned");
await page.close();

await browser.close();
for (const server of servers) server.close();
await writeFile(join(out, "capture-notes.txt"), `${notes.join("\n")}\n`);
console.log(notes.join("\n"));
