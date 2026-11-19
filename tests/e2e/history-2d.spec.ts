import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { localMapSettled } from "./still-picture";

/**
 * The history in the 2D Local Map, its first rung (2026-11-19, the owner's request in Turn 34 of the November 18
 * record: "We should be able to scrub through history in the same shared control whose state is continuous in 2D and 3D
 * local map"): the one scrubber over the 2D map, a past moment's cards at file level, saying what is known of a file
 * then (its symbol count) and nothing of today's (no description), the moment held across a switch of perspective and
 * in the address, a pin absent at the moment said so in the tray's words, a dragged thumb that leaves the cards in place
 * and a rest that settles them, a closed directory holding a change lit, and an address that opens on its pinned card.
 * Held over the scripted repository of the history command's integration test (`samples/history/`), whose steps are:
 * 0 the base; 1 src/core renamed src/engine; 2 view.ts renamed screen.ts; 3 lib/big.ts deleted and lib/huge.ts born;
 * 4 lib/legacy.ts deleted; 5 engine/util.ts resized; 6 engine/model.ts touched, today.
 */

const BASE = "/samples/history/";
const MAIN = "src/app/main.ts";
const HUGE = "lib/huge.ts";

const at = (extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `${BASE}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "2d",
  filters: { showTests: true, showAssets: false },
  ...extra
})}`;
const address = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const track = (page: Page) => page.locator(".history-track");
const card = (page: Page, id: string) => page.locator(`#map-container .node-card[data-id="${id}"]`);
const cardIds = (page: Page) => page.locator("#map-container .node-card[data-id]").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id!).sort());

/** The bundle's commits, oldest first, read from its history file. */
async function commitsOf(page: Page): Promise<string[]> {
  const data = await (await page.request.get(`${BASE}explorer-data.json`)).json() as { history: { file: string } };
  const sequence = await (await page.request.get(`${BASE}${data.history.file}`)).json() as { base: { commit: { id: string } }; steps: Array<{ commit: { id: string } }> };
  return [sequence.base.commit.id, ...sequence.steps.map(step => step.commit.id)];
}

async function openHistory(page: Page): Promise<void> {
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeVisible();
}

/** The slider to a step by its keys, and the map at rest there. */
async function stepTo(page: Page, step: number): Promise<void> {
  await track(page).focus();
  await page.keyboard.press("Home");
  for (let index = 0; index < step; index++) await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", String(step));
  await localMapSettled(page);
}

/** Whether the controls over the map stand clear of the open scrubber: each one's foot at or above its top. */
async function controlsClearOfScrubber(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const top = document.querySelector(".history-scrubber")!.getBoundingClientRect().top;
    return [".perspective-controls", ".pin-tray", "#controls"].flatMap(selector => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element || !element.offsetParent) return [];
      const bottom = element.getBoundingClientRect().bottom;
      return bottom > top + 0.5 ? [`${selector} reaches ${bottom.toFixed(1)} over the scrubber's top ${top.toFixed(1)}`] : [];
    });
  });
}

test.use({ viewport: { width: 1400, height: 900 } });

test("the scrubber stands over the 2D map, and a past moment's card counts its symbols and draws none of today's words", async ({ page }) => {
  await page.goto(at({ pinSet: { entries: [{ nodeId: MAIN, symbol: "*" }] } }));
  await localMapSettled(page);
  // Today: main.ts's rows and its description, today's words.
  await expect(card(page, MAIN).locator(".symbol-row[data-symbol='main']")).toHaveCount(1);
  await expect(card(page, MAIN).locator(".local-reading-purpose")).toContainText("Runs the app.");
  await openHistory(page);
  expect(await controlsClearOfScrubber(page)).toEqual([]);

  await stepTo(page, 3);
  // At step 3 the history keeps main.ts's kind and count, one symbol, and not the row: the count is said, quietly.
  const count = card(page, MAIN).locator(".local-symbols-unkept");
  await expect(count).toHaveText(/^\+1\s+symbol$/u);
  await expect(count).toHaveAttribute("title", /not kept at this moment/u);
  await expect(card(page, MAIN)).not.toContainText("No public symbols");
  await expect(card(page, MAIN).locator(".symbol-row[data-symbol='main']")).toHaveCount(0);
  // No description, no Read control and no kept line: they are today's words, not that day's.
  await expect(card(page, MAIN).locator(".local-reading-purpose, .local-file-kept, .local-reading-file-full")).toHaveCount(0);
  await expect(card(page, MAIN)).not.toContainText("Runs the app.");
  // A file that had no symbols then is said to have none.
  await expect(card(page, "tests/main.test.ts")).toContainText("No public symbols");
  await expect(card(page, "tests/main.test.ts").locator(".local-symbols-unkept")).toHaveCount(0);

  // Today again: the rows and the words return.
  await track(page).focus();
  await page.keyboard.press("End");
  await localMapSettled(page);
  await expect(card(page, MAIN).locator(".symbol-row[data-symbol='main']")).toHaveCount(1);
  await expect(card(page, MAIN).locator(".local-symbols-unkept")).toHaveCount(0);
  await expect(card(page, MAIN).locator(".local-reading-purpose")).toContainText("Runs the app.");
});

