import { Vector3, type Camera } from "three";

/** A position in the Force Graph's world coordinate system. */
export interface CameraPoint { x: number; y: number; z: number }

/** Move toward a file without changing the direction from which the person is looking. */
export function focusedCameraPosition(
  camera: CameraPoint,
  lookingAt: CameraPoint,
  node: CameraPoint,
  distance = 140
): CameraPoint {
  const dx = camera.x - lookingAt.x;
  const dy = camera.y - lookingAt.y;
  const dz = camera.z - lookingAt.z;
  const length = Math.hypot(dx, dy, dz);
  if (length < 0.0001) return { x: node.x, y: node.y, z: node.z + distance };
  return {
    x: node.x + dx / length * distance,
    y: node.y + dy / length * distance,
    z: node.z + dz / length * distance
  };
}

/** Zoom around the inspected point, keeping its screen position and never reversing direction at a distance limit. */
export function wheelZoomCamera(camera: CameraPoint, target: CameraPoint, point: CameraPoint, delta: number): { camera: CameraPoint; target: CameraPoint } {
  const distance = Math.hypot(camera.x - point.x, camera.y - point.y, camera.z - point.z);
  if (distance === 0) return { camera: { ...camera }, target: { ...target } };
  // A pan or another camera operation may already have crossed a wheel limit.
  // In that case an outward gesture may return toward the range, but an inward
  // gesture must not jump away from the point (and conversely at the far limit).
  const next = Math.max(Math.min(65, distance), Math.min(Math.max(20000, distance), distance * Math.exp(delta * .0015)));
  const ratio = next / distance;
  const scaled = (position: CameraPoint): CameraPoint => ({
    x: point.x + (position.x - point.x) * ratio,
    y: point.y + (position.y - point.y) * ratio,
    z: point.z + (position.z - point.z) * ratio
  });
  return { camera: scaled(camera), target: scaled(target) };
}

/** Translate a camera and its target together to place a world point at a normalized screen anchor. */
export function screenAnchorTranslation(camera: Camera, point: CameraPoint, anchor: { x: number; y: number }): Vector3 {
  const original = new Vector3(point.x, point.y, point.z);
  const projected = original.clone().project(camera);
  const wanted = new Vector3(anchor.x * 2 - 1, 1 - anchor.y * 2, projected.z).unproject(camera);
  return original.sub(wanted);
}
