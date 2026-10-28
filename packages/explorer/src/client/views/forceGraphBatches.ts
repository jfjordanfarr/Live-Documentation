import { BufferGeometry, Color, DynamicDrawUsage, Frustum, InstancedBufferAttribute, InstancedMesh, Material, Matrix4, Mesh, MeshLambertMaterial, Sphere, Vector2, Vector3, Vector4, type Camera, type Scene, type WebGLRenderer } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import { clipSpatialWireDepth, pickSpatialWire, spatialSizeScale } from "./forceGraphSizing";

type GraphMesh = Mesh<BufferGeometry, MeshLambertMaterial> & { __graphObjType?: string; __linkThreeObjType?: string };
type BatchMaterial = MeshLambertMaterial | LineMaterial;

/** The instance actually drawn for a native graph object's picking/placement proxy; its slot can change with depth. */
export interface SpatialBatchInstance {
  mesh: InstancedMesh<BufferGeometry, BatchMaterial>;
  instance: number;
  enabled: boolean;
}
interface Entry extends SpatialBatchInstance { object: GraphMesh; scale: Vector3; depth: number; tubeRadius?: number; raycast: GraphMesh["raycast"] }
interface Group { mesh: InstancedMesh<BufferGeometry, BatchMaterial>; entries: Entry[]; capacity: number }
const attributeVersion = (geometry: BufferGeometry, name: string): number => {
  const attribute = geometry.getAttribute(name);
  return !attribute ? 0 : "version" in attribute ? attribute.version : attribute.data.version;
};

/** Keep the library's interaction/physics loop running, but draw WebGL only when its picture changes. */
export function drawSpatialGraphOnChange(scene: Scene, camera: Camera, renderer: WebGLRenderer, composer: { render(delta?: number): void }, prepare: () => readonly number[] = () => [],
  onFrame: (spheres: number) => void = () => {}): void {
  const render = composer.render.bind(composer);
  const clear = new Color();
  let previousCamera: number[] = [];
  let previous = new Map<GraphMesh, readonly unknown[]>();
  renderer.domElement.addEventListener("webglcontextrestored", () => { previousCamera = []; });
  // Setting a canvas size clears its drawing buffer even when rounded pixel dimensions stay the same.
  const setSize = renderer.setSize.bind(renderer);
  renderer.setSize = (...args): void => { previousCamera = []; setSize(...args); };
  // Guard the whole pass: RenderPass clears before invoking renderer.render, even if that inner draw is skipped.
  composer.render = (delta): void => {
    const appearance = prepare();
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    renderer.getClearColor(clear);
    // WebGL uploads these matrices as Float32. Damping continues in doubles long after the uploaded picture is
    // identical; compare at the actual upload precision, against the last drawn frame so small moves accumulate.
    const view = [...appearance, ...camera.matrixWorld.elements, ...camera.matrixWorldInverse.elements, ...camera.projectionMatrix.elements,
      renderer.domElement.width, renderer.domElement.height, clear.r, clear.g, clear.b, renderer.getClearAlpha()].map(Math.fround);
    let changed = view.length !== previousCamera.length || view.some((value, i) => value !== previousCamera[i]);
    const current = new Map<GraphMesh, readonly unknown[]>();
    let spheres = 0;
    scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshLambertMaterial)
        || (!mesh.__graphObjType && mesh.__linkThreeObjType !== "arrow")) return;
      if (mesh.__graphObjType === "node") spheres++;
      let visible = mesh.material.visible;
      for (let parent = object; parent; parent = parent.parent!) visible &&= parent.visible;
      const material = mesh.material;
      const values = [...mesh.matrixWorld.elements.map(Math.fround), visible, mesh.renderOrder, mesh.geometry.uuid,
        mesh.geometry.getAttribute("position"), attributeVersion(mesh.geometry, "position"), attributeVersion(mesh.geometry, "normal"),
        mesh.geometry.index?.version ?? 0, material.uuid, material.version, material.opacity,
        material.color.r, material.color.g, material.color.b];
      const was = previous.get(mesh);
      if (!was || values.some((value, i) => value !== was[i])) changed = true;
      current.set(mesh, values);
    });
    changed ||= current.size !== previous.size;
    if (changed) {
      previous = current; previousCamera = view;
      render(delta);
    }
    // The frame is on screen, drawn now or unchanged since: what the picture holds at this moment (2026-10-28).
    onFrame(spheres);
  };
}

