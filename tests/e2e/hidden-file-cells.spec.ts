import { expect, test, type Browser, type Page } from "@playwright/test";

import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { HiddenFilesLook } from "../../packages/explorer/src/client/types";
import { localMapSettled } from "./still-picture";

/**
 * Hidden Files, a trial of 2026-11-17 behind Tuning → 2D Layout (the owner: "Could those be represented as cute little
 * cells that could be clicked on to expand them into fuller-sized nodes?"). With Count, the default, a directory drawn
 * only around the pinned picture says what it does not draw in words, "+2 files"; with Cells, its handle's line draws a
 * closed directory's own cell for each such file and its small skin for each such directory, as many whole marks as the
 * line leaves room for after the name, the last veiled where more are held. Looks only: every card, box, membrane and
 * handle stands where it stands with the count, at every look. A press on a cell pins its file, a press on a skin opens
 * its directory, and neither opens or closes the handle they sit beside; the marks of a handle are one stop in the tab
 * order, moved among by the arrow keys. Read on this repository's picture of `pathfind.ts`, the owner's picture.
 */

const SUBJECT = "packages/engine/src/live-docs/pathfind.ts";
const HISTORY = "packages/engine/src/live-docs/history";
const PACKAGES = "packages";

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

/** A fresh visitor with the given Hidden Files choice, at the pathfind picture or another address. */
async function visit(browser: Browser, hiddenFiles: HiddenFilesLook, address = `/?view=local&node=${SUBJECT}`) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, hiddenFiles } } })
  });
  const page = await context.newPage();
  await page.goto(address);
  await still(page);
  return { context, page };
}

/** Every card, closed box, membrane and handle of the picture, where the layout put it inside the picture, in the map's units. */
async function placements(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#map-container .local-placed")!.getBoundingClientRect();
    const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
    const selector = "#map-container :is(.local-directory-closed, .node-card, .local-directory-band, .local-directory-label)";
    return Object.fromEntries([...document.querySelectorAll<HTMLElement>(selector)].map(element => {
      const rect = element.getBoundingClientRect();
      return [`${element.className.split(" ")[0]} ${element.dataset.directory ?? element.dataset.id ?? ""}`,
        [rect.x - root.x, rect.y - root.y, rect.width, rect.height].map(value => (value / scale).toFixed(2)).join(" ")];
    }));
  });
}

/** What each encasing handle draws of what it hides: the count's words, or the marks, those shown, the one veiled and how many in all. */
async function handles(page: Page) {
  return page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].map(label => {
    const line = label.querySelector<HTMLElement>(".local-directory-cells"), leaf = label.querySelector<HTMLElement>(".local-directory-leaf")!;
    const buttons = [...(line?.querySelectorAll<HTMLButtonElement>(".local-directory-cell") ?? [])];
    const drawn = [...(line?.querySelectorAll(".local-handle-cells [data-mark]") ?? [])];
    return [label.dataset.directory!, {
      count: label.querySelector(".local-directory-more")?.textContent ?? null,
      title: label.querySelector<HTMLElement>(".local-directory-handle")!.title,
      held: buttons.length, shown: buttons.filter(button => !button.hidden).length, drawn: drawn.length,
      cellSizes: [...new Set([...(line?.querySelectorAll<SVGCircleElement>(".local-handle-cells circle.local-cell") ?? [])].map(circle => circle.r.baseVal.value))],
      nameWhole: leaf.scrollWidth <= leaf.clientWidth + 0.5,
      line: line ? Number(getComputedStyle(line).width.replace("px", "")) : 0
    }];
  })));
}

const zoomTo = async (page: Page, lod: string): Promise<void> => {
  for (let press = 0; press < 12 && (await page.locator("#map-container").getAttribute("data-lod")) !== lod; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
  }
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", lod);
};

/** "+23 files, 2 directories" as a number of things. */
const counted = (words: string): number => [...words.matchAll(/(\d+)\s/gu)].reduce((sum, match) => sum + Number(match[1]), 0);

