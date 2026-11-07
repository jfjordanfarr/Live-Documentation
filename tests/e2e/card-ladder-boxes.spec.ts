import { expect, test, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { LAST_STEP, STEP_RATIO } from "../../packages/explorer/src/client/views/localView/ladder-steps";
import { seamsOf } from "../../packages/explorer/src/client/views/localView/word-seams";

/**
 * The card ladder's boxes, audited at every Zoom Out press from reading scale to the farthest zoom (the far-zoom review
 * of 2026-11-06, whose instrument this spec makes a gate). The owner saw "elements overlapping/clipping through at extreme
 * zooms": anchor dots drawn past their card's edge and above their rows, row buttons above their rows, the dots of
 * neighbouring rows merged into beads. The principle the round built: inside a box that never changes, a held thing is
 * bounded by the room of the box it belongs to; where its room runs out it follows the map or leaves the picture; it never
 * overflows its box, never lies over another part, and text is never drawn smaller than the map's own scale to make room.
 * Each press is measured in screen pixels against half a pixel, the boxes in the map's own units, and names by their
 * height on screen: symbol names one size at their reading size from reading scale through the far band, file names one
 * size from the middle band out, and a directory's name at its reading size while its label has the room.
 */
const stillPicture = "tests/e2e/still-picture.ts";
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const rosetta = "tests/integration/programs/rosetta-manifest.json";
const url = (subject: string, pinnedWhole = false): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: subject,
  ...(pinnedWhole ? { pinSet: { entries: [{ nodeId: subject, symbol: "*" }] } } : {}) })}`;

/**
 * The reading sizes in the map's own units of a symbol's name line, a file's name line and a directory's name line: on screen
 * they are these times the reading scale the arrival frames the card at, which is calibrated and need not be 1.
 */
const SYMBOL_NAME = 12, FILE_NAME = 15, DIRECTORY_NAME = 14;
/**
 * The band's last step that holds every symbol's name, the far band's: the sixth since the root's review of the far bands
 * (2026-11-06), where a row's room had run out at the seventh.
 */
const FAR_LAST_STEP = 6;

test.use({ viewport: { width: 1440, height: 960 } });

test.beforeEach(async ({ page }) => {
  // A fresh visitor's settings but the continuing search, which the suite keeps off so that a picture stays as drawn.
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
  });
});

/**
 * One press's audit: what breaks a rule, as sentences naming the part, and what the rules about size and boxes compare
 * across presses. Every drawn part is read from the page as drawn: an element's box, a pinned row's highlight from its
 * wrapper's layer, a directory label's held caption from its aria-hidden child's box.
 */
const audit = async (page: Page) => {
  // The seams of the files' names, which the page cannot compute: the rule a line's end is held to.
  const fileNames = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .local-file-name-held")].map(held => held.dataset.name ?? ""));
  return page.evaluate(auditInPage, { half: 0.5, seams: Object.fromEntries(fileNames.map(name => [name, seamsOf(name)])) });
};
const auditInPage = ({ half, seams }: { half: number; seams: Record<string, string[]> }) => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  const lod = map.dataset.lod!, step = Number(map.dataset.step);
  type Box = { left: number; top: number; right: number; bottom: number };
  const shown = (element: Element): DOMRect | null => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 0.05 && rect.height < 0.05) return null;
    const style = getComputedStyle(element);
    return style.visibility !== "visible" || style.display === "none" || Number(style.opacity) === 0 ? null : rect;
  };
  const outside = (part: Box, box: Box): number => Math.max(box.left - part.left, part.right - box.right, box.top - part.top, part.bottom - box.bottom);
  const overlap = (a: Box, b: Box): number => Math.min(Math.min(a.right, b.right) - Math.max(a.left, b.left), Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const named = (card: HTMLElement, row?: HTMLElement | null): string => `${card.dataset.id!.split("/").pop()}${row ? `:${row.dataset.symbol}` : ""}`;
  const broken: string[] = [];
  // The boxes the layout gave, in the map's own units, which no transform enters: a card's place in the picture and its
  // size, each row's place and height in its card, and the hub's size and overhang as drawn.
  const placed = (element: HTMLElement): { x: number; y: number } => {
    let x = 0, y = 0;
    for (let at: HTMLElement | null = element; at && !at.classList.contains("local-placed"); at = at.offsetParent as HTMLElement | null) { x += at.offsetLeft; y += at.offsetTop; }
    return { x, y };
  };
  const cards: Record<string, { x: number; y: number; w: number; h: number; rows: string[]; hub: number[] }> = {};
  const symbolNames: { name: string; px: number }[] = [], fileNames: { name: string; px: number }[] = [];
  const directoryNames: { name: string; px: number }[] = [];
  const cardBoxes: { id: string; box: DOMRect }[] = [];
  for (const card of document.querySelectorAll<HTMLElement>("#map-container .node-card")) {
    const box = card.getBoundingClientRect();
    cardBoxes.push({ id: card.dataset.id!, box });
    const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row")].filter(row => getComputedStyle(row).display !== "none");
    const hub = card.querySelector(".symbol-anchor.hub")?.getBoundingClientRect();
    cards[card.dataset.id!] = {
      ...placed(card), w: card.offsetWidth, h: card.offsetHeight,
      rows: rows.map(row => `${row.dataset.symbol} ${row.offsetTop} ${row.offsetHeight}`),
      hub: hub ? [hub.width / k, (hub.right - box.right) / k] : []
    };
    // Every drawn part of the card inside the card, but the hub, whose overhang at reading scale is designed.
    for (const part of card.querySelectorAll("*")) {
      const rect = shown(part);
      if (!rect || part.closest(".symbol-anchor.hub")) continue;
      const by = outside(rect, box);
      if (by > half) broken.push(`${named(card, part.closest<HTMLElement>(".symbol-row"))}: ${part.getAttribute("class") || part.tagName} ${by.toFixed(1)} px outside its card`);
    }
    // Every part of a row the ladder holds within the row: its name, its dots, its buttons, its badges, its highlight. A
    // row is a band across its card, as the review's instrument read it: its parts stay between its top and its bottom,
    // and across, the card's edges bound them.
    const dots: { row: HTMLElement; rect: DOMRect }[] = [], names: { row: HTMLElement | null; rect: Box }[] = [];
    for (const row of rows) {
      const rowRect = row.getBoundingClientRect();
      const rowBox = { left: box.left, right: box.right, top: rowRect.top, bottom: rowRect.bottom };
      const parts = [...row.querySelectorAll(".symbol-label-text, .symbol-anchor.dot, .local-symbol-pin, .local-symbol-more, .type-refs-indicator")];
      for (const part of parts) {
        const rect = shown(part);
        if (!rect) continue;
        const by = outside(rect, rowBox);
        if (by > half) broken.push(`${named(card, row)}: ${part.getAttribute("class")} ${by.toFixed(1)} px outside its row`);
        if (part.classList.contains("dot")) {
          dots.push({ row, rect });
          // At the overview band a silent row draws nothing, its dots included: the wires end on the files' hubs.
          if (lod === "overview" && !row.classList.contains("symbol-pinned-named")) broken.push(`${named(card, row)}: a silent row draws a dot`);
        }
        if (part.classList.contains("symbol-label-text")) {
          names.push({ row, rect });
          if (!row.classList.contains("internals-row")) symbolNames.push({ name: named(card, row), px: rect.height });
        }
      }
      // A pinned row's highlight begins at its wrapper's top, which stands above the row by the wrapper's margin, into
      // the gap before the row above: the second designed exception beside the hub's overhang, the look the owner has
      // accepted at reading scale. It may stand above its row by that margin in the map's own units, never into the row
      // above, and never below its row.
      const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper");
      if (row.classList.contains("symbol-pinned") && wrapper && shown(wrapper)) {
        const layer = getComputedStyle(wrapper, "::before"), at = wrapper.getBoundingClientRect();
        const light = { left: at.left, right: at.right, top: at.top + parseFloat(layer.top) * k, bottom: at.top + (parseFloat(layer.top) + parseFloat(layer.height)) * k };
        const margin = Math.max(0, -parseFloat(getComputedStyle(wrapper).marginTop)) * k;
        const above = rows[rows.indexOf(row) - 1]?.getBoundingClientRect();
        const by = outside(light, { ...rowBox, top: rowBox.top - margin });
        if (by > half) broken.push(`${named(card, row)}: the pinned highlight ${by.toFixed(1)} px outside its row and its wrapper's margin`);
        if (above && light.top < above.bottom - half) broken.push(`${named(card, row)}: the pinned highlight reaches into the row above`);
        // The owner's rule (2026-11-06: "buttons interesecting the blue highlight border"): the highlight holds its row's
        // whole head, the name and the buttons drawn, with air on every side, a map pixel at least; no button crosses
        // its border.
        const air = k - 0.05;
        for (const part of row.querySelectorAll(".symbol-label-text, .local-symbol-pin, .local-symbol-more")) {
          const rect = shown(part);
          if (!rect || !wrapper.contains(part)) continue;
          const room = Math.min(rect.left - light.left, light.right - rect.right, rect.top - light.top, light.bottom - rect.bottom);
          if (room < air) broken.push(`${named(card, row)}: ${part.getAttribute("class")} stands ${room.toFixed(1)} px from its highlight's border`);
        }
      }
    }
    // The file's name as drawn: the text in the layout at reading scale, the held drawing beyond it.
    const held = card.querySelector<HTMLElement>(".local-file-name-held"), text = card.querySelector<HTMLElement>(".local-file-name-text");
    const heldRect = held && shown(held);
    if (heldRect) {
      const style = getComputedStyle(held!), scale = new DOMMatrix(style.transform).a;
      fileNames.push({ name: named(card), px: parseFloat(style.lineHeight) * scale * k });
      names.push({ row: null, rect: heldRect });
      // Its lines as drawn (the owner, 2026-11-06: "main.r / s" and "verif / y.ts" beside the node's More), each
      // measured here in the name's own font: no line but a cut last one ends inside a segment between the name's seams
      // that would fit a full line; none runs past its room or under the node's buttons; and joined they are the name,
      // or the last ends with an ellipsis.
      const name = held!.dataset.name ?? "", chosen = held!.getAttribute(`data-lines-${lod}-${step}`);
      const drawn = (chosen ?? "").split("\n");
      const line = parseFloat(style.lineHeight);
      // The lines drawn are the lines chosen: the generated content is that attribute, and the name stands as many
      // lines tall, since nothing wraps them again.
      if (chosen === null) broken.push(`${named(card)}: the file's name has no lines chosen for ${lod} step ${step}`);
      // The browser gives generated content from an attribute as the string it resolves to, a line break written "\a ".
      const content = getComputedStyle(held!, "::after").content;
      const written = `"${(chosen ?? "").replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\n", "\\a ")}"`;
      if (content !== written) broken.push(`${named(card)}: the file's name draws ${content}, not its chosen lines ${written}`);
      if (Math.abs(held!.clientHeight - drawn.length * line) > half) broken.push(`${named(card)}: the file's name stands ${held!.clientHeight} px tall for ${drawn.length} lines of ${line}`);
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily};letter-spacing:${style.letterSpacing}`;
      document.body.append(probe);
      const width = (text: string): number => { probe.textContent = text; return probe.getBoundingClientRect().width; };
      const full = parseFloat(style.width);
      const segments: { start: number; end: number; fits: boolean }[] = [];
      let at = 0;
      for (const segment of seams[name] ?? [name]) { segments.push({ start: at, end: at + segment.length, fits: width(segment) <= full - 1 }); at += segment.length; }
      let offset = 0;
      const buttons = [...card.querySelectorAll(".local-card-actions button")].map(button => shown(button)).filter((rect): rect is DOMRect => !!rect);
      drawn.forEach((text, index) => {
        const drawnWidth = width(text);
        if (drawnWidth > full + half) broken.push(`${named(card)}: the file's name's line ${index + 1} runs ${(drawnWidth - full).toFixed(1)} past its room`);
        const top = heldRect.top + index * line * scale * k;
        const lineBox = { left: heldRect.left, right: heldRect.left + drawnWidth * scale * k, top, bottom: top + line * scale * k };
        if (text && buttons.some(rect => overlap(lineBox, rect) > half)) broken.push(`${named(card)}: the file's name's line ${index + 1} runs under its buttons`);
        if (index === drawn.length - 1) return;
        offset += text.length;
        const inside = segments.find(segment => offset > segment.start && offset < segment.end);
        if (inside?.fits) broken.push(`${named(card)}: the file's name breaks inside "${name.slice(inside.start, inside.end)}", which fits a line: ${drawn.join(" / ")}`);
      });
      probe.remove();
      if (drawn.join("") !== name && !drawn.at(-1)!.endsWith("…")) broken.push(`${named(card)}: the file's name is drawn "${drawn.join(" / ")}"`);
    } else if (text && shown(text)) {
      const lines = new Set([...text.getClientRects()].map(rect => Math.round(rect.top))).size || 1;
      fileNames.push({ name: named(card), px: text.getBoundingClientRect().height / lines });
      names.push({ row: null, rect: text.getBoundingClientRect() });
    }
    // No two dots overlap, and no dot lies over a name.
    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        if (overlap(dots[i].rect, dots[j].rect) > half) broken.push(`${named(card, dots[i].row)} and ${dots[j].row.dataset.symbol}: two dots overlap`);
      }
      for (const name of names) {
        if (overlap(dots[i].rect, name.rect) > half) broken.push(`${named(card, dots[i].row)}: a dot lies over ${name.row ? `the name of ${name.row.dataset.symbol}` : "the file's name"}`);
      }
    }
  }
  // A directory's label: what it draws inside its membrane and over no card; its name's size as drawn.
  for (const label of document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")) {
    const shape = label.parentElement?.querySelector<SVGPathElement>(":scope > .local-membrane .local-membrane-shape");
    const drawn: Box[] = [];
    const held = label.querySelector<HTMLElement>(":scope > .local-directory-held"), heldBox = held && shown(held);
    if (heldBox) {
      const style = getComputedStyle(held!), scale = new DOMMatrix(style.transform).a;
      drawn.push(heldBox);
      directoryNames.push({ name: label.dataset.directory!, px: parseFloat(style.lineHeight) * scale * k });
      for (const control of label.querySelectorAll(":scope > .local-directory-ancestors, :scope > .local-directory-controls button")) { const rect = shown(control); if (rect) drawn.push(rect); }
    } else {
      for (const part of label.querySelectorAll("*")) { const rect = shown(part); if (rect) drawn.push(rect); }
      const name = label.querySelector(".local-directory-name");
      if (name) directoryNames.push({ name: label.dataset.directory!, px: name.getBoundingClientRect().height });
    }
    for (const part of drawn) {
      if (shape) {
        const inverse = shape.getScreenCTM()!.inverse();
        const corners = [[part.left + half, part.top + half], [part.right - half, part.top + half], [part.left + half, part.bottom - half], [part.right - half, part.bottom - half]];
        if (corners.some(([x, y]) => !shape.isPointInFill(new DOMPoint(x, y).matrixTransform(inverse)))) broken.push(`${label.dataset.directory}: its label draws outside its membrane`);
      }
      for (const card of cardBoxes) if (overlap(part, card.box) > half) broken.push(`${label.dataset.directory}: its label draws over ${card.id.split("/").pop()}`);
    }
  }
  // The Zoom buttons' state, and the whole picture's box against the frame's, for the farthest zoom.
  const button = (zoom: string): boolean => document.querySelector<HTMLButtonElement>(`#controls [data-zoom="${zoom}"]`)!.disabled;
  const picture = document.querySelector("#map-container .local-placed")!.getBoundingClientRect(), view = document.querySelector("#view-map")!.getBoundingClientRect();
  return { k, lod, step, broken, cards, symbolNames, fileNames, directoryNames, zoomOutDisabled: button("out"), zoomInDisabled: button("in"),
    pictureInFrame: picture.left >= view.left - half && picture.right <= view.right + half && picture.top >= view.top - half && picture.bottom <= view.bottom + half };
};

