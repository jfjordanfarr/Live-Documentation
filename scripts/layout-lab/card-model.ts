/**
 * The card model: a card's height and the place of each of its pins at any
 * width, composed by arithmetic from a capture of the page. The texts are
 * laid out again by Pretext from the segments and widths the page measured;
 * the blocks between them are the stylesheet's constants, read from the page
 * with the capture. The model is held to the page by the drift check of the
 * capture and by the lab's baseline, which must give the page's own numbers.
 *
 * @module layout-lab/card-model
 */
import { layout, walkLineRanges } from "@chenglou/pretext";

import type { Capture, CardCapture, ChipCapture, PreparedText, RowCapture } from "./capture";
import { readingHeight } from "./reading-model";
import { buildNormalizedAnchorKey } from "../../packages/explorer/src/client/views/symbolAnchors";

/** What a card shows under a configuration: its rows in order, and the lines under it. */
export interface CardView {
  rows: RowCapture[];
  /** Original card construction order: moving rows does not re-register their endpoint names. */
  registration: RowCapture[];
  /** Each note's height at a content width. */
  notes: Array<(width: number) => number>;
}

/**
 * The card's height, and every anchor's distance from its top, before rounding; `rowKeys` names the anchors that
 * are a row's dots, and `hiddenKeys` the anchors of collapsed rows, which the page has but cannot measure.
 */
export interface CardMetrics {
  /** Actual card width after its cap; a column's slot can be wider. Absent for standalone pin-registration tests. */
  width?: number;
  height: number;
  pins: Map<string, number>;
  rowKeys: Set<string>;
  hiddenKeys: Set<string>;
}

/**
 * How far a text may overflow its box and still stay on one line, in CSS pixels: one of Chromium's layout units.
 * The estate's "Portal/Controllers/PaymentsController.cs" is 201.015625 px wide in a 201 px box and stands on one
 * line; the repository's "…/branch-renderer.ts" is 319.078 px wide in a 319 px box and wraps. Pretext's arithmetic
 * breaks at the box's edge, so the lab lends it the unit.
 */
export const TEXT_TOLERANCE = 1 / 64;

/** The height of a prepared text set in a width, by Pretext's arithmetic, with the browser's tolerance. */
export function textHeight(capture: Capture, text: PreparedText, width: number): number {
  const font = capture.fonts[text.font];
  return layout(text.prepared, Math.max(0, width) + TEXT_TOLERANCE, font.lineHeight).height;
}

/**
 * The room a card's header keeps for the node's controls after the file's name (the header round of 2026-11-08), as the
 * page measures it at capture: how many controls the header holds, a control's size, and how large they are held at the
 * reading band's last step. Absent in a capture of a page from before it.
 */
export interface TitleRoom {
  count: number;
  /** A control's side, in CSS pixels: the stylesheet's --action-size. */
  size: number;
  /** The stylesheet's --actions-hold: 1, or STEP_RATIO on a slot card. */
  hold: number;
}

/**
 * The room's box, by local.css's rule for `.local-file-name-room`: as wide as the controls side by side with their 2 px
 * gaps, held, and 4 px of air; as tall as one control held. The stylesheet counts the controls by the header's own
 * children, one to five.
 */
export function titleRoomBox(room: TitleRoom): { width: number; height: number } {
  const count = Math.min(5, Math.max(1, room.count));
  return { width: (count * (room.size + 2) - 2) * room.hold + 4, height: room.size * room.hold };
}

/**
 * A title's height from its text's lines, by the header's layout: the room is the name's button's last inline box,
 * bottom-aligned, so it shares the name's last line where the line leaves it its width, making that line as tall as the
 * taller of the two, and otherwise wraps to a line of its own after the name. Without a room, the lines alone.
 */
export function titleHeight(lineWidths: readonly number[], lineHeight: number, width: number, room: TitleRoom | null | undefined): number {
  const lines = Math.max(1, lineWidths.length);
  if (!room) return lines * lineHeight;
  const box = titleRoomBox(room);
  const tallest = Math.max(lineHeight, box.height);
  const shared = (lineWidths.at(-1) ?? 0) + box.width <= width;
  return (shared ? lines - 1 : lines) * lineHeight + tallest;
}

/** A card's title's height at a width: its text laid out by Pretext, with the room for the controls after it. */
export function titleTextHeight(capture: Capture, text: PreparedText, width: number, room: TitleRoom | null | undefined): number {
  const font = capture.fonts[text.font];
  const widths: number[] = [];
  const max = Math.max(0, width) + TEXT_TOLERANCE;
  walkLineRanges(text.prepared, max, line => { widths.push(line.width); });
  return titleHeight(widths, font.lineHeight, max, room);
}

