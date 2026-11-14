import { describe, expect, it } from "vitest";

import { CELLS, cellField, fieldBands, PAIR_HEIGHT, stackEdges, type Cell, type CellField, type CellRoom } from "./closed-looks";

/** A box's field as the page measured it for a 200 px wide box: the count line and the controls' row, More ending at 62 px. */
const ROOM: CellRoom = { width: 176, height: 39.3, controls: { width: 68, top: 20.65 } };

const allCells = (field: CellField): Cell[] => [...field.cells, ...field.rims, ...field.skins.flatMap(skin => [...skin.cells, ...skin.rims])];
const inside = (field: CellField, room: CellRoom): boolean => allCells(field)
  .every(c => c.x - c.r >= -1e-6 && c.x + c.r <= room.width + 1e-6 && c.y - c.r >= -1e-6 && c.y + c.r <= room.height + 1e-6);

describe("the skin with cells (2026-11-13)", () => {
  it("packs round cells staggered, each clear of its neighbours by the same air", () => {
    const field = cellField({ files: 12, subdirectories: [] }, fieldBands(ROOM));
    expect(field.cells).toHaveLength(12);
    for (const c of field.cells) expect(c.r * 2).toBe(CELLS.cell);
    // Two rows, the second offset by half a pitch: a staggered packing, not a square grid.
    const rows = [...new Set(field.cells.map(c => c.y.toFixed(3)))];
    expect(rows).toHaveLength(2);
    const [a, b] = [field.cells[0]!, field.cells[1]!];
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(CELLS.cell + CELLS.gap, 6);
    for (const c of field.cells) for (const d of field.cells) if (c !== d) expect(Math.hypot(c.x - d.x, c.y - d.y)).toBeGreaterThanOrEqual(CELLS.cell + CELLS.gap - 1e-6);
    expect(field.veil).toBeNull();
    expect(inside(field, ROOM)).toBe(true);
  });

  it("draws a small skin for each subdirectory, its own cells and a rim for each one deeper, before the files' cells", () => {
    const field = cellField({ files: 5, subdirectories: [{ files: 4, directories: 1 }] }, fieldBands(ROOM));
    expect(field.skins).toHaveLength(1);
    expect(field.skins[0]!.cells).toHaveLength(4);
    expect(field.skins[0]!.rims).toHaveLength(1);
    expect(field.cells).toHaveLength(5);
    expect(Math.min(...field.cells.map(c => c.x - c.r))).toBeGreaterThan(field.skins[0]!.x + field.skins[0]!.w);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("stands no cell under the controls: the band beside them begins past them", () => {
    const bands = fieldBands(ROOM);
    expect(bands).toHaveLength(2);
    expect(bands[1]!.x).toBe(ROOM.controls!.width);
    const field = cellField({ files: 120, subdirectories: [] }, bands);
    const lower = field.cells.filter(c => c.y > PAIR_HEIGHT);
    expect(lower.length).toBeGreaterThan(0);
    expect(Math.min(...lower.map(c => c.x - c.r))).toBeGreaterThanOrEqual(ROOM.controls!.width);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("ends in a veil, filled to the end, where it holds more than the room shows", () => {
    const field = cellField({ files: 400, subdirectories: [{ files: 3, directories: 0 }] }, fieldBands(ROOM));
    expect(field.veil).not.toBeNull();
    expect(field.veil!.x + field.veil!.w).toBeCloseTo(ROOM.width, 6);
    expect(Math.max(...field.cells.map(c => c.x + c.r))).toBeGreaterThan(ROOM.width - CELLS.cell - CELLS.gap);
    expect(inside(field, ROOM)).toBe(true);
  });

  it("veils a subdirectory's own skin when it holds more than its skin shows", () => {
    const field = cellField({ files: 0, subdirectories: [{ files: 80, directories: 2 }] }, fieldBands(ROOM));
    expect(field.skins[0]!.veiled).toBe(true);
    expect(field.skins[0]!.cells).toHaveLength(CELLS.maxInner);
    expect(field.veil).toBeNull();
  });

  it("holds one row where the room under a held name has no room for two, and none where not even a row fits", () => {
    const single = fieldBands({ width: 120, height: CELLS.cell + 2 });
    expect(single).toEqual([{ x: 0, y: 1, end: 120, kind: "single" }]);
    const field = cellField({ files: 40, subdirectories: [{ files: 2, directories: 0 }] }, single);
    expect(field.rims).toHaveLength(1);
    expect(new Set(field.cells.map(c => c.y)).size).toBe(1);
    expect(field.veil).not.toBeNull();
    expect(fieldBands({ width: 120, height: CELLS.cell - 1 })).toEqual([]);
    expect(cellField({ files: 3, subdirectories: [] }, [])).toEqual({ cells: [], skins: [], rims: [], veil: null });
  });
});

describe("the stack's cards", () => {
  it("shows one, two or three cards under the top one by the files under it", () => {
    expect([1, 4, 5, 16, 17, 900].map(stackEdges)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});
