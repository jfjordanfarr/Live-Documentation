import { expect, test, type Browser, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The zoom looks (Tuning → 2D Layout → Zoom Looks; the owner's hypothesis of 2026-11-08, "very very FEW breakpoints (2-3)
 * for heavily quanitized different looks of the nodes", the trial's design of 2026-11-10, and the default since
 * 2026-11-13, when the owner asked that what they judge be what the build shows without a switch). With three looks a slot
 * card changes only at two edges on the way out: reading through the second Zoom Out press, connections from the third
 * to the sixth, overview from the seventh. Read from the page as drawn: a press out and the press back show the same look;
 * inside a look every visible name keeps its text, its lines and its ellipsis, and every held part its size in the map's
 * own units; no card's box changes; and nothing drawn in a slot card in the connections or overview look is smaller than
 * 8 px on screen. With the stepped ladder chosen, by Tuning or by a link, the page still reports the ladder's bands and
 * steps press by press.
 */
const payment = "PaymentService/PaymentService.cs";
const estate = (zoomLooks?: "stepped" | "three"): string => `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: payment,
  pinSet: { entries: [{ nodeId: payment, symbol: "*" }] },
  // The probe links' reading choices (2026-11-10): the file's Purpose folded, PaymentService's description kept open.
  reading: [{ nodeId: payment, open: false }, { nodeId: payment, symbol: "PaymentService", open: true }],
  ...(zoomLooks ? { layout: { localMap: { zoomLooks } } } : {})
})}`;

/** The smallest size on screen, in pixels at 1440×960 and DPR 1, of any text or control a slot card draws past reading. */
const LEGIBLE_PX = 8;

test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

test.beforeEach(async ({ page }) => {
  // A fresh visitor's settings but the continuing search, which the suite keeps off so that a picture stays as drawn,
  // and Zoomed Out Fully, chosen as "Cards keep their size" in every case of this spec: Files only is Zoomed Out Fully's default since 2026-11-15, a design change by the owner's eye and a comparison with the cards' rows drawn as bars;
  // this spec holds the composition of a card whose box no zoom changes, the overview look's included.
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, overviewFiles: "keep" } } })
  });
});

/**
 * What one press shows, read from the DOM as drawn: the look, band and step the page reports; each card's box in the
 * map's own units; each visible name's text, lines and ellipsis; each held part's size in the map's own units; and the
 * size on screen of each visible text and control in a slot card.
 */
/**
 * The audit's own word on where a held name may break, independent of the code under test, as card-ladder-boxes.spec.ts
 * words it (the header round, 2026-11-08): after a hyphen; after a dot, unless what follows it is a short extension of
 * one or two characters, which stays with its dot; before such a dot; and before a capital that follows a small letter.
 */
function seamSegments(name: string): string[] {
  const cuts = new Set<number>();
  const shortExtension = /\.[^.-]{1,2}$/u.exec(name);
  for (let at = 1; at < name.length; at++) {
    const before = name[at - 1], here = name[at];
    if (before === "-") cuts.add(at);
    if (before === "." && !(shortExtension && at - 1 === shortExtension.index)) cuts.add(at);
    if (shortExtension && at === shortExtension.index) cuts.add(at);
    if (/\p{Ll}/u.test(before) && /\p{Lu}/u.test(here)) cuts.add(at);
  }
  const segments: string[] = [];
  let start = 0;
  for (const cut of [...cuts].sort((a, b) => a - b)) { segments.push(name.slice(start, cut)); start = cut; }
  segments.push(name.slice(start));
  return segments.filter(segment => segment);
}