/** The height of a text the page never showed, set in a font from its glyphs' widths: as many lines as its words need. */
export function synthesizedHeight(capture: Capture, fontKey: string, text: string): (width: number) => number {
  const font = capture.fonts[fontKey];
  const words = text.split(" ").map(word => [...word].reduce((sum, glyph) => sum + (font.glyphs[glyph] ?? font.glyphs.a ?? 0), 0));
  const space = font.glyphs[" "] ?? 0;
  return width => {
    let lines = 1, x = 0;
    for (const word of words) {
      if (x > 0 && x + space + word > width) { lines++; x = word; }
      else x += (x > 0 ? space : 0) + word;
    }
    return lines * font.lineHeight;
  };
}

/** How many lines a row of chips wraps to, and the height they take: each line as tall as its tallest chip, the lines a gap apart. */
export function chipsHeight(items: readonly ChipCapture[], width: number, gap: number): number {
  const lines: number[] = [];
  let x = 0, tallest = 0;
  for (const item of items) {
    if (x > 0 && x + gap + item.width > width) { lines.push(tallest); x = item.width; tallest = item.height; }
    else { x += (x > 0 ? gap : 0) + item.width; tallest = Math.max(tallest, item.height); }
  }
  lines.push(tallest);
  return lines.reduce((sum, h) => sum + h, 0) + gap * (lines.length - 1);
}

/**
 * The card at a width: border, padding, the title with its right padding and
 * margin, the path, the symbols block (its margin swallowing the meta line's),
 * each row as tall as its dot, its label's lines, its badges or its controls
 * (the label narrowed by the badges and controls beside it), the rows a gap
 * apart, the test chips wrapped, the directory line, and the notes. A pin is
 * at the middle of its row, the Internals row's a margin lower; the hub at
 * the middle of the card.
 */
export function cardMetrics(capture: Capture, card: CardCapture, width: number, view: CardView): CardMetrics {
  const c = card.constants ?? capture.constants;
  width = Math.min(width, card.maxWidth ?? Infinity);
  const edge = card.borderWidth + card.padding;
  const content = width - 2 * (card.borderWidth + (card.paddingInline ?? card.padding));
  const text = (t: PreparedText, w: number): number => textHeight(capture, t, w);
  let y = edge;
  y += titleTextHeight(capture, card.title, content - c.titlePaddingRight, card.titleRoom) + c.titleMarginBottom + (c.titlePaddingTop ?? 0);
  y += text(card.path, content);
  if (card.footer?.position === "after-path") y += card.footer.top + chipsHeight(card.footer.items, content, card.footer.gap) + (card.footer.bottom ?? 0);
  // A slot card's Purpose has a fixed allotment, whatever its text (2026-11-06).
  if (card.purpose) y += card.slot ? card.slot.purposeHeight : readingHeight(card.purpose, content);
  y += c.symbolsMarginTop;
  if (card.meta) y += text(card.meta, content);
  const cell = content - 2 * c.gridSideColumn - 2 * c.gridColumnGap;
  const centres = new Map<RowCapture, number>();
  view.rows.forEach((row, i) => {
    const frame = row.frame ?? { width: 0, height: 0 };
    const labelWidth = cell - frame.width - (row.badgesWidth > 0 ? row.badgesWidth + c.badgeGap : 0) - (row.controls?.width ?? 0);
    // The Internals row's dot and placeholder carry a top margin, so the row is taller by it and the dot sits below the row's middle.
    const internals = row.symbol === "__internals__";
    const dotMargin = internals ? c.internalsDotMarginTop : 0;
    const wrapper = frame.height + Math.max(text(row.label, labelWidth), row.badgesWidth > 0 ? c.badgeHeight : 0, row.controls?.height ?? 0);
    const natural = Math.max(c.dotHeight + dotMargin, internals ? c.placeholderHeight : 0, wrapper);
    // A slot card's public row keeps its fixed allotment, its name and dot in the first track at the top, its slot in
    // the rest (2026-11-06); the Internals row and every row of the other compositions take their content.
    const height = card.slot && !internals ? card.slot.rowHeight : natural;
    if (i > 0) y += c.gridRowGap;
    const centre = y + Math.floor((natural - c.dotHeight - dotMargin) / 2 * 64 + 1e-3) / 64 + dotMargin + c.dotHeight / 2;
    centres.set(row, centre);
    y += height;
    if (row.reading && !card.slot) y += c.gridRowGap + readingHeight(row.reading, cell);
  });
  if (card.tests) {
    y += c.testsMarginTop + chipsHeight([card.tests.label, ...card.tests.chips], content, c.testsGap);
    y += Math.max(c.testsMarginBottom, card.directoryHidden ? 0 : c.directoryMarginTop);
  } else if (!card.directoryHidden) {
    y += c.directoryMarginTop;
  }
  if (!card.directoryHidden) y += text(card.directory, content);
  if (card.footer && card.footer.position !== "after-path") y += card.footer.top + chipsHeight(card.footer.items, content, card.footer.gap) + (card.footer.bottom ?? 0)
    - (card.directoryHidden && card.tests ? Math.min(c.testsMarginBottom, card.footer.marginTop) : 0);
  for (const note of view.notes) y += c.disclosureMarginTop + note(content);
  y += card.borderWidth + (card.paddingBottom ?? card.padding);
  if (Math.round(y - 2 * card.borderWidth) > (card.readingFrameHeight ?? Infinity)) {
    const extra = card.purpose ? readingHeight(card.purpose, content, true) - readingHeight(card.purpose, content)
      : card.overflow ? card.overflow.margin.top + readingHeight(card.overflow, content) + card.overflow.margin.bottom : 0;
    y += extra;
    for (const [row, centre] of centres) centres.set(row, centre + extra);
  }
  const metrics = registerPins(view.registration, centres, y);
  metrics.width = width;
  if (card.hubY !== undefined) {
    metrics.pins.set("outbound:*", card.hubY);
    if (!view.registration.some(row => row.symbol === "__internals__")) metrics.pins.set("inbound:*", card.hubY);
  }
  return metrics;
}

