import type { Page } from "@playwright/test";
import type { Camera, InstancedMesh, Scene, Vector3, WebGLRenderer } from "three";

import type { SpatialDrawEntry } from "../../packages/explorer/src/client/views/forceGraphBatches";

interface Datum {
  id?: string; name?: string; directoryPath?: string; directoryFileCount?: number;
  source?: string | { id: string }; target?: string | { id: string }; kind?: string; count?: number;
}
type DrawMesh = InstancedMesh & { userData: { spatialBatch?: { kind: string; entries: SpatialDrawEntry<Datum>[] } } };
type ObservedWindow = Window & {
  __THREE_DEVTOOLS__: EventTarget;
  renderedGraph?: { scene: Scene; camera: Camera; renderer: WebGLRenderer };
  renderedFrames?: number;
  busyChanges?: Array<{ busy: boolean; frame: number }>;
  renderedPieces?: number[];
  linkMarks?: WeakMap<SpatialDrawEntry<Datum>, { token: string; mesh: DrawMesh }>;
  isolateGraphWire?: () => { wire: DrawMesh; setEnds(start: Vector3, end: Vector3): void; restore(): void };
  drawnInstance?: (mesh: DrawMesh, entry: SpatialDrawEntry<Datum>) => {
    center: Vector3; radius: number; opacity: number; visible: boolean; point: (z: number) => Vector3;
  };
};

/** Observe the actual buffers submitted to Three; no predicted layout or shader formula is read. */
export async function observeGraph(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const inspected = window as unknown as ObservedWindow;
    inspected.renderedFrames = 0; inspected.busyChanges = []; inspected.renderedPieces = []; inspected.linkMarks = new WeakMap();
    inspected.drawnInstance = (mesh, entry) => {
      const matrix = mesh.matrixWorld.clone(); mesh.getMatrixAt(entry.slot, matrix); matrix.premultiply(mesh.matrixWorld);
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const sphere = mesh.geometry.boundingSphere!.clone().applyMatrix4(matrix);
      return { center: sphere.center, radius: sphere.radius,
        opacity: mesh.geometry.getAttribute("spatialOpacity").getX(entry.slot), visible: entry.enabled,
        point: z => mesh.position.clone().set(0, 0, z).applyMatrix4(matrix) };
    };
    inspected.isolateGraphWire = () => {
      const objects: Array<{ mesh: DrawMesh; visible: boolean }> = [];
      inspected.renderedGraph!.scene.traverse(object => {
        const mesh = object as DrawMesh;
        if (mesh.userData.spatialBatch) objects.push({ mesh, visible: mesh.visible });
      });
      const wire = objects.find(({ mesh }) => mesh.userData.spatialBatch!.kind === "links")!.mesh;
      const entry = wire.userData.spatialBatch!.entries.find(item => item.data.count === 1)!;
      const matrix = wire.matrixWorld.clone(), originalMatrix = matrix.clone(); wire.getMatrixAt(0, originalMatrix);
      const color = wire.instanceColor!, oldColor = Array.from(color.array.slice(0, 3));
      const width = wire.geometry.getAttribute("spatialWidth"), opacity = wire.geometry.getAttribute("spatialOpacity");
      const saved = { count: wire.count, width: width.getX(0), opacity: opacity.getX(0) };
      wire.getMatrixAt(entry.slot, matrix); wire.setMatrixAt(0, matrix);
      color.setXYZ(0, color.getX(entry.slot), color.getY(entry.slot), color.getZ(entry.slot));
      width.setX(0, width.getX(entry.slot)); opacity.setX(0, opacity.getX(entry.slot));
      const changed = (): void => { wire.instanceMatrix.needsUpdate = true; color.needsUpdate = true; width.needsUpdate = true; opacity.needsUpdate = true; };
      for (const { mesh } of objects) mesh.visible = mesh === wire;
      wire.count = 1; changed();
      return { wire, setEnds(start, end): void {
        matrix.set(1, 0, end.x - start.x, start.x, 0, 1, end.y - start.y, start.y, 0, 0, end.z - start.z, start.z, 0, 0, 0, 1);
        wire.setMatrixAt(0, matrix); changed();
      }, restore(): void {
        wire.setMatrixAt(0, originalMatrix); color.setXYZ(0, oldColor[0], oldColor[1], oldColor[2]);
        width.setX(0, saved.width); opacity.setX(0, saved.opacity); wire.count = saved.count;
        for (const { mesh, visible } of objects) mesh.visible = visible;
        changed();
      } };
    };
    inspected.__THREE_DEVTOOLS__ = new EventTarget();
    inspected.__THREE_DEVTOOLS__.addEventListener("observe", event => {
      const renderer = (event as CustomEvent<WebGLRenderer>).detail;
      if (!("isWebGLRenderer" in renderer) || renderer.isWebGLRenderer !== true) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        inspected.renderedGraph = { scene: scene as Scene, camera, renderer };
        inspected.renderedFrames = (inspected.renderedFrames ?? 0) + 1;
        let spheres = 0;
        scene.traverse(object => {
          const batch = (object as DrawMesh).userData.spatialBatch;
          if (batch?.kind === "nodes") spheres += batch.entries.length;
        });
        const pieces = inspected.renderedPieces!;
        if (spheres !== pieces[pieces.length - 1]) pieces.push(spheres);
        render(scene, camera);
      };
    });
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("graph-svg");
      if (!container) return;
      new MutationObserver(() => {
        const busy = container.getAttribute("aria-busy") === "true", changes = inspected.busyChanges!;
        if (!changes.length || changes[changes.length - 1].busy !== busy) changes.push({ busy, frame: inspected.renderedFrames ?? 0 });
      }).observe(container, { attributes: true, attributeFilter: ["aria-busy"] });
    });
  });
}

