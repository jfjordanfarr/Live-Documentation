import { BufferGeometry, Color, DynamicDrawUsage, Frustum, InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, MeshLambertMaterial, Sphere, Vector3, type Camera, type Scene, type WebGLRenderer } from "three";

type GraphMesh = Mesh<BufferGeometry, MeshLambertMaterial> & { __graphObjType?: string; __linkThreeObjType?: string };

/** The instance actually drawn for a native graph object's picking/placement proxy; its slot can change with depth. */
export interface SpatialBatchInstance {
  mesh: InstancedMesh<BufferGeometry, MeshLambertMaterial>;
  instance: number;
  enabled: boolean;
}
interface Entry extends SpatialBatchInstance { object: GraphMesh; scale: Vector3; depth: number; tubeRadius?: number }
interface Group { mesh: InstancedMesh<BufferGeometry, MeshLambertMaterial>; entries: Entry[]; capacity: number }
const attributeVersion = (geometry: BufferGeometry, name: string): number => {
  const attribute = geometry.getAttribute(name);
  return !attribute ? 0 : "version" in attribute ? attribute.version : attribute.data.version;
};

/** Keep the library's interaction/physics loop running, but draw WebGL only when its picture changes. */
export function drawSpatialGraphOnChange(scene: Scene, camera: Camera, renderer: WebGLRenderer, composer: { render(delta?: number): void }): void {
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
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    renderer.getClearColor(clear);
    // WebGL uploads these matrices as Float32. Damping continues in doubles long after the uploaded picture is
    // identical; compare at the actual upload precision, against the last drawn frame so small moves accumulate.
    const view = [...camera.matrixWorld.elements, ...camera.matrixWorldInverse.elements, ...camera.projectionMatrix.elements,
      renderer.domElement.width, renderer.domElement.height, clear.r, clear.g, clear.b, renderer.getClearAlpha()].map(Math.fround);
    let changed = view.length !== previousCamera.length || view.some((value, i) => value !== previousCamera[i]);
    const current = new Map<GraphMesh, readonly unknown[]>();
    scene.traverse(object => {
      const mesh = object as GraphMesh;
      if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshLambertMaterial)
        || (!mesh.__graphObjType && mesh.__linkThreeObjType !== "arrow")) return;
      let visible = mesh.material.visible;
      for (let parent = object; parent; parent = parent.parent!) visible &&= parent.visible;
      const material = mesh.material;
      const values = [...mesh.matrixWorld.elements, visible, mesh.renderOrder, mesh.geometry.uuid,
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
  };
}

/**
 * Instance the native sphere/tube shapes at their original sizes, retaining native objects for picking and dragging.
 * Each instance carries its world transform, linear colour and alpha. The native material keeps its depth rules.
 * Proxies are hidden only during WebGL drawing and restored before the next interaction pass.
 */
