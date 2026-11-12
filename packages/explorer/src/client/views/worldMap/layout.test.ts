import { describe, expect, it } from "vitest";

import { autoPlace, corners, coveredArea, drawOrder, inRect, labelAnchor, labelMoves, panelBeside, pixelsToUnits, placePiece, rectAround, roadCurve, silhouette, solidFor, spanWithin, spreadTokens, unitsToPixels, wallOf, wallPoint } from "./layout";
import { REST_ELEVATION, TOP_DOWN, pointInPolygon, project, ring, type Point2 } from "./projection";

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

describe("outlines and labels", () => {
  const pivot = { x: 0, y: 0 };
  const degrees = (value: number): number => (value * Math.PI) / 180;
  /** Every point a piece's faces are drawn through, on the picture plane. */
  const drawnPoints = (camera: { theta: number; phi: number }, piece: ReturnType<typeof placePiece>): Point2[] =>
    [piece.z0, piece.z0 + piece.h].flatMap((z) => (piece.form === "tank"
      ? ring(piece.cx, piece.cy, piece.r, z, 40).map((p) => project(camera, pivot, p[0], p[1], p[2]))
      : corners(piece).map(([x, y]) => project(camera, pivot, x, y, z))));
  const inOrOn = (polygon: Point2[], point: Point2): boolean =>
    pointInPolygon(polygon, point) || polygon.some((p) => Math.hypot(p[0] - point[0], p[1] - point[1]) < 1e-9);

  it("draws a cube at rest as a hexagon holding every corner, and seen from above as its lid", () => {
    const cube = placePiece("a", "cube", [100, 50]);
    const rest = { theta: 0.3, phi: REST_ELEVATION };
    const outline = silhouette(rest, pivot, cube);
    expect(outline).toHaveLength(6);
    for (const point of drawnPoints(rest, cube)) {
      expect(inOrOn(outline, point)).toBe(true);
    }
    // Straight down, the top and bottom corners coincide but for rounding: the outline is the lid.
    const down = { theta: 0, phi: TOP_DOWN };
    const lid = corners(cube).map(([x, y]) => project(down, pivot, x, y, cube.z0 + cube.h));
    for (const point of silhouette(down, pivot, cube)) {
      expect(lid.some((corner) => Math.hypot(corner[0] - point[0], corner[1] - point[1]) < 1e-6)).toBe(true);
    }
  });

  it("holds both rims of a drum", () => {
    const drum = placePiece("db", "drum", [0, 0]);
    const camera = { theta: 0, phi: REST_ELEVATION };
    const outline = silhouette(camera, pivot, drum);
    for (const point of drawnPoints(camera, drum)) {
      expect(inOrOn(outline, point)).toBe(true);
    }
  });

  it("stands a label over the piece's middle, above its whole outline, from every side and height", () => {
    for (const shape of ["cube", "tile", "sheet", "figure", "drum", "cloud"] as const) {
      const piece = placePiece("p", shape, [240, -60]);
      for (let azimuth = 0; azimuth < 360; azimuth += 15) {
        for (const elevation of [8, 20, 30, 42, 60, 90]) {
          const camera = { theta: degrees(azimuth), phi: degrees(elevation) };
          const [x, y] = labelAnchor(camera, pivot, piece);
          expect(x).toBeCloseTo(project(camera, pivot, piece.cx, piece.cy, piece.z0)[0], 9);
          for (const point of drawnPoints(camera, piece)) {
            expect(point[1]).toBeGreaterThanOrEqual(y - 1e-9);
          }
        }
      }
    }
  });

  it("stands a label higher than the middle of the lid, where it stood before and the lid's edges struck through it", () => {
    const cube = placePiece("a", "cube", [0, 0]);
    const camera = { theta: 0, phi: REST_ELEVATION };
    const lidMiddle = project(camera, pivot, cube.cx, cube.cy, cube.z0 + cube.h);
    // The lid's far corner is half the lid's diagonal, 42√2, behind its middle, foreshortened by the elevation.
    expect(labelAnchor(camera, pivot, cube)[1]).toBeCloseTo(lidMiddle[1] - 42 * Math.SQRT2 * Math.sin(REST_ELEVATION), 6);
  });
});

describe("a label's moves", () => {
  it("tries staying put first, then a quarter aside or a line up, then farther, left before right", () => {
    const moves = labelMoves([0, -14, -28], [0, -0.25, 0.25, -0.5, 0.5]).map((move) => [move.rise, move.shift]);
    expect(moves.slice(0, 5)).toEqual([[0, 0], [0, -0.25], [0, 0.25], [-14, 0], [-14, -0.25]]);
    expect(moves).toHaveLength(15);
    expect(moves[moves.length - 1]).toEqual([-28, 0.5]);
  });
});

