import { BufferAttribute, BufferGeometry, Color, ConeGeometry, DoubleSide, DynamicDrawUsage, FrontSide, Frustum, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, Quaternion, RingGeometry, ShaderMaterial, Sphere, SphereGeometry, Vector2, Vector3, Vector4, type Camera, type Intersection, type Raycaster, type Scene, type WebGLRenderer } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import { containedSpherePrimitive, ContainedSphereMaterial } from "./containedSphere";
import type { Placed, SpatialNode } from "./forceGraphLayout";
import { clipSpatialWireDepth, pickSpatialWire, spatialSizeScale } from "./forceGraphSizing";
import { mergeWrappers, wrapperAt, type GroupWrappers, type WrapperGeometry, type WrapperHull } from "./forceGraphWrappers";
import type { FrozenBodyMesh, FrozenBodyUnit, FrozenSpatialBody } from "./perspectiveBodies";

/** The outer edge of a frontier ring, in its sphere's drawn-radius units. */
export const SPATIAL_RING_OUTER_RADIUS = 1.6;

/** The endpoints already resolved by the graph feed. */
export interface SpatialDrawLink<N> { source: string | N; target: string | N }

/** A stable datum-to-buffer binding for picking; its slot follows the uploaded depth order. */
export interface SpatialDrawEntry<T> {
  data: T;
  slot: number;
  enabled: boolean;
  order: number;
}

/** Geometry shares a GPU batch; numeric working arrays keep preparation independent of graph-object shapes. */
export interface SpatialDrawBatch<T> {
  mesh: InstancedMesh<BufferGeometry, MeshLambertMaterial | MeshBasicMaterial | LineMaterial>;
  entries: SpatialDrawEntry<T>[];
  ordered: number[];
  visible: number[];
  unseen: number[];
  depths: Float64Array;
  serials: Float64Array;
  /** RGB, alpha and physical radius or wire width, in membership order. */
  appearance: Float64Array;
  enabled: Uint8Array;
  capacity: number;
}

/** Values with visual meaning, supplied by the view without involving the force model. */
export interface SpatialDrawStyle<N, L> {
  radius: (node: N) => number;
  nodeColor: (node: N) => string;
  linkColor: (link: L) => string;
  linkWidth: (link: L) => number;
  linkVisible: (link: L) => boolean;
  arrowLength: (link: L) => number;
  /** The colour of the ring around a sphere that has more behind it, or null for no ring (2026-11-02). */
  ring: (node: N) => string | null;
  /**
   * Whether a node is drawn as a sphere (every node, unless said): a directory shell is drawn as its wrapper alone
   * (2026-11-05), its radius kept for its wires, which end at its body rather than at a sphere drawn under the zoom's resistance.
   */
  sphere?: (node: N) => boolean;
}

/**
 * How the wrapped groups are drawn this frame (2026-11-05): each wrapper's opacity, as its seed's, and the growth of one
 * bursting open; the seed under the pointer or keyboard focus, whose wrapper the cloud with a rim outlines; and the
 * seeds bursting open, drawn but no longer picked.
 */
export interface SpatialWrapperStyle {
  alpha: (seed: string) => number;
  scale: (seed: string) => number;
  hovered: string | null;
  popping: ReadonlySet<string>;
}

/**
 * One unit a wrapper shows within its skin (2026-11-06), relative to its centre: a file, drawn as a sphere in its colour
 * at the size a sphere draws, never past the room it keeps, or a subdirectory's balloon, drawn at its body's size in the
 * skin's look.
 */
export interface SpatialWrapperUnit {
  id: string;
  kind: "file" | "directory";
  x: number;
  y: number;
  z: number;
  radius: number;
  reach: number;
  color?: string;
  /** The inner bubble a unit stands in, and how many bubbles deep it stands. */
  parent?: string;
  depth?: number;
  /** A bubble whose files are not drawn, which is drawn veiled so that it never looks as if it held few (2026-11-06, second round). */
  veiled?: boolean;
}

