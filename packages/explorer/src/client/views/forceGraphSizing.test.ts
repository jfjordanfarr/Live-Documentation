import { Matrix4, OrthographicCamera, PerspectiveCamera, Raycaster, Vector2, Vector3, Vector4 } from "three";
import { describe, expect, it } from "vitest";

import { clipSpatialWireDepth, pickSpatialWire, pixelsPerWorldUnit, spatialSizeScale } from "./forceGraphSizing";

const camera = new PerspectiveCamera(90, 1, 1, 10000);
camera.updateMatrixWorld();
const viewport = new Vector2(1000, 1000);
const wire = (a: Vector3, b: Vector3): Matrix4 => new Matrix4().lookAt(b, a, new Vector3(0, 1, 0))
  .scale(new Vector3(1, 1, a.distanceTo(b))).setPosition(a);

describe("zoom resistance", () => {
  it("preserves perspective at zero, softens it continuously, and holds CSS size at one", () => {
    for (const [resistance, ratio] of [[0, 4], [.5, 2], [1, 1]]) {
      const radii = [100, 400, 1600].map(depth => {
        const point = new Vector3(0, 0, -depth);
        return 4 * spatialSizeScale(point, camera, 1000, resistance) * pixelsPerWorldUnit(point, camera, 1000);
      });
      expect(radii[0] / radii[1]).toBeCloseTo(ratio, 10);
      expect(radii[1] / radii[2]).toBeCloseTo(ratio, 10);
      if (resistance === 1) for (const radius of radii) expect(radius).toBeCloseTo(4, 10);
    }
    expect(spatialSizeScale(new Vector3(0, 0, 0), camera, 1000, 1)).toBe(1);
    expect(spatialSizeScale(new Vector3(0, 0, 10), camera, 1000, .5)).toBe(1);
  });

  it("uses camera depth after an orbit and preserves size ratios and viewport units", () => {
    const moved = camera.clone(); moved.position.set(500, 0, 0); moved.lookAt(0, 0, 0); moved.updateMatrixWorld();
    expect(pixelsPerWorldUnit(new Vector3(), moved, 1000)).toBeCloseTo(1, 10);
    const point = new Vector3(0, 0, -2000);
    const scale = spatialSizeScale(point, camera, 1000, .5);
    expect(scale).toBeCloseTo(2, 10);
    expect(spatialSizeScale(point, camera, 2000, 1)).toBeCloseTo(2, 10);
    expect((12 * scale) / (4 * scale)).toBe(3);
  });

  it("uses orthographic zoom without making sizing depend on depth", () => {
    const ortho = new OrthographicCamera(-1000, 1000, 1000, -1000, 1, 10000);
    ortho.zoom = 2; ortho.updateProjectionMatrix(); ortho.updateMatrixWorld();
    for (const depth of [10, 100, 1000]) {
      expect(pixelsPerWorldUnit(new Vector3(0, 0, -depth), ortho, 1000)).toBeCloseTo(1, 10);
      expect(spatialSizeScale(new Vector3(0, 0, -depth), ortho, 1000, .5)).toBeCloseTo(1, 10);
    }
  });
});

describe("wire depth clipping", () => {
  it("returns the visible portion when one segment crosses both clip planes", () => {
    const from = new Vector4(-10, 0, 20, 1).applyMatrix4(camera.projectionMatrix);
    const to = new Vector4(10, 0, -20000, 1).applyMatrix4(camera.projectionMatrix);
    const interval = clipSpatialWireDepth(from, to)!;
    expect(interval.low).toBeCloseTo(21 / 20020, 10);
    expect(interval.high).toBeCloseTo(10020 / 20020, 10);
    expect(from.z / from.w).toBeCloseTo(-1, 10);
    expect(to.z / to.w).toBeCloseTo(1, 10);
    expect(from.w).toBeCloseTo(1, 10);
    expect(to.w).toBeCloseTo(10000, 7);
  });
});

