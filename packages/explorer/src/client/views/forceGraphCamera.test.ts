import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { cornerPanelInsets, focusedCameraPosition, frameCameraSpheres, screenAnchorTranslation, wheelZoomCamera } from "./forceGraphCamera";

describe("Force Graph focus camera", () => {
  it.each([
    { left: 0, right: 400, top: 0, bottom: 90 },
    { left: 400, right: 0, top: 0, bottom: 90 },
    { left: 200, right: 100, top: 0, bottom: 140 },
    { left: 0, right: 0, top: 130, bottom: 100 },
    { left: 0, right: 300, top: 127, bottom: 95 }
  ])("fits complete bodies into the uncovered rectangle %j without changing bearing", insets => {
    const camera = new PerspectiveCamera(60, 800 / 600, .1, 100000);
    camera.position.set(70, 90, 200); camera.lookAt(30, 20, 10); camera.updateMatrixWorld();
    const bearing = camera.getWorldDirection(new Vector3());
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const back = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    const spheres = [{ center: { x: 900, y: -800, z: 450 }, radius: 40 }, { center: { x: 300, y: 500, z: -1200 }, radius: 80 }];
    const framed = frameCameraSpheres(camera, spheres, { width: 800, height: 600, insets }, 40)!;
    camera.position.copy(framed.camera); camera.lookAt(framed.target.x, framed.target.y, framed.target.z); camera.updateMatrixWorld();
    expect(camera.getWorldDirection(new Vector3()).distanceTo(bearing)).toBeLessThan(1e-12);
    for (const sphere of spheres) for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      const point = new Vector3(sphere.center.x, sphere.center.y, sphere.center.z)
        .addScaledVector(right, x * sphere.radius).addScaledVector(up, y * sphere.radius).addScaledVector(back, z * sphere.radius).project(camera);
      const px = (point.x + 1) * 400, py = (1 - point.y) * 300;
      expect(px).toBeGreaterThanOrEqual(insets.left + 40 - 1e-8);
      expect(px).toBeLessThanOrEqual(800 - insets.right - 40 + 1e-8);
      expect(py).toBeGreaterThanOrEqual(insets.top + 40 - 1e-8);
      expect(py).toBeLessThanOrEqual(600 - insets.bottom - 40 + 1e-8);
    }
  });

  it("keeps the requested subject centered while fitting asymmetric neighbours and a large sphere", () => {
    const camera = new PerspectiveCamera(60, 1.6, .1, 100000);
    camera.position.set(30, 80, 300);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const subject = { x: 400, y: -100, z: 200 };
    const spheres = [{ center: subject, radius: 400 }, { center: { x: 1900, y: 200, z: -800 }, radius: 20 }];
    const framing = frameCameraSpheres(camera, spheres, { width: 1280, height: 800 }, 100, subject)!;
    expect(framing.target).toMatchObject(subject);
    camera.position.copy(framing.camera);
    camera.lookAt(subject.x, subject.y, subject.z);
    camera.updateMatrixWorld();
    const point = new Vector3(subject.x, subject.y, subject.z).project(camera);
    expect(point.x).toBeCloseTo(0, 10);
    expect(point.y).toBeCloseTo(0, 10);
    for (const sphere of spheres) {
      const center = new Vector3(sphere.center.x, sphere.center.y, sphere.center.z).project(camera);
      expect(Math.abs(center.x)).toBeLessThan(1 - 200 / 1280);
      expect(Math.abs(center.y)).toBeLessThan(1 - 200 / 800);
      expect(center.z).toBeGreaterThan(-1);
      expect(center.z).toBeLessThan(1);
    }
  });
  it("frames members far from the origin, with a tilted camera and clearance for their complete bodies", () => {
    const camera = new PerspectiveCamera(60, 1.6, .1, 100000);
    camera.position.set(70, 90, 200);
    camera.lookAt(new Vector3(30, 20, 10));
    camera.updateMatrixWorld();
    const bearing = camera.getWorldDirection(new Vector3());
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const back = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    const spheres = [
      { center: { x: 900, y: -800, z: 450 }, radius: 40 },
      { center: { x: 1040, y: -730, z: 620 }, radius: 5 }
    ];
    const framed = frameCameraSpheres(camera, spheres, { width: 1600, height: 1000 })!;
    expect(framed.target.x).toBeGreaterThan(900);
    expect(framed.target.y).toBeLessThan(-700);
    camera.position.copy(framed.camera);
    camera.lookAt(framed.target.x, framed.target.y, framed.target.z);
    camera.updateMatrixWorld();
    expect(camera.getWorldDirection(new Vector3()).distanceTo(bearing)).toBeLessThan(1e-12);
    for (const sphere of spheres) {
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
        const point = new Vector3(sphere.center.x, sphere.center.y, sphere.center.z)
          .addScaledVector(right, x * sphere.radius)
          .addScaledVector(up, y * sphere.radius)
          .addScaledVector(back, z * sphere.radius)
          .project(camera);
        expect(Math.abs(point.x)).toBeLessThanOrEqual(1 - 140 / 1600 + 1e-12);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(1 - 140 / 1000 + 1e-12);
        expect(point.z).toBeGreaterThan(-1);
        expect(point.z).toBeLessThan(1);
      }
    }
    expect(frameCameraSpheres(camera, [], { width: 1600, height: 1000 })).toBeNull();
  });
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

describe("a panel in the picture's top left corner", () => {
  it("frames the picture beside the panel while 320 px of width remain there, and below it where they do not", () => {
    // The compact step panel at 1440 by 960, 408 px across and 127 down: beside it, as the tall panel always was.
    expect(cornerPanelInsets({ width: 1179, height: 815 }, { right: 408, bottom: 127 })).toEqual({ left: 408, top: 0 });
    // Exactly 320 px remain beside it: still beside; one pixel fewer: below.
    expect(cornerPanelInsets({ width: 728, height: 815 }, { right: 408, bottom: 127 })).toEqual({ left: 408, top: 0 });
    expect(cornerPanelInsets({ width: 727, height: 815 }, { right: 408, bottom: 127 })).toEqual({ left: 0, top: 127 });
    // The column a docked reader leaves at 1000 px, 379 px wide with the panel 363 across: below.
    expect(cornerPanelInsets({ width: 379, height: 700 }, { right: 363, bottom: 109 })).toEqual({ left: 0, top: 109 });
  });

  it("takes nothing for a panel outside the room, never more than the room, and honours another least width", () => {
    expect(cornerPanelInsets({ width: 800, height: 600 }, { right: -20, bottom: -5 })).toEqual({ left: 0, top: 0 });
    expect(cornerPanelInsets({ width: 300, height: 600 }, { right: 900, bottom: 700 })).toEqual({ left: 0, top: 600 });
    expect(cornerPanelInsets({ width: 800, height: 600 }, { right: 400, bottom: 90 }, 500)).toEqual({ left: 0, top: 90 });
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
