import { LinearSRGBColorSpace, Matrix4, NoToneMapping, ReinhardToneMapping, PerspectiveCamera, SphereGeometry, SRGBColorSpace, type WebGLRenderer } from "three";
import { describe, expect, it } from "vitest";

import { containedSpherePrimitive, ContainedSphereMaterial, projectSphereSurface } from "./containedSphere";

describe("frozen sphere surface", () => {
  const covers = (polygons: Array<Array<{ x: number; y: number }>>, x: number, y: number): boolean => polygons.some(polygon => {
    let inside = false;
    for (let at = 0, previous = polygon.length - 1; at < polygon.length; previous = at++) {
      const a = polygon[at], b = polygon[previous];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  });

  it("keeps near-plane annuli hollow and far-plane caps filled", () => {
    const near = new PerspectiveCamera(90, 1, 4.2, 100), matrix = new Matrix4().makeTranslation(0, 0, -5).elements;
    const annulus = projectSphereSurface(matrix, 1, near, 1000, 1000);
    expect(annulus.polygons!.length).toBeGreaterThan(0);
    expect(covers(annulus.polygons!, 500, 500)).toBe(false);
    expect(covers(annulus.polygons!, 590, 500)).toBe(true);
    const far = new PerspectiveCamera(90, 1, .1, 4.2);
    const cap = projectSphereSurface(matrix, 1, far, 1000, 1000);
    expect(covers(cap.polygons!, 500, 500)).toBe(true);
    expect(covers(cap.polygons!, 590, 500)).toBe(false);
  });

  it("omits a completely clipped front surface and an eye inside it", () => {
    const eye = new PerspectiveCamera(90, 1, 4.9, 100);
    expect(projectSphereSurface(new Matrix4().makeTranslation(0, 0, -5).elements, 1, eye, 1000, 1000).boundary).toEqual([]);
    eye.near = .1; eye.updateProjectionMatrix();
    expect(projectSphereSurface(new Matrix4().makeTranslation(0, 0, -.5).elements, 1, eye, 1000, 1000).boundary).toEqual([]);
  });

  it("retains offscreen silhouettes for translation without building a sampled surface", () => {
    const surface = projectSphereSurface(new Matrix4().makeTranslation(8, 0, -5).elements, 1, new PerspectiveCamera(90, 1, .1, 100), 1000, 1000);
    expect(Math.min(...surface.boundary.map(point => point.x))).toBeGreaterThan(1000);
    expect(surface.polygons).toBeUndefined();
  });
});


describe("contained sphere compatibility", () => {
  const renderer = (extensions: readonly string[], outputColorSpace: string = SRGBColorSpace, toneMapping: number = NoToneMapping): WebGLRenderer => ({
    outputColorSpace, toneMapping,
    getContext: () => ({ getExtension: (name: string) => extensions.includes(name) ? {} : null })
  }) as unknown as WebGLRenderer;
  const both = ["OES_sample_variables", "OES_shader_multisample_interpolation"];

  it("selects the native primitive before drawing when either per-sample capability is missing", () => {
    const native = new SphereGeometry(1, 12, 12);
    for (const context of [undefined, renderer([]), renderer(both.slice(0, 1)), renderer(both.slice(1)), renderer(both, "unsupported-color-space"), renderer(both, SRGBColorSpace, ReinhardToneMapping)]) {
      const selected = containedSpherePrimitive(context);
      expect(selected.material).toBeUndefined();
      expect([...selected.geometry.getAttribute("position").array]).toEqual([...native.getAttribute("position").array]);
      expect([...selected.geometry.getIndex()!.array]).toEqual([...native.getIndex()!.array]);
      selected.geometry.dispose();
    }
    native.dispose();
  });

  it("uses the unit sphere primitive only with both sample capabilities and a supported output encoding", () => {
    for (const colorSpace of [SRGBColorSpace, LinearSRGBColorSpace]) {
      const selected = containedSpherePrimitive(renderer(both, colorSpace));
      expect(selected.material).toBeInstanceOf(ContainedSphereMaterial);
      expect(selected.geometry.boundingSphere!.radius).toBe(1);
      expect(selected.geometry.getAttribute("position").count).toBe(4);
      selected.geometry.dispose(); selected.material!.dispose();
    }
  });
});
