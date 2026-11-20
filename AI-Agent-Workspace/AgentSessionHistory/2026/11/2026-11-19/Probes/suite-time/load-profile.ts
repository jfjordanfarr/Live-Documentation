/**
 * The page's load and first picture, measured from outside as the browser suite opens it: the same launch (the card
 * for WebGL where the container has one), the same window and the same saved tuning (`searchStarts: 0`), unless a
 * scenario says otherwise. For each scenario, `--runs` clean loads (a long-task observer and a frame watcher only),
 * then, with `--profile`, one load under a Chrome trace and the V8 sampling profiler, analysed by `load-analyse.ts`.
 *
 *   npx tsx --tsconfig tsconfig.base.json <this file> --port 18931 --runs 3 --out /tmp/claude-1000/st/load [--profile] [--only repo-2d,estate-2d]
 *
 * Serves `dist/explorer` itself on the given port; run it inside the browser lane, after `npm run e2e:bundles`.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium, devices, type Page } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../../../../packages/explorer/src/client/persistence/local-storage";
import { browserLaunchOptions } from "../../../../../../../tests/e2e/browser-launch";

const ROOT = path.resolve(__dirname, "../../../../../../..");
const arg = (name: string, fallback?: string): string | undefined => {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : fallback;
};
const PORT = Number(arg("port", "18931"));
const RUNS = Number(arg("runs", "3"));
const OUT = path.resolve(arg("out", "/tmp/claude-1000/st/load")!);
const PROFILE = process.argv.includes("--profile");
const ONLY = arg("only")?.split(",");

/** `auto` watches for both pictures and takes whichever comes to rest first (an address that names no mode). */
interface Scenario { name: string; address: string; mode: "2d" | "3d" | "auto"; searchStarts?: number }
const SCENARIOS: Scenario[] = [
  { name: "repo-2d", address: "/?view=local&mode=2d&node=packages%2Fgenerator%2Fsrc%2Fgenerator.ts", mode: "2d" },
  { name: "estate-2d", address: "/samples/estate/?view=local&mode=2d&node=PaymentService%2FPaymentService.cs", mode: "2d" },
  { name: "repo-3d", address: "/?view=local&mode=3d&node=packages%2Fgenerator%2Fsrc%2Fgenerator.ts", mode: "3d" },
  { name: "estate-3d", address: "/samples/estate/?view=local&mode=3d&node=Portal%2FServices%2FGatewayClient.cs", mode: "3d" },
  // The product's own default tuning: the continuing search runs after the first picture.
  { name: "repo-2d-search", address: "/?view=local&mode=2d&node=packages%2Fgenerator%2Fsrc%2Fgenerator.ts", mode: "2d", searchStarts: 32 },
  { name: "estate-2d-search", address: "/samples/estate/?view=local&mode=2d&node=PaymentService%2FPaymentService.cs", mode: "2d", searchStarts: 32 }
];
// `--urls <file>`: other addresses, one a line as `name<TAB>address<TAB>2d|3d` (the sample of cases' first pages).
const URLS = arg("urls");
if (URLS) {
  SCENARIOS.length = 0;
  for (const line of fs.readFileSync(URLS, "utf8").split("\n").filter(Boolean)) {
    const [name, address, mode] = line.split("\t");
    SCENARIOS.push({ name, address, mode: mode === "3d" || mode === "2d" ? mode : "auto" });
  }
}

