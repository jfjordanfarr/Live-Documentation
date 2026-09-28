import { describe, expect, it } from "vitest";

import { REST_ELEVATION, TOP_DOWN, bezierAt, cuboidFaces, depthOf, fitScreen, fromScreen, isTopDown, pointInPolygon, project, shade, toScreen, unproject, zoomAt } from "./projection";

const pivot = { x: 700, y: 450 };

describe("the camera", () => {
  it("projects and unprojects a board point through any azimuth and elevation", () => {
    for (const theta of [0, 0.7, Math.PI / 2, -2.1]) {
      for (const phi of [REST_ELEVATION, 0.9, TOP_DOWN]) {
        const camera = { theta, phi };
        const [px, py] = project(camera, pivot, 300, 620);
        const [x, y] = unproject(camera, pivot, px, py);
        expect(x).toBeCloseTo(300, 6);
        expect(y).toBeCloseTo(620, 6);
      }
    }
  });

  it("raises a point on the picture as it rises off the board, and never when seen from straight above", () => {
    const camera = { theta: 0, phi: REST_ELEVATION };
    expect(project(camera, pivot, 100, 100, 40)[1]).toBeLessThan(project(camera, pivot, 100, 100, 0)[1]);
    expect(project({ theta: 0, phi: TOP_DOWN }, pivot, 100, 100, 40)[1]).toBeCloseTo(project({ theta: 0, phi: TOP_DOWN }, pivot, 100, 100, 0)[1], 9);
  });

  it("ranks what is nearer the viewer as deeper, so it draws later", () => {
    const camera = { theta: 0, phi: REST_ELEVATION };
    expect(depthOf(camera, pivot, 900, 900)).toBeGreaterThan(depthOf(camera, pivot, 100, 100));
    expect(depthOf(camera, pivot, 100, 100, 50)).toBeGreaterThan(depthOf(camera, pivot, 100, 100, 0));
  });

  it("fits the board's corners into the viewport with room around them", () => {
    const camera = { theta: 0, phi: REST_ELEVATION };
    const corners: [number, number][] = [[0, 0], [1400, 0], [1400, 900], [0, 900]];
    const screen = fitScreen(camera, pivot, corners, { width: 1600, height: 900 });
    const onScreen = corners.map(([x, y]) => toScreen(screen, project(camera, pivot, x, y)));
    for (const [sx, sy] of onScreen) {
      expect(sx).toBeGreaterThanOrEqual(49);
      expect(sx).toBeLessThanOrEqual(1551);
      expect(sy).toBeGreaterThanOrEqual(49);
      expect(sy).toBeLessThanOrEqual(851);
    }
  });

  it("zooms about the point under the pointer, keeping it still, within limits", () => {
    const screen = { x: 100, y: 50, k: 1 };
    const zoomed = zoomAt(screen, 2, 400, 300);
    expect(fromScreen(zoomed, 400, 300)).toEqual(fromScreen(screen, 400, 300));
    expect(zoomAt(screen, 100, 0, 0).k).toBe(12);
    expect(zoomAt(screen, 0.001, 0, 0).k).toBe(0.2);
  });

  it("knows top-down", () => {
    expect(isTopDown({ theta: 1, phi: TOP_DOWN })).toBe(true);
    expect(isTopDown({ theta: 1, phi: REST_ELEVATION })).toBe(false);
  });
});

describe("solids", () => {
  it("lights the top brightest, the underside darkest, and the walls in between", () => {
    const camera = { theta: 0, phi: REST_ELEVATION };
    expect(shade(camera, [0, 0, 1])).toBe(1);
    expect(shade(camera, [0, 0, -1])).toBe(0.15);
    const wall = shade(camera, [1, 0, 0]);
    expect(wall).toBeGreaterThan(0.15);
    expect(wall).toBeLessThan(1);
  });

  it("orders a box's faces far to near, with the top last from above", () => {
    const camera = { theta: 0, phi: 1.2 };
    const faces = cuboidFaces(camera, pivot, { x: 100, y: 100, w: 80, d: 80, z0: 40, h: 80 });
    expect(faces).toHaveLength(6);
    for (let i = 1; i < faces.length; i += 1) {
      expect(faces[i].depth).toBeGreaterThanOrEqual(faces[i - 1].depth);
    }
    expect(faces[faces.length - 1].normal).toEqual([0, 0, 1]);
  });
});

describe("curves and polygons", () => {
  it("runs a Bezier from its first point to its last", () => {
    const curve: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [[0, 0, 0], [10, 0, 5], [20, 10, 5], [30, 10, 0]];
    expect(bezierAt(curve, 0)).toEqual([0, 0, 0]);
    expect(bezierAt(curve, 1)).toEqual([30, 10, 0]);
    expect(bezierAt(curve, 0.5)[2]).toBeGreaterThan(0);
  });

  it("tells inside from outside a polygon", () => {
    const square: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10]];
    expect(pointInPolygon(square, [5, 5])).toBe(true);
    expect(pointInPolygon(square, [15, 5])).toBe(false);
  });
});