const read = async (page: Page) => {
  const fileNames = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .local-file-name-held")].map(held => held.dataset.name ?? ""));
  return page.evaluate(readInPage, Object.fromEntries(fileNames.map(name => [name, seamSegments(name)])));
};
const readInPage = (segmentsOf: Record<string, string[]>) => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  const shown = (element: Element): boolean => {
    for (let at: Element | null = element; at && at !== map; at = at.parentElement) {
      const style = getComputedStyle(at);
      if (style.display === "none" || Number(style.opacity) === 0) return false;
    }
    const rect = element.getBoundingClientRect();
    return getComputedStyle(element).visibility === "visible" && rect.width > 0.05 && rect.height > 0.05;
  };
  const lineCount = (element: Element): number => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size;
  };
  // A held name is drawn as generated content: its lines are the content's, a quoted string with "\a " for a break.
  const generated = (element: Element): string => {
    const content = getComputedStyle(element, "::after").content;
    if (!content.startsWith("\"")) return "";
    return content.slice(1, -1).replace(/\\a ?/gu, "\n").replace(/\\(.)/gu, "$1");
  };
  const cards: Record<string, string> = {};
  const names: Record<string, string> = {};
  const held: Record<string, number> = {};
  const small: { what: string; px: number }[] = [];
  // The boxes of the held looks, as the far-zoom review's audit reads them (card-ladder-boxes.spec.ts): a row's head is its
  // drawn name, dots and buttons; it stays inside its card, clear of every other row's head and box, and no border or
  // layer of its row runs through it.
  const broken: string[] = [];
  const half = 0.5;
  type Box = { left: number; top: number; right: number; bottom: number };
  const across = (a: Box, b: Box): number => Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const down = (a: Box, b: Box): number => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const union = (boxes: Box[]): Box => ({ left: Math.min(...boxes.map(b => b.left)), top: Math.min(...boxes.map(b => b.top)),
    right: Math.max(...boxes.map(b => b.right)), bottom: Math.max(...boxes.map(b => b.bottom)) });
  for (const card of map.querySelectorAll<HTMLElement>(".node-card")) {
    const id = card.dataset.id!;
    cards[id] = `${card.offsetLeft},${card.offsetTop} ${card.offsetWidth}x${card.offsetHeight}`;
    if (!card.classList.contains("local-slot-card")) continue;
    const heldName = card.querySelector<HTMLElement>(".local-file-name-held"), plainName = card.querySelector<HTMLElement>(".local-file-name-text");
    if (heldName && shown(heldName)) {
      const lines = generated(heldName);
      names[id] = `${JSON.stringify(lines.split("\n"))} ${lines.includes("…") ? "cut" : "whole"}`;
      held[`${id} name`] = heldName.getBoundingClientRect().height / k;
      small.push({ what: `${id} name`, px: parseFloat(getComputedStyle(heldName).fontSize) * heldName.getBoundingClientRect().width / heldName.offsetWidth });
    } else if (plainName && shown(plainName)) {
      names[id] = `${plainName.textContent} ${lineCount(plainName)} lines`;
      held[`${id} name`] = plainName.getBoundingClientRect().height / k;
    }
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
      const key = `${id}:${row.dataset.symbol}`;
      const text = row.querySelector<HTMLElement>(".symbol-label-text");
      if (text && shown(text)) {
        // Cut across its one line, or below its last line where it wraps.
        const cut = text.scrollWidth > text.clientWidth + 0.5 || text.scrollHeight - text.clientHeight > parseFloat(getComputedStyle(text).fontSize) / 2;
        names[key] = `${text.textContent} ${lineCount(text)} lines ${cut ? "cut" : "whole"}`;
        const rect = text.getBoundingClientRect();
        held[`${key} name`] = rect.height / k;
        small.push({ what: `${key} name`, px: parseFloat(getComputedStyle(text).fontSize) * rect.width / text.offsetWidth });
      }
      for (const part of row.querySelectorAll<HTMLElement>(".symbol-anchor.dot, .local-symbol-more, .local-symbol-pin, .local-symbol-read")) {
        if (!shown(part)) continue;
        const rect = part.getBoundingClientRect(), label = `${key} ${part.className.split(" ").slice(0, 3).join(".")}`;
        held[label] = rect.height / k;
        small.push({ what: label, px: Math.min(rect.width, rect.height) });
      }
    }
    if (map.dataset.look && map.dataset.look !== "reading") {
      const cardBox = card.getBoundingClientRect();
      const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row")].filter(row => getComputedStyle(row).display !== "none");
      const rowBoxes = rows.map(row => ({ row, box: row.getBoundingClientRect() }));
      const heads = rows.map(row => {
        const parts = [...row.querySelectorAll<HTMLElement>(".symbol-label-text, .symbol-anchor.dot, .local-symbol-more, .local-symbol-pin, .local-symbol-read")].filter(shown);
        return { row, parts: parts.map(part => ({ part, box: part.getBoundingClientRect() })) };
      }).filter(head => head.parts.length);
      for (const { row, parts } of heads) {
        const name = `${id}:${row.dataset.symbol}`;
        for (const { part, box: rect } of parts) {
          const by = Math.max(cardBox.left - rect.left, rect.right - cardBox.right, cardBox.top - rect.top, rect.bottom - cardBox.bottom);
          if (by > half) broken.push(`${name}: ${part.className} ${by.toFixed(1)} px outside its card`);
        }
        const head = union(parts.map(({ box: rect }) => rect));
        for (const other of rowBoxes) {
          if (other.row !== row && across(head, other.box) > half && down(head, other.box) > half) broken.push(`${name}: its head lies over the row of ${other.row.dataset.symbol}`);
        }
        for (const other of heads) {
          if (other.row === row) continue;
          const theirs = union(other.parts.map(({ box: rect }) => rect));
          if (row.compareDocumentPosition(other.row) & Node.DOCUMENT_POSITION_FOLLOWING && across(head, theirs) > half && down(head, theirs) > half) broken.push(`${name}: its head overlaps ${other.row.dataset.symbol}'s`);
        }
        // Every border and layer the row's name box draws either holds the head's parts it lies across or keeps clear of them.
        const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper");
        if (!wrapper || !shown(wrapper)) continue;
        const own = wrapper.getBoundingClientRect(), style = getComputedStyle(wrapper);
        const drawn = (color: string): boolean => color !== "transparent" && !color.endsWith(", 0)");
        const edges: { what: string; box: Box }[] = [];
        if (style.borderBottomStyle !== "none" && parseFloat(style.borderBottomWidth) > 0 && drawn(style.borderBottomColor)) edges.push({ what: "border", box: own });
        for (const pseudo of ["::before", "::after"]) {
          const layer = getComputedStyle(wrapper, pseudo);
          if (layer.content === "none" || layer.content === "normal" || layer.display === "none") continue;
          if (!(layer.borderBottomStyle !== "none" && drawn(layer.borderBottomColor)) && layer.boxShadow === "none" && !drawn(layer.backgroundColor)) continue;
          const top = own.top + (wrapper.clientTop + parseFloat(layer.top)) * k;
          edges.push({ what: pseudo, box: { left: own.left, right: own.right, top, bottom: top + parseFloat(layer.height) * k } });
        }
        for (const edge of edges) for (const { part, box: rect } of parts) {
          if (across(edge.box, rect) <= half || down(edge.box, rect) <= half) continue;
          if (edge.box.top > rect.top + half || edge.box.bottom < rect.bottom - half) broken.push(`${name}: its name box's ${edge.what} runs through its ${part.className}`);
        }
      }
    }
    for (const control of card.querySelectorAll<HTMLElement>(".local-card-actions button")) {
      if (!shown(control)) continue;
      const rect = control.getBoundingClientRect();
      held[`${id} ${control.className}`] = rect.height / k;
      small.push({ what: `${id} ${control.className}`, px: Math.min(rect.width, rect.height) });
    }
    // Any other text the card draws, at its size on screen.
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement!;
      if (!node.textContent?.trim() || !shown(parent) || getComputedStyle(parent).color.endsWith(", 0)")) continue;
      const scale = parent.offsetWidth ? parent.getBoundingClientRect().width / parent.offsetWidth : k;
      small.push({ what: `${id} ${parent.className || parent.tagName}: ${node.textContent.trim().slice(0, 24)}`, px: parseFloat(getComputedStyle(parent).fontSize) * scale });
    }
  }
  // Each drawn line of a held file name that ends inside a word, where every word of the name fits a line: a line ends
  // at a seam of the name by the audit's oracle unless the segment it ends in is wider than a line.
  const brokenWords: string[] = [], widerWords: string[] = [];
  const canvas = document.createElement("canvas").getContext("2d")!;
  for (const held of map.querySelectorAll<HTMLElement>(".local-slot-card .local-file-name-held")) {
    if (!shown(held)) continue;
    const name = held.dataset.name ?? "", lines = generated(held).split("\n"), segments = segmentsOf[name] ?? [name];
    const style = getComputedStyle(held);
    canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const lineWidth = held.clientWidth;
    let at = 0;
    const seams = new Map<number, string>();
    for (const segment of segments) { seams.set(at, segment); at += segment.length; }
    let end = 0;
    for (const line of lines.slice(0, -1)) {
      end += line.length;
      if (seams.has(end)) continue;
      // The segment the line ends inside: is it wider than a line?
      let start = 0, inside = "";
      for (const [from, segment] of seams) if (from < end) { start = from; inside = segment; }
      if (canvas.measureText(inside).width > lineWidth + 0.5) { widerWords.push(`${name}: "${line}" ends inside "${inside}", wider than a line`); continue; }
      brokenWords.push(`${name}: "${line}" ends inside "${inside}" at ${end - start}`);
    }
  }
  return { look: map.dataset.look ?? null, lod: map.dataset.lod ?? null, step: map.dataset.step ?? null, k, cards, names, held, small, broken, brokenWords, widerWords };
};

