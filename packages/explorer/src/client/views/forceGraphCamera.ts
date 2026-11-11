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
  viewport: { width: number; height: number; insets?: { left: number; right: number; top: number; bottom: number } },
  padding = 70,
  subject?: CameraPoint
): { camera: CameraPoint; target: CameraPoint } | null {
  if (!spheres.length) return null;
  const insets = viewport.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  const usableWidth = viewport.width - insets.left - insets.right;
  const usableHeight = viewport.height - insets.top - insets.bottom;
  if (usableWidth <= 0 || usableHeight <= 0) return null;
  const margin = Math.min(padding, (usableWidth - 1) / 2, (usableHeight - 1) / 2);
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
  const left = -1 + 2 * (insets.left + margin) / viewport.width;
  const rightEdge = 1 - 2 * (insets.right + margin) / viewport.width;
  const bottom = -1 + 2 * (insets.bottom + margin) / viewport.height;
  const top = 1 - 2 * (insets.top + margin) / viewport.height;
  const centerX = (left + rightEdge) / 2, centerY = (bottom + top) / 2;
  const horizontal = tangent * camera.aspect;
  let distance = 140;
  for (const { center, radius } of spheres) {
    const x = center.x - target.x, y = center.y - target.y, z = center.z - target.z;
    const depth = x * back.x + y * back.y + z * back.z;
    distance = Math.max(
      distance,
      ((x * right.x + y * right.y + z * right.z + radius) / horizontal + rightEdge * depth + Math.abs(rightEdge) * radius) / (rightEdge - centerX),
      ((-x * right.x - y * right.y - z * right.z + radius) / horizontal - left * depth + Math.abs(left) * radius) / (centerX - left),
      ((x * up.x + y * up.y + z * up.z + radius) / tangent + top * depth + Math.abs(top) * radius) / (top - centerY),
      ((-x * up.x - y * up.y - z * up.z + radius) / tangent - bottom * depth + Math.abs(bottom) * radius) / (centerY - bottom),
      depth + radius + camera.near
    );
  }
  // Translate camera and target together: the bearing and canvas stay unchanged, while the subject is centered in
  // the uncovered rectangle. The asymmetric frustum bounds above account for every sphere's depth and radius.
  target.addScaledVector(right, -centerX * distance * horizontal).addScaledVector(up, -centerY * distance * tangent);
  return { camera: target.clone().addScaledVector(back, distance), target };
}

/**
 * What a panel standing in the picture's top left corner takes from the camera's room (2026-11-11): the room beside it,
 * as the view has always framed the picture, while that leaves the picture `least` pixels of width; where it does not,
 * the room above the panel's lower edge, so that the picture is framed below the panel and never under it. The history's
 * step panel was as tall as the picture, and where nothing was left beside it the panel was hidden or the picture drawn
 * under it; a few lines high since this date, it can stand above the picture instead. The room beside is kept wherever
 * it serves because it is the taller one: a picture as tall as it is wide is drawn larger there than below (measured on
 * this repository's root Structure picture, which a rule by the larger area had drawn a fifth smaller). `room` is the
 * picture's room before the panel, `panel` the panel's right and bottom edges within it.
 */
export function cornerPanelInsets(room: { width: number; height: number }, panel: { right: number; bottom: number }, least = 320): { left: number; top: number } {
  const right = Math.max(0, Math.min(room.width, panel.right)), bottom = Math.max(0, Math.min(room.height, panel.bottom));
  return room.width - right >= least ? { left: right, top: 0 } : { left: 0, top: bottom };
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
