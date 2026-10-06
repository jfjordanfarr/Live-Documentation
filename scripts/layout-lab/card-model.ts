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
import { layout } from "@chenglou/pretext";

import type { Capture, CardCapture, ChipCapture, PreparedText, RowCapture } from "./capture";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";

/** What a card shows under a configuration: its rows in order, and the lines under it. */
export interface CardView {
  rows: RowCapture[];
  /** The rows the page collapses, whose dots a wire cannot reach: the page places and draws no wire to them. */
  hidden: RowCapture[];
  /** Each note's height at a content width. */
  notes: Array<(width: number) => number>;
}

/**
 * The card's height, and every anchor's distance from its top, before rounding; `rowKeys` names the anchors that
 * are a row's dots, and `hiddenKeys` the anchors of collapsed rows, which the page has but cannot measure.
 */
export interface CardMetrics {
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
 * each row as tall as its dot, its label's lines or its badges, the rows a gap
 * apart, the test chips wrapped, the directory line, and the notes. A pin is
 * at the middle of its row, the Internals row's a margin lower; the hub at
 * the middle of the card.
 */
export function cardMetrics(capture: Capture, card: CardCapture, width: number, view: CardView): CardMetrics {
  const c = capture.constants;
  const edge = card.borderWidth + card.padding;
  const content = width - 2 * edge;
  const text = (t: PreparedText, w: number): number => textHeight(capture, t, w);
  let y = edge;
  y += text(card.title, content - c.titlePaddingRight) + c.titleMarginBottom;
  y += text(card.path, content);
  y += c.symbolsMarginTop;
  if (card.meta) y += text(card.meta, content);
  const cell = content - 2 * c.gridSideColumn - 2 * c.gridColumnGap;
  const pins = new Map<string, number>();
  const rowKeys = new Set<string>();
  const hiddenKeys = new Set<string>();
  for (const row of view.hidden) {
    for (const name of new Set([row.symbol, normalizeSymbolIdentifier(row.symbol) ?? row.symbol])) { hiddenKeys.add(`inbound:${name}`); hiddenKeys.add(`outbound:${name}`); }
    if (row.symbol === "__internals__") hiddenKeys.add("inbound:*");
  }
  view.rows.forEach((row, i) => {
    const labelWidth = cell - (row.badgesWidth > 0 ? row.badgesWidth + c.badgeGap : 0);
    // The Internals row's dot and placeholder carry a top margin, so the row is taller by it and the dot sits below the row's middle.
    const internals = row.symbol === "__internals__";
    const dotMargin = internals ? c.internalsDotMarginTop : 0;
    const height = Math.max(c.dotHeight + dotMargin, internals ? c.placeholderHeight : 0, text(row.label, labelWidth), row.badgesWidth > 0 ? c.badgeHeight : 0);
    if (i > 0) y += c.gridRowGap;
    const centre = y + (height - c.dotHeight - dotMargin) / 2 + dotMargin + c.dotHeight / 2;
    const names = new Set([row.symbol, normalizeSymbolIdentifier(row.symbol) ?? row.symbol]);
    for (const name of names) {
      pins.set(`inbound:${name}`, centre);
      rowKeys.add(`inbound:${name}`);
      if (row.symbol !== "__internals__") { pins.set(`outbound:${name}`, centre); rowKeys.add(`outbound:${name}`); }
    }
    if (row.symbol === "__internals__") { pins.set("inbound:*", centre); rowKeys.add("inbound:*"); }
    y += height;
  });
  if (card.tests) {
    y += c.testsMarginTop + chipsHeight([card.tests.label, ...card.tests.chips], content, c.testsGap);
    y += Math.max(c.testsMarginBottom, c.directoryMarginTop);
  } else {
    y += c.directoryMarginTop;
  }
  y += text(card.directory, content);
  for (const note of view.notes) y += c.disclosureMarginTop + note(content);
  y += edge;
  const height = y;
  pins.set("outbound:*", height / 2);
  if (!pins.has("inbound:*") && !hiddenKeys.has("inbound:*")) pins.set("inbound:*", height / 2);
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
    const normalized = normalizeSymbolIdentifier(symbol);
    const byName = normalized ? found(`${direction}:${normalized}`) : null;
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
  return textHeight(capture, text, width) + capture.constants.labelPaddingBottom;
}
