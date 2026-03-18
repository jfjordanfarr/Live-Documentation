import { describe, expect, it } from "vitest";
import {
  computeSquarifiedLayout,
  type SquarifyItem,
  type SquarifyTile
} from "./squarify";
import type { LayoutRect } from "../layoutUtils";

const viewport: LayoutRect = { x: 0, y: 0, width: 1000, height: 800 };

function item(id: string, weight: number): SquarifyItem {
  return { id, weight };
}

function totalArea(tiles: SquarifyTile[]): number {
  return tiles.reduce((sum, t) => sum + t.rect.width * t.rect.height, 0);
}

function hasOverlap(tiles: SquarifyTile[]): boolean {
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i].rect;
      const b = tiles[j].rect;
      const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
      const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
      // Allow 0.01 tolerance for floating point
      if (overlapX && overlapY) {
        const intersectW = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const intersectH = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        if (intersectW > 0.01 && intersectH > 0.01) {
          return true;
        }
      }
    }
  }
  return false;
}

function maxAspectRatio(tiles: SquarifyTile[]): number {
  return Math.max(...tiles.map(t => {
    const w = t.rect.width;
    const h = t.rect.height;
    return w > h ? w / h : h / w;
  }));
}

describe("computeSquarifiedLayout", () => {
  it("returns empty array for empty input", () => {
    expect(computeSquarifiedLayout([], viewport)).toEqual([]);
  });

  it("fills entire viewport with a single item", () => {
    const tiles = computeSquarifiedLayout([item("a", 10)], viewport);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].rect.x).toBe(0);
    expect(tiles[0].rect.y).toBe(0);
    expect(tiles[0].rect.width).toBe(1000);
    expect(tiles[0].rect.height).toBe(800);
  });

  it("produces tiles with proportional areas", () => {
    const items = [item("a", 3), item("b", 2), item("c", 1)];
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(tiles).toHaveLength(3);

    const areaA = tiles.find(t => t.item.id === "a")!.rect;
    const areaC = tiles.find(t => t.item.id === "c")!.rect;
    // a should be ~3x the area of c
    const ratioAC = (areaA.width * areaA.height) / (areaC.width * areaC.height);
    expect(ratioAC).toBeCloseTo(3, 0);
  });

  it("fills the viewport area completely", () => {
    const items = [item("a", 10), item("b", 5), item("c", 3), item("d", 2)];
    const tiles = computeSquarifiedLayout(items, viewport);
    const total = totalArea(tiles);
    expect(total).toBeCloseTo(viewport.width * viewport.height, -1);
  });

  it("produces no overlapping tiles", () => {
    const items = [
      item("a", 20), item("b", 15), item("c", 10),
      item("d", 8), item("e", 5), item("f", 3)
    ];
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(hasOverlap(tiles)).toBe(false);
  });

  it("all tiles are within viewport bounds", () => {
    const items = [item("a", 10), item("b", 7), item("c", 4), item("d", 1)];
    const tiles = computeSquarifiedLayout(items, viewport);
    for (const tile of tiles) {
      expect(tile.rect.x).toBeGreaterThanOrEqual(viewport.x - 0.01);
      expect(tile.rect.y).toBeGreaterThanOrEqual(viewport.y - 0.01);
      expect(tile.rect.x + tile.rect.width).toBeLessThanOrEqual(viewport.x + viewport.width + 0.01);
      expect(tile.rect.y + tile.rect.height).toBeLessThanOrEqual(viewport.y + viewport.height + 0.01);
    }
  });

  it("produces reasonably square tiles (aspect ratio < 5 for 6 items)", () => {
    const items = [
      item("a", 20), item("b", 15), item("c", 10),
      item("d", 8), item("e", 5), item("f", 3)
    ];
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(maxAspectRatio(tiles)).toBeLessThan(5);
  });

  it("handles equal weights", () => {
    const items = Array.from({ length: 4 }, (_, i) => item(String(i), 10));
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(tiles).toHaveLength(4);
    // All areas should be roughly equal
    const areas = tiles.map(t => t.rect.width * t.rect.height);
    const expectedArea = viewport.width * viewport.height / 4;
    for (const a of areas) {
      expect(a).toBeCloseTo(expectedArea, -1);
    }
  });

  it("filters out zero-weight items", () => {
    const items = [item("a", 10), item("b", 0), item("c", 5)];
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(tiles).toHaveLength(2);
    expect(tiles.find(t => t.item.id === "b")).toBeUndefined();
  });

  it("respects viewport offset", () => {
    const offset: LayoutRect = { x: 100, y: 50, width: 500, height: 400 };
    const tiles = computeSquarifiedLayout([item("a", 5), item("b", 5)], offset);
    for (const tile of tiles) {
      expect(tile.rect.x).toBeGreaterThanOrEqual(100 - 0.01);
      expect(tile.rect.y).toBeGreaterThanOrEqual(50 - 0.01);
    }
  });

  it("handles many items without error", () => {
    const items = Array.from({ length: 50 }, (_, i) => item(`d${i}`, 50 - i));
    const tiles = computeSquarifiedLayout(items, viewport);
    expect(tiles).toHaveLength(50);
    expect(hasOverlap(tiles)).toBe(false);
  });
});
