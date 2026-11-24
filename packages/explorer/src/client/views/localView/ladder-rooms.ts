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

/** A row's More, 17 px square (local.css). */
export const ROW_MORE = 17;
/** A symbol name's line, 1.15 of its 11 px (reading.css, the slot card's stated line). */
export const NAME_LINE = 1.15 * 11;

/**
 * The least space between one row's head and the next's in the far looks: a pinned row's highlight stands 2 px above its
 * head and ends 2 px below it, so that two highlights keep this less 2 of clear air between them.
 */
export const HEAD_SPACE = 4;

/**
 * A short row's height at a held scale (2026-11-13): a symbol whose description is not shown keeps only the room its head
 * needs at the connections look, its More held at that scale beside one line of its name (centred on More, as the row
 * lays them out), with the highlight's air and the space before the next head, in whole pixels. The stylesheet states
 * the result for the look's 2.2.
 */
export function shortRowHeight(scale: number): number {
  return Math.ceil(headHeight({ nameTop: (ROW_MORE - NAME_LINE) / 2, line: NAME_LINE, moreTop: 0, moreHeight: ROW_MORE }, 1, scale) + HEAD_SPACE);
}

/** A count at a card's foot as laid out, in the map's own units on one vertical axis: its top, bottom, left, width and optional outer frame. */
export interface FootCount {
  top: number;
  bottom: number;
  left: number;
  width: number;
  /** Extra room drawn outside the count's box by a frame (e.g. 3 px for `.local-reveal-connections`); defaults to `footHold`'s `frame` argument. */
  frame?: number;
}

/** What the counts at a card's foot need in the connections look: which fit across, each held count's lift above the foot, and any extra vertical gap needed below what stands above them. */
export interface FootHold {
  held: boolean[];
  above: number[];
  extraGap: number;
}

/**
 * The counts at a card's foot at a held scale (2026-11-13, the connections look; revised 2026-11-24 so folded cards and
 * cards with Internals never drop or collide with their footer counts): every count whose held width fits across the
 * card stands at `scale` about the last held count's foot, lifted by its distance above that foot (`above`) times the
 * scale's growth. Where the existing room below `free` (with `gap` of clear air and each count's outer `frame`) is too
 * short for the held counts at `scale`, `extraGap` gives the exact whole map units of room to add above them in the
 * card's fixed layout so that they always stand clear without shrinking and without changing with zoom.
 */
export function footHold(counts: readonly FootCount[], free: number, right: number, scale: number, frame: number, gap: number): FootHold {
  if (!counts.length || !(scale > 0)) return { held: [], above: [], extraGap: 0 };
  const held = counts.map(count => count.width * scale <= right - count.left + 1e-6);
  const shown = counts.filter((_, index) => held[index]);
  if (!shown.length) return { held, above: counts.map(() => 0), extraGap: 0 };
  const foot = Math.max(...shown.map(count => count.bottom));
  const top = Math.min(...shown.map(count => count.top - (count.frame ?? frame)));
  const above = counts.map((count, index) => (held[index] ? foot - count.bottom : 0));
  const short = (foot - top) * scale - (foot - free - gap);
  const extraGap = short > 1e-6 ? Math.ceil(short - 1e-6) : 0;
  return { held, above, extraGap };
}

/** A text fragment's box as the page gives it, for counting lines. */
export interface FragmentBox {
  top: number;
  height: number;
  width: number;
}

/**
 * How many lines a text's fragments stand on (2026-11-13): the empty boxes of its word breaks (`<wbr>`) left out, and two
 * fragments on one line when their centres lie within half the shortest fragment's height of each other. Counting each
 * rounded top as a line had read one line as two where a font's metrics put a word break's box a pixel off its text's
 * (Segoe UI's line, emulated, on 2026-11-13), which halved the line a wrapped name was drawn with.
 */
