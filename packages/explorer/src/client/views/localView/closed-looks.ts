/**
 * The arithmetic of a closed directory's looks: where the skin with cells draws a cell for each file and a small skin
 * for each directory inside, the outline of the skin's shapes, and how many cards a stack shows under its top card.
 * Pure, so that the page draws and the tests check the same numbers; the box's size is never an output, only the room
 * it already has.
 *
 * The owner, on the closed directory: it "doesn't indicate to me "this thing can pop open and let out a lot of stuff
 * into the screen" in the same way that we enjoy with our bags of cells in the 3D local map view"
 * (AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-7); and, having chosen the cells among three
 * looks, of the small ringed marks a directory inside was drawn as: "there's a bit in the visuals here that I struggle
 * to understand the meaning of (likely folders in folders)" (2026-11-15). So there is one kind of mark at one size: a
 * file is a cell, and a directory inside is a small skin around cells of that same size.
 *
 * @module closed-looks
 */

import type { ClosedDirectoryShape } from "../../types";

/** A file as a cell stands for it: its own name, which the cell says on hover, and its kind (its archetype, as the 3D map colours a file). */
export interface ClosedFile { name: string; kind: string }

/** What a directory holds, as the skin with cells draws it: each file directly in it, and each directory inside. */
export interface ClosedContents {
  /** Each file directly in it, in the picture's order. */
  files: readonly ClosedFile[];
  subdirectories: readonly NestedContents[];
}

/** A directory inside a closed one: its name, what it holds directly, and how many files stand under it at any depth. */
export interface NestedContents extends ClosedContents {
  name: string;
  total: number;
}

/** The room a field has, in its own units. */
export interface CellRoom {
  width: number;
  height: number;
}

/**
 * A strip of the field: "pair", as tall as a skin that holds skins, where loose cells stand in two staggered rows;
 * or "single", one row, as tall as a skin around cells where the room holds that, else as tall as a cell.
 */
export interface Band { x: number; y: number; end: number; height: number; kind: "pair" | "single" }

/**
 * A round cell's centre and radius, in the field's units, the kind of the file it stands for, and that file's name
 * where it stands for one file wholly shown: a cell under a veil, or one that stands for what the room left out, has none.
 */
export interface Cell { x: number; y: number; r: number; kind?: string; name?: string }
/** A rectangle in the field's units. */
export interface Rect { x: number; y: number; w: number; h: number }

/** A directory inside, drawn: its skin, its own files' cells, the skins of the directories inside it, and what it says of itself. */
export interface Skin extends Rect {
  name: string;
  /** The files directly in it, the directories directly in it, and the files under it at any depth. */
  files: number;
  directories: number;
  total: number;
  cells: Cell[];
  skins: Skin[];
  /** Whether it holds more than it shows: its right end is veiled. */
  veiled: boolean;
}

/** A veil: where more is held than shown, at the right end of a skin that holds more than it shows or of the field's last band. */
export interface Veil extends Rect { of: "skin" | "field" }

/** What a field draws: a cell for each file shown, a skin for each directory inside shown, and a veil wherever more is held than shown. */
export interface CellField {
  cells: Cell[];
  skins: Skin[];
  veils: Veil[];
}

/**
 * A file's cell and the air between cells; a skin's padding around what it holds; the most cells a skin inside shows,
 * and one inside that; the most skins a skin shows inside it; the air between items and between bands; and the veil's
 * length. Loose cells pack staggered, each touching its neighbours across the same air, so that the body reads as a
 * bag of round things rather than a grid of dots; a skin's own cells stand in one row.
 */
export const CELLS = { cell: 8, gap: 3, pad: 2.5, most: 6, mostDeep: 3, mostSkins: 3, itemGap: 4, bandGap: 3, veil: 30 } as const;

const PITCH = CELLS.cell + CELLS.gap;
const ROW = PITCH * Math.sqrt(3) / 2;
/** The height of two staggered rows of cells. */
export const PAIR_HEIGHT = CELLS.cell + ROW;
/** The height of a skin around a row of cells. */
export const SKIN_HEIGHT = CELLS.cell + 2 * CELLS.pad;
/** The height of a skin that holds skins, and so of a band of two rows. */
export const BAND_HEIGHT = SKIN_HEIGHT + 2 * CELLS.pad;

/**
 * The bands a room holds: as many two-row bands as fit from its top; where none fits, one row, as tall as a skin
 * around cells if the room holds that, else as tall as a cell, in the room's middle; none when not even a cell fits.
 */
export function fieldBands(room: CellRoom): Band[] {
  const bands: Band[] = [];
  if (room.width < CELLS.cell) return bands;
  for (let y = 0; y + BAND_HEIGHT <= room.height + 1e-6; y += BAND_HEIGHT + CELLS.bandGap) bands.push({ x: 0, y, end: room.width, height: BAND_HEIGHT, kind: "pair" });
  if (bands.length) return bands;
  const height = room.height >= SKIN_HEIGHT - 1e-6 ? SKIN_HEIGHT : room.height >= CELLS.cell - 1e-6 ? CELLS.cell : 0;
  return height ? [{ x: 0, y: (room.height - height) / 2, end: room.width, height, kind: "single" }] : [];
}

