import { test, expect, type Page } from "@playwright/test";

import { observeGraph } from "../force-graph-observation";
import { localMapSettled } from "../still-picture";

/**
 * Where the 2D/3D switch's time goes (2026-11-07): the focus case's picture (this repository on graph.ts, 3D first)
 * and the whole repository (the Whole toggle), each pressed 2D and then 3D, with the clock on each press's return and
 * the page's own "live-docs:" measures and long tasks around each press printed in order. A bundle without the
 * switch's measures prints the laps and the long tasks alone.
 */
const GRAPH = "packages/engine/src/live-docs/graph.ts";

async function entries(page: Page, since: number) {
  return page.evaluate(since => ({
    measures: performance.getEntriesByType("measure").filter(entry => entry.name.startsWith("live-docs:") && entry.startTime >= since)
      .map(entry => `${entry.name.slice(10)} ${Math.round(entry.duration)}`),
    marks: performance.getEntriesByType("mark").filter(entry => entry.name === "live-docs:capture-counts" && entry.startTime >= since)
      .map(entry => JSON.stringify((entry as PerformanceMark).detail)),
    long: ((window as unknown as { longTasks: { start: number; duration: number }[] }).longTasks ?? [])
      .filter(task => task.start >= since).map(task => Math.round(task.duration)),
    now: performance.now(),
    elements: { map: document.querySelectorAll("#view-map *").length, graph: document.querySelectorAll("#view-graph *").length }
  }), since);
}

async function press(page: Page, name: "2D" | "3D", label: string, report: Record<string, unknown>): Promise<void> {
  const since = await page.evaluate(() => performance.now());
  const start = Date.now();
  await page.getByRole("button", { name, exact: true }).click();
  const returned = (Date.now() - start) / 1000;
  if (name === "2D") await expect(page.locator(".node-card").first()).toBeVisible({ timeout: 120_000 });
  else await expect(page.locator(".perspective-transition")).toHaveCount(0, { timeout: 120_000 });
  await page.waitForTimeout(2500);
  report[label] = { returned, ...(await entries(page, since)) };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const store: { start: number; duration: number }[] = [];
    (window as unknown as { longTasks: typeof store }).longTasks = store;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) store.push({ start: entry.startTime, duration: entry.duration }); })
      .observe({ type: "longtask", buffered: true });
  });
});

test("the switch's breakdown on the focus case's picture", async ({ page }) => {
  test.setTimeout(600_000);
  await observeGraph(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
  await page.waitForTimeout(2000);
  const report: Record<string, unknown> = {};
  await press(page, "2D", "focus 2D", report);
  await localMapSettled(page);
  await press(page, "3D", "focus 3D", report);
  console.log(`SWITCH-BREAKDOWN ${JSON.stringify(report, null, 1)}`);
});

test("the switch's breakdown on the whole repository", async ({ page }) => {
  test.setTimeout(900_000);
  await observeGraph(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
  await page.getByRole("button", { name: "Whole", exact: true }).click();
  // The whole repository's picture keeps settling for minutes on this machine; it is pressed after twenty seconds.
  await page.waitForTimeout(20_000);
  const report: Record<string, unknown> = {};
  await press(page, "2D", "whole 2D", report);
  await localMapSettled(page);
  await press(page, "3D", "whole 3D", report);
  console.log(`SWITCH-BREAKDOWN ${JSON.stringify(report, null, 1)}`);
});