test("Cells moves no card, box, membrane or handle at any look, and draws as many marks as the count says, a closed directory's own", async ({ browser }) => {
  test.setTimeout(300_000);
  const count = await visit(browser, "count"), cells = await visit(browser, "cells");
  for (const lod of ["", "far", "overview"]) {
    if (lod) { await zoomTo(count.page, lod); await zoomTo(cells.page, lod); }
    const where = lod || "reading";
    const expected = await placements(count.page);
    expect(Object.keys(expected).length, where).toBeGreaterThan(20);
    expect(await placements(cells.page), `${where}: no rectangle moves`).toEqual(expected);
    const words = await handles(count.page), marks = await handles(cells.page);
    const encasing = Object.entries(words).filter(([, handle]) => handle.count !== null);
    expect(encasing.length, where).toBeGreaterThan(5);
    for (const [directory, handle] of encasing) {
      const drawn = marks[directory];
      // Count draws no mark; Cells draws no count's words, and holds a mark for each thing the count counts.
      expect(handle.held, `${where} ${directory}: no mark with Count`).toBe(0);
      expect(drawn.count, `${where} ${directory}: no words with Cells`).toBeNull();
      expect(drawn.held, `${where} ${directory}: a mark for each`).toBe(counted(handle.count!));
      // Shown, then at most the one veiled; the count's words move into the hover text.
      expect(drawn.drawn - drawn.shown, `${where} ${directory}: one veiled at most`).toBeLessThanOrEqual(1);
      if (drawn.drawn === drawn.held) expect(drawn.shown, `${where} ${directory}: none veiled where all are drawn`).toBe(drawn.held);
      expect(drawn.title, `${where} ${directory}`).toContain(handle.count!);
      // The name is cut last: never while a mark stands beside it.
      if (drawn.drawn) expect(drawn.nameWhole, `${where} ${directory}: the name whole beside the marks`).toBe(true);
      // One kind of mark at one size: a closed directory's cell.
      for (const size of drawn.cellSizes) expect(size, `${where} ${directory}`).toBe(4);
    }
    if (!lod) {
      // At reading size the owner's picture draws marks in most handles, history's among them, in its count's room.
      expect(Object.values(marks).filter(handle => handle.shown > 0).length).toBeGreaterThan(5);
      expect(marks[HISTORY].shown).toBeGreaterThan(0);
    }
  }
  await count.context.close();
  await cells.context.close();
});

/**
 * The marks stand in the count's room (the root's rule of 2026-11-17): the parent's path is the reader's own words and
 * their orientation, and three directories of the pathfind picture are named `live-docs`. So wherever Count draws its
 * words, the path is drawn at least as wide with Cells, to a pixel; where Count has no room for its words the marks may
 * take the path's room, and this case does not look there. On the estate the picture of `PaymentsContext.cs` is read,
 * since it draws `Database/SqlServer`, an encasing directory with a parent path and a count at reading size; the estate's
 * other pictures encase top-level directories only, which have no path to cost.
 */
for (const [where, address] of [["pathfind", `/?view=local&node=${SUBJECT}`], ["estate", "/samples/estate/?view=local&node=PaymentService/Data/PaymentsContext.cs"]] as const) {
  test(`the marks cost the parent's path no more than the count's words do, at every look (${where})`, async ({ browser }) => {
    test.setTimeout(240_000);
    const paths = (page: Page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].map(label => {
      const count = label.querySelector<HTMLElement>(".local-directory-more"), caption = label.querySelector<HTMLElement>(".local-directory-caption")!;
      const shown = count ? Number(getComputedStyle(count).opacity) > 0.5 && count.getBoundingClientRect().top < caption.getBoundingClientRect().bottom : false;
      return [label.dataset.directory!, { counted: shown, path: label.querySelector(".local-directory-parent")?.getBoundingClientRect().width ?? 0 }];
    })));
    const count = await visit(browser, "count", address), cells = await visit(browser, "cells", address);
    let compared = 0;
    for (const lod of ["", "far", "overview"]) {
      if (lod) { await zoomTo(count.page, lod); await zoomTo(cells.page, lod); }
      const before = await paths(count.page), after = await paths(cells.page);
      for (const [directory, { counted, path }] of Object.entries(before)) {
        if (!counted) continue;
        compared += 1;
        expect(after[directory].path, `${where} ${lod || "reading"} ${directory}: the path with Cells against Count's ${path.toFixed(1)} px`).toBeGreaterThanOrEqual(path - 1);
      }
    }
    expect(compared, `${where}: handles whose count Count draws`).toBeGreaterThan(where === "pathfind" ? 10 : 2);
    await count.context.close();
    await cells.context.close();
  });
}