/** Pack documented nodes and wires straight into three instance buffers; camera changes never build scene proxies. */
export function createSpatialBuffers<N extends SpatialNode, L extends SpatialDrawLink<N>>(scene: Scene, style: SpatialDrawStyle<N, L>, renderer?: WebGLRenderer) {
  const alphaMaterial = (lit = true): MeshLambertMaterial | MeshBasicMaterial => {
    const material = lit ? new MeshLambertMaterial({ color: 0xffffff, transparent: true }) : new MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float spatialOpacity;\nvarying float vSpatialOpacity;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpatialOpacity = spatialOpacity;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vSpatialOpacity;")
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vSpatialOpacity;");
    };
    material.customProgramCacheKey = () => `spatial-instance-alpha-${lit ? "lit" : "flat"}`;
    return material;
  };
  /** Give a batch room for `capacity` instances: its matrices, colours, alphas and widths, afresh. */
  const allocate = <T>(batch: SpatialDrawBatch<T>, capacity: number): void => {
    const mesh = batch.mesh;
    if (batch.capacity) { mesh.dispose(); mesh.geometry.dispose(); }
    batch.capacity = capacity;
    const matrices = new Float32Array(16 * batch.capacity);
    for (let i = 0; i < matrices.length; i += 16) matrices[i] = matrices[i + 5] = matrices[i + 10] = matrices[i + 15] = 1;
    mesh.instanceMatrix = new InstancedBufferAttribute(matrices, 16).setUsage(DynamicDrawUsage);
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(3 * batch.capacity), 3).setUsage(DynamicDrawUsage);
    mesh.geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(batch.capacity), 1).setUsage(DynamicDrawUsage));
    if (mesh.material instanceof LineMaterial) mesh.geometry.setAttribute("spatialWidth", new InstancedBufferAttribute(new Float32Array(batch.capacity), 1).setUsage(DynamicDrawUsage));
    batch.depths = new Float64Array(batch.capacity); batch.serials = new Float64Array(batch.capacity);
    batch.appearance = new Float64Array(5 * batch.capacity); batch.enabled = new Uint8Array(batch.capacity);
  };
  const make = <T>(kind: string, geometry: BufferGeometry, material: MeshLambertMaterial | MeshBasicMaterial | LineMaterial, renderOrder = 0): SpatialDrawBatch<T> => {
    const mesh = new InstancedMesh(geometry, material, 1);
    mesh.name = `Spatial ${kind}`; mesh.count = 0; mesh.frustumCulled = false; mesh.renderOrder = renderOrder;
    const batch: SpatialDrawBatch<T> = { mesh, entries: [], ordered: [], visible: [], unseen: [], depths: new Float64Array(),
      serials: new Float64Array(), appearance: new Float64Array(), enabled: new Uint8Array(), capacity: 0 };
    mesh.userData.spatialBatch = { kind, entries: batch.entries };
    mesh.raycast = () => {};
    scene.add(mesh);
    // The instance attributes exist from the first draw, even with nothing to draw: the renderer compiles a mesh's
    // program on its first frame whatever its count, and the wire shader reads the instance colour, which Three
    // declares only for a mesh that has one. A first piece of one sphere has no wires (2026-10-31).
    allocate(batch, 1);
    return batch;
  };
  // The wires are drawn first and write their depth; the spheres and arrows come after and blend over them. A sphere in
  // front of a wire covers it by its own alpha, so a faded sphere lets the wire show through instead of cutting a hole
  // in it, and a sphere behind a wire stays behind it (2026-10-30; before, the spheres were drawn first and every
  // sphere, faded or not, cut the wires behind it).
  const nodes = make<N>("nodes", new SphereGeometry(1, 12, 12), alphaMaterial(), 10);
  const lineSource = new MeshLambertMaterial({ color: 0xffffff, transparent: true, depthWrite: true });
  const lines = make<L>("links", new BufferGeometry().copy(new LineSegmentsGeometry()), screenWireMaterial(lineSource), 0);
  lineSource.dispose();
  const arrows = make<L>("arrows", new ConeGeometry(.25, 1, 8).translate(0, .5, 0).rotateX(Math.PI / 2), alphaMaterial(), 10);
  // A ring around a sphere that has more behind it (the owner's choice of 2026-11-02): flat, turned to the camera, unlit
  // so that it reads the same from every side, drawn after the spheres and writing no depth, so that it cuts no wire.
  // One entry per sphere, enabled while the style gives it a colour, so that the set of rings follows the appearance.
  const rings = make<N>("rings", new RingGeometry(1.35, SPATIAL_RING_OUTER_RADIUS, 32), alphaMaterial(false), 11);
  const nodeEntries = new WeakMap<N, SpatialDrawEntry<N>>(), linkEntries = new WeakMap<L, SpatialDrawEntry<L>>(), arrowEntries = new WeakMap<L, SpatialDrawEntry<L>>();
  const ringEntries = new WeakMap<N, SpatialDrawEntry<N>>();
  const colors = new Map<string, { color: Color; alpha: number }>();
  let serial = 0, appearanceDirty = true;
  let wireScale = 1;
  let positions = new Float64Array(), clips = new Float64Array(), drawnRadii = new Float64Array(), nodeSeen = new Uint8Array();
  const billboard = new Quaternion();
  let lineEnds = new Uint32Array(), arrowEnds = new Uint32Array(), lineBounds = new Float64Array(), lineTrims = new Float64Array();
  const matrix = new Matrix4(), projection = new Matrix4(), rotation = new Matrix4();
  const clipStart = new Vector4(), clipEnd = new Vector4(), bounds: number[] = [];
  const frustum = new Frustum(), sphere = new Sphere(), point = new Vector3(), end = new Vector3(), scale = new Vector3(), quaternion = new Quaternion();
  const viewport = new Vector2(), up = new Vector3(0, 1, 0);
  const pickProxy = new Mesh(nodes.mesh.geometry, nodes.mesh.material);
  // The wrapped groups (2026-11-05): one mesh for every wrapper, drawn after the spheres and rings, writing no depth, so
  // that a wrapper veils what stands behind it and cuts no wire; its vertices are written from the seeds' live places.
  const wrapperMaterial = wrapperShader(false);
  const wrappers = new Mesh(new BufferGeometry(), wrapperMaterial);
  wrappers.name = "Spatial wrappers"; wrappers.frustumCulled = false; wrappers.renderOrder = 12; wrappers.visible = false;
  wrappers.raycast = () => {};
  wrappers.userData.spatialWrappers = { look: "off", seeds: [] as string[], popping: [] as string[], vertices: 0, triangles: 0, ranges: [] as unknown[] };
  scene.add(wrappers);
  // What a directory shell shows within its skin (2026-11-06): its own files as lit spheres in their kinds' colours, drawn
  // with the spheres and writing depth as they do, and its subdirectories as balloons in the skin's own look, drawn after
  // them and before the skins, writing none, so that each veil blends over what stands inside it. A shell whose skin is
  // not built yet stands as one balloon of its body, so that a shell born of a pop is seen at once.
  const unitMesh = (name: string, geometry: BufferGeometry, material: Material, renderOrder: number): InstancedMesh => {
    const mesh = new InstancedMesh(geometry, material, 1);
    mesh.name = name; mesh.count = 0; mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = renderOrder; mesh.raycast = () => {};
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(3), 3).setUsage(DynamicDrawUsage);
    geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(1), 1).setUsage(DynamicDrawUsage));
    mesh.userData.spatialUnits = [];
    scene.add(mesh);
    return mesh;
  };
  const containedFile = containedSpherePrimitive(renderer);
  const unitFiles = unitMesh("Spatial shell files", containedFile.geometry, containedFile.material ?? alphaMaterial(), 10);
  const balloonMaterial = wrapperShader(true);
  const unitBalloons = unitMesh("Spatial shell balloons", new SphereGeometry(1, 24, 16), balloonMaterial, 11);
  unitBalloons.geometry.setAttribute("spatialVeil", new InstancedBufferAttribute(new Float32Array(1), 1).setUsage(DynamicDrawUsage));
  const unitBindings = new Map<InstancedMesh, readonly { seed: string; id: string; kind: FrozenBodyUnit["kind"]; parent?: string; level?: number }[]>();
  let wrapperSeeds: readonly string[] = [], wrapperHullOf: (seed: string) => WrapperHull | undefined = () => undefined, wrapperLook: GroupWrappers = "off";
  let wrapperPlaceOf: (seed: string) => Placed | undefined = () => undefined;
  let wrapperUnitsOf: (seed: string) => readonly SpatialWrapperUnit[] | undefined = () => undefined;
  /** The zoom's resistance on a sphere this frame, which a shell's files within its skin draw at as the spheres do. */
  let sphereScale = 1;
  let wrapperStyle: SpatialWrapperStyle = { alpha: () => 1, scale: () => 1, hovered: null, popping: new Set() };
  let wrapperDrawn: WrapperGeometry = mergeWrappers([], () => undefined, () => undefined);
  const nodeIndex = new Map<string, number>();
  const seedPlace = { x: 0, y: 0, z: 0 };
  const hits: Intersection[] = [];
  const entryFor = <T extends object>(cache: WeakMap<T, SpatialDrawEntry<T>>, data: T): SpatialDrawEntry<T> => {
    let entry = cache.get(data);
    if (!entry) { entry = { data, slot: -1, enabled: true, order: serial++ }; cache.set(data, entry); }
    return entry;
  };
  const colorOf = (text: string): { color: Color; alpha: number } => {
    let found = colors.get(text);
    if (found) return found;
    let alpha = 1, rgb = text;
    if (/^#[\da-f]{8}$/i.test(text)) { alpha = parseInt(text.slice(7), 16) / 255; rgb = text.slice(0, 7); }
    const rgba = /^rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/.exec(text);
    if (rgba) { rgb = `rgb(${rgba[1]},${rgba[2]},${rgba[3]})`; alpha = Number(rgba[4]); }
    found = { color: new Color(rgb), alpha }; colors.set(text, found); return found;
  };
  const reserve = <T>(batch: SpatialDrawBatch<T>): void => {
    if (batch.entries.length > batch.capacity) allocate(batch, Math.max(batch.entries.length, 2 * batch.capacity));
    batch.ordered.length = batch.entries.length;
    for (let i = 0; i < batch.entries.length; i++) { batch.ordered[i] = i; batch.serials[i] = batch.entries[i].order; }
  };
  const refreshStyle = (): void => {
    if (!appearanceDirty) return;
    appearanceDirty = false;
    const read = <T>(batch: SpatialDrawBatch<T>, color: (data: T) => string, size: (data: T) => number,
      visible: (data: T) => boolean, alpha: number): void => {
      for (let i = 0; i < batch.entries.length; i++) {
        const entry = batch.entries[i], tint = colorOf(color(entry.data)), at = i * 5;
        batch.appearance[at] = tint.color.r; batch.appearance[at + 1] = tint.color.g; batch.appearance[at + 2] = tint.color.b;
        batch.appearance[at + 3] = alpha * tint.alpha; batch.appearance[at + 4] = size(entry.data);
        batch.enabled[i] = Number(entry.enabled = visible(entry.data));
      }
    };
    read(nodes, style.nodeColor, style.radius, style.sphere ?? (() => true), .75);
    read(lines, style.linkColor, link => Math.ceil(style.linkWidth(link) * 10) / 10, style.linkVisible, 1);
    read(arrows, style.linkColor, style.arrowLength, style.linkVisible, 3);
    // A ring takes its sphere's radius, read above, and its own colour and alpha; no colour, no ring.
    for (let i = 0; i < rings.entries.length; i++) {
      const ring = style.ring(rings.entries[i].data), tint = ring === null ? null : colorOf(ring), at = i * 5;
      rings.appearance[at] = tint?.color.r ?? 0; rings.appearance[at + 1] = tint?.color.g ?? 0; rings.appearance[at + 2] = tint?.color.b ?? 0;
      rings.appearance[at + 3] = tint?.alpha ?? 0; rings.appearance[at + 4] = nodes.appearance[at + 4];
      rings.enabled[i] = Number(rings.entries[i].enabled = tint !== null);
    }
  };
  const setData = (data: { nodes: N[]; links: L[] }): void => {
    const byId = new Map(data.nodes.map((node, index) => [node.id, index]));
    nodeIndex.clear();
    for (const [id, index] of byId) nodeIndex.set(id, index);
    nodes.entries.length = lines.entries.length = arrows.entries.length = rings.entries.length = 0;
    for (const node of data.nodes) { nodes.entries.push(entryFor(nodeEntries, node)); rings.entries.push(entryFor(ringEntries, node)); }
    for (const link of data.links) {
      lines.entries.push(entryFor(linkEntries, link));
      if (style.arrowLength(link) > 0) arrows.entries.push(entryFor(arrowEntries, link));
    }
    reserve(nodes); reserve(lines); reserve(arrows); reserve(rings);
    if (positions.length < nodes.capacity * 3) {
      positions = new Float64Array(nodes.capacity * 3); clips = new Float64Array(nodes.capacity * 4); drawnRadii = new Float64Array(nodes.capacity);
      nodeSeen = new Uint8Array(nodes.capacity);
    }
    if (lineEnds.length < lines.capacity * 2) { lineEnds = new Uint32Array(lines.capacity * 2); lineBounds = new Float64Array(lines.capacity * 4); lineTrims = new Float64Array(lines.capacity * 2); }
    if (arrowEnds.length < arrows.capacity * 2) arrowEnds = new Uint32Array(arrows.capacity * 2);
    const bind = (entries: SpatialDrawEntry<L>[], ends: Uint32Array): void => {
      for (let i = 0; i < entries.length; i++) {
        const link = entries[i].data;
        const a = byId.get(typeof link.source === "string" ? link.source : link.source.id), b = byId.get(typeof link.target === "string" ? link.target : link.target.id);
        if (a === undefined || b === undefined) throw new Error("A drawn wire needs two nodes in the displayed graph.");
        ends[2 * i] = a; ends[2 * i + 1] = b;
      }
    };
    bind(lines.entries, lineEnds); bind(arrows.entries, arrowEnds); appearanceDirty = true;
  };
  const depthOf = (x: number, y: number, z: number): number => {
    const e = projection.elements;
    return (e[2] * x + e[6] * y + e[10] * z + e[14]) / (e[3] * x + e[7] * y + e[11] * z + e[15]);
  };
  const sort = <T>(batch: SpatialDrawBatch<T>): void => {
    const { depths, serials, visible, unseen, ordered } = batch;
    visible.sort((a, b) => depths[b] - depths[a] || serials[a] - serials[b]);
    batch.mesh.count = visible.length;
    // Keep double-precision depth and the original tie order, starting the next sort from this one.
    let i = 0;
    for (const index of visible) ordered[i++] = index;
    for (const index of unseen) ordered[i++] = index;
  };
  const upload = <T>(batch: SpatialDrawBatch<T>, write: (array: InstancedBufferAttribute["array"], offset: number, index: number) => void): void => {
    const { mesh, ordered, appearance } = batch, opacity = mesh.geometry.getAttribute("spatialOpacity"), width = mesh.geometry.getAttribute("spatialWidth");
    if (!batch.entries.length) { mesh.count = 0; return; }
    const matrices = mesh.instanceMatrix.array, colors = mesh.instanceColor!.array, alphas = opacity.array, widths = width?.array;
    for (let slot = 0; slot < ordered.length; slot++) {
      const index = ordered[slot], at = index * 5, c = slot * 3;
      batch.entries[index].slot = slot;
      write(matrices, slot * 16, index);
      colors[c] = appearance[at]; colors[c + 1] = appearance[at + 1]; colors[c + 2] = appearance[at + 2];
      alphas[slot] = appearance[at + 3];
      if (widths) widths[slot] = appearance[at + 4];
    }
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor!.needsUpdate = true; opacity.needsUpdate = true;
    if (width) width.needsUpdate = true;
  };
  const update = (camera: Camera, width: number, height: number, nodeResistance: number, wireResistance: number, target: Vector3): void => {
    refreshStyle(); viewport.set(width, height);
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projection, camera.coordinateSystem, camera.reversedDepth);
    const pixelScale = Math.abs(camera.projectionMatrix.elements[5]) * height / 2;
    const nodeScale = sphereScale = spatialSizeScale(target, camera, height, nodeResistance);
    wireScale = spatialSizeScale(target, camera, height, wireResistance);
    nodes.visible.length = nodes.unseen.length = lines.visible.length = lines.unseen.length = arrows.visible.length = arrows.unseen.length = rings.visible.length = rings.unseen.length = 0;
    // Read each mutable layout position once. The far larger wire pass uses only contiguous numeric inputs.
    for (let i = 0; i < nodes.entries.length; i++) {
      const node = nodes.entries[i].data, p = i * 3, c = i * 4;
      const x = positions[p] = node.x ?? 0, y = positions[p + 1] = node.y ?? 0, z = positions[p + 2] = node.z ?? 0;
      drawnRadii[i] = nodes.appearance[i * 5 + 4] * (nodes.enabled[i] ? nodeScale : 1);
      clipStart.set(x, y, z, 1).applyMatrix4(projection).toArray(clips, c);
      nodes.depths[i] = clipStart.z / clipStart.w;
    }
    for (const i of nodes.ordered) {
      sphere.center.fromArray(positions, i * 3); sphere.radius = drawnRadii[i];
      const seen = frustum.intersectsSphere(sphere);
      nodeSeen[i] = Number(seen);
      (seen && nodes.enabled[i] ? nodes.visible : nodes.unseen).push(i);
    }
    for (const i of lines.ordered) {
      const a = lineEnds[2 * i], b = lineEnds[2 * i + 1];
      clipStart.fromArray(clips, a * 4); clipEnd.fromArray(clips, b * 4);
      lines.depths[i] = (clipStart.z + clipEnd.z) / (clipStart.w + clipEnd.w);
      // The wire runs from the drawn surface of one sphere to the other's (2026-10-30): it neither pierces its own
      // spheres nor is cut by them, and two spheres that touch or overlap have no wire between them to draw.
      const pa = a * 3, pb = b * 3;
      const length = Math.hypot(positions[pb] - positions[pa], positions[pb + 1] - positions[pa + 1], positions[pb + 2] - positions[pa + 2]);
      const apart = length > drawnRadii[a] + drawnRadii[b];
      lineTrims[2 * i] = apart ? drawnRadii[a] / length : 0; lineTrims[2 * i + 1] = apart ? 1 - drawnRadii[b] / length : 0;
      const visible = lines.enabled[i] && apart && screenWireEndpointsInFrustum(clipStart, clipEnd, lines.appearance[i * 5 + 4] * wireScale, viewport, pixelScale, bounds);
      if (visible) lineBounds.set(bounds, i * 4);
      (visible ? lines.visible : lines.unseen).push(i);
    }
    // An arrow takes its target sphere's units: as the sphere resists the zoom, so does the arrow, and its tip stands
    // at the drawn surface (2026-10-30; before, an arrow kept its physical length and sank into a sphere drawn larger).
    const arrowMatrix = (i: number): Matrix4 => {
      const a = arrowEnds[2 * i], b = arrowEnds[2 * i + 1], base = nodes.appearance[b * 5 + 4];
      const length = arrows.appearance[i * 5 + 4] * (base > 0 ? drawnRadii[b] / base : 1);
      point.fromArray(positions, a * 3); end.fromArray(positions, b * 3);
      const distance = point.distanceTo(end);
      if (distance) point.lerp(end, (distance - drawnRadii[b] - length) / distance);
      rotation.lookAt(end, point, up); quaternion.setFromRotationMatrix(rotation);
      return matrix.compose(point, quaternion, scale.set(length, length, length));
    };
    for (const i of arrows.ordered) {
      arrowMatrix(i); sphere.center.set(0, 0, .5).applyMatrix4(matrix); sphere.radius = scale.x;
      arrows.depths[i] = depthOf(sphere.center.x, sphere.center.y, sphere.center.z);
      (arrows.enabled[i] && frustum.intersectsSphere(sphere) ? arrows.visible : arrows.unseen).push(i);
    }
    // A ring stands where its sphere stands, at the sphere's depth, turned to the camera.
    camera.getWorldQuaternion(billboard);
    for (const i of rings.ordered) { rings.depths[i] = nodes.depths[i]; (rings.enabled[i] && nodeSeen[i] ? rings.visible : rings.unseen).push(i); }
    sort(nodes); sort(lines); sort(arrows); sort(rings);
    upload(rings, (array, at, i) => {
      const r = drawnRadii[i];
      matrix.compose(point.fromArray(positions, i * 3), billboard, scale.set(r, r, r)).toArray(array, at);
    });
    upload(nodes, (array, at, i) => {
      const p = i * 3;
      array[at] = array[at + 5] = array[at + 10] = drawnRadii[i];
      array[at + 12] = positions[p]; array[at + 13] = positions[p + 1]; array[at + 14] = positions[p + 2];
    });
    upload(lines, (array, at, i) => {
      const a = lineEnds[2 * i] * 3, b = lineEnds[2 * i + 1] * 3, from = lineTrims[2 * i], span = lineTrims[2 * i + 1] - from;
      const dx = positions[b] - positions[a], dy = positions[b + 1] - positions[a + 1], dz = positions[b + 2] - positions[a + 2];
      array[at + 8] = dx * span; array[at + 9] = dy * span; array[at + 10] = dz * span;
      array[at + 12] = positions[a] + dx * from; array[at + 13] = positions[a + 1] + dy * from; array[at + 14] = positions[a + 2] + dz * from;
    });
    upload(arrows, (array, at, i) => { arrowMatrix(i).toArray(array, at); });
    const material = lines.mesh.material as LineMaterial;
    material.resolution.copy(viewport); material.uniforms.spatialWidthScale.value = wireScale;
    updateWrappers(camera);
  };
  /** Write every wrapper at its seed's place this frame, the farthest first so that nearer veils blend over farther ones. */
  const updateWrappers = (camera: Camera): void => {
    // Off, with nothing drawn, is the picture as it was before wrappers: nothing is written.
    if (wrapperLook === "off" && !wrappers.visible && !unitFiles.visible && !unitBalloons.visible) return;
    // A wrapper stands at its node's place this frame, or, for one bursting after its node left the picture, at the place given.
    const placeOf = (seed: string): Placed | undefined => {
      const index = nodeIndex.get(seed);
      if (index === undefined) return wrapperPlaceOf(seed);
      seedPlace.x = positions[3 * index]; seedPlace.y = positions[3 * index + 1]; seedPlace.z = positions[3 * index + 2];
      return seedPlace;
    };
    const eye = camera.position;
    const distance = new Map<string, number>();
    for (const seed of wrapperLook === "off" ? [] : wrapperSeeds) {
      const at = wrapperHullOf(seed) ? placeOf(seed) : undefined;
      if (at) distance.set(seed, Math.hypot(at.x - eye.x, at.y - eye.y, at.z - eye.z));
    }
    const ordered = [...distance.keys()].sort((a, b) => distance.get(b)! - distance.get(a)! || (a < b ? -1 : a > b ? 1 : 0));
    wrapperDrawn = mergeWrappers(ordered, wrapperHullOf, placeOf, wrapperStyle.scale);
    const geometry = wrappers.geometry, count = wrapperDrawn.groups.length;
    const alphas = new Float32Array(count);
    for (const range of wrapperDrawn.ranges) alphas.fill(wrapperStyle.alpha(range.seed), range.vertexStart, range.vertexStart + range.vertexCount);
    const attribute = (name: string, array: Float32Array, size: number): void => {
      const current = geometry.getAttribute(name) as BufferAttribute | undefined;
      if (current && current.array.length === array.length) { (current.array as Float32Array).set(array); current.needsUpdate = true; }
      else geometry.setAttribute(name, new BufferAttribute(array, size).setUsage(DynamicDrawUsage));
    };
    attribute("position", wrapperDrawn.positions, 3); attribute("normal", wrapperDrawn.normals, 3); attribute("wrapperLocal", wrapperDrawn.local, 3);
    attribute("wrapperGroup", wrapperDrawn.groups, 1); attribute("wrapperAlpha", alphas, 1);
    const index = geometry.getIndex();
    if (index && index.array.length === wrapperDrawn.indices.length) { (index.array as Uint32Array).set(wrapperDrawn.indices); index.needsUpdate = true; }
    else geometry.setIndex(new BufferAttribute(wrapperDrawn.indices, 1).setUsage(DynamicDrawUsage));
    geometry.setDrawRange(0, wrapperDrawn.indices.length);
    const hovered = wrapperStyle.hovered === null ? undefined : wrapperDrawn.ranges.find(range => range.seed === wrapperStyle.hovered);
    wrapperMaterial.uniforms.uHover.value = hovered && !wrapperStyle.popping.has(hovered.seed) ? hovered.group : -1;
    balloonMaterial.uniforms.uLook.value = wrapperMaterial.uniforms.uLook.value = wrapperLook === "skin" ? 0 : 1;
    wrapperMaterial.uniforms.uRim.value = wrapperLook === "cloud-rim" ? 1 : 0;
    wrappers.visible = wrapperDrawn.ranges.length > 0;
    wrappers.userData.spatialWrappers = { look: wrapperLook, seeds: wrapperDrawn.ranges.map(range => range.seed).filter(seed => !wrapperStyle.popping.has(seed)).sort(),
      popping: wrapperDrawn.ranges.map(range => range.seed).filter(seed => wrapperStyle.popping.has(seed)).sort(),
      vertices: count, triangles: wrapperDrawn.indices.length / 3,
      ranges: wrapperDrawn.ranges.map(range => ({ seed: range.seed, x: range.centre.x, y: range.centre.y, z: range.centre.z, radius: range.radius, alpha: wrapperStyle.alpha(range.seed) })) };
    updateUnits();
  };
  /**
   * Write what each skin shows within it this frame, at its place and growth, in its opacity (2026-11-06): under the Skin
   * look alone, since the clouds veil what they hold, and never for one bursting open, whose units now stand in the picture.
   */
  const updateUnits = (): void => {
    type Drawn = { seed: string; id: string; kind: FrozenBodyUnit["kind"]; x: number; y: number; z: number; radius: number; color: Color; alpha: number; veil: number; depth: number; parent?: string; level?: number };
    const files: Drawn[] = [], balloons: Drawn[] = [];
    const white = colorOf("#ffffff").color;
    const ranges = new Map(wrapperDrawn.ranges.map(range => [range.seed, range]));
    if (wrapperLook !== "off") for (const seed of wrapperSeeds) {
      // A body stands where its skin is drawn, or, before its hull is built, where its node stands.
      const range = ranges.get(seed), index = nodeIndex.get(seed);
      const centre = range?.centre ?? (index === undefined ? wrapperPlaceOf(seed) : { x: positions[3 * index], y: positions[3 * index + 1], z: positions[3 * index + 2] });
      if (!centre) continue;
      const scale = range ? wrapperStyle.scale(seed) : 1, alpha = wrapperStyle.alpha(seed);
      // A shell not drawn as a sphere whose skin is not built yet stands as one clear balloon of its body, in every look.
      if (!range && index !== undefined && !nodes.enabled[index]) {
        balloons.push({ seed, id: seed, kind: "body", ...centre, radius: nodes.appearance[5 * index + 4], color: white, alpha, veil: 0, depth: depthOf(centre.x, centre.y, centre.z) });
      }
      const units = wrapperLook === "skin" && !wrapperStyle.popping.has(seed) ? wrapperUnitsOf(seed) : undefined;
      if (!units) continue;
      for (const unit of units) {
        const x = centre.x + unit.x * scale, y = centre.y + unit.y * scale, z = centre.z + unit.z * scale;
        // A file draws as a sphere does under the zoom's resistance, never past the room it keeps inside its bubble.
        const file = unit.kind === "file", tint = file ? colorOf(unit.color ?? "#ffffff") : null;
        (file ? files : balloons).push({ seed, id: unit.id, kind: unit.kind, x, y, z,
          radius: (file ? Math.min(unit.radius * sphereScale, unit.reach) : unit.radius) * scale, color: tint?.color ?? white,
          alpha: (file ? .75 * (tint?.alpha ?? 1) : 1) * alpha, veil: unit.veiled ? 1 : 0, depth: depthOf(x, y, z), parent: unit.parent, level: unit.depth });
      }
    }
    const write = (mesh: InstancedMesh, drawn: Drawn[]): void => {
      // Farthest first, so that nearer units blend over farther ones.
      drawn.sort((a, b) => b.depth - a.depth || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      if (drawn.length > mesh.instanceMatrix.count) {
        const capacity = Math.max(drawn.length, 2 * mesh.instanceMatrix.count);
        mesh.dispose();
        mesh.instanceMatrix = new InstancedBufferAttribute(new Float32Array(16 * capacity), 16).setUsage(DynamicDrawUsage);
        mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(3 * capacity), 3).setUsage(DynamicDrawUsage);
        mesh.geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(capacity), 1).setUsage(DynamicDrawUsage));
      }
      const veil = mesh.geometry.getAttribute("spatialVeil") as InstancedBufferAttribute | undefined;
      if (veil && veil.count < mesh.instanceMatrix.count) mesh.geometry.setAttribute("spatialVeil", new InstancedBufferAttribute(new Float32Array(mesh.instanceMatrix.count), 1).setUsage(DynamicDrawUsage));
      const veils = mesh.geometry.getAttribute("spatialVeil") as InstancedBufferAttribute | undefined;
      const matrices = mesh.instanceMatrix.array, colors = mesh.instanceColor!.array, opacity = mesh.geometry.getAttribute("spatialOpacity") as InstancedBufferAttribute;
      drawn.forEach((unit, slot) => {
        const at = 16 * slot;
        matrices.fill(0, at, at + 16);
        matrices[at] = matrices[at + 5] = matrices[at + 10] = unit.radius; matrices[at + 15] = 1;
        matrices[at + 12] = unit.x; matrices[at + 13] = unit.y; matrices[at + 14] = unit.z;
        colors[3 * slot] = unit.color.r; colors[3 * slot + 1] = unit.color.g; colors[3 * slot + 2] = unit.color.b;
        opacity.array[slot] = unit.alpha;
        if (veils) veils.array[slot] = unit.veil;
      });
      if (veils) veils.needsUpdate = true;
      mesh.count = drawn.length; mesh.visible = drawn.length > 0;
      unitBindings.set(mesh, drawn);
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor!.needsUpdate = true; opacity.needsUpdate = true;
      mesh.userData.spatialUnits = drawn.map(({ seed, id, kind, x, y, z, radius, alpha, veil, parent, level }) => ({ seed, id, kind, x, y, z, radius, alpha, veiled: veil > 0, ...(level === undefined ? {} : { depth: level }), ...(parent === undefined ? {} : { parent }) }));
    };
    write(unitFiles, files); write(unitBalloons, balloons);
  };
  /** The wrapper the ray meets first in the last picture uploaded, leaving out those bursting open (2026-11-05). */
  const pickWrapper = (raycaster: Raycaster): { seed: string; distance: number } | null =>
    wrappers.visible ? wrapperAt(wrapperDrawn, raycaster.ray.origin, raycaster.ray.direction, seed => wrapperStyle.popping.has(seed)) : null;
  const pickNodeHit = (raycaster: Raycaster): { node: N; distance: number } | undefined => {
    let picked: N | undefined, nearest = Infinity;
    for (let slot = 0; slot < nodes.visible.length; slot++) {
      nodes.mesh.getMatrixAt(slot, matrix);
      sphere.center.setFromMatrixPosition(matrix); sphere.radius = matrix.elements[0];
      if (!raycaster.ray.intersectsSphere(sphere)) continue;
      pickProxy.matrixWorld.copy(matrix); hits.length = 0; pickProxy.raycast(raycaster, hits);
      for (const hit of hits) if (hit.distance < nearest) { nearest = hit.distance; picked = nodes.entries[nodes.visible[slot]].data; }
    }
    return picked ? { node: picked, distance: nearest } : undefined;
  };
  const pickNode = (raycaster: Raycaster): N | undefined => pickNodeHit(raycaster)?.node;
  const pickLink = (raycaster: Raycaster, camera: Camera): L | undefined => {
    let picked: L | undefined, nearest = Infinity;
    raycaster.ray.at(1, point).project(camera);
    const x = point.x, y = point.y;
    for (let slot = 0; slot < lines.visible.length; slot++) {
      const i = lines.visible[slot], at = i * 4;
      if (x < lineBounds[at] || x > lineBounds[at + 1] || y < lineBounds[at + 2] || y > lineBounds[at + 3]) continue;
      lines.mesh.getMatrixAt(slot, matrix);
      const hit = pickSpatialWire(matrix, camera, viewport, lines.appearance[i * 5 + 4] * wireScale, raycaster.ray);
      if (hit && hit.distance < nearest && hit.distance >= raycaster.near && hit.distance <= raycaster.far) { picked = lines.entries[i].data; nearest = hit.distance; }
    }
    return picked;
  };
  /** Copy only the last uploaded skins and interior instances; capture never reconstructs hidden contents. */
  const captureBodies = (selected: ReadonlySet<string>): FrozenSpatialBody[] => {
    if (!selected.size) return [];
    const geometryOf = (geometry: BufferGeometry): Pick<FrozenBodyMesh, "positions" | "indices"> => ({
      positions: Float32Array.from(geometry.getAttribute("position").array),
      indices: Uint32Array.from(geometry.getIndex()!.array)
    });
    const units = new Map<string, FrozenBodyUnit[]>();
    const matrix = new Matrix4(), color = new Color();
    for (const mesh of [unitFiles, unitBalloons]) {
      if (!mesh.visible) continue;
      const geometry = geometryOf(mesh.geometry), bindings = unitBindings.get(mesh) ?? [];
      for (let slot = 0; slot < mesh.count; slot++) {
        const binding = bindings[slot];
        if (!binding || !selected.has(binding.seed)) continue;
        mesh.getMatrixAt(slot, matrix); matrix.premultiply(mesh.matrixWorld); mesh.getColorAt(slot, color);
        const group = units.get(binding.seed) ?? [];
        group.push({ ...geometry, matrix: [...matrix.elements], id: binding.id, kind: binding.kind,
          ...(mesh.material instanceof ContainedSphereMaterial ? { primitive: { kind: "sphere" as const, radius: mesh.material.sphereRadius } } : {}),
          frontSide: (mesh.material as Material).side === FrontSide, color: color.getStyle(), alpha: mesh.geometry.getAttribute("spatialOpacity").getX(slot),
          veiled: (mesh.geometry.getAttribute("spatialVeil")?.getX(slot) ?? 0) > 0, order: slot, depth: binding.level, parent: binding.parent });
        units.set(binding.seed, group);
      }
    }
    const result: FrozenSpatialBody[] = [];
    const look = wrapperMaterial.uniforms.uLook.value === 0 ? "skin" : wrapperMaterial.uniforms.uRim.value === 1 ? "cloud-rim" : "cloud";
    if (wrappers.visible) for (const range of wrapperDrawn.ranges) {
      if (!selected.has(range.seed)) continue;
      const start = range.vertexStart;
      const center = new Vector3(range.centre.x, range.centre.y, range.centre.z).applyMatrix4(wrappers.matrixWorld);
      result.push({ id: range.seed, kind: "skin", look, hovered: wrapperMaterial.uniforms.uHover.value === range.group, center: { x: center.x, y: center.y, z: center.z }, matrix: [...wrappers.matrixWorld.elements],
        positions: wrapperDrawn.positions.slice(3 * start, 3 * (start + range.vertexCount)),
        indices: Uint32Array.from(wrapperDrawn.indices.slice(range.indexStart, range.indexStart + range.indexCount), index => index - start),
        alpha: wrappers.geometry.getAttribute("wrapperAlpha").getX(start), order: range.group, units: units.get(range.seed) ?? [] });
      units.delete(range.seed);
    }
    // A pending hull is drawn as its uploaded body balloon; preserve that exact fallback.
    for (const [id, group] of units) {
      const body = group.find(unit => unit.kind === "body");
      if (!body) continue;
      result.push({ ...body, id, kind: "balloon", look, hovered: false, order: body.order, center: { x: body.matrix[12], y: body.matrix[13], z: body.matrix[14] },
        units: group.filter(unit => unit !== body) });
    }
    return result;
  };

  /**
   * Which groups are wrapped, their hulls, how they are drawn, where one stands whose node is not drawn, and what a skin
   * shows within it; drawn from the next update.
   */
  const setWrappers = (seeds: readonly string[], hullOf: (seed: string) => WrapperHull | undefined, look: GroupWrappers,
    placeOf: (seed: string) => Placed | undefined = () => undefined, unitsOf: (seed: string) => readonly SpatialWrapperUnit[] | undefined = () => undefined): void => {
    wrapperSeeds = seeds; wrapperHullOf = hullOf; wrapperLook = look; wrapperPlaceOf = placeOf; wrapperUnitsOf = unitsOf;
  };
  const styleWrappers = (style: SpatialWrapperStyle): void => { wrapperStyle = style; };
  return { nodes, lines, arrows, rings, wrappers, captureBodies, setData, update, pickNode, pickNodeHit, pickLink, pickWrapper, setWrappers, styleWrappers, invalidateAppearance: (): void => { appearanceDirty = true; }, dispose(): void {
    for (const batch of [nodes, lines, arrows, rings]) { batch.mesh.removeFromParent(); batch.mesh.dispose(); batch.mesh.geometry.dispose(); batch.mesh.material.dispose(); }
    wrappers.removeFromParent(); wrappers.geometry.dispose(); wrapperMaterial.dispose();
    for (const mesh of [unitFiles, unitBalloons]) { mesh.removeFromParent(); mesh.dispose(); mesh.geometry.dispose(); (mesh.material as Material).dispose(); }
  } };
}

