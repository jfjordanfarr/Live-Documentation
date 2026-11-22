import { expect, test, type Browser, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { AT_READING_SIZE, localMapStill } from "./still-picture";

/**
 * What a change of look costs the page, held by count and not by the clock (the machine is shared; 2026-11-19, the
 * record's Turn 37). The new look's sizes are custom properties every card inherits from the map, so a change of look
 * restyles the whole map once. It had restyled it three times between reading and connections: once more at the old
 * look, when the cross-fade read a box to restart its animations although none was running; once for the new look; and
 * once more at the fade's end, 200 ms later, when the class came off and took with it the held scales of the look left
 * from every card and row (inherited by everything inside them), while one rule under the class, whose last part named
 * nothing but a `:not()`, made the browser restyle everything inside the map whenever the class came or went. On this
 * repository's picture of `pathfind.ts` each of those passes cost 75 to 150 ms, and a zoom froze for about a quarter of
 * a second at each edge (the numbers are in that day's `Probes/look-change-freeze/`).
 *
 * Read from Chromium traces: the style passes and how many elements each restyled.
 */
const payment = "PaymentService/PaymentService.cs";
const estate = `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: payment,
  pinSet: { entries: [{ nodeId: payment, symbol: "*" }] }
})}`;

test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0 } } })
  });
  await page.goto(estate);
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
});

interface TraceEvent { name: string; ph: string; pid: number; tid: number; ts: number; args?: { elementCount?: number } }

/** Runs `act` with the page traced and returns the elements restyled by each style pass of the page's renderer after it began. */
async function restyles(browser: Browser, page: Page, act: () => Promise<void>): Promise<number[]> {
  await browser.startTracing(page, { categories: ["devtools.timeline", "blink.user_timing"] });
  await page.evaluate(() => performance.mark("restyles"));
  await act();
  const events = JSON.parse((await browser.stopTracing()).toString()).traceEvents as TraceEvent[];
  const mark = events.find(event => event.name === "restyles");
  if (!mark) throw new Error("the trace has no mark");
  return events
    .filter(event => event.pid === mark.pid && event.tid === mark.tid && event.name === "UpdateLayoutTree" && event.ph === "X" && event.ts >= mark.ts)
    .sort((a, b) => a.ts - b.ts)
    .map(event => event.args?.elementCount ?? 0);
}

/** How many elements a restyle of the whole map touches here: one custom property on the map, inherited by all of it. */
async function wholeMap(browser: Browser, page: Page): Promise<number> {
  const passes = await restyles(browser, page, () => page.evaluate(() => {
    const map = document.querySelector<HTMLElement>("#map-container")!;
    map.style.setProperty("--restyle-probe", String(Math.random()));
    void map.offsetWidth;
  }));
  return Math.max(...passes);
}

/** Presses the button and waits through the change's cross-fade and the wires drawn again at its end. */
async function press(page: Page, button: string): Promise<void> {
  await page.getByRole("button", { name: button, exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("#map-container")?.classList.contains("local-look-fading"));
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
  await localMapStill(page);
}

test("a change of look between reading and connections restyles the whole map once, each way", async ({ browser, page }) => {
  const map = page.locator("#map-container");
  for (let step = 0; step < 2; step += 1) await press(page, "Zoom Out");
  await expect(map).toHaveAttribute("data-look", "reading");
  const whole = await wholeMap(browser, page);
  const counted: Record<string, number[]> = {};
  counted.out = await restyles(browser, page, () => press(page, "Zoom Out"));
  await expect(map).toHaveAttribute("data-look", "connections");
  counted.in = await restyles(browser, page, () => press(page, "Zoom In"));
  await expect(map).toHaveAttribute("data-look", "reading");
  // Half the map or more is the whole map's restyle: the new look's, and before 2026-11-19 two more.
  const wholePasses = (passes: number[]): number => passes.filter(count => count >= whole / 2).length;
  expect(whole, "a restyle of the whole map touches the cards' elements").toBeGreaterThan(200);
  expect({ out: wholePasses(counted.out), in: wholePasses(counted.in) }, JSON.stringify({ whole, counted })).toEqual({ out: 1, in: 1 });
});

test("the cross-fade's class, coming and going, restyles what it moves and not the whole map, in every look", async ({ browser, page }) => {
  const map = page.locator("#map-container");
  const seen: Record<string, { whole: number; added: number; removed: number }> = {};
  for (const [look, presses] of [["connections", 3], ["overview", 4], ["reading", 7]] as const) {
    for (let step = 0; step < presses; step += 1) await press(page, look === "reading" ? "Zoom In" : "Zoom Out");
    await expect(map).toHaveAttribute("data-look", look);
    const whole = await wholeMap(browser, page);
    const toggle = (on: boolean) => () => page.evaluate(on => {
      const container = document.querySelector<HTMLElement>("#map-container")!;
      container.classList.toggle("local-look-fading", on);
      void container.offsetWidth;
    }, on);
    const added = Math.max(0, ...await restyles(browser, page, toggle(true)));
    // Past its animations' 160 ms, as at the fade's own end.
    await page.waitForTimeout(250);
    const removed = Math.max(0, ...await restyles(browser, page, toggle(false)));
    seen[look] = { whole, added, removed };
  }
  for (const [look, { whole, added, removed }] of Object.entries(seen)) {
    expect(added, `${look}: ${JSON.stringify(seen)}`).toBeLessThan(whole / 2);
    expect(removed, `${look}: ${JSON.stringify(seen)}`).toBeLessThan(whole / 2);
  }
});