type Audit = Awaited<ReturnType<typeof audit>>;

/**
 * Zoom out one press at a time from reading scale until the Zoom Out button says it can do no more, auditing each press:
 * since 2026-11-06 the farthest zoom is the ladder's last step, or four fifths of the scale that frames the whole map
 * where that is farther, and no longer a fixed 0.05.
 */
async function walkOut(page: Page, presses = 30): Promise<Audit[]> {
  const audits = [await audit(page)];
  for (let press = 0; press < presses && !audits.at(-1)!.zoomOutDisabled; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
    audits.push(await audit(page));
  }
  return audits;
}

/** The rules every press keeps, and the sizes and boxes compared across presses. */
function expectBoxesHeld(audits: readonly Audit[]): void {
  expect(audits[0].step).toBe(0);
  expect(audits.at(-1)!.step).toBe(LAST_STEP);
  // The walk ends at the farthest zoom, and only there does Zoom Out say it can do no more; the camera stops either at
  // the last step's scale or, farther, where the whole map stands in the frame with its margin.
  // A scale is read from the computed transform, which the browser writes to six significant digits, so two readings
  // of one scale agree only to about 3e-6 of it each (0.161506 read against 0.16150574 on rosetta-manifest.json).
  const last = audits.at(-1)!, lastStepScale = audits[0].k * STEP_RATIO ** -LAST_STEP, read = 1e-5;
  expect(last.zoomOutDisabled).toBe(true);
  for (const each of audits.slice(0, -1)) expect(each.zoomOutDisabled).toBe(false);
  expect(last.k).toBeLessThanOrEqual(lastStepScale * (1 + read));
  if (last.k < lastStepScale * (1 - read)) expect(last.pictureInFrame).toBe(true);
  else expect(Math.abs(last.k - lastStepScale) / lastStepScale).toBeLessThan(read);
  const first = audits[0];
  for (const [press, each] of audits.entries()) {
    const where = `press ${press}, ${each.lod} step ${each.step}`;
    expect(each.broken, where).toEqual([]);
    // Every card's box and every row's box stands where the layout put it, in the map's own units; the hub keeps its
    // size and its overhang there, the one part designed to stand past its card's edge.
    for (const [id, card] of Object.entries(first.cards)) {
      const now = each.cards[id];
      expect(now, `${where}: ${id}`).toBeDefined();
      expect([now.x, now.y, now.w, now.h], `${where}: ${id}`).toEqual([card.x, card.y, card.w, card.h]);
      expect(now.rows, `${where}: ${id}`).toEqual(card.rows);
      expect(now.hub.length, `${where}: ${id}`).toBe(card.hub.length);
      now.hub.forEach((value, index) => expect(Math.abs(value - card.hub[index]), `${where}: ${id} hub`).toBeLessThan(0.5));
    }
    // Symbol names are one size, their reading size, from reading scale through the far band (the overview's rows are
    // silent but for a pin). File names are one size at every press, and their reading size wherever the zoom stands on
    // a step from the middle band out (beyond the last step the drawing shrinks with the map). A directory's name holds
    // its reading size through the middle band, where its label has the room, and is never smaller than the map's own
    // scale.
    const onStep = press === each.step, reading = first.k;
    if (each.step <= FAR_LAST_STEP) {
      expect(each.symbolNames.length, where).toBeGreaterThan(0);
      for (const name of each.symbolNames) expect(Math.abs(name.px - SYMBOL_NAME * reading), `${where}: ${name.name}`).toBeLessThan(1);
    }
    const files = each.fileNames.map(name => name.px);
    expect(files.length, where).toBeGreaterThan(0);
    expect(Math.max(...files) - Math.min(...files), `${where}: file names ${Math.min(...files).toFixed(1)} to ${Math.max(...files).toFixed(1)} px`).toBeLessThan(0.5);
    if (each.lod !== "reading" && each.lod !== "close" && onStep) for (const name of each.fileNames) expect(Math.abs(name.px - FILE_NAME * reading), `${where}: ${name.name}`).toBeLessThan(1);
    for (const name of each.directoryNames) {
      expect(name.px, `${where}: ${name.name}`).toBeGreaterThanOrEqual(DIRECTORY_NAME * each.k - 0.5);
      if (each.lod === "middle" && onStep) expect(Math.abs(name.px - DIRECTORY_NAME * reading), `${where}: ${name.name}`).toBeLessThan(1);
    }
  }
}