/** Draw when the camera or the caller's picture revision changes, leaving stationary scenes out of the frame loop. */
export function drawSpatialGraphOnChange(camera: Camera, renderer: WebGLRenderer, composer: { render(delta?: number): void }, picture: () => readonly number[],
  onFrame: () => void = () => {}): void {
  const render = composer.render.bind(composer);
  const clear = new Color();
  let previousCamera: number[] = [];
  renderer.domElement.addEventListener("webglcontextrestored", () => { previousCamera = []; });
  // Setting a canvas size clears its drawing buffer even when rounded pixel dimensions stay the same.
  const setSize = renderer.setSize.bind(renderer);
  renderer.setSize = (...args): void => { previousCamera = []; setSize(...args); };
  // Guard the whole pass: RenderPass clears before invoking renderer.render, even if that inner draw is skipped.
  composer.render = (delta): void => {
    camera.updateMatrixWorld();
    renderer.getClearColor(clear);
    // WebGL uploads these matrices as Float32. Damping continues in doubles long after the uploaded picture is
    // identical; compare at the actual upload precision, against the last drawn frame so small moves accumulate.
    // Keep revision counters at full precision; only uploaded camera values are rounded.
    const view = [...picture(), ...[...camera.matrixWorld.elements, ...camera.matrixWorldInverse.elements, ...camera.projectionMatrix.elements,
      renderer.domElement.width, renderer.domElement.height, clear.r, clear.g, clear.b, renderer.getClearAlpha()].map(Math.fround)];
    const changed = view.length !== previousCamera.length || view.some((value, i) => value !== previousCamera[i]);
    if (changed) {
      previousCamera = view;
      render(delta);
    }
    // The frame is on screen, drawn now or unchanged since: what the picture holds at this moment (2026-10-28).
    onFrame();
  };
}


