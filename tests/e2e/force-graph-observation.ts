import { expect, type Page } from "@playwright/test";
import type { BufferGeometry, Camera, InstancedMesh, Mesh, Scene, Vector3, WebGLRenderer } from "three";

import type { SpatialDrawEntry } from "../../packages/explorer/src/client/views/forceGraphBatches";

interface Datum {
  id?: string; name?: string; directoryPath?: string; directoryFileCount?: number;
  source?: string | { id: string }; target?: string | { id: string }; kind?: string; count?: number; forward?: number; backward?: number;
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

/**
 * Wait for the picture to come to rest, bounded twice. The seconds a settle takes measure the machine as much as the
 * picture: the gate's software renderer draws this repository's whole picture at about four frames a second. The bound
 * in substeps of the motion, counted from the wait's start as the page says them (`data-motion-substeps`), says whether
 * the picture came to rest at all: past it, it is not coming to rest, however fast the machine. Until 2026-11-19 the
 * bound counted drawn frames, when a frame took one substep; a frame now takes as many as fit in its ten milliseconds,
 * so frames to rest depend on the machine and substeps do not, and each bound keeps its number in the new unit. The
 * clock, the case's seconds as they stood before the bound, is a soft expectation: a slow settle fails the case, as the
 * owner wants performance kept a red-hot sticking point (2026-11-12), and the case goes on to check the picture at
 * rest, so a red result says by itself whether the picture was wrong or the machine was slow. Each settle writes one
 * line to the test's output, which the gate's `list` reporter prints.
 */
export async function cameToRest(page: Page, bounds: { label: string; substeps: number; seconds: number }): Promise<void> {
  const substepsNow = (): Promise<number> => page.evaluate(() => Number(document.getElementById("graph-svg")?.dataset.motionSubsteps ?? 0));
  const began = Date.now(), from = { frames: (await engineActivity(page)).frames, substeps: await substepsNow() };
  // Polled four times a second in the page, with no time limit of its own: the bound in substeps ends it.
  const reading = await page.waitForFunction(({ from, bound }) => {
    const container = document.getElementById("graph-svg");
    const substeps = Number(container?.dataset.motionSubsteps ?? 0) - from.substeps;
    const frames = ((window as unknown as ObservedWindow).renderedFrames ?? 0) - from.frames;
    const still = container?.getAttribute("aria-busy") === "false";
    return still || substeps >= bound ? { still, substeps, frames } : null;
  }, { from, bound: bounds.substeps }, { polling: 250, timeout: 0 });
  const { still, substeps, frames } = (await reading.jsonValue())!;
  const seconds = (Date.now() - began) / 1000, rate = (frames / seconds).toFixed(2), took = seconds.toFixed(1);
  console.log(`came to rest? ${bounds.label}: ${still ? "yes" : "no"}, ${substeps} substeps in ${frames} frames, ${took} s at ${rate} frames a second; bounds ${bounds.substeps} substeps, ${bounds.seconds} s`);
  expect(still, `the picture did not come to rest within ${bounds.substeps} substeps of its motion; after ${substeps} substeps, ${frames} frames and ${took} s it was still moving`).toBe(true);
  expect.soft(seconds, `the picture came to rest in ${substeps} substeps and ${frames} frames, which took ${took} s on this machine at ${rate} frames a second; the clock allows ${bounds.seconds} s. Slow, not broken`)
    .toBeLessThanOrEqual(bounds.seconds);
}

/**
 * Hold that the actions the 3D map offers are the given body's, read in one look and never waited for; where they are
 * another's, or none, the failure says whose they are as the page names them, what a press at the pointer's place would
 * take hold of, whether the map says it is building and busy, and how far its motion has run. A case that goes on to
 * press one of a body's actions by its name calls this first: pressed blind, the button of a body whose actions are not
 * the ones offered is waited for until the case's time runs out, and the failure then says only that it was not found
 * (the landing of 2026-11-22, AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/landing2-3d/README.md).
 */
export async function expectActionsOf(page: Page, id: string, pointer: { x: number; y: number }): Promise<void> {
  const look = await page.evaluate(({ x, y }) => {
    const container = document.getElementById("graph-svg"), strip = document.querySelector<HTMLElement>(".force-graph-actions");
    const pick = (window as unknown as { renderedGraph?: { scene: { userData: { spatialPick?(x: number, y: number): string | null } } } }).renderedGraph?.scene.userData.spatialPick;
    return {
      offered: strip && !strip.hidden ? { id: strip.dataset.nodeId ?? null, name: strip.getAttribute("aria-label") } : null,
      under: pick ? pick(x, y) ?? "the background" : "not known, the scene is not observed",
      building: container?.dataset.building ?? null, busy: container?.getAttribute("aria-busy") ?? null, substeps: container?.dataset.motionSubsteps ?? null,
    };
  }, pointer);
  const whose = look.offered ? `"${look.offered.name}" (${look.offered.id})` : "none";
  expect(look.offered?.id ?? null, `the actions offered should be those of ${id}; they are: ${whose}. A press at the pointer's place (${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}) would take hold of: ${look.under}. `
    + `The map ${look.building ? `says it is building (${look.building})` : "does not say it is building"}; aria-busy is ${look.busy}; its motion has run ${look.substeps ?? "no"} substeps`).toBe(id);
}

/**
 * A case's own clock, kept as a soft expectation at its end: the case's alarm on performance, apart from its hard
 * timeout, which is only a safety net for a page that stops drawing. Call it at the case's start; call what it returns
 * at the case's end.
 */
export function caseClock(seconds: number): () => void {
  const began = Date.now();
  return () => {
    const took = (Date.now() - began) / 1000;
    console.log(`case clock: ${took.toFixed(1)} s; the clock allows ${seconds} s`);
    expect.soft(took, `the case took ${took.toFixed(1)} s on this machine; its clock allows ${seconds} s. Slow, not broken`).toBeLessThanOrEqual(seconds);
  };
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
      distance: number; opacity: number; radius: number; screenRadius: number; ring: boolean; world: { x: number; y: number; z: number } }> = [];
    // The rings batch has one entry per sphere, in the spheres' order, enabled where the sphere wears a ring (2026-11-02).
    let rings: DrawMesh | undefined;
    observed.scene.traverse(object => { const mesh = object as DrawMesh; if (mesh.userData.spatialBatch?.kind === "rings") rings = mesh; });
    observed.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "nodes") return;
      for (const [index, entry] of batch.entries.entries()) {
        const data = entry.data, drawn = inspected.drawnInstance!(mesh, entry), position = drawn.center;
        const ring = rings?.userData.spatialBatch!.entries[index]?.enabled ?? false;
        const projected = position.clone().project(observed.camera), right = observed.camera.matrixWorld.elements;
        const rim = position.clone().add(position.clone().set(right[0], right[1], right[2]).multiplyScalar(drawn.radius)).project(observed.camera);
        nodes.push({ id: data.id!, name: data.name ?? data.id!, directory: data.directoryPath, files: data.directoryFileCount,
          x: rect.left + (projected.x + 1) * rect.width / 2, y: rect.top + (1 - projected.y) * rect.height / 2,
          depth: projected.z, distance: position.distanceTo(observed.camera.position), opacity: drawn.opacity, radius: drawn.radius,
          screenRadius: Math.abs(rim.x - projected.x) * rect.width / 2, ring, world: { x: position.x, y: position.y, z: position.z } });
      }
    });
    return nodes;
  });
}

