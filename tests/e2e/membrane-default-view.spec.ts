import { test, expect } from "@playwright/test";

/**
 * Cold-start default.
 *
 * A bundle that carries a board opens on the World Map, the outside of
 * everything, since 2026-09-28; before that the Membrane Map was the landing
 * view (Dev Day 86, 2026-03-31). This regression guards the initial shell
 * state, the runtime fallback in `parseInitialState()`, and explicit URL
 * writing for non-default views after a switch.
 */

test.describe("Cold-start default", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("root URL lands on the World Map for first-time visitors when the bundle carries a board", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("text=nodes", { timeout: 10_000 });
    await page.waitForFunction(() => (window as Window & { __worldMap?: { ready: boolean } }).__worldMap?.ready === true, null, { timeout: 20_000 });

    await expect(page.locator('.nav-item.active[data-view="world"]')).toHaveCount(1);
    await expect(page.locator("#view-world.active")).toHaveCount(1);
  });

  test("the Membrane Map still opens when asked for by URL", async ({ page }) => {
    await page.goto("/?view=membrane");
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

    await page.locator('.nav-item[data-view="map"]').click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("view"))
      .toBe("local");
  });
});
