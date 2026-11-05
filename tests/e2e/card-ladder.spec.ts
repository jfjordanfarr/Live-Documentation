import { expect, test, type Page } from "@playwright/test";

import { localMapSettled } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The card ladder of November 5 (Turn 9), slot composition: inside a box that never changes, the camera's zoom picks a
 * band, and each band below reading scale lets one tier of the card leave while names, the node's controls and the
 * anchor dots hold their screen size by the resistances in Tuning. The bands are read from the map's `data-lod`.
 */
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;

const layoutBoxes = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => ({
  id: (element as HTMLElement).dataset.id!, width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight
})).sort((a, b) => a.id.localeCompare(b.id)));

/** Screen sizes of the parts whose constancy the ladder promises, and the band the map reports. */
const reading = (page: Page) => page.evaluate(id => {
  const card = document.querySelector(`.node-card[data-id="${id}"]`)!;
  const size = (selector: string): number => { const box = card.querySelector(selector)!.getBoundingClientRect(); return box.height; };
  const width = (selector: string): number => card.querySelector(selector)!.getBoundingClientRect().width;
  return {
    band: document.querySelector<HTMLElement>("#map-container")!.dataset.lod,
    scale: new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a,
    name: size('.symbol-row[data-symbol="PaymentService"] .symbol-label'),
    more: width(".local-file-more"),
    anchor: width('.symbol-row[data-symbol="PaymentService"] .symbol-anchor.inbound')
  };
}, payment);

async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.evaluate(async () => {
    let previous = "", since = performance.now();
    const deadline = since + 5000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const picture = [...document.querySelectorAll(".node-card")].map(element => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      });
      const value = JSON.stringify(picture);
      if (value !== previous) { previous = value; since = performance.now(); }
      if (performance.now() - since > 150) return;
    }
    throw new Error("The picture did not settle");
  });
}

/** Zoom out one step at a time until the map reports the band, within a bounded number of steps. */
async function zoomOutTo(page: Page, band: string): Promise<void> {
  for (let step = 0; step < 8; step += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    if ((await reading(page)).band === band) return;
  }
  throw new Error(`The ${band} band was not reached in eight steps`);
}

test.use({ viewport: { width: 1440, height: 960 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardText: "slot" } } })
  });
});

test("each band below reading scale lets one tier leave, names and controls hold their screen size, and no box changes", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await still(page);
  const boxes = await layoutBoxes(page);
  const start = await reading(page);
  expect(start.band).toBe("reading");
  const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(row.locator(".local-symbol-pin")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();

  // One step closer stays in the reading band: the name grows with the map, the More button and the anchor dot do not.
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await still(page);
  const closer = await reading(page);
  expect(closer.band).toBe("reading");
  expect(closer.scale).toBeGreaterThan(start.scale);
  expect(closer.name / start.name).toBeCloseTo(closer.scale / start.scale, 1);
  expect(Math.abs(closer.more - start.more)).toBeLessThan(1);
  expect(Math.abs(closer.anchor - start.anchor)).toBeLessThan(1);
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await still(page);

  // Middle: the descriptions, the row controls and the badges leave; the name holds most of its screen size
  // (resistance 0.8), the node's controls and the anchor dots all of it; every box is the same.
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  await expect(row.locator(".local-reading-slot")).toBeHidden();
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(row.locator(".local-symbol-pin")).toBeHidden();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  const expectedName = (band: { scale: number }): number => start.name * (band.scale / start.scale) ** 0.2;
  expect(Math.abs(middle.name - expectedName(middle))).toBeLessThan(1);
  expect(Math.abs(middle.more - start.more)).toBeLessThan(1);
  expect(Math.abs(middle.anchor - start.anchor)).toBeLessThan(1);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Far: the path, the directory line and the counts leave, and More alone remains of the node's controls.
  await zoomOutTo(page, "far");
  const far = await reading(page);
  await expect(subject.locator(".node-path")).toBeHidden();
  await expect(subject.locator(".node-directory")).toBeHidden();
  await expect(subject.locator(".local-file-pin")).toBeHidden();
  await expect(subject.locator(".local-file-close")).toBeHidden();
  await expect(subject.locator(".local-file-more")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeVisible();
  expect(Math.abs(far.name - expectedName(far))).toBeLessThan(1);
  expect(Math.abs(far.more - start.more)).toBeLessThan(1);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Reset Zoom returns the reading band with everything back.
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await still(page);
  const back = await reading(page);
  expect(back.band).toBe("reading");
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  expect(Math.abs(back.name - start.name)).toBeLessThan(0.5);
  expect(await layoutBoxes(page)).toEqual(boxes);
});

test("the resistances in Tuning change how much names and controls hold their size, and 0 follows the map", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await still(page);
  const start = await reading(page);
  await page.getByText("Tuning", { exact: true }).click();
  const section = page.locator("details.tuning-subsection").filter({ hasText: "2D Layout" });
  if (!await section.evaluate(details => (details as HTMLDetailsElement).open)) await section.locator("summary").click();
  for (const id of ["tuning-text-resistance", "tuning-control-resistance"]) {
    await page.locator(`#${id}`).evaluate(input => {
      (input as HTMLInputElement).value = "0";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator(`#${id}-value`)).toHaveText("0");
  }
  await still(page);
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  // With no resistance everything scales with the map, controls included.
  expect(middle.name / start.name).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.more / start.more).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.anchor / start.anchor).toBeCloseTo(middle.scale / start.scale, 1);
});
