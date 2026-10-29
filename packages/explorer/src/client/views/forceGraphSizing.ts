import { Matrix4, Vector3, Vector4, type Camera, type Ray, type Vector2 } from "three";

/** CSS pixels per world unit at a point's depth; behind-camera points have no visible size. */
export function pixelsPerWorldUnit(point: Vector3, camera: Camera, height: number): number {
  const view = camera.matrixWorldInverse.elements;
  const depth = -(view[2] * point.x + view[6] * point.y + view[10] * point.z + view[14]);
  const perspective = camera.projectionMatrix.elements[11] === -1;
  return perspective && depth <= 0 ? 0 : Math.abs(camera.projectionMatrix.elements[5]) * height / (2 * (perspective ? depth : 1));
}

/** World-scale compensation: zero keeps perspective; one turns the base radius into CSS pixels. */
export function spatialSizeScale(point: Vector3, camera: Camera, height: number, resistance: number): number {
  const pixels = pixelsPerWorldUnit(point, camera, height);
  return pixels > 0 ? Math.pow(pixels, -resistance) : 1;
}

/** Clip homogeneous endpoints to the visible depth interval; return their parameters on the original segment. */
export function clipSpatialWireDepth(start: Vector4, end: Vector4): { low: number; high: number } | null {
  let low = 0, high = 1;
  for (const sign of [-1, 1]) {
    const a = start.w + sign * start.z, b = end.w + sign * end.z;
    if (a < 0 && b < 0) return null;
    if (a < 0) low = Math.max(low, a / (a - b));
    else if (b < 0) high = Math.min(high, a / (a - b));
  }
  if (low > high) return null;
  const original = start.clone();
  start.lerp(end, low); end.lerpVectors(original, end, high);
  return start.w > 0 && end.w > 0 ? { low, high } : null;
}

/** Pick a round-capped wire by its projected, possibly tapered stroke, including near/far clipping. */
export function pickSpatialWire(matrix: Matrix4, camera: Camera, viewport: Vector2, width: number, resistance: number, ray: Ray): {
  point: Vector3; pointOnLine: Vector3; distance: number;
} | null {
  const a = new Vector3(0, 0, 0).applyMatrix4(matrix), b = new Vector3(0, 0, 1).applyMatrix4(matrix);
  const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const start = new Vector4(a.x, a.y, a.z, 1).applyMatrix4(projection);
  const end = new Vector4(b.x, b.y, b.z, 1).applyMatrix4(projection);
  const interval = clipSpatialWireDepth(start, end);
  if (!interval) return null;
  const original = a.clone();
  a.lerp(b, interval.low); b.lerpVectors(original, b, interval.high);
  const pixelScale = Math.abs(camera.projectionMatrix.elements[5]) * viewport.y / 2;
  const startWidth = width * Math.pow(pixelScale / start.w, 1 - resistance);
  const endWidth = width * Math.pow(pixelScale / end.w, 1 - resistance);
  const pointer = ray.at(1, new Vector3()).project(camera);
  const ax = start.x / start.w * viewport.x / 2, ay = start.y / start.w * viewport.y / 2;
  const dx = end.x / end.w * viewport.x / 2 - ax, dy = end.y / end.w * viewport.y / 2 - ay;
  const px = pointer.x * viewport.x / 2 - ax, py = pointer.y * viewport.y / 2 - ay;
  const lengthSquared = dx * dx + dy * dy;
  // An end-on stroke is the nearer endpoint's full cap, whichever way its directed edge was stored.
  const endOn = lengthSquared <= (viewport.y * .0000005) ** 2;
  const t = endOn ? (start.z / start.w <= end.z / end.w ? 0 : 1)
    : Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSquared));
  const radius = (startWidth + t * (endWidth - startWidth)) / 2;
  if ((px - t * dx) ** 2 + (py - t * dy) ** 2 > radius ** 2) return null;
  // Rasterized depth is linear in screen coordinates. The closest points of two world-space lines do
  // not give that depth on a tapered, oblique wire, and would sort its hover target against the wrong body.
  const worldT = t * start.w / ((1 - t) * end.w + t * start.w);
  const pointOnLine = a.clone().lerp(b, worldT);
  const point = new Vector3(pointer.x, pointer.y, (1 - t) * start.z / start.w + t * end.z / end.w).unproject(camera);
  return { point, pointOnLine, distance: ray.origin.distanceTo(point) };
}
