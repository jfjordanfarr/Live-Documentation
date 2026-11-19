import { describe, expect, it } from "vitest";

import { ARRIVAL_EASE_MS, ARRIVAL_FLOOR_RATIO, ARRIVAL_HOLD_MS, arrivalEndFrame, arrivalPose, easeInOutCubic, FRAMING_EASE_MAX_MS, FRAMING_EASE_MIN_MS, framingEaseMs, pinsFrame, poseBetween, revealPan, sameCamera, unionOf, type FramingTarget } from "./camera-intent";
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

describe("the frame that follows the pins (Framing, Follows Pins)", () => {
  const { horizontal, vertical } = framePadding(frame);
  const room = { width: frame.width - 2 * horizontal, height: frame.height - 2 * vertical };
  const reading = 1.2, floor = reading * ARRIVAL_FLOOR_RATIO;
  const target = (key: string, bounds: Bounds, card = false): FramingTarget => ({ key, bounds, card });
  const within = (bounds: Bounds, camera: { x: number; y: number; k: number }) => {
    const drawn = onScreen(bounds, camera);
    return drawn.left >= horizontal - 1e-6 && drawn.right <= frame.width - horizontal + 1e-6 && drawn.top >= vertical - 1e-6 && drawn.bottom <= frame.height - vertical + 1e-6;
  };

  it("has nothing to frame without targets", () => {
    expect(pinsFrame([], frame, reading, floor)).toBeNull();
  });

  it("frames one card as an arrival does: at reading scale, centred, or entered at its top where it is taller than the room", () => {
    const small = pinsFrame([target("a", box(100, 100, 300, 200), true)], frame, reading, floor)!;
    expect(small.transform.k).toBe(reading);
    const drawn = onScreen(box(100, 100, 300, 200), small.transform);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(600, 6);
    expect((drawn.top + drawn.bottom) / 2).toBeCloseTo(400, 6);
    const tall = pinsFrame([target("a", box(100, -400, 300, 2000), true)], frame, reading, floor)!;
    expect(tall.transform.k, "a tall card is not shrunk to fit").toBe(reading);
    expect(onScreen(box(100, -400, 300, 2000), tall.transform).top).toBeCloseTo(vertical, 6);
    expect(tall.held).toEqual(["a"]);
  });

  it("frames one symbol's row with its name line at reading scale where they fit, smaller where they do not, never past the floor", () => {
    const near = box(0, 0, 300, 400);
    expect(pinsFrame([target("s", near)], frame, reading, floor)!.transform.k).toBe(reading);
    const far = box(0, 0, 300, 1400);
    const framed = pinsFrame([target("s", far)], frame, reading, floor)!;
    expect(framed.transform.k).toBeCloseTo(room.height / 1400, 9);
    expect(within(far, framed.transform)).toBe(true);
    const beyond = pinsFrame([target("s", box(0, 0, 300, 20_000))], frame, reading, floor)!;
    expect(beyond.transform.k).toBe(floor);
    expect(onScreen(box(0, 0, 300, 20_000), beyond.transform).top, "entered at its start").toBeCloseTo(vertical, 6);
  });

  it("frames two pinned rows in two cards, the owner's PostPayment and PostPaymentRow, as large as fits, centred on the pair, never past reading scale", () => {
    const rowA = box(100, 150, 200, 120), rowB = box(700, 120, 220, 160);
    const framed = pinsFrame([target("PostPaymentRow", rowA), target("PostPayment", rowB)], frame, reading, floor)!;
    const pair = unionOf([rowA, rowB])!;
    expect(framed.transform.k).toBe(reading);
    expect(within(pair, framed.transform)).toBe(true);
    const spread = [target("a", box(0, 0, 200, 100)), target("b", box(1800, 900, 200, 100))];
    const wide = pinsFrame(spread, frame, reading, floor)!;
    expect(wide.transform.k).toBeCloseTo(Math.min(room.width / 2000, room.height / 1000), 9);
    expect(wide.transform.k).toBeLessThan(reading);
    expect(within(unionOf(spread.map(each => each.bounds))!, wide.transform)).toBe(true);
    expect(wide.held).toEqual(["a", "b"]);
    expect(wide.left).toEqual([]);
  });

  it("leaves out the oldest, one at a time, until the rest fit at the floor; the newest is always held", () => {
    const span = room.width / floor;
    const targets = [target("oldest", box(-3 * span, 0, 100, 100)), target("old", box(-span / 2, 0, 100, 100)),
      target("new", box(0, 0, 100, 100)), target("newest", box(span / 3, 0, 100, 100))];
    const framed = pinsFrame(targets, frame, reading, floor)!;
    expect(framed.left).toEqual(["oldest"]);
    expect(framed.held).toEqual(["old", "new", "newest"]);
    expect(framed.transform.k).toBeGreaterThanOrEqual(floor * (1 - 1e-9));
    for (const each of targets.slice(1)) expect(within(each.bounds, framed.transform), each.key).toBe(true);
    // Far apart, only the newest stays, and alone it is framed as one pin is.
    const apart = pinsFrame([target("old", box(-10 * span, 0, 300, 200), true), target("newest", box(0, 0, 300, 200), true)], frame, reading, floor)!;
    expect(apart.held).toEqual(["newest"]);
    expect(apart.left).toEqual(["old"]);
    expect(apart.transform.k).toBe(reading);
  });

  it("holds a target by its brief beside others and whole alone: a tall unpinned subject's name line beside a new pin", () => {
    const subject = target("subject", box(0, 0, 300, 3000), true), name = box(0, 0, 300, 40);
    const pin = target("pin", box(600, 1200, 300, 400), true);
    const withPin = pinsFrame([{ ...subject, brief: name }, pin], frame, reading, floor)!;
    expect(withPin.held).toEqual(["subject", "pin"]);
    expect(within(name, withPin.transform) && within(pin.bounds, withPin.transform)).toBe(true);
    expect(pinsFrame([subject, pin], frame, reading, floor)!.left, "held whole, the subject would not fit beside it").toEqual(["subject"]);
    expect(pinsFrame([{ ...subject, brief: name }], frame, reading, floor)!.transform.k, "alone it is the arrival's card").toBe(reading);
  });

  it("depends on its inputs alone", () => {
    const targets = [target("a", box(-40, 12, 310, 170)), target("b", box(900, 300, 320, 240), true)];
    expect(pinsFrame(targets, frame, reading, floor)).toEqual(pinsFrame(targets.map(each => ({ ...each, bounds: { ...each.bounds } })), { ...frame }, reading, floor));
  });
});