export function linesOf(fragments: readonly FragmentBox[]): number {
  const drawn = fragments.filter(fragment => fragment.width > 0 && fragment.height > 0);
  if (!drawn.length) return 0;
  const half = Math.min(...drawn.map(fragment => fragment.height)) / 2;
  const centres = drawn.map(fragment => fragment.top + fragment.height / 2).sort((a, b) => a - b);
  let lines = 1;
  for (let index = 1; index < centres.length; index += 1) if (centres[index] - centres[index - 1] > half) lines += 1;
  return lines;
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

/** A symbol row as the title's room sees it: whether it is laid out at all, whether it is pinned, and its height. */
export interface RowMark {
  shown: boolean;
  pinned: boolean;
  /** Its height as laid out; a short row's (2026-11-13) is less than a slot row's. */
  height: number;
  /** Its head's height in the far looks ({@link evenRows}); its height where none is known. */
  head?: number;
  /** Whether it is the Internals row, which stands apart from the rows that share their room evenly. */
  internals?: boolean;
}

/**
 * How many shown rows stand above a card's first pinned row, in the rows' order, or null when no shown row is pinned:
 * at the overview band the file's name may wrap down over the silent rows only as far as the first row still drawn.
 */
export function rowsBeforeFirstPin(rows: readonly Pick<RowMark, "shown" | "pinned">[]): number | null {
  let shown = 0;
  for (const row of rows) {
    if (!row.shown) continue;
    if (row.pinned) return shown;
    shown += 1;
  }
  return null;
}

/**
 * How far below the rows' top the first pinned shown row's top stands, less the row gap, or null when none is: the room
 * the file's name may take at the overview below the header's (2026-11-13: since rows have two heights, a count of rows
 * times one pitch no longer finds it). As laid out, or with the rows' heads shared evenly ({@link evenRows}), as the
 * zoom looks draw them.
 */
export function pinDepth(rows: readonly RowMark[], gap: number, even: boolean): number | null {
  const before = rowsBeforeFirstPin(rows);
  if (before === null) return null;
  const shown = rows.filter(row => row.shown);
  const laid = shown.slice(0, before).reduce((sum, row) => sum + row.height + gap, 0) - gap;
  const pinned = shown[before];
  if (!even || pinned.internals) return laid;
  // The pinned row's head as the looks draw it: its layout top shifted to its even place.
  let top = 0;
  const bands = shown.filter(row => !row.internals).map(row => {
    const band = { top, height: row.height, head: row.head ?? row.height };
    top += row.height + gap;
    return band;
  });
  const index = shown.filter(row => !row.internals).indexOf(pinned);
  return laid + evenRows(bands, gap)[index].shift;
}

/** A drawn row's band as laid out, its top and its height, and its head's height in the far looks, in one unit. */
export interface HeadBand {
  top: number;
  height: number;
  head: number;
}

/**
 * The rows' heads spaced evenly over their card's row room in the far looks (2026-11-13): with short rows beside slot
 * rows a card's names would stand at uneven gaps with nothing visible to explain them. Each drawn row's head, as tall
 * as its name's lines and its controls need there, follows the one above with the same space after it: the room the
 * rows' boxes span with one more gap, less their heads, shared out, so that rows of one height move nothing. A name on
 * two lines takes two lines and the gap after every name is the same. Each head is shifted by `shift` from its row's
 * top, and holds its name and controls in `height`, its own and the space after it less the gap. The rows' boxes do not
 * move.
 */
export function evenRows(rows: readonly HeadBand[], gap: number): { shift: number; height: number }[] {
  if (!rows.length) return [];
  const first = rows[0].top, last = rows[rows.length - 1];
  const heads = rows.reduce((sum, row) => sum + row.head, 0);
  const space = Math.max(0, last.top + last.height + gap - first - heads) / rows.length;
  let top = first;
  return rows.map(row => {
    const placed = { shift: top - row.top, height: Math.max(row.head, row.head + space - gap) };
    top += row.head + space;
    return placed;
  });
}

/**
 * How many lines each drawn row's name takes in the far looks: as many as it wants, until the heads they make are taller
 * than the rows' room; then one fewer at a time, from the name that takes the most (the later of equals), down to one.
 */
export function fitLines(want: readonly number[], head: (index: number, lines: number) => number, room: number): number[] {
  const lines = want.map(count => Math.max(1, count));
  const total = (): number => lines.reduce((sum, count, index) => sum + head(index, count), 0);
  while (total() > room + 1e-6) {
    let most = -1;
    lines.forEach((count, index) => { if (count > 1 && (most < 0 || count >= lines[most])) most = index; });
    if (most < 0) break;
    lines[most] -= 1;
  }
  return lines;
}

/**
 * The Descriptions Zoomed Out trial's heads in the connections look (2026-11-13): which rows keep their description's
 * first line under the name, and each name's lines. A row may keep it when its description is shown at reading size and
 * its name takes one line; the kept line is part of its head (`head(index, lines, kept)`). Kept lines give way before
 * any name does: while the heads are taller than the rows' room, the last row's kept line goes first, and only when none
 * is left do the names give up lines, as {@link fitLines} has them do. So no name is cut to make way for a description.
 */
export function fitKept(want: readonly number[], eligible: readonly boolean[], head: (index: number, lines: number, kept: boolean) => number, room: number): { lines: number[]; kept: boolean[] } {
  const kept = want.map((count, index) => !!eligible[index] && Math.max(1, count) === 1);
  const total = (): number => want.reduce((sum, count, index) => sum + head(index, Math.max(1, count), kept[index]), 0);
  while (total() > room + 1e-6) {
    const last = kept.lastIndexOf(true);
    if (last < 0) break;
    kept[last] = false;
  }
  return { lines: fitLines(want, (index, lines) => head(index, lines, kept[index]), room), kept };
}

/**
 * A row's head's height in the far looks at a held scale: the taller of its More, held at the scale from its top, and
 * its name's lines, held about the row's top, with the highlight's air.
 */
export function headHeight(at: { nameTop: number; line: number; moreTop: number; moreHeight: number }, lines: number, scale: number): number {
  return Math.max(at.moreTop + at.moreHeight * scale, (at.nameTop + lines * at.line) * scale) + HIGHLIGHT_BELOW;
}

/** The air a file's kept line keeps below the held name and its controls, in the map's own units. */
export const FILE_KEPT_AIR = 2;

/**
 * Whether the header holds the file's own kept line in the connections look (Descriptions Zoomed Out, 2026-11-15), and
 * by how much it falls short where it does not: the line is a name's line (`NAME_LINE`) at the held scale, with its air
 * above it, and its room is what the header keeps down to the first row (`headRoom`) below the held name and its
 * controls (`below`). The line is never drawn smaller to fit.
 */
export function fileLineRoom(headRoom: number, below: number, scale: number): { fits: boolean; short: number } {
  const short = below + FILE_KEPT_AIR + NAME_LINE * scale - headRoom;
  return { fits: short <= 1e-6, short: Math.max(0, short) };
}
