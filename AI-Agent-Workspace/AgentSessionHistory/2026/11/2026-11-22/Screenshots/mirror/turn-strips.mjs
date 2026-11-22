// The mirror's motion, frame by frame and by its cost.
// Strips: for each form of Tuning's Mirror Turn, on each picture, the page's clock is taken by hand, the mirror button
// is pressed, and the motion is stepped to fixed shares of its length, a picture at each, set side by side in one strip.
// Cost: on the heavy subject the motion runs on the real clock, at full speed and with the processor slowed four times,
// and the frames the page drew while it ran are counted, with the longest.
// usage, from the repository root after `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`:
//   node scripts/browser-lane.mjs --label mirror -- node <this file> dist/explorer <folder for the pictures> [strips|cost] [part of a name] [card]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [site, out, what = "strips", only] = process.argv.slice(2);
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
// `card` as the last word composites the page on the graphics card, as a person's browser does, where the container
// was given one (the suite's own launch keeps compositing on the processor; tests/e2e/browser-launch.ts says why).
const onCard = process.argv.includes("card");
const browser = await chromium.launch(onCard ? { args: ["--use-angle=gl-egl", "--enable-gpu-rasterization"],
  env: { ...process.env, GALLIUM_DRIVER: "d3d12", LD_LIBRARY_PATH: ["/usr/lib/wsl/lib", process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") } } : {});
const DURATION = 620;
const SHARES = [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9];

const pictures = [
  ["pathfind-focused", "/?view=local&node=packages/explorer/src/client/pathfind.ts"],
  ["doc-tools-none-focused", "/?view=local&dir=scripts/doc-tools"],
  ["config-heavy-focused", "/?view=local&node=packages/engine/src/config/liveDocumentationConfig.ts"],
  ["client-directory-heavy-none-focused", "/?view=local&dir=packages/explorer/src/client"],
  ["estate-hub-focused", "/samples/estate/?view=local&node=Hub/PaymentHub.cs"],
  ["estate-hub-directory-none-focused", "/samples/estate/?view=local&dir=Hub"]
].filter(([name]) => !only || name.includes(only));

async function open(address, form, reduced = false) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.addInitScript(form => localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, mirrorTurn: form } } })), form);
  await page.goto(base + address);
  await page.waitForSelector("#map-container .node-card, #map-container .local-directory-band", { timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.mouse.move(640, 795);
  return { context, page, errors };
}

const report = [];
if (what === "strips") {
  for (const [name, address] of pictures) {
    for (const form of ["turn", "slide", "cut"]) {
      if (form === "cut" && name !== "pathfind-focused") continue;
      const { context, page, errors } = await open(address, form);
      // The page's clock by hand: every frame it asks for waits for a tick, and a tick moves the clock.
      await page.evaluate(() => {
        let now = performance.now();
        const queue = [];
        performance.now = () => now;
        window.requestAnimationFrame = callback => { queue.push(callback); return queue.length; };
        window.cancelAnimationFrame = () => {};
        window.tickTo = at => { now = at; for (const callback of queue.splice(0)) callback(now); };
        window.clockNow = () => now;
      });
      const frames = [];
      const start = await page.evaluate(() => window.clockNow());
      await page.getByRole("button", { name: "Mirror the map" }).click();
      const states = [];
      if (form === "cut") {
        for (let frame = 0; frame < 6; frame++) { await page.waitForTimeout(30); frames.push(await page.screenshot()); }
      } else {
        for (const share of SHARES) {
          await page.evaluate(at => window.tickTo(at), start + share * DURATION);
          await page.waitForTimeout(60);
          states.push(await page.evaluate(() => ({ turning: document.getElementById("map-viewport").getAttribute("data-turning"), reads: document.getElementById("map-viewport").getAttribute("data-reads"), angle: document.getElementById("map-viewport").style.getPropertyValue("--mirror-turn") })));
          frames.push(await page.screenshot());
        }
        await page.evaluate(at => { window.tickTo(at); window.tickTo(at + 20); }, start + DURATION + 5);
        await page.waitForTimeout(200);
      }
      const rest = await page.evaluate(() => ({ turning: document.getElementById("map-viewport").getAttribute("data-turning"), reads: document.getElementById("map-viewport").getAttribute("data-reads") }));
      const sheet = await context.newPage();
      await sheet.setViewportSize({ width: 4 * 644, height: 2 * 404 });
      await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,640px);gap:4px">${frames.map(frame => `<img width="640" height="400" src="data:image/png;base64,${frame.toString("base64")}">`).join("")}</body>`);
      await sheet.screenshot({ path: path.join(out, `strip-${form}-${name}.png`) });
      report.push({ strip: `strip-${form}-${name}.png`, states: states.map(state => `${state.angle}/${state.reads ?? "laid out"}`).join(" "), rest, errors });
      await context.close();
    }
  }
} else {
  for (const rate of [1, 4]) {
    for (const form of ["turn", "slide", "cut"]) {
      const { context, page, errors } = await open("/?view=local&node=packages/engine/src/config/liveDocumentationConfig.ts", form);
      const session = await context.newCDPSession(page);
      await session.send("Performance.enable");
      // Where the page's main thread spent the motion: the browser's own counters, read before and after.
      const counters = async () => Object.fromEntries((await session.send("Performance.getMetrics")).metrics.map(metric => [metric.name, metric.value]));
      await session.send("Emulation.setCPUThrottlingRate", { rate });
      await page.waitForTimeout(500);
      const result = { rate, form, runs: [] };
      for (const direction of ["to mirrored", "back"]) {
        const was = await counters();
        const run = await page.evaluate(() => new Promise(resolve => {
          const layer = document.getElementById("map-viewport");
          const stamps = [];
          let seen = false, quiet = 0;
          const moving = () => layer.hasAttribute("data-turning") || layer.getAnimations().length > 0;
          const watch = now => {
            if (moving()) { seen = true; quiet = 0; stamps.push(now); }
            else if (seen) { stamps.push(now); if (++quiet > 2) { const gaps = stamps.slice(1).map((stamp, i) => stamp - stamps[i]); resolve({ frames: gaps.length, ms: Math.round(stamps[stamps.length - 1] - stamps[0]), longest: Math.round(Math.max(...gaps)), over50: gaps.filter(gap => gap > 50).length }); return; } }
            requestAnimationFrame(watch);
          };
          requestAnimationFrame(watch);
          document.querySelector('button[aria-label="Mirror the map"]').click();
        }));
        const is = await counters();
        const spent = name => Math.round((is[name] - was[name]) * 1000);
        result.runs.push({ direction, ...run, mainThreadMs: { script: spent("ScriptDuration"), style: spent("RecalcStyleDuration"), layout: spent("LayoutDuration"), task: spent("TaskDuration") },
          styleRecalcs: is.RecalcStyleCount - was.RecalcStyleCount, layouts: is.LayoutCount - was.LayoutCount });
        await page.waitForTimeout(600);
      }
      result.gpu = onCard ? await page.evaluate(() => { const gl = document.createElement("canvas").getContext("webgl"); const info = gl?.getExtension("WEBGL_debug_renderer_info"); return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "none"; }) : "processor";
      result.cards = await page.evaluate(() => document.querySelectorAll("#map-container .node-card").length);
      result.wires = await page.evaluate(() => document.querySelectorAll("#map-connections path.connection-path").length);
      result.errors = errors;
      report.push(result);
      await context.close();
    }
  }
}
await browser.close();
server.close();
console.log(JSON.stringify(report, null, 1));
