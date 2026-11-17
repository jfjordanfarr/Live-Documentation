import { expect, test, type Browser, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { LOCAL_MAP, localMapSettled } from "./still-picture";
import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { CLOSED_DIRECTORY_LOOKS, CLOSED_DIRECTORY_SHAPES, type ClosedCellColour, type ClosedDirectoryLook, type ClosedDirectoryShape } from "../../packages/explorer/src/client/types";

/**
 * A closed directory's looks. The skin with cells is the default since 2026-11-15 (the owner: "Cells is definitely my
 * favorite"), with the plain box and the stack one choice away; the folded membrane of the 2026-11-13 trial is deleted.
 * Looks only: each choice draws, keeps every box and card exactly where the box keeps them under both this machine's
 * font lines and Segoe UI's, opens by pointer and by keyboard, keeps More on the name's line, and is carried by a link
 * only when it is not the default. The skin has three shapes, a folder's tab (the default), the capsule and a card's
 * corners, and its cells take their files' kinds' colours (the default, the owner's choice of 2026-11-16: "I _love_
 * the splash of color those directories provide ... Yeah color for sure!") or one grey, and each says its file's name
 * on hover. A directory inside is a skin around cells of the same size as every other cell (the owner could not read
 * the smaller marks: "likely folders in folders"). In the far looks the box's name is held, the
 * skin's cells are held at the look's scale under it, and a folder is drawn plain, without its tab: the tab is the
 * reading look's, since a held name leaves room for a step in one box and none in its neighbour.
 */

/** Segoe UI's line metrics over this machine's fallback face, as zoom-looks.spec.ts draws the owner's screen. */
const SEGOE_LINES = ["400", "700"].map(weight => `@font-face { font-family: "Segoe UI"; font-weight: ${weight}; src: local("DejaVu Sans${weight === "700" ? " Bold" : ""}"); ascent-override: 107.9%; descent-override: 25.1%; line-gap-override: 0%; }`).join(" ");

const SCRIPTS = "scripts";
const DOC_TOOLS = "scripts/doc-tools";
const CLIENT = "packages/explorer/src/client";
/**
 * The two families read at the far looks, each by one of its boxes. In `scripts` one name on two lines ("contact-" /
 * "sheet", a directory added on 2026-11-16) leaves the whole family without the cells' row, under both lines; before
 * it every name held one line under this machine's lines and the row was drawn. The client's directories each hold a
 * line under both, and draw it. Both are this repository's, and a directory added to either can change which is which:
 * the case says so by name when it does, and closed-directory-families.spec.ts holds the rule itself on every family.
 */
const FAR_FAMILIES = [{ directory: SCRIPTS, read: "scripts/layout-lab", row: false }, { directory: CLIENT, read: `${CLIENT}/panels`, row: true }] as const;

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

/** How a closed directory is drawn for a visit: its look, and for the skin with cells its shape and its cells' colour. */
interface Style { look: ClosedDirectoryLook; shape?: ClosedDirectoryShape; cells?: ClosedCellColour }

/** A fresh visitor with the given look, under this machine's lines or Segoe UI's, at a directory opened by address. */
async function visit(browser: Browser, chosen: ClosedDirectoryLook | Style, lines: "fallback" | "segoe", directory = SCRIPTS) {
  const style: Style = typeof chosen === "string" ? { look: chosen } : chosen;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, closedDirectory: style.look,
      ...(style.shape ? { closedShape: style.shape } : null), ...(style.cells ? { closedCells: style.cells } : null) } } })
  });
  if (lines === "segoe") await context.addInitScript(css => {
    const add = (): void => { const style = document.createElement("style"); style.textContent = css; document.documentElement.appendChild(style); };
    if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true });
  }, SEGOE_LINES);
  const page = await context.newPage();
  await page.goto(directory ? `/?view=local&dir=${directory}` : "/?view=local");
  await still(page);
  return { context, page };
}