describe("projected wire picking", () => {
  const cast = (matrix: Matrix4, x: number, y: number, resistance: number) => {
    const raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(x / 500, y / 500), camera);
    return pickSpatialWire(matrix, camera, viewport, 4, resistance, raycaster.ray);
  };
  it("hits the stroke's real width at each resistance, with round end caps", () => {
    const matrix = wire(new Vector3(-200, 0, -2000), new Vector3(200, 0, -2000));
    expect(cast(matrix, 0, .7, 0)).toBeNull(); // One-pixel diameter at this depth.
    expect(cast(matrix, 0, .7, .5)).not.toBeNull(); // Two-pixel diameter.
    expect(cast(matrix, 0, 1.4, .5)).toBeNull();
    expect(cast(matrix, 0, 1.4, 1)).not.toBeNull(); // Four-pixel diameter.
    expect(cast(matrix, 51.5, 0, 1)).not.toBeNull();
    expect(cast(matrix, 52.5, 0, 1)).toBeNull();
    expect(cast(matrix, 51.5, 1.5, 1)).toBeNull();
  });

  it("handles taper, end-on wires, near-plane crossings, and wires outside the depth interval", () => {
    const taper = wire(new Vector3(-100, 0, -500), new Vector3(400, 0, -2000));
    expect(cast(taper, -90, 1.5, 0)).not.toBeNull();
    expect(cast(taper, 90, 1.5, 0)).toBeNull();
    expect(cast(taper, 90, 1.5, 1)).not.toBeNull();
    expect(cast(wire(new Vector3(0, 0, -10), new Vector3(0, 0, -100)), 1, 0, 1)).not.toBeNull();
    expect(cast(wire(new Vector3(0, 0, 10), new Vector3(0, 0, -100)), 0, 0, 1)).not.toBeNull();
    expect(cast(wire(new Vector3(-10, 0, 10), new Vector3(10, 0, 100)), 0, 0, 1)).toBeNull();
    expect(cast(wire(new Vector3(-10, 0, -11000), new Vector3(10, 0, -12000)), 0, 0, 1)).toBeNull();
  });

  it("picks an end-on wire's nearer cap regardless of edge direction", () => {
    for (const endpoints of [[-500, -2000], [-2000, -500]]) {
      const matrix = wire(new Vector3(0, 0, endpoints[0]), new Vector3(0, 0, endpoints[1]));
      const hit = cast(matrix, 1.5, 0, 0)!;
      expect(hit).not.toBeNull();
      expect(hit.point.z).toBeCloseTo(-500, 8);
      expect(hit.pointOnLine.z).toBeCloseTo(-500, 8);
      expect(cast(matrix, 2.5, 0, 0)).toBeNull();
    }
  });

  it("uses rendered depth for an oblique stroke instead of a nearest world-space point", () => {
    const matrix = wire(new Vector3(-100, 0, -500), new Vector3(400, 0, -2000));
    const hit = cast(matrix, 0, 1.5, 1)!;
    // Halfway between the projected endpoints is one fifth of the way along the world-space segment.
    expect(hit.point.z).toBeCloseTo(-800, 8);
    expect(hit.pointOnLine.z).toBeCloseTo(-800, 8);
    expect(hit.pointOnLine.x).toBeCloseTo(0, 8);
    expect(hit.point.y).toBeCloseTo(2.4, 8);
  });

  it("calculates taper from the clipped endpoint, including a segment crossing the camera", () => {
    // Clipping leaves a horizontal segment from screen x=-100 at the near plane to x=100 at depth 100.
    const visibleStart = new Vector3(-.2, 0, -1), end = new Vector3(20, 0, -100);
    const hiddenStart = end.clone().lerp(visibleStart, 2);
    const clipped = wire(visibleStart, end), crossing = wire(hiddenStart, end);
    for (const x of [-100, 0, 100]) for (const y of [1, 20, 50]) {
      const expected = cast(clipped, x, y, .5), actual = cast(crossing, x, y, .5);
      expect(actual === null).toBe(expected === null);
      if (expected) expect(actual!.point.distanceTo(expected.point)).toBeLessThan(1e-7);
    }
  });
});
