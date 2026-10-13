import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { focusedCameraPosition, screenAnchorTranslation, wheelZoomCamera } from "./forceGraphCamera";

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

describe("wheel zoom", () => {
  it("approaches and recedes from an off-axis inspected point without moving its projection", () => {
    const camera = new PerspectiveCamera(60, 1.6, .1, 100000);
    camera.position.set(40, 20, 180);
    const target = new Vector3(0, -10, 0), point = new Vector3(15, 5, -20);
    camera.lookAt(target); camera.updateMatrixWorld();
    const before = point.clone().project(camera);
    for (const delta of [-120, 120]) {
      const oldDistance = camera.position.distanceTo(point);
      const next = wheelZoomCamera(camera.position, target, point, delta);
      camera.position.copy(next.camera); target.copy(next.target);
      camera.lookAt(target); camera.updateMatrixWorld();
      const screen = point.clone().project(camera);
      expect(screen.x).toBeCloseTo(before.x, 10);
      expect(screen.y).toBeCloseTo(before.y, 10);
      expect(Math.sign(camera.position.distanceTo(point) - oldDistance)).toBe(Math.sign(delta));
    }
  });

  it("does not reverse a wheel gesture when another camera operation crossed a limit", () => {
    const origin = { x: 0, y: 0, z: 0 };
    expect(wheelZoomCamera({ x: 0, y: 0, z: 30 }, origin, origin, -120).camera.z).toBe(30);
    expect(wheelZoomCamera({ x: 0, y: 0, z: 30 }, origin, origin, 120).camera.z).toBeGreaterThan(30);
    expect(wheelZoomCamera({ x: 0, y: 0, z: 30000 }, origin, origin, 120).camera.z).toBe(30000);
    expect(wheelZoomCamera({ x: 0, y: 0, z: 30000 }, origin, origin, -120).camera.z).toBeLessThan(30000);
    expect(wheelZoomCamera(origin, origin, origin, -120)).toEqual({ camera: origin, target: origin });
  });
});


describe("perspective screen anchors", () => {
  it.each([{ x: 0.15, y: 0.25 }, { x: 0.8, y: 0.7 }, { x: 0.5, y: 0.5 }])("keeps an off-axis subject at %j without changing the viewing direction", anchor => {
    const camera = new PerspectiveCamera(60, 1.6, 0.1, 10000);
    const target = new Vector3(15, -25, 8);
    const subject = new Vector3(-8, 13, -50);
    camera.position.set(80, 60, 180);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const bearing = camera.getWorldDirection(new Vector3());
    const offset = screenAnchorTranslation(camera, subject, anchor);
    camera.position.add(offset);
    target.add(offset);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const projected = subject.clone().project(camera);
    expect((projected.x + 1) / 2).toBeCloseTo(anchor.x, 10);
    expect((1 - projected.y) / 2).toBeCloseTo(anchor.y, 10);
    expect(camera.getWorldDirection(new Vector3()).distanceTo(bearing)).toBeLessThan(1e-12);
  });
});