type Reading = Awaited<ReturnType<typeof read>>;

/** The picture at rest, and the fade of a change of look ended: what leaves keeps its visibility until its fade is done. */
async function still(page: Page): Promise<void> {
  await localMapStill(page);
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== "running"
    || !(animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && animation.effect.target.closest("#map-container"))));
}

/** Zoom Out ten presses from reading scale and back in, reading each press: out[p] and back[p] are press p. */
async function walk(page: Page): Promise<{ out: Reading[]; back: Reading[] }> {
  const out = [await read(page)];
  for (let press = 1; press <= 10; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    out.push(await read(page));
  }
  const back: Reading[] = [out[10]];
  for (let press = 9; press >= 0; press -= 1) {
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await still(page);
    back.unshift(await read(page));
  }
  return { out, back };
}

test("with three looks, a slot card changes only at two edges, each the same both ways, and nothing changes inside a look", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(estate("three"));
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  await page.mouse.move(120, 400);
  // The reader's own choices, which descriptions are open and what is pinned, as the page's link carries them.
  const choices = () => {
    const snapshot = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
    return { reading: snapshot.reading, pins: snapshot.pinSet };
  };
  const before = choices();
  expect(before.pins?.entries.length).toBeGreaterThan(0);
  const { out, back } = await walk(page);
  // A change of look changes no choice: back at reading scale the same descriptions are open and the same things pinned.
  expect(choices()).toEqual(before);
  // The looks by press, the design's: reading through the second press out, connections the third to the sixth,
  // overview from the seventh; and a press back shows the look the press out showed.
  const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(press => press <= 2 ? "reading" : press <= 6 ? "connections" : "overview");
  expect(out.map(each => each.look)).toEqual(expected);
  expect(back.map(each => each.look)).toEqual(expected);
  const first = out[0];
  for (const look of ["reading", "connections", "overview"]) {
    const inside = [...out, ...back].map((each, index) => ({ each, where: `${index <= 10 ? "out" : "back"} press ${index % 11}` })).filter(({ each }) => each.look === look);
    const [reference] = inside;
    for (const { each, where } of inside) {
      // Every visible name's text, lines and ellipsis are those the look showed first.
      expect.soft(each.names, `${look}, ${where}: names`).toEqual(reference.each.names);
      // Every held part keeps its size in the map's own units: on screen it simply follows the zoom.
      expect.soft(Object.keys(each.held).sort(), `${look}, ${where}: held parts`).toEqual(Object.keys(reference.each.held).sort());
      for (const [part, size] of Object.entries(each.held)) {
        const was = reference.each.held[part];
        if (was !== undefined) expect.soft(Math.abs(size - was) / was, `${look}, ${where}: ${part} ${was.toFixed(2)} → ${size.toFixed(2)} map px`).toBeLessThan(0.01);
      }
    }
  }
  for (const [index, each] of [...out, ...back].entries()) {
    const where = `${index <= 10 ? "out" : "back"} press ${index % 11}, ${each.look}`;
    // A card's box never changes with zoom.
    expect.soft(each.cards, `${where}: card boxes`).toEqual(first.cards);
    // Past reading, every row's head stays inside its card and clear of the other rows, no border runs through it.
    expect.soft(each.broken, `${where}: boxes`).toEqual([]);
    // In overview, where a file's name is the card's only text, no line of it ends inside a word that fits a line.
    if (each.look === "overview") expect.soft(each.brokenWords, `${where}: file names broken inside a word`).toEqual([]);
    // Past reading, nothing a slot card draws is smaller than legible.
    if (each.look !== "reading") {
      const tiny = each.small.filter(part => part.px < LEGIBLE_PX - 0.05).map(part => `${part.what} ${part.px.toFixed(1)} px`);
      expect.soft(tiny, `${where}: drawn smaller than ${LEGIBLE_PX} px`).toEqual([]);
    }
  }
  // The walk read something in each look: names in all three and held parts beyond reading.
  for (const look of ["reading", "connections", "overview"]) expect(Object.keys(out.find(each => each.look === look)!.names).length, look).toBeGreaterThan(0);
});

