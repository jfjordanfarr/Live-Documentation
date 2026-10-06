import { expect, test } from "@playwright/test";

import { DECK_SCOPES } from "./scopes";
import { localRetainUrl } from "./still-picture";
import { getDefaultTuning, PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";
import { captureFromPage } from "../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate } from "../../scripts/layout-lab/evaluate";
import { loadBundleGraph } from "../../scripts/layout-lab/scopes";

/**
 * The layout lab's model of the page, held to the page: a capture of each deck
 * scope taken from the served bundle, laid out again by the lab at the page's
 * own tuning, must give every card's width and height, every membrane label's
 * height, the placement measure and the picture's size that the page gives.
 * A drift here means the card model has fallen behind the stylesheet, or
 * Pretext has disagreed with the browser on a text.
 */
for (const run of DECK_SCOPES) {
  test(`the layout lab reproduces the page to the pixel: ${run.bundle}, ${run.scopeName}`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto(localRetainUrl(run.base, run.scope));
    const capture = await captureFromPage(page, run);
    expect(capture.warnings, "Pretext lays out every text as the page does").toEqual([]);
    const graph = await loadBundleGraph(run);
    const baseline = evaluate(capture, graph, run, baselineConfig());
    expect(driftOf(capture, baseline), "the lab's baseline is the page").toEqual([]);
    expect(baseline.signals.placementCost).toBe(capture.truth.placementCost);
  });

  test(`the page keeps the cheapest of the order step's starts: ${run.bundle}, ${run.scopeName}`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    const readRoot = (): Promise<{ start: string; starts: number; score: number; cost: number }> => page.evaluate(() => {
      const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
      return { start: root.dataset.orderStart ?? "", starts: Number(root.dataset.orderStarts), score: Number(root.dataset.orderScore), cost: Number(root.dataset.placementCost) };
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
    const chosen = await readRoot();
    const seeds = getDefaultTuning().localMap.orderStarts;
    // The page draws the picture more than once on load, and from the second drawing the previous picture is a start too.
    expect(chosen.starts, "the ranking's order and every seeded start were tried").toBeGreaterThanOrEqual(1 + seeds);
    expect(["ranked", "previous", ...Array.from({ length: seeds }, (_, i) => `seed ${i + 1}`)]).toContain(chosen.start);
    // The ranking's order alone, with no restarts, for comparison.
    await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 1, tuning: { localMap: { orderStarts: 0 } } }) });
    await page.goto(localRetainUrl(run.base, run.scope));
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
    const ranked = await readRoot();
    expect(ranked.start).toBe("ranked");
    expect(ranked.starts).toBe(1);
    expect(chosen.score, "the chosen start is no costlier than the ranking's order").toBeLessThanOrEqual(ranked.score);
    if (chosen.start === "ranked") expect(chosen.cost).toBe(ranked.cost);
  });
}
