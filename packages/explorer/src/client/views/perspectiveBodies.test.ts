import { BoxGeometry, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, SphereGeometry, Vector2 } from "three";
import { describe, expect, it } from "vitest";

import { projectSpatialBodies, type FrozenSpatialBody, type SceneBody } from "./perspectiveBodies";

const camera = (): PerspectiveCamera => {
  const eye = new PerspectiveCamera(90, 1, 1, 100);
  eye.updateMatrixWorld(); return eye;
};
const box = (x = 0, z = -4): FrozenSpatialBody => {
  const geometry = new BoxGeometry(2, 2, 2);
  const result = { id: "directory:src", center: { x, y: 0, z }, matrix: new Matrix4().makeTranslation(x, 0, z).elements,
    positions: Float32Array.from(geometry.getAttribute("position").array), indices: Uint32Array.from(geometry.index!.array), alpha: 0.6, order: 2, units: [] };
  geometry.dispose(); return { ...result, kind: "skin", look: "skin", hovered: false };
};
const bounds = (body: SceneBody) => ({
  left: Math.min(...body.boundary.map(point => point.x + body.x)), right: Math.max(...body.boundary.map(point => point.x + body.x)),
  top: Math.min(...body.boundary.map(point => point.y + body.y)), bottom: Math.max(...body.boundary.map(point => point.y + body.y))
});