test("a press on a cell pins its file and does not open the handle's directory; unpinning it brings the cell back; a skin's press opens its directory", async ({ browser }) => {
  test.setTimeout(240_000);
  const { context, page } = await visit(browser, "cells");
  await zoomTo(page, "far");
  const cell = page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-cell--file:not([hidden])`).first();
  const path = (await cell.getAttribute("data-path"))!;
  expect(path.startsWith(`${HISTORY}/`)).toBe(true);
  // The reader's own words: the hover says the file's name alone; assistive technology hears the act and the path.
  await expect(cell).toHaveAttribute("title", path.slice(path.lastIndexOf("/") + 1));
  await expect(cell).toHaveAccessibleName(`Pin ${path}`);
  // The whole pitch takes the press: a cell's button is wider and taller on screen than the cell drawn in it.
  const reach = (await cell.boundingBox())!;
  expect(reach.width).toBeGreaterThan(10);
  expect(reach.height).toBeGreaterThan(12);
  // Under the pointer the mark is lit at full strength; the others stay quiet.
  await cell.hover();
  const strengths = () => page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-handle-cells [data-mark]`).evaluateAll(marks => marks.map(mark => Number(getComputedStyle(mark).opacity)));
  // The light eases in over a moment.
  await expect.poll(async () => Math.max(...await strengths())).toBe(1);
  expect((await strengths()).filter(strength => strength === 1)).toHaveLength(1);
  expect(Math.min(...await strengths())).toBeLessThan(0.7);
  await cell.click();
  await still(page);
  await expect(page.locator(`#map-container .node-card[data-id="${path}"]`)).toHaveCount(1);
  // The press holds still what a press on the handle holds: the handle stays in view, and so does the new card under it.
  const inView = (selector: string) => page.evaluate(selector => {
    const map = document.querySelector("#view-map")!.getBoundingClientRect(), rect = document.querySelector(selector)!.getBoundingClientRect();
    return rect.right > map.left && rect.left < map.right && rect.bottom > map.top && rect.top < map.bottom;
  }, selector);
  expect(await inView(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-handle`), "the handle in view").toBe(true);
  expect(await inView(`#map-container .node-card[data-id="${path}"]`), "the new card in view").toBe(true);
  await expect(page.locator(`#map-container .local-directory-label[data-directory="${HISTORY}"] .local-directory-close`)).toHaveCount(0);
  await expect(page.locator(`.local-directory-cell[data-path="${path}"]`)).toHaveCount(0);
  // A link carries the choice, which is not the default.
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!).layout?.localMap?.hiddenFiles).toBe("cells");
  // Unpinned, the card shrinks back to a cell.
  // The card may stand off screen where the picture placed it: its Pin's own press, without the pointer.
  await page.locator(`#map-container .node-card[data-id="${path}"] .local-file-pin`).dispatchEvent("click");
  await still(page);
  await expect(page.locator(`#map-container .node-card[data-id="${path}"]`)).toHaveCount(0);
  await expect(page.locator(`.local-directory-cell[data-path="${path}"]`)).toHaveCount(1);
  // A directory not drawn is a skin; its press opens that directory, not the handle's own. The `packages` handle stands
  // off screen at this camera, so the press is the button's own, without the pointer.
  const skin = page.locator(`.local-directory-label[data-directory="${PACKAGES}"] .local-directory-cell--directory:not([hidden])`).first();
  const directory = (await skin.getAttribute("data-path"))!;
  await expect(skin).toHaveAccessibleName(`Open ${directory}`);
  await expect(skin).toHaveAttribute("title", /^[^/]+: \d+\sfiles?/u);
  await skin.dispatchEvent("click");
  await still(page);
  await expect(page.locator(`#map-container .local-directory-label[data-directory="${directory}"] .local-directory-close`)).toHaveCount(1);
  await context.close();
});

