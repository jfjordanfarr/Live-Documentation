import { expect, test, type Browser, type Page } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { handleParts } from "../../packages/explorer/src/client/views/localView/directory-handle";
import { LOOK_SCALES } from "../../packages/explorer/src/client/views/localView/ladder-steps";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { AT_READING_SIZE, LOCAL_MAP, localMapSettled } from "./still-picture";

/**
 * Closed directories at the two far looks, and an opened directory's handle (2026-11-16). A difference of form that
 * means nothing is read as a difference of kind: three presses out More took a line to itself in three of `scripts`'
 * five closed boxes, and of the scan root's six one showed its cells. Now More is not drawn in a closed box at the far
 * looks, where the box is the control; and a row of cells stands under the name in every closed box of one parent, a
 * membrane's directly held boxes or the scan root's top level, or in none of them. Each box's name is fitted on its
 * own, as a file's is: between the floor and the look's size, and as large as its box holds it. (A first form of the
 * same day also held every sibling's name at the tightest's size; it was withdrawn on its pictures, uniform at 8 px
 * being worse than uneven at 13 where a directory is the thing to act on.) An opened directory's handle fits before
 * it is cut and reaches across the level columns of its membrane that hold nothing under it: the estate's "Pay…" stood
 * cut at the look's full size in the first of three columns beside an empty row.
 */

/** Segoe UI's line metrics over this machine's fallback face, as zoom-looks.spec.ts draws the owner's screen. */
const SEGOE_LINES = ["400", "700"].map(weight => `@font-face { font-family: "Segoe UI"; font-weight: ${weight}; src: local("DejaVu Sans${weight === "700" ? " Bold" : ""}"); ascent-override: 107.9%; descent-override: 25.1%; line-gap-override: 0%; }`).join(" ");

/** The four subjects of this repository, each a picture of closed boxes, and the looks by their presses of Zoom Out. */
const SUBJECTS: ReadonlyArray<readonly [string, string]> = [["scripts", "/?view=local&dir=scripts"], ["the scan root", "/?view=local"],
  ["packages/engine/src", "/?view=local&dir=packages/engine/src"], ["packages/explorer/src/client", "/?view=local&dir=packages/explorer/src/client"]];
const LOOKS = [{ look: "connections", lod: "far", presses: 3 }, { look: "overview", lod: "overview", presses: 4 }] as const;

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

/** A fresh visitor with the defaults, under this machine's lines or Segoe UI's. */
async function visit(browser: Browser, url: string, lines: "fallback" | "segoe") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0 } } }) });
  if (lines === "segoe") await context.addInitScript(css => {
    const add = (): void => { const style = document.createElement("style"); style.textContent = css; document.documentElement.appendChild(style); };
    if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true });
  }, SEGOE_LINES);
  const page = await context.newPage();
  await page.goto(url);
  await still(page);
  return { context, page };
}

async function zoomOut(page: Page, presses: number): Promise<void> {
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
  }
}

/** Every closed box as a far look draws it, in screen pixels: its held name, its More and its cells; and its name's room and widest line in the map's own units. */
function readBoxes(page: Page, look: string) {
  return page.evaluate(look => {
    const canvas = document.createElement("canvas").getContext("2d")!;
    return [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed")].map(box => {
      const held = box.querySelector<HTMLElement>(".local-directory-closed__held")!, more = box.querySelector<HTMLElement>(".local-directory-actions")!;
      const style = getComputedStyle(box), heldStyle = getComputedStyle(held);
      const frame = box.getBoundingClientRect(), name = held.getBoundingClientRect(), control = more.getBoundingClientRect();
      const lines = (held.getAttribute(`data-lines-look-${look}`) ?? "").split("\n");
      // The name's widest line at reading size, and the room the box gives its name, as the card reading reads them.
      canvas.font = `${heldStyle.fontStyle} ${heldStyle.fontWeight} ${heldStyle.fontSize} ${heldStyle.fontFamily}`;
      const widest = Math.max(...lines.map(line => canvas.measureText(line).width));
      const room = { width: Number(style.getPropertyValue("--closed-width")), height: box.clientHeight - parseFloat(style.paddingTop) - 2, line: Number(style.getPropertyValue("--closed-line")), indent: parseFloat(heldStyle.paddingLeft) };
      const circles = [...box.querySelectorAll<SVGCircleElement>(`.local-cells-look[data-look="${look}"] circle.local-cell`)].filter(circle => circle.getClientRects().length)
        .map(circle => circle.getBoundingClientRect());
      return {
        directory: box.dataset.directory ?? "", scale: Number(style.getPropertyValue(`--closed-scale-${look}`)), drawnScale: new DOMMatrix(heldStyle.transform).a, lines,
        frame: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom }, name: { left: name.left, right: name.right, top: name.top, bottom: name.bottom }, widest, room,
        more: getComputedStyle(more).visibility === "visible" && control.width > 0,
        cells: box.getAttribute(`data-cells-${look}`) ?? "", circles: circles.length, cellsTop: circles.length ? Math.min(...circles.map(circle => circle.top)) : null,
        cellsBottom: circles.length ? Math.max(...circles.map(circle => circle.bottom)) : null
      };
    });
  }, look);
}