/** Registers row endpoints in construction order, retaining exact and normalized names separately as the browser does. */
export function registerPins<Row extends { symbol: string }>(rows: readonly Row[], centres: ReadonlyMap<Row, number>, height: number): CardMetrics {
  const pins = new Map<string, number>([["inbound:*", height / 2], ["outbound:*", height / 2]]);
  const rowKeys = new Set<string>();
  const hiddenKeys = new Set<string>();
  const register = (key: string, centre: number | undefined): void => {
    pins.delete(key);
    hiddenKeys.delete(key);
    rowKeys.add(key);
    if (centre === undefined) hiddenKeys.add(key);
    else pins.set(key, centre);
  };
  for (const row of rows) {
    const centre = centres.get(row);
    for (const direction of ["inbound", "outbound"] as const) {
      if (direction === "outbound" && row.symbol === "__internals__") continue;
      register(`${direction}:${row.symbol}`, centre);
      const normalized = buildNormalizedAnchorKey(direction, row.symbol);
      if (normalized) register(normalized, centre);
    }
    if (row.symbol === "__internals__") register("inbound:*", centre);
  }
  return { height, pins, rowKeys, hiddenKeys };
}

/**
 * The anchor a wire finds for a symbol, as the page's registry resolves it:
 * the symbol's own row, by its name or its normalized name; else the card's
 * default for that direction (the hub, or the Internals row's dot); else the
 * card's middle. A row the page collapses resolves to no offset at all.
 */
export function resolvePin(metrics: CardMetrics, direction: "inbound" | "outbound", symbol: string | undefined): { offset: number | null; key: string | null } {
  const found = (key: string): { offset: number | null; key: string } | null => {
    if (metrics.pins.has(key)) return { offset: metrics.pins.get(key)!, key };
    // The page has the anchor but cannot measure a collapsed row: the wire is neither placed nor drawn.
    if (metrics.hiddenKeys.has(key)) return { offset: null, key };
    return null;
  };
  if (symbol) {
    const exact = found(`${direction}:${symbol}`);
    if (exact) return exact;
    const normalized = buildNormalizedAnchorKey(direction, symbol);
    const byName = normalized ? found(normalized) : null;
    if (byName) return byName;
  }
  return found(`${direction}:*`) ?? { offset: metrics.height / 2, key: null };
}

/** A pin's offset, or null where the page would place no wire. */
export const pinOffset = (metrics: CardMetrics, direction: "inbound" | "outbound", symbol: string | undefined): number | null => resolvePin(metrics, direction, symbol).offset;

/** The height of a drawn directory's label at a width: its lines and the padding under them. */
export function labelHeight(capture: Capture, directory: string, width: number): number {
  const text = capture.labels[directory];
  if (!text) return 0;
  const controls = capture.labelControls?.[directory];
  return Math.max(
    textHeight(capture, text, width - (controls?.width ?? 0)),
    controls?.height ?? 0
  ) + capture.constants.labelPaddingBottom;
}