/** A row of cells' width. */
const rowWidth = (count: number): number => (count ? count * CELLS.cell + (count - 1) * CELLS.gap : 0);

/** A skin as planned before it is placed: its size and what it shows, laid out from its own left edge. */
interface Plan { width: number; height: number; cells: ClosedFile[]; inner: Array<{ sub: NestedContents; plan: Plan }>; veiled: boolean }

/**
 * A directory inside, as a skin no wider than `most`: the skins of the directories inside it first, where `depth` allows
 * a skin to hold skins, then its own files' cells in a row, each as many as the caps and the width allow. It is veiled
 * when it shows fewer than it holds. A skin is never narrower than one cell with its padding, so a directory with no
 * file directly in it is an empty skin.
 */
function planSkin(sub: NestedContents, depth: number, most: number): Plan {
  const { cell, gap, pad, mostDeep, mostSkins } = CELLS;
  const inner: Plan["inner"] = [];
  if (depth > 1) for (const deeper of sub.subdirectories.slice(0, mostSkins)) inner.push({ sub: deeper, plan: planSkin(deeper, depth - 1, Infinity) });
  let cells = sub.files.slice(0, depth > 1 ? CELLS.most : mostDeep);
  const width = (): number => {
    const parts = [...inner.map(each => each.plan.width), ...(cells.length ? [rowWidth(cells.length)] : [])];
    return 2 * pad + Math.max(cell, parts.reduce((sum, part) => sum + part, 0) + Math.max(0, parts.length - 1) * gap);
  };
  // Narrowed to the width it may have: its cells give way first, down to one, then the skins inside it, then the last cell.
  while (width() > most + 1e-6 && cells.length > 1) cells = cells.slice(0, -1);
  while (width() > most + 1e-6 && inner.length) inner.pop();
  const veiled = cells.length < sub.files.length || inner.length < sub.subdirectories.length
    || inner.reduce((sum, each) => sum + each.sub.total, cells.length) < sub.total;
  return { width: width(), height: inner.length ? BAND_HEIGHT : SKIN_HEIGHT, cells: [...cells], inner, veiled };
}

/** A planned skin placed with its left edge at x and its middle at the line given. */
function placeSkin(sub: NestedContents, plan: Plan, x: number, middle: number): Skin {
  const { cell, gap, pad } = CELLS;
  const skin: Skin = { x, y: middle - plan.height / 2, w: plan.width, h: plan.height, name: sub.name, files: sub.files.length,
    directories: sub.subdirectories.length, total: sub.total, cells: [], skins: [], veiled: plan.veiled };
  let at = x + pad;
  for (const each of plan.inner) {
    skin.skins.push(placeSkin(each.sub, each.plan, at, middle));
    at += each.plan.width + gap;
  }
  for (const file of plan.cells) {
    skin.cells.push({ x: at + cell / 2, y: middle, r: cell / 2, kind: file.kind, name: file.name });
    at += cell + gap;
  }
  return skin;
}

/** Every file under a directory inside, by kind, for the cells that stand for what the room cannot show. */
const kindsUnder = (sub: NestedContents): string[] => [...sub.files.map(file => file.kind), ...sub.subdirectories.flatMap(kindsUnder)];

/**
 * Lay a closed directory's contents into its bands, left to right and band after band: a skin for each directory
 * inside first, then a cell for each file. In a two-row band a skin holds the skins of the directories inside it and
 * its own files' cells; in a one-row band as tall as a skin it holds its own cells alone; a row no taller than a cell
 * holds no skin. Where the bands cannot hold everything, the last band is filled to its end with the cells of what was
 * left out and its end is veiled, so that the field never looks as holding fewer than the directory does. A cell
 * names its file; one that fades under a veil, or stands for what was left out, names none.
 */
