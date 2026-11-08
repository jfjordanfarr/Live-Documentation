import { GLSL3, LinearSRGBColorSpace, Matrix4, NoToneMapping, PlaneGeometry, RawShaderMaterial, ShaderChunk, ShaderLib, Sphere, SphereGeometry, SRGBColorSpace, UniformsUtils, Vector3, type Camera, type WebGLRenderer } from "three";

/** A perspective sphere's conservative rectangle in normalized clip coordinates. */
export interface SphereClipBounds { left: number; right: number; bottom: number; top: number }

/** Exact tangent bounds; an eye-plane crossing covers the viewport and is resolved by ray intersection. */
export function sphereClipBounds(center: { x: number; y: number; z: number }, radius: number, projection: Matrix4): SphereClipBounds | null {
  if (![center.x, center.y, center.z, radius, ...projection.elements].every(Number.isFinite) || radius <= 0) return null;
  const e = projection.elements, depth = -center.z;
  const near = e[14] / (e[10] - 1), far = e[10] === -1 ? Infinity : e[14] / (e[10] + 1);
  if (center.x * center.x + center.y * center.y + center.z * center.z <= radius * radius
    || depth + radius <= 0 || depth + radius < near || depth - radius > far) return null;
  if (depth <= radius) return { left: -1, right: 1, bottom: -1, top: 1 };
  const denominator = depth * depth - radius * radius;
  const horizontal = e[0] * radius * Math.sqrt(center.x * center.x + denominator) / denominator;
  const vertical = e[5] * radius * Math.sqrt(center.y * center.y + denominator) / denominator;
  const x = e[0] * center.x * depth / denominator - e[8], y = e[5] * center.y * depth / denominator - e[9];
  return { left: x - horizontal, right: x + horizontal, bottom: y - vertical, top: y + vertical };
}

/** Four submitted corners bound a sphere; its material draws the actual curved surface, never the rectangle. */
export function containedSphereGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(2, 2);
  // The submitted primitive is a unit sphere; the plane's positions only choose its projected bounding corners.
  geometry.boundingSphere = new Sphere(new Vector3(), 1);
  return geometry;
}

/** Actual front-surface silhouette candidates, clipped only in depth; moving carriers retain offscreen geometry. */
export function projectSphereBoundary(matrix: readonly number[], localRadius: number, camera: Camera, width: number, height: number): Array<{ x: number; y: number }> {
  const transform = new Matrix4().multiplyMatrices(camera.matrixWorldInverse, new Matrix4().fromArray(matrix));
  const center = new Vector3().setFromMatrixPosition(transform), radius = localRadius * Math.hypot(transform.elements[0], transform.elements[1], transform.elements[2]);
  const lengthSquared = center.lengthSq(), squared = radius * radius, tangent = lengthSquared - squared;
  if (![...transform.elements, radius, width, height].every(Number.isFinite) || radius <= 0 || tangent <= 0) return [];
  const e = camera.projectionMatrix.elements, near = e[14] / (e[10] - 1), far = e[10] === -1 ? Infinity : e[14] / (e[10] + 1);
  const points: Vector3[] = [], tolerance = Math.max(1, radius) * 1e-8;
  const facingTolerance = Math.max(1, lengthSquared) * Number.EPSILON * 64;
  const planes = [{ normal: new Vector3(0, 0, 1), offset: -near }, { normal: new Vector3(0, 0, 1), offset: -far }, { normal: center, offset: tangent }];
  const circle = (origin: Vector3, u: Vector3, v: Vector3, reach: number): void => {
    const angles = Array.from({ length: 96 }, (_, index) => index * Math.PI / 48);
    // Include exact clipping intersections, so a narrow visible arc cannot disappear between sampled angles.
    for (const plane of planes) {
      const a = plane.normal.dot(u) * reach, b = plane.normal.dot(v) * reach;
      const scale = Math.hypot(a, b), target = plane.offset - plane.normal.dot(origin);
      if (!(scale > 0) || !Number.isFinite(target) || Math.abs(target) > scale) continue;
      const angle = Math.atan2(b, a), crossing = Math.acos(Math.max(-1, Math.min(1, target / scale)));
      angles.push(angle - crossing, angle + crossing);
    }
    for (const angle of angles) {
      const point = origin.clone().addScaledVector(u, reach * Math.cos(angle)).addScaledVector(v, reach * Math.sin(angle));
      if (-point.z < near - tolerance || -point.z > far + tolerance || center.dot(point) > tangent + facingTolerance) continue;
      points.push(point);
    }
  };
  const direction = center.clone().normalize(), axis = Math.abs(direction.z) < .9 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0);
  const u = direction.clone().cross(axis).normalize(), v = direction.clone().cross(u);
  circle(center.clone().multiplyScalar(tangent / lengthSquared), u, v, radius * Math.sqrt(tangent / lengthSquared));
  for (const depth of [near, far]) {
    const section = squared - (depth + center.z) ** 2;
    if (!Number.isFinite(section) || section < 0) continue;
    circle(new Vector3(center.x, center.y, -depth), new Vector3(1, 0, 0), new Vector3(0, 1, 0), Math.sqrt(section));
  }
  return points.flatMap(point => {
    const clip = point.clone().applyMatrix4(camera.projectionMatrix);
    return Number.isFinite(clip.x) && Number.isFinite(clip.y)
      ? [{ x: (clip.x + 1) * width / 2, y: (1 - clip.y) * height / 2 }] : [];
  });
}

