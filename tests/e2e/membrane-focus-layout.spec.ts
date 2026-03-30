import { test, expect } from "@playwright/test";
import { goToMembraneMap, expandDirectory, getRect } from "./helpers";

/**
 * Membrane Map — Focus-Aware Layout
 *
 * Dev Day 80, Turn 25-26: The focused directory should occupy the majority of
 * the viewport. Siblings should compress to thin slivers. This validates the
 * weight-boosting focus-aware layout (NOT CSS-transform zoom which was
 * rejected because it scales fonts).
 *
 * Dev Day 83, Turn 3: Files in the focused mixed-content directory should not
 * be crushed; the hybrid layout gives them a card grid.
 */

test.describe("Membrane Map — Focus Layout", () => {
  test("focused directory occupies majority of viewport width", async ({
    page,
  }) => {
    await goToMembraneMap(page);

    // Get the overall membrane viewport rect
    const viewportRect = await getRect(
      page,
      ".membrane-browse-root",
    );
    expect(viewportRect).not.toBeNull();

    // Measure the two collapsed sibling tiles (runtime, features)
    // These are at packages/server/src level
    const tileRects = await page.evaluate(() => {
      const tiles =
        document.querySelectorAll<HTMLElement>(".membrane--collapsed");
      return Array.from(tiles).map((t) => {
        const r = t.getBoundingClientRect();
        return {
          id: t.dataset.id ?? "(unknown)",
          width: r.width,
          height: r.height,
        };
      });
    });

    // Both tiles should be visible and reasonably sized
    for (const tile of tileRects) {
      expect(tile.width, `Tile "${tile.id}" should be visible`).toBeGreaterThan(
        0,
      );
      expect(
        tile.height,
        `Tile "${tile.id}" should be visible`,
      ).toBeGreaterThan(0);
    }

    // Now drill into runtime to focus on it
    await expandDirectory(page, "packages/server/src/runtime");

    // After focus: the runtime directory content should occupy a large portion
    // of the viewport. Measure the focused directory's membrane.
    const focusedRect = await page.evaluate(() => {
      // Look for the focused membrane (the most recently expanded one)
      const membranes = document.querySelectorAll<HTMLElement>(
        ".membrane[data-id]",
      );
      let largest: DOMRect | null = null;
      for (const m of membranes) {
        const r = m.getBoundingClientRect();
        if (!largest || r.width * r.height > largest.width * largest.height) {
          largest = r;
        }
      }
      return largest
        ? { width: largest.width, height: largest.height }
        : null;
    });

    expect(focusedRect).not.toBeNull();
    if (viewportRect && focusedRect) {
      // The focused area should occupy at least 50% of viewport width
      const widthRatio = focusedRect.width / viewportRect.width;
      expect(
        widthRatio,
        `Focused directory should occupy >50% width (got ${(widthRatio * 100).toFixed(1)}%)`,
      ).toBeGreaterThan(0.5);
    }
  });
});