export function cellField(contents: ClosedContents, bands: readonly Band[]): CellField {
  const { cell, itemGap, veil } = CELLS;
  const result: CellField = { cells: [], skins: [], veils: [] };
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
  const fileCell = (kind: string | undefined, name?: string): boolean => {
    if (band >= bands.length || !fit(cell)) return false;
    const b = current(), middle = b.y + b.height / 2;
    if (b.kind === "single") {
      result.cells.push({ x: x + cell / 2, y: middle, r: cell / 2, kind, name });
      x += PITCH;
      return true;
    }
    result.cells.push({ x: x + cell / 2, y: middle - PAIR_HEIGHT / 2 + cell / 2 + (parity ? ROW : 0), r: cell / 2, kind, name });
    x += PITCH / 2; parity = 1 - parity;
    return true;
  };
  // What the room does not show, by kind: the cells that fill the last band stand for these.
  const left: string[] = [];
  let shown = 0;
  for (const sub of contents.subdirectories) {
    if (band >= bands.length) break;
    const depth = current().height >= BAND_HEIGHT - 1e-6 ? 2 : current().height >= SKIN_HEIGHT - 1e-6 ? 1 : 0;
    if (!depth) break;
    const plan = planSkin(sub, depth, current().end - current().x);
    if (!fit(plan.width)) break;
    const b = current();
    const skin = placeSkin(sub, plan, x, b.y + b.height / 2);
    result.skins.push(skin);
    if (skin.veiled) result.veils.push({ of: "skin", x: skin.x + skin.w - (cell + CELLS.pad), y: skin.y, w: cell + CELLS.pad, h: skin.h });
    x += plan.width + itemGap; parity = 0;
    shown += 1;
  }
  for (const sub of contents.subdirectories.slice(shown)) left.push(...kindsUnder(sub));
  let files = 0;
  if (shown === contents.subdirectories.length) while (files < contents.files.length && fileCell(contents.files[files].kind, contents.files[files].name)) files += 1;
  left.push(...contents.files.slice(files).map(file => file.kind));
  if (left.length || shown < contents.subdirectories.length) {
    // Fill the rest of the last band with the cells of what was left out and veil its end: more is held than the room shows.
    band = bands.length - 1;
    const last = current();
    if (x < last.x) x = last.x;
    let next = 0;
    while (next < left.length && x + cell <= last.end + 1e-6 && fileCell(left[next])) next += 1;
    const from = Math.max(last.x, last.end - veil);
    result.veils.push({ of: "field", x: from, y: last.y, w: last.end - from, h: last.height });
  }
  // A cell whose middle stands under a veil fades with it and names no file.
  const faded = (c: Cell): boolean => result.veils.some(v => c.x >= v.x - 1e-6 && c.x <= v.x + v.w + 1e-6 && c.y >= v.y && c.y <= v.y + v.h);
  const quiet = (cells: Cell[]): void => { for (const c of cells) if (faded(c)) delete c.name; };
  const within = (skins: readonly Skin[]): void => { for (const skin of skins) { quiet(skin.cells); within(skin.skins); } };
  quiet(result.cells);
  within(result.skins);
  return result;
}




/** Each shape's corner, in the map's units: the capsule's, a file card's, and between the two for the folder. */
export const SHAPE_CORNER: Readonly<Record<ClosedDirectoryShape, number>> = { round: 24, square: 6, tab: 10 };

/**
 * A folder's outline as path data, in a box `width` by `height` from its top left: a tab over the first `tab.width`
 * units, whose top is the box's own, and the body's top edge `tab.rise` lower to the right of it, with corners of
 * `radius` and the inner corner under the tab's right edge turned the other way. The outline stands `inset` inside the
 * box all round, for a stroke that stays within it. Where the tab would leave the body's top edge shorter than two
 * corners, there is no step to draw and the outline is the box's rounded rectangle.
 */
export function tabOutline(width: number, height: number, tab: { width: number; rise: number }, radius: number, inset = 0): string {
  const left = inset, top = inset, right = width - inset, bottom = height - inset;
  const r = Math.max(0, Math.min(radius, (right - left) / 2, (bottom - top) / 2));
  const n = (value: number): string => String(Math.round(value * 100) / 100);
  const edge = Math.min(right, tab.width - inset), step = tab.rise + inset;
  const corner = Math.min(r, tab.rise / 2);
  if (!(tab.rise > 0) || right - edge < 2 * corner + 1 || bottom - step < 2 * r) {
    return `M${n(left + r)} ${n(top)}H${n(right - r)}A${n(r)} ${n(r)} 0 0 1 ${n(right)} ${n(top + r)}V${n(bottom - r)}A${n(r)} ${n(r)} 0 0 1 ${n(right - r)} ${n(bottom)}H${n(left + r)}A${n(r)} ${n(r)} 0 0 1 ${n(left)} ${n(bottom - r)}V${n(top + r)}A${n(r)} ${n(r)} 0 0 1 ${n(left + r)} ${n(top)}Z`;
  }
  return `M${n(left + r)} ${n(top)}H${n(edge - corner)}A${n(corner)} ${n(corner)} 0 0 1 ${n(edge)} ${n(top + corner)}V${n(step - corner)}A${n(corner)} ${n(corner)} 0 0 0 ${n(edge + corner)} ${n(step)}`
    + `H${n(right - r)}A${n(r)} ${n(r)} 0 0 1 ${n(right)} ${n(step + r)}V${n(bottom - r)}A${n(r)} ${n(r)} 0 0 1 ${n(right - r)} ${n(bottom)}H${n(left + r)}A${n(r)} ${n(r)} 0 0 1 ${n(left)} ${n(bottom - r)}V${n(top + r)}A${n(r)} ${n(r)} 0 0 1 ${n(left + r)} ${n(top)}Z`;
}

/** How many cards a stack shows under its top card, by the files under it at any depth: one, two or three. */
export function stackEdges(files: number): 1 | 2 | 3 {
  return files <= 4 ? 1 : files <= 16 ? 2 : 3;
}