for (const lines of ["fallback", "segoe"] as const) {
  test(`at each far look a closed box's name is fitted on its own between the floor and the look's size, no closed box draws More, and the boxes of one parent draw their cells in all or in none (${lines})`, async ({ browser }) => {
    test.setTimeout(420_000);
    let families = 0;
    for (const [subject, url] of SUBJECTS) {
      const { context, page } = await visit(browser, url, lines);
      for (const { look, lod, presses } of LOOKS) {
        await zoomOut(page, presses);
        await expect(page.locator("#map-container")).toHaveAttribute("data-lod", lod);
        const where = `${subject}, the ${look} look`;
        const boxes = await readBoxes(page, look);
        expect(boxes.length, where).toBeGreaterThan(3);
        const byParent = new Map<string, typeof boxes>();
        for (const box of boxes) byParent.set(handleParts(box.directory).parent, [...(byParent.get(handleParts(box.directory).parent) ?? []), box]);
        for (const [parent, siblings] of byParent) {
          families += 1;
          const family = `${where}, the boxes of ${parent || "the scan root"}`;
          // The cells' row in every sibling or in none.
          expect.soft(new Set(siblings.map(box => box.cells !== "")).size, `${family}: the cells' row in all or in none`).toBe(1);
          for (const box of siblings) {
            const which = `${family}, ${box.directory}`;
            // The name is fitted on its own: never below the floor, never above the look's size or what the box's height holds.
            expect.soft(box.scale, `${which}: never below the floor`).toBeGreaterThanOrEqual(Math.min(LOOK_SCALES.connections, box.room.height / box.room.line) - 0.001);
            expect.soft(box.scale, `${which}: never above the look's size`).toBeLessThanOrEqual(LOOK_SCALES[look] + 0.001);
            expect.soft(box.drawnScale, `${which}: drawn at its scale`).toBeCloseTo(box.scale, 2);
            // And no smaller than its own fit: a name on one line below the look's size would not stand in its box a step larger.
            if (box.lines.length === 1 && box.scale < LOOK_SCALES[look] - 0.001 && box.scale > LOOK_SCALES.connections + 0.001) {
              const larger = box.scale + 0.05;
              const fits = box.widest <= box.room.width / larger - box.room.indent + 1e-6 && box.room.line * larger <= box.room.height + 1e-6;
              expect.soft(fits, `${which}: "${box.lines[0]}" at ${box.scale} would not stand a step larger`).toBe(false);
            }
            // Whole on its line or lines at that size, unless it stands at the floor.
            if (box.scale > LOOK_SCALES.connections + 0.001) expect.soft(box.lines.join(""), `${which}: whole above the floor`).toBe(box.directory.split("/").pop());
            // The held name stands inside its box.
            expect.soft(box.name.bottom, `${which}: the name above the box's foot`).toBeLessThanOrEqual(box.frame.bottom + 0.5);
            expect.soft(box.name.right, `${which}: the name inside the box`).toBeLessThanOrEqual(box.frame.right + 0.5);
            // More is not drawn in a closed box at a far look: the box is the control there.
            expect.soft(box.more, `${which}: no More at the ${look} look`).toBe(false);
            expect.soft(box.circles > 0, `${which}: cells drawn where the row is said`).toBe(box.cells !== "");
            if (box.cellsTop !== null && box.cellsBottom !== null) {
              expect.soft(box.cellsTop, `${which}: the cells under the name`).toBeGreaterThanOrEqual(box.name.bottom - 0.5);
              expect.soft(box.cellsBottom, `${which}: the cells inside the box`).toBeLessThanOrEqual(box.frame.bottom + 0.5);
            }
          }
        }
        // The design audit over the look: no text of the map collides with another or is cut off.
        const texts = await textBoxes(page, LOCAL_MAP.text), overlaps = overlapsAmong(texts), cut = await truncations(page, LOCAL_MAP.text);
        expect.soft(overlaps.length + cut.length, `${where}: ${describeFaults(overlaps, cut)}`).toBe(0);
      }
      await context.close();
    }
    expect(families).toBeGreaterThanOrEqual(SUBJECTS.length * LOOKS.length);
  });

  test(`the estate's opened directories' handles are whole seven presses out, each reaching across its membrane's clear columns (${lines})`, async ({ browser }) => {
    test.setTimeout(180_000);
    const { context, page } = await visit(browser, "/samples/estate/?view=local&node=PaymentService/PaymentService.cs", lines);
    await zoomOut(page, 7);
    await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "overview");
    const labels = await page.evaluate(() => {
      const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card, #map-container .local-directory-closed")].map(card => card.getBoundingClientRect());
      return [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].map(label => {
        const leaf = label.querySelector<HTMLElement>(".local-directory-leaf")!, row = label.querySelector<HTMLElement>(".local-directory-row")!, band = label.parentElement!;
        const rect = label.getBoundingClientRect(), text = leaf.getBoundingClientRect(), host = band.getBoundingClientRect();
        const others = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].filter(other => other !== label).map(other => other.getBoundingClientRect());
        const over = [...cards, ...others].filter(card => card.left < rect.right - 0.5 && rect.left < card.right - 0.5 && card.top < rect.bottom - 0.5 && rect.top < card.bottom - 0.5).length;
        // The membrane's leftmost column, by the cards that stand in it: where its handle ended before it could reach on.
        const inside = [...band.querySelectorAll<HTMLElement>(".node-card, .local-directory-closed")].map(card => card.getBoundingClientRect());
        const leftmost = Math.min(...inside.map(card => card.left)), firstColumnRight = Math.max(...inside.filter(card => card.left < leftmost + 2).map(card => card.right));
        return { directory: label.dataset.directory ?? "", text: leaf.textContent ?? "", whole: leaf.scrollWidth <= leaf.clientWidth, scale: new DOMMatrix(getComputedStyle(row).transform).a,
          leafRight: text.right, labelRight: rect.right, hostLeft: host.left, hostRight: host.right, firstColumnRight, columns: new Set(inside.map(card => Math.round(card.left))).size, over };
      });
    });
    expect(labels.map(label => label.directory)).toContain("PaymentService");
    for (const label of labels) {
      // The name is drawn whole, at a size between the floor and the look's own, inside its membrane and over no card.
      expect.soft(label.whole, `${label.directory}: the handle's name whole`).toBe(true);
      expect.soft(label.scale, `${label.directory}: no smaller than the floor`).toBeGreaterThanOrEqual(LOOK_SCALES.connections - 0.001);
      expect.soft(label.scale, `${label.directory}: no larger than the look's size`).toBeLessThanOrEqual(LOOK_SCALES.overview + 0.001);
      expect.soft(label.leafRight, `${label.directory}: the name inside its label`).toBeLessThanOrEqual(label.labelRight + 0.5);
      expect.soft(label.labelRight, `${label.directory}: the label inside its membrane`).toBeLessThanOrEqual(label.hostRight + 0.5);
      expect.soft(label.over, `${label.directory}: the label over no card, closed box or other handle`).toBe(0);
    }
    // PaymentService's membrane spans three columns, and under its edge beside the name nothing stands: its handle
    // reaches on past its first column, where it ended before, and its name stands at the look's full size.
    const payment = labels.find(label => label.directory === "PaymentService")!;
    expect(payment.text).toBe("PaymentService");
    expect(payment.columns, "the membrane's columns").toBeGreaterThan(1);
    expect(payment.scale).toBeCloseTo(LOOK_SCALES.overview, 2);
    expect(payment.labelRight, "the handle's reach past its membrane's first column").toBeGreaterThan(payment.firstColumnRight + 10);
    // The name fits before it is cut: the same handle given less room than its membrane offers comes down in size until
    // the chevron, the name and More stand in it, and no further than the floor, where it is cut.
    const fitted = await page.locator('#map-container .local-directory-label[data-directory="PaymentService"]').evaluate((label: HTMLElement) => {
      const need = Number(label.style.getPropertyValue("--dir-name")), controls = Number(getComputedStyle(label).getPropertyValue("--dir-controls"));
      const at = (room: number) => {
        label.style.width = `${room}px`;
        label.style.setProperty("--dir-room", String(room));
        const leaf = label.querySelector<HTMLElement>(".local-directory-leaf")!;
        return { scale: new DOMMatrix(getComputedStyle(label.querySelector(".local-directory-row")!).transform).a, whole: leaf.scrollWidth <= leaf.clientWidth, full: leaf.scrollWidth,
          line: leaf.offsetHeight, ellipsis: getComputedStyle(leaf).textOverflow };
      };
      // The name's width by its own type, whatever its box cuts of it.
      const leaf = label.querySelector<HTMLElement>(".local-directory-leaf")!, style = getComputedStyle(leaf), canvas = document.createElement("canvas").getContext("2d")!;
      canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return { need, controls, text: canvas.measureText(leaf.textContent ?? "").width, between: at(400), short: at(150) };
    });
    expect(fitted.need, "the chevron and the name's own width, written for the stylesheet").toBeGreaterThan(60);
    expect(fitted.between.scale).toBeCloseTo(400 / (fitted.need + fitted.controls + 2), 2);
    expect(fitted.between.scale).toBeGreaterThan(LOOK_SCALES.connections);
    expect(fitted.between.scale).toBeLessThan(LOOK_SCALES.overview);
    expect(fitted.between.whole, "whole at the size it came down to").toBe(true);
    expect(fitted.short.scale, "never below the floor").toBeCloseTo(LOOK_SCALES.connections, 2);
    expect(fitted.short.whole, "cut only at the floor").toBe(false);
    // What the handle needs is the name's whole width, read rightly while the name is cut, and the name's box is one line tall.
    expect(Math.abs(fitted.short.full - fitted.text), "the cut name's whole width").toBeLessThan(1.5);
    expect(Math.abs(fitted.need - 16 - fitted.text), "the chevron and the name's width written").toBeLessThan(1.5);
    expect(fitted.short.line).toBe(15);
    expect(fitted.short.ellipsis).toBe("ellipsis");
    await context.close();
  });
}
