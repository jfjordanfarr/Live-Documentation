import { test, expect, type Page } from "@playwright/test";

import { localMapSettled } from "./still-picture";

const FIXTURE_DIR = "packages/engine/src";
const FIXTURE_SUBDIR = `${FIXTURE_DIR}/config`;
const FIXTURE_FILE = `${FIXTURE_SUBDIR}/liveDocumentationConfig.ts`;

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
    await page.goto(`/?view=local&node=${FIXTURE_FILE}&dir=${FIXTURE_DIR}`);
    await page.getByRole("button", { name: `Open ${FIXTURE_SUBDIR}`, exact: true }).click();
    await localMapSettled(page);
    const folderUrl = page.url();

    await page.locator(`.node-card[data-id="${FIXTURE_FILE}"] .node-title`).click();
    await expect(page.getByRole("button", { name: "Clear exploration pins" })).toBeVisible();
    expect(page.url(), "a pin changes the address of the place").not.toBe(folderUrl);

    await openView(page, "sources");
    await page.goBack();
    await expect.poll(() => activeView(page)).toBe("map");
    await expect(page.getByRole("button", { name: "Clear exploration pins" }), "the place comes back with its pins").toBeVisible();

    await page.goBack();
    await expect.poll(() => activeView(page)).toBe("map");
    await expect(page.getByRole("button", { name: "Clear exploration pins" }), "Back left the folder, not the pins").toBeHidden();
    await expect(page.getByRole("button", { name: `Open ${FIXTURE_SUBDIR}`, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: `Close ${FIXTURE_SUBDIR}`, exact: true })).toHaveCount(0);
  });

  test("a thing opened from the World Map is a step back to the board, and Forward opens it again", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__worldMap?.ready === true);
    await page.evaluate(() => window.__worldMap!.pin("piece", "engine"));
    await page.locator("#view-world .world-evidence a[data-open='engine']").click();
    const engine = page.locator('#view-map .local-directory-label[data-directory="packages/engine"]');
    await expect(engine).toHaveCount(1);

    await page.goBack();
    await expect(page.locator("#view-world.active")).toHaveCount(1);
    await expect.poll(() => activeView(page)).toBe("world");

    await page.goForward();
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect(engine).toHaveCount(1);
  });
});
