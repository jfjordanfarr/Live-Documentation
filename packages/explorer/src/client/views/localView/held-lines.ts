/**
 * The card's header from the middle band out, ordered: the file's name leads and the node's held controls follow it at
 * the header's right edge. The name is held at its reading size; its lines and the controls' place are chosen here, for
 * each band and step at render, and drawn by the stylesheet as they are. Six principles, the root's, accepted by the
 * owner (the November 7 record, Turns 3 and 4, after the one-line names of the same day cut too many names alike):
 *
 * 1. The name leads: it starts on the header's first line at every zoom, and nothing stands above it.
 * 2. Whole before cut, few lines before many: one line when the name fits, otherwise the fewest lines that hold it whole,
 *    each filled before the next starts, broken at a seam of the name (`word-seams.ts`), never inside a segment that
 *    fits a line; cut with an ellipsis only when the header's lines run out.
 * 3. The controls follow the name at the right edge: on the name's last line when its text leaves them their width and
 *    a gap, otherwise on the line after it; never above the name, and the name never wraps around them.
 * 4. A control shares a line only where it fits the line: at the far and overview bands More is held no taller than a
 *    line of the name; at the middle band the available controls are taller, so the line they stand on, shared or their own,
 *    is as tall as they are.
 * 5. No empty line, nothing shrinks: the name is never drawn smaller than its held size; when the lines run out the room's
 *    last line is cut with an ellipsis beside the controls, which keep their place, and where the controls leave no room
 *    beside them for even the ellipsis, they take the line after and the name keeps its line, so that it is never erased.
 * 6. It changes only at a zoom step, the same going out and coming back (the card reading writes every band and step).
 *
 * Pure: the widths come from the caller's measure, in the name's own units.
 *
 * @module held-lines
 */

import { seamsOf } from "./word-seams";

/** The room a held header has, in the name's own units (the map's divided by the name's held scale). */
export interface HeldRoom {
  /** A full line's width: from the name's left to the header's right edge. */
  width: number;
  /** The room's height, from the name's top to the first row (at the overview band, the first drawn row). */
  height: number;
  /** A line of the name's height. */
  line: number;
  /** The held controls' width and height. */
  controlsWidth: number;
  controlsHeight: number;
  /** The air between the name's text and the controls on a line they share. */
  gap: number;
}

/** Where the held controls stand: the line of the header they are on, whether the name shares it, and their top. */
export interface HeldControls {
  /** The header's line the controls stand on, from 0: the name's last line, or the line after it. */
  line: number;
  /** Whether that line holds the end of the name too. */
  shared: boolean;
  /** Their top, from the name's top, in the name's own units. */
  top: number;
}

/** A held header: the name's lines, every one drawn, and the controls' place. */
export interface HeldHeader {
  lines: string[];
  controls: HeldControls;
}

const ELLIPSIS = "…";

/**
 * A held name's segments: its seams (`word-seams.ts`), and also before a short extension's dot, which the seams keep with
 * the word before it so that an extension never stands alone in a wrapping box. In a held header the controls share the
 * name's last line, so ".ts" beside More fills the line above it: "branch-renderer" / ".ts", where the seams alone
 * break "branch-" / "renderer.ts" and leave the first line half empty (the header round, 2026-11-08: the price of a
 * filled first line, as the root told the owner).
 */
export function heldSegments(name: string): string[] {
  const segments = seamsOf(name);
  const last = segments.at(-1) ?? "";
  const dot = last.lastIndexOf(".");
  if (dot > 0 && last.length - dot <= 3) segments.splice(-1, 1, last.slice(0, dot), last.slice(dot));
  return segments;
}

/** A band that draws the held name. */
export type HeldBand = "middle" | "far" | "overview";
/** The bands that draw the held name, from the closest out: the card reading chooses its header for each. */
export const HELD_BANDS: readonly HeldBand[] = ["middle", "far", "overview"];

/** The air between the name's text and the controls on a shared line, in the map's own units. */
export const CONTROLS_GAP = 4;

/**
 * A card's title rooms, in the map's own units, as the card reading measures them at render and writes them for the
 * stylesheet (each as written, rounded alike): the room across from the name's left to the header's right edge, down to
 * the first row and to the card's bottom; the node's controls' widths and More's height as laid out; and the controls'
 * ceiling.
 */