/**
 * When a text leaves a card, its room goes to the name it belonged to (2026-11-13; the owner, 2026-11-05: "That text
 * space we're reserving? That should be space that the symbols themselves should be able to take up once we're at a
 * sufficiently far-away zoom"). Read from the page as drawn, with an oracle of its own: a symbol's name drawn cut, across
 * its line or below its last, while its row has room on screen below that last line for another line of the name at the
 * size it is drawn, with the highlight's two units of air, is a name cut while room of its own stands empty.
 */
const cutBesideRoom = (page: Page) => page.evaluate(() => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  const shown = (element: Element): boolean => {
    for (let at: Element | null = element; at && at !== map; at = at.parentElement) {
      const style = getComputedStyle(at);
      if (style.display === "none" || Number(style.opacity) === 0) return false;
    }
    return getComputedStyle(element).visibility === "visible" && element.getBoundingClientRect().width > 0.05;
  };
  const cut: string[] = [], whole: string[] = [], wrapped: string[] = [];
  for (const card of map.querySelectorAll<HTMLElement>(".local-slot-card")) {
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
      const text = row.querySelector<HTMLElement>(".symbol-label-text");
      if (!text || !shown(text)) continue;
      const name = `${card.dataset.id}:${row.dataset.symbol}`;
      const box = text.getBoundingClientRect();
      // A line of the name on screen: its font at the scale it is drawn.
      const line = parseFloat(getComputedStyle(text).fontSize) * box.width / text.offsetWidth;
      const range = document.createRange();
      range.selectNodeContents(text);
      if (new Set([...range.getClientRects()].filter(rect => rect.width > 0 && rect.top < box.bottom).map(rect => Math.round(rect.top))).size > 1) wrapped.push(name);
      if (!(text.scrollWidth > text.clientWidth + 0.5 || text.scrollHeight - text.clientHeight > parseFloat(getComputedStyle(text).fontSize) / 2)) { whole.push(name); continue; }
      const room = row.getBoundingClientRect().bottom - box.bottom - 2 * k;
      if (room >= line) cut.push(`${name}: cut with ${room.toFixed(1)} px below it, a line being ${line.toFixed(1)} px`);
    }
  }
  return { look: map.dataset.look ?? null, cut, whole, wrapped };
});

test("in the connections and overview looks a symbol's name is cut only where its row holds no further line of it", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(estate("three"));
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await still(page);
  await page.mouse.move(120, 400);
  const wrapped = new Set<string>();
  for (let press = 1; press <= 8; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    const seen = await cutBesideRoom(page);
    if (seen.look === "reading") continue;
    expect.soft(seen.cut, `press ${press}, ${seen.look}`).toEqual([]);
    for (const name of seen.wrapped) wrapped.add(`${seen.look} ${name}`);
  }
  // The subject's own class, "PaymentService", had read "Payment…" across the whole connections look over a blank line
  // of its row: it now stands whole on two lines there, broken at its seam.
  expect([...wrapped]).toContain(`connections ${payment}:PaymentService`);
});

/**
 * The counts at a card's foot in the connections look (2026-11-13): "+N symbols" and the framed "+N connections" either
 * stand at the look's held size or are not drawn, never at the map's own size; in a look made for connections they are
 * what a card without drawn rows has to say, and "+N connections" still reveals them where it stands. Read on this
 * repository's `scripts/doc-tools` opened, the root's subject, where `documentationLinks.ts` draws no row.
 */
/**
 * Segoe UI's line metrics over this machine's fallback font (the root's emulation of 2026-11-13): the app's font is
 * "Segoe UI", sans-serif; the owner's Windows browser has it, whose normal line is 1.33 of the font's size, while the
 * suite's Chromium falls back to DejaVu Sans, about 1.09 to 1.16. The owner's screen showed every long symbol name of
 * the pinned-file subject cut on one line in the connections look, where every picture here showed them wrapped. The
 * glyphs stay DejaVu Sans's, wider than Segoe UI's: only the lines are emulated.
 */
const SEGOE_LINES = ["400", "700"].map(weight => `@font-face { font-family: "Segoe UI"; font-weight: ${weight}; src: local("DejaVu Sans${weight === "700" ? " Bold" : ""}"); ascent-override: 107.9%; descent-override: 25.1%; line-gap-override: 0%; }`).join(" ");

/** A fresh visitor with the three looks, under this machine's lines or Segoe UI's, so many presses out from a subject. */
async function openUnder(browser: Browser, path: string, subject: string, lines: "fallback" | "segoe", presses: number) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, zoomLooks: "three", overviewFiles: "keep" } } })
  });
  if (lines === "segoe") await context.addInitScript(css => {
    const add = (): void => { const style = document.createElement("style"); style.textContent = css; document.documentElement.appendChild(style); };
    if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true });
  }, SEGOE_LINES);
  const page = await context.newPage();
  await page.goto(path);
  await page.locator(`.node-card[data-id="${subject}"]`).waitFor();
  await still(page);
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
  }
  await page.mouse.move(120, 400);
  return { context, page };
}

