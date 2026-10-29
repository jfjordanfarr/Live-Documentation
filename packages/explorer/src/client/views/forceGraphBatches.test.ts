import { Color, Matrix4, PerspectiveCamera, Raycaster, Scene, SphereGeometry, Vector2, Vector3, type WebGLRenderer } from "three";
import { describe, expect, it } from "vitest";

import { createSpatialBuffers, drawSpatialGraphOnChange, screenWireIntersectsFrustum } from "./forceGraphBatches";

interface Node { id: string; publicSymbols: string[]; x: number; y: number; z: number; radius: number; color: string }
interface Link { source: Node; target: Node; width: number; color: string; visible: boolean; arrow: number }
const node = (id: string, x: number, y: number, z: number, radius = 4): Node => ({ id, x, y, z, radius, color: "#0091ff", publicSymbols: [] });
const link = (source: Node, target: Node, width = 1): Link => ({ source, target, width, color: "rgba(255, 255, 255, 0.16)", visible: true, arrow: 0 });
const setup = () => {
  const scene = new Scene(), camera = new PerspectiveCamera(60, 1, .1, 20000);
  camera.position.z = 1000; camera.updateMatrixWorld();
  const buffers = createSpatialBuffers<Node, Link>(scene, {
    radius: node => node.radius, nodeColor: node => node.color, linkColor: link => link.color,
    linkWidth: link => link.width, linkVisible: link => link.visible, arrowLength: link => link.arrow
  });
  return { scene, camera, buffers, draw: (nodes = 0, wires = 1) => buffers.update(camera, 1000, 1000, nodes, wires) };
};

