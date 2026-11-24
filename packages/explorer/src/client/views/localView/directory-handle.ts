/**
 * A directory's handle in the 2D map: the disclosure chevron and the name that open a closed directory and close an
 * opened one, at every zoom (the owner, 2026-11-15: directories "aren't exceptionally _useful_ (interaction-wise) at high
 * zoom-outs because there are no buttons to interact with at that distance"). The arithmetic of its room is here: the
 * strip an opened directory's membrane keeps above its cards, tall enough for the handle held at the farthest look's
 * size, and the size a closed box's name is held at, brought down before the name is broken inside a word.
 *
 * Pure-function module: no DOM.
 *
 * @module directory-handle
 */

import { chooseHeldHeader, type HeldHeader, type HeldRoom } from "./held-lines";
import { LOOK_SCALES } from "./ladder-steps";

/** A line of the handle at reading size, in the map's own units: a file's name's line, whose type the handle shares. */
export const HANDLE_LINE = 15;

/** The air between the held handle's foot and the first card below it, in the map's own units. */
export const HANDLE_AIR = 6;

/** The largest scale the strip holds the handle at: the overview look's, where a file's name is held largest. */
export const HANDLE_HOLD = LOOK_SCALES.overview;

/**
 * The least scale a directory's name is brought down to before it is cut, a closed box's and an opened directory's
 * handle's alike: the connections look's, so that no directory's name stands smaller at the farthest look than every
 * name stands a look closer.
 */
export const HANDLE_FLOOR = LOOK_SCALES.connections;

/**
 * The height of the strip a drawn directory keeps above its cards, a constant of the layout: a line of the handle at the
 * largest scale a look holds a file's name at, and the air below it. A directory's name is then never drawn smaller
 * than the names of the files inside it, and the held handle never lies over the first card (the overlap of 2026-11-06,
 * when the strip was one line at reading size, 30 units, and the label could only follow the map down to 6 px).
 */
export const HANDLE_STRIP = Math.ceil(HANDLE_HOLD * HANDLE_LINE) + HANDLE_AIR;

/** The chevron and the air after it before the name, in the name's own units: what a held name's lines are indented by. */
export const HANDLE_INDENT = 16;

/** The air a closed box's held name keeps above the box's foot, in the map's own units. */
export const CLOSED_FOOT = 2;

/** The disclosure chevron in a 24-unit box, pointing right: pressing it opens. */
export const CHEVRON_RIGHT = "m9 5 7 7-7 7";
/** The disclosure chevron pointing down: pressing it closes. */
export const CHEVRON_DOWN = "m5 9 7 7 7-7";

/** The chevron's drawing for a state, hidden from assistive technology: its button says the act. */
export function chevronMarkup(open: boolean, size = 12): string {
  return `<svg class="local-directory-chevron" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${open ? CHEVRON_DOWN : CHEVRON_RIGHT}"/></svg>`;
}

/**
 * A directory's path as its handle draws it: the directory's own name, which is cut last, and the path of its parent
 * before it, with its closing slash, which is drawn muted and gives way first, from its start.
 */
export function handleParts(directory: string): { parent: string; leaf: string } {
  const slash = directory.lastIndexOf("/");
  return { parent: directory.slice(0, slash + 1), leaf: directory.slice(slash + 1) };
}

/**
 * Fit a directory handle's parent path (e.g. `"packages/explorer/src/"`) into `available` width (in the
 * span's own unscaled CSS pixels) by dropping whole leading path segments (`"…/explorer/src/"`, `"…/src/"`).
 * Never chops mid-word (`"…odules/"`, `"…rer/"`): if even the innermost segment (`"…/<last>/"`) does not
 * fit, returns `""` so the directory's own name stands clean (its full path remains on hover/title).
 */
export function fitParentPath(
  parent: string,
  available: number,
  measure: (text: string) => number
): string {
  if (!parent || !(available > 0)) return "";
  if (measure(parent) <= available + 0.5) return parent;
  const parts = parent.split("/").filter(Boolean);
  for (let start = 1; start < parts.length; start += 1) {
    const candidate = `\u2026/${parts.slice(start).join("/")}/`;
    if (measure(candidate) <= available + 0.5) return candidate;
  }
  return "";
}

