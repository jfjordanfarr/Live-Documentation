/**
 * Files only at the farthest zoom (Tuning → 2D Layout → Zoomed Out Fully; a trial of 2026-11-13, the owner, after
 * opening three directories in Flow: "I feel like the "Flow" look is much closer to what the full zoom-out in the 2D
 * Local Map might reasonably be"; the default since 2026-11-15, chosen by the owner's eye over cards that keep their size
 * with their rows drawn as bars, after a comparison on three subjects). At the overview look every file card takes the
 * compact form an opened directory's member has, one line joins each pair of cards where one uses the other, and the
 * picture is laid out again for those sizes and moved to, as a fold of a description moves it; zooming back in reverses
 * it. Files only means files and what the person pinned by name: such a symbol's row is drawn beneath its file's name,
 * with its dots and its own wires, since a pin is the person's own question (2026-11-15).
 *
 * Pure-function module: no DOM.
 *
 * @module overview-files
 */

import { LOOK_SCALES, type ZoomLook } from "./ladder-steps";

/** The container's attribute that says the overview draws files only, read by the stylesheet and the wires. */
export const OVERVIEW_FILES_ATTRIBUTE = "data-overview-files";

/**
 * The container's attribute that says, for the length of the move back in from files only, that the wires are still drawn
 * as the pairs' lines: a row the growing card still hides has no wire drawn to it, and the symbols' wires are drawn
 * when the move ends.
 */
export const OVERVIEW_LINES_ATTRIBUTE = "data-overview-lines";

/** The air left below a compact card's name, in lines of the name at its size, so that its last line is clear of the card's edge. */
export const COMPACT_AIR = 0.4;

/**
 * The scale a compact card's name is held at with files only: the overview look's, unless the widest of the name's
 * segments (the pieces between its seams) would not fit the card's room across at it; then the largest at which every
 * segment fits, so that the name breaks only at its seams, as Flow's names do; never below the connections look's
 * scale, where a segment wider still breaks as it must. Rounded down to the thousandth that the stylesheet is written.
 */
export function filesNameScale(roomWidth: number, widestSegment: number): number {
  const far = LOOK_SCALES.overview, near = LOOK_SCALES.connections;
  if (!(widestSegment > 0) || !(roomWidth > 0)) return far;
  return Math.max(near, Math.min(far, Math.floor(roomWidth / widestSegment * 1000) / 1000));
}

/**
 * The scale a name is held at where it comes down in size before it is cut (2026-11-15, a symbol pinned by name at the
 * overview look): the largest scale, from the overview look's down to the connections look's a tenth at a time, at which
 * `whole` says the name stands whole in its room; the connections look's where none does, and the name is cut there.
 */
export function wholeNameScale(whole: (scale: number) => boolean): number {
  const far = LOOK_SCALES.overview, near = LOOK_SCALES.connections;
  for (let tenths = Math.round(far * 10); tenths > Math.round(near * 10); tenths -= 1) if (whole(tenths / 10)) return tenths / 10;
  return near;
}

/**
 * One size for the rows of one card that the overview look draws, those pinned by name (2026-11-15): each takes the
 * scale of the tightest of them, the least, as a card's file name takes one scale, since a difference of size that
 * means nothing reads as a difference of kind. A row that is not pinned keeps its own, which no look draws there.
 * Across cards the sizes may differ, as file names' do.
 */
export function pinnedRowScales(rows: readonly { scale: number; pinned: boolean }[]): number[] {
  const shared = Math.min(...rows.filter(row => row.pinned).map(row => row.scale));
  return rows.map(row => row.pinned ? shared : row.scale);
}

/** The tuning the choice reads: the three looks with fixed slots, and the choice itself. */
export interface OverviewFilesTuning {
  zoomLooks: "stepped" | "three";
  cardText: "grow" | "slot";
  overviewFiles: "keep" | "files";
}

/** Whether the map draws files only: the choice made, the three looks drawn, and the overview the look shown. */
export function overviewFilesShown(tuning: OverviewFilesTuning, look: ZoomLook): boolean {
  return tuning.overviewFiles === "files" && tuning.zoomLooks === "three" && tuning.cardText === "slot" && look === "overview";
}

/** A picture's size in the map's own units, as the scene lays it out. */
export interface PictureSize {
  width: number;
  height: number;
}

/**
 * What Fit frames while files only is shown: the content as measured, grown by what the picture with its rows has more
 * than the compact one, from the same top left (the two share their columns, so the width rarely differs). Fit then
 * frames the same picture whichever of the two is shown, so that a second press changes nothing and Fit never flips
 * between the two layouts: the compact picture stands in the frame the picture with its rows would fill. Without the
 * size of the picture with its rows the content is framed as it is.
 */
export function rowsFrame<Box extends { left: number; top: number; width: number; height: number }>(content: Box, shown: PictureSize, rows: PictureSize | null): Box {
  if (!rows) return content;
  const width = content.width + Math.max(0, rows.width - shown.width), height = content.height + Math.max(0, rows.height - shown.height);
  return { ...content, width, height, ...("right" in content ? { right: content.left + width } : null), ...("bottom" in content ? { bottom: content.top + height } : null) };
}

/** A box on screen, as `getBoundingClientRect` gives it. */
export interface ScreenBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The element held still while the picture changes between its two layouts: the one under the pointer when the pointer
 * is over one, else the one whose centre is nearest the frame's centre (the first of equals), else none. A box with no
 * size is not on screen and is never held.
 */
export function heldIndex(boxes: readonly ScreenBox[], pointer: { x: number; y: number } | null, centre: { x: number; y: number }): number {
  const drawn = (box: ScreenBox): boolean => box.width > 0 || box.height > 0;
  if (pointer) {
    const under = boxes.findIndex(box => drawn(box) && pointer.x >= box.left && pointer.x <= box.left + box.width
      && pointer.y >= box.top && pointer.y <= box.top + box.height);
    if (under >= 0) return under;
  }
  let best = -1, distance = Infinity;
  boxes.forEach((box, index) => {
    if (!drawn(box)) return;
    const d = Math.hypot(box.left + box.width / 2 - centre.x, box.top + box.height / 2 - centre.y);
    if (d < distance) { distance = d; best = index; }
  });
  return best;
}
