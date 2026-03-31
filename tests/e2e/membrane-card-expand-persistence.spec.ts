import { test, expect } from "@playwright/test";
import { goToMembraneMap, expandDirectory } from "./helpers";

/**
 * Membrane Map — Card Expansion URL Persistence
 *
 * Regression test for the `expandedCards` URL-state gap identified on
 * Dev Day 86 (2026-03-31): expanding a file card in browse mode does NOT
 * write the card set to the `?s=` compressed URL parameter, so reloading
 * the page (or sharing the URL) drops card expansion state entirely.
 *
 * Fix: add `expandedCards` field to `CompressedPayload` and `UrlStateSnapshot`,
 * serialize it in `persistToUrl()`, and restore it from `readUrlState()`.
 */

test.describe("Membrane Map — Card Expansion URL Persistence", () => {
  test("expanding a card updates the URL state", async ({ page }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // Verify there's at least one collapsed card to start
    const collapsedBefore = await page
      .locator(".membrane-card--collapsed")
      .count();
    expect(
      collapsedBefore,
      "There should be collapsed cards in the directory",
    ).toBeGreaterThan(0);

    // Capture URL before expanding a card
    const urlBefore = page.url();

    // Click the first collapsed card to expand it
    await page.locator(".membrane-card--collapsed").first().click();
    await page.waitForTimeout(400);

    // Confirm the card is now expanded
    const expandedCards = await page
      .locator(".membrane-card:not(.membrane-card--collapsed)")
      .count();
    expect(expandedCards, "At least one card should now be expanded").toBeGreaterThan(0);

    // The URL should have changed to reflect the new expanded state
    const urlAfter = page.url();
    expect(
      urlAfter,
      "URL should change when a card is expanded",
    ).not.toBe(urlBefore);

    // The ?s= parameter should be present
    expect(
      urlAfter.includes("?s=") || urlAfter.includes("&s="),
      "URL should contain compressed state parameter ?s=",
    ).toBe(true);
  });

  test("expanded cards are restored after page reload", async ({ page }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // Expand the first collapsed card
    await page.locator(".membrane-card--collapsed").first().click();
    await page.waitForTimeout(400);

    // Record which card was expanded (by its data-id)
    const expandedCardId = await page.evaluate(() => {
      const expanded = document.querySelector<HTMLElement>(
        ".membrane-card:not(.membrane-card--collapsed)[data-id]",
      );
      return expanded?.dataset.id ?? null;
    });

    expect(
      expandedCardId,
      "Should find a non-null data-id for the expanded card",
    ).not.toBeNull();

    // Give the URL state a moment to flush
    await page.waitForTimeout(200);

    // Reload and wait for the view to restore
    await page.reload();
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForTimeout(1000);

    // After reload we should still be in membrane map browse mode
    const isMembraneMap = await page.evaluate(() => {
      return document.querySelector(".membrane-browse-root") !== null;
    });
    expect(isMembraneMap, "Should restore to Membrane browse mode after reload").toBe(true);

    // The previously-expanded card should still be expanded
    const cardStillExpanded = await page.evaluate((cardId: string) => {
      const card = document.querySelector<HTMLElement>(
        `.membrane-card[data-id="${cardId}"]`,
      );
      if (!card) return false;
      return !card.classList.contains("membrane-card--collapsed");
    }, expandedCardId as string);

    expect(
      cardStillExpanded,
      `Card "${expandedCardId}" should remain expanded after page reload`,
    ).toBe(true);
  });

  test("multiple expanded cards all restored after page reload", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    // Count available collapsed cards
    const totalCollapsed = await page.locator(".membrane-card--collapsed").count();
    const cardsToExpand = Math.min(2, totalCollapsed);
    expect(cardsToExpand, "Need at least 2 cards to test multi-card persistence").toBeGreaterThanOrEqual(2);

    // Expand the first two cards
    const cards = page.locator(".membrane-card--collapsed");
    await cards.nth(0).click();
    await page.waitForTimeout(300);
    await page.locator(".membrane-card--collapsed").first().click();
    await page.waitForTimeout(300);

    // Record all currently expanded card IDs
    const expandedIds = await page.evaluate(() => {
      const cards = document.querySelectorAll<HTMLElement>(
        ".membrane-card:not(.membrane-card--collapsed)[data-id]",
      );
      return Array.from(cards).map((c) => c.dataset.id ?? "").filter(Boolean);
    });

    expect(
      expandedIds.length,
      "Should have at least 2 expanded cards before reload",
    ).toBeGreaterThanOrEqual(2);

    await page.waitForTimeout(200);

    // Reload and wait for restore
    await page.reload();
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForTimeout(1000);

    // All expanded cards should still be expanded
    for (const cardId of expandedIds) {
      const stillExpanded = await page.evaluate((id: string) => {
        const card = document.querySelector<HTMLElement>(
          `.membrane-card[data-id="${id}"]`,
        );
        if (!card) return false;
        return !card.classList.contains("membrane-card--collapsed");
      }, cardId);

      expect(
        stillExpanded,
        `Card "${cardId}" should remain expanded after reload`,
      ).toBe(true);
    }
  });
});
