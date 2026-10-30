import { expect, test, type Page } from "@playwright/test";

import { dragBy, LOCAL_MAP, localMapSettled } from "./still-picture";
import { framePadding } from "../../packages/explorer/src/client/views/localView/layout-measure";

/**
 * How the 2D Local Map frames itself on arrival (the October 23 review's findings 2, 9 and 13; the owner's choices of
 * 2026-10-30). The picture is drawn at reading size and framed whole when there is no subject: centred when it fits,
 * and when it does not, started at its top or left like a page, with a shadow at each edge it continues past. With a
 * subject, the camera centres on its card and keeps the picture visible. The frame is the map layer under the
 * toolbar, less what the open reader covers. Measured on the estate sample and this repository's own bundle.
 */

interface Box { left: number; top: number; right: number; bottom: number; width: number; height: number }

async function boxOf(page: Page, selector: string): Promise<Box> {
  return page.locator(selector).first().evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
  });
}

/** The frame the fit is computed for: the edge signs' element stands exactly over it. */
const frameOf = (page: Page): Promise<Box> => boxOf(page, "#view-map .map-edges");
/** The picture: the branch root is sized to it. */
const pictureOf = (page: Page): Promise<Box> => boxOf(page, "#map-container .local-layout");
/** Which edges the signs say the picture continues past. */
const signsOf = (page: Page): Promise<Record<string, string | undefined>> => page.locator("#view-map .map-edges").evaluate(element => ({ ...(element as HTMLElement).dataset }));

async function settled(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .local-placed", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(600);
}

/**
 * The rule for a picture framed whole, on one axis: centred when it overflows the frame by less than two paddings
 * (equal gaps, or equal nicks), else its near edge at the padding.
 */
function expectFramedWhole(near: number, far: number, frameNear: number, frameFar: number, padding: number): void {
  const overflow = (far - near) - (frameFar - frameNear);
  if (overflow <= 2 * padding) expect(Math.abs((near - frameNear) - (frameFar - far))).toBeLessThan(2);
  else expect(Math.abs(near - (frameNear + padding))).toBeLessThan(1.5);
}

test("a directory opened with no subject is framed whole: centred, nothing cut, no sign of more", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/samples/estate/?view=local&dir=Portal");
  await settled(page);
  const frame = await frameOf(page), picture = await pictureOf(page);
  expect(picture.width).toBeLessThan(frame.width);
  expect(picture.height).toBeLessThan(frame.height);
  expect(picture.left).toBeGreaterThanOrEqual(frame.left);
  expect(picture.right).toBeLessThanOrEqual(frame.right);
  expect(picture.top).toBeGreaterThanOrEqual(frame.top);
  expect(picture.bottom).toBeLessThanOrEqual(frame.bottom);
  // Centred both ways: the membrane and its label stand in the picture's measure, so neither is cut (finding 2).
  expect(Math.abs((picture.left - frame.left) - (frame.right - picture.right))).toBeLessThan(2);
  expect(Math.abs((picture.top - frame.top) - (frame.bottom - picture.bottom))).toBeLessThan(2);
  expect(await signsOf(page)).toEqual({ above: "false", below: "false", left: "false", right: "false" });
});

test("the root overview, taller than the frame, starts at the top like a page and says there is more below", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?view=local");
  await settled(page);
  const frame = await frameOf(page), picture = await pictureOf(page);
  expect(picture.height).toBeGreaterThan(frame.height);
  const { horizontal, vertical } = framePadding(frame);
  expectFramedWhole(picture.top, picture.bottom, frame.top, frame.bottom, vertical);
  expect(Math.abs(picture.top - (frame.top + vertical))).toBeLessThan(1.5);
  expectFramedWhole(picture.left, picture.right, frame.left, frame.right, horizontal);
  expect(await signsOf(page)).toMatchObject({ above: "false", below: "true" });
  // Panned down, the sign moves to where the hidden content now is.
  await dragBy(page, LOCAL_MAP, 0, -300);
  expect((await signsOf(page)).above).toBe("true");
});

test("a picture wider than the frame by more than two paddings starts at the left, with the sign of more at the right", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?view=local");
  await settled(page);
  const frame = await frameOf(page), picture = await pictureOf(page);
  const { horizontal } = framePadding(frame);
  expect(picture.width).toBeGreaterThan(frame.width + 2 * horizontal);
  expect(Math.abs(picture.left - (frame.left + horizontal))).toBeLessThan(1.5);
  expect(await signsOf(page)).toMatchObject({ left: "false", right: "true" });
});

test("the open reader is kept out of the frame: a fit beside it never puts the subject under it", async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  const subject = "Portal/Services/GatewayClient.cs";
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(subject)}`);
  await settled(page);
  const before = await boxOf(page, "#map-container .node-card.local-focus");
  await page.locator(`#map-container .node-card[data-id="${subject}"] .local-file-inspect`).click();
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/visible/);
  // The reader slides in over 300 ms; its box is read once it stands.
  await page.waitForTimeout(500);
  const readerBox = await boxOf(page, "#detail-panel");
  // Opening the reader moves nothing: the subject's card stands where it was, under the reader or not.
  expect(await boxOf(page, "#map-container .node-card.local-focus")).toEqual(before);
  // Framing again, by the Reset Zoom control, fits the picture to the frame the reader leaves.
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await page.waitForTimeout(700);
  await expect(reader).toHaveClass(/visible/);
  const frame = await frameOf(page);
  const focus = await boxOf(page, "#map-container .node-card.local-focus");
  expect(Math.abs(frame.right - readerBox.left)).toBeLessThan(2);
  expect(focus.left).toBeGreaterThanOrEqual(frame.left);
  expect(focus.right).toBeLessThanOrEqual(frame.right + 1);
  expect(focus.top).toBeGreaterThanOrEqual(frame.top);
  expect(focus.bottom).toBeLessThanOrEqual(frame.bottom + 1);
  // The subject's card is centred in that narrower frame when the picture around it does not fit, as here.
  const picture = await pictureOf(page);
  if (picture.width > frame.width) expect(Math.abs((focus.left + focus.right) / 2 - (frame.left + frame.right) / 2)).toBeLessThan(2);
});
