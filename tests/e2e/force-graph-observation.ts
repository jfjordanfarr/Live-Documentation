import type { Page } from "@playwright/test";
import type { Camera, Mesh, Scene, WebGLRenderer } from "three";

type ObservedWindow = Window & {
  __THREE_DEVTOOLS__: EventTarget;
  renderedGraph?: { scene: Scene; camera: Camera };
  /** Frames drawn since the page opened; the library ticks its engine at most once per frame. */
  renderedFrames?: number;
  /** Every change of the graph container's aria-busy, with the frame it happened on. */
  busyChanges?: Array<{ busy: boolean; frame: number }>;
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
    inspected.__THREE_DEVTOOLS__ = new EventTarget();
    inspected.__THREE_DEVTOOLS__.addEventListener("observe", event => {
      const renderer = (event as CustomEvent<WebGLRenderer>).detail;
      if (!renderer.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        inspected.renderedGraph = { scene: scene as Scene, camera };
        inspected.renderedFrames = (inspected.renderedFrames ?? 0) + 1;
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
      if (mesh.userData.observationMark === mark) marked++;
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
      const position = mesh.getWorldPosition(mesh.position.clone());
      const projected = position.clone().project(observed.camera);
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const radius = (mesh.geometry.boundingSphere?.radius ?? 0) * mesh.scale.x;
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
        opacity: mesh.material.opacity,
        radius,
        screenRadius,
        world: { x: position.x, y: position.y, z: position.z }
      });
    });
    return nodes;
  });
}

/**
 * Read relationship kinds, visibility and where each line is drawn, without reaching into the Explorer's own state. A
 * link is a unit tube the library stands at its source, turns toward its target and stretches by `scale.z`; its drawn
 * ends are the tube's two ends in world space, and a line the library never positioned stays at the origin with length 1.
 */
export async function renderedLinks(page: Page) {
  return page.evaluate(() => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    type Point = { x: number; y: number; z: number };
    const links: Array<{ source: string; target: string; kind: string; count: number; visible: boolean; start: Point; end: Point; length: number }> = [];
    observed.scene.traverse(object => {
      const mesh = object as GraphMesh;
      const data = mesh.__data;
      if (mesh.__graphObjType !== "link" || !data?.source || !data.target) return;
      mesh.updateWorldMatrix(true, false);
      const point = (z: number): Point => {
        const world = mesh.localToWorld(mesh.position.clone().set(0, 0, z));
        return { x: world.x, y: world.y, z: world.z };
      };
      links.push({
        source: typeof data.source === "string" ? data.source : data.source.id,
        target: typeof data.target === "string" ? data.target : data.target.id,
        kind: data.kind ?? "",
        count: data.count ?? 0,
        visible: mesh.visible,
        start: point(0),
        end: point(1),
        length: mesh.scale.z
      });
    });
    return links;
  });
}