test("on this repository's still picture, every press out keeps each held part inside its box and names at one size", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(url(stillPicture));
  await page.locator(`.node-card[data-id="${stillPicture}"]`).waitFor();
  await localMapStill(page);
  const audits = await walkOut(page);
  expectBoxesHeld(audits);
  // The far bands were reached and walked: the overview's silent rows draw no symbol name.
  expect(audits.some(each => each.lod === "far")).toBe(true);
  expect(audits.filter(each => each.lod === "overview").every(each => each.symbolNames.length === 0)).toBe(true);
});

/**
 * Where the layout put every card, in the map's own units, which no transform enters: its place in the picture and its
 * size, its shown rows' places and heights, and the centre of every anchor the placement reads as a pin, in its card.
 */
const laidOut = (page: Page) => page.evaluate(() => {
  const root = document.querySelector("#map-container .local-placed")!;
  const offsetIn = (element: HTMLElement, stop: Element): { x: number; y: number } => {
    let x = 0, y = 0;
    for (let at: HTMLElement | null = element; at && at !== stop; at = at.offsetParent as HTMLElement | null) { x += at.offsetLeft; y += at.offsetTop; }
    return { x, y };
  };
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(card => {
    const at = offsetIn(card, root);
    const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row")].filter(row => row.offsetParent).map(row => `${row.dataset.symbol} ${row.offsetTop} ${row.offsetHeight}`);
    const pins = [...card.querySelectorAll<HTMLElement>(".symbol-anchor")].filter(anchor => anchor.offsetParent)
      .map(anchor => `${anchor.classList.contains("inbound") ? "uses" : "offers"} ${anchor.dataset.symbol ?? "*"} ${offsetIn(anchor, card).y + anchor.offsetHeight / 2}`);
    return [card.dataset.id!, { box: `${at.x},${at.y} ${card.offsetWidth}x${card.offsetHeight}`, rows, pins }];
  }));
});

