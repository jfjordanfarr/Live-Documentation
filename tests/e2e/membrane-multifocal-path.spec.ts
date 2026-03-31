import { test, expect } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

import {
  goToMembraneMap,
  expandDirectory,
  pinAllOnCard,
  countElements,
} from "./helpers";

function buildStateUrl(payload: Record<string, unknown>): string {
  const compressed = compressToEncodedURIComponent(
    JSON.stringify({ v: 1, w: "membrane", ...payload }),
  );
  return `/?s=${compressed}`;
}

/**
 * Membrane Map — Multi-Focal & Path-As-Pins
 *
 * Step 10.5 from the Membrane Map execution plan: add explicit browser-level
 * regression coverage for the two remaining Step 7 visuals that were only
 * covered by pure-function tests before today:
 *
 * - multi-focal pinning across more than one node
 * - path-as-pins rendering (breadcrumb + ancestor membrane restore)
 */

test.describe("Membrane Map — Multi-Focal & Path-As-Pins", () => {
  test("pinning two cards produces a real multi-focal pin-active state", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");

    await pinAllOnCard(page, "packages/server/src/runtime/environment.ts");
    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });

    await pinAllOnCard(page, "packages/server/src/runtime/environment.test.ts");
    await page.waitForTimeout(500);

    const activePinnedCards = await page.evaluate(() => {
      const buttons = document.querySelectorAll<HTMLElement>(
        ".membrane-card__pin-all--active",
      );
      return Array.from(buttons)
        .map((button) =>
          button.closest<HTMLElement>(".membrane-card[data-id], .pin-active-card[data-id]")
            ?.dataset.id ?? "",
        )
        .filter(Boolean)
        .sort();
    });

    expect(activePinnedCards).toContain(
      "packages/server/src/runtime/environment.ts",
    );
    expect(activePinnedCards).toContain(
      "packages/server/src/runtime/environment.test.ts",
    );

    const activeCount = await countElements(page, ".membrane-card__pin-all--active");
    expect(activeCount).toBeGreaterThanOrEqual(2);

    const pathBreadcrumbCount = await countElements(
      page,
      ".membrane-path-breadcrumb",
    );
    expect(
      pathBreadcrumbCount,
      "Manual multi-focal pinning should not create path-mode breadcrumb UI",
    ).toBe(0);
  });

  test("path-seeded URL state restores breadcrumb and common ancestor membrane", async ({
    page,
  }) => {
    const pathUrl = buildStateUrl({
      p: [
        { n: "packages/server/src/main.ts", s: "__internals__", h: 0 },
        { n: "packages/server/src/runtime/environment.ts", s: "__internals__", h: 1 },
        { n: "packages/server/src/runtime/environment.test.ts", s: "__internals__", h: 2 },
      ],
    });

    await page.goto(pathUrl);
    await page.waitForSelector(".pin-active-root", { timeout: 10_000 });
    await page.waitForSelector(".membrane-path-breadcrumb", { timeout: 5_000 });
    await page.waitForTimeout(500);

    const renderedCardIds = await page.evaluate(() => {
      const cards = document.querySelectorAll<HTMLElement>(
        ".pin-active-card[data-id]",
      );
      return Array.from(cards)
        .map((card) => card.dataset.id ?? "")
        .filter(Boolean)
        .sort();
    });

    expect(renderedCardIds).toContain("packages/server/src/main.ts");
    expect(renderedCardIds).toContain(
      "packages/server/src/runtime/environment.ts",
    );
    expect(renderedCardIds).toContain(
      "packages/server/src/runtime/environment.test.ts",
    );

    const hopLabels = await page.evaluate(() => {
      const hops = document.querySelectorAll<HTMLElement>(
        ".membrane-path-breadcrumb__hop",
      );
      return Array.from(hops).map((hop) => hop.textContent?.trim() ?? "");
    });

    expect(hopLabels).toHaveLength(3);
    expect(hopLabels[0]).toContain("main.ts");
    expect(hopLabels[1]).toContain("environment.ts");
    expect(hopLabels[2]).toContain("environment.test.ts");

    const hasCommonAncestor = await page.evaluate(() => {
      return (
        document.querySelector(
          '.pa-ancestor-membrane[data-dir="packages/server/src"]',
        ) !== null
      );
    });
    expect(
      hasCommonAncestor,
      "Path-seeded pins should restore the shared ancestor membrane for the path nodes",
    ).toBe(true);

    await page.locator(".membrane-path-breadcrumb__clear").click();
    await page.waitForSelector(".membrane-browse-root", { timeout: 5_000 });
    await page.waitForTimeout(300);

    const breadcrumbCountAfterClear = await countElements(
      page,
      ".membrane-path-breadcrumb",
    );
    expect(breadcrumbCountAfterClear).toBe(0);
  });
});