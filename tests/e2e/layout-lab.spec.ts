import { expect, test, type Page } from "@playwright/test";

import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import { captureFromPage } from "../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate, type CycleSearch, type CycleTerms } from "../../scripts/layout-lab/evaluate";
import { loadBundleGraph, type ScopeRun } from "../../scripts/layout-lab/scopes";
import { DECK_SCOPES } from "./scopes";
import { AT_READING_SIZE, localMapSettled, localRetainUrl } from "./still-picture";

/**
 * The layout lab's model of the page, held to the page: a capture of each deck
 * scope taken from the served bundle, laid out again by the lab at the page's
 * own tuning, must give every card's width and height, every membrane label's
 * height, the placement measure and the picture's size that the page gives.
 * A drift here means the card model has fallen behind the stylesheet, or
 * Pretext has disagreed with the browser on a text.
 */
for (const run of DECK_SCOPES) {
  test(`the layout lab reproduces the page to the pixel: ${run.bundle}, ${run.scopeName}`, { tag: run.bundle === "repository" && run.scopeName === "chain" ? "@alone" : [] }, async ({ page }) => {
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
    await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, orderStarts: 0, searchStarts: 0 } } }) });
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
    // Both loads of this case are the growing composition, whose reading text it studies; Card Text defaults to fixed slots since 2026-11-05.
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "grow" } } })
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    const capture = await captureFromPage(page, run);
    const graph = await loadBundleGraph(run);
    const config = { ...baselineConfig(), cardMaxWidth: 400 };
    const predicted = evaluate(capture, graph, run, config);
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardMaxWidth: 400, cardText: "grow" } } })
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    const narrower = await captureFromPage(page, run);
    expect(narrower.warnings).toEqual([]);
    expect(driftOf(narrower, predicted), "the original text measurements predict the actual narrower page").toEqual([]);
  });
}

/**
 * A picture's cycle trials twice over (2026-11-16): the lab's walk of a capture of its first draw, at the page's own
 * tuning, and the page's own record of its search with one seed and a patience of one, which tries every cycle trial
 * before it settles.
 */
async function cycleTrials(page: Page, file: string): Promise<{ walked: CycleSearch["tried"]; trials: Array<{ predicted: CycleTerms; adopted: boolean }> }> {
  const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(localRetainUrl(run.base, run.scope));
  const capture = await captureFromPage(page, run);
  const lab = evaluate(capture, await loadBundleGraph(run), run, baselineConfig());
  expect(driftOf(capture, lab), "the lab's first draw is the page's").toEqual([]);
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 1, searchPatience: 1 } } }) });
  await page.goto(localRetainUrl(run.base, run.scope));
  await localMapSettled(page, 120_000);
  const trials = await page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("#map-container .local-placed")!.dataset.searchCycleTrials ?? "[]") as Array<{ predicted: CycleTerms; adopted: boolean }>);
  return { walked: lab.cycleSearch?.tried ?? [], trials };
}

/** A trial's terms by name, in whole pixels; without the vertical placement when `vertical` is false. */
function named({ signals, horizontal, returns }: CycleTerms, vertical = true): Record<string, number> {
  return Object.fromEntries(Object.entries({ ...signals, horizontal, returns }).filter(([name]) => vertical || name !== "vertical").map(([name, value]) => [name, Math.round(value)]));
}

/**
 * A cycle's trial returns other references than the picture shown, so some cards gain or lose their line on returning
 * connections. The page predicts a trial on the shown picture's card heights; before it stood each card as the trial
 * dresses it, `core.ts`'s two trials were predicted a foot taller than they stand (5,156 px where 5,136), and their
 * prices 1,020 and 1,200 px from the walk's. Every term is now the walk's.
 */
test("a cycle trial's prediction stands each card's foot as the trial dresses it: core.ts, term by term", async ({ page }) => {
  test.setTimeout(180_000);
  const { walked, trials } = await cycleTrials(page, "packages/engine/src/live-docs/core.ts");
  expect(walked.length, "the walk tries both other orders").toBe(2);
  expect(trials.map(trial => named(trial.predicted)), "the page's predicted terms are the walk's").toEqual(walked.map(trial => named(trial.terms)));
  expect(trials.map(trial => trial.adopted)).toEqual(walked.map(trial => trial.adopted));
});