/**
 * A pin a reader can make in each state, by the control that state draws for it, on the subject's first symbol row,
 * which the arrival frames at its title whatever the picture's content (a named symbol lower down left the frame when the
 * Live Docs gained a card, 2026-11-06).
 */
const firstRow = (page: Page) => page.locator(`.node-card[data-id="${stillPicture}"] .symbol-row:not(.internals-row)`).first();
const pinBy = {
  rowPin: async (page: Page) => firstRow(page).locator(".local-symbol-pin").click(),
  rowMore: async (page: Page) => {
    await firstRow(page).locator(".local-symbol-more").click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Pin symbol", exact: true }).click();
  },
  nodeMore: async (page: Page) => {
    await page.locator(`.node-card[data-id="${stillPicture}"] .local-file-more`).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Pin file", exact: true }).click();
  }
};

/**
 * Open the still picture with the continuing search off or on, zoom out by so many presses (or as far as the camera
 * goes), make the pin and read the layout once the picture and any search are at rest.
 */
async function drawnAfter(page: Page, presses: number, pin: (page: Page) => Promise<unknown>, searchStarts = 0) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts } } })
  });
  await page.goto(url(stillPicture));
  await page.locator(`.node-card[data-id="${stillPicture}"]`).waitFor();
  await localMapStill(page);
  await expect(page.locator(`.node-card[data-id="${stillPicture}"] .symbol-row.symbol-pinned`)).toHaveCount(0);
  const zoomOut = page.getByRole("button", { name: "Zoom Out", exact: true });
  for (let press = 0; press < presses && await zoomOut.isEnabled(); press += 1) {
    await zoomOut.click();
    await localMapStill(page);
  }
  const state = await page.locator("#map-container").evaluate(map => `${(map as HTMLElement).dataset.lod} ${(map as HTMLElement).dataset.step}`);
  await pin(page);
  await localMapStill(page);
  return { state, layout: await laidOut(page) };
}

