import { expect, test, type Browser, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ArrivalFraming } from "../../packages/explorer/src/client/types";
import { ARRIVAL_FLOOR_RATIO } from "../../packages/explorer/src/client/views/localView/camera-intent";
import { loadGraph, localMapSettled } from "./still-picture";

/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A step from inside the map keeps the camera's scale
 * and brings what it brought into view: the owner, on the cells, "I might wish the camera followed the newly-opened one
 * though, as I quickly lose it." A fresh subject is framed by Tuning's Arrival: at reading size, the default; at reading
 * size and then eased back to the neighbours, the owner's "reasonable best-of-both-worlds default?" for a reader who
 * must first see that the deepest level of detail exists; or on the neighbours at once. Read on this repository's
 * `pathfind.ts`, the owner's picture, and the estate's `PaymentsContext.cs`, whose neighbours all fit.
 */

const SUBJECT = "packages/engine/src/live-docs/pathfind.ts";
const HISTORY = "packages/engine/src/live-docs/history";
const ESTATE = "/samples/estate/";
const PAYMENTS = "PaymentService/Data/PaymentsContext.cs";

interface Box { left: number; top: number; right: number; bottom: number }

/** A fresh visitor at an address, with Tuning's Arrival chosen or left to its default, and the continuing search off. */
async function visit(browser: Browser, address: string, arrival?: ArrivalFraming, reducedMotion: "reduce" | "no-preference" = "no-preference") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...(arrival ? { arrival } : {}) } } })
  });
  const page = await context.newPage();
  await page.goto(address);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  return { context, page };
}

/** Waits for the map's rest: the camera's own moves, an arrival's hold and ease among them, and the picture's. */
async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.waitForTimeout(300);
  await localMapSettled(page);
}

/** The camera's frame on screen: the map layer's box under the toolbar, above the controls that float over its foot. */
const frameOf = (page: Page): Promise<Box> => page.evaluate(() => {
  const view = document.querySelector("#view-map")!.getBoundingClientRect(), layer = document.querySelector<HTMLElement>("#map-viewport")!;
  const left = view.left + layer.offsetLeft, top = view.top + layer.offsetTop, right = left + layer.offsetWidth;
  const controls = [...document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), #controls")].map(element => element.getBoundingClientRect())
    .filter(rect => rect.width && rect.height && rect.right > left && rect.left < right && rect.top >= top);
  return { left, top, right, bottom: Math.min(top + layer.offsetHeight, ...controls.map(rect => rect.top)) };
});

const boxOf = (page: Page, selector: string): Promise<Box | null> => page.evaluate(selector => {
  const rect = document.querySelector(selector)?.getBoundingClientRect();
  return rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } : null;
}, selector);

const inside = (box: Box, frame: Box): boolean =>
  box.left >= frame.left - 1 && box.right <= frame.right + 1 && box.top >= frame.top - 1 && box.bottom <= frame.bottom + 1;

/** The camera's scale and the look it draws. */
const cameraOf = (page: Page) => page.evaluate(() => ({
  k: new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a,
  look: document.querySelector<HTMLElement>("#map-container")!.dataset.look,
  moving: document.querySelector<HTMLElement>("#map-container")!.dataset.camera === "moving"
}));

const card = (id: string): string => `#map-container .node-card[data-id="${id}"]`;

test("a cell's press brings its new card wholly into view at the same scale, or its top where it is taller than the view, and marks it", async ({ browser }) => {
  test.setTimeout(120_000);
  // The owner's case: the reading look at pathfind.ts, a cell under live-docs/history. Its first cell's card was placed
  // past the view's right edge; its sixteenth cell's card is taller than the view at this scale.
  for (const index of [0, 15]) {
    const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`);
    await still(page);
    const cell = page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-field .local-directory-cell--file:not([hidden])`).nth(index);
    const path = (await cell.getAttribute("data-path"))!;
    const before = await cameraOf(page);
    await cell.click();
    // The newcomer's outline is drawn emphasised for about a second once the picture has settled.
    await expect(page.locator(`${card(path)}.local-step-mark`)).toHaveCount(1, { timeout: 10_000 });
    await still(page);
    await expect(page.locator(`${card(path)}.local-step-mark`)).toHaveCount(0);
    const after = await cameraOf(page);
    expect(after.k, "a step keeps the camera's scale").toBeCloseTo(before.k, 6);
    const frame = await frameOf(page), drawn = (await boxOf(page, card(path)))!, title = (await boxOf(page, `${card(path)} .node-title`))!;
    if (drawn.bottom - drawn.top <= frame.bottom - frame.top) {
      expect(inside(drawn, frame), `${path}'s card ${JSON.stringify(drawn)} wholly inside ${JSON.stringify(frame)}`).toBe(true);
    } else {
      expect(inside(title, frame), `${path}'s name row ${JSON.stringify(title)} inside ${JSON.stringify(frame)}`).toBe(true);
      expect(drawn.top, `${path}'s card entered at its top`).toBeGreaterThanOrEqual(frame.top - 1);
      expect(drawn.top, `${path}'s card entered at its top`).toBeLessThan(frame.top + 80);
    }
    await context.close();
  }
});