/**
 * Read each wire's uploaded axis, base width, alpha, colour and visibility beside its documented relationship
 * identity. The axis runs between the two spheres' drawn surfaces (2026-10-30), in the picture's units and on the
 * screen. The colour is the one RGB the shader draws the whole wire in (the flow number that ran a gradient along it
 * was withdrawn with the gradient, 2026-10-31).
 */
export async function renderedLinks(page: Page) {
  return page.evaluate(() => {
    const inspected = window as unknown as ObservedWindow, observed = inspected.renderedGraph!;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    type Point = { x: number; y: number; z: number };
    const links: Array<{ source: string; target: string; kind: string; count: number; forward: number; backward: number; visible: boolean;
      start: Point; end: Point; screen: { start: { x: number; y: number }; end: { x: number; y: number } };
      length: number; width: number; opacity: number; color: [number, number, number] }> = [];
    observed.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "links") return;
      for (const entry of batch.entries) {
        const data = entry.data, drawn = inspected.drawnInstance!(mesh, entry), material = mesh.material;
        const width = !Array.isArray(material) && "resolution" in material
          ? mesh.geometry.getAttribute("spatialWidth").getX(entry.slot) * rect.height / (material.resolution as { y: number }).y : NaN;
        const point = (z: number): Point => { const value = drawn.point(z); return { x: value.x, y: value.y, z: value.z }; };
        const onScreen = (z: number): { x: number; y: number } => {
          const projected = drawn.point(z).project(observed.camera);
          return { x: rect.left + (projected.x + 1) * rect.width / 2, y: rect.top + (1 - projected.y) * rect.height / 2 };
        };
        links.push({ source: typeof data.source === "string" ? data.source : data.source!.id,
          target: typeof data.target === "string" ? data.target : data.target!.id, kind: data.kind ?? "", count: data.count ?? 0,
          forward: data.forward ?? 0, backward: data.backward ?? 0,
          visible: drawn.visible, start: point(0), end: point(1), screen: { start: onScreen(0), end: onScreen(1) },
          length: drawn.point(0).distanceTo(drawn.point(1)), width,
          opacity: drawn.opacity, color: [mesh.instanceColor!.getX(entry.slot), mesh.instanceColor!.getY(entry.slot), mesh.instanceColor!.getZ(entry.slot)] });
      }
    });
    return links;
  });
}