test("a picture drawn at any zoom lays out every card, row and pin as the picture drawn at reading scale", async ({ page }) => {
  test.setTimeout(360_000);
  // A render takes each card's width from its content and each pin from its dot as the layout put it, and the search
  // that follows prices its starts from the rows and pins it read. Below reading scale the ladder cuts a held name to its
  // room, moves and scales a held dot and lets a row's slot leave; none of it may reach the layout, or a pin made far out
  // would draw another picture than the same pin made close up (found 2026-11-06: the still picture's subject came out
  // 202 px wide pinned five presses out, 284 px pinned at reading scale; five cards a pixel higher pinned one press out).
  const states = [
    { name: "the reading band's first step out", presses: 1, pin: pinBy.rowPin, expect: "reading 1" },
    { name: "the middle band", presses: 3, pin: pinBy.rowPin, expect: "middle 3" },
    { name: "the far band", presses: 5, pin: pinBy.rowMore, expect: "far 5" },
    { name: "the far band, with the continuing search on", presses: 5, pin: pinBy.rowMore, expect: "far 5", searchStarts: 32 },
    { name: "the overview band", presses: 8, pin: pinBy.nodeMore, expect: "overview 8" },
    { name: "the farthest zoom", presses: 40, pin: pinBy.nodeMore, expect: `overview ${LAST_STEP}` }
  ];
  for (const state of states) {
    const reference = await drawnAfter(page, 0, state.pin, state.searchStarts);
    expect(reference.state).toBe("reading 0");
    const drawn = await drawnAfter(page, state.presses, state.pin, state.searchStarts);
    expect(drawn.state, state.name).toBe(state.expect);
    expect(Object.keys(drawn.layout).sort(), state.name).toEqual(Object.keys(reference.layout).sort());
    for (const [id, card] of Object.entries(reference.layout)) expect(drawn.layout[id], `${state.name}: ${id}`).toEqual(card);
  }
});