/** A depth-cut sphere needs its front-surface polygons as well as its outer silhouette (for example, a near-plane annulus). */
export function projectSphereSurface(matrix: readonly number[], localRadius: number, camera: Camera, width: number, height: number): {
  boundary: Array<{ x: number; y: number }>;
  polygons?: Array<Array<{ x: number; y: number }>>;
} {
  const boundary = projectSphereBoundary(matrix, localRadius, camera, width, height);
  if (!boundary.length) return { boundary };
  const transform = new Matrix4().multiplyMatrices(camera.matrixWorldInverse, new Matrix4().fromArray(matrix));
  const center = new Vector3().setFromMatrixPosition(transform), radius = localRadius * Math.hypot(transform.elements[0], transform.elements[1], transform.elements[2]);
  const e = camera.projectionMatrix.elements, near = e[14] / (e[10] - 1), far = e[10] === -1 ? Infinity : e[14] / (e[10] + 1);
  if (-center.z - radius >= near && -center.z + radius <= far) return { boundary };
  // Only depth-cut marks pay for this sampling. Ordinary marks use the tangent circle directly.
  const geometry = new SphereGeometry(1, 96, 64), positions = geometry.getAttribute("position"), indices = geometry.getIndex()!;
  const vertices = Array.from({ length: positions.count }, (_, index) => new Vector3().fromBufferAttribute(positions, index).multiplyScalar(radius).add(center));
  const polygons: Array<Array<{ x: number; y: number }>> = [];
  for (let index = 0; index < indices.count; index += 3) {
    const a = vertices[indices.getX(index)], b = vertices[indices.getX(index + 1)], c = vertices[indices.getX(index + 2)];
    if (b.clone().sub(a).cross(c.clone().sub(a)).dot(a) >= 0) continue;
    let polygon = [a, b, c];
    for (const plane of [near, far]) {
      const clipped: Vector3[] = [];
      const distance = (point: Vector3): number => plane === near ? -point.z - near : far + point.z;
      for (let at = 0; at < polygon.length; at++) {
        const from = polygon[at], to = polygon[(at + 1) % polygon.length], da = distance(from), db = distance(to);
        if (da >= 0) clipped.push(from);
        if ((da < 0) !== (db < 0)) clipped.push(from.clone().lerp(to, da / (da - db)));
      }
      polygon = clipped;
    }
    if (polygon.length < 3) continue;
    polygons.push(polygon.map(point => {
      const projected = point.clone().applyMatrix4(camera.projectionMatrix);
      return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
    }));
  }
  geometry.dispose();
  return { boundary, polygons };
}

/** Enable the actual per-sample interpolation needed to preserve native MSAA coverage and depth. */
export function supportsContainedSphereSamples(renderer: WebGLRenderer): boolean {
  const gl = renderer.getContext();
  return renderer.toneMapping === NoToneMapping
    && (renderer.outputColorSpace === SRGBColorSpace || renderer.outputColorSpace === LinearSRGBColorSpace)
    && !!gl.getExtension("OES_sample_variables") && !!gl.getExtension("OES_shader_multisample_interpolation");
}

/** Choose the compatible native primitive before any shader compilation on unsupported contexts. */
export function containedSpherePrimitive(renderer?: WebGLRenderer): { geometry: PlaneGeometry | SphereGeometry; material?: ContainedSphereMaterial } {
  return renderer && supportsContainedSphereSamples(renderer)
    ? { geometry: containedSphereGeometry(), material: new ContainedSphereMaterial() }
    : { geometry: new SphereGeometry(1, 12, 12) };
}

/** Lambert-lit analytic unit sphere, scaled uniformly by its uploaded instance matrix. */
export class ContainedSphereMaterial extends RawShaderMaterial {
  readonly sphereRadius = 1;

