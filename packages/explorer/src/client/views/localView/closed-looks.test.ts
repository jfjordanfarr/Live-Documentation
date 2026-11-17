import { describe, expect, it } from "vitest";

import { BAND_HEIGHT, CELLS, cellField, fieldBands, lineMarks, SKIN_HEIGHT, stackEdges, tabOutline, type Cell, type CellField, type CellRoom, type ClosedFile, type NestedContents, type Skin } from "./closed-looks";

/** A box's field as the page measures it for a 200 px wide box: from the count's line to the foot of the box's content. */
const ROOM: CellRoom = { width: 176, height: 40.6 };

const files = (count: number, kind = "implementation"): ClosedFile[] => Array.from({ length: count }, (_, index) => ({ name: `${kind}-${index}.ts`, kind }));
const kinds = (list: readonly ClosedFile[]): string[] => list.map(file => file.kind);
const nested = (name: string, own: number, inside: NestedContents[] = [], deeper = 0): NestedContents =>
  ({ name, files: files(own), subdirectories: inside, total: own + deeper + inside.reduce((sum, each) => sum + each.total, 0) });

const skinsOf = (skins: readonly Skin[]): Skin[] => skins.flatMap(skin => [skin, ...skinsOf(skin.skins)]);
const allCells = (field: CellField): Cell[] => [...field.cells, ...skinsOf(field.skins).flatMap(skin => skin.cells)];
const inside = (field: CellField, room: CellRoom): boolean => allCells(field)
  .every(c => c.x - c.r >= -1e-6 && c.x + c.r <= room.width + 1e-6 && c.y - c.r >= -1e-6 && c.y + c.r <= room.height + 1e-6)
  && skinsOf(field.skins).every(skin => skin.x >= -1e-6 && skin.x + skin.w <= room.width + 1e-6 && skin.y >= -1e-6 && skin.y + skin.h <= room.height + 1e-6);

