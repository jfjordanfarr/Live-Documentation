import { test, expect, type Page } from "@playwright/test";

import { describeFaults, outlines, overlapsAmong, textBoxes, textOverShapes, truncations } from "./design-audit";
import { LOCAL_MAP } from "./still-picture";


/**
 * The World Map's words must not land on each other, nor on the pieces.
 *
 * Each test puts the view in one state and asks the design audit whether any
 * two visible labels collide, any label is drawn across a piece's outline,
 * its own or another's, or any text is cut off. A failure names the words,
 * which a screenshot would show but a test on the DOM would not.
 */

const BOARD_TEXT = ["#view-world svg text"];
const PIECE_FACES = "#view-world .w-piece .w-face";
const LOCAL_TEXT = [...LOCAL_MAP.text, "#controls .control-btn"];

async function openWorldMap(page: Page, address = "/?view=world"): Promise<void> {
  await page.goto(address);
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

/** A thing opened into the Local Map, its cards settled after the layout's animation. */
async function openThing(page: Page, name: string) {
  await page.evaluate((thing) => window.__worldMap!.enter(thing), name);
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#view-map")!).opacity === "1");
  await page.waitForTimeout(800);
  const boxes = await textBoxes(page, LOCAL_TEXT);
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

  test("nor with each thing pinned in turn, when its door labels show", async ({ page }) => {
    await openWorldMap(page);
    for (const name of await page.evaluate(() => window.__worldMap!.pieces())) {
      await page.evaluate((id) => window.__worldMap!.pin("piece", id), name);
      const overlaps = overlapsAmong(await boardLabels(page));
      expect(overlaps, `${name} pinned: ${describeFaults(overlaps)}`).toEqual([]);
    }
    await page.evaluate(() => window.__worldMap!.unpin());
  });

  test("a thing opened into the Local Map: no two words collide and nothing is cut off", async ({ page }) => {
    await openWorldMap(page);
    const overlaps = overlapsAmong(await openThing(page, "engine"));
    const cut = await truncations(page, LOCAL_TEXT);
    expect([...overlaps, ...cut], describeFaults(overlaps, cut)).toEqual([]);
  });
});

/**
 * A newcomer found every piece's second line drawn through the piece's own outline, and in the view from above the
 * names too, with the edges of the thin pieces striking through their words (2026-11-12,
 * `AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/`, finding 6). An edge through a word reads as struck out
 * whichever piece the edge belongs to, so every label is held off every piece's outline as well as off every other
 * label, on both boards, as the board first opens, from straight above, and at two angles of orbit.
 */
test.describe("World Map labels clear the pieces", () => {
  const boards = [
    { name: "this repository's board", address: "/?view=world" },
    { name: "the estate", address: "/samples/estate/index.html?view=world" }
  ];
  const states: Array<{ name: string; set: (page: Page) => Promise<unknown> }> = [
    { name: "as it first opens", set: async () => undefined },
    { name: "seen from straight above", set: (page) => page.evaluate(() => window.__worldMap!.tilt()) },
    { name: "turned a quarter", set: (page) => page.evaluate(() => window.__worldMap!.orbit(90, 30)) },
    { name: "orbited as the walkthrough orbits", set: (page) => page.evaluate(() => window.__worldMap!.orbit(-35, 42)) }
  ];
  for (const board of boards) {
    for (const state of states) {
      test(`${board.name} ${state.name}: no label crosses a piece or another label`, async ({ page }) => {
        await openWorldMap(page, board.address);
        await state.set(page);
        const boxes = await textBoxes(page, BOARD_TEXT, "data-piece");
        expect(boxes.length).toBeGreaterThan(5);
        const shapes = await outlines(page, PIECE_FACES, "data-piece");
        expect(shapes.length).toBeGreaterThan(5);
        const overlaps = overlapsAmong(boxes);
        const strikes = textOverShapes(boxes, shapes);
        expect([...overlaps, ...strikes], describeFaults(overlaps, [], strikes)).toEqual([]);
      });
    }
  }
});