/** Every box and card of the picture, by its directory or file, where the layout put it inside the picture. */
async function placements(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#map-container .local-placed")!.getBoundingClientRect();
    const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
    return Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed, #map-container .node-card")].map(element => {
      const rect = element.getBoundingClientRect();
      return [element.dataset.directory ?? element.dataset.id ?? "", [rect.x - root.x, rect.y - root.y, rect.width, rect.height].map(value => (value / scale).toFixed(1)).join(" ")];
    }));
  });
}

const box = (page: Page, directory: string) => page.locator(`#map-container .local-directory-closed[data-directory="${directory}"]`);
const closeOf = (page: Page, directory: string) => page.locator(`#map-container .local-directory-label[data-directory="${directory}"] .local-directory-close`);

/** Every way a closed directory is drawn: the plain box, the stack, and the skin with cells in each of its shapes. */
const STYLES: readonly Style[] = [{ look: "box" }, { look: "stack" }, ...CLOSED_DIRECTORY_SHAPES.map(shape => ({ look: "cells" as const, shape }))];
const named = (style: Style): string => (style.shape ? `${style.look}, ${style.shape}` : style.look);

for (const lines of ["fallback", "segoe"] as const) {
  test(`each Closed Directory look and shape draws, keeps every box and card where the box keeps them, keeps More on the name's line, and opens by pointer and keyboard (${lines})`, async ({ browser }) => {
    test.setTimeout(300_000);
    const reference = await visit(browser, "box", lines);
    const expected = await placements(reference.page);
    expect(Object.keys(expected).length).toBeGreaterThan(5);
    await reference.context.close();
    for (const style of STYLES) {
      const { look, shape } = style, where = named(style);
      const { context, page } = await visit(browser, style, lines);
      // No layout number changes: every box and card stands where it stands with the box.
      expect(await placements(page), where).toEqual(expected);
      const target = box(page, DOC_TOOLS);
      if (look === "box") await expect(page.locator("#map-container .local-directory-closed[class*='local-closed--']")).toHaveCount(0);
      else await expect(target).toHaveClass(new RegExp(`local-closed--${look}`));
      // The design audit over the look: no text of the map collides with another or is cut off.
      const texts = await textBoxes(page, LOCAL_MAP.text), overlaps = overlapsAmong(texts), cut = await truncations(page, LOCAL_MAP.text);
      expect(texts.length, where).toBeGreaterThan(4);
      expect(overlaps.length + cut.length, `${where}: ${describeFaults(overlaps, cut)}`).toBe(0);
      // More stands on the name's line in every look, and no cell stands under it.
      const line = await target.evaluate(element => {
        const name = element.querySelector(".local-directory-closed__name")!.getBoundingClientRect(), more = element.querySelector(".local-directory-actions")!.getBoundingClientRect();
        const under = [...element.querySelectorAll(".local-closed-cells circle")].map(circle => circle.getBoundingClientRect())
          .filter(cell => cell.left < more.right && more.left < cell.right && cell.top < more.bottom && more.top < cell.bottom).length;
        return { apart: Math.abs((more.top + more.bottom) / 2 - (name.top + name.bottom) / 2), after: more.left - name.left, under };
      });
      expect(line.apart, `${where}: More's centre against the name line's`).toBeLessThan(3);
      expect(line.after, `${where}: More after the name's start`).toBeGreaterThan(20);
      expect(line.under, `${where}: cells under More`).toBe(0);
      if (look === "cells") {
        // A cell for each file directly in it, a small skin for the directory inside; the counts stay in the hover text and the accessibility tree.
        await expect(target.locator(".local-closed-cells circle.local-cell")).not.toHaveCount(0);
        await expect(target.locator(".local-closed-cells > g > .local-cell-nest")).toHaveCount(1);
        await expect(target).toHaveAttribute("title", /scripts\/doc-tools: \d+\sfiles?,\s1\sdirectory/u);
        await expect(target.locator(".local-directory-closed__count")).toHaveText(/files?/u);
        await expect(target).toHaveClass(new RegExp(`local-closed-shape--${shape}`));
        const drawn = await target.evaluate(element => {
          const frame = element.getBoundingClientRect(), outline = element.querySelector<SVGPathElement>(".local-closed-outline__look[data-look='reading']");
          const name = element.querySelector(".local-directory-closed__text")!.getBoundingClientRect(), more = element.querySelector(".local-directory-actions")!.getBoundingClientRect();
          const cells = [...element.querySelectorAll(".local-closed-cells circle")].map(circle => circle.getBoundingClientRect());
          const drawnOutline = outline?.getBoundingClientRect();
          return { radius: getComputedStyle(element).borderTopLeftRadius, path: outline?.getAttribute("d") ?? "", tab: Number((element as HTMLElement).dataset.tabReading), rise: Number((element as HTMLElement).dataset.tabRise),
            width: frame.width, nameRight: name.right - frame.left, nameBottom: name.bottom - frame.top, moreRight: more.right - frame.left, cellsTop: Math.min(...cells.map(cell => cell.top)) - frame.top,
            outside: drawnOutline ? Math.max(frame.left - drawnOutline.left, drawnOutline.right - frame.right, frame.top - drawnOutline.top, drawnOutline.bottom - frame.bottom) : 0 };
        });
        if (shape === "round") expect(drawn.radius, where).toBe("24px");
        if (shape === "square") expect(drawn.radius, where).toBe("6px");
        if (shape === "tab") {
          // A folder: the outline rises around the name and More as a tab, steps down to the body's top edge beside it
          // (the inner corner turns the other way), stays inside the box, and the cells stand in the body.
          expect(drawn.path, where).toMatch(/A[\d.]+ [\d.]+ 0 0 0 /u);
          expect(drawn.outside, `${where}: the outline inside the box`).toBeLessThanOrEqual(0.5);
          expect(drawn.tab, `${where}: the tab past More`).toBeGreaterThanOrEqual(drawn.moreRight);
          expect(drawn.moreRight, `${where}: More after the name`).toBeGreaterThan(drawn.nameRight);
          expect(drawn.tab, `${where}: the tab narrower than the box`).toBeLessThan(drawn.width - 20);
          expect(drawn.rise, `${where}: the tab down to under the name`).toBeGreaterThanOrEqual(drawn.nameBottom);
          expect(drawn.cellsTop, `${where}: the cells in the body`).toBeGreaterThanOrEqual(drawn.rise);
        } else expect(drawn.path, where).toBe("");
      }
      if (look === "stack") {
        await expect(target).toHaveAttribute("data-edges", /^[123]$/u);
        expect(await target.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe("none");
      }
      // Open keeps its name and its action: by pointer here, by keyboard on a fresh visit.
      await expect(target.getByRole("button", { name: `Open ${DOC_TOOLS}` })).toBeVisible();
      await target.getByRole("button", { name: `Open ${DOC_TOOLS}` }).click();
      await still(page);
      await expect(closeOf(page, DOC_TOOLS)).toBeVisible();
      // A link carries a choice only when it is not the default: the skin with cells, the folder's tab and the kinds' colours are not written.
      const carried = decompressSnapshot(new URL(page.url()).searchParams.get("s")!).layout?.localMap;
      expect(carried?.closedDirectory, where).toBe(look === "cells" ? undefined : look);
      expect(carried?.closedShape, where).toBe(shape && shape !== "tab" ? shape : undefined);
      expect(carried?.closedCells, where).toBeUndefined();
      await context.close();
      const keyboard = await visit(browser, style, lines);
      await box(keyboard.page, DOC_TOOLS).getByRole("button", { name: `Open ${DOC_TOOLS}` }).focus();
      await keyboard.page.keyboard.press("Enter");
      await still(keyboard.page);
      await expect(closeOf(keyboard.page, DOC_TOOLS)).toBeVisible();
      await keyboard.context.close();
    }
  });
}

/**
 * One kind of mark at one size (2026-11-15): a directory inside a closed one is a small skin around cells as large as
 * every other cell, which says its name and what it holds on hover; a directory inside that is a skin within it, around
 * cells of that size still. Read on `scripts` (doc-tools holds __fixtures__) and on the scan root, whose `packages` holds
 * directories that hold directories. A cell's colour is its file's kind's, as the 3D map colours a file: the default,
 * by the owner's choice of 2026-11-16; or one grey for every cell where that is chosen, which a link then carries.
 */
test("a directory inside a closed one is a skin around cells of the same size as every other cell, named on hover, and a cell takes its file's kind's colour", async ({ browser }) => {
  test.setTimeout(180_000);
  const read = (page: Page, directory: string) => box(page, directory).evaluate(element => {
    const size = (circle: Element): number => Number(circle.getBoundingClientRect().width.toFixed(2));
    const field = element.querySelector(".local-closed-cells")!;
    const nests = [...field.querySelectorAll(":scope > g > .local-cell-nest, :scope > .local-cell-nest")];
    return {
      loose: [...field.querySelectorAll("circle.local-cell")].filter(circle => !circle.closest(".local-cell-nest")).map(size),
      // A skin's own cells and the skins directly inside it: those whose nearest skin is this one.
      nested: nests.map(nest => ({ title: nest.querySelector(":scope > title")?.textContent ?? "", cells: [...nest.querySelectorAll("circle.local-cell")].filter(circle => circle.closest(".local-cell-nest") === nest).map(size),
        skin: nest.querySelector(".local-cell-skin")!.getBoundingClientRect().height, deeper: [...nest.querySelectorAll(".local-cell-nest")].filter(inner => inner.parentElement!.closest(".local-cell-nest") === nest).map(inner => ({
          title: inner.querySelector(":scope > title")?.textContent ?? "", cells: [...inner.querySelectorAll("circle.local-cell")].map(size) })) })),
      fills: [...new Set([...field.querySelectorAll("circle.local-cell")].map(circle => getComputedStyle(circle).fill))]
    };
  });
  for (const shape of CLOSED_DIRECTORY_SHAPES) {
    const scripts = await visit(browser, { look: "cells", shape }, "fallback");
    const docTools = await read(scripts.page, DOC_TOOLS);
    expect(docTools.loose.length, shape).toBeGreaterThan(0);
    expect(docTools.nested.map(nest => nest.title), shape).toEqual([expect.stringMatching(/^__fixtures__: \d+\sfiles?(, \d+\sdirector(y|ies))?$/u)]);
    const sizes = new Set([...docTools.loose, ...docTools.nested.flatMap(nest => [...nest.cells, ...nest.deeper.flatMap(inner => inner.cells)])]);
    expect([...sizes], `${shape}: every cell of doc-tools one size`).toHaveLength(1);
    // __fixtures__ holds its file in a directory of its own: a skin inside the skin, around a cell of the one size.
    const held = [...docTools.nested[0].cells, ...docTools.nested[0].deeper.flatMap(inner => inner.cells)];
    expect(held.length, shape).toBeGreaterThan(0);
    // The skin is taller than the cells it holds: it is drawn around them.
    expect(docTools.nested[0].skin, shape).toBeGreaterThan(held[0]);
    await scripts.context.close();
    // The scan root's `packages` holds packages that hold directories: a skin inside a skin, around cells of that size still.
    const root = await visit(browser, { look: "cells", shape }, "fallback", "");
    const packages = await read(root.page, "packages");
    expect(packages.nested.length, shape).toBeGreaterThan(0);
    expect(packages.nested.some(nest => nest.deeper.length > 0), `${shape}: a directory inside a directory inside packages`).toBe(true);
    const deepest = packages.nested.flatMap(nest => nest.deeper.flatMap(inner => inner.cells));
    expect(deepest.length, `${shape}: cells in the skins inside the skins`).toBeGreaterThan(0);
    expect([...new Set([...docTools.loose, ...deepest, ...packages.nested.flatMap(nest => nest.cells)])], `${shape}: every cell of packages the size of a loose cell`).toHaveLength(1);
    await root.context.close();
  }
  // With nothing chosen the cells are coloured by kind (the owner's choice of 2026-11-16): doc-tools' cells take more
  // than one colour (it holds tests beside its sources), each the colour the 3D map gives that kind. In one grey, exactly one.
  const kinds = await visit(browser, "cells", "fallback");
  await expect(box(kinds.page, DOC_TOOLS)).toHaveClass(/local-closed-cells--kind/u);
  const coloured = (await read(kinds.page, DOC_TOOLS)).fills;
  expect(coloured.length).toBeGreaterThan(1);
  expect(coloured).toContain("rgb(40, 167, 69)");
  expect(coloured).toContain("rgb(0, 145, 255)");
  await kinds.context.close();
  const grey = await visit(browser, { look: "cells", cells: "grey" }, "fallback");
  expect((await read(grey.page, DOC_TOOLS)).fills).toEqual(["rgb(185, 193, 204)"]);
  await box(grey.page, DOC_TOOLS).getByRole("button", { name: `Open ${DOC_TOOLS}` }).click();
  await still(grey.page);
  expect(decompressSnapshot(new URL(grey.page.url()).searchParams.get("s")!).layout?.localMap?.closedCells).toBe("grey");
  await grey.context.close();
});

/**
 * The reader's own words say what a cell is (2026-11-16; the owner: "A scan of one's software -- their own words,
 * should do essentially all of the talking if possible"). A cell says its file's name on hover, the name alone, as a
 * skin inside says its directory's; a cell that fades under a veil or stands for what the room left out says nothing.
 * A cell is drawn, not a control: no keyboard stop, and a press on it opens the box as a press anywhere on it does.
 */
test("a cell says its file's name on hover, a veiled cell says nothing, and a press on a cell opens the directory", async ({ browser }) => {
  test.setTimeout(180_000);
  const { context, page } = await visit(browser, "cells", "fallback");
  const target = box(page, DOC_TOOLS);
  const seen = await target.evaluate(element => {
    const loose = [...element.querySelectorAll<SVGCircleElement>(".local-closed-cells circle.local-cell")].filter(circle => !circle.closest(".local-cell-nest"));
    const first = loose.find(circle => circle.querySelector("title"))!, rect = first.getBoundingClientRect();
    const at = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    return { titles: loose.map(circle => circle.querySelector(":scope > title")?.textContent ?? null), stops: loose.filter(circle => circle.tabIndex >= 0 || circle.hasAttribute("tabindex")).length,
      inside: [...element.querySelectorAll(".local-cell-nest circle.local-cell > title")].map(title => title.textContent), at, hit: document.elementFromPoint(at.x, at.y) === first, first: first.querySelector("title")!.textContent };
  });
  const named = seen.titles.filter((title): title is string => title !== null);
  expect(named.length).toBeGreaterThan(0);
  expect(new Set(named).size, "each cell its own file").toBe(named.length);
  // The name only: the box already says the directory.
  for (const title of [...named, ...seen.inside]) expect(title).toMatch(/^[^/]+\.[a-z]+$/u);
  expect(seen.stops, "no cell is a keyboard stop").toBe(0);
  expect(seen.hit, "a pointer over the cell is on the cell, so its name is what a hover says").toBe(true);
  // A press on the cell opens the directory, and each name a cell said is a file directly in it.
  await page.mouse.click(seen.at.x, seen.at.y);
  await still(page);
  await expect(closeOf(page, DOC_TOOLS)).toBeVisible();
  const files = await page.locator(`#map-container .node-card[data-id^="${DOC_TOOLS}/"]`).evaluateAll((cards, prefix) => cards.map(card => (card as HTMLElement).dataset.id!.slice(prefix.length)).filter(name => !name.includes("/")), `${DOC_TOOLS}/`);
  expect(files).toEqual(expect.arrayContaining(named));
  expect(files, "the first cell's own file among them").toContain(seen.first);
  await context.close();
  // The scan root's boxes hold more than their rooms show: a cell under a veil is drawn and says nothing of its own,
  // and every cell that says a name is one the pointer can find. A veiled cell outside any skin leaves the pointer to
  // the box, which says the directory; inside a skin the pointer is the skin's, which says the directory inside.
  const root = await visit(browser, "cells", "fallback", "");
  const cells = await root.page.evaluate(() => [...document.querySelectorAll<SVGCircleElement>("#map-container .local-closed-cells circle.local-cell")]
    .map(circle => ({ named: circle.classList.contains("local-cell--named"), title: circle.querySelector(":scope > title")?.textContent ?? null, events: getComputedStyle(circle).pointerEvents,
      skin: circle.closest(".local-cell-nest")?.querySelector(":scope > title")?.textContent ?? null })));
  expect(cells.filter(cell => !cell.named).length, "cells under a veil on the scan root").toBeGreaterThan(0);
  expect(cells.filter(cell => !cell.named && cell.skin === null).length, "veiled cells outside any skin on the scan root").toBeGreaterThan(0);
  for (const cell of cells) {
    expect(cell.title !== null, "a title exactly where the cell names a file").toBe(cell.named);
    if (cell.named) expect(cell.events, "a named cell takes the pointer").toBe("auto");
    else if (cell.skin === null) expect(cell.events, "a veiled cell outside any skin leaves the pointer to the box").toBe("none");
    else expect(cell.skin, "a veiled cell in a skin is under the skin's own words").toMatch(/^[^/]+: /u);
  }
  await root.context.close();
});

test("a stack's cards under its top card never reach a neighbouring card or box", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const directory of [SCRIPTS, "packages/explorer/src/client"]) {
    const { context, page } = await visit(browser, "stack", "fallback", directory);
    const touching = await page.evaluate(() => {
      const items = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed, #map-container .node-card")]
        .map(element => ({ element, rect: element.getBoundingClientRect() }));
      const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
      const found: string[] = [];
      for (const { element, rect } of items) {
        const edges = Number(element.dataset.edges ?? 0);
        if (!edges) continue;
        const reach = { left: rect.left, top: rect.top, right: rect.right + 4 * edges * scale, bottom: rect.bottom + 4 * edges * scale };
        for (const other of items) {
          if (other.element === element) continue;
          const o = other.rect;
          if (reach.left < o.right && o.left < reach.right && reach.top < o.bottom && o.top < reach.bottom) found.push(`${element.dataset.directory} reaches ${other.element.dataset.directory ?? other.element.dataset.id}`);
        }
      }
      return { found, stacks: items.filter(item => item.element.dataset.edges).length };
    });
    expect(touching.stacks, directory).toBeGreaterThan(0);
    expect(touching.found, directory).toEqual([]);
    await context.close();
  }
});