describe("the following camera's ease", () => {
  it("grows with the distance, from a short pull back to a capped long ride", () => {
    const here = { x: 0, y: 0, k: 1.2 };
    expect(framingEaseMs(here, here, frame)).toBe(FRAMING_EASE_MIN_MS);
    const pullBack = framingEaseMs(here, { x: 150, y: 100, k: 0.9 }, frame);
    const ride = framingEaseMs(here, { x: -6000, y: 0, k: 1.2 }, frame);
    expect(pullBack).toBeGreaterThan(FRAMING_EASE_MIN_MS);
    expect(pullBack).toBeLessThan(ride);
    expect(ride).toBe(FRAMING_EASE_MAX_MS);
  });

  it("passes through the poses between, zoom even in its logarithm, and ends exactly on the frame", () => {
    const start = { x: -500, y: -200, k: 1.2 }, end = { x: 100, y: 50, k: 0.3 };
    expect(poseBetween(start, end, 0, frame)).toEqual(start);
    const last = poseBetween(start, end, 1, frame);
    expect(sameCamera(last, end)).toBe(true);
    expect(poseBetween(start, end, 0.5, frame).k).toBeCloseTo(Math.sqrt(1.2 * 0.3), 9);
  });

  it("tells apart cameras the eye can tell apart", () => {
    expect(sameCamera({ x: 0, y: 0, k: 1 }, { x: 0.2, y: -0.3, k: 1.0005 })).toBe(true);
    expect(sameCamera({ x: 0, y: 0, k: 1 }, { x: 2, y: 0, k: 1 })).toBe(false);
    expect(sameCamera({ x: 0, y: 0, k: 1 }, { x: 0, y: 0, k: 0.99 })).toBe(false);
  });
});
