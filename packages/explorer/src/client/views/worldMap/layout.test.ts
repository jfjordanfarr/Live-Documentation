import { describe, expect, it } from "vitest";

import { autoPlace, drawOrder, inRect, pixelsToUnits, placePiece, rectAround, roadCurve, solidFor, spreadTokens, unitsToPixels, wallOf, wallPoint } from "./layout";
import { REST_ELEVATION, TOP_DOWN } from "./projection";

describe("solids and placement", () => {
  it("gives every shape word a solid, the tile flat and the drum round", () => {
    expect(solidFor("cube")).toMatchObject({ form: "block", w: 84, h: 84 });
    expect(solidFor("tile").h).toBeLessThan(solidFor("cube").h);
    expect(solidFor("drum")).toMatchObject({ form: "tank", r: 40 });
    expect(solidFor("figure").h).toBeGreaterThan(solidFor("figure").w);
  });

  it("places a piece around its centre, floating, and higher while dragged", () => {
    const piece = placePiece("portal", "cube", [300, 200]);
    expect(piece).toMatchObject({ cx: 300, cy: 200, x: 258, y: 158, w: 84, d: 84, z0: 46 });
    expect(placePiece("portal", "cube", [300, 200], true).z0).toBeGreaterThan(piece.z0);
  });

  it("converts board units to pixels and back, rounding to two decimals", () => {
    expect(unitsToPixels([2, 1.5])).toEqual([120, 90]);
    expect(pixelsToUnits([121, 90])).toEqual([2.02, 1.5]);
  });

  it("wraps a padded rectangle around rectangles and none around nothing", () => {
    expect(rectAround([{ x: 10, y: 10, w: 20, d: 20 }, { x: 50, y: 5, w: 10, d: 10 }], 5)).toEqual({ x: 5, y: 0, w: 60, d: 35 });
    expect(rectAround([], 5)).toBeUndefined();
    expect(inRect({ x: 0, y: 0, w: 10, d: 10 }, [5, 5])).toBe(true);
    expect(inRect({ x: 0, y: 0, w: 10, d: 10 }, [15, 5])).toBe(false);
  });

  it("places unplaced things in rows below what is placed, a region's members together", () => {
    const positions = autoPlace([{ names: ["a", "b", "c", "d", "e"] }, { names: ["f"] }], [[1, 1], [4, 1]], 4, 3);
    expect(positions.get("a")).toEqual([1, 5]);
    expect(positions.get("d")).toEqual([10, 5]);
    expect(positions.get("e")).toEqual([1, 8]);
    expect(positions.get("f")).toEqual([1, 12]);
    expect(autoPlace([{ names: ["x"] }], [])).toEqual(new Map([["x", [1, 1]]]));
  });
});

describe("doors and wires", () => {
  const camera = { theta: 0, phi: REST_ELEVATION };

  it("puts a door on the wall that faces the counterpart among the walls the viewer sees", () => {
    const piece = placePiece("a", "cube", [0, 0]);
    expect(wallOf(camera, piece, [500, 0])).toBe("E");
    expect(wallOf(camera, piece, [0, 500])).toBe("S");
    expect(wallOf({ theta: 0, phi: TOP_DOWN }, piece, [-500, 0])).toBe("W");
  });

  it("sits the door at mid-height at a fraction along the wall, pointing outward", () => {
    const piece = placePiece("a", "cube", [0, 0]);
    const anchor = wallPoint(camera, piece, "E", [500, 0], 0.5);
    expect(anchor.p).toEqual([42, 0, 46 + 42]);
    expect(anchor.out).toEqual([1, 0]);
    const drum = placePiece("db", "drum", [0, 0]);
    const rim = wallPoint(camera, drum, "E", [500, 0], 0.5);
    expect(Math.hypot(rim.p[0], rim.p[1])).toBeCloseTo(40, 6);
  });

  it("hangs a wire between two doors, leaving each along its outward direction", () => {
    const from = { p: [0, 0, 88] as [number, number, number], out: [1, 0] as [number, number] };
    const to = { p: [400, 0, 88] as [number, number, number], out: [-1, 0] as [number, number] };
    const curve = roadCurve(from, to);
    expect(curve[0]).toEqual(from.p);
    expect(curve[3]).toEqual(to.p);
    expect(curve[1][0]).toBeGreaterThan(0);
    expect(curve[2][0]).toBeLessThan(400);
    expect(curve[1][2]).toBeLessThan(88);
  });

  it("draws far pieces first", () => {
    const near = placePiece("near", "cube", [900, 900]);
    const far = placePiece("far", "cube", [100, 100]);
    expect(drawOrder(camera, { x: 500, y: 500 }, [near, far]).map((piece) => piece.name)).toEqual(["far", "near"]);
  });

  it("spreads tokens clear of pieces and of each other, inside the board", () => {
    const bounds = { x: 0, y: 0, w: 1000, d: 1400 };
    const tokens = spreadTokens([[500, 400], [500, 400]], [[500, 400]], 150, 200, bounds);
    expect(tokens).toHaveLength(2);
    for (const [x, y] of tokens) {
      expect(Math.hypot(x - 500, y - 400)).toBeGreaterThanOrEqual(199);
      expect(x).toBeGreaterThanOrEqual(60);
      expect(y).toBeLessThanOrEqual(1340);
    }
    expect(Math.hypot(tokens[0][0] - tokens[1][0], tokens[0][1] - tokens[1][1])).toBeGreaterThanOrEqual(149);
  });
});
