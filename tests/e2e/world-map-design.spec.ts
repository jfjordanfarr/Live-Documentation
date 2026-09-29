import { test, expect, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";

/**
 * The World Map's words must not land on each other.
 *
 * Each test puts the view in one state, over this repository's board, and
 * asks the design audit whether any two visible labels collide, or any text
 * is cut off. A failure names the words, which a screenshot would show but a
 * test on the DOM would not.
 */

const BOARD_TEXT = ["#view-world svg text"];
const INSIDE_TEXT = ["#view-world .world-inside .inside-card .name", "#view-world .world-inside .inside-card .path", "#view-world .world-inside .inside-card .row", "#view-world .world-inside .inside-walltext"];

interface WorldMapHandle {
  ready: boolean;
  instant: (value: boolean) => void;
  reset: () => void;
  under: (value: boolean) => void;
  rotate: (quarters?: number) => Promise<void>;
  zoom: (k: number) => number;
  enter: (name: string) => Promise<void>;
  openFolder: (folder: string) => void;
  pieces: () => string[];
}

declare global {
  interface Window {
    __worldMap?: WorldMapHandle;
  }
}

async function openWorldMap(page: Page): Promise<void> {
  await page.goto("/?view=world");
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
  await page.evaluate(() => {
    window.__worldMap!.instant(true);
    window.localStorage.clear();
    window.__worldMap!.reset();
  });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#view-world")!).opacity === "1");
}

async function boardLabels(page: Page) {
  const boxes = await textBoxes(page, BOARD_TEXT);
  expect(boxes.length).toBeGreaterThan(5);
  return boxes;
}

async function insideText(page: Page) {
  const boxes = await textBoxes(page, INSIDE_TEXT);
  expect(boxes.length).toBeGreaterThan(5);
  return boxes;
}

test.describe("World Map design audit", () => {
  test("no two labels collide on the board at rest", async ({ page }) => {
    await openWorldMap(page);
    const overlaps = overlapsAmong(await boardLabels(page));
    expect(overlaps, describeFaults(overlaps)).toEqual([]);
  });

  test("no two labels collide with the built-on layer showing", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.under(true));
    const overlaps = overlapsAmong(await boardLabels(page));
    expect(overlaps, describeFaults(overlaps)).toEqual([]);
  });

  test("nor after a turn and a zoom, when labels keep their size and the world does not", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.under(true));
    await page.evaluate(() => window.__worldMap!.rotate(1));
    await page.evaluate(() => window.__worldMap!.zoom(0.6));
    const overlaps = overlapsAmong(await boardLabels(page));
    expect(overlaps, describeFaults(overlaps)).toEqual([]);
  });

  test("inside a thing, no labels collide and no card's text is cut off", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.enter("engine"));
    const overlaps = overlapsAmong(await insideText(page));
    const cut = await truncations(page, INSIDE_TEXT.slice(0, 3));
    expect([...overlaps, ...cut], describeFaults(overlaps, cut)).toEqual([]);
  });

  test("one level deeper the same holds", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.enter("engine"));
    await page.evaluate(() => window.__worldMap!.openFolder("packages/engine/src/live-docs"));
    const overlaps = overlapsAmong(await insideText(page));
    const cut = await truncations(page, INSIDE_TEXT.slice(0, 3));
    expect([...overlaps, ...cut], describeFaults(overlaps, cut)).toEqual([]);
  });
});