/** What the connections look shows of a subject three presses out, under this machine's lines or Segoe UI's. */
async function connectionsUnder(browser: Browser, path: string, subject: string, lines: "fallback" | "segoe") {
  const { context, page } = await openUnder(browser, path, subject, lines, 3);
  const line = await page.evaluate(() => getComputedStyle(document.querySelector(".local-slot-card .symbol-row .symbol-label-text")!).lineHeight);
  const seen = await cutBesideRoom(page);
  const held = await page.evaluate(() => {
    const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    return [...document.querySelectorAll<HTMLElement>("#map-container .local-slot-card")].filter(card => [...card.querySelectorAll<HTMLElement>(":scope > button.local-disclosure")]
      .some(count => getComputedStyle(count).visibility === "visible" && count.getBoundingClientRect().height / (parseFloat(getComputedStyle(count).height) * k) > 2)).map(card => card.dataset.id!).sort();
  });
  await context.close();
  return { look: seen.look, line, wrapped: seen.wrapped.sort(), cut: seen.cut, held };
}

test("what the connections look shows does not depend on the platform font's line: with Segoe UI's lines the names still wrap and the counts still stand", async ({ browser }) => {
  test.setTimeout(240_000);
  const subjects = [
    { path: "/?view=local&node=scripts/doc-tools/documentationLinks.ts", subject: "scripts/doc-tools/documentationLinks.ts" },
    { path: "/?view=local&dir=scripts/doc-tools", subject: "scripts/doc-tools/documentationLinks.ts" }
  ];
  for (const { path, subject } of subjects) {
    const here = await connectionsUnder(browser, path, subject, "fallback");
    const there = await connectionsUnder(browser, path, subject, "segoe");
    expect([here.look, there.look], path).toEqual(["connections", "connections"]);
    // Under either font's lines, no name is cut while its row holds another line of it, the same names wrap, and the same
    // cards hold their counts at the look's size.
    expect.soft(there.cut, `${path}, Segoe UI's lines: line ${there.line}`).toEqual([]);
    expect.soft(there.wrapped, `${path}: names wrapped under Segoe UI's lines (line ${there.line}) against the fallback's (${here.line})`).toEqual(here.wrapped);
    expect.soft(there.held, `${path}: cards holding their counts under Segoe UI's lines against the fallback's`).toEqual(here.held);
  }
  // The pinned file's long names wrap and the opened directory's row-less cards hold their counts: the walk saw something.
  const links = await connectionsUnder(browser, subjects[0].path, subjects[0].subject, "segoe");
  expect(links.wrapped.length).toBeGreaterThan(5);
  const directory = await connectionsUnder(browser, subjects[1].path, subjects[1].subject, "segoe");
  expect(directory.held).toContain("scripts/doc-tools/documentationLinks.ts");
});

/**
 * The drawn rows' heads of one card in the connections look, read from the page as drawn, top to bottom: each head the
 * union of its name's text, its More and its dots, and its pinned highlight where it has one, on screen.
 */
const headsOf = (page: Page, id: string) => page.evaluate(cardId => {
  const card = document.querySelector<HTMLElement>(`.node-card[data-id="${cardId}"]`)!;
  const shown = (element: Element): boolean => getComputedStyle(element).visibility === "visible" && element.getBoundingClientRect().height > 0;
  return [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")].filter(row => row.offsetHeight > 0).map(row => {
    const parts = [...row.querySelectorAll<HTMLElement>(".symbol-label-text, .local-symbol-more, .symbol-anchor.dot")].filter(shown).map(part => part.getBoundingClientRect());
    const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper")!;
    const layer = getComputedStyle(wrapper, "::before");
    const k = wrapper.getBoundingClientRect().height / wrapper.offsetHeight;
    const highlight = row.classList.contains("symbol-pinned") && layer.content !== "none"
      ? { top: wrapper.getBoundingClientRect().top + parseFloat(layer.top) * k, bottom: wrapper.getBoundingClientRect().top + (parseFloat(layer.top) + parseFloat(layer.height)) * k } : null;
    return { symbol: row.dataset.symbol!, top: Math.min(...parts.map(part => part.top)), bottom: Math.max(...parts.map(part => part.bottom)), highlight };
  }).sort((a, b) => a.top - b.top);
}, id);

/**
 * Since 2026-11-13 a symbol whose description is not shown has a short row, so a card's rows have two heights; in the
 * far looks the drawn rows' heads are spaced evenly over the rows' room, a name on two lines taking two lines, so that
 * the gap after every name is the same, with nothing visible to explain an uneven one; a pinned row's highlight keeps
 * clear air from the next one's. Read on the estate's subject pinned whole (its class described, Post and Get not) and on
 * this repository's documentationLinks.ts with two descriptions folded, under this machine's lines and Segoe UI's.
 */
test("in the connections look a card's names stand at even gaps whatever their rows' heights, and pinned highlights keep clear of each other", async ({ browser }) => {
  test.setTimeout(240_000);
  const links = "scripts/doc-tools/documentationLinks.ts";
  const folded = `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: links,
    reading: [{ nodeId: links, symbol: "DEFAULT_RULES", open: false }, { nodeId: links, symbol: "DocumentationLinkViolation", open: false }] })}`;
  for (const lines of ["fallback", "segoe"] as const) {
    for (const [path, subject] of [[estate(), payment], [folded, links]]) {
      const { context, page } = await openUnder(browser, path, subject, lines, 3);
      expect(await page.locator("#map-container").getAttribute("data-look")).toBe("connections");
      const heads = await headsOf(page, subject);
      const gaps = heads.slice(1).map((head, index) => head.top - heads[index].bottom);
      expect(heads.length, `${subject}, ${lines}`).toBeGreaterThan(2);
      expect.soft(Math.max(...gaps) - Math.min(...gaps), `${subject}, ${lines}: gaps ${gaps.map(gap => gap.toFixed(1)).join(", ")}`).toBeLessThan(2);
      const lit = heads.filter(head => head.highlight);
      for (const [index, head] of lit.slice(1).entries()) {
        expect.soft(head.highlight!.top - lit[index].highlight!.bottom, `${subject}, ${lines}: ${head.symbol}'s highlight clear of ${lit[index].symbol}'s`).toBeGreaterThan(1);
      }
      await context.close();
    }
  }
});

