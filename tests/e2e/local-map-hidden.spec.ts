import { expect, test, type Page } from "@playwright/test";

import { localMapSettled, localRetainUrl } from "./still-picture";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The Local Map's work stays with the view (the owner's choice, 2026-10-16).
 * The continuing search runs only while the map is the view shown and the page
 * visible; a render asked for while another view is shown is owed, and runs
 * when the map is shown again; a return to an unchanged picture draws nothing
 * and lets the search go on from where it paused. Before, the search went on
 * behind Knowledge Sources and was begun anew on return, and the return drew
 * the unchanged picture again (measured 2026-10-16: 240 ms, and the search from
 * seed one).
 */

const FILES = [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];

test.use({ viewport: { width: 1600, height: 1000 } });

interface Reading { status: string; tried: number; next: number; marked: number; cards: number }

/** Opens the retained scope with a long search, so that a view is switched while it runs. */
async function open(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 1, tuning: { localMap: { orderStarts: 0, searchStarts: 80, searchPatience: 80, moveMs: 0 } } }) });
  await page.goto(localRetainUrl("/", FILES));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
}

/** The search's counters, and how many of the cards still carry the mark put on them. */
const read = (page: Page): Promise<Reading> => page.evaluate(() => {
  const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
  const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")];
  return { status: root.dataset.searchStatus ?? "", tried: Number(root.dataset.searchTried), next: Number(root.dataset.searchNext), marked: cards.filter(card => card.dataset.mark === "kept").length, cards: cards.length };
});

/** Marks every card, so that a card drawn anew is told from one kept. */
const mark = (page: Page): Promise<void> => page.evaluate(() => { document.querySelectorAll<HTMLElement>("#map-container .node-card").forEach(card => { card.dataset.mark = "kept"; }); });

const show = async (page: Page, view: "sources" | "world" | "map"): Promise<void> => { await page.click(`.nav-item[data-view="${view}"]`); };

test("the search pauses while another view is shown, and a return to the unchanged picture keeps it and resumes the search", async ({ page }) => {
  await open(page);
  const started = await read(page);
  expect(started.status, "the search is still running when the view is switched").toBe("running");
  await mark(page);
  await show(page, "sources");
  await expect(page.locator("#view-sources")).toHaveClass(/active/);
  const away = await read(page);
  await page.waitForTimeout(800);
  const later = await read(page);
  expect(later.tried, "no start is tried while the map is not shown").toBe(away.tried);
  expect(later.status).toBe("running");

  await show(page, "map");
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  const back = await read(page);
  expect(back.marked, "the picture is the one that stood before: every card kept its element").toBe(back.cards);
  expect(back.next, "the search goes on from the seed after the last tried, not from the first").toBeGreaterThanOrEqual(away.next);
  await localMapSettled(page);
  const done = await read(page);
  expect(done.tried, "the search tried more starts after the return").toBeGreaterThan(later.tried);
  expect(done.marked, "the search's adoptions move the cards without drawing them anew").toBe(done.cards);
});

test("a change made while another view is shown is drawn when the map is shown again", async ({ page }) => {
  await open(page);
  await mark(page);
  await show(page, "sources");
  await expect(page.locator("#view-sources")).toHaveClass(/active/);
  // The tests filter is a picture input: the map is told, and owes the render until it is shown.
  await page.click("#filter-toggle-tests");
  await page.waitForTimeout(300);
  expect((await read(page)).marked, "nothing is drawn while the map is hidden").toBeGreaterThan(0);
  await show(page, "map");
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  const back = await read(page);
  expect(back.marked, "the owed render drew the cards anew").toBe(0);
  expect(back.cards).toBeGreaterThan(0);
});

test("the search pauses while the page is hidden and resumes when it is visible again", async ({ page }) => {
  await open(page);
  expect((await read(page)).status).toBe("running");
  const setVisibility = (state: "hidden" | "visible"): Promise<void> => page.evaluate(value => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
  await setVisibility("hidden");
  await page.waitForTimeout(100);
  const hidden = await read(page);
  await page.waitForTimeout(600);
  const stillHidden = await read(page);
  expect(stillHidden.tried, "no start is tried while the page is hidden").toBe(hidden.tried);
  await setVisibility("visible");
  await localMapSettled(page);
  expect((await read(page)).tried, "the search went on once the page was visible").toBeGreaterThan(hidden.tried);
});