export function batchSpatialGraph(scene: Scene): { dispose(): void } {
  const groups = new Map<string, Group>();
  const entries = new Map<GraphMesh, Entry>();
  const shapes = new WeakMap<BufferGeometry, { key: string; geometry: BufferGeometry; scale: Vector3; tubeRadius?: number }>();
  const materialKeys = new WeakMap<MeshLambertMaterial, string>();
  const inverse = new Matrix4(), matrix = new Matrix4(), projection = new Matrix4();
  const sphere = new Sphere(), frustum = new Frustum(), point = new Vector3();
  let hidden: Array<{ object: GraphMesh; visible: boolean }> = [];
  const before = scene.onBeforeRender.bind(scene), after = scene.onAfterRender.bind(scene);
  const restore = (): void => {
    for (const { object, visible } of hidden) object.visible = visible;
    hidden = [];
  };
  scene.onBeforeRender = function (...args): void {
    before.apply(this, args);
    const camera = args[2];
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
    for (const object of entries.keys()) if (!present.has(object)) { entries.delete(object); delete object.userData.spatialBatch; }
    for (const group of groups.values()) group.entries = [];
    for (const { object, visible } of objects) {
      const source = object.geometry, material = object.material;
      let shape = shapes.get(source);
      if (!shape) {
        // The native factory varies only radius for spheres and straight unit tubes. Keep every segment and cap;
        // put that radius in the instance transform instead of uploading another copy of the same shape.
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
          key = JSON.stringify([source.type, { ...parameters, radiusTop: 1, radiusBottom: 1 }]);
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
        const shared = material.clone();
        shared.color.setRGB(1, 1, 1); shared.opacity = 1; shared.visible = true;
        // Three supplies instance matrices and RGB. Carry alpha beside them without a matrix-texture lookup.
        shared.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float spatialOpacity;\nvarying float vSpatialOpacity;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpatialOpacity = spatialOpacity;");
          shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vSpatialOpacity;")
            .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vSpatialOpacity;");
        };
        shared.customProgramCacheKey = () => "spatial-instance-alpha";
        const geometry = shape.geometry.clone().scale(1 / shape.scale.x, 1 / shape.scale.y, 1 / shape.scale.z);
        const mesh = new InstancedMesh(geometry, shared, 1);
        mesh.name = "Spatial graph batch"; mesh.renderOrder = object.renderOrder;
        mesh.frustumCulled = false; mesh.raycast = () => {};
        scene.add(mesh);
        group = { mesh, entries: [], capacity: 0 }; groups.set(key, group);
      }
      let entry = entries.get(object);
      if (!entry) {
        entry = { mesh: group.mesh, instance: -1, enabled: visible, object, scale: shape.scale, depth: 0 };
        entries.set(object, entry); object.userData.spatialBatch = entry;
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
      if (group.entries.length > group.capacity) {
        // Instance attributes belong to the mesh, ordinary attributes to its geometry: release both before growing.
        if (group.capacity) { mesh.dispose(); mesh.geometry.dispose(); }
        group.capacity = Math.max(group.entries.length, group.capacity * 2);
        mesh.instanceMatrix = new InstancedBufferAttribute(new Float32Array(group.capacity * 16), 16).setUsage(DynamicDrawUsage);
        mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(group.capacity * 3), 3).setUsage(DynamicDrawUsage);
        mesh.geometry.setAttribute("spatialOpacity", new InstancedBufferAttribute(new Float32Array(group.capacity), 1).setUsage(DynamicDrawUsage));
      }
      const visible: Entry[] = [], unseen: Entry[] = [];
      for (const entry of group.entries) {
        sphere.copy(entry.object.geometry.boundingSphere!).applyMatrix4(entry.object.matrixWorld);
        const intersects = !entry.object.frustumCulled || (frustum.intersectsSphere(sphere)
          && (entry.tubeRadius === undefined || tubeIntersectsFrustum(entry.object.matrixWorld, entry.tubeRadius, frustum)));
        (entry.enabled && intersects ? visible : unseen).push(entry);
      }
      visible.sort((a, b) => (mesh.material.transparent ? b.depth - a.depth : a.depth - b.depth) || a.object.id - b.object.id);
      const opacity = mesh.geometry.getAttribute("spatialOpacity");
      [...visible, ...unseen].forEach((entry, slot) => {
        entry.instance = slot;
        matrix.multiplyMatrices(inverse, entry.object.matrixWorld).scale(entry.scale);
        mesh.setMatrixAt(slot, matrix); mesh.setColorAt(slot, entry.object.material.color);
        opacity.setX(slot, entry.object.material.opacity);
      });
      mesh.count = visible.length;
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor!.needsUpdate = true; opacity.needsUpdate = true;
      mesh.updateMatrixWorld(true);
    }
    hidden = objects.map(({ object }) => ({ object, visible: object.visible }));
    for (const { object } of hidden) object.visible = false;
  };
  scene.onAfterRender = function (...args): void { restore(); after.apply(this, args); };
  return { dispose(): void {
    restore(); scene.onBeforeRender = before; scene.onAfterRender = after;
    for (const object of entries.keys()) delete object.userData.spatialBatch;
    for (const group of groups.values()) { group.mesh.removeFromParent(); group.mesh.dispose(); group.mesh.geometry.dispose(); group.mesh.material.dispose(); }
    entries.clear(); groups.clear();
  } };
}

/** Conservatively clip a straight unit tube's axis against the frustum expanded by its radial support. */
export function tubeIntersectsFrustum(matrix: Matrix4, radius: number, frustum: Frustum): boolean {
  const m = matrix.elements;
  let low = 0, high = 1;
  for (const plane of frustum.planes) {
    const n = plane.normal;
    const support = radius * Math.hypot(n.x * m[0] + n.y * m[1] + n.z * m[2], n.x * m[4] + n.y * m[5] + n.z * m[6]);
    const start = n.x * m[12] + n.y * m[13] + n.z * m[14] + plane.constant + support;
    const end = start + n.x * m[8] + n.y * m[9] + n.z * m[10];
    if (start < 0 && end < 0) return false;
    if (start < 0) low = Math.max(low, start / (start - end));
    else if (end < 0) high = Math.min(high, start / (start - end));
    if (low > high) return false;
  }
  return true;
}
