import { test, expect } from "@playwright/test";

import {
  buildStateUrl,
  goToMembraneMap,
  expandDirectory,
  pinAllOnCard,
  countElements,
} from "./helpers";

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
    await expandDirectory(page, "packages/scripts/src/live-docs/explorer/client/persistence");

    await pinAllOnCard(page, "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts");
    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });

    await pinAllOnCard(page, "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts");
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
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts",
    );
    expect(activePinnedCards).toContain(
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts",
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
        { n: "packages/scripts/src/live-docs/explorer/client/index.ts", s: "__internals__", h: 0 },
        { n: "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts", s: "__internals__", h: 1 },
        { n: "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts", s: "__internals__", h: 2 },
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

    expect(renderedCardIds).toContain("packages/scripts/src/live-docs/explorer/client/index.ts");
    expect(renderedCardIds).toContain(
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts",
    );
    expect(renderedCardIds).toContain(
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts",
    );

    const hopLabels = await page.evaluate(() => {
      const hops = document.querySelectorAll<HTMLElement>(
        ".membrane-path-breadcrumb__hop",
      );
      return Array.from(hops).map((hop) => hop.textContent?.trim() ?? "");
    });

    expect(hopLabels).toHaveLength(3);
    expect(hopLabels[0]).toContain("index.ts");
    expect(hopLabels[1]).toContain("compressed-url-state.ts");
    expect(hopLabels[2]).toContain("compressed-url-state.test.ts");

    // The pin-active layout wraps the columns in the ancestor chain of the
    // least common ancestor of every relevant node (the path nodes plus the
    // neighbours drawn beside them). The innermost membrane must therefore
    // still be an ancestor of all three path nodes.
    const ancestorDirs = await page.evaluate(() => {
      const layers = document.querySelectorAll<HTMLElement>(".pa-ancestor-membrane[data-dir]");
      return Array.from(layers).map((layer) => layer.dataset.dir ?? "");
    });
    expect(
      ancestorDirs.length,
      "Path-seeded pins should restore ancestor membranes around the path nodes",
    ).toBeGreaterThan(0);
    const innermost = ancestorDirs.reduce((a, b) => (b.length > a.length ? b : a), "");
    for (const nodeId of [
      "packages/scripts/src/live-docs/explorer/client/index.ts",
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts",
      "packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts",
    ]) {
      expect(
        nodeId.startsWith(`${innermost}/`),
        `Innermost ancestor membrane "${innermost}" should contain ${nodeId}`,
      ).toBe(true);
    }

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