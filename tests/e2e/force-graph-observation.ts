import type { Page } from "@playwright/test";
import type { Camera, Mesh, Scene, Vector3, WebGLRenderer } from "three";

import type { SpatialBatchInstance } from "../../packages/explorer/src/client/views/forceGraphBatches";

type ObservedWindow = Window & {
  __THREE_DEVTOOLS__: EventTarget;
  renderedGraph?: { scene: Scene; camera: Camera; renderer: WebGLRenderer };
  /** Frames drawn since the page opened; the library ticks its engine at most once per frame. */
  renderedFrames?: number;
  /** Every change of the graph container's aria-busy, with the frame it happened on. */
  busyChanges?: Array<{ busy: boolean; frame: number }>;
  /** The sizes the picture has had, as spheres drawn, each noted on the frame that first drew it (2026-10-28). */
  renderedPieces?: number[];
  drawnMesh?: (mesh: GraphMesh) => { center: Vector3; radius: number; opacity: number; visible: boolean; point: (z: number) => Vector3 };
};

type GraphMesh = Mesh & {
  __graphObjType?: string;
  __data?: {
    id?: string;
    name?: string;
    directoryPath?: string;
    directoryFileCount?: number;
    source?: string | { id: string };
    target?: string | { id: string };
    kind?: string;
    count?: number;
  };
};

/**
 * Observe the meshes and camera actually sent to WebGL through Three's development-tool event, count the frames drawn, and
 * note on which frame the graph container said it was busy or settled, so that a spec can count the engine's ticks between
 * a change and its settle without reaching into the Explorer's state (2026-10-18).
 */
export async function observeGraph(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const inspected = window as unknown as ObservedWindow;
    inspected.renderedFrames = 0;
    inspected.busyChanges = [];
    inspected.renderedPieces = [];
    inspected.drawnMesh = mesh => {
      const batch = mesh.userData.spatialBatch as SpatialBatchInstance | undefined;
      const nativePoint = (z: number): Vector3 => mesh.position.clone().set(0, 0, z).applyMatrix4(mesh.matrixWorld);
      if (!batch) {
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        const sphere = mesh.geometry.boundingSphere!.clone().applyMatrix4(mesh.matrixWorld);
        return { center: sphere.center, radius: sphere.radius,
          opacity: Array.isArray(mesh.material) ? 1 : mesh.material.opacity, visible: mesh.visible, point: nativePoint };
      }
      const matrix = mesh.matrixWorld.clone();
      batch.mesh.getMatrixAt(batch.instance, matrix);
      matrix.premultiply(batch.mesh.matrixWorld);
      if (!batch.mesh.geometry.boundingSphere) batch.mesh.geometry.computeBoundingSphere();
      const sphere = batch.mesh.geometry.boundingSphere!.clone().applyMatrix4(matrix);
      return { center: sphere.center, radius: sphere.radius,
        opacity: batch.mesh.geometry.getAttribute("spatialOpacity").getX(batch.instance), visible: batch.enabled,
        point: z => mesh.position.clone().set(0, 0, z).applyMatrix4(matrix) };
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
        scene.traverse(object => { if ((object as GraphMesh).__graphObjType === "node") spheres++; });
        const pieces = inspected.renderedPieces!;
        if (spheres !== pieces[pieces.length - 1]) pieces.push(spheres);
        render(scene, camera);
      };
    });
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("graph-svg");
      if (!container) return;
      new MutationObserver(() => {
        const busy = container.getAttribute("aria-busy") === "true";
        const last = inspected.busyChanges![inspected.busyChanges!.length - 1];
        if (!last || last.busy !== busy) inspected.busyChanges!.push({ busy, frame: inspected.renderedFrames ?? 0 });
      }).observe(container, { attributes: true, attributeFilter: ["aria-busy"] });
    });
  });
}

/** The sizes the picture has had, as spheres drawn, from the first sphere on: a piece drawn for one frame is still seen. */
export async function renderedPieces(page: Page): Promise<number[]> {
  return page.evaluate(() => ((window as unknown as ObservedWindow).renderedPieces ?? []).filter(count => count > 0));
}

/** The frames drawn so far, and when the graph last became busy and last settled, by frame. */
export async function engineActivity(page: Page): Promise<{ frames: number; changes: Array<{ busy: boolean; frame: number }> }> {
  return page.evaluate(() => {
    const inspected = window as unknown as ObservedWindow;
    return { frames: inspected.renderedFrames ?? 0, changes: [...(inspected.busyChanges ?? [])] };
  });
}

