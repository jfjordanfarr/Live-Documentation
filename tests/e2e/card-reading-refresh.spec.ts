import { expect, test, type Locator, type Page } from "@playwright/test";

import { localMapStill, panIntoView } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";

const readingState = "packages/explorer/src/client/reading-state.ts";
const payment = "PaymentService/PaymentService.cs";
const context = "PaymentService/Data/PaymentsContext.cs";
const url = (state: Partial<UrlStateSnapshot>, estate = false): string => `${estate ? "/samples/estate" : ""}/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;
const state = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);
const scene = "#map-container .local-placed, #map-container .node-card, #map-container .symbol-row, #map-container .local-reading-slot";

/** This case exercises the shipped search, without the suite's usual sparse-search storage preference. */
test.use({ viewport: { width: 1440, height: 960 }, storageState: { cookies: [], origins: [] } });

const search = (page: Page) => page.locator("#map-container .local-placed").evaluate(root =>
  Object.fromEntries(Object.entries((root as HTMLElement).dataset).filter(([key]) => /^(?:search|order|moving)/u.test(key))));
const boxes = (page: Page) => page.locator(scene).evaluateAll(elements => elements.map(element => {
  const rect = element.getBoundingClientRect();
  return [rect.x, rect.y, rect.width, rect.height];
}));

// A handle to the ordered array checks both DOM identity and the order of every card, row and slot.
const identities = (page: Page) => page.evaluateHandle(selector => [...document.querySelectorAll(selector)], scene);

async function press(page: Page, button: Locator): Promise<void> {
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toBeFocused();
}

test("normal-default text choices preserve the completed search, DOM, row order, boxes and keyboard focus", async ({ page }) => {
  const pinSet = { entries: [{ nodeId: readingState, symbol: "*" }] };
  await page.goto(url({ selectedNodeId: readingState, pinSet }));
  const subject = card(page, readingState), book = subject.locator(".local-file-read");
  const row = subject.locator('.symbol-row[data-symbol="descriptionIsOpen"]');
  const prose = subject.locator(".local-reading-slot:has(.local-reading-prose:not(:empty))");
  await subject.waitFor();
  await localMapStill(page);
  const beforeSearch = await search(page), beforeDOM = await identities(page);
  expect(Number(beforeSearch.searchTried), "the normal continuing search actually ran").toBeGreaterThan(0);
  expect(["settled", "capped"]).toContain(beforeSearch.searchStatus);
  const unchanged = async (beforeBoxes: Awaited<ReturnType<typeof boxes>>): Promise<void> => {
    // Check immediately as well as after settling: a restarted search could otherwise finish at the same counters.
    expect(await search(page)).toEqual(beforeSearch);
    await localMapStill(page);
    expect(await search(page)).toEqual(beforeSearch);
    expect(await boxes(page)).toEqual(beforeBoxes);
    expect(await beforeDOM.evaluate((before, selector) => {
      const after = [...document.querySelectorAll(selector)];
      return before.length === after.length && before.every((element, index) => element === after[index]);
    }, scene)).toBe(true);
    expect(state(page).pinSet).toEqual(pinSet);
  };

  // Focus may legitimately frame its control. Measure the reading action after that independent movement finishes.
  await book.focus();
  await localMapStill(page);
  const beforeFold = await boxes(page);
  await page.keyboard.press("Enter");
  await expect(book).toBeFocused();
  await expect(prose.filter({ visible: true })).toHaveCount(0);
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(book).toHaveAttribute("aria-expanded", "false");
  await unchanged(beforeFold);
  const symbolBook = row.locator(".local-symbol-read");
  await symbolBook.focus();
  await localMapStill(page);
  const beforeOne = await boxes(page);
  await page.keyboard.press("Enter");
  await expect(symbolBook).toBeFocused();
  await expect(prose.filter({ visible: true })).toHaveCount(1);
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(row.locator(".local-symbol-read")).toHaveAttribute("aria-expanded", "true");
  await unchanged(beforeOne);
  expect(state(page).reading).toEqual([
    { nodeId: readingState, open: false },
    { nodeId: readingState, symbol: "descriptionIsOpen", open: true }
  ]);
});

test("a reading-only card updates its row emphasis in place as one description folds and reopens", async ({ page }) => {
  await page.goto(url({ reading: [{ nodeId: readingState, open: true }] }));
  const subject = card(page, readingState), row = subject.locator('.symbol-row[data-symbol="descriptionIsOpen"]');
  const book = row.locator(".local-symbol-read");
  await subject.waitFor();
  await localMapStill(page);
  await expect(row).not.toHaveClass(/branch-symbol-muted/u);
  await book.focus();
  await localMapStill(page);
  const beforeSearch = await search(page), beforeBoxes = await boxes(page), previousRow = await row.elementHandle();
  for (const open of [false, true]) {
    await press(page, book);
    if (open) await expect(row).not.toHaveClass(/branch-symbol-muted/u);
    else await expect(row).toHaveClass(/branch-symbol-muted/u);
    await expect(row.locator(".local-reading-slot"))[open ? "toBeVisible" : "toBeHidden"]();
    await localMapStill(page);
    expect(await previousRow!.evaluate(element => element.isConnected)).toBe(true);
    expect(await search(page)).toEqual(beforeSearch);
    expect(await boxes(page)).toEqual(beforeBoxes);
    expect(state(page).pinSet.entries).toEqual([]);
  }
});

test("a compact neighbor folds in place, while reading still renders new retention controls and disclosed rows", async ({ page }) => {
  const pinSet = { entries: [{ nodeId: payment, symbol: "*" }] };
  await page.goto(url({ selectedNodeId: payment, pinSet }, true));
  const subject = card(page, context), book = subject.locator(".local-file-read");
  const shownRows = () => subject.locator(".symbol-row:not(.branch-symbol-hidden):not(.symbol-collapsed)");
  await subject.waitFor();
  await localMapStill(page);
  await panIntoView(page, subject);
  await localMapStill(page);
  await expect(shownRows()).toHaveCount(1);
  await expect(subject.locator(".local-file-close")).toHaveCount(0);
  await book.focus();
  await localMapStill(page);
  const beforeSearch = await search(page), beforeBoxes = await boxes(page), beforeDOM = await identities(page);
  const previousCard = await subject.elementHandle();
  await press(page, book);
  await expect(subject.locator(".local-reading-slot:visible")).toHaveCount(0);
  expect(await search(page)).toEqual(beforeSearch);
  await localMapStill(page);
  expect(await search(page)).toEqual(beforeSearch);
  expect(await boxes(page)).toEqual(beforeBoxes);
  expect(await beforeDOM.evaluate((before, selector) => {
    const after = [...document.querySelectorAll(selector)];
    return before.length === after.length && before.every((element, index) => element === after[index]);
  }, scene)).toBe(true);

  // Keeping the already visible symbol open retains this unpinned neighbor: only its Close control is new.
  await press(page, subject.locator('.symbol-row[data-symbol="PaymentsContext (class)"] .local-symbol-read'));
  await expect(shownRows()).toHaveCount(1);
  await expect(subject.locator(".local-file-close")).toHaveCount(1);
  expect(await previousCard!.evaluate(element => element.isConnected), "new retained controls rebuild the native card").toBe(false);
  await localMapStill(page);
  const retainedCard = await subject.elementHandle();
  await press(page, book);
  await expect(shownRows()).toHaveCount(7);
  expect(await retainedCard!.evaluate(element => element.isConnected), "changed row disclosure rebuilds the native card").toBe(false);
  await localMapStill(page);
  expect(state(page)).toMatchObject({ selectedNodeId: payment, pinSet, reading: [{ nodeId: context, open: true }] });
  await page.reload();
  await expect(shownRows()).toHaveCount(7);
  await expect(subject.locator(".local-file-close")).toHaveCount(1);
  expect(state(page)).toMatchObject({ selectedNodeId: payment, pinSet, reading: [{ nodeId: context, open: true }] });
});
