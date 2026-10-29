import { Color, CylinderGeometry, Group, Matrix3, Matrix4, Mesh, MeshLambertMaterial, PerspectiveCamera, Raycaster, Scene, SphereGeometry, Vector2, Vector3, type WebGLRenderer } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { describe, expect, it } from "vitest";

import { batchSpatialGraph, drawSpatialGraphOnChange, screenWireIntersectsFrustum, type SpatialBatchInstance } from "./forceGraphBatches";

const sphere = (radius: number, color: string, opacity: number): Mesh<SphereGeometry, MeshLambertMaterial> => {
  const mesh = new Mesh(new SphereGeometry(radius, 8, 8), new MeshLambertMaterial({ color, opacity, transparent: true }));
  Object.assign(mesh, { __graphObjType: "node" });
  return mesh;
};
const draw = (scene: Scene, camera = new PerspectiveCamera(60, 1, .1, 2000)): void => {
  scene.updateMatrixWorld(true);
  camera.position.z = 1000; camera.updateMatrixWorld();
  // Only the CSS viewport measurement is needed to assemble batches; this test does not simulate DOM or WebGL drawing.
  const renderer = { getSize: (size: Vector2) => size.set(1000, 1000) } as WebGLRenderer;
  const args = [renderer, scene, camera, new SphereGeometry(), new MeshLambertMaterial(), new Group()] as const;
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

  it("keeps the wire's count-weighted width and interaction proxy across resistance changes", () => {
    const scene = new Scene();
    const cylinder = new CylinderGeometry(2, 2, 1, 8).rotateX(Math.PI / 2).translate(0, 0, .5);
    const wire = new Mesh(cylinder, new MeshLambertMaterial({ color: "#0091ff", transparent: true, opacity: .2, depthWrite: false }));
    wire.position.x = -100; wire.rotation.y = Math.PI / 2; wire.scale.z = 200;
    Object.assign(wire, { __graphObjType: "link" }); scene.add(wire);
    let resistance = 1;
    const batching = batchSpatialGraph(scene, () => ({ nodes: 0, wires: resistance }));
    const camera = new PerspectiveCamera(90, 1, 1, 10000);
    draw(scene, camera);
    const batch = instanceOf(wire);
    const projectedRaycast = wire.raycast;
    expect(batch.mesh.material).toBeInstanceOf(LineMaterial);
    expect(batch.mesh.geometry.getAttribute("spatialWidth").getX(batch.instance)).toBe(4);
    expect(batch.mesh.geometry.getAttribute("spatialOpacity").getX(batch.instance)).toBeCloseTo(.2, 6);
    expect(batch.mesh.material.depthWrite).toBe(false);
    const raycaster = new Raycaster(); raycaster.setFromCamera(new Vector2(0, 1.5 / 500), camera);
    expect(raycaster.intersectObject(wire)).toHaveLength(1); // Four CSS pixels wide.
    resistance = 0; draw(scene, camera);
    expect(instanceOf(wire)).toBe(batch);
    expect((batch.mesh.material as LineMaterial).uniforms.spatialResistance.value).toBe(0);
    expect(raycaster.intersectObject(wire)).toHaveLength(0); // Two CSS pixels wide at this depth.
    batching.dispose();
    resistance = 1;
    expect(wire.raycast).not.toBe(projectedRaycast);
    expect(raycaster.intersectObject(wire)).toHaveLength(0); // Restored native geometry ignores the former control.
  });

  it("restores node scales on removal and disposal and does not accumulate zoom compensation", () => {
    const scene = new Scene(), a = sphere(4, "#0091ff", .75), b = sphere(8, "#28a745", .75);
    a.scale.set(1, 2, .5); b.scale.setScalar(2); scene.add(a, b);
    let resistance = 1;
    const batching = batchSpatialGraph(scene, () => ({ nodes: resistance, wires: 1 }));
    const camera = new PerspectiveCamera(90, 1, 1, 10000);
    camera.position.z = 1000; camera.updateMatrixWorld();
    for (let i = 0; i < 5; i++) batching.updateSizes(camera, 1000);
    expect(a.scale.distanceTo(new Vector3(2, 4, 1))).toBeLessThan(1e-12);
    camera.position.z = 2000; batching.updateSizes(camera, 1000);
    expect(a.scale.distanceTo(new Vector3(4, 8, 2))).toBeLessThan(1e-12);
    resistance = .5; batching.updateSizes(camera, 1000);
    expect(a.scale.distanceTo(new Vector3(2, 4, 1))).toBeLessThan(1e-12);
    scene.remove(b); batching.updateSizes(camera, 1000);
    expect(b.scale.distanceTo(new Vector3(2, 2, 2))).toBeLessThan(1e-12);
    batching.dispose(); expect(a.scale.distanceTo(new Vector3(1, 2, .5))).toBeLessThan(1e-12);
  });

  it("culls with the node's compensated radius, retaining a visible rim beyond the viewport", () => {
    const scene = new Scene(), node = sphere(4, "#0091ff", .75); node.position.x = 1008; scene.add(node);
    let resistance = 0;
    const batching = batchSpatialGraph(scene, () => ({ nodes: resistance, wires: 1 }));
    const camera = new PerspectiveCamera(90, 1, 1, 10000);
    draw(scene, camera); expect(instanceOf(node).mesh.count).toBe(0);
    resistance = 1; draw(scene, camera); expect(instanceOf(node).mesh.count).toBe(1);
    node.position.x = 1020; draw(scene, camera); expect(instanceOf(node).mesh.count).toBe(0);
    batching.dispose();
  });
});

