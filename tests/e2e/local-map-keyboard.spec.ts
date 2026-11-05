import { expect, test } from "@playwright/test";

import { localMapSettled } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

test("Tab keeps each native map command in the unobstructed frame without changing exploration", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 960 });
  const nodeId = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: nodeId })}`);
  await page.locator(`.node-card[data-id="${nodeId}"]`).waitFor();
  await localMapSettled(page);
  await page.mouse.move(280, 55);
  const scale = () => page.locator("#map-viewport").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a);
  const initialScale = await scale();
  const snapshot = () => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  const before = snapshot();
  // Start at a native name, then use actual browser Tab navigation through rows and neighboring cards.
  await page.locator(`.node-card[data-id="${nodeId}"] .local-file-inspect`).focus();
  let commands = 0;
  for (let index = 0; index < 100; index++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(180);
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || !element.closest(".node-card")) return null;
      const rect = element.getBoundingClientRect();
      const main = document.querySelector("#main")!.getBoundingClientRect();
      const controls = document.querySelector(".perspective-controls")!.getBoundingClientRect();
      return { name: element.getAttribute("aria-label") ?? element.textContent, left: rect.left, right: rect.right,
        top: rect.top, bottom: rect.bottom, frame: { left: main.left, right: main.right, top: main.top, bottom: controls.top } };
    });
    if (!focused) continue;
    commands++;
    expect(focused.left, focused.name ?? "command").toBeGreaterThanOrEqual(focused.frame.left);
    expect(focused.right, focused.name ?? "command").toBeLessThanOrEqual(focused.frame.right);
    expect(focused.top, focused.name ?? "command").toBeGreaterThanOrEqual(focused.frame.top);
    expect(focused.bottom, focused.name ?? "command").toBeLessThanOrEqual(focused.frame.bottom);
  }
  expect(commands).toBeGreaterThan(20);
  expect(snapshot().selectedNodeId).toEqual(before.selectedNodeId);
  expect(snapshot().pinSet).toEqual(before.pinSet);
  expect(snapshot().reading).toEqual(before.reading);
  expect(await scale()).toBeCloseTo(initialScale, 5);
});
