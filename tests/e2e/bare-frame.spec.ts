import { expect, test, type Page } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The Bare frame (a trial, 2026-11-19): with Tuning's Frame set to Bare the sidebar is not drawn, the places are a
 * breadcrumb in the top bar, the display filters and the legend one key from the strip, and Tuning a sheet from the
 * strip, each the sidebar's own elements moved; under Sidebar, the default, the page is as it was. Asserted by state and
 * order alone: what is shown, what is named, where focus stands.
 */
const FILE = "packages/explorer/src/client/errors.ts";
const local = (node: string): string => `/?view=local&node=${node}`;

test.use({ viewport: { width: 1440, height: 900 } });

async function started(page: Page): Promise<void> {
  await expect(page.locator("#stats-line")).not.toHaveText(/^Loading/u);
}

/** Remembers the Bare frame before the page loads, as a viewer's choice of it would be remembered. */
async function bare(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { appearance: { frame: "bare" } } })
  });
}

const crumbs = (page: Page) => page.getByRole("navigation", { name: "Places" }).locator(".frame-crumb");

test("the sidebar frames the map by default, and no crumbs are drawn", async ({ page }) => {
  await page.goto(local(FILE));
  await started(page);
  await expect(page.locator("#sidebar")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Places" })).toBeHidden();
  await expect(page.locator("#sidebar #filter-toggle-tests")).toHaveCount(1);
  await expect(page.locator("#sidebar .tuning-content")).toHaveCount(1);
});

test("under Bare the crumbs run from the World Map through each directory to the file, and a directory's crumb goes out to it", async ({ page }) => {
  await bare(page);
  await page.goto(local(FILE));
  await started(page);
  await expect(page.locator("#sidebar")).toBeHidden();
  await expect(crumbs(page)).toHaveCount(7);
  const names = await crumbs(page).evaluateAll(buttons => buttons.map(button => button.getAttribute("aria-label") ?? button.textContent));
  expect(names).toEqual(["World Map", "Scan root", "packages", "explorer", "src", "client", "errors.ts"]);
  await expect(crumbs(page).last()).toHaveAttribute("aria-current", "location");
  // The first crumb says the counts the sidebar's footer said.
  await expect(crumbs(page).first()).toHaveAttribute("title", await page.locator("#stats-line").innerText());
  await crumbs(page).filter({ hasText: "client" }).click();
  await expect(crumbs(page).last()).toHaveText("client");
  await expect(crumbs(page).last()).toHaveAttribute("aria-current", "location");
});

test("under Bare the key holds the filters and the legend, and Escape closes it back to its button", async ({ page }) => {
  await bare(page);
  await page.goto(local(FILE));
  await started(page);
  const key = page.getByRole("button", { name: "Key" });
  await expect(key).toHaveAttribute("aria-expanded", "false");
  await key.click();
  const dialog = page.getByRole("dialog", { name: "Key" });
  await expect(dialog).toBeVisible();
  await expect(key).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.locator("#filter-toggle-tests")).toHaveCount(1);
  await expect(dialog.locator("#local-legend")).toBeVisible();
  // The key's filter is the sidebar's own: its state is the page's.
  const tests = dialog.locator("#filter-toggle-tests");
  const before = await tests.isChecked();
  await tests.click();
  await expect(tests).toBeChecked({ checked: !before });
  await tests.focus();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(key).toBeFocused();
});

test("under Bare Tuning is a sheet from the strip, and its Frame lever returns the sidebar with everything in it", async ({ page }) => {
  await bare(page);
  await page.goto(local(FILE));
  await started(page);
  await page.getByRole("button", { name: "Layout tuning" }).click();
  const sheet = page.getByRole("dialog", { name: "Tuning" });
  await expect(sheet).toBeVisible();
  // Tuning's count and Reset travel with it: the count, which stood beside the heading, stands before Reset.
  await expect(sheet.locator(".tuning-head > #tuning-changed + #tuning-reset")).toHaveCount(1);
  await expect(sheet.locator("#tuning-changed")).toBeHidden();
  await sheet.locator("#tuning-symbol-order").selectOption("alphabetical");
  await expect(sheet.locator("#tuning-changed")).toBeVisible();
  await expect(sheet.locator("#tuning-reset")).toBeEnabled();
  await sheet.locator("#tuning-frame").selectOption("sidebar");
  await expect(page.locator("#sidebar summary #tuning-changed")).toHaveCount(1);
  await expect(page.locator("#sidebar")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Places" })).toBeHidden();
  await expect(page.locator("#sidebar .tuning-content #tuning-frame")).toHaveCount(1);
  await expect(page.locator("#sidebar #filter-toggle-tests")).toHaveCount(1);
  await expect(page.locator("#sidebar #map-legend")).toHaveCount(1);
  await expect(page.locator("#sidebar .nav-item")).toHaveCount(3);
  await expect(page.locator("#sidebar #history-back")).toHaveCount(1);
});

test("under Bare the views are a menu after the crumbs, and choosing one goes there", async ({ page }) => {
  await bare(page);
  await page.goto(local(FILE));
  await started(page);
  await page.getByRole("button", { name: "Views", exact: true }).click();
  await page.locator("#frame-views .nav-item[data-view=\"sources\"]").click();
  await expect(page.locator("#frame-views")).toBeHidden();
  await expect(crumbs(page)).toHaveCount(1);
  await expect(crumbs(page).first()).toHaveAttribute("aria-label", "Knowledge Sources");
});

test.describe("on a narrow window", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("under Bare only the innermost crumb shows, with a way out one scale", async ({ page }) => {
    await bare(page);
    await page.goto(local(FILE));
    await started(page);
    const visible = await crumbs(page).evaluateAll(buttons => buttons.filter(button => button.checkVisibility()).map(button => button.textContent));
    expect(visible).toEqual(["errors.ts"]);
    const out = page.getByRole("button", { name: "Out to client" });
    await expect(out).toBeVisible();
    await out.click();
    await expect(crumbs(page).last()).toHaveText("client");
  });

  // The menu once took the key's placing over the strip and stood ten pixels tall, its three views spilling out of it
  // with no ground under them (2026-11-19).
  test("under Bare the views' menu holds its three views on its own ground", async ({ page }) => {
    await bare(page);
    await page.goto(local(FILE));
    await started(page);
    await page.getByRole("button", { name: "Views", exact: true }).click();
    const inside = await page.locator("#frame-views").evaluate(menu => {
      const box = menu.getBoundingClientRect();
      return [...menu.querySelectorAll(".nav-item")].every(item => {
        const own = item.getBoundingClientRect();
        return own.top >= box.top && own.bottom <= box.bottom && own.left >= box.left && own.right <= box.right;
      });
    });
    expect(inside).toBe(true);
  });
});
