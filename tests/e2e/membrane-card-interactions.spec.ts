import { test, expect } from "@playwright/test";
import {
  goToMembraneMap,
  expandDirectory,
  countElements,
} from "./helpers";

/**
 * Membrane Map — Card Collapse & Pin-All Interaction
 *
 * Dev Day 83, Turn 5: Cards should be collapsed by default (name, path,
 * symbol count — no symbol rows). Clicking expands them.
 *
 * Dev Day 84, Turn 7: Pin-all button must be present on ALL cards at all
 * times, not just as a one-time mode-transition control.
 */

test.describe("Membrane Map — Card Interactions", () => {
  test("file cards are collapsed by default (no symbol rows visible)", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // Cards should exist in browse mode
    const totalCards = await countElements(page, ".membrane-card[data-id]");
    expect(totalCards).toBeGreaterThan(0);

    // All should be collapsed (have the --collapsed class)
    const collapsedCards = await countElements(
      page,
      ".membrane-card--collapsed",
    );
    expect(collapsedCards).toBe(totalCards);

    // No symbol rows should be visible on collapsed cards
    const visibleSymbolRows = await page.evaluate(() => {
      const collapsed = document.querySelectorAll<HTMLElement>(
        ".membrane-card--collapsed",
      );
      let symbolCount = 0;
      for (const card of collapsed) {
        symbolCount += card.querySelectorAll(
          ".membrane-card__symbol-row",
        ).length;
      }
      return symbolCount;
    });
    expect(visibleSymbolRows).toBe(0);
  });

  test("clicking a collapsed card expands it to show symbol rows", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // Verify there's at least one collapsed card
    const collapsedBefore = await countElements(
      page,
      ".membrane-card--collapsed",
    );
    expect(collapsedBefore).toBeGreaterThan(0);

    // Click on the first collapsed card to expand it
    await page.locator(".membrane-card--collapsed").first().click();
    await page.waitForTimeout(300);

    // The clicked card should no longer be collapsed
    const collapsedAfter = await countElements(
      page,
      ".membrane-card--collapsed",
    );
    expect(collapsedAfter).toBeLessThan(collapsedBefore);

    // The expanded card should now have symbol rows
    const expandedCardSymbolRows = await page.evaluate(() => {
      const expanded = document.querySelector<HTMLElement>(
        ".membrane-card:not(.membrane-card--collapsed)",
      );
      if (!expanded) return 0;
      return expanded.querySelectorAll(".membrane-card__symbol-row").length;
    });
    expect(expandedCardSymbolRows).toBeGreaterThan(0);
  });

  test("pin-all button is present on every file card", async ({ page }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    const cardCount = await countElements(page, ".membrane-card[data-id]");
    expect(cardCount).toBeGreaterThan(0);

    // Every card (collapsed or expanded) should have a pin-all button
    const pinAllCount = await countElements(
      page,
      '.membrane-card [title="Pin all symbols"]',
    );
    expect(pinAllCount).toBe(cardCount);
  });

  test("test-backed cards have gold border styling", async ({ page }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // environment.test.ts should have the test-backed styling
    const testBackedCount = await countElements(
      page,
      ".membrane-card--test-backed",
    );

    // At least one card in runtime/ should be test-backed
    // (environment.test.ts is a test file)
    expect(testBackedCount).toBeGreaterThanOrEqual(1);
  });
});
