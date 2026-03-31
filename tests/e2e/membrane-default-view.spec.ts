import { test, expect } from "@playwright/test";

/**
 * Membrane Map — Cold-Start Default
 *
 * Dev Day 86: Membrane graduated from an opt-in view to the default
 * first-load landing. This regression guards the initial shell state,
 * the runtime fallback in `parseInitialState()`, and explicit URL writing
 * for non-default views after the change.
 */

test.describe("Membrane Map — Cold-Start Default", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("root URL lands on Membrane Map for first-time visitors", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForSelector(".membrane-browse-root, .pin-active-root", {
      timeout: 10_000,
    });

    await expect(page.locator('.nav-item.active[data-view="membrane"]')).toHaveCount(1);
    await expect(page.locator("#view-membrane.active")).toHaveCount(1);
  });

  test("switching to Local Map writes an explicit local view parameter", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForSelector(".membrane-browse-root, .pin-active-root", {
      timeout: 10_000,
    });

    await page.locator('.nav-item[data-view="map"]').click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("view"))
      .toBe("local");
  });
});