/** Clip a unit wire's axis in homogeneous coordinates, projecting its compensated world width and round caps. */
export function screenWireIntersectsFrustum(clipMatrix: Matrix4, width: number, viewport: Vector2, pixelScale = 1, bounds?: number[]): boolean {
  const start = new Vector4(0, 0, 0, 1).applyMatrix4(clipMatrix);
  const end = new Vector4(0, 0, 1, 1).applyMatrix4(clipMatrix);
  return screenWireEndpointsInFrustum(start, end, width, viewport, pixelScale, bounds);
}

/** Clip already-projected endpoints, shared between incident wires instead of multiplying a matrix for each wire. */
function screenWireEndpointsInFrustum(start: Vector4, end: Vector4, width: number, viewport: Vector2, pixelScale: number, bounds?: number[]): boolean {
  // Clip depth first so that a wire passing the camera uses its visible endpoint's pixel scale.
  const withinDepth = start.w > 0 && end.w > 0 && Math.abs(start.z) <= start.w && Math.abs(end.z) <= end.w;
  if (!withinDepth && !clipSpatialWireDepth(start, end)) return false;
  width *= pixelScale / Math.max(0.000001, Math.min(start.w, end.w));
  if (bounds) {
    bounds[0] = Math.min(start.x / start.w, end.x / end.w) - width / viewport.x;
    bounds[1] = Math.max(start.x / start.w, end.x / end.w) + width / viewport.x;
    bounds[2] = Math.min(start.y / start.w, end.y / end.w) - width / viewport.y;
    bounds[3] = Math.max(start.y / start.w, end.y / end.w) + width / viewport.y;
  }
  // The frustum is convex: two endpoints inside it always have a visible connecting stroke.
  if (Math.abs(start.x) <= start.w && Math.abs(start.y) <= start.w && Math.abs(end.x) <= end.w && Math.abs(end.y) <= end.w) return true;
  let low = 0, high = 1;
  const padding = [width / viewport.x, width / viewport.y, 0];
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [-1, 1]) {
      const a = start.w * (1 + padding[axis]) + sign * start.getComponent(axis);
      const b = end.w * (1 + padding[axis]) + sign * end.getComponent(axis);
      if (a < 0 && b < 0) return false;
      if (a < 0) low = Math.max(low, a / (a - b));
      else if (b < 0) high = Math.min(high, a / (a - b));
      if (low > high) return false;
    }
  }
  return true;
}