/**
 * `branches.ts` opened whole was the one picture where the page seemed to refuse a trial the lab's walk adopted; the two
 * had been read from different graphs, and on one graph they agree. Its verdicts and every term but the vertical
 * placement are the walk's: the page predicts that term from endpoints cached on the shown picture's cards and the lab
 * places them afresh, 22 px apart in 213,847 on the second trial, where no verdict's margin is that narrow.
 */
test("the page's search judges a cycle's trials as the lab's walk does: branches.ts", async ({ page }) => {
  test.setTimeout(180_000);
  const { walked, trials } = await cycleTrials(page, "packages/explorer/src/client/views/localView/branches.ts");
  expect(walked.length, "the walk tries both other orders").toBe(2);
  expect(trials.map(trial => named(trial.predicted, false)), "the page's predicted terms are the walk's").toEqual(walked.map(trial => named(trial.terms, false)));
  expect(trials.map(trial => trial.adopted), "and so are its verdicts").toEqual(walked.map(trial => trial.adopted));
});

test.describe("phone coarse-pointer reading geometry", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the original capture predicts narrower cards with wrapped relationship buttons and long names", async ({ page }) => {
    test.setTimeout(60_000);
    const run = DECK_SCOPES[0];
    // Both loads are the growing composition, whose reading geometry this studies (Card Text defaults to fixed slots since 2026-11-05).
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "grow" } } })
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    const capture = await captureFromPage(page, run);
    const graph = await loadBundleGraph(run);
    expect(capture.warnings).toEqual([]);
    expect(driftOf(capture, evaluate(capture, graph, run, baselineConfig()))).toEqual([]);
    expect(capture.cards[run.subject].minWidth).toBe(310);
    expect(capture.cards[run.subject].footer?.position).toBe("after-path");
    expect(capture.cards[run.subject].footer?.items.map(item => item.height)).toEqual([44, 44]);

    // This cap puts the relationship buttons on separate lines, separates TESTS from its taller chips,
    // and exercises the name seams and long prose tokens that the ordinary phone width does not.
    const config = { ...baselineConfig(), cardMaxWidth: 225 };
    const predicted = evaluate(capture, graph, run, config);
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardMaxWidth: 225, cardText: "grow" } } })
    });
    await page.goto(localRetainUrl(run.base, run.scope));
    const narrower = await captureFromPage(page, run);
    expect(narrower.warnings).toEqual([]);
    expect(driftOf(narrower, predicted), "the original measurements predict the narrower phone page").toEqual([]);
    expect(driftOf(narrower, evaluate(narrower, graph, run, config))).toEqual([]);
    const longToken = page.locator('.node-card[data-id="packages/engine/src/live-docs/document.ts"] .symbol-row[data-symbol="UNREAD_AUTHORED_BLOCK"] .local-reading-prose p');
    expect(await longToken.evaluate(element => element.scrollWidth <= element.clientWidth + 1), "long prose tokens remain within the readable paragraph").toBe(true);
  });
});

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
  // Both loads are the growing composition, whose reading block this studies (Card Text defaults to fixed slots since 2026-11-05).
  await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "grow" } } })
  });
  await page.goto(localRetainUrl(run.base, run.scope));
  const capture = await captureFromPage(page, run), graph = await loadBundleGraph(run);
  expect(driftOf(capture, evaluate(capture, graph, run, baselineConfig()))).toEqual([]);
  expect(await page.locator(`.node-card[data-id="${run.subject}"] .local-reading-purpose pre code`).textContent()).toBe(code.join("\n"));
  const config = { ...baselineConfig(), cardMaxWidth: 400 };
  const predicted = evaluate(capture, graph, run, config);
  await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardMaxWidth: 400, cardText: "grow" } } })
  });
  await page.goto(localRetainUrl(run.base, run.scope));
  expect(driftOf(await captureFromPage(page, run), predicted)).toEqual([]);
});