type Sphere = Awaited<ReturnType<typeof renderedNodes>>[number];
type Wire = Awaited<ReturnType<typeof renderedLinks>>[number];

/** Whether a wire is a documented reference between two files, rather than containment or a document's citation. */
export const referenceWire = (wire: { kind: string }): boolean => wire.kind !== "containment" && wire.kind !== "related-doc" && wire.kind !== "cited-by";

/**
 * A point on a reference wire where a hover reaches the wire and nothing else: the middle of the longest stroke on
 * screen whose middle stands clear of every sphere, inside the canvas, and on the bare canvas rather than a name or a
 * control, since a sphere or a label under the pointer takes the hover instead.
 */
export async function clearStroke(page: Page, spheres: readonly Sphere[], wires: readonly Wire[]): Promise<{ x: number; y: number } | undefined> {
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const strokes = wires.filter(referenceWire).map(wire => ({
    middle: { x: (wire.screen.start.x + wire.screen.end.x) / 2, y: (wire.screen.start.y + wire.screen.end.y) / 2 },
    span: Math.hypot(wire.screen.end.x - wire.screen.start.x, wire.screen.end.y - wire.screen.start.y)
  })).filter(({ middle }) => middle.x > frame.x + 20 && middle.x < frame.x + frame.width - 20 && middle.y > frame.y + 20 && middle.y < frame.y + frame.height - 20
    && spheres.every(sphere => Math.hypot(sphere.x - middle.x, sphere.y - middle.y) > sphere.screenRadius + 12)).sort((a, b) => b.span - a.span);
  for (const { middle } of strokes) {
    if (await page.evaluate(point => document.elementFromPoint(point.x, point.y)?.tagName === "CANVAS", middle)) return middle;
  }
  return undefined;
}