/**
 * A closed directory's box inside an opened directory follows a file's card in the far looks (2026-11-13): its name held
 * after its chevron at the look's size, or smaller where that keeps it whole and never below the connections look's
 * (2026-11-15), and its count of what it holds and its More not drawn: the box is the control at these looks, and More
 * returns at reading size (2026-11-16; until then More was kept where the box held it, beside the name or on a line of
 * its own). The handle that opens it is the name's button, which keeps the keyboard, and no text button is drawn. Read
 * on this repository's scripts/doc-tools opened, whose __fixtures__ is closed, under both lines.
 */
test("in the far looks a closed directory's name is held after its chevron, fitted whole, and its count and its More are not drawn", async ({ browser }) => {
  test.setTimeout(240_000);
  for (const lines of ["fallback", "segoe"] as const) {
    for (const [presses, look, scale] of [[3, "connections", 2.2], [8, "overview", 3.6]] as const) {
      const { context, page } = await openUnder(browser, "/?view=local&dir=scripts/doc-tools", "scripts/doc-tools/documentationLinks.ts", lines, presses);
      const box = page.locator(".local-directory-closed").first();
      const seen = await box.evaluate(element => {
        const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
        const held = element.querySelector<HTMLElement>(".local-directory-closed__held")!, more = element.querySelector<HTMLElement>(".local-directory-actions")!;
        const handle = element.querySelector<HTMLElement>(".local-directory-handle"), chevron = held.querySelector(".local-directory-chevron");
        const visible = (part: Element): boolean => getComputedStyle(part).visibility === "visible" && getComputedStyle(part).display !== "none";
        const boxRect = element.getBoundingClientRect(), heldRect = held.getBoundingClientRect();
        const inside = (rect: DOMRect): boolean => rect.left >= boxRect.left - 0.5 && rect.right <= boxRect.right + 0.5 && rect.top >= boxRect.top - 0.5 && rect.bottom <= boxRect.bottom + 0.5;
        const content = getComputedStyle(held, "::after").content;
        return {
          look: document.querySelector<HTMLElement>("#map-container")!.dataset.look,
          held: visible(held) ? heldRect.width / held.offsetWidth / k : 0,
          heldInside: inside(heldRect),
          lines: content.startsWith("\"") ? content.slice(1, -1) : "",
          count: visible(element.querySelector(".local-directory-closed__count")!),
          chevron: chevron ? chevron.getBoundingClientRect().height / k : 0,
          handle: handle ? { label: handle.getAttribute("aria-label"), expanded: handle.getAttribute("aria-expanded"), focusable: handle.tabIndex >= 0 && visible(handle) } : null,
          words: [...element.querySelectorAll("button")].map(button => button.textContent?.trim() ?? ""),
          more: visible(more)
        };
      });
      const where = `${lines}, ${look}`;
      expect(seen.look, where).toBe(look);
      expect.soft(seen.held, `${where}: the name held no smaller than the connections look's size`).toBeGreaterThanOrEqual(2.2 - 0.01);
      expect.soft(seen.held, `${where}: the name held no larger than the look's size`).toBeLessThanOrEqual(scale + 0.01);
      expect.soft(seen.heldInside, `${where}: the held name inside its box`).toBe(true);
      expect.soft(seen.lines, `${where}: the name whole`).not.toContain("…");
      expect.soft(seen.count, `${where}: the count not drawn`).toBe(false);
      expect.soft(seen.chevron, `${where}: the chevron held with the name`).toBeGreaterThan(12 * 2.2 - 0.5);
      expect.soft(seen.handle, `${where}: the handle says the act and takes the keyboard`).toEqual({ label: "Open scripts/doc-tools/__fixtures__", expanded: "false", focusable: true });
      expect.soft(seen.words, `${where}: no text button`).not.toContain("Open");
      expect.soft(seen.more, `${where}: More not drawn, the box being the control`).toBe(false);
      await context.close();
    }
  }
});

