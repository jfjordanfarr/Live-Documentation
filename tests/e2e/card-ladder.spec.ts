import { expect, test, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The card ladder of November 5 (Turn 9), slot composition: inside a box that never changes, the camera's zoom picks a
 * band, and each band below reading scale lets one tier of the card leave while names, the node's controls and the
 * anchor dots hold their screen size by the resistances in Tuning, and below reading scale a name grows into the room
 * its description leaves, up to Name Growth times its held size (Turn 11). The bands are read from the map's `data-lod`.
 */
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;

const layoutBoxes = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => ({
  id: (element as HTMLElement).dataset.id!, width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight
})).sort((a, b) => a.id.localeCompare(b.id)));

/** Screen sizes of the parts whose constancy the ladder promises, the band the map reports, and the rooms and growth it wrote. */
const reading = (page: Page) => page.evaluate(id => {
  const container = document.querySelector<HTMLElement>("#map-container")!;
  const card = document.querySelector<HTMLElement>(`.node-card[data-id="${id}"]`)!;
  const row = card.querySelector<HTMLElement>('.symbol-row[data-symbol="PaymentService"]')!;
  const size = (selector: string): number => card.querySelector(selector)!.getBoundingClientRect().height;
  const width = (selector: string): number => card.querySelector(selector)!.getBoundingClientRect().width;
  const number = (element: HTMLElement, name: string): number => parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;
  return {
    band: container.dataset.lod,
    scale: new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a,
    name: size('.symbol-row[data-symbol="PaymentService"] .symbol-label .symbol-label-text'),
    title: size(".local-file-name .local-file-name-text"),
    more: width(".local-file-more"),
    anchor: width('.symbol-row[data-symbol="PaymentService"] .symbol-anchor.inbound'),
    fillMiddle: number(row, "--fill-middle"), fillFar: number(row, "--fill-far"), growth: number(container, "--name-growth"), controlScale: number(container, "--control-scale"),
    titleFillH: number(card, "--title-fill-h"), titleRoomW: number(card, "--title-room-w"), titleW: number(card, "--title-w"), actionsW: number(card, "--actions-w"), moreW: number(card, "--more-w")
  };
}, payment);

/** Zoom out one step at a time until the map reports the band, within a bounded number of steps. */
async function zoomOutTo(page: Page, band: string): Promise<void> {
  for (let step = 0; step < 8; step += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
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
  await localMapStill(page);
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
  await localMapStill(page);
  const closer = await reading(page);
  expect(closer.band).toBe("reading");
  expect(closer.scale).toBeGreaterThan(start.scale);
  expect(closer.name / start.name).toBeCloseTo(closer.scale / start.scale, 1);
  expect(Math.abs(closer.more - start.more)).toBeLessThan(1);
  expect(Math.abs(closer.anchor - start.anchor)).toBeLessThan(1);
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await localMapStill(page);

  // Middle: the descriptions, the row controls, the badges, the path and the directory line leave; the name holds its
  // screen size (resistance 1) and grows into its row's room up to Name Growth (1.5), the file's name likewise within
  // its header and short of the card's buttons; the node's controls and the anchor dots hold their size; every box is
  // the same.
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  await expect(row.locator(".local-reading-slot")).toBeHidden();
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(row.locator(".local-symbol-pin")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeHidden();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  const ratioOf = (band: { scale: number }): number => band.scale / start.scale;
  const expectedName = (band: typeof middle, fill: number): number => start.name * Math.min(fill * ratioOf(band), band.growth);
  const expectedTitle = (band: typeof middle, intruding: number): number => start.title * Math.min(band.titleFillH * ratioOf(band),
    (band.titleRoomW - intruding * (band.controlScale - 1)) / band.titleW * ratioOf(band), band.growth);
  expect(middle.fillMiddle).toBeGreaterThan(1);
  expect(middle.fillFar).toBeGreaterThanOrEqual(middle.fillMiddle);
  expect(middle.growth).toBe(1.5);
  expect(Math.abs(middle.name - expectedName(middle, middle.fillMiddle))).toBeLessThan(1);
  expect(middle.name).toBeGreaterThan(start.name);
  expect(Math.abs(middle.title - expectedTitle(middle, middle.actionsW))).toBeLessThan(1);
  expect(Math.abs(middle.more - start.more)).toBeLessThan(1);
  expect(Math.abs(middle.anchor - start.anchor)).toBeLessThan(1);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Far: More alone remains of the node's controls, the row's Pin and More leave, and the names fill the whole row.
  await zoomOutTo(page, "far");
  const far = await reading(page);
  await expect(row.locator(".local-symbol-pin")).toBeHidden();
  await expect(subject.locator(".node-path")).toBeHidden();
  await expect(subject.locator(".node-directory")).toBeHidden();
  await expect(subject.locator(".local-file-pin")).toBeHidden();
  await expect(subject.locator(".local-file-close")).toBeHidden();
  await expect(subject.locator(".local-file-more")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeVisible();
  expect(Math.abs(far.name - expectedName(far, far.fillFar))).toBeLessThan(1);
  expect(Math.abs(far.title - expectedTitle(far, far.moreW))).toBeLessThan(1);
  expect(Math.abs(far.more - start.more)).toBeLessThan(1);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Reset Zoom returns the reading band with everything back.
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await localMapStill(page);
  const back = await reading(page);
  expect(back.band).toBe("reading");
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  expect(Math.abs(back.name - start.name)).toBeLessThan(0.5);
  expect(Math.abs(back.title - start.title)).toBeLessThan(0.5);
  expect(await layoutBoxes(page)).toEqual(boxes);
});

test("the resistances and the growth in Tuning change how much names and controls hold their size, and 0 and 1 follow the map", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapStill(page);
  const start = await reading(page);
  await page.getByText("Tuning", { exact: true }).click();
  const section = page.locator("details.tuning-subsection").filter({ hasText: "2D Layout" });
  if (!await section.evaluate(details => (details as HTMLDetailsElement).open)) await section.locator("summary").click();
  for (const [id, value] of [["tuning-text-resistance", "0"], ["tuning-control-resistance", "0"], ["tuning-name-growth", "1"]] as const) {
    await page.locator(`#${id}`).evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
    await expect(page.locator(`#${id}-value`)).toHaveText(value);
  }
  await localMapStill(page);
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  // With no resistance and no growth everything scales with the map, controls and the file's name included.
  expect(middle.name / start.name).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.title / start.title).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.more / start.more).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.anchor / start.anchor).toBeCloseTo(middle.scale / start.scale, 1);
});
