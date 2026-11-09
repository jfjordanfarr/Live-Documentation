import type { Page } from "@playwright/test";
import { Frustum, Matrix4, Vector3 } from "three";
import type { BufferGeometry, InstancedMesh, Material, Mesh, PerspectiveCamera, Scene, SphereGeometry, WebGLRenderer } from "three";

type Observed = Window & { renderedGraph: { scene: Scene; camera: PerspectiveCamera; renderer: WebGLRenderer } };
interface Pose { name: string; center: number[]; near: number; far: number; visible: boolean; shift?: number; overlap?: boolean; radius?: number }

/** Native Three geometry and the actual Lambert renderer independently grade the submitted contained primitive. */
export async function compareContainedRendering(page: Page, native: boolean) {
  const projection = await page.evaluate(() => [...(window as unknown as Observed).renderedGraph.camera.projectionMatrix.elements]);
  const frustum = new Frustum().setFromProjectionMatrix(new Matrix4().fromArray(projection));
  const poses: Pose[] = [
    { name: "close", center: [0, 0, -5], near: .1, far: 500, visible: true },
    { name: "shifted off axis", center: [2, .4, -5], near: .1, far: 500, shift: .2, visible: true },
    { name: "near-cut annulus", center: [0, 0, -3], near: 2.1, far: 500, visible: true },
    { name: "far-cut cap", center: [0, 0, -3], near: .1, far: 2.2, visible: true },
    { name: "eye-plane crossing outside eye", center: [1.4, 0, -.4], near: .1, far: 500, visible: true },
    { name: "eye-plane crossing wholly off axis", center: [4, 3, -.4], near: .1, far: 500, visible: false },
    { name: "behind eye", center: [0, 0, 3], near: .1, far: 500, visible: false },
    { name: "eye inside", center: [0, 0, -.4], near: .1, far: 500, visible: false },
    { name: "front completely clipped", center: [0, 0, -3], near: 2.8, far: 500, visible: false },
    { name: "beyond far plane", center: [0, 0, -5], near: .1, far: 2, visible: false },
    { name: "before near plane", center: [0, 0, -.05], near: .1, far: 500, radius: .02, visible: false },
    { name: "interleaved translucent overlap under skin", center: [0, 0, -5], near: .1, far: 500, overlap: true, visible: true }
  ];
  // The native Frustum supplies centers outside each side plane whose full sphere still has a visible cap.
  for (const [index, plane] of frustum.planes.entries()) {
    if (plane.normal.x === 0 && plane.normal.y === 0) continue;
    const center = new Vector3(0, 0, -5);
    center.addScaledVector(plane.normal, -.9 - plane.distanceToPoint(center));
    poses.push({ name: `side-plane ${index} intersection`, center: center.toArray(), near: .1, far: 500, visible: true });
  }
  return page.evaluate(({ poses, native }) => {
    const { scene, camera, renderer } = (window as unknown as Observed).renderedGraph;
    const files = scene.getObjectByName("Spatial shell files") as InstancedMesh<BufferGeometry, Material>;
    const nodes = scene.getObjectByName("Spatial nodes") as InstancedMesh<BufferGeometry, Material>;
    if (nodes.geometry.type !== "SphereGeometry" || nodes.material.type !== "MeshLambertMaterial") throw new Error("The independent reference requires native ordinary-node SphereGeometry and MeshLambertMaterial");
    const records = files.userData.spatialUnits as Array<{ id: string }>;
    const slot = records.findIndex(record => record.id === "Portal/Models/PaymentRequestModel.cs");
    if (slot < 0) throw new Error("The real Models contained file was not uploaded");
    const Geometry = nodes.geometry.constructor as new (radius: number, width: number, height: number) => SphereGeometry;
    const reference = new Geometry(1, native ? 12 : 192, native ? 12 : 128);
    for (const [name, attribute] of Object.entries(files.geometry.attributes)) {
      if ("isInstancedBufferAttribute" in attribute) reference.setAttribute(name, attribute);
    }
    const original = { geometry: files.geometry, material: files.material, count: files.count, camera: camera.clone(),
      matrices: files.instanceMatrix.array.slice(), colors: files.instanceColor!.array.slice(), opacity: files.geometry.getAttribute("spatialOpacity").array.slice() };
    const meshes: Array<{ object: Mesh; visible: boolean; position: Vector3 }> = [];
    scene.traverse(object => { if ((object as Mesh).isMesh) meshes.push({ object: object as Mesh, visible: object.visible, position: object.position.clone() }); });
    const matrix = camera.matrixWorld.clone(); files.getMatrixAt(slot, matrix);
    const world = matrix.clone().premultiply(files.matrixWorld), radius = Math.hypot(world.elements[0], world.elements[1], world.elements[2]);
    const read = () => {
      renderer.render(scene, camera);
      const gl = renderer.getContext(), data = new Uint8Array(renderer.domElement.width * renderer.domElement.height * 4);
      gl.readPixels(0, 0, renderer.domElement.width, renderer.domElement.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return data;
    };
    const dirty = () => { files.instanceMatrix.needsUpdate = true; files.instanceColor!.needsUpdate = true; original.geometry.getAttribute("spatialOpacity").needsUpdate = true; };
    const maskOf = (data: Uint8Array, background: Uint8Array) => {
      const mask = new Uint8Array(data.length / 4);
      for (let p = 0; p < mask.length; p++) { const i = p * 4; mask[p] = Number(Math.max(Math.abs(data[i] - background[i]), Math.abs(data[i + 1] - background[i + 1]), Math.abs(data[i + 2] - background[i + 2])) > 3); }
      return mask;
    };
    const results = [];
    try {
      for (const pose of poses) {
        camera.copy(original.camera); camera.clearViewOffset(); camera.near = pose.near * radius; camera.far = pose.far * radius; camera.updateProjectionMatrix();
        if (pose.shift) camera.setViewOffset(renderer.domElement.width, renderer.domElement.height, renderer.domElement.width * pose.shift, 0, renderer.domElement.width, renderer.domElement.height);
        camera.updateMatrixWorld();
        for (const { object, position } of meshes) { object.position.copy(position); object.visible = object === files || !!pose.overlap && (object.name === "Spatial wrappers" || object.name === "Spatial shell balloons"); }
        if (pose.overlap) {
          const center = camera.position.clone().set(...pose.center.map(value => value * radius) as [number, number, number]).applyMatrix4(camera.matrixWorld);
          const delta = center.sub(camera.position.clone().setFromMatrixPosition(world));
          for (const { object } of meshes) if (object !== files && object.visible) object.position.add(delta);
        }
        files.visible = true; files.count = pose.overlap ? 4 : 1;
        for (let index = 0; index < files.count; index++) {
          const offset = pose.overlap ? [[-.35, 0, -.5], [.35, 0, -.2], [-.15, 0, .25], [.2, 0, .5]][index] : [0, 0, 0];
          const point = camera.position.clone().set((pose.center[0] + offset[0]) * radius, (pose.center[1] + offset[1]) * radius, (pose.center[2] + offset[2]) * radius).applyMatrix4(camera.matrixWorld);
          const transform = world.clone().scale(camera.position.clone().setScalar(pose.radius ?? 1)).setPosition(point).premultiply(files.matrixWorld.clone().invert());
          files.setMatrixAt(index, transform);
          files.instanceColor!.setXYZ(index, original.colors[3 * slot], original.colors[3 * slot + 1], original.colors[3 * slot + 2]);
          original.geometry.getAttribute("spatialOpacity").setX(index, original.opacity[slot]);
        }
        dirty();
        const count = files.count; files.count = 0; const background = read(); files.count = count;
        files.geometry = reference; files.material = nodes.material;
        const expected = read(), mask = maskOf(expected, background), masks = [mask];
        if (pose.overlap) {
          masks.length = 0;
          const matrices = files.instanceMatrix.array.slice(), colors = files.instanceColor!.array.slice();
          for (let index = 0; index < count; index++) {
            matrix.fromArray(matrices, 16 * index); files.setMatrixAt(0, matrix); files.instanceColor!.setXYZ(0, colors[3 * index], colors[3 * index + 1], colors[3 * index + 2]); files.count = 1; dirty();
            masks.push(maskOf(read(), background));
          }
          files.instanceMatrix.array.set(matrices); files.instanceColor!.array.set(colors); files.count = count; dirty();
        }
        files.geometry = original.geometry; files.material = original.material;
        const actual = read(), width = renderer.domElement.width, height = renderer.domElement.height, edges = new Uint8Array(mask.length);
        for (const unit of masks) for (let p = 0; p < unit.length; p++) {
          const x = p % width, y = Math.floor(p / width);
          if (!(x + 1 < width && unit[p] !== unit[p + 1] || y + 1 < height && unit[p] !== unit[p + width])) continue;
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) edges[p + dy * width + dx] = 1;
        }
        const all = { pixels: 0, changed: 0, total: 0, max: 0 }, edge = { ...all }, interior = { ...all }, outside = { ...all };
        let covered = 0, overlapInterior = 0;
        for (let p = 0; p < mask.length; p++) {
          const i = p * 4, delta = Math.max(Math.abs(actual[i] - expected[i]), Math.abs(actual[i + 1] - expected[i + 1]), Math.abs(actual[i + 2] - expected[i + 2]));
          covered += mask[p];
          if (masks.length > 1 && !edges[p] && masks.reduce((sum, unit) => sum + unit[p], 0) > 1) overlapInterior++;
          const region = edges[p] ? edge : mask[p] ? interior : outside;
          for (const stats of [all, region]) { stats.pixels++; stats.total += delta; stats.max = Math.max(stats.max, delta); if (delta > 3) stats.changed++; }
        }
        results.push({ name: pose.name, visible: pose.visible, overlap: !!pose.overlap, covered, overlapInterior, all, edge, interior, outside });
      }
      return { material: original.material.type, vertices: original.geometry.getAttribute("position").count, samples: renderer.getContext().getParameter(renderer.getContext().SAMPLES), results };
    } finally {
      files.geometry = original.geometry; files.material = original.material; files.count = original.count;
      files.instanceMatrix.array.set(original.matrices); files.instanceColor!.array.set(original.colors); original.geometry.getAttribute("spatialOpacity").array.set(original.opacity); dirty();
      camera.copy(original.camera); camera.updateMatrixWorld(); for (const { object, visible, position } of meshes) { object.visible = visible; object.position.copy(position); }
      reference.dispose(); renderer.render(scene, camera);
    }
  }, { poses, native });
}