/** Mark every rendered line's object with a token, so that a later count says how many objects a change kept; returns how many were marked. */
export async function markRenderedLinks(page: Page, token: string): Promise<number> {
  return page.evaluate(mark => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    let marked = 0;
    observed.scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (mesh.__graphObjType !== "link" || !mesh.__data?.source) return;
      mesh.userData.observationMark = mark;
      const batch = mesh.userData.spatialBatch as SpatialBatchInstance | undefined;
      mesh.userData.observationBatch = batch ?? null;
      marked++;
    });
    return marked;
  }, token);
}

/** How many rendered lines carry the token, beside how many there are. */
export async function markedRenderedLinks(page: Page, token: string): Promise<{ marked: number; total: number }> {
  return page.evaluate(mark => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    let marked = 0, total = 0;
    observed.scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (mesh.__graphObjType !== "link" || !mesh.__data?.source) return;
      total++;
      const batch = mesh.userData.spatialBatch as SpatialBatchInstance | undefined;
      if (mesh.userData.observationMark === mark && mesh.userData.observationBatch === (batch ?? null)) marked++;
    });
    return { marked, total };
  }, token);
}

/** Read native node identity, world/screen coordinates, actual material opacity and the rendered sphere's radius. */
export async function renderedNodes(page: Page) {
  return page.evaluate(() => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    const nodes: Array<{
      id: string; name: string; directory?: string; files?: number;
      x: number; y: number; depth: number; distance: number; opacity: number; radius: number;
      /** The rendered sphere's radius on the screen, in CSS pixels: its world radius projected along the camera's right. */
      screenRadius: number;
      world: { x: number; y: number; z: number };
    }> = [];
    observed.scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (mesh.__graphObjType !== "node" || !mesh.__data?.id || Array.isArray(mesh.material)) return;
      const drawn = (window as unknown as ObservedWindow).drawnMesh!(mesh);
      const position = drawn.center;
      const projected = position.clone().project(observed.camera);
      const radius = drawn.radius;
      const right = observed.camera.matrixWorld.elements;
      const rim = position.clone().add(position.clone().set(right[0], right[1], right[2]).multiplyScalar(radius)).project(observed.camera);
      const screenRadius = Math.abs(rim.x - projected.x) * rect.width / 2;
      nodes.push({
        id: mesh.__data.id,
        name: mesh.__data.name ?? mesh.__data.id,
        directory: mesh.__data.directoryPath,
        files: mesh.__data.directoryFileCount,
        x: rect.left + (projected.x + 1) * rect.width / 2,
        y: rect.top + (1 - projected.y) * rect.height / 2,
        depth: projected.z,
        distance: position.distanceTo(observed.camera.position),
        opacity: drawn.opacity,
        radius,
        screenRadius,
        world: { x: position.x, y: position.y, z: position.z }
      });
    });
    return nodes;
  });
}

/**
 * Read relationship kinds, visibility and where each line is drawn, without reaching into the Explorer's own state.
 * The library stands a unit-axis proxy at its source, turns it toward its target and stretches it by `scale.z`.
 * Width is the uploaded baseline; only full resistance makes it the apparent CSS-pixel diameter at every depth.
 */
export async function renderedLinks(page: Page) {
  return page.evaluate(() => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    type Point = { x: number; y: number; z: number };
    const links: Array<{ source: string; target: string; kind: string; count: number; visible: boolean; start: Point; end: Point; length: number; width: number }> = [];
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    observed.scene.traverse(object => {
      const mesh = object as GraphMesh;
      const data = mesh.__data;
      if (mesh.__graphObjType !== "link" || !data?.source || !data.target) return;
      mesh.updateWorldMatrix(true, false);
      const drawn = (window as unknown as ObservedWindow).drawnMesh!(mesh);
      // Read the uploaded width and viewport, independently of the product's accessor/count formula. The wire spec
      // separately measures rendered pixels, so this observation cannot hide a broken projection shader.
      const batch = mesh.userData.spatialBatch as SpatialBatchInstance | undefined;
      const material = batch?.mesh.material;
      const width = batch && material && "resolution" in material
        ? batch.mesh.geometry.getAttribute("spatialWidth").getX(batch.instance) * rect.height / material.resolution.y : NaN;
      const point = (z: number): Point => {
        const world = drawn.point(z);
        return { x: world.x, y: world.y, z: world.z };
      };
      links.push({
        source: typeof data.source === "string" ? data.source : data.source.id,
        target: typeof data.target === "string" ? data.target : data.target.id,
        kind: data.kind ?? "",
        count: data.count ?? 0,
        visible: drawn.visible,
        start: point(0),
        end: point(1),
        length: drawn.point(0).distanceTo(drawn.point(1)),
        width
      });
    });
    return links;
  });
}