test("a handle's marks are one stop in the tab order, after the handle and before More; the arrow keys move among them and Enter pins", async ({ browser }) => {
  test.setTimeout(180_000);
  const { context, page } = await visit(browser, "cells");
  const label = page.locator(`.local-directory-label[data-directory="${HISTORY}"]`);
  await label.locator(".local-directory-handle").focus();
  await page.keyboard.press("Tab");
  const first = label.locator(".local-directory-cell:not([hidden])").nth(0), second = label.locator(".local-directory-cell:not([hidden])").nth(1);
  await expect(first).toBeFocused();
  await expect(label.getByRole("toolbar")).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(label.locator(".local-directory-actions")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(second, "the stop stays on the mark last moved to").toBeFocused();
  const path = (await second.getAttribute("data-path"))!;
  await page.keyboard.press("Enter");
  await still(page);
  await expect(page.locator(`#map-container .node-card[data-id="${path}"]`)).toHaveCount(1);
  await context.close();
});

/**
 * Cells under name (2026-11-17, on the root's review: with the path kept, the line at reading size held three marks of
 * history's twenty-three). At the reading look the marks stand under the handle's line as a closed directory's field, in
 * the strip's free height, and the line holds no marks and no count; from the connections look out the marks stand
 * beside the name exactly as with Cells beside name. No rectangle moves, the path is never narrower than with Count, a
 * press on a mark pins or opens without touching the handle, and a press on the field's air still does what the handle's
 * strip does.
 */
test("Cells under name draws the marks under the line at the reading look and beside it farther out, moving no rectangle and costing the path nothing", async ({ browser }) => {
  test.setTimeout(300_000);
  const count = await visit(browser, "count"), beside = await visit(browser, "cells"), under = await visit(browser, "under");
  const read = (page: Page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].map(label => {
    const field = label.querySelector<HTMLElement>(".local-directory-field"), line = label.querySelector<HTMLElement>(".local-directory-cells");
    const shownIn = (element: HTMLElement | null): number | null => element && element.getClientRects().length ? [...element.querySelectorAll<HTMLButtonElement>(".local-directory-cell")].filter(button => !button.hidden).length : null;
    const countWords = label.querySelector<HTMLElement>(".local-directory-more"), caption = label.querySelector<HTMLElement>(".local-directory-caption")!;
    return [label.dataset.directory!, {
      counted: countWords ? Number(getComputedStyle(countWords).opacity) > 0.5 && countWords.getBoundingClientRect().top < caption.getBoundingClientRect().bottom : false,
      words: countWords?.textContent ?? null,
      held: field ? field.querySelectorAll(".local-directory-cell").length : 0,
      field: shownIn(field), line: shownIn(line),
      path: label.querySelector(".local-directory-parent")?.getBoundingClientRect().width ?? 0,
      fieldInside: field?.getClientRects().length ? (() => { const box = field.getBoundingClientRect(), strip = label.getBoundingClientRect(); return box.top >= strip.top - 0.5 && box.bottom <= strip.bottom + 0.5; })() : true
    }];
  })));
  for (const lod of ["", "far", "overview"]) {
    for (const page of [count.page, beside.page, under.page]) if (lod) await zoomTo(page, lod);
    const where = lod || "reading";
    expect(await placements(under.page), `${where}: no rectangle moves`).toEqual(await placements(count.page));
    const words = await read(count.page), sideways = await read(beside.page), marks = await read(under.page);
    let compared = 0;
    for (const [directory, handle] of Object.entries(words)) {
      if (handle.words === null) continue;
      const drawn = marks[directory];
      // A mark for each thing the count counts.
      expect(drawn.held, `${where} ${directory}: a mark for each`).toBe(counted(handle.words));
      expect(drawn.fieldInside, `${where} ${directory}: the field inside the strip`).toBe(true);
      if (!lod) {
        // At the reading look the field draws and the line holds no mark.
        expect(drawn.line, `${where} ${directory}: no mark in the line`).toBeNull();
        expect(drawn.field, `${where} ${directory}: marks under the line`).toBeGreaterThan(0);
        expect(drawn.field!, `${where} ${directory}`).toBeLessThanOrEqual(drawn.held);
      } else {
        // Farther out it is Cells beside name exactly.
        expect(drawn.field, `${where} ${directory}: no field`).toBeNull();
        expect(drawn.line, `${where} ${directory}: the line's marks as beside`).toBe(sideways[directory].line);
      }
      if (handle.counted) {
        compared += 1;
        expect(drawn.path, `${where} ${directory}: the path against Count's ${handle.path.toFixed(1)} px`).toBeGreaterThanOrEqual(handle.path - 1);
      }
    }
    if (!lod) {
      expect(compared, "handles whose count Count draws at reading").toBeGreaterThan(8);
      // The owner's complaint: under the line history shows far more of its twenty-three than beside the name.
      expect(marks[HISTORY].field!).toBeGreaterThan(sideways[HISTORY].line! * 2);
    }
  }
  for (const each of [count, beside, under]) await each.context.close();
});

