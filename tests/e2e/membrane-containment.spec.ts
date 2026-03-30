import { test, expect, Page } from "@playwright/test";
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

    // The initial state should show packages/server/src with runtime & features
    // as collapsed tiles. Click runtime to expand it.
    await expandDirectory(page, "packages/server/src/runtime");

    // Pin all symbols on environment.ts to enter pin-active mode.
    await pinAllOnCard(page, "packages/server/src/runtime/environment.ts");

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

    // Expand the runtime directory to see file cards inside it
    await expandDirectory(page, "packages/server/src/runtime");

    // In browse mode at the leaf directory — check containment
    const violations = await findContainmentViolations(page);

    if (violations.length > 0) {
      expect(violations, `Layout containment violations:\n${formatViolations(violations)}`).toHaveLength(0);
    }
  });
});