/**
 * The wrappers' one material (2026-11-05), its look chosen by uniforms. The skin is a translucent, lit surface, faint
 * face-on and denser toward its edges with a soft highlight, so that it reads as a balloon to pop; the cloud is the
 * November 4 probe's mist, a fixed pattern carried with each group and fading at its silhouette, which veils what is
 * behind it; with the rim, the cloud under the pointer or keyboard focus gains a smooth bright edge. Nothing moves: the
 * pattern has no time in it, so a still picture draws once. Double-sided, so a wrapper reads from inside as from outside.
 * Instanced (2026-11-06), it draws the balloons a shell shows within its skin, each a sphere scaled to its body, in the
 * same look, with no rim.
 */
function wrapperShader(instanced: boolean): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true, depthWrite: false, side: DoubleSide,
    uniforms: { uLook: { value: 0 }, uRim: { value: 0 }, uHover: { value: -1 } },
    vertexShader: instanced ? `
      attribute float spatialOpacity;
      attribute float spatialVeil;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      varying float vAlpha;
      varying float vHover;
      varying float vInner;
      varying float vVeil;
      void main() {
        vec4 view = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vView = normalize(-view.xyz);
        vLocal = position;
        vAlpha = spatialOpacity;
        vHover = 0.0;
        vInner = 1.0;
        vVeil = spatialVeil;
        gl_Position = projectionMatrix * view;
      }` : `
      attribute float wrapperAlpha;
      attribute float wrapperGroup;
      attribute vec3 wrapperLocal;
      uniform float uHover;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      varying float vAlpha;
      varying float vHover;
      varying float vInner;
      varying float vVeil;
      void main() {
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        vInner = 0.0;
        vVeil = 0.0;
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-view.xyz);
        vLocal = wrapperLocal;
        vAlpha = wrapperAlpha;
        vHover = abs(wrapperGroup - uHover) < 0.5 ? 1.0 : 0.0;
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform float uLook;
      uniform float uRim;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      varying float vAlpha;
      varying float vHover;
      varying float vInner;
      varying float vVeil;
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(vView);
        float facing = abs(dot(n, v));
        vec3 color;
        float alpha;
        if (uLook < 0.5) {
          vec3 light = normalize(vec3(-0.45, 0.75, 0.5));
          float diffuse = 0.55 + 0.45 * max(dot(n, light), 0.0);
          float shine = pow(max(dot(reflect(-light, n), v), 0.0), 40.0);
          color = vec3(0.514, 0.725, 0.831) * diffuse + vec3(0.32, 0.44, 0.54) * shine;
          // Faint face-on, so that the spheres within read through two and three skins (2026-11-06, second round); an
          // inner bubble is a rim alone, and a veiled one, whose files are not drawn, a milky fill that never reads as few.
          alpha = vInner > 0.5
            ? mix(0.015 + 0.3 * pow(1.0 - facing, 3.0), 0.42 + 0.2 * pow(1.0 - facing, 2.0), vVeil)
            : 0.05 + 0.22 * pow(1.0 - facing, 2.0) + 0.25 * shine;
        } else {
          // The probe's mist over a group drawn 1.8 units across: the same two or so swells span every wrapper.
          vec3 p = vLocal * 0.9;
          float noise = sin(p.x * 7.0) * sin(p.y * 6.0) * sin(p.z * 5.0);
          color = vec3(0.545, 0.675, 0.78);
          alpha = (0.62 + 0.38 * noise) * smoothstep(0.0, 0.45, facing) * 0.27;
        }
        float rim = uRim * vHover * pow(1.0 - facing, 3.0);
        color = mix(color, vec3(0.86, 0.93, 1.0), rim);
        gl_FragColor = vec4(color, (alpha + 0.6 * rim) * vAlpha);
      }`
  });
}

