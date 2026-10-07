import { expect, test, type Page } from "@playwright/test";

import { localMapSettled, localRetainUrl } from "./still-picture";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The continuing search: after the first picture is painted, the order step
 * keeps trying seeded starts in the page's idle moments and moves the picture
 * to one that beats the shown picture by more than the churn it costs; it
 * stops at a cap or after a run of starts without an adoption, and starts
 * afresh when the picture changes (the owner's plan and stopping rule,
 * 2026-10-07, Turns 15 to 17). The page says what the search has done on the
 * picture's root; no text announces it.
 */

const FILES = [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];

test.use({ viewport: { width: 1600, height: 1000 } });

interface SearchReading { status: string; tried: number; next: number; adopted: number; shown: number; score: number; start: string; starts: number; priced: number | null }

async function open(page: Page, localMap: Record<string, number>): Promise<void> {
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 1, tuning: { localMap } }) });
  await page.goto(localRetainUrl("/", FILES));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
}

const readSearch = (page: Page): Promise<SearchReading> => page.evaluate(() => {
  const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
  return {
    status: root.dataset.searchStatus ?? "", tried: Number(root.dataset.searchTried), next: Number(root.dataset.searchNext), adopted: Number(root.dataset.searchAdopted),
    shown: Number(root.dataset.searchShown), score: Number(root.dataset.orderScore), start: root.dataset.orderStart ?? "", starts: Number(root.dataset.orderStarts),
    priced: root.dataset.searchPriced === undefined ? null : Number(root.dataset.searchPriced)
  };
});

test("after the first picture the search tries further starts in idle time and moves to a better one when it clears the churn cost", async ({ page }) => {
  // The first paint tries only the ranking's order and one seed, so there is better to find; the search tries twelve more and jumps rather than moves, for speed.
  await open(page, { orderStarts: 1, searchStarts: 12, searchPatience: 12, moveMs: 0 });
  expect((await readSearch(page)).starts, "the first paint tried the ranking's order and one seed").toBe(2);
  await localMapSettled(page);
  const done = await readSearch(page);
  expect(done.status).toBe("capped");
  expect(done.tried).toBe(12);
  expect(done.next).toBe(14);
  expect(done.adopted, "a better picture was found among the twelve").toBeGreaterThanOrEqual(1);
  expect(done.start).toMatch(/^seed ([2-9]|1[0-3])$/u);
  // The price the search put on the adopted start from the page's answers is close to its price measured on the page.
  expect(done.priced).not.toBeNull();
  expect(Math.abs(done.priced! - done.score) / done.score, "the search's arithmetic price is near the page's measurement").toBeLessThan(0.02);
  // Without the search the page keeps the first paint, which the search's picture beats by its own price, churn aside.
  await open(page, { orderStarts: 1, searchStarts: 0 });
  const first = await readSearch(page);
  expect(first.status).toBe("capped");
  expect(first.tried).toBe(0);
  expect(done.shown, "the shown picture's price fell").toBeLessThan(first.shown);
});

test("a change of pins starts the search afresh, from the seed after the first paint's last", async ({ page }) => {
  await open(page, { orderStarts: 2, searchStarts: 4, searchPatience: 4, moveMs: 0 });
  await localMapSettled(page);
  const before = await readSearch(page);
  expect(before.status).toBe("capped");
  expect(before.tried).toBe(4);
  // A row on a card wholly in the frame, since the map does not scroll and a click lands only on what is shown.
  const found = await page.evaluate(() => {
    for (const card of document.querySelectorAll<HTMLElement>("#map-container .node-card:not(.local-focus)")) {
      const r = card.getBoundingClientRect();
      if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) continue;
      const row = card.querySelector<HTMLElement>(".symbol-row:not(.branch-symbol-hidden)");
      if (row) return { id: card.dataset.id!, symbol: row.dataset.symbol! };
    }
    return null;
  });
  expect(found).not.toBeNull();
  await page.locator(`#map-container .node-card[data-id="${found!.id}"] .symbol-row[data-symbol="${found!.symbol}"] .symbol-label-wrapper`).click();
  const fresh = await readSearch(page);
  expect(fresh.tried, "the new picture's search has only begun").toBeLessThan(4);
  expect(fresh.next).toBeGreaterThanOrEqual(3);
  await localMapSettled(page);
  const again = await readSearch(page);
  // Four starts and a patience of four: the search ends capped, or settled when none of the four was adopted.
  expect(["capped", "settled"]).toContain(again.status);
  expect(again.tried).toBe(4);
  expect(again.next).toBe(7);
});

test("the search settles when a run of starts betters nothing, short of its cap", async ({ page }) => {
  await open(page, { orderStarts: 4, searchStarts: 64, searchPatience: 3, moveMs: 0 });
  await localMapSettled(page);
  const done = await readSearch(page);
  expect(done.status).toBe("settled");
  expect(done.tried).toBeGreaterThanOrEqual(3);
  expect(done.tried, "it stopped well short of the cap").toBeLessThan(64);
  expect(done.next).toBe(5 + done.tried);
});