test("the default arrival rests on the subject's card at reading size and stays there", async ({ browser }) => {
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`);
  await still(page);
  const rest = await cameraOf(page);
  expect(rest.look).toBe("reading");
  await expect(page.locator("#tuning-arrival")).toHaveValue("reading");
  // Longer than any hold and ease: nothing eases back.
  await page.waitForTimeout(2500);
  expect(await cameraOf(page)).toEqual(rest);
  await context.close();
});

test("Reading, Then Neighbours rests at reading size, then ends with every card one connection from PaymentsContext.cs in view", async ({ browser }) => {
  test.setTimeout(90_000);
  const reading = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`);
  await still(reading.page);
  const readingK = (await cameraOf(reading.page)).k;
  await reading.context.close();
  const { context, page } = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "then-neighbours");
  // It arrives as the default does, at reading size, and says that the camera is busy while it holds there.
  await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && Math.abs(camera.k - readingK) < 1e-3; },
    { timeout: 5_000, intervals: [20] }).toBe(true);
  await still(page);
  const end = await cameraOf(page);
  expect(end.k).toBeLessThan(readingK);
  expect(end.k).toBeGreaterThanOrEqual(readingK * ARRIVAL_FLOOR_RATIO - 1e-6);
  const graph = await loadGraph(page, ESTATE);
  const id = (end: string | { id: string }): string => typeof end === "string" ? end : end.id;
  const neighbours = new Set(graph.links.flatMap(link => id(link.source) === PAYMENTS ? [id(link.target)] : id(link.target) === PAYMENTS ? [id(link.source)] : [])
    .filter(neighbour => neighbour !== PAYMENTS));
  expect(neighbours.size, "PaymentsContext.cs's neighbours").toBeGreaterThan(3);
  const frame = await frameOf(page);
  for (const neighbour of [PAYMENTS, ...neighbours]) {
    const drawn = await boxOf(page, card(neighbour));
    expect(drawn, `${neighbour} drawn`).not.toBeNull();
    expect(inside(drawn!, frame), `${neighbour} ${JSON.stringify(drawn)} wholly inside ${JSON.stringify(frame)}`).toBe(true);
  }
  await context.close();
});

test("Reading, Then Neighbours on pathfind.ts stops where names still read and centres the subject, its far neighbours cut", async ({ browser }) => {
  test.setTimeout(90_000);
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "then-neighbours");
  await expect.poll(async () => (await cameraOf(page)).look, { timeout: 5_000, intervals: [20] }).toBe("reading");
  const readingK = (await cameraOf(page)).k;
  await still(page);
  const end = await cameraOf(page);
  expect(end.look, "the connections look, where every card's names read").toBe("connections");
  expect(end.k).toBeCloseTo(readingK * ARRIVAL_FLOOR_RATIO, 6);
  const frame = await frameOf(page), subject = (await boxOf(page, card(SUBJECT)))!;
  expect((subject.left + subject.right) / 2).toBeCloseTo((frame.left + frame.right) / 2, 0);
  expect((subject.top + subject.bottom) / 2).toBeCloseTo((frame.top + frame.bottom) / 2, 0);
  await context.close();
});

test("the person's input during the hold ends the arrival where it stands", async ({ browser }) => {
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "then-neighbours");
  await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && camera.look === "reading"; }, { timeout: 5_000, intervals: [20] }).toBe(true);
  const frame = await frameOf(page);
  await page.mouse.move((frame.left + frame.right) / 2, (frame.top + frame.bottom) / 2);
  await page.mouse.wheel(0, 1);
  await still(page);
  const at = await cameraOf(page);
  await page.waitForTimeout(2500);
  const later = await cameraOf(page);
  expect(later).toEqual(at);
  expect(later.look, "the camera never eased back to the neighbours").toBe("reading");
  await context.close();
});

test("where the person prefers reduced motion, Reading, Then Neighbours arrives on the neighbours at once, as Neighbours does", async ({ browser }) => {
  const reduced = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "then-neighbours", "reduce");
  await localMapSettled(reduced.page);
  const first = await cameraOf(reduced.page);
  await reduced.context.close();
  const neighbours = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "neighbours");
  await still(neighbours.page);
  const end = await cameraOf(neighbours.page);
  await neighbours.context.close();
  expect(first.look).toBe("connections");
  expect(first.k).toBeCloseTo(end.k, 6);
});

test("a link carries Arrival: a fresh browser opens the link's choice", async ({ browser }) => {
  const link = `${ESTATE}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: PAYMENTS, pinSet: { entries: [{ nodeId: PAYMENTS, symbol: "*" }] },
    layout: { localMap: { arrival: "neighbours" } } })}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(link);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await still(page);
  expect((await cameraOf(page)).look).toBe("connections");
  await expect(page.locator("#tuning-arrival")).toHaveValue("neighbours");
  await context.close();
});