describe("spatial redraw guard", () => {
  it("redraws explicit picture changes, accumulated camera movement, resizing and context restoration", () => {
    const camera = new PerspectiveCamera(90, 1, 1, 10000);
    camera.position.z = 1000;
    let revision = 2 ** 24, frames = 0, observed = 0;
    const listeners = new Map<string, () => void>();
    const renderer = {
      domElement: { width: 1000, height: 1000, addEventListener: (name: string, callback: () => void) => listeners.set(name, callback) },
      getClearColor: (color: Color) => color.set(0), getClearAlpha: () => 1, setSize: () => {}
    } as unknown as WebGLRenderer;
    const composer = { render: () => { frames++; } };
    drawSpatialGraphOnChange(camera, renderer, composer, () => [revision], () => { observed++; });
    composer.render();
    for (let i = 0; i < 20; i++) composer.render();
    expect(frames).toBe(1);
    expect(observed).toBe(21); // A reveal can proceed even when the previous piece did not need redrawing.
    revision++;
    composer.render();
    expect(frames).toBe(2); // Revisions must not lose increments at Float32's integer limit.
    for (let i = 0; i < 100; i++) { camera.position.z += 1e-6; composer.render(); }
    expect(frames).toBeGreaterThan(2); // Individually subpixel moves eventually change the uploaded picture.
    const beforeResize = frames;
    renderer.setSize(1000, 1000);
    composer.render();
    expect(frames).toBe(beforeResize + 1); // A same-size canvas assignment still clears its drawing buffer.
    listeners.get("webglcontextrestored")!();
    composer.render();
    expect(frames).toBe(beforeResize + 2);
  });

  it("redraws a resistance change but ignores subpixel damping once uploaded transforms stop changing", () => {
    const scene = new Scene(), node = sphere(4, "#0091ff", .75); scene.add(node);
    const camera = new PerspectiveCamera(90, 1, 1, 10000); camera.position.z = 1000;
    let resistance = .5, frames = 0;
    const batching = batchSpatialGraph(scene, () => ({ nodes: resistance, wires: resistance }));
    const renderer = {
      domElement: { width: 1000, height: 1000, addEventListener: () => {} },
      getClearColor: (color: Color) => color.set(0), getClearAlpha: () => 1, setSize: () => {}
    } as unknown as WebGLRenderer;
    const composer = { render: () => { frames++; } };
    drawSpatialGraphOnChange(camera, renderer, composer, () => [resistance]);
    composer.render(); expect(frames).toBe(1);
    camera.position.z += 1e-7; composer.render(); expect(frames).toBe(1);
    camera.position.z += 1; composer.render(); expect(frames).toBe(2);
    resistance = 1; composer.render(); expect(frames).toBe(3);
    composer.render(); expect(frames).toBe(3);
    batching.dispose();
  });
});

describe("screen-space wire culling", () => {
  const viewport = new Vector2(100, 100);
  const tube = (start: Vector3, end: Vector3): Matrix4 => {
    const matrix = new Matrix4().lookAt(start, end, new Vector3(0, 1, 0));
    matrix.scale(new Vector3(1, 1, -start.distanceTo(end))); matrix.setPosition(start); return matrix;
  };
  it("keeps crossing and tangential wires and rejects a long wire whose bounding sphere overlaps", () => {
    expect(screenWireIntersectsFrustum(tube(new Vector3(0, 0, -100), new Vector3(0, 0, 100)), 10, viewport)).toBe(true);
    const outside = tube(new Vector3(1.5, 0, -100), new Vector3(1.5, 0, 100));
    expect(screenWireIntersectsFrustum(outside, 10, viewport)).toBe(false);
    expect(screenWireIntersectsFrustum(outside, 50, viewport)).toBe(true);
    expect(screenWireIntersectsFrustum(outside.clone().scale(new Vector3(6, 1, 1)), 10, viewport)).toBe(false);
  });
  it("rejects a diagonal beyond a corner even though each individual plane is crossed", () => {
    const diagonal = tube(new Vector3(0, 3, 0), new Vector3(3, 0, 0));
    expect(screenWireIntersectsFrustum(diagonal, 10, viewport)).toBe(false);
    expect(screenWireIntersectsFrustum(diagonal, 100, viewport)).toBe(true);
  });
});