/** What a ray through a point of the 3D map meets, nearest first, along the ray in the picture's units. */
export interface RayReading {
  /** What the page's own picker gives there (`spatialPick`, which a press and a hover use), null for the background. */
  pick: string | null;
  /** Whether the canvas itself is under the point, no name or control. */
  canvas: boolean;
  /** Every drawn sphere the ray passes through: where it enters and leaves it. */
  spheres: Array<{ id: string; enter: number; exit: number }>;
  /** Every wrapper's skin the ray crosses, a directory shell's or a wrapped group's: its first and last crossing. */
  skins: Array<{ seed: string; enter: number; exit: number }>;
}

/**
 * Read the ray through each point from the uploaded picture, independently of the page's picker (2026-11-23): each drawn
 * sphere as the true sphere its instance matrix says, and every triangle of the wrappers' one mesh, either face. The
 * picker's own answer is read beside it, so a case can find a point where a skin stands before a sphere and hold what
 * the picker does there (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/picking/README.md`).
 */
export async function rayAt(page: Page, points: ReadonlyArray<{ x: number; y: number }>): Promise<RayReading[]> {
  return page.evaluate(points => {
    type Vec = Vector3;
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    const canvas = document.querySelector("#graph-svg canvas")!, rect = canvas.getBoundingClientRect();
    const pick = (observed.scene.userData as { spatialPick(x: number, y: number): string | null }).spatialPick;
    const drawn: Array<{ id: string; x: number; y: number; z: number; r: number }> = [];
    observed.scene.traverse(object => {
      const mesh = object as DrawMesh, batch = mesh.userData.spatialBatch;
      if (batch?.kind !== "nodes") return;
      for (const entry of batch.entries) {
        if (!entry.enabled || entry.slot >= mesh.count) continue;
        const matrix = mesh.matrixWorld.clone(); mesh.getMatrixAt(entry.slot, matrix); matrix.premultiply(mesh.matrixWorld);
        const e = matrix.elements;
        drawn.push({ id: entry.data.id!, x: e[12], y: e[13], z: e[14], r: Math.hypot(e[0], e[1], e[2]) });
      }
    });
    const wrapper = observed.scene.getObjectByName("Spatial wrappers") as Mesh<BufferGeometry>;
    const ranges = (wrapper.userData.spatialWrappers as { ranges: Array<{ seed: string }> }).ranges;
    const positions = wrapper.visible ? wrapper.geometry.getAttribute("position").array : new Float32Array();
    const groups = wrapper.visible ? wrapper.geometry.getAttribute("wrapperGroup").array : new Float32Array();
    const indices = wrapper.visible ? wrapper.geometry.getIndex()!.array : new Uint32Array();
    const triangles = Math.min(indices.length, wrapper.geometry.drawRange.count);
    return points.map(({ x, y }) => {
      const origin = observed.camera.position.clone() as Vec;
      const direction = (observed.camera.position.clone() as Vec).set((x - rect.left) / rect.width * 2 - 1, 1 - (y - rect.top) / rect.height * 2, 0.5)
        .unproject(observed.camera).sub(origin).normalize();
      const spheres: RayReading["spheres"] = [];
      for (const sphere of drawn) {
        const cx = sphere.x - origin.x, cy = sphere.y - origin.y, cz = sphere.z - origin.z;
        const along = cx * direction.x + cy * direction.y + cz * direction.z, off = cx * cx + cy * cy + cz * cz - along * along;
        if (off > sphere.r * sphere.r) continue;
        const half = Math.sqrt(sphere.r * sphere.r - off);
        if (along + half > 0) spheres.push({ id: sphere.id, enter: along - half, exit: along + half });
      }
      const crossings = new Map<number, number[]>();
      for (let i = 0; i < triangles; i += 3) {
        const a = 3 * indices[i], b = 3 * indices[i + 1], c = 3 * indices[i + 2];
        const e1x = positions[b] - positions[a], e1y = positions[b + 1] - positions[a + 1], e1z = positions[b + 2] - positions[a + 2];
        const e2x = positions[c] - positions[a], e2y = positions[c + 1] - positions[a + 1], e2z = positions[c + 2] - positions[a + 2];
        const px = direction.y * e2z - direction.z * e2y, py = direction.z * e2x - direction.x * e2z, pz = direction.x * e2y - direction.y * e2x;
        const det = e1x * px + e1y * py + e1z * pz;
        if (Math.abs(det) < 1e-12) continue;
        const inverse = 1 / det, tx = origin.x - positions[a], ty = origin.y - positions[a + 1], tz = origin.z - positions[a + 2];
        const u = (tx * px + ty * py + tz * pz) * inverse;
        if (u < 0 || u > 1) continue;
        const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
        const v = (direction.x * qx + direction.y * qy + direction.z * qz) * inverse;
        if (v < 0 || u + v > 1) continue;
        const t = (e2x * qx + e2y * qy + e2z * qz) * inverse;
        if (t <= 0) continue;
        const group = groups[indices[i]], list = crossings.get(group) ?? [];
        list.push(t); crossings.set(group, list);
      }
      const skins = [...crossings].map(([group, ts]) => ({ seed: ranges[group].seed, enter: Math.min(...ts), exit: Math.max(...ts) }));
      spheres.sort((p, q) => p.enter - q.enter); skins.sort((p, q) => p.enter - q.enter);
      return { pick: pick(x, y), canvas: document.elementFromPoint(x, y) === canvas, spheres, skins };
    });
  }, points);
}

