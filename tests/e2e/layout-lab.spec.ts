import { expect, test } from "@playwright/test";

import { DECK_SCOPES } from "./scopes";
import { localRetainUrl } from "./still-picture";
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
}
