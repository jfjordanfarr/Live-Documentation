import { test, expect, type Page } from "@playwright/test";

import { FIXTURE_FILE, FIXTURE_SUBDIR, expandDirectory, goToMembraneMap, pinAllOnCard } from "./helpers";

/**
 * Back and Forward between places. A move to another view, another file or another folder is an entry in the
 * browser's history; a pin, an expanded card, a pan or a zoom rewrites the entry of the place it is made in, so Back
 * never walks through pins. The page's own buttons and the browser's go the same way.
 */

const activeView = (page: Page): Promise<string | null> => page.locator(".nav-item.active").getAttribute("data-view");

const openView = async (page: Page, view: string): Promise<void> => {
  await page.locator(`.nav-item[data-view="${view}"]`).click();
  await expect.poll(() => activeView(page)).toBe(view);
};

test.describe("Back and Forward", () => {
  test("walk back and forward through the views visited, by the page's buttons and the browser's", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => activeView(page)).toBe("world");
    await expect(page.locator("#history-back")).toBeDisabled();
    await expect(page.locator("#history-forward")).toBeDisabled();

    await openView(page, "map");
    await openView(page, "sources");
    await expect(page.locator("#history-back")).toBeEnabled();

    await page.locator("#history-back").click();
    await expect.poll(() => activeView(page)).toBe("map");
    await expect(page.locator("#history-forward")).toBeEnabled();

    await page.goBack();
    await expect.poll(() => activeView(page)).toBe("world");
    await expect(page.locator("#history-back")).toBeDisabled();

    await page.locator("#history-forward").click();
    await expect.poll(() => activeView(page)).toBe("map");
    await page.goForward();
    await expect.poll(() => activeView(page)).toBe("sources");
    await expect(page.locator("#history-forward")).toBeDisabled();
  });

  test("an opened folder is a step back, and pins made in it are not", async ({ page }) => {
    await goToMembraneMap(page);
    await expandDirectory(page, FIXTURE_SUBDIR);
    const folderUrl = page.url();

    await pinAllOnCard(page, FIXTURE_FILE);
    await expect(page.locator(".pin-active-root")).toBeVisible();
    expect(page.url(), "a pin changes the address of the place").not.toBe(folderUrl);

    await openView(page, "map");
    await page.goBack();
    await expect.poll(() => activeView(page)).toBe("membrane");
    await expect(page.locator(".pin-active-root"), "the place comes back with its pins").toBeVisible();

    await page.goBack();
    await expect.poll(() => activeView(page)).toBe("membrane");
    await expect(page.locator(".pin-active-root"), "Back left the folder, not the pins").toHaveCount(0);
    await expect(page.locator(`.membrane--collapsed[data-id="${FIXTURE_SUBDIR}"]`)).toBeVisible();
  });

  test("a thing opened from the World Map is a step back to the board, and Forward opens it again", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__worldMap?.ready === true);
    await page.evaluate(() => window.__worldMap!.pin("piece", "engine"));
    await page.locator("#view-world .world-evidence a[data-open='engine']").click();
    const engine = page.locator('#view-membrane .membrane[data-id="packages/engine"]:not(.membrane--collapsed)');
    await expect(engine).toHaveCount(1);

    await page.goBack();
    await expect(page.locator("#view-world.active")).toHaveCount(1);
    await expect.poll(() => activeView(page)).toBe("world");

    await page.goForward();
    await expect(page.locator("#view-membrane.active")).toHaveCount(1);
    await expect(engine).toHaveCount(1);
  });
});
