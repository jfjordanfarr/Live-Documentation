// How long this repository's heaviest file takes to show its first 2D picture, on several builds of the same day:
// from the navigation to `#map-container .local-placed` being visible, which is the first line of the case
// "a direct file link starts in the directory-aware layout: /" (tests/e2e/local-map-path.spec.ts), whose limit is 5 s.
// Each build is served from its own folder; the runs are interleaved, one of each build in turn, so that the machine's
// load of the moment falls on all of them alike. The suite's stilled search is remembered, as in the suite.
// usage: node scripts/browser-lane.mjs --label <who> -- node <this file> <runs> <name>=<site folder> [<name>=<site folder> ...]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const [runs, ...builds] = process.argv.slice(2);
const FILE = "packages/explorer/src/client/index.ts";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const serve = site => new Promise(resolve => {
  const server = http.createServer((req, res) => {
    let file = path.join(site, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(0, "127.0.0.1", () => resolve(server));
});
const sites = [];
for (const build of builds) {
  const [name, folder] = build.split("=");
  sites.push({ name, server: await serve(folder), ms: [], facts: null });
}
const browser = await chromium.launch();
for (let run = 0; run < Number(runs); run++) {
  for (const site of sites) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 } } })));
    const started = Date.now();
    await page.goto(`http://127.0.0.1:${site.server.address().port}/?view=local&node=${encodeURIComponent(FILE)}`);
    await page.waitForSelector("#map-container .local-placed", { state: "visible", timeout: 120000 });
    site.ms.push(Date.now() - started);
    site.facts ??= await page.evaluate(() => ({ cards: document.querySelectorAll("#map-container .node-card").length, rows: document.querySelectorAll("#map-container .symbol-row").length, files: document.getElementById("stats-line")?.textContent ?? "" }));
    await context.close();
  }
}
await browser.close();
for (const site of sites) site.server.close();
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
console.log(JSON.stringify({ load: os.loadavg().map(value => Math.round(value * 10) / 10), builds: sites.map(site => ({ build: site.name, ms: site.ms, median: median(site.ms), least: Math.min(...site.ms), most: Math.max(...site.ms), over5s: site.ms.filter(ms => ms > 5000).length, ...site.facts })) }, null, 1));
