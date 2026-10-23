import { Frustum, Group, Matrix3, Matrix4, Mesh, MeshLambertMaterial, PerspectiveCamera, Plane, Scene, SphereGeometry, Vector3, type WebGLRenderer } from "three";
import { describe, expect, it } from "vitest";

import { batchSpatialGraph, tubeIntersectsFrustum, type SpatialBatchInstance } from "./forceGraphBatches";

const sphere = (radius: number, color: string, opacity: number): Mesh<SphereGeometry, MeshLambertMaterial> => {
  const mesh = new Mesh(new SphereGeometry(radius, 8, 8), new MeshLambertMaterial({ color, opacity, transparent: true }));
  Object.assign(mesh, { __graphObjType: "node" });
  return mesh;
};
const draw = (scene: Scene): void => {
  scene.updateMatrixWorld(true);
  const camera = new PerspectiveCamera(60, 1, .1, 2000);
  camera.position.z = 1000; camera.updateMatrixWorld();
  // The scene hooks copy geometry without using the renderer. No DOM or WebGL substitute is involved.
  const args = [undefined as unknown as WebGLRenderer, scene, camera, new SphereGeometry(), new MeshLambertMaterial(), new Group()] as const;
  scene.onBeforeRender(...args); scene.onAfterRender(...args);
};
const instanceOf = (mesh: Mesh): SpatialBatchInstance => mesh.userData.spatialBatch as SpatialBatchInstance;

describe("spatial draw batches", () => {
  it("copies actual transformed vertices, triangle order, alpha and visibility, restoring the picking objects", () => {
    const scene = new Scene(), parent = new Group();
    parent.position.set(4, 5, 6); scene.add(parent);
    const a = sphere(7, "#123456", .15), b = sphere(13, "#ff6600", .75);
    a.position.set(20, -8, 4); a.rotation.set(.2, .5, .1); a.scale.set(1, 2, .5);
    b.position.set(-30, 17, 90); b.visible = false; parent.add(a, b);
    const batching = batchSpatialGraph(scene); draw(scene);
    const first = instanceOf(a), second = instanceOf(b);
    expect(first.mesh).toBe(second.mesh);
    expect(a.visible).toBe(true); expect(b.visible).toBe(false);
    expect(first.enabled).toBe(true); expect(second.enabled).toBe(false); expect(second.instance).toBeGreaterThanOrEqual(second.mesh.count);
    const copied = first.mesh.geometry.getAttribute("position"), original = a.geometry.getAttribute("position");
    expect(copied.count).toBe(original.count);
    const instanceMatrix = new Matrix4(); first.mesh.getMatrixAt(first.instance, instanceMatrix);
    for (let i = 0; i < original.count; i++) {
      const expected = new Vector3().fromBufferAttribute(original, i).applyMatrix4(a.matrixWorld);
      const actual = new Vector3().fromBufferAttribute(copied, i).applyMatrix4(instanceMatrix);
      expect(actual.distanceTo(expected)).toBeLessThan(4e-6); // Float32 vertices after the affine transform.
    }
    const otherMatrix = new Matrix4(); second.mesh.getMatrixAt(second.instance, otherMatrix);
    const otherVertices = b.geometry.getAttribute("position");
    for (let i = 0; i < otherVertices.count; i++) {
      const expected = new Vector3().fromBufferAttribute(otherVertices, i).applyMatrix4(b.matrixWorld);
      const actual = new Vector3().fromBufferAttribute(copied, i).applyMatrix4(otherMatrix);
      expect(actual.distanceTo(expected)).toBeLessThan(4e-6); // Different radii share the same native shape.
    }
    const sourceNormals = a.geometry.getAttribute("normal"), copiedNormals = first.mesh.geometry.getAttribute("normal");
    const normalMatrix = new Matrix3().getNormalMatrix(a.matrixWorld);
    for (let i = 0; i < sourceNormals.count; i++) {
      const expected = new Vector3().fromBufferAttribute(sourceNormals, i).applyNormalMatrix(normalMatrix);
      const actual = new Vector3().fromBufferAttribute(copiedNormals, i).applyNormalMatrix(new Matrix3().getNormalMatrix(instanceMatrix));
      expect(actual.distanceTo(expected)).toBeLessThan(1e-6);
    }
    expect(first.mesh.geometry.index!.array).toEqual(a.geometry.index!.array);
    expect(first.mesh.instanceColor!.getX(first.instance)).toBeCloseTo(a.material.color.r, 6);
    expect(first.mesh.geometry.getAttribute("spatialOpacity").getX(first.instance)).toBeCloseTo(.15, 6);
    batching.dispose(); expect(a.userData.spatialBatch).toBeUndefined();
    expect(scene.children.some(child => child.name === "Spatial graph batch")).toBe(false);
  });

  it("keeps range identity during motion and attention changes, and separates different depth rules", () => {
    const scene = new Scene(), a = sphere(4, "#0091ff", .75), line = sphere(2, "#ffffff", .2);
    line.material.depthWrite = false; line.renderOrder = 10; scene.add(a, line);
    batchSpatialGraph(scene); draw(scene);
    const first = instanceOf(a), other = instanceOf(line);
    expect(first.mesh).not.toBe(other.mesh); expect(other.mesh.renderOrder).toBe(10);
    expect(other.mesh.material.depthWrite).toBe(false);
    a.material.opacity = .15; a.material.color.set("#28a745"); a.position.x = 80; draw(scene);
    expect(instanceOf(a)).toBe(first);
    expect(first.mesh.instanceColor!.getY(first.instance)).toBeCloseTo(a.material.color.g, 6);
    expect(first.mesh.geometry.getAttribute("spatialOpacity").getX(first.instance)).toBeCloseTo(.15, 6);
    const moved = new Matrix4(); first.mesh.getMatrixAt(first.instance, moved);
    expect(moved.elements[12]).toBe(80);
  });

  it("orders transparent bodies back to front, reculls moved bodies, and honours changed source geometry", () => {
    const scene = new Scene(), near = sphere(7, "#0091ff", .75), far = sphere(8, "#28a745", .2);
    near.position.z = 200; far.position.z = -200; scene.add(near, far);
    batchSpatialGraph(scene); draw(scene);
    const a = instanceOf(near), b = instanceOf(far);
    expect(b.instance).toBe(0); expect(a.instance).toBe(1);
    far.position.z = 400; draw(scene);
    expect(a.instance).toBe(0); expect(b.instance).toBe(1);
    far.position.x = 10000; draw(scene);
    expect(b.instance).toBeGreaterThanOrEqual(b.mesh.count); expect(a.mesh.count).toBe(1);
    near.geometry = new SphereGeometry(20, 16, 12); draw(scene);
    expect(instanceOf(near)).toBe(a);
    expect(a.mesh.geometry.getAttribute("position").count).toBe(near.geometry.getAttribute("position").count);
    expect(a.mesh.geometry.index!.count).toBe(near.geometry.index!.count);
    near.material.visible = false; draw(scene); expect(a.mesh.count).toBe(0);
    near.material.visible = true; draw(scene); expect(a.mesh.count).toBe(1);
    expect(a.mesh.material.visible).toBe(true);
  });

  it("grows for a large scene and releases departed ranges without replacing survivors", () => {
    const scene = new Scene(), nodes = Array.from({ length: 170 }, (_, i) => sphere(i + 1, "#0091ff", .75));
    scene.add(...nodes.slice(0, 10)); batchSpatialGraph(scene); draw(scene);
    const first = instanceOf(nodes[0]);
    let disposals = 0;
    first.mesh.addEventListener("dispose", () => { disposals++; });
    scene.add(...nodes.slice(10)); draw(scene);
    expect(instanceOf(nodes[0])).toBe(first);
    expect(disposals).toBe(1);
    const survivor = instanceOf(nodes[169]);
    expect(survivor.mesh.count).toBe(170);
    scene.remove(...nodes.slice(0, 169)); draw(scene);
    expect(instanceOf(nodes[169])).toBe(survivor);
    expect(survivor.mesh.count).toBe(1);
    expect(nodes[0].userData.spatialBatch).toBeUndefined();
    scene.remove(nodes[169]); draw(scene); expect(scene.children).toEqual([]);
    expect(disposals).toBe(2);
  });
});

