// The mirror's motion, frame by frame and by its cost.
// Strips: for each form of Tuning's Mirror Turn, on each picture, the mirror button is pressed and the motion's
// animations are held and set by hand to fixed shares of their length, a picture at each and one at rest, side by side
// in one strip. (The first form of the turn was stepped by the page's clock; it is animations since 2026-11-22.)
// Cost: on the heavy subject the motion runs on the real clock, at full speed and with the processor slowed four times,
// and the frames the page drew while it ran are counted, with the longest.
// usage, from the repository root after `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`:
//   node scripts/browser-lane.mjs --label mirror -- node <this file> dist/explorer <folder for the pictures> [strips|cost] [part of a name] [card]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [site, out, what = "strips", only] = process.argv.slice(2);
// A list of forms after `forms=` takes strips of those forms only, e.g. forms=turn,cut.
const onlyForms = process.argv.find(word => word.startsWith("forms="))?.slice(6).split(",") ?? null;
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
      if (onlyForms && !onlyForms.includes(form)) continue;
      const { context, page, errors } = await open(address, form);
      // The motion is animations the browser runs: they are held still and set by hand to each share of their length,
      // and the page's timers wait for the same hand, so that the pins change sides at the middle and not by the clock.
      await page.evaluate(() => {
        const timers = [];
        let now = 0;
        window.setTimeout = (callback, delay = 0) => { timers.push({ callback, at: now + delay }); return timers.length; };
        window.clearTimeout = () => {};
        window.motionTo = async at => {
          now = at;
          for (const timer of timers.splice(0)) { if (timer.at <= now) timer.callback(); else timers.push(timer); }
          const running = document.getAnimations().filter(animation => animation.effect?.target?.closest?.("#map-viewport"));
          for (const animation of running) { animation.pause(); animation.currentTime = Math.min(at, Number(animation.effect.getTiming().duration)); }
          await new Promise(requestAnimationFrame);
          return running.length;
        };
        window.motionEnd = async () => {
          for (let round = 0; round < 4; round++) {
            const running = document.getAnimations().filter(animation => animation.effect?.target?.closest?.("#map-viewport"));
            if (!running.length) break;
            for (const animation of running) animation.finish();
            await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
          }
        };
      });
      const frames = [], states = [];
      await page.getByRole("button", { name: "Mirror the map" }).click();
      const state = () => page.evaluate(() => ({ turning: document.getElementById("map-viewport").getAttribute("data-turning"), reads: document.getElementById("map-viewport").getAttribute("data-reads"),
        angle: getComputedStyle(document.querySelector("#map-container .local-layout")).rotate, animations: document.getAnimations().length }));
      if (form === "cut") {
        // Out: a third, two thirds and the whole of the fade; the picture changes; in: a third and two thirds, then rest.
        for (const at of [69, 138, 200]) { await page.evaluate(at => window.motionTo(at), at); frames.push(await page.screenshot()); }
        await page.evaluate(() => { for (const animation of document.getAnimations().filter(animation => animation.effect?.target?.closest?.("#map-viewport"))) animation.finish(); });
        await page.waitForTimeout(120);
        for (const at of [69, 138]) {
          await page.evaluate(at => { for (const animation of document.getAnimations().filter(animation => animation.effect?.target?.closest?.("#map-viewport"))) { animation.pause(); animation.currentTime = at; } }, at);
          await page.waitForTimeout(60);
          frames.push(await page.screenshot());
        }
      } else {
        for (const share of SHARES) {
          await page.evaluate(at => window.motionTo(at), share * DURATION);
          await page.waitForTimeout(60);
          const read = await state();
          states.push(`${read.angle}/${read.reads ?? "laid out"}`);
          frames.push(await page.screenshot());
        }
      }
      await page.evaluate(() => window.motionEnd());
      await page.waitForTimeout(300);
      await page.mouse.move(640, 795);
      frames.push(await page.screenshot());
      const rest = await state();
      const sheet = await context.newPage();
      await sheet.setViewportSize({ width: 4 * 644, height: 2 * 404 });
      await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,640px);gap:4px">${frames.map(frame => `<img width="640" height="400" src="data:image/png;base64,${frame.toString("base64")}">`).join("")}</body>`);
      await sheet.screenshot({ path: path.join(out, `strip-${form}-${name}.png`) });
      report.push({ strip: `strip-${form}-${name}.png`, states: states.join(" "), rest, errors });
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
          const moving = () => layer.hasAttribute("data-turning") || document.getAnimations().some(animation => animation.effect?.target?.closest?.("#map-viewport"));
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
