/**
 * The arithmetic of the Closed Directory trial's looks (2026-11-13): where the skin with cells draws a cell for each
 * file and a small skin for each subdirectory, and how many cards a stack shows under its top card. Pure, so that the
 * page draws and the tests check the same numbers; the box's size is never an output, only the room it already has.
 *
 * The owner, on the closed directory: it "doesn't indicate to me "this thing can pop open and let out a lot of stuff
 * into the screen" in the same way that we enjoy with our bags of cells in the 3D local map view"
 * (AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-7).
 *
 * @module closed-looks
 */

/** What a closed directory holds, as the skin with cells draws it: its own files, and each subdirectory's own files and subdirectories. */
export interface ClosedContents {
  files: number;
  subdirectories: ReadonlyArray<{ files: number; directories: number }>;
}

/** The room a field has, in its own units: as wide as the box's content, and the controls' corner to keep clear, if any. */
export interface CellRoom {
  width: number;
  height: number;
  /** The controls at the room's lower left: a band that reaches below their top begins past their width. */
  controls?: { width: number; top: number };
}

/** A strip of the field: "pair", two staggered rows of cells, or "single", one row where the room holds no more. */
export interface Band { x: number; y: number; end: number; kind: "pair" | "single" }

/** A round cell's centre and radius, in the field's units. */
export interface Cell { x: number; y: number; r: number }
/** A rectangle in the field's units. */
export interface Rect { x: number; y: number; w: number; h: number }

/** A subdirectory's own skin: its files' cells, a rim for each of its subdirectories, and whether it holds more than it shows. */
export interface SubSkin extends Rect { cells: Cell[]; rims: Cell[]; veiled: boolean }

/** What a field draws: a cell for each file shown, a skin for each subdirectory shown, and the veil where it holds more. */
export interface CellField {
  cells: Cell[];
  skins: SubSkin[];
  /** A subdirectory drawn as a rim alone, where a band is one row and cannot hold a skin. */
  rims: Cell[];
  /** Where the field ends in a veil because it holds more than the room shows; null when everything is drawn. */
  veil: Rect | null;
}

/**
 * A file's cell and the air between cells, a subdirectory skin's inner cell, air and padding, the most inner cells a
 * skin shows, the air between items and between bands, and the veil's length. Cells pack staggered, each touching its
 * neighbours across the same air, so that the body reads as a bag of round things rather than a grid of dots.
 */
export const CELLS = { cell: 8, gap: 3, inner: 4, innerGap: 1.5, pad: 2.5, maxInner: 10, itemGap: 4, bandGap: 3, veil: 30 } as const;

const PITCH = CELLS.cell + CELLS.gap;
const ROW = PITCH * Math.sqrt(3) / 2;
const INNER_PITCH = CELLS.inner + CELLS.innerGap;
const INNER_ROW = INNER_PITCH * Math.sqrt(3) / 2;
/** The height of a band of two staggered rows of cells. */
export const PAIR_HEIGHT = CELLS.cell + ROW;
/** The height of a subdirectory's skin, which stands within a two-row band. */
export const SKIN_HEIGHT = 2 * CELLS.pad + CELLS.inner + INNER_ROW;

/**
 * The bands a room holds: as many two-row bands as fit from its top, a band that reaches below the controls' top
 * beginning past them; where no two-row band fits, one row if that fits; none when not even a row does.
 */
export function fieldBands(room: CellRoom): Band[] {
  const bands: Band[] = [];
  for (let y = 0; y + PAIR_HEIGHT <= room.height + 1e-6; y += PAIR_HEIGHT + CELLS.bandGap) {
    const x = room.controls && y + PAIR_HEIGHT > room.controls.top ? room.controls.width : 0;
    if (room.width - x >= CELLS.cell) bands.push({ x, y, end: room.width, kind: "pair" });
  }
  if (!bands.length && room.height >= CELLS.cell - 1e-6 && room.width >= CELLS.cell) bands.push({ x: 0, y: (room.height - CELLS.cell) / 2, end: room.width, kind: "single" });
  return bands;
}

