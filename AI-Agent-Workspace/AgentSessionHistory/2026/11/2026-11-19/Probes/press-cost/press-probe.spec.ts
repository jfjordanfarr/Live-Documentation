import { test, expect, type CDPSession, type Page } from "@playwright/test";
import fs from "node:fs";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../../packages/explorer/src/client/persistence/compressed-url-state";
import { observeGraph } from "../force-graph-observation";

/**
 * The press probe (2026-11-20): on pictures of three sizes, each press of 2D and 3D timed in the page from the click until
 * its own work is done, its "live-docs:" measures, and a CPU profile of exactly the press: a marker function runs for two
 * milliseconds before the click and another as the press returns, so that the samples between them are the press's.
 */
const OUT = process.env.PROBE_OUT ?? "test-results/press-probe";
const LABEL = process.env.PROBE_LABEL ?? "run";

const pictures: Array<{ name: string; url: string }> = [
  { name: "small", url: `/?view=local&mode=3d&node=${encodeURIComponent("packages/explorer/src/shared/staticExplorerData.ts")}` },
  { name: "graph", url: `/?view=local&mode=3d&node=${encodeURIComponent("packages/engine/src/live-docs/graph.ts")}` },
  { name: "large", url: `/?view=local&mode=3d&node=${encodeURIComponent("packages/explorer/src/client/persistence/local-storage.ts")}` },
  { name: "pins", url: `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d",
    pinSet: { entries: [{ nodeId: "packages/engine/src/live-docs/graph.ts", symbol: "*" }, { nodeId: "packages/explorer/src/client/persistence/local-storage.ts", symbol: "*" }] } })}` }
];

const PROFILE = process.env.PROBE_PROFILE !== "0";

async function press(page: Page, cdp: CDPSession, label: "2D" | "3D") {
  if (PROFILE) await cdp.send("Profiler.start");
  const result = await page.evaluate(label => new Promise<Record<string, unknown>>(resolve => {
    const spin = (ms: number): number => { const until = performance.now() + ms; let n = 0; while (performance.now() < until) n++; return n; };
    const button = [...document.querySelectorAll<HTMLButtonElement>(".perspective-controls button")].find(each => each.textContent === label)!;
    const channel = new MessageChannel();
    let started = 0;
    channel.port1.onmessage = () => {
      const returned = performance.now() - started;
      (function __pressEndMarker() { spin(3); })();
      const measures = performance.getEntriesByType("measure").filter(entry => entry.name.startsWith("live-docs:") && entry.startTime >= started)
        .map(entry => `${entry.name.slice(10)} ${entry.duration.toFixed(1)}`);
      const counts = performance.getEntriesByName("live-docs:capture-counts").filter(entry => entry.startTime >= started)
        .map(entry => (entry as PerformanceMark).detail);
      const render = performance.getEntriesByName("live-docs:switch-render").filter(entry => entry.startTime >= started).at(-1)?.duration ?? null;
      const bands = [...document.querySelectorAll<HTMLElement>("#view-map .local-directory-band")];
      const shells = bands.map(band => (band.querySelector(":scope > .local-membrane")?.querySelectorAll("*").length ?? 0) + (band.querySelector(":scope > .local-directory-label")?.querySelectorAll("*").length ?? 0));
      resolve({ returned, render, measures, counts, shellElements: shells.reduce((a, b) => a + b, 0), shells: shells.length,
        elements: { map: document.querySelectorAll("#view-map *").length, graph: document.querySelectorAll("#view-graph *").length } });
    };
    (function __pressStartMarker() { spin(3); })();
    started = performance.now();
    button.click();
    channel.port2.postMessage(null);
  }), label);
  const profile = PROFILE ? (await cdp.send("Profiler.stop")).profile : null;
  return { result, profile };
}

for (const picture of pictures) {
  test(`press probe: ${picture.name}`, async ({ page }) => {
    test.setTimeout(240_000);
    fs.mkdirSync(OUT, { recursive: true });
    await observeGraph(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.setSamplingInterval", { interval: 50 });
    await page.goto(picture.url);
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
    await expect(page.locator("#graph-svg")).not.toHaveAttribute("data-building", /.*/, { timeout: 60_000 });
    await page.waitForTimeout(1500);
    const report: Record<string, unknown> = {};
    for (const label of ["2D", "3D"] as const) {
      const { result, profile } = await press(page, cdp, label);
      if (profile) fs.writeFileSync(`${OUT}/${LABEL}-${picture.name}-${label}.cpuprofile`, JSON.stringify(profile));
      await expect(page.locator(".perspective-transition[data-graph-files]")).toHaveCount(1, { timeout: 60_000 });
      await expect(page.locator(".perspective-transition")).toHaveCount(0, { timeout: 60_000 });
      await page.waitForTimeout(2500);
      report[label] = result;
    }
    console.log(`PRESS-PROBE ${LABEL} ${picture.name} ${JSON.stringify(report)}`);
  });
}