describe("the skin with cells", () => {
  it("packs round cells staggered, each clear of its neighbours by the same air, each of its file's kind", () => {
    const held = [...files(11), { name: "steps.test.ts", kind: "test" }];
    const field = cellField({ files: held, subdirectories: [] }, fieldBands(ROOM));
    expect(field.cells).toHaveLength(12);
    for (const c of field.cells) expect(c.r * 2).toBe(CELLS.cell);
    expect(field.cells.map(c => c.kind)).toEqual(kinds(held));
    // Each cell names its file, the reader's own word for it.
    expect(field.cells.map(c => c.name)).toEqual(held.map(file => file.name));
    // Two rows, the second offset by half a pitch: a staggered packing, not a square grid.
    const rows = [...new Set(field.cells.map(c => c.y.toFixed(3)))];
    expect(rows).toHaveLength(2);
    const [a, b] = [field.cells[0]!, field.cells[1]!];
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(CELLS.cell + CELLS.gap, 6);
    for (const c of field.cells) for (const d of field.cells) if (c !== d) expect(Math.hypot(c.x - d.x, c.y - d.y)).toBeGreaterThanOrEqual(CELLS.cell + CELLS.gap - 1e-6);
    expect(field.veils).toEqual([]);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("takes the whole room, two bands of two rows, now that no control stands in it", () => {
    const bands = fieldBands(ROOM);
    expect(bands.map(band => [band.x, band.kind, band.height])).toEqual([[0, "pair", BAND_HEIGHT], [0, "pair", BAND_HEIGHT]]);
    const field = cellField({ files: files(60), subdirectories: [] }, bands);
    expect(field.cells).toHaveLength(60);
    expect(Math.min(...field.cells.filter(c => c.y > BAND_HEIGHT).map(c => c.x - c.r))).toBeCloseTo(0, 6);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("draws a directory inside as a skin around cells of the same size as every other cell, before the files' cells", () => {
    const field = cellField({ files: files(5), subdirectories: [nested("adapters", 4)] }, fieldBands(ROOM));
    expect(field.skins).toHaveLength(1);
    const skin = field.skins[0]!;
    expect(skin).toMatchObject({ name: "adapters", files: 4, directories: 0, total: 4, veiled: false, h: SKIN_HEIGHT });
    expect(skin.cells).toHaveLength(4);
    // One kind of mark at one size: the cells inside a skin are the cells outside it.
    expect(new Set(allCells(field).map(c => c.r))).toEqual(new Set([CELLS.cell / 2]));
    // The skin holds its cells with its padding all round.
    for (const c of skin.cells) {
      expect(c.x - c.r).toBeGreaterThanOrEqual(skin.x + CELLS.pad - 1e-6);
      expect(c.x + c.r).toBeLessThanOrEqual(skin.x + skin.w - CELLS.pad + 1e-6);
      expect(c.y - c.r).toBeCloseTo(skin.y + CELLS.pad, 6);
    }
    expect(field.cells).toHaveLength(5);
    expect(Math.min(...field.cells.map(c => c.x - c.r))).toBeGreaterThan(skin.x + skin.w);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("nests once more for a directory deeper, a skin inside a skin, still around cells of that one size", () => {
    const field = cellField({ files: [], subdirectories: [nested("live-docs", 3, [nested("adapters", 2), nested("history", 1)])] }, fieldBands(ROOM));
    const outer = field.skins[0]!;
    expect(outer.h).toBe(BAND_HEIGHT);
    expect(outer.skins.map(skin => [skin.name, skin.cells.length, skin.h])).toEqual([["adapters", 2, SKIN_HEIGHT], ["history", 1, SKIN_HEIGHT]]);
    expect(outer.cells).toHaveLength(3);
    for (const deeper of outer.skins) {
      expect(deeper.x).toBeGreaterThanOrEqual(outer.x + CELLS.pad - 1e-6);
      expect(deeper.y).toBeCloseTo(outer.y + CELLS.pad, 6);
      expect(deeper.x + deeper.w).toBeLessThan(outer.cells[0]!.x - outer.cells[0]!.r);
    }
    expect(new Set(allCells(field).map(c => c.r))).toEqual(new Set([CELLS.cell / 2]));
    expect(outer.veiled).toBe(false);
    expect(field.veils).toEqual([]);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("veils a skin that holds more than it shows, and draws a directory with no file of its own as an empty skin", () => {
    const field = cellField({ files: [], subdirectories: [nested("adapters", 80, [], 0), nested("deep", 0, [], 9)] }, fieldBands(ROOM));
    const [many, empty] = field.skins as [Skin, Skin];
    expect(many.veiled).toBe(true);
    expect(many.cells).toHaveLength(CELLS.most);
    expect(empty.cells).toEqual([]);
    expect(empty.w).toBe(CELLS.cell + 2 * CELLS.pad);
    expect(empty.veiled).toBe(true);
    // Each veiled skin's own right end is veiled; the field itself shows every directory, so it has no veil of its own.
    expect(field.veils.map(veil => veil.of)).toEqual(["skin", "skin"]);
    expect(field.veils[0]!.x + field.veils[0]!.w).toBeCloseTo(many.x + many.w, 6);
    // The cell that fades under the skin's veil names no file; the cells before it name theirs.
    expect(many.cells.map(c => c.name)).toEqual([...files(CELLS.most - 1).map(file => file.name), undefined]);
  });

  it("ends in a veil, filled to the end with the cells of what was left out, where it holds more than the room shows", () => {
    const field = cellField({ files: files(400, "test"), subdirectories: [nested("fixtures", 3)] }, fieldBands(ROOM));
    const veil = field.veils.at(-1)!;
    expect(veil.of).toBe("field");
    expect(veil.x + veil.w).toBeCloseTo(ROOM.width, 6);
    expect(Math.max(...field.cells.map(c => c.x + c.r))).toBeGreaterThan(ROOM.width - CELLS.cell - CELLS.gap);
    expect(new Set(field.cells.map(c => c.kind))).toEqual(new Set(["test"]));
    // Under the field's veil no cell names a file, whether it is a file's own or stands for what was left out; before it each names its own, once.
    const named = field.cells.filter(c => c.name !== undefined);
    expect(named.length).toBeGreaterThan(0);
    const under = (c: Cell): boolean => c.x >= veil.x && c.y >= veil.y && c.y <= veil.y + veil.h;
    expect(named.some(under)).toBe(false);
    expect(field.cells.filter(under).length).toBeGreaterThan(0);
    // The veil is the last band's: a cell above it, in the first band, names its file however far right it stands.
    expect(named.some(c => c.x >= veil.x)).toBe(true);
    expect(new Set(named.map(c => c.name)).size).toBe(named.length);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("narrows a skin to the room: its cells give way before the skins inside it, and never below one", () => {
    const narrow: CellRoom = { width: 40, height: 40.6 };
    const field = cellField({ files: [], subdirectories: [nested("wide", 6, [nested("a", 3), nested("b", 3)])] }, fieldBands(narrow));
    const skin = field.skins[0]!;
    expect(skin.w).toBeLessThanOrEqual(narrow.width + 1e-6);
    expect(skin.veiled).toBe(true);
    expect(allCells(field).length).toBeGreaterThan(0);
    expect(new Set(allCells(field).map(c => c.r))).toEqual(new Set([CELLS.cell / 2]));
    expect(inside(field, narrow)).toBe(true);
  });

  it("holds one row under a held name: a skin around its own cells where the row is as tall as one, cells and a veil where it is not", () => {
    const tall = fieldBands({ width: 120, height: SKIN_HEIGHT + 0.5 });
    expect(tall).toEqual([{ x: 0, y: 0.25, end: 120, height: SKIN_HEIGHT, kind: "single" }]);
    const withSkin = cellField({ files: files(40), subdirectories: [nested("fixtures", 2, [nested("deep", 1)])] }, tall);
    expect(withSkin.skins).toHaveLength(1);
    expect(withSkin.skins[0]!.skins).toEqual([]);
    expect(withSkin.skins[0]!.cells).toHaveLength(2);
    expect(withSkin.skins[0]!.veiled).toBe(true);
    expect(new Set(withSkin.cells.map(c => c.y)).size).toBe(1);
    const short = fieldBands({ width: 120, height: CELLS.cell + 2 });
    expect(short).toEqual([{ x: 0, y: 1, end: 120, height: CELLS.cell, kind: "single" }]);
    const cellsOnly = cellField({ files: files(4), subdirectories: [nested("fixtures", 2)] }, short);
    // No skin fits a row as tall as a cell, and none is drawn smaller: the row shows cells and says there is more.
    expect(cellsOnly.skins).toEqual([]);
    expect(cellsOnly.cells.length).toBeGreaterThan(0);
    expect(new Set(cellsOnly.cells.map(c => c.r))).toEqual(new Set([CELLS.cell / 2]));
    expect(cellsOnly.veils).toHaveLength(1);
    expect(fieldBands({ width: 120, height: CELLS.cell - 1 })).toEqual([]);
    expect(cellField({ files: files(3), subdirectories: [] }, [])).toEqual({ cells: [], skins: [], veils: [] });
  });
});

describe("the marks in a handle's line, in place of the count (the Hidden Files trial, 2026-11-17)", () => {
  /** A handle's line at reading size: 15 units tall. */
  const LINE = 15;
  const PITCH = CELLS.cell + CELLS.gap;

  it("draws every mark whole where the room holds them: a small skin for each directory first, then a cell for each file, one size", () => {
    const contents = { files: files(3, "test"), subdirectories: [nested("adapters", 4)] };
    const line = lineMarks(contents, { width: 500, height: LINE });
    expect(line.held).toBe(4);
    expect(line.marks.map(mark => `${mark.of} ${mark.index}`)).toEqual(["directory 0", "file 0", "file 1", "file 2"]);
    expect(line.marks.every(mark => !mark.veiled)).toBe(true);
    expect(line.field.veils.filter(veil => veil.of === "field")).toEqual([]);
    // The skin is the closed field's one-row skin: as tall as a skin around cells, its own cells capped and veiled past three.
    expect(line.field.skins).toHaveLength(1);
    expect(line.field.skins[0].h).toBeCloseTo(SKIN_HEIGHT);
    expect(line.field.skins[0].cells).toHaveLength(CELLS.mostDeep);
    expect(line.field.skins[0].veiled).toBe(true);
    // Every cell, loose or in the skin, is a closed directory's cell: one size, its file's kind, the loose ones named.
    expect(new Set([...line.field.cells, ...line.field.skins[0].cells].map(c => c.r))).toEqual(new Set([CELLS.cell / 2]));
    expect(line.field.cells.map(c => [c.kind, c.name])).toEqual([["test", "test-0.ts"], ["test", "test-1.ts"], ["test", "test-2.ts"]]);
    // In the line's middle, inside the room, at the closed field's one-row spacing.
    expect(line.field.cells.every(c => Math.abs(c.y - LINE / 2) < 1e-6)).toBe(true);
    expect(line.field.cells[1].x - line.field.cells[0].x).toBeCloseTo(PITCH);
    expect(line.field.cells[0].x - CELLS.cell / 2 - (line.field.skins[0].x + line.field.skins[0].w)).toBeCloseTo(CELLS.itemGap);
    expect(line.natural).toBeLessThanOrEqual(500);
  });

  it("presses reach over each mark's whole pitch, edge to edge with no gap between them", () => {
    const line = lineMarks({ files: files(5), subdirectories: [nested("a", 1), nested("b", 2)] }, { width: 500, height: LINE });
    expect(line.marks[0].left).toBe(0);
    for (const [index, mark] of line.marks.entries()) {
      expect(mark.x).toBeGreaterThan(mark.left);
      expect(mark.x + mark.width).toBeLessThan(mark.right);
      if (index) expect(mark.left).toBeCloseTo(line.marks[index - 1].right);
    }
    // A cell's reach between two cells is its pitch, the cell and the air beside it.
    expect(line.marks[3].right - line.marks[3].left).toBeCloseTo(PITCH);
    expect(line.natural).toBeCloseTo(line.marks[line.marks.length - 1].right);
  });

  it("shows as many whole marks as fit, fades the last under a veil where more are held, and the marks shown, veiled and left out are as many as the count", () => {
    const contents = { files: files(23), subdirectories: [] };
    for (const width of [0, 5, PITCH - 0.5, PITCH, 3 * PITCH, 3 * PITCH + 4, 100, 400]) {
      const line = lineMarks(contents, { width, height: LINE });
      const shown = line.marks.length, veiled = line.marks.filter(mark => mark.veiled);
      expect(line.marks.every(mark => mark.right <= width + 1e-6), `${width}: whole marks only`).toBe(true);
      expect(shown, `${width}: as many as fit`).toBe(Math.min(23, Math.floor((width + 1e-6) / PITCH)));
      if (shown === 0) expect(line.field).toEqual({ cells: [], skins: [], veils: [] });
      if (shown && shown < line.held) {
        expect(veiled.map(mark => line.marks.indexOf(mark)), `${width}: the last shown is veiled`).toEqual([shown - 1]);
        // The veiled cell names no file; every other names its own.
        expect(line.field.cells[shown - 1].name).toBeUndefined();
        expect(line.field.cells.slice(0, -1).map(c => c.name)).toEqual(contents.files.slice(0, shown - 1).map(file => file.name));
        const end = line.field.veils.find(veil => veil.of === "field")!;
        expect(end.x).toBeLessThanOrEqual(line.field.cells[shown - 1].x - CELLS.cell / 2 + 1e-6);
      }
      if (shown === line.held) expect(veiled).toEqual([]);
      // Named, veiled and left out: the count.
      const named = line.field.cells.filter(c => c.name).length;
      expect(named + veiled.length + (line.held - shown), `${width}: the count`).toBe(23);
    }
  });

  it("veils a skin like a cell where it is the last shown, and draws none in a line too short for a skin", () => {
    const contents = { files: files(2), subdirectories: [nested("a", 1), nested("b", 1)] };
    const one = lineMarks(contents, { width: lineMarks(contents, { width: 500, height: LINE }).marks[0].right, height: LINE });
    expect(one.marks.map(mark => [mark.of, mark.veiled])).toEqual([["directory", true]]);
    expect(one.field.veils.filter(veil => veil.of === "field")).toHaveLength(1);
    expect(lineMarks(contents, { width: 500, height: SKIN_HEIGHT - 1 }).marks).toEqual([]);
    expect(lineMarks({ files: [], subdirectories: [] }, { width: 500, height: LINE })).toMatchObject({ marks: [], held: 0, natural: 0 });
  });
});

describe("a folder's outline", () => {
  /** The numbers of a path's commands, in order. */
  const numbers = (path: string): number[] => (path.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number);

  it("rises around the tab at the top left and steps down to the body's top edge to its right", () => {
    const path = tabOutline(200, 80, { width: 90, rise: 26 }, 10);
    // From the top left: the tab's top to its right edge, down its side, the inner corner turned the other way, the body's top edge.
    expect(path.startsWith("M10 0H80A10 10 0 0 1 90 10V16A10 10 0 0 0 100 26H190")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    // Nothing of the outline leaves the box.
    const drawn = numbers(path.replaceAll(/A[\d.]+ [\d.]+ 0 0 [01]/gu, ""));
    expect(Math.min(...drawn)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...drawn)).toBeLessThanOrEqual(200);
  });

  it("stands inside the box by the inset, for a stroke that stays within it", () => {
    expect(tabOutline(200, 80, { width: 90, rise: 26 }, 10, 0.5).startsWith("M10.5 0.5H79.5")).toBe(true);
  });

  it("is the box's rounded rectangle where the tab leaves no body edge to step down to", () => {
    const whole = tabOutline(160, 80, { width: 150, rise: 26 }, 10);
    expect(whole).toBe("M10 0H150A10 10 0 0 1 160 10V70A10 10 0 0 1 150 80H10A10 10 0 0 1 0 70V10A10 10 0 0 1 10 0Z");
    expect(tabOutline(160, 80, { width: 400, rise: 26 }, 10)).toBe(whole);
    expect(tabOutline(160, 80, { width: 60, rise: 0 }, 10)).toBe(whole);
  });
});

describe("the stack's cards", () => {
  it("shows one, two or three cards under the top one by the files under it", () => {
    expect([1, 4, 5, 16, 17, 900].map(stackEdges)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});