/** What the strip's run reads of a box of the picture: its columns, its row among its siblings, and the boxes around and inside it. */
export interface StripBox {
  key: string;
  kind: string;
  minColumn: number;
  maxColumn: number;
  row: number;
  parent: StripBox | null;
  children: readonly StripBox[];
  /** The parent's own run, set before its children's are asked. */
  stripColumns?: number;
}

/**
 * How many of a drawn directory's leading columns keep the strip for its handle: those in the same situation as its
 * leftmost, by what stands above the directory there. In a column it stands either below the siblings of an earlier
 * row that reach that column, or at its parent's top, under the parent's strip or under its padding. A column in
 * another situation has its top at another height, so the handle cannot reach it and it keeps only the padding: a
 * nested directory whose right columns rise beside its parent's own first row keeps no strip there (the root's
 * decision of 2026-11-15, after a strip in every column had left that row 79 units lower than its own strip asked).
 */
export function stripColumns(box: StripBox): number {
  const situation = (of: StripBox, column: number): string => {
    const parent = of.parent;
    if (!parent) return "";
    const above = parent.children.filter(sibling => sibling !== of && sibling.row < of.row && sibling.minColumn <= column && column <= sibling.maxColumn);
    if (above.length) return `below ${above.map(sibling => sibling.key).join(" ")}`;
    const room = parent.kind !== "directory" ? "top" : column < parent.minColumn + (parent.stripColumns ?? 1) ? "strip" : "padding";
    return `${room} of ${parent.key} ${situation(parent, column)}`;
  };
  const first = situation(box, box.minColumn);
  let run = 1;
  for (let column = box.minColumn + 1; column <= box.maxColumn && situation(box, column) === first; column++) run++;
  return run;
}

/** Something standing in a membrane, as placed: a card, a closed box, or a column of a membrane or a lane inside it. */
export interface Standing { left: number; right: number; top: number }

/**
 * The handle's room across, from its membrane's segments as placed, left to right: from the leftmost's left edge to
 * the right of the last of the leading segments it reaches. It reaches a segment whose top is level with the
 * leftmost's and that either keeps the strip (one of the first `stripColumns`) or holds nothing of the membrane
 * within `clear` units of its top, the strip's height below the membrane's edge. A segment whose top steps away ends
 * the run, whatever it keeps: the strip there is at another height.
 *
 * The second way is of 2026-11-16. A picture placed by its wires keeps the strip over a membrane's first column alone,
 * since its columns stand at the heights the wires give them and not in rows (`stripColumns` counts rows); there the
 * handle was one column wide whatever stood beside it, and "Pay…" was cut beside a row of the membrane that held
 * nothing. That reach is read from the picture as it stands and changes no number of the layout: a card that the
 * wires place higher takes the room back.
 */
export function handleReach(segments: readonly { left: number; right: number; top: number }[], stripColumns: number, clear: number, standing: readonly Standing[]): number {
  const first = segments[0];
  if (!first) return 0;
  let right = first.right;
  for (const [index, segment] of segments.entries()) {
    if (index === 0) continue;
    if (Math.abs(segment.top - first.top) > 0.5) break;
    const free = index < stripColumns
      || standing.every(thing => thing.right <= segment.left + 0.5 || thing.left >= segment.right - 0.5 || thing.top - segment.top >= clear - 0.5);
    if (!free) break;
    right = segment.right;
  }
  return right - first.left;
}

/** Whether a held header draws the name whole and broken only at its seams. */
export function wholeAtSeams(header: HeldHeader, segments: readonly string[]): boolean {
  if (header.lines.join("") !== segments.join("")) return false;
  const seams = new Set<number>();
  let end = 0;
  for (const segment of segments) seams.add(end += segment.length);
  let at = 0;
  return header.lines.slice(0, -1).every(line => seams.has(at += line.length));
}

/** A held name's scale and the header drawn at it. */
export interface HandleFit {
  scale: number;
  header: HeldHeader;
}

/** The step between the scales tried, a twentieth of the name's reading size: below what the eye reads as a change. */
const FIT_STEP = 0.05;

