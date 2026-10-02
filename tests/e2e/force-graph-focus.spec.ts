import { test, expect, type Page } from "@playwright/test";

const GRAPH = "packages/engine/src/live-docs/graph.ts";
const DOCUMENT = "packages/engine/src/live-docs/document.ts";

async function expectFocused(page: Page, id: string): Promise<void> {
  const label = page.locator(".force-graph-focus");
  await expect(label).toHaveAttribute("data-node-id", id);
  await expect(label).toBeVisible();
  await expect.poll(() => page.locator("#graph-svg").evaluate(element => {
    const marker = element.querySelector<HTMLElement>(".force-graph-focus")!;
    return Math.hypot(parseFloat(marker.style.left) - element.clientWidth / 2, parseFloat(marker.style.top) - element.clientHeight / 2);
  })).toBeLessThan(8);
}

test("a focused URL centers the actual graph node and opens that file's details", async ({ page }) => {
  await page.goto(`/?view=force&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  const canvas = page.locator("#graph-svg canvas");
  const box = (await canvas.boundingBox())!;
  // Hit the rendered sphere, not the HTML label, to verify the camera's target.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator("#detail-panel")).toContainText(GRAPH);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  await page.locator('[onclick="openInLocalView()"]').click();
  await expect(page.locator(`.node-card.local-focus[data-id="${GRAPH}"]`)).toBeVisible();
  await page.goBack();
  await expectFocused(page, GRAPH);
});

test("search moves focus smoothly, survives filtering, and resizes with its container", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`/?view=force&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  await page.keyboard.press("Control+p");
  await page.locator("#omnisearch-input").fill(DOCUMENT);
  await page.locator(".omnisearch-result").first().click();
  await expectFocused(page, DOCUMENT);
  await page.locator("#detail-close").click();
  await page.locator("#filter-toggle-tests").uncheck();
  await expectFocused(page, DOCUMENT);
  await page.setViewportSize({ width: 1100, height: 800 });
  await expectFocused(page, DOCUMENT);
  const container = (await page.locator("#graph-svg").boundingBox())!;
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
  expect(canvas.width).toBe(container.width);
  expect(canvas.height).toBe(container.height);
});

test("manual pan survives a trip to detail and back without restarting the settled layout", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto(`/?view=force&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  // The existing force simulation has a 15-second cooldown. Compare a settled graph.
  await page.waitForTimeout(16_000);
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
  const x = canvas.x + canvas.width * 0.7, y = canvas.y + canvas.height * 0.7;
  await page.mouse.move(x, y);
  await page.mouse.down({ button: "right" });
  // Deliver a real drag over several rendered frames. A burst of synthetic
  // moves can be coalesced before TrackballControls observes the gesture.
  for (let step = 1; step <= 10; step++) {
    await page.mouse.move(x + step * 6, y - step * 2);
    await page.waitForTimeout(25);
  }
  await page.mouse.up({ button: "right" });
  const position = (): Promise<{ x: number; y: number }> => page.locator(".force-graph-focus").evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left), y: parseFloat((element as HTMLElement).style.top) }));
  let previous = await position();
  let stillFrames = 0;
  await expect.poll(async () => {
    const next = await position();
    stillFrames = Math.hypot(next.x - previous.x, next.y - previous.y) < 0.1 ? stillFrames + 1 : 0;
    previous = next;
    return stillFrames;
  }, { intervals: [100], timeout: 5000 }).toBeGreaterThanOrEqual(3);
  const before = await position();
  expect(Math.hypot(before.x - canvas.width / 2, before.y - canvas.height / 2)).toBeGreaterThan(20);
  await page.locator('.nav-item[data-view="map"]').click();
  await page.locator('.nav-item[data-view="graph"]').click();
  await page.waitForTimeout(800);
  const after = await position();
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(3);
});

test("reduced motion still focuses a requested file", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/samples/estate/?view=force&node=${encodeURIComponent("PaymentService/PaymentService.cs")}`);
  await expectFocused(page, "PaymentService/PaymentService.cs");
});