describe("tube frustum culling", () => {
  const box = new Frustum(new Plane(new Vector3(1, 0, 0), 1), new Plane(new Vector3(-1, 0, 0), 1),
    new Plane(new Vector3(0, 1, 0), 1), new Plane(new Vector3(0, -1, 0), 1),
    new Plane(new Vector3(0, 0, 1), 1), new Plane(new Vector3(0, 0, -1), 1));
  const tube = (start: Vector3, end: Vector3): Matrix4 => {
    const matrix = new Matrix4().lookAt(start, end, new Vector3(0, 1, 0));
    matrix.scale(new Vector3(1, 1, -start.distanceTo(end))); matrix.setPosition(start); return matrix;
  };
  it("keeps crossing and tangential tube surfaces and rejects a long tube whose bounding sphere overlaps", () => {
    expect(tubeIntersectsFrustum(tube(new Vector3(0, 0, -100), new Vector3(0, 0, 100)), .1, box)).toBe(true);
    const outside = tube(new Vector3(1.5, 0, -100), new Vector3(1.5, 0, 100));
    expect(tubeIntersectsFrustum(outside, .1, box)).toBe(false);
    expect(tubeIntersectsFrustum(outside, .5, box)).toBe(true);
    expect(tubeIntersectsFrustum(outside.clone().scale(new Vector3(6, 1, 1)), .1, box)).toBe(true);
  });
  it("rejects a diagonal beyond a corner even though each individual plane is crossed", () => {
    const diagonal = tube(new Vector3(0, 3, 0), new Vector3(3, 0, 0));
    expect(tubeIntersectsFrustum(diagonal, .1, box)).toBe(false);
    expect(tubeIntersectsFrustum(diagonal, 1, box)).toBe(true);
  });
});