/**
 * A closed box's name fitted as a file's is: at the look's scale where the box holds it whole on lines broken at its
 * seams; otherwise at the largest smaller scale at which it does, never below the floor (the connections look's
 * scale); and at the floor, where it still does not, broken inside a word as it must and cut with an ellipsis last.
 * `roomAt` gives the box's room in the name's own units at a scale.
 */
export function fitHandle(segments: readonly string[], roomAt: (scale: number) => HeldRoom, measure: (text: string) => number, most: number, floor: number): HandleFit {
  const least = Math.min(most, floor);
  const at = (scale: number): HandleFit => ({ scale, header: chooseHeldHeader(segments, roomAt(scale), measure) });
  for (let scale = most; scale > least + 1e-9; scale = Math.max(least, Math.round((scale - FIT_STEP) * 1000) / 1000)) {
    const fit = at(scale);
    if (wholeAtSeams(fit.header, segments)) return fit;
  }
  return at(least);
}

/** The air between a held name and the row of cells held under it, in the name's own units. */
export const HELD_CELLS_GAP = 2;

/** A closed box's room for its held name, in the map's own units, as the box is laid out. */
export interface ClosedRoom {
  /** The content's width: the chevron and the name share it. */
  width: number;
  /** From the name's top down to the air above the box's foot. */
  height: number;
  /** A line of the name at reading size. */
  line: number;
}

/** A closed box among its siblings: its name's segments, its room, and the measure of its name's type. */
export interface ClosedSibling {
  segments: readonly string[];
  room: ClosedRoom;
  measure: (text: string) => number;
}

/** A closed box as a far look holds it: its name's own scale and lines, and the room left under the name, in the map's units. */
export interface ClosedHeld {
  scale: number;
  lines: string[];
  under: number;
}

/** A family of closed boxes at a far look: each box's own name, and whether the cells' row is drawn in them. */
export interface ClosedFamily {
  cells: boolean;
  boxes: ClosedHeld[];
}

/** In every sibling or in none: what one box of a family draws only where each of them has the room for it. */
export function inEverySibling(rooms: readonly boolean[]): boolean {
  return rooms.length > 0 && rooms.every(Boolean);
}

/**
 * The closed boxes of one parent at a far look (2026-11-16). Each box's name is fitted on its own, as a file's is
 * ({@link fitHandle}): at the look's size where the box holds it whole, else at the largest smaller size that does,
 * never below the floor. More is not drawn in a closed box at these looks: the box is the control there, and More
 * returns at reading size (before, it took a line of its own wherever a name left it none, a row given to a lone
 * control). The cells' row is the family's, decided after the names are fitted: drawn in every sibling where each has
 * a whole row's height (`cellRow`, at its own name's scale) under its name, and otherwise in none, since a row in
 * some siblings and not in others said nothing but how each one's name happened to fit.
 *
 * A first form of the same day also held every sibling's name at the tightest sibling's scale and kept More beside
 * the name where every sibling could hold it. It was withdrawn on the pictures: the names of a family then stood at
 * the floor in most families, the smallest names in the picture, and uniform at 8 px was worse than uneven at 13 where
 * a directory is the thing to act on; and More could be held in a quarter of the families only.
 */
export function closedFamily(siblings: readonly ClosedSibling[], look: number, floor: number, cellRow: number): ClosedFamily {
  const boxes = siblings.map(({ segments, room, measure }): ClosedHeld => {
    // The box's room in its name's own units at a scale, after the chevron that leads every line.
    const roomAt = (scale: number): HeldRoom => ({ width: room.width / scale - HANDLE_INDENT, height: room.height / scale, line: room.line, controlsWidth: 0, controlsHeight: 0, gap: 0 });
    const fit = fitHandle(segments, roomAt, measure, Math.max(1, Math.min(look, room.height / room.line)), floor);
    return { scale: fit.scale, lines: fit.header.lines, under: room.height - (fit.header.lines.length * room.line + HELD_CELLS_GAP) * fit.scale };
  });
  return { boxes, cells: inEverySibling(boxes.map(box => box.under >= cellRow * box.scale - 1e-6)) };
}
