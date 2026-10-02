import { describe, expect, it } from "vitest";

import { focusedCameraPosition } from "./forceGraphCamera";

describe("Force Graph focus camera", () => {
  it("preserves the viewing direction relative to a panned target", () => {
    const camera = { x: 80, y: -10, z: 130 };
    const target = { x: 50, y: -50, z: 130 };
    const node = { x: -200, y: 75, z: -60 };
    const result = focusedCameraPosition(camera, target, node, 100);
    expect(result).toEqual({ x: -140, y: 155, z: -60 });
    expect(Math.hypot(result.x - node.x, result.y - node.y, result.z - node.z)).toBeCloseTo(100);
  });

  it("focuses the origin and a node on the opposite side without dividing by node distance", () => {
    const camera = { x: 0, y: 0, z: -600 };
    const target = { x: 0, y: 0, z: 0 };
    expect(focusedCameraPosition(camera, target, target)).toEqual({ x: 0, y: 0, z: -140 });
    expect(focusedCameraPosition(camera, target, { x: 30, y: -20, z: 500 })).toEqual({ x: 30, y: -20, z: 360 });
  });

  it("has a finite fallback when the camera coincides with its target", () => {
    const point = { x: 10, y: 20, z: 30 };
    expect(focusedCameraPosition(point, point, { x: -1, y: -2, z: -3 })).toEqual({ x: -1, y: -2, z: 137 });
  });
});