describe("direct spatial buffers", () => {
  it("uploads real sphere vertices, colors and alpha without constructing a scene object per node", () => {
    const { buffers, scene, draw } = setup(), a = node("a", 20, -8, 4, 7), b = node("b", -30, 17, 90, 13);
    a.color = "#12345633"; b.color = "#ff6600";
    buffers.setData({ nodes: [a, b], links: [] }); draw();
    expect(scene.children).toHaveLength(3);
    const { mesh, entries } = buffers.nodes;
    for (const entry of entries) {
      const matrix = new Matrix4(); mesh.getMatrixAt(entry.slot, matrix);
      const actual = mesh.geometry.getAttribute("position"), reference = new SphereGeometry(entry.data.radius, 12, 12);
      for (let i = 0; i < actual.count; i++) {
        const expected = new Vector3().fromBufferAttribute(reference.getAttribute("position"), i).add(new Vector3(entry.data.x, entry.data.y, entry.data.z));
        const drawn = new Vector3().fromBufferAttribute(actual, i).applyMatrix4(matrix);
        expect(drawn.distanceTo(expected)).toBeLessThan(2e-6);
      }
      expect(mesh.geometry.index!.array).toEqual(reference.index!.array);
      reference.dispose();
    }
    const color = new Color(); mesh.getColorAt(entries[0].slot, color);
    expect(color.r).toBeCloseTo(new Color("#123456").r, 7);
    expect(mesh.geometry.getAttribute("spatialOpacity").getX(entries[0].slot)).toBeCloseTo(.15, 7);
    expect(mesh.geometry.getAttribute("spatialOpacity").getX(entries[1].slot)).toBe(.75);
    buffers.dispose(); expect(scene.children).toHaveLength(0);
  });

  it("keeps surviving bindings and batches when membership, appearance, identity or coordinates change", () => {
    const { buffers, draw } = setup(), a = node("a", -20, 0, 0), b = node("b", 20, 0, 0), c = node("c", 100, 0, 0);
    const ab = link(a, b, 2.05), bc = link(b, c);
    buffers.setData({ nodes: [a, b, c], links: [ab, bc] }); draw();
    const binding = buffers.lines.entries[0], mesh = buffers.lines.mesh;
    expect(mesh.geometry.getAttribute("spatialWidth").getX(binding.slot)).toBeCloseTo(2.1, 6);
    a.id = "renamed"; a.x = -80; ab.color = "rgba(214, 178, 240, 0.55)"; ab.visible = false;
    buffers.invalidateAppearance(); buffers.setData({ nodes: [a, b], links: [ab] }); draw();
    expect(buffers.lines.entries).toEqual([binding]); expect(buffers.lines.mesh).toBe(mesh);
    expect(binding.enabled).toBe(false); expect(mesh.count).toBe(0);
    const matrix = new Matrix4(); mesh.getMatrixAt(binding.slot, matrix);
    expect(new Vector3().applyMatrix4(matrix).x).toBe(-80);
    expect(new Vector3(0, 0, 1).applyMatrix4(matrix).x).toBe(20);
    expect(mesh.geometry.getAttribute("spatialOpacity").getX(binding.slot)).toBeCloseTo(.55, 6);
    ab.visible = true; buffers.invalidateAppearance(); draw(); expect(mesh.count).toBe(1);
    buffers.dispose();
  });

  it("orders translucent instances by depth, culls the view and keeps hidden graph members addressable", () => {
    const { buffers, draw } = setup(), a = node("near", 0, 0, 200), b = node("far", 0, 0, -200);
    buffers.setData({ nodes: [a, b], links: [] }); draw();
    const [near, far] = buffers.nodes.entries;
    expect(far.slot).toBe(0); expect(near.slot).toBe(1);
    b.z = 400; draw(); expect(near.slot).toBe(0); expect(far.slot).toBe(1);
    b.x = 10000; draw(); expect(buffers.nodes.mesh.count).toBe(1);
    expect(far.slot).toBeGreaterThanOrEqual(buffers.nodes.mesh.count);
    expect(buffers.nodes.entries).toHaveLength(2);
    buffers.dispose();
  });

  it("rebinds packed endpoint indices when membership order changes, retaining exact depth and identity ties", () => {
    const { buffers, draw } = setup(), a = node("near", 0, 0, 0), b = node("far", 20, 0, -1e-6), c = node("third", -20, 0, -100);
    const ab = link(a, b), bc = link(b, c);
    buffers.setData({ nodes: [a, b, c], links: [ab, bc] }); draw();
    const [near, far] = buffers.nodes.entries, bindings = [...buffers.lines.entries];
    // Their projected Float32 depths coincide; transparent ordering still compares their full depths.
    expect(far.slot).toBeLessThan(near.slot);
    b.z = 0; a.x = 70; c.y = 45;
    buffers.setData({ nodes: [c, b, a], links: [bc, ab] }); draw();
    expect(buffers.nodes.entries[2]).toBe(near); expect(buffers.nodes.entries[1]).toBe(far);
    expect(near.slot).toBeLessThan(far.slot); // Exact ties retain creation order, not the new membership order.
    expect(buffers.lines.entries).toEqual([bindings[1], bindings[0]]);
    for (const entry of buffers.lines.entries) {
      const matrix = new Matrix4(); buffers.lines.mesh.getMatrixAt(entry.slot, matrix);
      const { source, target } = entry.data;
      expect(new Vector3().applyMatrix4(matrix).toArray()).toEqual([source.x, source.y, source.z]);
      expect(new Vector3(0, 0, 1).applyMatrix4(matrix).toArray()).toEqual([target.x, target.y, target.z]);
    }
    buffers.dispose();
  });

  it("grows buffers for a large graph without growing its scene-object count or replacing survivors", () => {
    const { buffers, scene, draw } = setup();
    const nodes = Array.from({ length: 2000 }, (_, i) => node(String(i), (i % 20) * 10 - 100, (Math.floor(i / 20) % 20) * 10 - 100, -Math.floor(i / 400) * 10));
    const links = nodes.slice(1).map((n, i) => link(nodes[i], n));
    buffers.setData({ nodes: nodes.slice(0, 2), links: links.slice(0, 1) }); draw();
    const first = buffers.nodes.entries[0], batch = buffers.nodes.mesh;
    buffers.setData({ nodes, links }); draw();
    expect(scene.children).toHaveLength(3); expect(buffers.nodes.mesh).toBe(batch); expect(buffers.nodes.entries[0]).toBe(first);
    expect(buffers.nodes.entries).toHaveLength(2000); expect(buffers.lines.entries).toHaveLength(1999);
    buffers.setData({ nodes: nodes.slice(0, 1), links: [] }); draw();
    expect(buffers.nodes.entries).toEqual([first]); expect(batch.count).toBe(1); expect(buffers.lines.mesh.count).toBe(0);
    buffers.dispose();
  });

  it("picks the actual uploaded sphere and projected wire and rejects points outside their strokes", () => {
    const { buffers, camera, draw } = setup(), a = node("a", -100, 0, 0, 12), b = node("b", 100, 0, 0, 12), wire = link(a, b, 4);
    buffers.setData({ nodes: [a, b], links: [wire] }); draw();
    const ray = new Raycaster(); ray.setFromCamera(new Vector2(0, 0), camera);
    expect(buffers.pickNode(ray)).toBeUndefined(); expect(buffers.pickLink(ray, camera, 1)).toBe(wire);
    ray.setFromCamera(new Vector2(0, .02), camera); expect(buffers.pickLink(ray, camera, 1)).toBeUndefined();
    const projected = new Vector3(a.x, a.y, a.z).project(camera); ray.setFromCamera(new Vector2(projected.x, projected.y), camera);
    expect(buffers.pickNode(ray)).toBe(a);
    buffers.dispose();
  });

  it("keeps a clipped tapered wire pickable in either direction while rejecting a point outside its bounds", () => {
    const { buffers, camera, draw } = setup(), a = node("behind", -10, 0, 1100), b = node("ahead", 100, 0, -1000);
    const wire = link(a, b, 4), ray = new Raycaster();
    for (const reversed of [false, true]) {
      wire.source = reversed ? b : a; wire.target = reversed ? a : b;
      buffers.setData({ nodes: [a, b], links: [wire] }); draw(0, .5);
      ray.setFromCamera(new Vector2(0, 0), camera);
      expect(buffers.pickLink(ray, camera, .5)).toBe(wire);
      ray.setFromCamera(new Vector2(0, .1), camera);
      expect(buffers.pickLink(ray, camera, .5)).toBeUndefined();
    }
    buffers.dispose();
  });

  it("keeps citation arrows at physical length and the target's physical surface through display-size changes", () => {
    const { buffers, draw } = setup(), a = node("source", -100, 10, 20, 7), b = node("target", 60, -35, -80, 13);
    const wire = link(a, b); wire.arrow = 4; wire.color = "rgba(214, 178, 240, 0.55)";
    buffers.setData({ nodes: [a, b], links: [wire] });
    const matrices: number[][] = [];
    for (const resistance of [0, 1]) {
      draw(resistance, .5);
      const entry = buffers.arrows.entries[0], matrix = new Matrix4();
      buffers.arrows.mesh.getMatrixAt(entry.slot, matrix); matrices.push([...matrix.elements]);
      const tail = new Vector3().applyMatrix4(matrix), tip = new Vector3(0, 0, 1).applyMatrix4(matrix);
      expect(tail.distanceTo(tip)).toBeCloseTo(4, 5);
      expect(tip.distanceTo(new Vector3(b.x, b.y, b.z))).toBeCloseTo(13, 5);
      expect(buffers.arrows.mesh.geometry.getAttribute("spatialOpacity").getX(entry.slot)).toBeCloseTo(1.65, 6);
    }
    expect(matrices[1]).toEqual(matrices[0]);
    buffers.dispose();
  });
});

describe("spatial redraw", () => {
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
    const camera = new PerspectiveCamera(90, 1, 1, 10000); camera.position.z = 1000;
    let resistance = .5, frames = 0;
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
