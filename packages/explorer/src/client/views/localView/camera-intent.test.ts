import { describe, expect, it } from "vitest";

import { ARRIVAL_EASE_MS, ARRIVAL_FLOOR_RATIO, ARRIVAL_HOLD_MS, arrivalEndFrame, arrivalPose, easeInOutCubic, revealPan, unionOf } from "./camera-intent";
import { STEP_RATIO, zoomLook } from "./ladder-steps";
import { framePadding, type Bounds } from "./layout-measure";

const box = (left: number, top: number, width: number, height: number): Bounds => ({ left, top, width, height, right: left + width, bottom: top + height });
const frame = { width: 1200, height: 800 };
const onScreen = (bounds: Bounds, camera: { x: number; y: number; k: number }) =>
  ({ left: camera.x + bounds.left * camera.k, top: camera.y + bounds.top * camera.k, right: camera.x + bounds.right * camera.k, bottom: camera.y + bounds.bottom * camera.k });

describe("an arrival's end frame", () => {
  it("frames the whole picture, centred inside the padding, as Fit does, where it fits between the floor and reading scale", () => {
    const content = box(0, 0, 2000, 1000), subject = box(900, 400, 300, 200);
    const end = arrivalEndFrame(content, subject, frame, 1.2);
    const { horizontal } = framePadding(frame);
    expect(end.k).toBeCloseTo((frame.width - 2 * horizontal) / 2000, 6);
    const drawn = onScreen(content, end);
    expect(drawn.left).toBeCloseTo(horizontal, 6);
    expect((drawn.top + drawn.bottom) / 2).toBeCloseTo(frame.height / 2, 6);
  });

  it("is never closer than reading scale: a small picture is centred at reading scale", () => {
    const content = box(100, 100, 300, 200);
    const end = arrivalEndFrame(content, content, frame, 1.3);
    expect(end.k).toBe(1.3);
    const drawn = onScreen(content, end);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(600, 6);
  });

  it("stops at the connections look's farthest press, where names read, and centres the subject there, cutting the far neighbours", () => {
    const content = box(0, 0, 20_000, 9_000), subject = box(15_000, 2_000, 400, 600);
    const end = arrivalEndFrame(content, subject, frame, 1.1);
    expect(end.k).toBeCloseTo(1.1 * ARRIVAL_FLOOR_RATIO, 9);
    expect(ARRIVAL_FLOOR_RATIO).toBeCloseTo(STEP_RATIO ** -6, 12);
    expect(zoomLook(end.k / 1.1, "reading"), "the floor still draws the connections look").toBe("connections");
    const drawn = onScreen(subject, end);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(600, 6);
    expect((drawn.top + drawn.bottom) / 2).toBeCloseTo(400, 6);
  });

  it("depends on the picture and the frame alone: the same inputs land on the same frame", () => {
    const content = box(-40, 12, 3100, 1700), subject = box(1000, 300, 320, 240);
    expect(arrivalEndFrame(content, subject, frame, 1)).toEqual(arrivalEndFrame({ ...content }, { ...subject }, { ...frame }, 1));
  });
});

describe("an arrival's hold and ease", () => {
  const start = { x: -500, y: -200, k: 1.2 }, end = { x: 100, y: 50, k: 0.4 };

  it("rests at reading size for the hold, then eases, then ends exactly on the end frame", () => {
    expect(arrivalPose(start, end, 0, frame)).toEqual({ phase: "hold", transform: start });
    expect(arrivalPose(start, end, ARRIVAL_HOLD_MS - 1, frame).phase).toBe("hold");
    const middle = arrivalPose(start, end, ARRIVAL_HOLD_MS + ARRIVAL_EASE_MS / 2, frame);
    expect(middle.phase).toBe("ease");
    expect(middle.transform.k).toBeLessThan(start.k);
    expect(middle.transform.k).toBeGreaterThan(end.k);
    expect(arrivalPose(start, end, ARRIVAL_HOLD_MS + ARRIVAL_EASE_MS, frame)).toEqual({ phase: "done", transform: end });
  });

  it("zooms out without ever passing the end scale, and moves the frame's middle along a straight line", () => {
    let previous = start.k;
    const middles: Array<{ x: number; y: number }> = [];
    for (let elapsed = ARRIVAL_HOLD_MS; elapsed <= ARRIVAL_HOLD_MS + ARRIVAL_EASE_MS; elapsed += 35) {
      const { transform } = arrivalPose(start, end, elapsed, frame);
      expect(transform.k).toBeLessThanOrEqual(previous + 1e-12);
      expect(transform.k).toBeGreaterThanOrEqual(end.k - 1e-12);
      previous = transform.k;
      middles.push({ x: (600 - transform.x) / transform.k, y: (400 - transform.y) / transform.k });
    }
    const [first, last] = [middles[0], middles.at(-1)!];
    for (const point of middles) {
      const cross = (last.x - first.x) * (point.y - first.y) - (last.y - first.y) * (point.x - first.x);
      expect(Math.abs(cross)).toBeLessThan(1e-6);
    }
  });

  it("eases in and out", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9);
  });
});

describe("a step's reveal", () => {
  const camera = { x: 0, y: 0, k: 1 };
  const { horizontal, vertical } = framePadding(frame);

  it("does not move for a newcomer already inside", () => {
    expect(revealPan(box(300, 300, 200, 100), camera, frame)).toEqual({ x: 0, y: 0 });
  });

  it("pans the least that brings a newcomer past the right and bottom edges wholly inside", () => {
    const pan = revealPan(box(1100, 750, 300, 200), camera, frame);
    expect(pan).toEqual({ x: frame.width - horizontal - 1400, y: frame.height - vertical - 950 });
  });

  it("pans the least for one past the left and top edges, at the camera's scale", () => {
    const pan = revealPan(box(-100, -50, 100, 40), { x: 0, y: 0, k: 0.5 }, frame);
    expect(pan).toEqual({ x: horizontal + 50, y: vertical + 25 });
  });

  it("enters a card taller than the view at its top, its name row, with as much below as the view holds", () => {
    for (const top of [900, -1500]) {
      const pan = revealPan(box(200, top, 300, 2000), camera, frame);
      expect(pan.x).toBe(0);
      expect(pan.y).toBe(vertical - top);
    }
  });

  it("unites boxes, and has none for none", () => {
    expect(unionOf([box(0, 0, 10, 10), box(20, -5, 10, 10)])).toEqual(box(0, -5, 30, 15));
    expect(unionOf([])).toBeNull();
  });
});