/** Memberships actually submitted, including pieces painted for a single frame. */
export async function renderedPieces(page: Page): Promise<number[]> {
  return page.evaluate(() => ((window as unknown as ObservedWindow).renderedPieces ?? []).filter(count => count > 0));
}

/** Actual draws and the container's busy/settled transitions, not animation-callback counts. */
export async function engineActivity(page: Page): Promise<{ frames: number; changes: Array<{ busy: boolean; frame: number }> }> {
  return page.evaluate(() => {
    const inspected = window as unknown as ObservedWindow;
    return { frames: inspected.renderedFrames ?? 0, changes: [...(inspected.busyChanges ?? [])] };
  });
}

/** Mark stable wire-to-buffer bindings so updates can prove they retained surviving identities. */
export async function markRenderedLinks(page: Page, token: string): Promise<number> {
  return page.evaluate(mark => {
    const observed = window as unknown as ObservedWindow; let count = 0;
    observed.renderedGraph!.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "links") return;
      for (const entry of batch.entries) { observed.linkMarks!.set(entry, { token: mark, mesh }); count++; }
    });
    return count;
  }, token);
}

/** Surviving wires retain both their binding and GPU batch, including across historical renames. */
export async function markedRenderedLinks(page: Page, token: string): Promise<{ marked: number; total: number }> {
  return page.evaluate(mark => {
    const observed = window as unknown as ObservedWindow; let marked = 0, total = 0;
    observed.renderedGraph!.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "links") return;
      for (const entry of batch.entries) {
        const saved = observed.linkMarks!.get(entry);
        if (saved?.token === mark && saved.mesh === mesh) marked++;
        total++;
      }
    });
    return { marked, total };
  }, token);
}

/** Read identity from the picking index and geometry/alpha/positions from the actual uploaded instances. */
export async function renderedNodes(page: Page) {
  return page.evaluate(() => {
    const inspected = window as unknown as ObservedWindow, observed = inspected.renderedGraph!;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    const nodes: Array<{ id: string; name: string; directory?: string; files?: number; x: number; y: number; depth: number;
      distance: number; opacity: number; radius: number; screenRadius: number; world: { x: number; y: number; z: number } }> = [];
    observed.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "nodes") return;
      for (const entry of batch.entries) {
        const data = entry.data, drawn = inspected.drawnInstance!(mesh, entry), position = drawn.center;
        const projected = position.clone().project(observed.camera), right = observed.camera.matrixWorld.elements;
        const rim = position.clone().add(position.clone().set(right[0], right[1], right[2]).multiplyScalar(drawn.radius)).project(observed.camera);
        nodes.push({ id: data.id!, name: data.name ?? data.id!, directory: data.directoryPath, files: data.directoryFileCount,
          x: rect.left + (projected.x + 1) * rect.width / 2, y: rect.top + (1 - projected.y) * rect.height / 2,
          depth: projected.z, distance: position.distanceTo(observed.camera.position), opacity: drawn.opacity, radius: drawn.radius,
          screenRadius: Math.abs(rim.x - projected.x) * rect.width / 2, world: { x: position.x, y: position.y, z: position.z } });
      }
    });
    return nodes;
  });
}

/** Read each wire's uploaded axis, base width and visibility beside its documented relationship identity. */
export async function renderedLinks(page: Page) {
  return page.evaluate(() => {
    const inspected = window as unknown as ObservedWindow, observed = inspected.renderedGraph!;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    type Point = { x: number; y: number; z: number };
    const links: Array<{ source: string; target: string; kind: string; count: number; visible: boolean; start: Point; end: Point; length: number; width: number }> = [];
    observed.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "links") return;
      for (const entry of batch.entries) {
        const data = entry.data, drawn = inspected.drawnInstance!(mesh, entry), material = mesh.material;
        const width = !Array.isArray(material) && "resolution" in material
          ? mesh.geometry.getAttribute("spatialWidth").getX(entry.slot) * rect.height / (material.resolution as { y: number }).y : NaN;
        const point = (z: number): Point => { const value = drawn.point(z); return { x: value.x, y: value.y, z: value.z }; };
        links.push({ source: typeof data.source === "string" ? data.source : data.source!.id,
          target: typeof data.target === "string" ? data.target : data.target!.id, kind: data.kind ?? "", count: data.count ?? 0,
          visible: drawn.visible, start: point(0), end: point(1), length: drawn.point(0).distanceTo(drawn.point(1)), width });
      }
    });
    return links;
  });
}
