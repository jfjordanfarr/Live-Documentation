/**
 * The lines of a file's held name (2026-11-06, the root's third review of the far bands, after the owner's picture of a
 * whole-file pin): from the middle band out a card draws its file's name held at its reading size, wrapped into the room
 * its header leaves beside the node's held buttons. The browser's own wrapping broke a name inside a word beside the
 * button ("main.r / s", "verif / y.ts") instead of moving it below, since the emergency break is taken before the line box
 * moves past a float; so the lines are chosen here, for each band and step at render, by four rules:
 *
 * 1. a segment between seams is never broken if it fits a full line of the name's room;
 * 2. a name that fits whole on the lines below the button goes there rather than breaking beside it;
 * 3. a segment breaks inside only when it is wider than a full line;
 * 4. where the room runs out the last line ends with an ellipsis.
 *
 * Pure: the widths come from the caller's measure, in the name's own units.
 *
 * @module held-lines
 */

/** The room a held name has, in its own units (the map's divided by its scale). */
export interface HeldRoom {
  /** A full line's width. */
  width: number;
  /** A line's width beside the node's buttons. */
  besideWidth: number;
  /** How many lines stand beside the buttons, from the first. */
  besideLines: number;
  /** How many lines the room holds; one at least. */
  lines: number;
}

const ELLIPSIS = "…";

/** A band that draws the held name. */
export type HeldBand = "middle" | "far" | "overview";
/** The bands that draw the held name, from the closest out: the card reading chooses its lines for each. */
export const HELD_BANDS: readonly HeldBand[] = ["middle", "far", "overview"];

/**
 * A card's title rooms, in the map's own units, as the card reading measures them at render and writes them for the
 * stylesheet (each as written, rounded alike): the room across from the name's left to the header's right edge, down to
 * the first row and to the card's bottom; the row pitch and gap; the node's buttons' widths, More's height and how far
 * the buttons stand past the header's right edge and above the name's top; and the buttons' ceiling.
 */
export interface TitleRooms {
  roomW: number;
  headH: number;
  cardH: number;
  pitch: number;
  rowGap: number;
  actionsW: number;
  moreW: number;
  moreH: number;
  overX: number;
  overY: number;
  /** The node's buttons' held scale's ceiling, the stylesheet's (32 + slot lines × 17) / 20. */
  controlCeiling: number;
  /** The name's line height at reading size. */
  line: number;
}

/**
 * The held name's scale and room at a band and a step's held scales, by the stylesheet's own formulas (reading.css, the
 * file's name in the card ladder), which draw it: the name holds its step's size, never smaller than the map's own nor
 * larger than one line of its room's height; it takes the header's room down to the first row, or at the overview band
 * down to the card's first drawn row (after the rows before the first pinned by name, null for none) or its bottom;
 * beside it stand the node's held buttons, all three at the middle band and More alone beyond, with 4 px of air.
 */
export function heldTitle(rooms: TitleRooms, band: HeldBand, scales: { text: number; control: number }, rowsBeforePin: number | null): { scale: number; room: HeldRoom } {
  const roomH = band === "overview"
    ? Math.min(rooms.cardH, Math.max(rooms.headH, rooms.headH + (rowsBeforePin ?? 100000) * rooms.pitch - rooms.rowGap))
    : rooms.headH;
  const scale = Math.max(1, Math.min(scales.text, roomH / rooms.line));
  const control = Math.min(Math.max(1, scales.control), Math.max(1, rooms.controlCeiling));
  const buttonsW = Math.max(0, (band === "middle" ? rooms.actionsW : rooms.moreW) * control - rooms.overX + 4);
  const buttonsH = Math.max(0, rooms.moreH * control - rooms.overY + 4);
  const width = rooms.roomW / scale;
  return {
    scale,
    room: {
      width,
      besideWidth: Math.max(0, width - buttonsW / scale),
      besideLines: Math.ceil(buttonsH / scale / rooms.line - 1e-6),
      lines: Math.max(1, Math.floor(roomH / (rooms.line * scale) + 1e-6))
    }
  };
}

/**
 * The lines of a name for a room, by the four rules: the name's seams' segments in order, a measure of a text's width,
 * and the room. Empty lines stand beside the buttons where the name starts below them.
 */
export function chooseHeldLines(segments: readonly string[], room: HeldRoom, measure: (text: string) => number): string[] {
  const name = segments.join("");
  const lineCount = Math.max(1, Math.floor(room.lines));
  const widthOf = (line: number): number => (line < room.besideLines ? room.besideWidth : room.width);
  if (!name) return [""];
  if (measure(name) <= widthOf(0)) return [name];
  // Rule 2: a name that fits whole on the lines below the buttons starts there.
  if (room.besideLines > 0 && room.besideLines < lineCount) {
    const below = flow(segments, room.width, () => room.width, measure);
    if (below.length <= lineCount - room.besideLines) return [...Array<string>(room.besideLines).fill(""), ...below];
  }
  return fit(name, flow(segments, room.width, widthOf, measure), lineCount, widthOf, measure);
}

/**
 * The name laid out line by line, every line as long as its width allows: a segment joins a line where it fits; one that
 * fits a full line but not this one starts the next (rule 1), leaving this one as it is; one wider than a full line is
 * broken inside at the last character that fits (rule 3).
 */
function flow(segments: readonly string[], full: number, widthOf: (line: number) => number, measure: (text: string) => number): string[] {
  const lines: string[] = [];
  let current = "";
  const room = (): number => widthOf(lines.length);
  for (const segment of segments) {
    if (measure(current + segment) <= room()) { current += segment; continue; }
    if (measure(segment) <= full) {
      // A segment that fits a full line is never broken: it waits for a line with room for it.
      lines.push(current);
      while (measure(segment) > room()) lines.push("");
      current = segment;
      continue;
    }
    // Wider than a full line: it fills what is left of this line and goes on, character by character; a line beside
    // the buttons with no room for one character stays empty.
    let rest = segment;
    while (rest) {
      let take = 0;
      while (take < rest.length && measure(current + rest.slice(0, take + 1)) <= room()) take++;
      // Not one character fits even a full line: one a line, so that the name is still drawn.
      if (take === 0 && !current && room() >= full) take = 1;
      current += rest.slice(0, take);
      rest = rest.slice(take);
      if (rest) { lines.push(current); current = ""; }
    }
  }
  lines.push(current);
  return lines;
}

/**
 * The lines the room holds; where the name runs past them, the last line holds as much of the rest of the name as fits
 * it with an ellipsis after (rule 4).
 */
function fit(name: string, lines: string[], count: number, widthOf: (line: number) => number, measure: (text: string) => number): string[] {
  if (lines.length <= count) return lines;
  const kept = lines.slice(0, count);
  const last = count - 1;
  let text = name.slice(kept.slice(0, last).join("").length);
  while (text && measure(text + ELLIPSIS) > widthOf(last)) text = text.slice(0, -1);
  // A line beside the buttons too narrow for the ellipsis itself draws nothing.
  kept[last] = measure(text + ELLIPSIS) <= widthOf(last) ? text + ELLIPSIS : "";
  return kept;
}
