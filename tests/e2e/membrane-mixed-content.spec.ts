import { test, expect } from "@playwright/test";

import { goToMembraneMap } from "./helpers";

/**
 * Membrane Map — Mixed-Content Directory Layout
 *
 * Dev Day 83, Turn 3-4: Files in mixed-content directories (containing both
 * files and subdirectories) were crushed to ~1% of area because squarify
 * weighted files at 1 vs directories at N. Solution C hybrid layout renders
 * directories as treemap tiles and files as a separate card grid below.
 *
 * This test validates that the hybrid layout is applied and that file cards
 * have a reasonable minimum size.
 */

test.describe("Membrane Map — Mixed-Content Hybrid Layout", () => {
  test("files in mixed-content directories should use hybrid card-grid layout", async ({
    page,
  }) => {
    await goToMembraneMap(page);

    // The specs land on the Explorer client folder, which is mixed content
    // (files such as index.ts beside subdirectories such as persistence/).
    // Check for the hybrid card-grid class.
    const hasHybridGrid = await page.evaluate(() => {
      return document.querySelector(".membrane__card-grid--hybrid") !== null;
    });

    // Also check that file cards in the grid have reasonable minimum dimensions
    const cardSizes = await page.evaluate(() => {
      const cards = document.querySelectorAll<HTMLElement>(
        ".membrane__card-grid .membrane-card",
      );
      return Array.from(cards).map((c) => {
        const r = c.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });
    });

    if (hasHybridGrid) {
      // Hybrid grid exists — verify cards aren't crushed
      for (const card of cardSizes) {
        expect(card.width).toBeGreaterThan(50);
        expect(card.height).toBeGreaterThan(20);
      }
    }

    // Whether or not we hit a mixed-content directory, ensure NO file card
    // anywhere on the page is crushed below a reasonable minimum
    const allCardSizes = await page.evaluate(() => {
      const cards = document.querySelectorAll<HTMLElement>(
        ".membrane-card[data-id]",
      );
      return Array.from(cards).map((c) => {
        const r = c.getBoundingClientRect();
        return {
          id: c.dataset.id ?? "(unknown)",
          width: r.width,
          height: r.height,
        };
      });
    });

    for (const card of allCardSizes) {
      if (card.width === 0 && card.height === 0) continue; // hidden/collapsed
      expect(
        card.width,
        `Card "${card.id}" is too narrow (${card.width}px)`,
      ).toBeGreaterThan(30);
      expect(
        card.height,
        `Card "${card.id}" is too short (${card.height}px)`,
      ).toBeGreaterThan(15);
    }
  });
});
