/**
 * The rooms of the card ladder's held parts (2026-11-06, the far-zoom review): inside a box that never changes, a held
 * thing is bounded by the room of the box it belongs to, and where that room runs out it follows the map. The card
 * reading measures the boxes at render, in the map's own units; these are the sums it makes of them, which the
 * stylesheet turns into held sizes at each step without measuring anything again.
 *
 * @module ladder-rooms
 */

/** The air a pinned row's highlight keeps below its name, inside the row. */
export const HIGHLIGHT_BELOW = 2;

/**
 * The most a symbol's name may be scaled about its row's top edge, so that the name and the highlight beneath it stay
 * inside the row: the row's height less the highlight's air, over the depth of the name's bottom below the row's top.
 * A name that already reaches the row's bottom may not grow; it is never asked to shrink (1 at least).
 */
export function nameFill(rowHeight: number, nameTop: number, nameHeight: number): number {
  const depth = nameTop + nameHeight;
  if (!(depth > 0) || !(rowHeight > 0)) return 1;
  return Math.max(1, (rowHeight - HIGHLIGHT_BELOW) / depth);
}

/**
 * How many lines of a symbol's name its row holds at a held scale (2026-11-13: in the zoom looks a name the room across
 * cannot hold takes the room its description left, the owner's "space that the symbols themselves should be able to take
 * up" of 2026-11-05): the name is held about the row's top edge, so its lines end at the name's top plus that many lines,
 * times the scale, and the last must end with the highlight's air inside the row. One at least: a name is never erased.
 */
export function nameLinesHeld(rowHeight: number, nameTop: number, lineHeight: number, scale: number): number {
  if (!(rowHeight > 0) || !(lineHeight > 0) || !(scale > 0)) return 1;
  return Math.max(1, Math.floor(((rowHeight - HIGHLIGHT_BELOW) / scale - nameTop) / lineHeight + 1e-6));
}

/** A count at a card's foot as laid out, in the map's own units on one vertical axis: its top, bottom, left and width. */
export interface FootCount {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/**
 * Whether the counts at a card's foot stand at a held scale (2026-11-13, the connections look), and each one's distance
 * above the last one's foot, about which they are held together, so that each is lifted by that distance times the
 * scale's growth and stays above the one below it. They stand only where all of them fit at that scale between the top
 * of the room left free above them and their foot, with `frame` of each count's frame above the first and `gap` of air
 * under what stands above, and across between each one's left and the card's content right; otherwise none is held.
 */
export function footHold(counts: readonly FootCount[], free: number, right: number, scale: number, frame: number, gap: number): { held: boolean; above: number[] } {
  if (!counts.length || !(scale > 0)) return { held: false, above: [] };
  const foot = Math.max(...counts.map(count => count.bottom));
  const top = Math.min(...counts.map(count => count.top)) - frame;
  const tall = (foot - top) * scale <= foot - free - gap + 1e-6;
  const wide = counts.every(count => count.width * scale <= right - count.left + 1e-6);
  return { held: tall && wide, above: counts.map(count => foot - count.bottom) };
}

/**
 * Whether a symbol's name wraps at the reading width, read in whichever band the map shows: across more than one line
 * where it may wrap, or wider than its button where it is held on one line and cut. A wrapped name is not held in the
 * reading band, since holding it would mean cutting lines and moving its description.
 */
export function nameWraps(lines: number, textWidth: number, boxWidth: number): boolean {
  return lines > 1 || textWidth > boxWidth + 0.5;
}

/** An anchor dot's layout box across its card and the inner edges of the card it may not cross, in one unit. */
export interface DotSpan {
  left: number;
  right: number;
  direction: "inbound" | "outbound";
}

/**
 * The most an anchor dot may be scaled before it crosses its card's inner edge: a use-dot grows leftward from its edge
 * beside the name and an offer-dot rightward, as wires enter on the left and leave on the right, so the room is from
 * that edge to the card's edge on its side, over the dot's width. A dot with no room follows the map (1).
 */
export function dotRoom(dot: DotSpan, cardInnerLeft: number, cardInnerRight: number): number {
  const width = dot.right - dot.left;
  if (!(width > 0)) return 1;
  const room = dot.direction === "inbound" ? dot.right - cardInnerLeft : cardInnerRight - dot.left;
  return Math.max(1, room / width);
}

/**
 * The layout top of an element drawn with `translateY(shift) scale(scale)` about its vertical centre, from the top it is
 * drawn at: the measurement at render reads the box the layout gave, whatever the step drew.
 */
export function layoutTopOf(drawnTop: number, height: number, shift: number, scale: number): number {
  return drawnTop - shift - (height / 2) * (1 - scale);
}

/** A symbol row as the title's room sees it: whether it is laid out at all, and whether it is pinned. */
export interface RowMark {
  shown: boolean;
  pinned: boolean;
}

/**
 * How many shown rows stand above a card's first pinned row, in the rows' order, or null when no shown row is pinned:
 * at the overview band the file's name may wrap down over the silent rows only as far as the first row still drawn.
 */
export function rowsBeforeFirstPin(rows: readonly RowMark[]): number | null {
  let shown = 0;
  for (const row of rows) {
    if (!row.shown) continue;
    if (row.pinned) return shown;
    shown += 1;
  }
  return null;
}
