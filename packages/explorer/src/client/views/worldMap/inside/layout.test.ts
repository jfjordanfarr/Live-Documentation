import { describe, expect, it } from "vitest";

import { CARD_W, GAP, HEAD_H, ROW_H, X0, Y0, layoutInside, pinOf } from "./layout";
import type { InsideModel } from "./model";

const model: InsideModel = {
  thing: "t",
  folder: "t",
  nodes: [
    { kind: "file", id: "t/a.ts", name: "a.ts", sub: "a.ts", rows: [{ name: "A", kind: "class", slug: "symbol-a" }, { name: "b", kind: "function", slug: "symbol-b" }] },
    { kind: "file", id: "t/c.ts", name: "c.ts", sub: "c.ts", rows: [] },
    { kind: "folder", id: "t/box", name: "box", files: ["t/box/x.ts", "t/box/y.ts"] }
  ],
  edges: [
    { from: "t/c.ts", to: "t/a.ts", toSymbol: "symbol-a", count: 1, lines: [] },
    { from: "t/box", to: "t/a.ts", count: 3, lines: [] }
  ],
  walls: [
    { role: "out", counterpart: "lib", count: 2, nodes: [{ id: "t/a.ts", count: 2 }], lines: [] },
    { role: "in", counterpart: "web", count: 1, nodes: [{ id: "t/c.ts", count: 1 }], lines: [] }
  ],
  rank: new Map([["t/a.ts", 0], ["t/c.ts", 1], ["t/box", 1]])
};

describe("layoutInside", () => {
  const layout = layoutInside(model, { width: 1600, height: 900 });

  it("stacks a column's nodes by name and puts providers left of consumers", () => {
    const a = layout.nodes.get("t/a.ts")!;
    const c = layout.nodes.get("t/c.ts")!;
    const box = layout.nodes.get("t/box")!;
    expect(a.y).toBe(Y0);
    expect(a.x).toBeGreaterThanOrEqual(X0);
    expect(layoutInside({ ...model, walls: [{ role: "out", counterpart: "a-long-folder-name/inside", count: 12, nodes: [], lines: [] }] }, { width: 1600, height: 900 }).nodes.get("t/a.ts")!.x).toBeGreaterThan(a.x);
    expect(c.x).toBeGreaterThan(a.x);
    expect(box.x).toBe(c.x);
    expect(box.y).toBe(Y0);
    expect(c.y).toBe(box.y + box.h + GAP);
  });

  it("makes a card as tall as its rows and Internals, and a box as tall as its neighbours", () => {
    expect(layout.nodes.get("t/a.ts")!.h).toBe(HEAD_H + ROW_H * 3 + 2);
    expect(layout.nodes.get("t/a.ts")!.rows).toEqual(["symbol-a", "symbol-b", ""]);
    expect(layout.nodes.get("t/box")!.rows).toEqual(["t/a.ts"]);
    expect(layout.nodes.get("t/c.ts")!.h).toBe(HEAD_H + ROW_H + 2);
  });

  it("places the wall pins down the edges, what the folder calls on the left and what it serves on the right", () => {
    expect(layout.walls.map((wall) => [wall.counterpart, wall.x])).toEqual([["lib", 0], ["web", layout.width]]);
    expect(layout.width).toBeGreaterThanOrEqual(620);
  });

  it("puts a wire's end on the row named, or on the last row, at the side asked for", () => {
    const a = layout.nodes.get("t/a.ts")!;
    expect(pinOf(layout, "t/a.ts", "symbol-b", "out")).toEqual([a.x + CARD_W, a.y + 1 + HEAD_H + ROW_H + ROW_H / 2]);
    expect(pinOf(layout, "t/a.ts", undefined, "in")).toEqual([a.x, a.y + 1 + HEAD_H + ROW_H * 2 + ROW_H / 2]);
    expect(pinOf(layout, "t/box", "t/a.ts", "in")[1]).toBe(layout.nodes.get("t/box")!.y + 1 + HEAD_H + ROW_H / 2);
    expect(pinOf(layout, "nowhere", undefined, "in")).toEqual([0, 0]);
  });
});
