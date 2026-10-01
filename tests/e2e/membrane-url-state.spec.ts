import { test, expect } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

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
  test("a shared multi-pin view restores its camera before measuring wires", async ({ page }) => {
    const provider = "packages/engine/src/live-docs/document.ts";
    const consumer = "packages/engine/src/live-docs/graph.ts";
    const encoded = compressToEncodedURIComponent(JSON.stringify({
      v: 1,
      w: "membrane",
      n: consumer,
      p: [{ n: provider, s: "LiveDoc" }, { n: consumer, s: "GraphFile" }],
      t: [80, -120, 0.65],
    }));
    await page.goto(`/?s=${encoded}`);

    const container = page.locator("#membrane-container");
    const wire = page.locator(
      `.membrane-connection--front[data-source-id="${provider}"][data-target-id="${consumer}"][data-target-symbol="graphfile"]`,
    ).first();
    await expect(wire).toBeAttached();
    await expect(container).toHaveCSS("transform", "matrix(0.65, 0, 0, 0.65, 80, -120)");

    // The rendered cable must meet the actual rendered symbol pin, including
    // when a fresh page opens at a non-default saved scale and translation.
    const separation = await wire.evaluate((element, id) => {
      const path = element as SVGPathElement;
      const point = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
      const pin = document.querySelector<HTMLElement>(
        `.membrane-card__symbol-row[data-node-id="${id}"][data-symbol="LiveDoc"] .membrane-focal-pin--outbound`,
      )!;
      const rect = pin.getBoundingClientRect();
      return Math.hypot(point.x - rect.x - rect.width / 2, point.y - rect.y - rect.height / 2);
    }, provider);
    expect(separation, "Cable starts at the offered symbol's pin rim").toBeLessThanOrEqual(8);

    await page.reload();
    await expect(wire).toBeAttached();
    await expect(container).toHaveCSS("transform", "matrix(0.65, 0, 0, 0.65, 80, -120)");
    await expect(page.locator(".membrane-card__symbol-row--pinned")).toHaveCount(2);
  });

  test("page refresh preserves navigated directory context", async ({
    page,
  }) => {
    await goToMembraneMap(page);

    // Drill into a specific directory
    await expandDirectory(page, "packages/explorer/src/client/persistence");

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
