import { BufferGeometry, Color, ConeGeometry, DynamicDrawUsage, Frustum, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh, MeshLambertMaterial, Quaternion, Sphere, SphereGeometry, Vector2, Vector3, Vector4, type Camera, type Intersection, type Raycaster, type Scene, type WebGLRenderer } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import type { SpatialNode } from "./forceGraphLayout";
import { clipSpatialWireDepth, pickSpatialWire } from "./forceGraphSizing";

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
  mesh: InstancedMesh<BufferGeometry, MeshLambertMaterial | LineMaterial>;
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
}

/** Pack documented nodes and wires straight into three instance buffers; camera changes never build scene proxies. */
export function createSpatialBuffers<N extends SpatialNode, L extends SpatialDrawLink<N>>(scene: Scene, style: SpatialDrawStyle<N, L>) {
  const alphaMaterial = (): MeshLambertMaterial => {
    const material = new MeshLambertMaterial({ color: 0xffffff, transparent: true });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float spatialOpacity;\nvarying float vSpatialOpacity;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpatialOpacity = spatialOpacity;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vSpatialOpacity;")
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vSpatialOpacity;");
    };
    material.customProgramCacheKey = () => "spatial-instance-alpha";
    return material;
  };
  const make = <T>(kind: string, geometry: BufferGeometry, material: MeshLambertMaterial | LineMaterial, renderOrder = 0): SpatialDrawBatch<T> => {
    const mesh = new InstancedMesh(geometry, material, 1);
    mesh.name = `Spatial ${kind}`; mesh.count = 0; mesh.frustumCulled = false; mesh.renderOrder = renderOrder;
    const batch: SpatialDrawBatch<T> = { mesh, entries: [], ordered: [], visible: [], unseen: [], depths: new Float64Array(),
      serials: new Float64Array(), appearance: new Float64Array(), enabled: new Uint8Array(), capacity: 0 };
    mesh.userData.spatialBatch = { kind, entries: batch.entries };
    mesh.raycast = () => {};
    scene.add(mesh);
    return batch;
  };
  const nodes = make<N>("nodes", new SphereGeometry(1, 12, 12), alphaMaterial());
  const lineSource = new MeshLambertMaterial({ color: 0xffffff, transparent: true, depthWrite: false });
  const lines = make<L>("links", new BufferGeometry().copy(new LineSegmentsGeometry()), screenWireMaterial(lineSource), 10);
  lineSource.dispose();
  const arrows = make<L>("arrows", new ConeGeometry(.25, 1, 8).translate(0, .5, 0).rotateX(Math.PI / 2), alphaMaterial());
  const nodeEntries = new WeakMap<N, SpatialDrawEntry<N>>(), linkEntries = new WeakMap<L, SpatialDrawEntry<L>>(), arrowEntries = new WeakMap<L, SpatialDrawEntry<L>>();
  const colors = new Map<string, { color: Color; alpha: number }>();
  let serial = 0, appearanceDirty = true;
  let positions = new Float64Array(), clips = new Float64Array(), drawnRadii = new Float64Array();
  let lineEnds = new Uint32Array(), arrowEnds = new Uint32Array(), lineBounds = new Float64Array();
  const matrix = new Matrix4(), projection = new Matrix4(), rotation = new Matrix4();
  const clipStart = new Vector4(), clipEnd = new Vector4(), bounds: number[] = [];
  const frustum = new Frustum(), sphere = new Sphere(), point = new Vector3(), end = new Vector3(), scale = new Vector3(), quaternion = new Quaternion();
  const viewport = new Vector2(), up = new Vector3(0, 1, 0);
  const pickProxy = new Mesh(nodes.mesh.geometry, nodes.mesh.material);
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
    const mesh = batch.mesh;
    if (batch.entries.length > batch.capacity) {
      if (batch.capacity) { mesh.dispose(); mesh.geometry.dispose(); }
      batch.capacity = Math.max(batch.entries.length, 2 * batch.capacity);
      const matrices = new Float32Array(16 * batch.capacity);
      for (let i = 0; i < matrices.length; i += 16) matrices[i] = matrices[i + 5] = matrices[i + 10] = matrices[i + 15] = 1;
      mesh.instanceMatrix = new InstancedBufferAttribute(matrices, 16).setUsage(DynamicDrawUsage);
      mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(3 * batch.capacity), 3).setUsage(DynamicDrawUsage);
      mesh.geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(batch.capacity), 1).setUsage(DynamicDrawUsage));
      if (mesh.material instanceof LineMaterial) mesh.geometry.setAttribute("spatialWidth", new InstancedBufferAttribute(new Float32Array(batch.capacity), 1).setUsage(DynamicDrawUsage));
      batch.depths = new Float64Array(batch.capacity); batch.serials = new Float64Array(batch.capacity);
      batch.appearance = new Float64Array(5 * batch.capacity); batch.enabled = new Uint8Array(batch.capacity);
    }
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
    read(nodes, style.nodeColor, style.radius, () => true, .75);
    read(lines, style.linkColor, link => Math.ceil(style.linkWidth(link) * 10) / 10, style.linkVisible, 1);
    read(arrows, style.linkColor, style.arrowLength, style.linkVisible, 3);
  };
  const setData = (data: { nodes: N[]; links: L[] }): void => {
    const byId = new Map(data.nodes.map((node, index) => [node.id, index]));
    nodes.entries.length = lines.entries.length = arrows.entries.length = 0;
    for (const node of data.nodes) nodes.entries.push(entryFor(nodeEntries, node));
    for (const link of data.links) {
      lines.entries.push(entryFor(linkEntries, link));
      if (style.arrowLength(link) > 0) arrows.entries.push(entryFor(arrowEntries, link));
    }
    reserve(nodes); reserve(lines); reserve(arrows);
    if (positions.length < nodes.capacity * 3) {
      positions = new Float64Array(nodes.capacity * 3); clips = new Float64Array(nodes.capacity * 4); drawnRadii = new Float64Array(nodes.capacity);
    }
    if (lineEnds.length < lines.capacity * 2) { lineEnds = new Uint32Array(lines.capacity * 2); lineBounds = new Float64Array(lines.capacity * 4); }
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
  const update = (camera: Camera, width: number, height: number, nodeResistance: number, wireResistance: number): void => {
    refreshStyle(); viewport.set(width, height);
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projection, camera.coordinateSystem, camera.reversedDepth);
    const view = camera.matrixWorldInverse.elements, pixelScale = Math.abs(camera.projectionMatrix.elements[5]) * height / 2;
    nodes.visible.length = nodes.unseen.length = lines.visible.length = lines.unseen.length = arrows.visible.length = arrows.unseen.length = 0;
    // Read each mutable layout position once. The far larger wire pass uses only contiguous numeric inputs.
    for (let i = 0; i < nodes.entries.length; i++) {
      const node = nodes.entries[i].data, p = i * 3, c = i * 4;
      const x = positions[p] = node.x ?? 0, y = positions[p + 1] = node.y ?? 0, z = positions[p + 2] = node.z ?? 0;
      const depth = -(view[2] * x + view[6] * y + view[10] * z + view[14]);
      drawnRadii[i] = nodes.appearance[i * 5 + 4] * (depth > 0 ? Math.pow(pixelScale / depth, -nodeResistance) : 1);
      clipStart.set(x, y, z, 1).applyMatrix4(projection).toArray(clips, c);
      nodes.depths[i] = clipStart.z / clipStart.w;
    }
    for (const i of nodes.ordered) {
      sphere.center.fromArray(positions, i * 3); sphere.radius = drawnRadii[i];
      (frustum.intersectsSphere(sphere) ? nodes.visible : nodes.unseen).push(i);
    }
    for (const i of lines.ordered) {
      const a = lineEnds[2 * i] * 4, b = lineEnds[2 * i + 1] * 4;
      clipStart.fromArray(clips, a); clipEnd.fromArray(clips, b);
      lines.depths[i] = (clipStart.z + clipEnd.z) / (clipStart.w + clipEnd.w);
      const visible = lines.enabled[i] && screenWireEndpointsInFrustum(clipStart, clipEnd, lines.appearance[i * 5 + 4], viewport, wireResistance, pixelScale, bounds);
      if (visible) lineBounds.set(bounds, i * 4);
      (visible ? lines.visible : lines.unseen).push(i);
    }
    // Arrows retain physical length and terminate at the physical target surface.
    const arrowMatrix = (i: number): Matrix4 => {
      const a = arrowEnds[2 * i], b = arrowEnds[2 * i + 1], length = arrows.appearance[i * 5 + 4];
      point.fromArray(positions, a * 3); end.fromArray(positions, b * 3);
      const distance = point.distanceTo(end);
      if (distance) point.lerp(end, (distance - nodes.appearance[b * 5 + 4] - length) / distance);
      rotation.lookAt(end, point, up); quaternion.setFromRotationMatrix(rotation);
      return matrix.compose(point, quaternion, scale.set(length, length, length));
    };
    for (const i of arrows.ordered) {
      arrowMatrix(i); sphere.center.set(0, 0, .5).applyMatrix4(matrix); sphere.radius = arrows.appearance[i * 5 + 4];
      arrows.depths[i] = depthOf(sphere.center.x, sphere.center.y, sphere.center.z);
      (arrows.enabled[i] && frustum.intersectsSphere(sphere) ? arrows.visible : arrows.unseen).push(i);
    }
    sort(nodes); sort(lines); sort(arrows);
    upload(nodes, (array, at, i) => {
      const p = i * 3;
      array[at] = array[at + 5] = array[at + 10] = drawnRadii[i];
      array[at + 12] = positions[p]; array[at + 13] = positions[p + 1]; array[at + 14] = positions[p + 2];
    });
    upload(lines, (array, at, i) => {
      const a = lineEnds[2 * i] * 3, b = lineEnds[2 * i + 1] * 3, x = positions[a], y = positions[a + 1], z = positions[a + 2];
      array[at + 8] = positions[b] - x; array[at + 9] = positions[b + 1] - y; array[at + 10] = positions[b + 2] - z;
      array[at + 12] = x; array[at + 13] = y; array[at + 14] = z;
    });
    upload(arrows, (array, at, i) => { arrowMatrix(i).toArray(array, at); });
    const material = lines.mesh.material as LineMaterial;
    material.resolution.copy(viewport); material.uniforms.spatialResistance.value = wireResistance;
  };
  const pickNode = (raycaster: Raycaster): N | undefined => {
    let picked: N | undefined, nearest = Infinity;
    for (let slot = 0; slot < nodes.visible.length; slot++) {
      nodes.mesh.getMatrixAt(slot, matrix);
      sphere.center.setFromMatrixPosition(matrix); sphere.radius = matrix.elements[0];
      if (!raycaster.ray.intersectsSphere(sphere)) continue;
      pickProxy.matrixWorld.copy(matrix); hits.length = 0; pickProxy.raycast(raycaster, hits);
      for (const hit of hits) if (hit.distance < nearest) { nearest = hit.distance; picked = nodes.entries[nodes.visible[slot]].data; }
    }
    return picked;
  };
  const pickLink = (raycaster: Raycaster, camera: Camera, resistance: number): L | undefined => {
    let picked: L | undefined, nearest = Infinity;
    raycaster.ray.at(1, point).project(camera);
    const x = point.x, y = point.y;
    for (let slot = 0; slot < lines.visible.length; slot++) {
      const i = lines.visible[slot], at = i * 4;
      if (x < lineBounds[at] || x > lineBounds[at + 1] || y < lineBounds[at + 2] || y > lineBounds[at + 3]) continue;
      lines.mesh.getMatrixAt(slot, matrix);
      const hit = pickSpatialWire(matrix, camera, viewport, lines.appearance[i * 5 + 4], resistance, raycaster.ray);
      if (hit && hit.distance < nearest && hit.distance >= raycaster.near && hit.distance <= raycaster.far) { picked = lines.entries[i].data; nearest = hit.distance; }
    }
    return picked;
  };
  return { nodes, lines, arrows, setData, update, pickNode, pickLink, invalidateAppearance: (): void => { appearanceDirty = true; }, dispose(): void {
    for (const batch of [nodes, lines, arrows]) { batch.mesh.removeFromParent(); batch.mesh.dispose(); batch.mesh.geometry.dispose(); batch.mesh.material.dispose(); }
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


/** Clip a unit wire's axis in homogeneous coordinates, allowing its CSS-pixel half width and round caps. */
export function screenWireIntersectsFrustum(clipMatrix: Matrix4, width: number, viewport: Vector2, resistance = 1, pixelScale = 1, bounds?: number[]): boolean {
  const start = new Vector4(0, 0, 0, 1).applyMatrix4(clipMatrix);
  const end = new Vector4(0, 0, 1, 1).applyMatrix4(clipMatrix);
  return screenWireEndpointsInFrustum(start, end, width, viewport, resistance, pixelScale, bounds);
}

/** Clip already-projected endpoints, shared between incident wires instead of multiplying a matrix for each wire. */
function screenWireEndpointsInFrustum(start: Vector4, end: Vector4, width: number, viewport: Vector2, resistance: number, pixelScale: number, bounds?: number[]): boolean {
  // Clip depth first so that a wire passing the camera uses its visible endpoint's pixel scale.
  const withinDepth = start.w > 0 && end.w > 0 && Math.abs(start.z) <= start.w && Math.abs(end.z) <= end.w;
  if (!withinDepth && !clipSpatialWireDepth(start, end)) return false;
  width *= Math.pow(pixelScale / Math.max(0.000001, Math.min(start.w, end.w)), 1 - resistance);
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

/** Use Three's near-plane-safe, round-capped wide-line shader with our batched transforms, widths, colours and alpha. */
function screenWireMaterial(source: MeshLambertMaterial): LineMaterial {
  const material = new LineMaterial();
  material.uniforms.spatialResistance = { value: 1 };
  // Copy the base material's blending/depth/clipping rules without replacing the line shader or its uniforms.
  Material.prototype.copy.call(material, source);
  material.vertexColors = false; // RGB comes from the instance attribute, not the line addon's endpoint colours.
  material.vertexShader = material.vertexShader
    .replace("uniform float linewidth;", "attribute float spatialWidth;\nattribute float spatialOpacity;\nuniform float spatialResistance;\nvarying float vSpatialOpacity;\nvarying vec3 vSpatialColor;\n#define linewidth spatialWidth")
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
    .replace("offset *= linewidth;", "float pixelScale = abs(projectionMatrix[1][1]) * resolution.y / (2.0 * max(0.000001, abs(position.y < 0.5 ? clipStart.w : clipEnd.w)));\noffset *= linewidth * pow(pixelScale, 1.0 - spatialResistance);")
    // A wire viewed exactly end-on still has a finite round cap.
    .replace("dir = normalize( dir );", "dir = length(dir) > 0.000001 ? normalize(dir) : vec2(1.0, 0.0);");
  material.fragmentShader = material.fragmentShader
    .replace("#include <color_fragment>", "")
    .replace("uniform float opacity;", "uniform float opacity;\nvarying float vSpatialOpacity;\nvarying vec3 vSpatialColor;")
    .replace("vec4( diffuseColor.rgb, alpha )", "vec4( diffuseColor.rgb * vSpatialColor, alpha * vSpatialOpacity )");
  return material;
}