export interface TitleRooms {
  roomW: number;
  headH: number;
  cardH: number;
  actionsW: number;
  moreW: number;
  moreH: number;
  /** The node's controls' held scale's ceiling, the stylesheet's (32 + slot lines × 17) / 20. */
  controlCeiling: number;
  /** The name's line height at reading size. */
  line: number;
}

/**
 * The held header's scale, its controls' scale and its room at a band and a step's held scales, by the stylesheet's own
 * formulas (reading.css, the file's name in the card ladder), which draw it. The name holds its step's size, never smaller
 * than the map's own nor larger than one line of its room's height; it takes the header's room down to the first row, or
 * at the overview band down to the card's first drawn row (`pinDepth` below the header's room, `ladder-rooms.ts`'s
 * pinDepth, null for none) or its bottom. The controls hold their step's size below their ceiling: all available controls
 * at the middle band, More alone beyond, where it is held no taller than a line of the name (principle 4).
 */
export function heldTitle(rooms: TitleRooms, band: HeldBand, scales: { text: number; control: number }, pinDepth: number | null): { scale: number; control: number; room: HeldRoom } {
  const roomH = band === "overview"
    ? Math.min(rooms.cardH, Math.max(rooms.headH, rooms.headH + (pinDepth ?? Infinity)))
    : rooms.headH;
  const scale = Math.max(1, Math.min(scales.text, roomH / rooms.line));
  const held = Math.min(Math.max(1, scales.control), Math.max(1, rooms.controlCeiling));
  const control = band === "middle" ? held : Math.min(held, rooms.line * scale / Math.max(1, rooms.moreH));
  return {
    scale,
    control,
    room: {
      width: rooms.roomW / scale,
      height: roomH / scale,
      line: rooms.line,
      controlsWidth: (band === "middle" ? rooms.actionsW : rooms.moreW) * control / scale,
      controlsHeight: rooms.moreH * control / scale,
      gap: CONTROLS_GAP / scale
    }
  };
}

/**
 * The header for a room, by the six principles: the name's seams' segments in order, a measure of a text's width, and
 * the room. The name flows at the full width; the controls share its last line when they fit beside it, else take the
 * line after; when that runs past the room's height, the name keeps as many lines as the room holds with the controls
 * sharing the last, which is cut with an ellipsis.
 */
export function chooseHeldHeader(segments: readonly string[], room: HeldRoom, measure: (text: string) => number): HeldHeader {
  const name = segments.join("");
  const { line, controlsHeight: tall } = room;
  const sharing = Math.max(line, tall);
  // Where the controls stand on line `index`, sharing it or alone on it: centred on a name's line they are shorter
  // than, at the top of a line they make taller.
  const place = (index: number, shared: boolean): HeldControls => ({ line: index, shared, top: index * line + (shared ? Math.max(0, (line - tall) / 2) : 0) });
  const flowed = name ? flow(segments, room.width, measure) : [""];
  const last = flowed.length - 1;
  const besideLast = measure(flowed[last]) + room.gap + room.controlsWidth <= room.width + 1e-6;
  const height = besideLast ? last * line + sharing : flowed.length * line + tall;
  if (height <= room.height + 1e-6) return { lines: flowed, controls: place(besideLast ? last : flowed.length, besideLast) };
  // The lines run out: as many of the name's lines as the room holds with the controls sharing the last, one at least,
  // that last cut where the controls begin.
  const kept = Math.max(1, Math.min(flowed.length, Math.floor((room.height - sharing) / line + 1e-6) + 1));
  const lines = flowed.slice(0, kept - 1);
  const rest = name.slice(lines.join("").length);
  const beside = cut(rest, room.width - room.gap - room.controlsWidth, measure);
  if (beside) return { lines: [...lines, beside], controls: place(kept - 1, true) };
  // The controls fill the line beside it: the name keeps the line, cut at the full width, and the controls take the line
  // after it, past the room, since the name leads and is never erased (the review of 2026-11-08).
  const own = measure(rest) <= room.width ? rest : cut(rest, room.width, measure) || rest.slice(0, 1);
  return { lines: [...lines, own], controls: place(kept, false) };
}

/**
 * A symbol's name's segments where its row lets it wrap (2026-11-13, the zoom looks): its seams, where the card puts a
 * line break opportunity (`setSeamedText`), and after each space, where the browser breaks anyway ("PaymentsContext
 * (class)"). Unlike {@link heldSegments} a short extension keeps its dot: a row has no control to stand beside it.
 */