/**
 * Instance spheres and straight wires with independent zoom resistance; keep arrows at their native size.
 * Each instance carries its world transform, linear colour and alpha. Keep native depth rules and interaction proxies.
 * Proxies are hidden only during WebGL drawing and restored before the next interaction pass.
 */
export function batchSpatialGraph(scene: Scene, resistance: () => { nodes: number; wires: number } = () => ({ nodes: 0, wires: 1 })): {
  updateSizes(camera: Camera, height: number): void; dispose(): void;
} {
  const groups = new Map<string, Group>();
  const entries = new Map<GraphMesh, Entry>();
  const shapes = new WeakMap<BufferGeometry, { key: string; geometry: BufferGeometry; scale: Vector3; tubeRadius?: number }>();
  const materialKeys = new WeakMap<MeshLambertMaterial, string>();
  const inverse = new Matrix4(), matrix = new Matrix4(), projection = new Matrix4();
  const sphere = new Sphere(), frustum = new Frustum(), point = new Vector3();
  const viewport = new Vector2();
  const nodeScales = new Map<GraphMesh, number>();
  const updateSizes = (camera: Camera, height: number): void => {
    const amount = resistance().nodes;
    if (amount === 0 && nodeScales.size === 0) return;
    camera.updateMatrixWorld(); scene.updateMatrixWorld();
    const present = new Set<GraphMesh>();
    scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (mesh.__graphObjType !== "node" || mesh.geometry?.type !== "SphereGeometry") return;
      present.add(mesh);
      const next = spatialSizeScale(point.setFromMatrixPosition(mesh.matrixWorld), camera, height, amount);
      const previous = nodeScales.get(mesh) ?? 1;
      if (next !== previous) { mesh.scale.multiplyScalar(next / previous); mesh.updateWorldMatrix(false, true); }
      if (next === 1) nodeScales.delete(mesh); else nodeScales.set(mesh, next);
    });
    for (const [mesh, scale] of nodeScales) if (!present.has(mesh)) {
      mesh.scale.multiplyScalar(1 / scale); mesh.updateWorldMatrix(false, true); nodeScales.delete(mesh);
    }
  };
  const release = (entry: Entry): void => { entry.object.raycast = entry.raycast; delete entry.object.userData.spatialBatch; };
  let hidden: Array<{ object: GraphMesh; visible: boolean }> = [];
  const before = scene.onBeforeRender.bind(scene), after = scene.onAfterRender.bind(scene);
  const restore = (): void => {
    for (const { object, visible } of hidden) object.visible = visible;
    hidden = [];
  };
  scene.onBeforeRender = function (...args): void {
    before.apply(this, args);
    const camera = args[2];
    args[0].getSize(viewport);
    updateSizes(camera, viewport.y);
    inverse.copy(scene.matrixWorld).invert();
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projection, camera.coordinateSystem, camera.reversedDepth);
    const objects: Array<{ object: GraphMesh; visible: boolean }> = [];
    scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshLambertMaterial)
        || (!mesh.__graphObjType && mesh.__linkThreeObjType !== "arrow")) return;
      let visible = mesh.material.visible;
      for (let parent = object; parent; parent = parent.parent!) visible &&= parent.visible;
      objects.push({ object: mesh, visible });
    });
    const present = new Set(objects.map(({ object }) => object));
    for (const [object, entry] of entries) if (!present.has(object)) { release(entry); entries.delete(object); }
    for (const group of groups.values()) group.entries = [];
    for (const { object, visible } of objects) {
      const source = object.geometry, material = object.material;
      let shape = shapes.get(source);
      if (!shape) {
        // Spheres share the native tessellation. Straight unit tubes supply placement proxies for projected wires;
        // their radius encodes half the base width, with each endpoint's depth applying the chosen zoom resistance.
        const parameters = (source as BufferGeometry & { parameters?: Record<string, number | boolean> }).parameters;
        const scale = new Vector3(1, 1, 1);
        let key = source.uuid;
        let tubeRadius: number | undefined;
        if (source.type === "SphereGeometry" && parameters && Number(parameters.radius) > 0) {
          scale.setScalar(Number(parameters.radius));
          key = JSON.stringify([source.type, { ...parameters, radius: 1 }]);
        } else if (source.type === "CylinderGeometry" && object.__graphObjType === "link" && parameters
          && parameters.radiusTop === parameters.radiusBottom && parameters.height === 1 && Number(parameters.radiusTop) > 0) {
          scale.set(Number(parameters.radiusTop), Number(parameters.radiusTop), 1);
          tubeRadius = Number(parameters.radiusTop);
          key = "screen-space-wire";
        }
        shape = { key, geometry: source, scale, tubeRadius };
        shapes.set(source, shape);
      }
      let materialKey = materialKeys.get(material);
      if (!materialKey) {
        materialKey = JSON.stringify({ ...material.toJSON(), uuid: undefined, color: undefined, opacity: undefined, visible: undefined });
        materialKeys.set(material, materialKey);
      }
      const key = `${object.renderOrder}:${materialKey}:${shape.key}`;
      let group = groups.get(key);
      if (!group) {
        const shared: BatchMaterial = shape.tubeRadius === undefined ? material.clone() : screenWireMaterial(material);
        shared.color.setRGB(1, 1, 1); shared.opacity = 1; shared.visible = true;
        // Three supplies instance matrices and RGB. Carry alpha beside them without a matrix-texture lookup.
        if (shared instanceof MeshLambertMaterial) shared.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float spatialOpacity;\nvarying float vSpatialOpacity;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpatialOpacity = spatialOpacity;");
          shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vSpatialOpacity;")
            .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vSpatialOpacity;");
        };
        if (shared instanceof MeshLambertMaterial) shared.customProgramCacheKey = () => "spatial-instance-alpha";
        const geometry = shape.tubeRadius === undefined
          ? shape.geometry.clone().scale(1 / shape.scale.x, 1 / shape.scale.y, 1 / shape.scale.z)
          : new BufferGeometry().copy(new LineSegmentsGeometry());
        const mesh = new InstancedMesh(geometry, shared, 1);
        mesh.name = "Spatial graph batch"; mesh.renderOrder = object.renderOrder;
        mesh.frustumCulled = false; mesh.raycast = () => {};
        scene.add(mesh);
        group = { mesh, entries: [], capacity: 0 }; groups.set(key, group);
      }
      let entry = entries.get(object);
      if (!entry) {
        entry = { mesh: group.mesh, instance: -1, enabled: visible, object, scale: shape.scale, depth: 0, raycast: object.raycast.bind(object) };
        entries.set(object, entry); object.userData.spatialBatch = entry;
        const current = entry;
        object.raycast = (raycaster, hits): void => {
          if (current.tubeRadius === undefined) { current.raycast(raycaster, hits); return; }
          if (!raycaster.camera) return;
          const hit = pickSpatialWire(object.matrixWorld, raycaster.camera, viewport, 2 * current.tubeRadius, resistance().wires, raycaster.ray);
          if (hit && hit.distance >= raycaster.near && hit.distance <= raycaster.far) hits.push({ ...hit, object });
        };
      }
      entry.mesh = group.mesh; entry.scale = shape.scale; entry.enabled = visible; entry.instance = -1;
      entry.tubeRadius = shape.tubeRadius;
      if (!source.boundingSphere) source.computeBoundingSphere();
      sphere.copy(source.boundingSphere!).applyMatrix4(object.matrixWorld);
      entry.depth = point.copy(sphere.center).applyMatrix4(projection).z;
      // Keep all instances observable; invisible/culled ones occupy the tail outside mesh.count.
      group.entries.push(entry);
    }
    for (const [key, group] of groups) {
      if (!group.entries.length) {
        group.mesh.removeFromParent(); group.mesh.dispose(); group.mesh.geometry.dispose(); group.mesh.material.dispose(); groups.delete(key); continue;
      }
      const mesh = group.mesh;
      if (mesh.material instanceof LineMaterial) {
        mesh.material.resolution.copy(viewport);
        mesh.material.uniforms.spatialResistance.value = resistance().wires;
      }
      if (group.entries.length > group.capacity) {
        // Instance attributes belong to the mesh, ordinary attributes to its geometry: release both before growing.
        if (group.capacity) { mesh.dispose(); mesh.geometry.dispose(); }
        group.capacity = Math.max(group.entries.length, group.capacity * 2);
        mesh.instanceMatrix = new InstancedBufferAttribute(new Float32Array(group.capacity * 16), 16).setUsage(DynamicDrawUsage);
        mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(group.capacity * 3), 3).setUsage(DynamicDrawUsage);
        mesh.geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(group.capacity), 1).setUsage(DynamicDrawUsage));
        if (mesh.material instanceof LineMaterial) mesh.geometry.setAttribute("spatialWidth", new InstancedBufferAttribute(new Float32Array(group.capacity), 1).setUsage(DynamicDrawUsage));
      }
      const visible: Entry[] = [], unseen: Entry[] = [];
      for (const entry of group.entries) {
        sphere.copy(entry.object.geometry.boundingSphere!).applyMatrix4(entry.object.matrixWorld);
        const intersects = !entry.object.frustumCulled || (entry.tubeRadius === undefined ? frustum.intersectsSphere(sphere)
          : screenWireIntersectsFrustum(matrix.multiplyMatrices(projection, entry.object.matrixWorld), 2 * entry.tubeRadius, viewport,
            resistance().wires, Math.abs(camera.projectionMatrix.elements[5]) * viewport.y / 2));
        (entry.enabled && intersects ? visible : unseen).push(entry);
      }
      visible.sort((a, b) => (mesh.material.transparent ? b.depth - a.depth : a.depth - b.depth) || a.object.id - b.object.id);
      const opacity = mesh.geometry.getAttribute("spatialOpacity");
      [...visible, ...unseen].forEach((entry, slot) => {
        entry.instance = slot;
        matrix.multiplyMatrices(inverse, entry.object.matrixWorld).scale(entry.scale);
        mesh.setMatrixAt(slot, matrix); mesh.setColorAt(slot, entry.object.material.color);
        opacity.setX(slot, entry.object.material.opacity);
        if (entry.tubeRadius !== undefined) mesh.geometry.getAttribute("spatialWidth").setX(slot, 2 * entry.tubeRadius);
      });
      mesh.count = visible.length;
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor!.needsUpdate = true; opacity.needsUpdate = true;
      if (mesh.material instanceof LineMaterial) mesh.geometry.getAttribute("spatialWidth").needsUpdate = true;
      mesh.updateMatrixWorld(true);
    }
    hidden = objects.map(({ object }) => ({ object, visible: object.visible }));
    for (const { object } of hidden) object.visible = false;
  };
  scene.onAfterRender = function (...args): void { restore(); after.apply(this, args); };
  return { updateSizes, dispose(): void {
    restore(); scene.onBeforeRender = before; scene.onAfterRender = after;
    for (const entry of entries.values()) release(entry);
    for (const group of groups.values()) { group.mesh.removeFromParent(); group.mesh.dispose(); group.mesh.geometry.dispose(); group.mesh.material.dispose(); }
    entries.clear(); groups.clear();
    for (const [mesh, scale] of nodeScales) { mesh.scale.multiplyScalar(1 / scale); mesh.updateWorldMatrix(false, true); }
    nodeScales.clear();
  } };
}

/** Clip a unit wire's axis in homogeneous coordinates, allowing its CSS-pixel half width and round caps. */
export function screenWireIntersectsFrustum(clipMatrix: Matrix4, width: number, viewport: Vector2, resistance = 1, pixelScale = 1): boolean {
  const start = new Vector4(0, 0, 0, 1).applyMatrix4(clipMatrix);
  const end = new Vector4(0, 0, 1, 1).applyMatrix4(clipMatrix);
  // Clip depth first so that a wire passing the camera uses its visible endpoint's pixel scale.
  if (!clipSpatialWireDepth(start, end)) return false;
  width *= Math.pow(pixelScale / Math.max(0.000001, Math.min(start.w, end.w)), 1 - resistance);
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