/** Read skin vertices and interior marks from uploaded geometry, independently of transition capture/projection code. */
export async function renderedBodyCarriers(page: Page) {
  return page.evaluate(() => {
    const observed = (window as unknown as ObservedWindow).renderedGraph!;
    const frame = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    const wrapper = observed.scene.getObjectByName("Spatial wrappers") as Mesh<BufferGeometry>;
    const positions = wrapper.geometry.getAttribute("position"), groups = wrapper.geometry.getAttribute("wrapperGroup");
    const ranges = (wrapper.userData.spatialWrappers as { ranges: Array<{ seed: string; x: number; y: number; z: number }> }).ranges;
    const project = (x: number, y: number, z: number, mesh: Mesh) => {
      const point = observed.camera.position.clone().set(x, y, z).applyMatrix4(mesh.matrixWorld).project(observed.camera);
      return { x: frame.left + (point.x + 1) * frame.width / 2, y: frame.top + (1 - point.y) * frame.height / 2 };
    };
    const files = observed.scene.getObjectByName("Spatial shell files") as InstancedMesh;
    const records = files.userData.spatialUnits as Array<{ seed: string; id: string }>;
    return ranges.map((range, group) => {
      const boundary = [] as Array<{ x: number; y: number }>;
      for (let index = 0; index < positions.count; index++) {
        if (groups.getX(index) === group) boundary.push(project(positions.getX(index), positions.getY(index), positions.getZ(index), wrapper));
      }
      const marks = records.flatMap((record, slot) => {
        if (record.seed !== range.seed || slot >= files.count) return [];
        const matrix = observed.camera.matrixWorld.clone(); files.getMatrixAt(slot, matrix); matrix.premultiply(files.matrixWorld);
        const center = observed.camera.position.clone().set(0, 0, 0).applyMatrix4(matrix);
        const point = center.clone().project(observed.camera);
        const radius = Math.hypot(matrix.elements[0], matrix.elements[1], matrix.elements[2]);
        const right = observed.camera.matrixWorld.elements;
        const rim = center.clone().add(center.clone().set(right[0], right[1], right[2]).multiplyScalar(radius)).project(observed.camera);
        const colors = files.instanceColor!;
        return [{ id: record.id, x: frame.left + (point.x + 1) * frame.width / 2, y: frame.top + (1 - point.y) * frame.height / 2,
          radius: Math.abs(rim.x - point.x) * frame.width / 2,
          color: [colors.getX(slot), colors.getY(slot), colors.getZ(slot)], alpha: files.geometry.getAttribute("spatialOpacity").getX(slot) }];
      });
      return { id: range.seed, ...project(range.x, range.y, range.z, wrapper), boundary, files: marks };
    });
  });
}
