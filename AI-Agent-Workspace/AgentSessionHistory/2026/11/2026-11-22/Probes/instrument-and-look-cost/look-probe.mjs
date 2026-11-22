// What a change of look costs in style on the heavy subject, on two builds measured in turn. Each run opens
// `packages/engine/src/config/liveDocumentationConfig.ts` at reading size in a fresh page of one build's site, waits for
// rest, and presses Zoom Out until the map's look is connections, the browser's timeline traced meanwhile; then presses
// Return to reading size, traced again. From each trace: every style pass (the timeline's UpdateLayoutTree) over 2 ms,
// with the elements it restyled, the largest of which is the look's own pass. The builds are run in turn, A B A B, so
// that a change in the machine's load falls on both. With `selectors`, one more run of each build is traced with the
// selector statistics, which slow the pass and so are kept out of the timed runs.
//   node scripts/browser-lane.mjs --label <who> -- node look-probe.mjs <repository> <out> <runs> <label>=<site folder> <label>=<site folder> [selectors]
import { createRequire } from "node:module";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const [repo, out, runsText, ...rest] = process.argv.slice(2);
const builds = rest.filter(arg => arg.includes("=")).map(arg => ({ label: arg.slice(0, arg.indexOf("=")), root: arg.slice(arg.indexOf("=") + 1) }));
const withSelectors = rest.includes("selectors");
const require = createRequire(path.join(repo, "package.json"));
const { chromium } = require("@playwright/test");
fs.mkdirSync(out, { recursive: true });
const KEY = "live-docs-explorer:ui:v2";
const SUBJECT = "packages/engine/src/config/liveDocumentationConfig.ts";

const serve = root => new Promise(resolve => {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" }[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(0, "127.0.0.1", () => resolve(server));
});
for (const build of builds) { build.server = await serve(build.root); build.origin = `http://127.0.0.1:${build.server.address().port}`; }

const browser = await chromium.launch();
const settledIn = page => page.waitForFunction(() => {
  const map = document.querySelector("#map-container");
  const placed = map?.querySelector(".local-placed");
  return placed && map.dataset.camera !== "moving" && placed.dataset.moving !== "true" && !map.classList.contains("local-look-fading");
}, undefined, { timeout: 120_000 });

async function run(build, selectors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value),
    { key: KEY, value: JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, arrival: "reading" } } }) });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await page.goto(`${build.origin}/?view=local&mode=2d&node=${encodeURIComponent(SUBJECT)}`);
  await page.waitForSelector("#map-container .local-placed", { timeout: 120_000 });
  await settledIn(page); await page.waitForTimeout(1000); await settledIn(page);
  const facts = await page.evaluate(() => {
    let rules = 0;
    for (const sheet of document.styleSheets) { const walk = list => { for (const rule of list) { if (rule.cssRules && !rule.selectorText) walk(rule.cssRules); else rules += 1; } }; try { walk(sheet.cssRules); } catch { /* another site's sheet */ } }
    return { mapElements: document.querySelectorAll("#map-container *").length + 1, cards: document.querySelectorAll("#map-container .node-card").length, rules, look: document.querySelector("#map-container").dataset.look };
  });
  const traced = async act => {
    const events = [];
    const collect = ({ value }) => events.push(...value);
    cdp.on("Tracing.dataCollected", collect);
    const categories = ["devtools.timeline", ...(selectors ? ["disabled-by-default-devtools.timeline", "disabled-by-default-blink.debug"] : [])];
    await cdp.send("Tracing.start", { categories: categories.join(","), transferMode: "ReportEvents" });
    await act();
    await settledIn(page); await page.waitForTimeout(800); await settledIn(page);
    const done = new Promise(resolve => cdp.once("Tracing.tracingComplete", resolve));
    await cdp.send("Tracing.end");
    await done;
    cdp.off("Tracing.dataCollected", collect);
    const passes = events.filter(e => e.name === "UpdateLayoutTree" && e.ph === "X" && e.dur > 2000)
      .map(e => ({ ms: +(e.dur / 1000).toFixed(1), elements: e.args?.elementCount ?? null })).sort((a, b) => b.ms - a.ms);
    const totals = {};
    for (const e of events.filter(e => e.name === "SelectorStats")) for (const s of e.args?.selector_stats?.selector_timings ?? []) {
      const t = totals[s.selector] ??= { ms: 0, attempts: 0, matches: 0 };
      t.ms += (s["elapsed (us)"] ?? 0) / 1000; t.attempts += s.match_attempts ?? 0; t.matches += s.match_count ?? 0;
    }
    const selectorTop = Object.entries(totals).sort((a, b) => b[1].ms - a[1].ms).slice(0, 30).map(([selector, t]) => ({ selector: selector.slice(0, 200), ms: +t.ms.toFixed(2), attempts: t.attempts, matches: t.matches }));
    return { largest: passes[0] ?? null, styleMs: +passes.reduce((sum, pass) => sum + pass.ms, 0).toFixed(1), passes: passes.slice(0, 6),
      ...(selectors ? { selectorMs: +Object.values(totals).reduce((sum, t) => sum + t.ms, 0).toFixed(1), selectorTop } : {}) };
  };
  const out = await traced(async () => {
    for (let i = 0; i < 6; i++) {
      if (await page.evaluate(() => document.querySelector("#map-container").dataset.look) === "connections") break;
      await page.click('#controls [data-zoom="out"]');
      await page.waitForTimeout(400);
    }
  });
  const lookAfter = await page.evaluate(() => document.querySelector("#map-container").dataset.look);
  const back = await traced(() => page.click('#controls [data-zoom="reset"]'));
  const lookBack = await page.evaluate(() => document.querySelector("#map-container").dataset.look);
  await context.close();
  return { build: build.label, load: os.loadavg().map(n => +n.toFixed(2)), ...facts, toConnections: out, lookAfter, toReading: back, lookBack };
}

const results = [];
for (let i = 0; i < Number(runsText); i++) for (const build of builds) {
  const result = await run(build, false);
  results.push(result);
  console.log(JSON.stringify({ run: i + 1, build: result.build, load: result.load, elements: result.mapElements, cards: result.cards, rules: result.rules,
    toConnections: result.toConnections.largest, toConnectionsStyleMs: result.toConnections.styleMs, lookAfter: result.lookAfter, toReading: result.toReading.largest, lookBack: result.lookBack }));
}
const diagnostics = [];
if (withSelectors) for (const build of builds) {
  const result = await run(build, true);
  diagnostics.push(result);
  console.log(JSON.stringify({ selectors: result.build, largest: result.toConnections.largest, selectorMs: result.toConnections.selectorMs, top: result.toConnections.selectorTop.slice(0, 12) }));
}
fs.writeFileSync(path.join(out, "look-change.json"), `${JSON.stringify({ results, diagnostics }, null, 1)}\n`);
await browser.close();
for (const build of builds) build.server.close();
