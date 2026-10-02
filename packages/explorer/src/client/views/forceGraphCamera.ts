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

/** Translate a camera and its target together to place a world point at a normalized screen anchor. */
export function screenAnchorTranslation(camera: Camera, point: CameraPoint, anchor: { x: number; y: number }): Vector3 {
  const original = new Vector3(point.x, point.y, point.z);
  const projected = original.clone().project(camera);
  const wanted = new Vector3(anchor.x * 2 - 1, 1 - anchor.y * 2, projected.z).unproject(camera);
  return original.sub(wanted);
}