export function rowSegments(name: string): string[] {
  return seamsOf(name).flatMap(segment => segment.split(/(?<=\s)/u).filter(Boolean));
}

/**
 * How many lines a wrapping symbol name takes at a width, at most `most`, as the browser draws it with the card's break
 * opportunities and `overflow-wrap: break-word` (the stylesheet's zoom looks): whole before cut, each line filled before
 * the next, a segment that does not fit what is left of a line starting the next, and only a segment wider than a whole
 * line broken inside, at each line's end. A space at a line's end hangs, as the browser lets it. The count sets the box
 * the name is drawn in, so that the box is as tall as the lines drawn.
 */
export function heldLineCount(segments: readonly string[], width: number, most: number, measure: (text: string) => number): number {
  if (!segments.length || !(width > 0)) return 1;
  const fits = (text: string): boolean => measure(text.trimEnd()) <= width + 1e-6;
  let lines = 1, current = "";
  for (const segment of segments) {
    if (fits(current + segment)) { current += segment; continue; }
    // The segment starts the next line, unless the line it does not fit is still empty.
    if (current) lines += 1;
    let rest = segment;
    while (!fits(rest) && rest.length > 1) {
      let take = 1;
      while (take < rest.length && fits(rest.slice(0, take + 1))) take += 1;
      rest = rest.slice(take);
      lines += 1;
    }
    current = rest;
  }
  return Math.max(1, Math.min(Math.floor(most), lines));
}

/**
 * A file's name's header ({@link chooseHeldHeader}) without its extension standing alone on its last line where the same
 * room carries it with the segment before it (2026-11-13): the split before a short extension's dot fills a first line
 * beside More ("branch-renderer" / ".ts"), but where the name takes three lines it left ".ts" alone on the third
 * ("enforce- / documentation-links / .ts") when "enforce- / documentation- / links.ts" takes no more. The name's seams
 * without that split are taken when they use no more lines, controls included, and cut nothing the split did not.
 */
export function chooseNameHeader(name: string, room: HeldRoom, measure: (text: string) => number): HeldHeader {
  const split = chooseHeldHeader(heldSegments(name), room, measure);
  const last = split.lines.at(-1) ?? "";
  if (split.lines.length < 2 || !/^\.[^.]{1,2}$/u.test(last)) return split;
  const segments = seamsOf(name);
  const glued = chooseHeldHeader(segments, room, measure);
  const used = (header: HeldHeader): number => Math.max(header.lines.length, header.controls.line + 1);
  const cut = (header: HeldHeader): boolean => header.lines.some(line => line.endsWith(ELLIPSIS));
  // Every line but the last ends at a seam: a segment wider than a line would otherwise be broken inside a word.
  const seams = new Set(segments.map((_, index) => segments.slice(0, index + 1).join("").length));
  let end = 0;
  const atSeams = glued.lines.slice(0, -1).every(line => seams.has(end += line.length));
  return atSeams && used(glued) <= used(split) && (!cut(glued) || cut(split)) ? glued : split;
}

/** As much of a text's start as fits a width with an ellipsis after, or nothing where not even the ellipsis fits. */
function cut(text: string, width: number, measure: (text: string) => number): string {
  let kept = text;
  while (kept && measure(kept + ELLIPSIS) > width) kept = kept.slice(0, -1);
  return measure(kept + ELLIPSIS) <= width ? kept + ELLIPSIS : "";
}

/**
 * The name laid out line by line at the full width, every line as long as it allows: a segment joins a line where it
 * fits; one that fits a full line but not this one starts the next, leaving this one as it is; one wider than a full
 * line is broken inside at the last character that fits, filling what is left of the line it starts on.
 */
function flow(segments: readonly string[], width: number, measure: (text: string) => number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const segment of segments) {
    if (measure(current + segment) <= width) { current += segment; continue; }
    if (measure(segment) <= width) { lines.push(current); current = segment; continue; }
    let rest = segment;
    while (rest) {
      let take = 0;
      while (take < rest.length && measure(current + rest.slice(0, take + 1)) <= width) take++;
      // Not one character fits even a full line: one a line, so that the name is still drawn.
      if (take === 0 && !current) take = 1;
      current += rest.slice(0, take);
      rest = rest.slice(take);
      if (rest) { lines.push(current); current = ""; }
    }
  }
  lines.push(current);
  return lines;
}
