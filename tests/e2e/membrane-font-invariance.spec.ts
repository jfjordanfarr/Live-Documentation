import { test, expect } from "@playwright/test";
import { goToMembraneMap, expandDirectory, measureFontSizes } from "./helpers";

/**
 * Membrane Map — Font Size Invariance
 *
 * Dev Day 80, Turn 26: The user rejected CSS-transform zoom because it scales
 * font sizes on drill-down. The fix was focus-aware layout (weight boosting).
 * This test ensures fonts remain constant when navigating deeper into the
 * directory hierarchy — the defining correctness signal per the user:
 *   "We will know we're doing the 'progressive zoom' correctly when
 *    the font does not resize across zooms."
 */

test.describe("Membrane Map — Font Size Invariance", () => {
  test("font size must not change when drilling into directories", async ({
    page,
  }) => {
    await goToMembraneMap(page);

    // Measure font sizes of directory labels at the current level
    const selector = ".membrane__label, .membrane-card__header";
    const initialSizes = await measureFontSizes(page, selector);
    expect(initialSizes.length).toBeGreaterThan(0);

    // Record a representative font size (median to be robust)
    const sorted = [...initialSizes].sort((a, b) => a - b);
    const medianBefore = sorted[Math.floor(sorted.length / 2)];

    // Drill deeper: expand runtime directory
    await expandDirectory(page, "packages/server/src/runtime");

    // Measure again at the deeper level
    const deeperSizes = await measureFontSizes(page, selector);
    expect(deeperSizes.length).toBeGreaterThan(0);

    const sortedDeep = [...deeperSizes].sort((a, b) => a - b);
    const medianAfter = sortedDeep[Math.floor(sortedDeep.length / 2)];

    // Allow ±1px tolerance for rounding, but NOT the 2-5x scaling that
    // CSS-transform zoom would cause
    expect(Math.abs(medianAfter - medianBefore)).toBeLessThanOrEqual(1);
  });
});