test("in the connections look a card's counts stand at the look's held size or not at all, and +N connections still reveals", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, zoomLooks: "three", overviewFiles: "keep" } } })
  });
  const links = "scripts/doc-tools/documentationLinks.ts";
  await page.goto("/?view=local&dir=scripts/doc-tools");
  const card = page.locator(`.node-card[data-id="${links}"]`);
  await card.waitFor();
  await still(page);
  const counts = () => page.evaluate(() => {
    const map = document.querySelector<HTMLElement>("#map-container")!;
    const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    const drawn: Record<string, number> = {};
    for (const count of map.querySelectorAll<HTMLElement>(".local-slot-card .local-disclosure")) {
      if (getComputedStyle(count).visibility !== "visible" || !count.offsetHeight) continue;
      // Its size on screen over its layout height unrounded: with the card's stated lines a count is a fractional
      // number of pixels tall, which `offsetHeight` rounds.
      drawn[`${count.closest<HTMLElement>(".node-card")!.dataset.id}: ${count.textContent}`] = count.getBoundingClientRect().height / (parseFloat(getComputedStyle(count).height) * k);
    }
    return { look: map.dataset.look ?? null, drawn };
  });
  for (let press = 1; press <= 6; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    const { look, drawn } = await counts();
    if (look !== "connections") continue;
    for (const [count, scale] of Object.entries(drawn)) expect.soft(scale, `press ${press}: ${count} drawn at ${scale.toFixed(2)} of its size`).toBeCloseTo(2.2, 2);
    // The card that draws no row says what it does not draw, at the look's size.
    const own = Object.keys(drawn).filter(count => count.startsWith(`${links}: `));
    expect(own.some(count => /\+\d+\s+symbols$/u.test(count)), `press ${press}: ${own.join(", ")}`).toBe(true);
    expect(own.some(count => /\+\d+\s+connections$/u.test(count)), `press ${press}: ${own.join(", ")}`).toBe(true);
  }
  // Back to the look's first press, "+N connections" pins the file where it stands, as at reading scale.
  for (let press = 6; press > 3; press -= 1) {
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await still(page);
  }
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  await card.getByRole("button", { name: /^\+\d+\s+connections outside this view/u }).click();
  await still(page);
  await expect(page.locator(`.node-card[data-id="${links}"]`)).toHaveClass(/file-pinned/u);
});

test("stepped, chosen by a link, still reports the card ladder's bands and steps at every press", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(estate("stepped"));
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  const states = [await page.locator("#map-container").evaluate(map => `${(map as HTMLElement).dataset.lod} ${(map as HTMLElement).dataset.step} ${(map as HTMLElement).dataset.look ?? "-"}`)];
  for (let press = 1; press <= 10; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
    states.push(await page.locator("#map-container").evaluate(map => `${(map as HTMLElement).dataset.lod} ${(map as HTMLElement).dataset.step} ${(map as HTMLElement).dataset.look ?? "-"}`));
  }
  expect(states).toEqual([
    "reading 0 -", "reading 1 -", "middle 2 -", "middle 3 -", "middle 4 -", "far 5 -", "far 6 -",
    "overview 7 -", "overview 8 -", "overview 9 -", "overview 10 -"
  ]);
  await expect(page.locator("#map-container")).not.toHaveAttribute("data-looks", /./u);
});

