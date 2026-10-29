import { Vector3, type Camera, type PerspectiveCamera } from "three";

/** A position in the Force Graph's world coordinate system. */
export interface CameraPoint { x: number; y: number; z: number }

/** A visible body whose full extent must fit when a file or scope receives focus. */
export interface CameraSphere {
  center: CameraPoint;
  radius: number;
}

/** Frame a group about its own center or an explicit subject, preserving the camera bearing and allowing for sphere radii and viewport padding. */
export function frameCameraSpheres(
  camera: PerspectiveCamera,
  spheres: readonly CameraSphere[],
  viewport: { width: number; height: number },
  padding = 70,
  subject?: CameraPoint
): { camera: CameraPoint; target: CameraPoint } | null {
  if (!spheres.length) return null;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const { center, radius } of spheres) {
    minX = Math.min(minX, center.x - radius); maxX = Math.max(maxX, center.x + radius);
    minY = Math.min(minY, center.y - radius); maxY = Math.max(maxY, center.y + radius);
    minZ = Math.min(minZ, center.z - radius); maxZ = Math.max(maxZ, center.z + radius);
  }
  const target = subject ? new Vector3(subject.x, subject.y, subject.z) : new Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const back = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
  const tangent = Math.tan(camera.getEffectiveFOV() * Math.PI / 360);
  const horizontal = tangent * camera.aspect * Math.max(.1, 1 - 2 * padding / viewport.width);
  const vertical = tangent * Math.max(.1, 1 - 2 * padding / viewport.height);
  let distance = 140;
  for (const { center, radius } of spheres) {
    const x = center.x - target.x, y = center.y - target.y, z = center.z - target.z;
    const front = x * back.x + y * back.y + z * back.z + radius;
    distance = Math.max(
      distance,
      front + (Math.abs(x * right.x + y * right.y + z * right.z) + radius) / horizontal,
      front + (Math.abs(x * up.x + y * up.y + z * up.z) + radius) / vertical,
      front + camera.near
    );
  }
  return { camera: target.clone().addScaledVector(back, distance), target };
}

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