/** Use Three's near-plane-safe, round-capped wide-line shader with our batched transforms, widths, colours and alpha. */
function screenWireMaterial(source: MeshLambertMaterial): LineMaterial {
  const material = new LineMaterial();
  material.uniforms.spatialWidthScale = { value: 1 };
  // Copy the base material's blending/depth/clipping rules without replacing the line shader or its uniforms.
  Material.prototype.copy.call(material, source);
  material.vertexColors = false; // RGB comes from the instance attribute, not the line addon's endpoint colours.
  material.vertexShader = material.vertexShader
    .replace("uniform float linewidth;", "attribute float spatialWidth;\nattribute float spatialOpacity;\nuniform float spatialWidthScale;\nvarying float vSpatialOpacity;\nvarying vec3 vSpatialColor;\n#define linewidth spatialWidth")
    .replace("void main() {", "void main() {\nvSpatialOpacity = spatialOpacity;\nvSpatialColor = instanceColor;")
    .replace("modelViewMatrix * vec4( instanceStart, 1.0 )", "modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)")
    .replace("modelViewMatrix * vec4( instanceEnd, 1.0 )", "modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 1.0, 1.0)")
    // Match CPU clipping before calculating endpoint widths. Three's camera-plane trim alone leaves
    // endpoints between the camera and near plane, whose widths distort the visible tapered segment.
    .replace(/\/\/ special case for perspective projection[\s\S]*?\/\/ ndc space/, `
      vec4 originalStart = start;
      vec4 clipStart = projectionMatrix * start;
      vec4 clipEnd = projectionMatrix * end;
      float low = 0.0, high = 1.0;
      for (int plane = 0; plane < 2; plane++) {
        float planeSign = plane == 0 ? -1.0 : 1.0;
        float a = clipStart.w + planeSign * clipStart.z;
        float b = clipEnd.w + planeSign * clipEnd.z;
        if (a < 0.0 && b < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
        if (a < 0.0) low = max(low, a / (a - b));
        else if (b < 0.0) high = min(high, a / (a - b));
      }
      if (low > high) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
      start = mix(originalStart, end, low);
      end = mix(originalStart, end, high);
      clipStart = projectionMatrix * start;
      clipEnd = projectionMatrix * end;
      if (clipStart.w <= 0.0 || clipEnd.w <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
      // ndc space`)
    // The two semicircular caps otherwise retain different radii and depths on an end-on segment.
    .replace("// direction", `
      if (length((ndcEnd.xy - ndcStart.xy) * vec2(aspect, 1.0)) <= 0.000001) {
        if (start.z >= end.z) { end = start; clipEnd = clipStart; ndcEnd = ndcStart; }
        else { start = end; clipStart = clipEnd; ndcStart = ndcEnd; }
      }
      // direction`)
    .replace("offset *= linewidth;", "float pixelScale = abs(projectionMatrix[1][1]) * resolution.y / (2.0 * max(0.000001, abs(position.y < 0.5 ? clipStart.w : clipEnd.w)));\noffset *= linewidth * spatialWidthScale * pixelScale;")
    // A wire viewed exactly end-on still has a finite round cap.
    .replace("dir = normalize( dir );", "dir = length(dir) > 0.000001 ? normalize(dir) : vec2(1.0, 0.0);");
  material.fragmentShader = material.fragmentShader
    .replace("#include <color_fragment>", "")
    .replace("uniform float opacity;", "uniform float opacity;\nvarying float vSpatialOpacity;\nvarying vec3 vSpatialColor;")
    // A wire keeps its one colour whole: the colour that ran along a reference wire from the file that uses to the
    // file that offers (2026-10-30) was withdrawn on 2026-10-31 at the owner's eye, since in a web of thousands no
    // wire's two ends could be told apart. A faded wire writes no depth of its own, so that it never cuts a hole in
    // a bright wire behind it.
    .replace("gl_FragColor = vec4( diffuseColor.rgb, alpha );", `
      gl_FragDepthEXT = alpha * vSpatialOpacity < 0.1 ? 1.0 : gl_FragCoord.z;
      gl_FragColor = vec4( diffuseColor.rgb * vSpatialColor, alpha * vSpatialOpacity );`);
  return material;
}