test("the three looks are the default, the ladder is chosen in Tuning, kept for the next visit and carried by the page's link", async ({ page }) => {
  // Without a switch the page shows the three looks (2026-11-13: the owner judges what the build shows unswitched).
  await page.goto(estate());
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-looks", "three");
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  const control = page.locator("#tuning-zoom-looks");
  await expect(control).toHaveValue("three");
  await control.selectOption("stepped");
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  await expect(page.locator("#map-container")).not.toHaveAttribute("data-looks", /./u);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "{}"), PERSISTED_UI_KEY);
  expect(saved.tuning.localMap.zoomLooks).toBe("stepped");
  // The page's own link shows the ladder to a visitor with no saved choice.
  const link = page.url();
  const fresh = await page.context().browser()!.newContext({ viewport: { width: 1440, height: 960 } });
  const visitor = await fresh.newPage();
  await visitor.goto(link);
  await visitor.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(visitor);
  await expect(visitor.locator("#map-container")).toHaveAttribute("data-lod", "reading");
  await expect(visitor.locator("#map-container")).not.toHaveAttribute("data-looks", /./u);
  await fresh.close();
  // A link that carries the 2D map's settings but no Zoom Looks, as every link made before the trial does, opens in the
  // three looks, even in this browser, whose own tuning now holds the ladder.
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: payment, layout: { localMap: { columnGap: 72 } } })}`);
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-looks", "three");
});

/** The animations and transitions running in the Local Map, read the moment after a press, with the style flushed. */
const running = (page: Page) => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running"
  && animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && animation.effect.target.closest("#map-container"))
  .map(animation => `${(animation as CSSAnimation).animationName ?? (animation as CSSTransition).transitionProperty} on ${(animation.effect as KeyframeEffect).target!.className}`));

test("a change of look moves the held parts where motion is welcome, and nothing at all where the person prefers reduced motion", async ({ browser }) => {
  test.setTimeout(90_000);
  const counts: Record<string, string[][]> = {};
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1, reducedMotion });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, overviewFiles: "keep" } } })
    });
    const page = await context.newPage();
    await page.goto(estate("three"));
    await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
    await still(page);
    counts[reducedMotion] = [];
    // Out across both edges and back across both: each press that changes the look is read at once.
    for (const [button, presses] of [["Zoom Out", 7], ["Zoom In", 7]] as const) {
      for (let press = 1; press <= presses; press += 1) {
        const before = await page.locator("#map-container").getAttribute("data-look");
        await page.getByRole("button", { name: button, exact: true }).click();
        const after = await page.locator("#map-container").getAttribute("data-look");
        if (after !== before) counts[reducedMotion].push(await running(page));
        await still(page);
      }
    }
    await context.close();
  }
  // Two changes each way; the check sees motion where it is welcome, so it can see it where it is not.
  expect(counts["no-preference"].length).toBe(4);
  for (const moving of counts["no-preference"]) expect(moving.length).toBeGreaterThan(0);
  expect(counts.reduce).toEqual([[], [], [], []]);
});

/**
 * What a change of look draws at one moment, read from the page: each held thing's size on screen (a name's text, a
 * row's More, a dot, the node's More, and the file's name as the largest of its drawings, the layout's text and the held
 * lines with their leaving copy), the boxes of the file name's drawings, and the name boxes of the rows still drawn.
 */
const moment = (page: Page) => page.evaluate(() => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  const drawn = (element: Element): boolean => {
    for (let at: Element | null = element; at && at !== map; at = at.parentElement) {
      const style = getComputedStyle(at);
      if (style.display === "none" || Number(style.opacity) === 0) return false;
    }
    const rect = element.getBoundingClientRect();
    return getComputedStyle(element).visibility === "visible" && rect.width > 0.05 && rect.height > 0.05;
  };
  const sizes: Record<string, number> = {};
  const names: { id: string; box: { left: number; top: number; right: number; bottom: number } }[] = [];
  const rows: { id: string; symbol: string; box: DOMRect }[] = [];
  const cards: Record<string, DOMRect> = {};
  for (const card of map.querySelectorAll<HTMLElement>(".local-slot-card")) {
    const id = card.dataset.id!;
    cards[id] = card.getBoundingClientRect();
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
      for (const part of row.querySelectorAll<HTMLElement>(".symbol-label-text, .local-symbol-more, .symbol-anchor.dot")) {
        if (drawn(part)) sizes[`${id}:${row.dataset.symbol} ${part.className.split(" ").slice(0, 3).join(".")}`] = part.getBoundingClientRect().height;
      }
      const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper");
      if (wrapper && drawn(wrapper)) rows.push({ id, symbol: row.dataset.symbol ?? "", box: wrapper.getBoundingClientRect() });
    }
    const more = card.querySelector<HTMLElement>(".local-file-more");
    if (more && drawn(more)) sizes[`${id} node More`] = more.getBoundingClientRect().height;
    // The file's name: each of its drawings that shows, its font on screen and its box.
    let font = 0;
    const plain = card.querySelector<HTMLElement>(".local-file-name-text"), held = card.querySelector<HTMLElement>(".local-file-name-held");
    if (plain && drawn(plain)) {
      font = Math.max(font, parseFloat(getComputedStyle(plain).fontSize) * k);
      names.push({ id, box: plain.getBoundingClientRect() });
    }
    if (held && drawn(held)) {
      const rect = held.getBoundingClientRect(), m = rect.width / held.offsetWidth, size = parseFloat(getComputedStyle(held).fontSize);
      for (const pseudo of ["::after", "::before"]) {
        const style = getComputedStyle(held, pseudo);
        if (style.content === "none" || style.content === "normal" || Number(style.opacity) === 0) continue;
        const scale = pseudo === "::before" ? new DOMMatrix(style.transform === "none" ? undefined : style.transform).a : 1;
        font = Math.max(font, size * m * scale);
        const width = pseudo === "::before" ? parseFloat(style.width) * scale * m : rect.width;
        const height = pseudo === "::before" ? parseFloat(style.height) * scale * m : rect.height;
        names.push({ id, box: { left: rect.left, top: rect.top, right: rect.left + width, bottom: rect.top + height } });
      }
    }
    if (font) sizes[`${id} file name`] = font;
  }
  return { look: map.dataset.look ?? null, sizes, names, rows, cards };
});

test("at each change of look, nothing held is drawn larger on screen than before or after it, and no name line leaves its card or lies over a row still drawn", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(estate("three"));
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await still(page);
  await page.mouse.move(120, 400);
  const changes: string[] = [];
  for (const [button, presses] of [["Zoom Out", 7], ["Zoom In", 7]] as const) {
    for (let press = 1; press <= presses; press += 1) {
      const before = await moment(page);
      await page.getByRole("button", { name: button, exact: true }).click();
      const look = await page.locator("#map-container").getAttribute("data-look");
      if (look === before.look) { await still(page); continue; }
      const change = `${before.look} → ${look}`;
      changes.push(change);
      // Every animation of the change held still and read at its start, its middle and its end.
      const samples: Awaited<ReturnType<typeof moment>>[] = [];
      for (const time of [0, 80, 159]) {
        await page.evaluate(at => {
          for (const animation of document.getAnimations()) {
            const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
            if (!(target instanceof Element) || !target.closest("#map-container")) continue;
            animation.pause();
            animation.currentTime = at;
          }
        }, time);
        samples.push(await moment(page));
      }
      await page.evaluate(() => { for (const animation of document.getAnimations()) animation.play(); });
      await still(page);
      const after = await moment(page);
      for (const [index, sample] of samples.entries()) {
        const where = `${change}, sample ${index}`;
        for (const [part, size] of Object.entries(sample.sizes)) {
          const bound = Math.max(before.sizes[part] ?? 0, after.sizes[part] ?? 0);
          if (bound) expect.soft(size, `${where}: ${part} ${size.toFixed(1)} px against ${(before.sizes[part] ?? 0).toFixed(1)} before and ${(after.sizes[part] ?? 0).toFixed(1)} after`).toBeLessThanOrEqual(bound + 0.5);
        }
        for (const name of sample.names) {
          const card = sample.cards[name.id];
          const by = Math.max(card.left - name.box.left, name.box.right - card.right, card.top - name.box.top, name.box.bottom - card.bottom);
          expect.soft(by, `${where}: ${name.id}'s name ${by.toFixed(1)} px outside its card`).toBeLessThanOrEqual(0.5);
          for (const row of sample.rows.filter(each => each.id === name.id)) {
            const across = Math.min(name.box.right, row.box.right) - Math.max(name.box.left, row.box.left);
            const down = Math.min(name.box.bottom, row.box.bottom) - Math.max(name.box.top, row.box.top);
            expect.soft(across > 0.5 && down > 0.5, `${where}: ${name.id}'s name lies over the row ${row.symbol}`).toBe(false);
          }
        }
      }
    }
  }
  expect(changes).toEqual(["reading → connections", "connections → overview", "overview → connections", "connections → reading"]);
});
