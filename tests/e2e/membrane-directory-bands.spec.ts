import { test, expect } from "@playwright/test";
import {
  goToMembraneMap,
  expandDirectory,
  pinAllOnCard,
  countElements,
} from "./helpers";

/**
 * Membrane Map — Directory Band Structure
 *
 * Dev Day 82, Turn 14-16: Cross-column directory bands via trie-based
 * hierarchical computation (Strategy B+C hybrid). Files from the same
 * directory must share a common encapsulating membrane (band) in pin-active
 * mode. Root-level files (at the LCA directory) get bare-band styling.
 *
 * Dev Day 82, Turn 16: Root-level files at the LCA should NOT have a
 * misleading membrane border (bare-band fix).
 */

test.describe("Membrane Map — Directory Bands", () => {
  test("pin-active mode renders directory band membranes", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");
    await pinAllOnCard(page, "packages/server/src/runtime/environment.ts");

    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });
    await page.waitForTimeout(500);

    // There should be at least one directory band membrane
    const bandCount = await countElements(page, ".pa-band-membrane[data-id]");
    expect(bandCount).toBeGreaterThanOrEqual(1);

    // Bands should have labels
    const labelCount = await countElements(page, ".pa-band-membrane__label");
    expect(labelCount).toBeGreaterThanOrEqual(1);
  });

  test("bare bands are used for LCA-level files (no misleading border)", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");
    await pinAllOnCard(page, "packages/server/src/runtime/environment.ts");

    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });
    await page.waitForTimeout(500);

    // If bare bands exist, they should NOT have the membrane border
    const bareBands = await page.evaluate(() => {
      const bands = document.querySelectorAll<HTMLElement>(".pa-band-bare");
      return Array.from(bands).map((b) => {
        const style = getComputedStyle(b);
        return {
          id: b.dataset.id ?? "(unknown)",
          borderWidth: style.borderWidth,
          borderStyle: style.borderStyle,
        };
      });
    });

    for (const band of bareBands) {
      // Bare bands should have no visible border (0px or "none")
      const hasBorder =
        band.borderStyle !== "none" && band.borderWidth !== "0px";
      expect(
        hasBorder,
        `Bare band "${band.id}" should not have a visible border`,
      ).toBe(false);
    }
  });

  test("all pin-active cards belong to a band or bare-band", async ({
    page,
  }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, "packages/server/src/runtime");
    await pinAllOnCard(page, "packages/server/src/runtime/environment.ts");

    await page.waitForSelector(".pin-active-root", { timeout: 5_000 });
    await page.waitForTimeout(500);

    // Every pin-active-card should be inside either a .pa-band-membrane
    // or a .pa-band-bare
    const orphanedCards = await page.evaluate(() => {
      const cards = document.querySelectorAll<HTMLElement>(
        ".pin-active-card[data-id]",
      );
      return Array.from(cards)
        .filter((c) => {
          const band = c.closest(
            ".pa-band-membrane, .pa-band-bare",
          );
          return !band;
        })
        .map((c) => c.dataset.id ?? "(unknown)");
    });

    expect(
      orphanedCards,
      `Cards without a band container: ${orphanedCards.join(", ")}`,
    ).toHaveLength(0);
  });
});