test("walking back in from the last step, every press shows the band, the step and the picture it showed on the way out", async ({ page }) => {
  test.setTimeout(180_000);
  // Returning to a place keeps its picture (the root's review of the far bands, 2026-11-06): with the band edges at
  // literal ratios, one press out was the reading band going out and the middle band coming back. The walk turns at the
  // last step, the last press on the presses' grid; a farther zoom where the whole map stands in the frame lies between.
  await page.goto(url(stillPicture));
  await page.locator(`.node-card[data-id="${stillPicture}"]`).waitFor();
  await localMapStill(page);
  const out = await walkOut(page, LAST_STEP);
  expect(out.at(-1)!.step).toBe(LAST_STEP);
  const back: Audit[] = [out.at(-1)!];
  for (let press = out.length - 1; press > 0; press -= 1) {
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await localMapStill(page);
    back.unshift(await audit(page));
  }
  for (const [press, going] of out.entries()) {
    const coming = back[press], where = `press ${press}`;
    expect([coming.lod, coming.step], where).toEqual([going.lod, going.step]);
    expect(Math.abs(coming.k - going.k) / going.k, where).toBeLessThan(1e-6);
    expect(coming.broken, where).toEqual([]);
    for (const [id, card] of Object.entries(going.cards)) {
      const now = coming.cards[id];
      expect([now.x, now.y, now.w, now.h, now.rows], `${where}: ${id}`).toEqual([card.x, card.y, card.w, card.h, card.rows]);
      card.hub.forEach((value, index) => expect(Math.abs(now.hub[index] - value), `${where}: ${id} hub`).toBeLessThan(0.05));
    }
    for (const kind of ["symbolNames", "fileNames", "directoryNames"] as const) {
      expect(coming[kind].map(name => name.name), `${where}: ${kind}`).toEqual(going[kind].map(name => name.name));
      coming[kind].forEach((name, index) => expect(Math.abs(name.px - going[kind][index].px), `${where}: ${name.name}`).toBeLessThan(0.05));
    }
  }
});

