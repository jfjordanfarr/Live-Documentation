import { hostOf, type Scene, type SceneBox, type SceneSegment } from "./branch-scene";

/**
 * The Local Map's picture between two arrangements. A scene says where every
 * card, membrane and lane stands; a pose is the same places flattened to what
 * the renderer sets on each element, keyed by what the element is (a card by
 * its file, a membrane by its directory, a lane by its key), so that two
 * scenes of different structure can be compared element by element. The
 * tween between two poses is the picture part way from one to the other,
 * which the renderer applies frame by frame so that a change of pins or a
 * better arrangement slides every element from where it was to where it now
 * belongs, instead of redrawing the picture under the person's eye (the
 * owner's ask, 2026-10-07).
 *
 * Pure-function module: no DOM. Positions are CSS pixels of the unscaled
 * picture, absolute in it.
 *
 * @module branch-motion
 */

/** A membrane's section or a lane's spacer, where it stands. */
export interface PosedBox {
  key: string;
  kind: "root" | "directory" | "lane";
  directory: string;
  /** The key of the box whose element holds this one's; null for the root. */
  host: string | null;
  /** Padding plus border on each side, which also places a directory's label below its top. */
  inset: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** One per column the box spans, absolute in the picture. */
  segments: SceneSegment[];
}

/** A card, where it stands. */
export interface PosedItem {
  id: string;
  /** The key of the box whose element holds the card's. */
  host: string;
  left: number;
  top: number;
  width: number;
}

/** Every element of the picture at its place. */
export interface Pose {
  items: Map<string, PosedItem>;
  boxes: Map<string, PosedBox>;
  pictureWidth: number;
  pictureHeight: number;
}

/** A box's identity across renders: the root, a directory by its path, a lane by its key; a directory's loose files are their host. */
export function boxKeyOf(box: SceneBox): string {
  const host = hostOf(box);
  if (host.kind === "root") return "root";
  if (host.kind === "lane") return `lane\0${host.lane!.key}`;
  return `directory\0${host.directory}`;
}

/** The scene's places, flattened by element. */
export function scenePose(scene: Scene): Pose {
  const boxes = new Map<string, PosedBox>();
  for (const box of scene.boxes) {
    if (box.kind === "files") continue;
    const key = boxKeyOf(box);
    boxes.set(key, {
      key, kind: box.kind, directory: box.directory, host: box.anchor ? boxKeyOf(box.anchor) : null, inset: box.inset,
      left: box.left, top: box.top, right: box.right, bottom: box.bottom, segments: box.segments.map(segment => ({ ...segment }))
    });
  }
  const items = new Map<string, PosedItem>();
  for (const item of scene.items.values()) {
    items.set(item.id, {
      id: item.id, host: boxKeyOf(item.box),
      left: scene.lefts[item.column] + item.inset, top: scene.tops.get(item.id) ?? 0, width: scene.widths[item.column] - 2 * item.inset
    });
  }
  return { items, boxes, pictureWidth: scene.pictureWidth, pictureHeight: scene.pictureHeight };
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const sameColumns = (a: readonly SceneSegment[], b: readonly SceneSegment[]): boolean =>
  a.length === b.length && a.every((segment, i) => segment.column === b[i].column);

/**
 * The picture `t` of the way from one pose to the next, for every element of
 * the next: an element the previous pose also had moves along the straight
 * line between its two places, its membrane's segments with it when it spans
 * the same columns in both, else standing at once where it will be; an
 * element new to the picture stands at its place throughout. Elements only
 * the previous pose had are not in the result; the renderer fades them out.
 * With no previous pose, or at `t` of 1 or more, the next pose itself.
 */
export function tweenPose(from: Pose | null, to: Pose, t: number): Pose {
  if (!from || t >= 1) return to;
  const items = new Map<string, PosedItem>();
  for (const [id, item] of to.items) {
    const was = from.items.get(id);
    items.set(id, was ? { ...item, left: lerp(was.left, item.left, t), top: lerp(was.top, item.top, t), width: lerp(was.width, item.width, t) } : item);
  }
  const boxes = new Map<string, PosedBox>();
  for (const [key, box] of to.boxes) {
    const was = from.boxes.get(key);
    if (!was) { boxes.set(key, box); continue; }
    boxes.set(key, {
      ...box,
      left: lerp(was.left, box.left, t), top: lerp(was.top, box.top, t), right: lerp(was.right, box.right, t), bottom: lerp(was.bottom, box.bottom, t),
      segments: sameColumns(was.segments, box.segments)
        ? box.segments.map((segment, i) => ({
          column: segment.column,
          left: lerp(was.segments[i].left, segment.left, t), right: lerp(was.segments[i].right, segment.right, t),
          top: lerp(was.segments[i].top, segment.top, t), bottom: lerp(was.segments[i].bottom, segment.bottom, t)
        }))
        : box.segments
    });
  }
  return { items, boxes, pictureWidth: lerp(from.pictureWidth, to.pictureWidth, t), pictureHeight: lerp(from.pictureHeight, to.pictureHeight, t) };
}

/** Slow out of the old place and slow into the new, so that nothing jerks at either end. */
export function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