describe("frozen submitted skin projection", () => {
  it("projects the real boundary, independent of ordinary sphere zoom resistance", () => {
    const body = projectSpatialBodies([box()], camera(), 200, 200).get("directory:src")!;
    // A 90-degree camera puts the box's front corners, x/y=±1 at z=-3, one third of a half-frame from center.
    expect(bounds(body).left).toBeCloseTo(200 / 3, 6);
    expect(bounds(body).right).toBeCloseTo(400 / 3, 6);
    expect(bounds(body).top).toBeCloseTo(200 / 3, 6);
    expect(bounds(body).bottom).toBeCloseTo(400 / 3, 6);
    expect(body.alpha).toBe(0.6); expect(body.order).toBe(2);
    expect(body).toMatchObject({ kind: "skin", look: "skin", hovered: false });
  });

  it("clips crossing triangles before division, including a center on the camera plane, and rejects geometry behind it", () => {
    const crossing = box(0, 0);
    crossing.matrix = new Matrix4().makeScale(1, 1, 2).elements;
    const body = projectSpatialBodies([crossing], camera(), 200, 200).get("directory:src")!;
    expect(body.boundary.length).toBeGreaterThan(2);
    expect(body.boundary.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
    const extent = bounds(body);
    expect(extent.left).toBeCloseTo(0, 6); expect(extent.right).toBeCloseTo(200, 6);
    expect(extent.top).toBeCloseTo(0, 6); expect(extent.bottom).toBeCloseTo(200, 6);
    expect(projectSpatialBodies([box(0, 4)], camera(), 200, 200).size).toBe(0);
  });

  it("clips the far plane and rejects skins wholly beyond it", () => {
    const crossing = box(0, -100);
    expect(projectSpatialBodies([crossing], camera(), 200, 200).get(crossing.id)!.boundary.length).toBeGreaterThan(2);
    expect(projectSpatialBodies([box(0, -104)], camera(), 200, 200).size).toBe(0);
  });

  it("keeps offscreen sides intact so translation can bring them into the frame", () => {
    const body = projectSpatialBodies([box(4)], camera(), 200, 200).get("directory:src")!;
    expect(bounds(body).right).toBeGreaterThan(200);
    expect(body.boundary).toHaveLength(6);
  });

  it("preserves only supplied drawn interiors, colors, alpha, veils and nested identity, and freezes the projection", () => {
    const source = box();
    source.units.push({ ...box(0, -4), matrix: new Matrix4().makeTranslation(0, 0, -4).multiply(new Matrix4().makeScale(0.1, 0.1, 0.1)).elements,
      id: "src/a.ts", kind: "file", color: "rgb(0, 145, 255)", alpha: 0.45, veiled: false, order: 0, depth: 1, parent: "src/deep" });
    source.units.push({ ...box(), id: "src/deep", kind: "directory", color: "rgb(255, 255, 255)", alpha: 0.6, veiled: true, order: 0, depth: 0 });
    const body = projectSpatialBodies([source], camera(), 200, 200).get(source.id)!;
    expect(body.units.map(({ boundary: _boundary, ...unit }) => unit)).toEqual([
      { id: "src/a.ts", kind: "file", color: "rgb(0, 145, 255)", alpha: 0.45, veiled: false, order: 0, depth: 1, parent: "src/deep" },
      { id: "src/deep", kind: "directory", color: "rgb(255, 255, 255)", alpha: 0.6, veiled: true, order: 0, depth: 0, parent: undefined }
    ]);
    const frozen = JSON.stringify(body);
    source.positions.fill(NaN); source.units.length = 0;
    expect(JSON.stringify(body)).toBe(frozen);
    expect(projectSpatialBodies([source], camera(), 200, 200).size).toBe(0);
  });
});


describe("native FrontSide contained capture", () => {
  const covers = (polygons: Array<Array<{ x: number; y: number }>>, x: number, y: number): boolean => polygons.some(polygon => {
    let inside = false;
    for (let at = 0, previous = polygon.length - 1; at < polygon.length; previous = at++) {
      const a = polygon[at], b = polygon[previous];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  });

  it.each([
    { name: "near-cut annulus", z: -5, near: 4.2, far: 100 },
    { name: "far-cut cap", z: -5, near: .1, far: 4.2 },
    { name: "completely clipped front", z: -5, near: 5.01, far: 100 },
    { name: "eye inside", z: -.5, near: .1, far: 100 }
  ])("matches independent native ray intersections for $name", ({ name, z, near, far }) => {
    const geometry = new SphereGeometry(1, 12, 12), material = new MeshBasicMaterial(), native = new Mesh(geometry, material);
    native.position.z = z; native.updateMatrixWorld();
    const eye = new PerspectiveCamera(90, 1, near, far); eye.updateMatrixWorld();
    const source = box(0, z);
    source.units.push({ positions: Float32Array.from(geometry.getAttribute("position").array), indices: Uint32Array.from(geometry.index!.array),
      matrix: [...native.matrixWorld.elements], frontSide: true, id: "src/native.ts", kind: "file", color: "rgb(0, 145, 255)", alpha: .75, veiled: false, order: 0 });
    const body = projectSpatialBodies([source], eye, 1000, 1000).get(source.id)!;
    const unit = body.units[0], ray = new Raycaster();
    let nativeCovered = 0;
    for (let x = 350.37; x <= 650; x += 25) for (let y = 350.37; y <= 650; y += 25) {
      ray.setFromCamera(new Vector2(x / 500 - 1, 1 - y / 500), eye);
      const expected = ray.intersectObject(native).some(hit => { const depth = -hit.point.clone().applyMatrix4(eye.matrixWorldInverse).z; return depth >= near && depth <= far; });
      nativeCovered += Number(expected);
      const actual = !!unit && covers(unit.polygons!, x - body.x, y - body.y);
      expect(actual, `${name} at ${x},${y}`).toBe(expected);
    }
    if (name === "near-cut annulus") {
      expect(nativeCovered).toBeGreaterThan(0);
      expect(covers(unit.polygons!, 500 - body.x, 500 - body.y)).toBe(false);
    }
    if (name === "far-cut cap") expect(covers(unit.polygons!, 500 - body.x, 500 - body.y)).toBe(true);
    if (name === "completely clipped front" || name === "eye inside") expect(body.units).toEqual([]);
    geometry.dispose(); material.dispose();
  });
});
