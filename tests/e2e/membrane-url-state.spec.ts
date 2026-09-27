import { test, expect } from "@playwright/test";
import { goToMembraneMap, expandDirectory } from "./helpers";

/**
 * Membrane Map — URL State Persistence
 *
 * Dev Day 85 (today): URL state lost on refresh because parseInitialState
 * only checked ?view= and ?node= params, missing the ?s= compressed state.
 * Fixed by checking ?s= first in parseInitialState.
 *
 * This test navigates to a specific directory, reloads the page, and verifies
 * the Membrane Map restores to the same directory context.
 */

test.describe("Membrane Map — URL State Persistence", () => {
  test("page refresh preserves navigated directory context", async ({
    page,
  }) => {
    await goToMembraneMap(page);

    // Drill into a specific directory
    await expandDirectory(page, "packages/scripts/src/live-docs/explorer/client/persistence");

    // Capture the current URL after navigation
    const urlBefore = page.url();

    // The URL should contain state parameters (either ?s= or ?view=)
    expect(
      urlBefore.includes("?s=") ||
        urlBefore.includes("?view=") ||
        urlBefore.includes("&s="),
      "URL should contain state parameters after navigation",
    ).toBe(true);

    // Reload the page
    await page.reload();
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForTimeout(1000);

    // Check that we're still on the Membrane Map view (not Knowledge Sources)
    const isMembraneMap = await page.evaluate(() => {
      return (
        document.querySelector(".membrane-browse-root") !== null ||
        document.querySelector(".pin-active-root") !== null
      );
    });

    expect(isMembraneMap, "Should restore to Membrane Map view after refresh").toBe(true);

    // Verify the breadcrumb shows we're in the right context
    // by checking for the presence of the expanded directory's content
    const hasDirectoryContext = await page.evaluate(() => {
      const text = document.body.textContent ?? "";
      // Check breadcrumb or visible labels for the persistence directory
      return (
        text.includes("persistence") ||
        text.includes("compressed-url-state") ||
        text.includes("explorer")
      );
    });

    expect(
      hasDirectoryContext,
      "Should preserve directory navigation context after refresh",
    ).toBe(true);
  });
});
