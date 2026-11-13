import { describe, expect, it } from "vitest";

import { REST_ELEVATION, TOP_DOWN, bezierAt, cuboidFaces, depthOf, fitScreen, fromScreen, isTopDown, lookDown, lookUp, pointInPolygon, project, shade, squaredAzimuth, toScreen, unproject, zoomAt } from "./projection";

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

describe("the view from straight above", () => {
  /** The angle a board edge running along x makes with the screen's horizontal, seen from straight above, in (-45°, 45°]. */
  const edgeAngle = (theta: number): number => {
    const camera = { theta, phi: TOP_DOWN };
    const [ax, ay] = project(camera, pivot, 0, 0);
    const [bx, by] = project(camera, pivot, 100, 0);
    const degrees = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    return ((((degrees + 45) % 90) + 90) % 90) - 45;
  };

  it("squares the board to the screen from any azimuth, negative or beyond a full turn, turning it at most an eighth", () => {
    for (const theta of [0.3, -0.3, 1.1, -0.6, 2.9, -2.9, 4, -5, 7, 13.7, -13.7, 100.25]) {
      const squared = squaredAzimuth(theta);
      expect(edgeAngle(squared), `from ${theta}`).toBeCloseTo(0, 9);
      expect(Math.abs(squared - theta), `from ${theta}`).toBeLessThanOrEqual(Math.PI / 4 + 1e-12);
    }
    expect(squaredAzimuth(0.3)).toBeCloseTo(Math.PI / 4, 12);
    expect(squaredAzimuth(-0.3)).toBeCloseTo(-Math.PI / 4, 12);
    expect(squaredAzimuth(-5)).toBeCloseTo(-7 * Math.PI / 4, 12);
    expect(squaredAzimuth(7)).toBeCloseTo(9 * Math.PI / 4, 12);
  });

  it("turns back an eighth from a resting azimuth, as it always did, however the quarter turns were summed", () => {
    for (let quarters = -9; quarters <= 9; quarters += 1) {
      let summed = 0;
      for (let i = 0; i < Math.abs(quarters); i += 1) {
        summed += Math.sign(quarters) * (Math.PI / 2);
      }
      expect(squaredAzimuth(summed), `${quarters} quarter turns`).toBeCloseTo(summed - Math.PI / 4, 12);
      expect(squaredAzimuth(quarters * (Math.PI / 2))).toBeCloseTo(quarters * (Math.PI / 2) - Math.PI / 4, 12);
    }
  });

  it("leaves a squared view unchanged", () => {
    for (const squared of [Math.PI / 4, -Math.PI / 4, 3 * Math.PI / 4, -9 * Math.PI / 4]) {
      expect(squaredAzimuth(squared)).toBeCloseTo(squared, 12);
    }
  });

  it("looks down squared, and back up to where it looked down from when the camera has not turned", () => {
    const from = { theta: -0.6, phi: 0.9 };
    const above = lookDown(from);
    expect(above).toEqual({ theta: squaredAzimuth(-0.6), phi: TOP_DOWN });
    expect(lookUp(above, { from, above })).toEqual(from);
  });

  it("goes on an eighth turn to the resting elevation when the camera turned above, or nothing is known of how it got there", () => {
    const from = { theta: 0, phi: REST_ELEVATION };
    const above = lookDown(from);
    const turned = { theta: above.theta + Math.PI / 2, phi: TOP_DOWN };
    const up = lookUp(turned, { from, above });
    expect(up.theta).toBeCloseTo(Math.PI / 2, 12);
    expect(up.phi).toBe(REST_ELEVATION);
    expect(lookUp(above)).toEqual({ theta: above.theta + Math.PI / 4, phi: REST_ELEVATION });
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