test("under the name a press on a cell pins its file and brings its card into view, and a press on the field's air still opens the directory", async ({ browser }) => {
  test.setTimeout(240_000);
  let { context, page } = await visit(browser, "under");
  const field = page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-field`);
  const cell = field.locator(".local-directory-cell--file:not([hidden])").first();
  const path = (await cell.getAttribute("data-path"))!;
  await expect(cell).toHaveAccessibleName(`Pin ${path}`);
  await expect(cell).toHaveAttribute("title", path.slice(path.lastIndexOf("/") + 1));
  // The marks of the field are one toolbar, and its arrow keys move in reading order.
  await expect(field).toHaveAttribute("role", "toolbar");
  await cell.focus();
  await page.keyboard.press("ArrowRight");
  await expect(field.locator(".local-directory-cell--file:not([hidden])").nth(1)).toBeFocused();
  await cell.click();
  await still(page);
  await expect(page.locator(`#map-container .node-card[data-id="${path}"]`)).toHaveCount(1);
  await expect(page.locator(`#map-container .local-directory-label[data-directory="${HISTORY}"] .local-directory-close`), "the press did not open the directory").toHaveCount(0);
  // Since 2026-11-19 the camera follows the new card into view at the same scale (camera-intent.spec.ts says how far);
  // where the card and the handle cannot both be in view, the card wins, so the handle's own promise is no longer kept.
  const inView = (selector: string) => page.evaluate(selector => {
    const map = document.querySelector("#view-map")!.getBoundingClientRect(), rect = document.querySelector(selector)!.getBoundingClientRect();
    return rect.right > map.left && rect.left < map.right && rect.bottom > map.top && rect.top < map.bottom;
  }, selector);
  expect(await inView(`#map-container .node-card[data-id="${path}"]`), "the new card in view").toBe(true);
  await context.close();
  // The field's air under the handle's name is still the handle's strip: a press there opens the directory. A fresh
  // visit, where the handle stands in view.
  ({ context, page } = await visit(browser, "under"));
  const air = await page.evaluate(directory => {
    const label = document.querySelector<HTMLElement>(`.local-directory-label[data-directory="${directory}"]`)!;
    const handle = label.querySelector(".local-directory-handle")!.getBoundingClientRect(), box = label.querySelector(".local-directory-field")!.getBoundingClientRect();
    for (let y = box.bottom - 2; y > box.top; y -= 2) for (let x = handle.left + 4; x < handle.right - 4; x += 3) {
      const hit = document.elementFromPoint(x, y);
      if (hit && hit.closest(".local-directory-handle") && !hit.closest(".local-directory-cell")) return { x, y };
    }
    return null;
  }, HISTORY);
  expect(air, "a point of the field's air on the handle's strip").not.toBeNull();
  await page.mouse.click(air!.x, air!.y);
  await still(page);
  await expect(page.locator(`#map-container .local-directory-label[data-directory="${HISTORY}"] .local-directory-close`)).toHaveCount(1);
  await context.close();
});