/** Observe a real clipped mark and its skin in the framebuffer, independently of frozen-carrier projection. */
export async function clippedContainedMark(page: Page, setNear = true) {
  return page.evaluate(setNear => {
    const { scene, camera, renderer } = (window as unknown as Observed).renderedGraph;
    const files = scene.getObjectByName("Spatial shell files") as InstancedMesh<BufferGeometry, Material>;
    const skin = scene.getObjectByName("Spatial wrappers") as Mesh<BufferGeometry, Material>;
    const records = files.userData.spatialUnits as Array<{ seed: string; id: string }>;
    const slot = records.findIndex(record => record.id === "Portal/Models/PaymentRequestModel.cs");
    if (slot < 0) throw new Error("The Models mark is not submitted");
    const record = records[slot], matrix = camera.matrixWorld.clone(); files.getMatrixAt(slot, matrix);
    const world = matrix.clone().premultiply(files.matrixWorld), center = camera.position.clone().setFromMatrixPosition(world), view = center.clone().applyMatrix4(camera.matrixWorldInverse);
    const radius = Math.hypot(world.elements[0], world.elements[1], world.elements[2]);
    if (setNear) { camera.near = -view.z - .9 * radius; camera.updateProjectionMatrix(); }
    const width = renderer.domElement.width, height = renderer.domElement.height, frame = renderer.domElement.getBoundingClientRect();
    const read = () => { renderer.render(scene, camera); const gl = renderer.getContext(), data = new Uint8Array(width * height * 4); gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data); return data; };
    const meshes: Array<{ object: Mesh; visible: boolean }> = [];
    scene.traverse(object => { if ((object as Mesh).isMesh) meshes.push({ object: object as Mesh, visible: object.visible }); });
    const original = { count: files.count, matrices: files.instanceMatrix.array.slice(), colors: files.instanceColor!.array.slice(), opacity: files.geometry.getAttribute("spatialOpacity").array.slice(), drawStart: skin.geometry.drawRange.start, drawCount: skin.geometry.drawRange.count, skinMaterial: skin.material };
    const dirty = () => { files.instanceMatrix.needsUpdate = true; files.instanceColor!.needsUpdate = true; files.geometry.getAttribute("spatialOpacity").needsUpdate = true; };
    try {
      for (const { object } of meshes) object.visible = object === files;
      files.count = 0; const background = read(); files.count = 1;
      files.setMatrixAt(0, matrix); files.instanceColor!.setXYZ(0, original.colors[3 * slot], original.colors[3 * slot + 1], original.colors[3 * slot + 2]); files.geometry.getAttribute("spatialOpacity").setX(0, original.opacity[slot]); dirty();
      const pixels = read(), mask = new Uint8Array(width * height);
      for (let p = 0; p < mask.length; p++) { const i = 4 * p; mask[p] = Number(Math.max(Math.abs(pixels[i] - background[i]), Math.abs(pixels[i + 1] - background[i + 1]), Math.abs(pixels[i + 2] - background[i + 2])) > 1); }
      const covered = Array.from(mask.keys()).filter(index => mask[index]);
      const minX = Math.min(...covered.map(index => index % width)), maxX = Math.max(...covered.map(index => index % width));
      const minY = Math.min(...covered.map(index => Math.floor(index / width))), maxY = Math.max(...covered.map(index => Math.floor(index / width)));
      const visited = new Uint8Array(mask.length); let enclosedHole: number[] = [];
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const start = y * width + x; if (mask[start] || visited[start]) continue;
        const component = [start]; visited[start] = 1; let touchesBorder = false;
        for (let at = 0; at < component.length; at++) {
          const index = component[at], px = index % width, py = Math.floor(index / width);
          if (px === minX || px === maxX || py === minY || py === maxY) touchesBorder = true;
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = px + dx, ny = py + dy, next = ny * width + nx;
            if (nx < minX || nx > maxX || ny < minY || ny > maxY || mask[next] || visited[next]) continue;
            visited[next] = 1; component.push(next);
          }
        }
        if (!touchesBorder && component.length > enclosedHole.length) enclosedHole = component;
      }
      const empty = new Set(enclosedHole), meanX = enclosedHole.reduce((sum, index) => sum + index % width, 0) / enclosedHole.length;
      const meanY = enclosedHole.reduce((sum, index) => sum + Math.floor(index / width), 0) / enclosedHole.length;
      const holeCenters = enclosedHole.filter(index => [-1, 0, 1].every(dy => [-1, 0, 1].every(dx => empty.has(index + dy * width + dx))));
      if (!holeCenters.length) throw new Error("The actual GPU mark has no enclosed three-by-three hole");
      const holeIndex = holeCenters.reduce((best, index) => Math.hypot(index % width - meanX, Math.floor(index / width) - meanY) < Math.hypot(best % width - meanX, Math.floor(best / width) - meanY) ? index : best);
      const cx = holeIndex % width, cy = Math.floor(holeIndex / width), hole = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) hole.push(mask[(cy + dy) * width + cx + dx]);
      // Render every other file without the target, retaining their order; a zero-alpha target would still write depth.
      let otherCount = 0;
      for (let at = 0; at < original.count; at++) if (at !== slot) {
        matrix.fromArray(original.matrices, 16 * at); files.setMatrixAt(otherCount, matrix);
        files.instanceColor!.setXYZ(otherCount, original.colors[3 * at], original.colors[3 * at + 1], original.colors[3 * at + 2]);
        files.geometry.getAttribute("spatialOpacity").setX(otherCount, original.opacity[at]); otherCount++;
      }
      files.count = otherCount; dirty(); const others = read(), occupied = new Uint8Array(mask.length);
      for (let p = 0; p < mask.length; p++) { const i = 4 * p; occupied[p] = Number(Math.max(Math.abs(others[i] - background[i]), Math.abs(others[i + 1] - background[i + 1]), Math.abs(others[i + 2] - background[i + 2])) > 3); }
      const candidates: Array<{ index: number; radius: number; angle: number }> = [];
      for (let p = 0; p < mask.length; p++) if (mask[p] && p % width > 1 && p % width < width - 2 && p >= width && p < mask.length - width) {
        let clear = true;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!mask[p + dy * width + dx] || occupied[p + dy * width + dx]) clear = false;
        if (clear) candidates.push({ index: p, radius: Math.hypot(p % width - cx, Math.floor(p / width) - cy), angle: Math.atan2(Math.floor(p / width) - cy, p % width - cx) });
      }
      if (!candidates.length) throw new Error("The clipped target has no rim pixels clear of every other file");
      const radii = candidates.map(point => point.radius), middle = (Math.min(...radii) + Math.max(...radii)) / 2;
      const rims = [0, 2 * Math.PI / 3, 4 * Math.PI / 3].map(angle => candidates.reduce((best, point) => {
        const score = (candidate: typeof point) => Math.abs(Math.atan2(Math.sin(candidate.angle - angle), Math.cos(candidate.angle - angle))) * middle + Math.abs(candidate.radius - middle);
        return score(point) < score(best) ? point : best;
      }).index);
      const cross = (a: number, b: number) => (a % width - cx) * (Math.floor(b / width) - cy) - (b % width - cx) * (Math.floor(a / width) - cy);
      const crosses = rims.map((a, index) => cross(a, rims[(index + 1) % rims.length]));
      const enclosed = new Set(rims).size === 3 && (crosses.every(value => value > 0) || crosses.every(value => value < 0));
      files.visible = false; skin.visible = true;
      const ranges = (skin.userData.spatialWrappers as { ranges: Array<{ seed: string; x: number; y: number; z: number }> }).ranges;
      const group = ranges.findIndex(range => range.seed === record.seed), positions = skin.geometry.getAttribute("wrapperGroup"), indices = skin.geometry.getIndex()!;
      let first = -1, last = -1;
      for (let index = original.drawStart; index < Math.min(indices.count, original.drawStart + original.drawCount); index++) if (positions.getX(indices.getX(index)) === group) { if (first < 0) first = index; last = index; }
      if (first < 0) throw new Error("The mark's actual uploaded skin is absent");
      skin.geometry.setDrawRange(first, last - first + 1);
      const skinBottom = (pixels: Uint8Array): number => {
        let bottom = -1;
        for (let p = 0; p < mask.length; p++) { const i = p * 4; if (Math.max(Math.abs(pixels[i] - background[i]), Math.abs(pixels[i + 1] - background[i + 1]), Math.abs(pixels[i + 2] - background[i + 2])) > 1) bottom = Math.max(bottom, height - 1 - Math.floor(p / width)); }
        return bottom;
      };
      const visibleSkinBottom = skinBottom(read());
      const rings = scene.getObjectByName("Spatial rings") as Mesh<BufferGeometry, Material>;
      if (rings.material.type !== "MeshBasicMaterial") throw new Error("The geometric framebuffer anchor requires native MeshBasicMaterial");
      const Basic = rings.material.constructor as new (options: { color: number; side: number; depthTest: boolean; depthWrite: boolean }) => Material;
      const solid = new Basic({ color: 0xffffff, side: skin.material.side, depthTest: false, depthWrite: false });
      let bottom: number;
      try { skin.material = solid; bottom = skinBottom(read()); }
      finally { skin.material = original.skinMaterial; solid.dispose(); }
      if (bottom < 0 || visibleSkinBottom < 0) throw new Error("The actual uploaded skin contributes no framebuffer boundary");
      // No selected skin vertex is offscreen or behind the eye, so its depth-clipped triangles cannot hide a side extent.
      const vertices = skin.geometry.getAttribute("position"); let sidesInside = true;
      for (let at = first; at <= last; at++) {
        const index = indices.getX(at), point = center.clone().set(vertices.getX(index), vertices.getY(index), vertices.getZ(index)).applyMatrix4(skin.matrixWorld);
        const view = point.clone().applyMatrix4(camera.matrixWorldInverse), projected = point.project(camera);
        if (view.z >= 0 || !Number.isFinite(projected.x) || !Number.isFinite(projected.y) || Math.abs(projected.x) >= 1 || Math.abs(projected.y) >= 1) sidesInside = false;
      }
      const bodyCenter = center.clone().set(ranges[group].x, ranges[group].y, ranges[group].z).applyMatrix4(skin.matrixWorld).project(camera);
      const screen = (x: number, y: number) => ({ x: frame.left + (x + .5) * frame.width / width, y: frame.top + (height - .5 - y) * frame.height / height });
      const projectedCenter = center.clone().project(camera);
      const centerPixel = { x: (projectedCenter.x + 1) * width / 2, y: (1 - projectedCenter.y) * height / 2 };
      return { id: record.id, seed: record.seed, sidesInside, visibleSkinBottom, geometricSkinBottom: bottom, holeOffsetFromProjectedCenter: { x: cx + .5 - centerPixel.x, y: height - .5 - cy - centerPixel.y }, hole, holePoint: screen(cx, cy), rimPoints: rims.map(rim => screen(rim % width, Math.floor(rim / width))), enclosed, color: [original.colors[3 * slot], original.colors[3 * slot + 1], original.colors[3 * slot + 2]],
        body: { x: frame.left + (bodyCenter.x + 1) * frame.width / 2, labelY: frame.top + (bottom + .5) * frame.height / height + 10 }, near: camera.near, material: files.material.type };
    } finally {
      files.count = original.count; files.instanceMatrix.array.set(original.matrices); files.instanceColor!.array.set(original.colors); files.geometry.getAttribute("spatialOpacity").array.set(original.opacity); dirty();
      skin.material = original.skinMaterial; skin.geometry.setDrawRange(original.drawStart, original.drawCount); for (const { object, visible } of meshes) object.visible = visible; renderer.render(scene, camera);
    }
  }, setNear);
}