for (const lines of ["fallback", "segoe"] as const) {
  test(`in the far looks each look keeps the box's name held, and the skin holds its cells at the look's scale (${lines})`, async ({ browser }) => {
    test.setTimeout(240_000);
    for (const look of CLOSED_DIRECTORY_LOOKS) for (const family of FAR_FAMILIES) {
      const { context, page } = await visit(browser, look, lines, family.directory);
      for (let press = 0; press < 3; press += 1) {
        await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
        await still(page);
      }
      await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "far");
      const where = `${look}, ${family.read}`;
      const seen = await box(page, family.read).evaluate(element => {
        const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
        const held = element.querySelector<HTMLElement>(".local-directory-closed__held")!;
        const style = getComputedStyle(held);
        const line = parseFloat(style.lineHeight) * (new DOMMatrix(style.transform).a || 1) * scale;
        const cells = [...element.querySelectorAll<SVGCircleElement>(".local-cells-look[data-look='connections'] circle.local-cell")]
          .filter(circle => circle.getClientRects().length).map(circle => circle.getBoundingClientRect().width);
        const reading = element.querySelector<SVGElement>(".local-closed-cells");
        const frame = element.getBoundingClientRect(), outlines = [...element.querySelectorAll<SVGPathElement>(".local-closed-outline__look")].filter(path => getComputedStyle(path).display !== "none");
        const drawn = outlines[0]?.getBoundingClientRect();
        const tab = { shown: outlines.map(path => path.dataset.look), path: outlines[0]?.getAttribute("d") ?? "", top: drawn ? Math.abs(drawn.top - frame.top) : -1, wide: drawn ? frame.width - drawn.width : -1,
          outside: drawn ? Math.max(frame.left - drawn.left, drawn.right - frame.right, frame.top - drawn.top, drawn.bottom - frame.bottom) : 0 };
        // The name's own chevron and the held one: only the held one may be drawn, and the name's stands unmoved under it.
        const own = element.querySelector<SVGElement>(".local-directory-closed__name > .local-directory-chevron")!;
        const lifted = new DOMMatrix(getComputedStyle(element.querySelector(".local-directory-closed__name")!).transform).f;
        // The cells' row is the family's (2026-11-16): drawn in every closed box of the parent or in none.
        const rows = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed")].map(sibling => (sibling.getAttribute("data-cells-connections") ?? "") !== "");
        return { display: style.display, content: getComputedStyle(held, "::after").content, line, cells, rows, readingShown: reading ? getComputedStyle(reading).visibility === "visible" : false, tab,
          ownChevron: getComputedStyle(own).visibility, heldChevron: getComputedStyle(held.querySelector(".local-directory-chevron")!).visibility, lifted };
      });
      // The name is held at the look's size: at least the reading size's line on screen, drawn by the held element,
      // whole on one line or broken at its seams onto more (a break is written "\a " in the content).
      expect(seen.display, where).toBe("block");
      expect(seen.content.replace(/\\a /gu, ""), where).toContain(family.read.split("/").pop());
      expect(seen.line, where).toBeGreaterThanOrEqual(14);
      // One chevron: the name's own, which has a colour of its own, is not drawn at reading size in the held one's corner.
      expect([seen.ownChevron, seen.heldChevron], where).toEqual(["hidden", "visible"]);
      expect(seen.lifted, `${where}: the name's button where every shape has it`).toBe(0);
      if (look === "cells") {
        // The row of cells is in every sibling or in none (closed-directory-families.spec.ts). Where every name of the
        // family holds one line the row is drawn: at least a row of cells, each held about as large on screen as at
        // reading size, not the map's sliver. Where one sibling's name takes two, the whole family is without it.
        expect(new Set(seen.rows).size, `${where}: the cells' row in every sibling or in none`).toBe(1);
        expect(seen.rows[0], `${where}: this family ${family.row ? "draws" : "is without"} the cells' row; if a directory added to it changed that, read another family here`).toBe(family.row);
        if (seen.rows[0]) {
          expect(seen.cells.length).toBeGreaterThan(2);
          expect(Math.min(...seen.cells)).toBeGreaterThanOrEqual(7);
        } else expect(seen.cells).toEqual([]);
        expect(seen.readingShown).toBe(false);
        // The tab is the reading look's: here the folder is drawn plain, the box's whole outline without a step (no
        // corner turns the other way), the same for every box whatever its held name leaves beside it.
        expect(seen.tab.shown, "the plain outline drawn alone").toEqual(["plain"]);
        expect(seen.tab.path).not.toMatch(/A[\d.]+ [\d.]+ 0 0 0 /u);
        expect(seen.tab.path).toMatch(/A[\d.]+ [\d.]+ 0 0 1 /u);
        expect(seen.tab.wide, "the outline as wide as the box").toBeLessThanOrEqual(1.5);
        expect(seen.tab.top, "the outline's top at the box's").toBeLessThanOrEqual(1);
        expect(seen.tab.outside).toBeLessThanOrEqual(0.5);
      } else expect(seen.cells).toEqual([]);
      await context.close();
    }
  });
}