test("on a file pinned whole, every row highlighted, the same, each highlight holding its row's head, and the overview silencing its rows", async ({ page }) => {
  test.setTimeout(120_000);
  // The owner's picture of 2026-11-06: rosetta-manifest.json pinned whole, at large zoom-outs, "places where elements are
  // whacking into each other" and "buttons interesecting the blue highlight border".
  await page.goto(url(rosetta, true));
  const subject = page.locator(`.node-card[data-id="${rosetta}"]`);
  await subject.waitFor();
  await localMapStill(page);
  await expect(subject.locator(".symbol-row.symbol-pinned")).toHaveCount(await subject.locator(".symbol-row").count());
  const audits = await walkOut(page);
  expectBoxesHeld(audits);
  // A whole-file pin is a pin of the file: at the overview band its rows go silent like any card's, and its card says it.
  const overview = audits.filter(each => each.lod === "overview");
  expect(overview.length).toBeGreaterThan(0);
  for (const each of overview) expect(each.symbolNames).toEqual([]);
  await expect(subject).toHaveClass(/file-pinned/u);
});

test("on an estate subject with a pinned symbol, the same, and the pinned row stays drawn at the overview band", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(url(payment));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapStill(page);
  await subject.locator('.symbol-row[data-symbol="PaymentService"] .local-symbol-pin').click();
  await localMapStill(page);
  await expect(subject.locator('.symbol-row[data-symbol="PaymentService"]')).toHaveClass(/symbol-pinned/u);
  const audits = await walkOut(page);
  expectBoxesHeld(audits);
  const overview = audits.filter(each => each.lod === "overview");
  expect(overview.length).toBeGreaterThan(0);
  // A pin is the reader's own mark: its row keeps its name, held and cut, at the overview band, and no other does.
  for (const each of overview) expect(each.symbolNames.map(name => name.name)).toEqual(["PaymentService.cs:PaymentService"]);
});