test("the moment holds across 2D, 3D and 2D, and in the address; a pin absent then is said so in the tray's words", async ({ page }) => {
  const commits = await commitsOf(page);
  await page.goto(at({ pinSet: { entries: [{ nodeId: MAIN, symbol: "*" }, { nodeId: HUGE, symbol: "*" }] } }));
  await localMapSettled(page);
  await openHistory(page);
  await stepTo(page, 2);
  expect(address(page).commit).toBe(commits[2]);
  // huge.ts was born at step 3: at step 2 it is said not yet created, kept in the tray and drawn nowhere.
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-row").filter({ hasText: "huge.ts" }).locator(".pin-tray-absent")).toHaveText("not yet created");
  await expect(card(page, HUGE)).toHaveCount(0);
  // The moment's names: view.ts was called screen.ts at step 2.
  expect(await cardIds(page)).toContain("src/app/screen.ts");

  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeVisible();
  await expect(track(page)).toHaveAttribute("aria-valuenow", "2");
  await expect(page.locator("#graph-svg")).toHaveAttribute("data-history-step", "2");
  expect(address(page).commit).toBe(commits[2]);

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await localMapSettled(page);
  await expect(page.locator(".history-scrubber")).toBeVisible();
  await expect(track(page)).toHaveAttribute("aria-valuenow", "2");
  expect(address(page).commit).toBe(commits[2]);
  expect(await cardIds(page)).toContain("src/app/screen.ts");
  await expect(card(page, HUGE)).toHaveCount(0);
  await expect(card(page, MAIN).locator(".local-symbols-unkept")).toHaveCount(1);
});

test("a dragged thumb leaves the cards in place, lit or faded by the step, and the rest settles them at the moment", async ({ page }) => {
  await page.goto(at({ openDirectories: new Set(["src/app"]) }));
  await localMapSettled(page);
  await openHistory(page);
  await localMapSettled(page);
  const today = await cardIds(page);
  expect(today).toContain("src/app/screen.ts");
  const thumb = (await page.locator(".history-tick[data-step='6']").boundingBox())!;
  const target = (await page.locator(".history-tick[data-step='1']").boundingBox())!;
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await expect(track(page)).toHaveAttribute("aria-valuenow", "1");
  // Held: today's cards, in place, none drawn for the moment; the step's emphasis is on them.
  expect(await cardIds(page)).toEqual(today);
  await expect(page.locator("#map-container")).toHaveClass(/history-(glows|dims)/u);
  await page.mouse.up();
  await localMapSettled(page);
  // At rest the picture is the moment's: at step 1 screen.ts was still view.ts.
  const moment = await cardIds(page);
  expect(moment).toContain("src/app/view.ts");
  expect(moment).not.toContain("src/app/screen.ts");
});

test("a closed directory holding the step's change is lit, and one holding none is not", async ({ page }) => {
  await page.goto(at({ openDirectories: new Set([""]) }));
  await localMapSettled(page);
  await openHistory(page);
  // Step 4 deleted lib/legacy.ts from under the closed lib; nothing under src or tests changed then.
  await stepTo(page, 4);
  await expect(page.locator(".local-directory-closed[data-directory='lib']")).toHaveClass(/is-history-changed/u);
  await expect(page.locator(".local-directory-closed[data-directory='tests']")).not.toHaveClass(/is-history-changed/u);
  // Step 5 resized src/engine/util.ts: src is lit and lib is not.
  await page.keyboard.press("ArrowRight");
  await localMapSettled(page);
  await expect(page.locator(".local-directory-closed[data-directory='src']")).toHaveClass(/is-history-changed/u);
  await expect(page.locator(".local-directory-closed[data-directory='lib']")).not.toHaveClass(/is-history-changed/u);
});

test("an address naming a past commit opens the 2D map on its pinned card", async ({ page }) => {
  const commits = await commitsOf(page);
  await page.goto(at({ pinSet: { entries: [{ nodeId: MAIN, symbol: "*" }] }, commit: commits[2] }));
  await localMapSettled(page);
  await expect(track(page)).toHaveAttribute("aria-valuenow", "2");
  // The pinned card stands whole in the map's frame, as it does when the same address names no commit.
  const inFrame = await page.evaluate(id => {
    const frame = document.querySelector("#view-map")!.getBoundingClientRect();
    const box = document.querySelector(`#map-container .node-card[data-id="${id}"] .node-title`)!.getBoundingClientRect();
    return box.left >= frame.left && box.right <= frame.right && box.top >= frame.top && box.bottom <= frame.bottom;
  }, MAIN);
  expect(inFrame).toBe(true);
});

test("a page narrowed while the scrubber is open keeps the controls clear of it", async ({ page }) => {
  await page.goto(at({ openDirectories: new Set([""]) }));
  await localMapSettled(page);
  await openHistory(page);
  expect(await controlsClearOfScrubber(page)).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => controlsClearOfScrubber(page)).toEqual([]);
});
