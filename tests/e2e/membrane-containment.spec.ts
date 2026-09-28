import { test, expect } from "@playwright/test";

import {
  goToMembraneMap,
  expandDirectory,
  findContainmentViolations,
  pinAllOnCard,
  formatViolations,
} from "./helpers";

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Membrane Map — Layout Containment", () => {

  test("cards must not overflow their containing directory membrane in pin-active mode", async ({ page }) => {
    await goToMembraneMap(page);

    // The initial state shows the Explorer client folder with its subdirectories
    // as collapsed tiles. Click persistence to expand it.
    await expandDirectory(page, "packages/explorer/src/client/persistence");

    // Pin all symbols on compressed-url-state.ts to enter pin-active mode.
    await pinAllOnCard(page, "packages/explorer/src/client/persistence/compressed-url-state.ts");

    // Wait for pin-active mode to render
    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });
    await page.waitForTimeout(500);

    // Every card should be within its membrane band
    const violations = await findContainmentViolations(page);

    if (violations.length > 0) {
      expect(violations, `Layout containment violations:\n${formatViolations(violations)}`).toHaveLength(0);
    }
  });

  test("cards must not overflow their containing directory membrane in browse mode", async ({ page }) => {
    await goToMembraneMap(page);

    // Expand the persistence directory to see file cards inside it
    await expandDirectory(page, "packages/explorer/src/client/persistence");

    // In browse mode at the leaf directory — check containment
    const violations = await findContainmentViolations(page);

    if (violations.length > 0) {
      expect(violations, `Layout containment violations:\n${formatViolations(violations)}`).toHaveLength(0);
    }
  });
});