/** Runs in the page before its own script: long tasks, and the moments the picture appears, settles and rests. */
function watcher(mode: "2d" | "3d" | "auto"): void {
  const w = window as unknown as { __probe: Record<string, unknown> };
  const probe: Record<string, unknown> = { longTasks: [] as Array<{ start: number; duration: number }> };
  w.__probe = probe;
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) (probe.longTasks as Array<{ start: number; duration: number }>).push({ start: entry.startTime, duration: entry.duration });
  }).observe({ type: "longtask", buffered: true });
  if (mode === "3d" || mode === "auto") {
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("graph-svg");
      if (!container) return;
      const changes: Array<{ busy: string | null; at: number }> = [];
      probe.busy = changes;
      new MutationObserver(() => {
        const busy = container.getAttribute("aria-busy");
        if (!changes.length || changes[changes.length - 1].busy !== busy) changes.push({ busy, at: performance.now() });
        if (busy === "true" && probe.firstBusy === undefined) probe.firstBusy = performance.now();
        if (busy === "false" && probe.firstBusy !== undefined && probe.rest === undefined) {
          probe.rest = performance.now();
          probe.substeps = Number(container.dataset.motionSubsteps ?? 0);
        }
      }).observe(container, { attributes: true, attributeFilter: ["aria-busy"] });
    });
    if (mode === "3d") return;
  }
  // 2D: the suite's own test of rest (`localMapSettled`, then every card's box unchanged for 150 ms).
  let previous = "", since = 0;
  const frame = (): void => {
    const now = performance.now();
    const map = document.querySelector<HTMLElement>("#map-container");
    const root = map?.querySelector<HTMLElement>(".local-placed");
    if (root && probe.firstPlaced === undefined) probe.firstPlaced = now;
    if (root && probe.firstCard === undefined && root.querySelector(".node-card")) probe.firstCard = now;
    if (root && probe.firstSearchDone === undefined && root.dataset.searchStatus && root.dataset.searchStatus !== "running") probe.firstSearchDone = now;
    const settled = !!map && !!root && map.dataset.camera !== "moving" && root.dataset.moving !== "true" && root.dataset.searchStatus !== "running";
    if (settled) {
      if (probe.firstSettled === undefined) probe.firstSettled = now;
      const value = JSON.stringify([...document.querySelectorAll(".node-card")].map(element => {
        const r = element.getBoundingClientRect();
        return [r.x, r.y, r.width, r.height];
      }));
      if (value !== previous) { previous = value; since = now; }
      if (now - since > 150) {
        probe.rest = since;
        probe.restConfirmed = now;
        probe.layoutMs = Number(root.dataset.layoutMs);
        probe.cards = document.querySelectorAll(".node-card").length;
        probe.searchTried = root.dataset.searchTried;
        probe.searchStatus = root.dataset.searchStatus;
        return;
      }
    } else previous = "";
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

async function waitForRest(page: Page, limitMs: number): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { __probe: { rest?: number; restConfirmed?: number; firstBusy?: number } }).__probe.rest !== undefined, undefined, { timeout: limitMs, polling: 100 });
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });
  const httpServer = require.resolve("http-server/bin/http-server");
  const server = spawn(process.execPath, [httpServer, path.join(ROOT, "dist/explorer"), "-p", String(PORT), "-c-1", "--silent"], { stdio: "ignore" });
  await new Promise(resolve => setTimeout(resolve, 1500));
  const launch = browserLaunchOptions();
  const browser = await chromium.launch(launch);
  const results: unknown[] = [];
  {
    const page = await browser.newPage();
    const renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl");
      const info = gl?.getExtension("WEBGL_debug_renderer_info");
      return gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "no WebGL";
    });
    console.log(`renderer: ${renderer}`);
    results.push({ renderer });
    await page.close();
  }
  try {
    for (const scenario of SCENARIOS.filter(s => !ONLY || ONLY.includes(s.name))) {
      const kinds = [...Array.from({ length: RUNS }, (_, i) => `run${i + 1}`), ...(PROFILE ? ["profile"] : [])];
      for (const kind of kinds) {
        const origin = `http://localhost:${PORT}`;
        const context = await browser.newContext({
          ...devices["Desktop Chrome"],
          baseURL: origin,
          storageState: { cookies: [], origins: [{ origin, localStorage: [{ name: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: scenario.searchStarts ?? 0 } } }) }] }] }
        });
        const page = await context.newPage();
        // tsx keeps functions' names through a helper, `__name`, that the page does not have: give it one first.
        await page.addInitScript({ content: "window.__name = (f) => f;" });
        await page.addInitScript(watcher, scenario.mode);
        const load = os.loadavg().map(v => v.toFixed(2)).join(" ");
        let cdp;
        if (kind === "profile") {
          cdp = await context.newCDPSession(page);
          await cdp.send("Profiler.enable");
          await cdp.send("Profiler.setSamplingInterval", { interval: 250 });
          await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing", "v8.execute", "loading"] });
          await cdp.send("Profiler.start");
        }
        const began = Date.now();
        await page.goto(scenario.address);
        let failed: string | undefined;
        try {
          await waitForRest(page, scenario.searchStarts ? 240_000 : scenario.mode === "auto" ? 30_000 : 120_000);
        } catch (error) { failed = String(error).slice(0, 200); }
        const wall = Date.now() - began;
        const probe = await page.evaluate(() => {
          const p = (window as unknown as { __probe: Record<string, unknown> }).__probe;
          const resources = performance.getEntriesByType("resource").map(e => e as PerformanceResourceTiming)
            .filter(e => /explorer-data|index\.js|\.css/.test(e.name))
            .map(e => ({ name: e.name.replace(location.origin, ""), start: e.startTime, end: e.responseEnd, bytes: e.transferSize }));
          const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
          return { ...p, resources, domContentLoaded: nav.domContentLoadedEventEnd, loadEvent: nav.loadEventEnd, measures: performance.getEntriesByType("measure").map(m => ({ name: m.name, start: m.startTime, duration: m.duration })) };
        });
        if (kind === "profile" && cdp) {
          const { profile } = await cdp.send("Profiler.stop");
          fs.writeFileSync(path.join(OUT, `${scenario.name}.cpuprofile`), JSON.stringify(profile));
          const trace = await browser.stopTracing();
          fs.writeFileSync(path.join(OUT, `${scenario.name}.trace.json`), trace);
        }
        const longTasks = (probe.longTasks as Array<{ start: number; duration: number }>);
        const row = {
          scenario: scenario.name, kind, load, wall, failed,
          rest: probe.rest, firstPlaced: probe.firstPlaced, firstCard: probe.firstCard, firstSettled: probe.firstSettled, firstSearchDone: probe.firstSearchDone,
          firstBusy: probe.firstBusy, substeps: probe.substeps, layoutMs: probe.layoutMs, cards: probe.cards, searchTried: probe.searchTried, searchStatus: probe.searchStatus,
          domContentLoaded: probe.domContentLoaded, loadEvent: probe.loadEvent, resources: probe.resources, measures: probe.measures, busy: probe.busy,
          longTaskCount: longTasks.length, longTaskTotal: longTasks.reduce((s, t) => s + t.duration, 0),
          longTasks: [...longTasks].sort((a, b) => b.duration - a.duration).slice(0, 12)
        };
        console.log(JSON.stringify({ scenario: row.scenario, kind, load, rest: Math.round(Number(row.rest)), wall, longTasks: row.longTaskCount, longTaskTotal: Math.round(row.longTaskTotal), failed }));
        results.push(row);
        await context.close();
      }
    }
  } finally {
    fs.writeFileSync(path.join(OUT, `results-${Date.now()}.json`), JSON.stringify(results, null, 1));
    await browser.close();
    server.kill();
  }
}

main().catch(error => { console.error(error); process.exit(1); });