/**
 * Lay a closed directory's contents into its bands, left to right and band after band: each subdirectory's skin
 * first, its own files' cells staggered within it and a rim for each of its subdirectories, then a cell for each file.
 * A skin that holds more than it shows ends in its own veil. Where the bands cannot hold everything, the last band is
 * filled to its end with cells and its end is veiled, so that the field never looks emptier, or as holding fewer, than
 * the directory is. In a one-row band a subdirectory is a rim of a cell's size.
 */
export function cellField(contents: ClosedContents, bands: readonly Band[]): CellField {
  const { cell, inner, pad, maxInner, itemGap, veil } = CELLS;
  const result: CellField = { cells: [], skins: [], rims: [], veil: null };
  if (!bands.length) return result;
  let band = 0, x = bands[0].x, parity = 0;
  const current = (): Band => bands[band];
  // Room for an item this wide in the current band or a later one; false when no band is left.
  const fit = (width: number): boolean => {
    while (band < bands.length) {
      if (x + width <= current().end + 1e-6) return true;
      band += 1; parity = 0;
      if (band < bands.length) x = current().x;
    }
    return false;
  };
  const fileCell = (): boolean => {
    const b = current();
    if (b.kind === "single") {
      if (!fit(cell)) return false;
      result.cells.push({ x: x + cell / 2, y: current().y + cell / 2, r: cell / 2 });
      x += PITCH;
      return true;
    }
    if (!fit(cell)) return false;
    result.cells.push({ x: x + cell / 2, y: current().y + cell / 2 + (parity ? ROW : 0), r: cell / 2 });
    x += PITCH / 2; parity = 1 - parity;
    return true;
  };
  let overflow = false;
  for (const sub of contents.subdirectories) {
    if (band >= bands.length) { overflow = true; break; }
    if (current().kind === "single") {
      if (!fit(cell)) { overflow = true; break; }
      result.rims.push({ x: x + cell / 2, y: current().y + cell / 2, r: cell / 2 });
      x += PITCH;
      continue;
    }
    const slots = sub.files + sub.directories;
    const shown = Math.max(1, Math.min(maxInner, slots));
    const width = 2 * pad + inner + (shown - 1) * INNER_PITCH / 2;
    if (!fit(width)) { overflow = true; break; }
    const top = current().y + (PAIR_HEIGHT - SKIN_HEIGHT) / 2;
    const skin: SubSkin = { x, y: top, w: width, h: SKIN_HEIGHT, cells: [], rims: [], veiled: slots > shown };
    for (let slot = 0; slot < Math.min(slots, shown); slot += 1) {
      const c = { x: x + pad + inner / 2 + slot * INNER_PITCH / 2, y: top + pad + inner / 2 + (slot % 2 ? INNER_ROW : 0), r: inner / 2 };
      (slot < sub.files ? skin.cells : skin.rims).push(c);
    }
    result.skins.push(skin);
    x += width + itemGap;
  }
  if (!overflow) {
    for (let file = 0; file < contents.files; file += 1) if (!fileCell()) { overflow = true; break; }
  }
  if (overflow) {
    // Fill the rest of the last band with cells and veil its end: more is held than the room shows.
    band = bands.length - 1;
    const last = current();
    if (x < last.x) x = last.x;
    while (x + cell <= last.end + 1e-6) fileCell();
    const from = Math.max(last.x, last.end - veil);
    result.veil = { x: from, y: last.y, w: last.end - from, h: last.kind === "pair" ? PAIR_HEIGHT : cell };
  }
  return result;
}

/** How many cards a stack shows under its top card, by the files under it at any depth: one, two or three. */
export function stackEdges(files: number): 1 | 2 | 3 {
  return files <= 4 ? 1 : files <= 16 ? 2 : 3;
}
