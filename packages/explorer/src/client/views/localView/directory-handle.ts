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

/**
 * The handle's room across, from the segments of its membrane that keep the strip, as placed, left to right: the run
 * of leading segments whose tops are level with the leftmost's, from its left edge to the run's right. A segment whose
 * top steps away ends the run, whatever the strip it keeps: the strip there is at another height.
 */
export function handleRun(segments: readonly { left: number; right: number; top: number }[]): number {
  const first = segments[0];
  if (!first) return 0;
  let right = first.right;
  for (const segment of segments.slice(1)) {
    if (Math.abs(segment.top - first.top) > 0.5) break;
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
