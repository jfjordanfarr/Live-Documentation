import { expect, test } from "@playwright/test";

import { DECK_SCOPES } from "./scopes";
import { localRetainUrl } from "./still-picture";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
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
    await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { orderStarts: 0, searchStarts: 0 } } }) });
    await page.goto(localRetainUrl(run.base, run.scope));
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
    const ranked = await readRoot();
    expect(ranked.start).toBe("ranked");
    expect(ranked.starts).toBe(1);
    expect(chosen.score, "the chosen start is no costlier than the ranking's order").toBeLessThanOrEqual(ranked.score);
    if (chosen.start === "ranked") expect(chosen.cost).toBe(ranked.cost);
  });
}

for (const run of [DECK_SCOPES[0], DECK_SCOPES[3]]) {
  test(`the captured reading text predicts a narrower card cap: ${run.bundle}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto(localRetainUrl(run.base, run.scope));
    const capture = await captureFromPage(page, run);
    const graph = await loadBundleGraph(run);
    const config = { ...baselineConfig(), cardMaxWidth: 400 };
    const predicted = evaluate(capture, graph, run, config);
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardMaxWidth: 400 } } })
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    const narrower = await captureFromPage(page, run);
    expect(narrower.warnings).toEqual([]);
    expect(driftOf(narrower, predicted), "the original text measurements predict the actual narrower page").toEqual([]);
  });
}

test("indented code in a reading block preserves whitespace in the capture and narrower prediction", async ({ page }) => {
  test.setTimeout(60_000);
  const run = DECK_SCOPES[3];
  const code = ["            const aVeryLongVariableName = leftValue + middleValue + rightValue;", "",
    "    align     these     columns     without     collapsing     their     spaces;"];
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.route("**/samples/estate/explorer-data.json", async route => {
    const response = await route.fetch();
    const bundle = await response.json() as StaticExplorerData;
    bundle.graph.files[run.subject].authored = ["### Purpose", "A **formatted** paragraph with `inline code`.", "", "```ts", ...code, "```"].join("\n");
    await route.fulfill({ response, json: bundle });
  });
  await page.goto(localRetainUrl(run.base, run.scope));
  const capture = await captureFromPage(page, run), graph = await loadBundleGraph(run);
  expect(driftOf(capture, evaluate(capture, graph, run, baselineConfig()))).toEqual([]);
  expect(await page.locator(`.node-card[data-id="${run.subject}"] .local-reading-purpose pre code`).textContent()).toBe(code.join("\n"));
  const config = { ...baselineConfig(), cardMaxWidth: 400 };
  const predicted = evaluate(capture, graph, run, config);
  await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardMaxWidth: 400 } } })
  });
  await page.goto(localRetainUrl(run.base, run.scope));
  expect(driftOf(await captureFromPage(page, run), predicted)).toEqual([]);
});