  constructor() {
    const shader = { vertexShader: ShaderLib.lambert.vertexShader, fragmentShader: ShaderLib.lambert.fragmentShader };

      shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>
attribute float spatialOpacity;
varying float vSpatialOpacity;
varying vec3 vSphereCenter;
varying float vSphereRadius;
varying vec3 vSphereRay;`)
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpatialOpacity = spatialOpacity;")
        .replace("#include <project_vertex>", `
mat4 sphereModelView = modelViewMatrix * instanceMatrix;
vec3 sphereCenter = sphereModelView[3].xyz;
float sphereRadius = length(sphereModelView[0].xyz);
vSphereCenter = sphereCenter;
vSphereRadius = sphereRadius;
float sphereDepth = -sphereCenter.z;
vec2 sphereLow = vec2(-1.0), sphereHigh = vec2(1.0);
if (sphereDepth > sphereRadius + 0.000001) {
  float denominator = sphereDepth * sphereDepth - sphereRadius * sphereRadius;
  vec2 halfSize = vec2(projectionMatrix[0][0], projectionMatrix[1][1]) * sphereRadius
    * sqrt(sphereCenter.xy * sphereCenter.xy + vec2(denominator)) / denominator;
  vec2 middle = vec2(projectionMatrix[0][0], projectionMatrix[1][1]) * sphereCenter.xy * sphereDepth / denominator
    - vec2(projectionMatrix[2][0], projectionMatrix[2][1]);
  sphereLow = middle - halfSize;
  sphereHigh = middle + halfSize;
}
vec2 sphereClip = mix(sphereLow, sphereHigh, position.xy * 0.5 + 0.5);
vSphereRay = vec3((sphereClip.x + projectionMatrix[2][0]) / projectionMatrix[0][0],
  (sphereClip.y + projectionMatrix[2][1]) / projectionMatrix[1][1], -1.0);
gl_Position = sphereDepth + sphereRadius <= 0.0 || dot(sphereCenter, sphereCenter) <= sphereRadius * sphereRadius
  ? vec4(2.0, 2.0, 2.0, 1.0) : vec4(sphereClip, 0.0, 1.0);
vec4 mvPosition = vec4(sphereCenter, 1.0);
`);
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
uniform mat4 projectionMatrix;
varying float vSpatialOpacity;
varying vec3 vSphereCenter;
varying float vSphereRadius;
varying vec3 vSphereRay;
vec3 containedViewPosition;
#define vViewPosition containedViewPosition`)
        .replace("#include <lights_lambert_pars_fragment>", ShaderChunk.lights_lambert_pars_fragment.replace("varying vec3 vViewPosition;", ""))
        .replace("void main() {", `void main() {
vec3 sphereRay = normalize(interpolateAtSample(vSphereRay, gl_SampleID));
float along = dot(sphereRay, vSphereCenter);
vec3 separation = vSphereCenter - sphereRay * along;
float discriminant = vSphereRadius * vSphereRadius - dot(separation, separation);
if (discriminant < 0.0) discard;
float sphereDistance = along - sqrt(max(0.0, discriminant));
// A camera inside the sphere has no front-facing surface, as with the native FrontSide mesh.
if (sphereDistance <= 0.0) discard;
vec3 containedHit = sphereRay * sphereDistance;
vec4 containedClip = projectionMatrix * vec4(containedHit, 1.0);
if (containedClip.w <= 0.0 || containedClip.z < -containedClip.w || containedClip.z > containedClip.w) discard;
gl_FragDepth = (containedClip.z / containedClip.w + 1.0) * 0.5;
containedViewPosition = -containedHit;
`)
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vSpatialOpacity;")
        .replace("#include <normal_fragment_begin>", `float faceDirection = 1.0;
vec3 normal = normalize(containedHit - vSphereCenter);
vec3 nonPerturbedNormal = normal;`);
    const uniforms = UniformsUtils.clone(ShaderLib.lambert.uniforms);
    uniforms.containedOutputSRGB = { value: true };
    super({
      glslVersion: GLSL3, lights: true, transparent: true, uniforms,
      defines: { USE_INSTANCING: 1, USE_INSTANCING_COLOR: 1 },
      vertexShader: `precision highp float;
precision highp int;
#define HIGH_PRECISION
#define varying out
#define attribute in
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
in vec3 position;
in vec3 normal;
in vec2 uv;
in mat4 instanceMatrix;
in vec3 instanceColor;
` + shader.vertexShader,
      fragmentShader: `#extension GL_OES_sample_variables : require
#extension GL_OES_shader_multisample_interpolation : require
precision highp float;
precision highp int;
#define HIGH_PRECISION
#define varying in
#define USE_COLOR
layout(location = 0) out highp vec4 containedColor;
#define gl_FragColor containedColor
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DGradEXT textureGrad
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
uniform bool containedOutputSRGB;
${ShaderChunk.colorspace_pars_fragment}
vec4 linearToOutputTexel(vec4 value) { return containedOutputSRGB ? sRGBTransferOETF(value) : value; }
` + shader.fragmentShader
    });
    this.customProgramCacheKey = () => "spatial-contained-sphere-per-sample-v2";
    this.onBeforeCompile = (_shader, renderer) => {
      if (!supportsContainedSphereSamples(renderer)) throw new Error("Per-sample sphere material requires sample variables/interpolation and the supported output pipeline; use native sphere geometry on this context.");
    };
    this.onBeforeRender = renderer => {
      const srgb = renderer.outputColorSpace === SRGBColorSpace;
      if (this.uniforms.containedOutputSRGB.value !== srgb) { this.uniforms.containedOutputSRGB.value = srgb; this.uniformsNeedUpdate = true; }
    };
  }
}