describe("covered area", () => {
  const box = { left: 0, top: 0, right: 20, bottom: 10 };

  it("is the polygon's area when the polygon lies inside the box, and the box's when the box lies inside it", () => {
    expect(coveredArea(box, [[2, 2], [6, 2], [6, 6], [2, 6]])).toBeCloseTo(16, 9);
    expect(coveredArea(box, [[-10, -10], [40, -10], [40, 40], [-10, 40]])).toBeCloseTo(200, 9);
  });

  it("counts only the part inside, and nothing for a polygon apart or for an empty box", () => {
    expect(coveredArea(box, [[10, -5], [30, -5], [30, 20], [10, 20]])).toBeCloseTo(100, 9);
    // A diamond about the box's right edge: half of it inside.
    expect(coveredArea(box, [[20, 0], [25, 5], [20, 10], [15, 5]])).toBeCloseTo(25, 9);
    expect(coveredArea(box, [[30, 0], [40, 0], [40, 10], [30, 10]])).toBe(0);
    expect(coveredArea({ left: 5, top: 5, right: 5, bottom: 9 }, [[0, 0], [10, 0], [10, 10], [0, 10]])).toBe(0);
  });
});

describe("how far a shape reaches within a band", () => {
  // A diamond: corners at (50, 0), (100, 25), (50, 50) and (0, 25).
  const diamond: Point2[] = [[50, 0], [100, 25], [50, 50], [0, 25]];

  it("is the widest reach inside the band, and nothing for a band the shape does not reach", () => {
    expect(spanWithin(diamond, 20, 30)).toEqual([0, 100]);
    const [left, right] = spanWithin(diamond, 0, 10)!;
    expect(left).toBeCloseTo(30, 9);
    expect(right).toBeCloseTo(70, 9);
    expect(spanWithin(diamond, 60, 70)).toBeUndefined();
  });
});

describe("a panel beside its subject", () => {
  const room = { left: 0, top: 50, right: 1000, bottom: 800 };
  const size = { width: 300, height: 200 };
  const covers = (at: { left: number; top: number }, box: { left: number; top: number; right: number; bottom: number }): boolean =>
    at.left < box.right && at.left + size.width > box.left && at.top < box.bottom && at.top + size.height > box.top;

  it("stands to the right of its subject, level with its top, when there is room", () => {
    const subject = { left: 200, top: 300, right: 280, bottom: 380 };
    expect(panelBeside(subject, size, room)).toEqual({ left: 294, top: 300 });
  });

  it("stands to the left of a subject at the right edge, and below one as wide as the room", () => {
    const right = { left: 900, top: 300, right: 980, bottom: 380 };
    const left = panelBeside(right, size, room);
    expect(left).toEqual({ left: 586, top: 300 });
    const wide = { left: 0, top: 100, right: 1000, bottom: 200 };
    expect(panelBeside(wide, size, room)).toEqual({ left: 0, top: 214 });
  });

  it("stays inside the room, and never on its subject while any side is free", () => {
    const low = { left: 400, top: 760, right: 480, bottom: 790 };
    const at = panelBeside(low, size, room);
    expect(at.top + size.height).toBeLessThanOrEqual(room.bottom);
    expect(at.top).toBeGreaterThanOrEqual(room.top);
    expect(covers(at, low)).toBe(false);
  });

  it("stands below and level with the subject's right edge when the room beside, above and below its left edge is taken", () => {
    const subject = { left: 600, top: 300, right: 680, bottom: 380 };
    // A chain going on below and to the right, neighbours up and to the left, and more above.
    const chain = [{ left: 690, top: 360, right: 1000, bottom: 800 }, { left: 0, top: 50, right: 590, bottom: 380 }, { left: 590, top: 50, right: 1000, bottom: 300 }];
    const at = panelBeside(subject, size, room, chain.map((box) => ({ box, weight: 1 })));
    expect(at).toEqual({ left: 380, top: 394 });
  });

  it("takes the side that covers less of what it is asked to avoid", () => {
    const subject = { left: 450, top: 300, right: 530, bottom: 380 };
    const neighbour = { left: 560, top: 320, right: 640, bottom: 400 };
    const at = panelBeside(subject, size, room, [{ box: neighbour, weight: 1 }]);
    expect(covers(at, neighbour)).toBe(false);
    expect(covers(at, subject)).toBe(false);
    expect(at.left + size.width).toBeLessThanOrEqual(subject.left);
  });
});
