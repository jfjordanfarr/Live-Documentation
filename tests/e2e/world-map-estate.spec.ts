import { test, expect, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";

/**
 * The estate sample over its own board: the owner's target shape.
 *
 * `npm run live-docs:visualize:estate` builds it into the bundle's
 * `samples/estate/`, docs generated into a copy of the sample, so that the
 * same server serves it. These specs check what the World Map draws of it
 * and that its words stay off each other, outside and inside.
 */

const ESTATE = "/samples/estate/index.html?view=world";
const BOARD_TEXT = ["#view-world svg text"];
const MEMBRANE_TEXT = ["#view-membrane .membrane__label", "#view-membrane .membrane__badge", "#view-membrane .membrane-leaf__name", "#view-membrane .membrane-card__header", "#view-membrane .membrane-card__path", "#view-membrane .membrane-card__symbol-summary", "#view-membrane .membrane-card__directory", "#view-membrane .membrane-browse-breadcrumb__segment", "#controls .control-btn"];

interface WorldMapHandle {
  ready: boolean;
  instant: (value: boolean) => void;
  reset: () => void;
  under: (value: boolean) => void;
  enter: (name: string) => void;
  pieces: () => string[];
  roads: () => string[];
}

declare global {
  interface Window {
    __worldMap?: WorldMapHandle;
  }
}

async function openEstate(page: Page): Promise<void> {
  await page.goto(ESTATE);
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
  await page.evaluate(() => {
    window.__worldMap!.instant(true);
    window.localStorage.clear();
    window.__worldMap!.reset();
  });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#view-world")!).opacity === "1");
}

test.describe("The estate on the World Map", () => {
  test("draws seven things in two regions, the declared crossing, a call in the air and the library the services stand on", async ({ page }) => {
    await openEstate(page);
    const pieces = await page.evaluate(() => window.__worldMap!.pieces());
    expect(pieces.sort()).toEqual(["contracts", "gateway", "hub", "oracle", "payments", "portal", "sqlserver"]);
    expect(await page.locator("#view-world .w-region").count()).toBe(2);
    await expect(page.locator("#view-world text.w-tag").first()).toContainText("IPsec tunnel");
    const roads = await page.evaluate(() => window.__worldMap!.roads());
    expect(roads).toContain("hub>contracts::source");
    expect(roads.some((id) => id.startsWith("gateway>hub:") && !id.endsWith(":source"))).toBe(true);
  });

  test("its labels stay off each other at rest and with the built-on layer showing", async ({ page }) => {
    await openEstate(page);
    let boxes = await textBoxes(page, BOARD_TEXT);
    expect(boxes.length).toBeGreaterThan(10);
    let overlaps = overlapsAmong(boxes);
    expect(overlaps, describeFaults(overlaps)).toEqual([]);
    await page.evaluate(() => window.__worldMap!.under(true));
    boxes = await textBoxes(page, BOARD_TEXT);
    expect(boxes.length).toBeGreaterThan(10);
    overlaps = overlapsAmong(boxes);
    expect(overlaps, describeFaults(overlaps)).toEqual([]);
  });

  for (const [thing, folder] of [["gateway", "Gateway"], ["hub", "Hub"]]) {
    test(`${thing} opens into the Membrane Map on its folder, where nothing collides and nothing is cut off`, async ({ page }) => {
      await openEstate(page);
      await page.evaluate((name) => window.__worldMap!.enter(name), thing);
      await expect(page.locator("#view-membrane.active")).toHaveCount(1);
      await expect(page.locator(`#view-membrane .membrane[data-id="${folder}"]:not(.membrane--collapsed)`)).toHaveCount(1);
      await page.waitForFunction(() => getComputedStyle(document.querySelector("#view-membrane")!).opacity === "1");
      await page.waitForTimeout(800);
      const boxes = await textBoxes(page, MEMBRANE_TEXT);
      expect(boxes.length).toBeGreaterThan(5);
      const overlaps = overlapsAmong(boxes);
      const cut = await truncations(page, MEMBRANE_TEXT);
      expect([...overlaps, ...cut], describeFaults(overlaps, cut)).toEqual([]);
    });
  }
});
