import { describe, expect, it } from "vitest";

import { ARRIVAL_EASE_MS, ARRIVAL_FLOOR_RATIO, ARRIVAL_HOLD_MS, arrivalEndFrame, arrivalPose, cutByEdge, cutPan, easeInOutCubic, FRAMING_EASE_MAX_MS, FRAMING_EASE_MIN_MS, framingEaseMs, framingTravel, keepFrame, smoothZoom, pinsFrame, poseBetween, revealPan, sameCamera, stepLinesFrame, stepWholeFrame, unionOf, type FramingTarget } from "./camera-intent";
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

  it("holds the newest whole and the older by their names: an older whole-file pin keeps its name line beside a new one", () => {
    const older = { ...target("older", box(0, 0, 300, 2400), true), brief: box(0, 0, 300, 40) };
    const newest = target("newest", box(500, 1200, 300, 500), true);
    const framed = pinsFrame([older, newest], frame, reading, floor)!;
    expect(framed.held).toEqual(["older", "newest"]);
    expect(within(older.brief, framed.transform) && within(newest.bounds, framed.transform)).toBe(true);
    // The newest is never held by its brief: given one, its whole card is still framed.
    const briefNewest = pinsFrame([older, { ...newest, brief: box(500, 1200, 300, 40) }], frame, reading, floor)!;
    expect(within(newest.bounds, briefNewest.transform)).toBe(true);
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

describe("a re-frame the person did not cause (keepFrame)", () => {
  const { horizontal, vertical } = framePadding(frame);
  const reading = 1.2, floor = reading * ARRIVAL_FLOOR_RATIO;
  const target = (key: string, bounds: Bounds, card = false): FramingTarget => ({ key, bounds, card });
  const within = (bounds: Bounds, camera: { x: number; y: number; k: number }) => {
    const drawn = onScreen(bounds, camera);
    return drawn.left >= horizontal - 1e-6 && drawn.right <= frame.width - horizontal + 1e-6 && drawn.top >= vertical - 1e-6 && drawn.bottom <= frame.height - vertical + 1e-6;
  };

  it("never zooms in: held targets that moved apart a little are panned to, at the camera's own scale", () => {
    const camera = { x: 0, y: 0, k: 0.6 };
    const held = [target("a", box(0, 0, 200, 100)), target("b", box(900, 200, 200, 100))];
    const kept = keepFrame(held, camera, frame, floor)!;
    expect(kept.transform.k).toBe(0.6);
    expect(kept.held).toEqual(["a", "b"]);
    for (const each of held) expect(within(each.bounds, kept.transform)).toBe(true);
    expect(keepFrame([target("a", box(100, 100, 50, 50))], camera, frame, floor)!.transform, "a target in view moves nothing").toEqual(camera);
  });

  it("zooms out only as far as the held targets need, never past the floor, and keeps every one it can", () => {
    const camera = { x: 0, y: 0, k: reading };
    const held = [target("a", box(0, 0, 200, 100)), target("b", box(2000, 0, 200, 100))];
    const kept = keepFrame(held, camera, frame, floor)!;
    expect(kept.transform.k).toBeLessThan(reading);
    expect(kept.transform.k).toBeGreaterThanOrEqual(floor);
    expect(kept.left).toEqual([]);
    for (const each of held) expect(within(each.bounds, kept.transform)).toBe(true);
  });

  it("where even the floor cannot hold them, keeps the newest and says the rest are left out", () => {
    const camera = { x: 0, y: 0, k: reading };
    const held = [target("old", box(-20_000, 0, 200, 100)), target("newest", box(0, 0, 200, 100))];
    const kept = keepFrame(held, camera, frame, floor)!;
    expect(kept.held).toEqual(["newest"]);
    expect(kept.left).toEqual(["old"]);
    expect(kept.transform.k, "and still does not zoom in").toBeLessThanOrEqual(reading);
    expect(within(held[1].bounds, kept.transform)).toBe(true);
  });
});

describe("the smooth zoom's path for a long re-frame (van Wijk and Nuij)", () => {
  const floor = 0.4;
  it("pulls back, travels and closes in, never past the floor, ending exactly on the frame", () => {
    const start = { x: 0, y: 0, k: 1.2 }, end = { x: -9000, y: -3000, k: 1.0 };
    expect(framingTravel(start, end, frame)).toBeGreaterThan(1);
    const { pose, duration } = smoothZoom(start, end, frame, floor);
    expect(sameCamera(pose(0), start)).toBe(true);
    expect(pose(1)).toEqual(end);
    const middle = pose(0.5);
    expect(middle.k, "farther out in the middle than at either end").toBeLessThan(1.0);
    for (let t = 0; t <= 1; t += 0.05) expect(pose(t).k).toBeGreaterThanOrEqual(floor - 1e-9);
    expect(duration).toBeGreaterThanOrEqual(FRAMING_EASE_MIN_MS);
    expect(duration).toBeLessThanOrEqual(2 * FRAMING_EASE_MAX_MS);
  });

  it("is a plain zoom where the middle does not move", () => {
    const { pose } = smoothZoom({ x: 600 - 100 * 1.2, y: 400 - 100 * 1.2, k: 1.2 }, { x: 600 - 100 * 0.6, y: 400 - 100 * 0.6, k: 0.6 }, frame, floor);
    const half = pose(0.5);
    expect((600 - half.x) / half.k).toBeCloseTo(100, 6);
    expect(half.k).toBeCloseTo(Math.sqrt(1.2 * 0.6), 6);
  });
});

describe("a step's frame under Step, Whole", () => {
  const camera = { x: 0, y: 0, k: 1 };
  const inside = (bounds: Bounds, at: { x: number; y: number; k: number }) => {
    const { horizontal, vertical } = framePadding(frame), drawn = onScreen(bounds, at);
    return drawn.left >= horizontal - 1e-6 && drawn.right <= frame.width - horizontal + 1e-6 && drawn.top >= vertical - 1e-6 && drawn.bottom <= frame.height - vertical + 1e-6;
  };

  it("keeps the scale and pans the least where the whole newcomer fits at it", () => {
    const newcomer = box(1000, 600, 400, 300);
    const end = stepWholeFrame(newcomer, newcomer, camera, frame, 0.5);
    expect(end.k).toBe(1);
    expect(inside(newcomer, end)).toBe(true);
    const pan = revealPan(newcomer, camera, frame);
    expect(end).toEqual({ x: pan.x, y: pan.y, k: 1 });
  });

  it("does not move a newcomer already whole in view", () => {
    expect(stepWholeFrame(box(100, 100, 300, 200), box(100, 100, 300, 60), camera, frame, 0.5)).toEqual(camera);
  });

  it("eases out just far enough to hold a newcomer that does not fit, and holds it whole", () => {
    const newcomer = box(200, 100, 1600, 900);
    const end = stepWholeFrame(newcomer, box(200, 100, 600, 80), camera, frame, 0.3);
    const { horizontal, vertical } = framePadding(frame);
    expect(end.k).toBeCloseTo(Math.min((frame.width - 2 * horizontal) / 1600, (frame.height - 2 * vertical) / 900), 9);
    expect(inside(newcomer, end)).toBe(true);
  });

  it("stops at the floor, and brings in there the start of a newcomer too large even for it, not its box's corner", () => {
    // An L-shaped membrane: its box's top left is far above and left of its label, which with its first row is its start.
    const newcomer = box(-3000, -2000, 8000, 6000), start = box(1600, 900, 600, 80);
    const end = stepWholeFrame(newcomer, start, camera, frame, 0.5);
    expect(end.k).toBe(0.5);
    // Scaled about the frame's middle (600, 400) from the camera at the origin, then the least pan that brings the start in.
    const scaled = { x: 300, y: 200, k: 0.5 }, pan = revealPan(start, scaled, frame);
    expect(end).toEqual({ x: scaled.x + pan.x, y: scaled.y + pan.y, k: 0.5 });
    const drawn = onScreen(start, end), { horizontal, vertical } = framePadding(frame);
    expect(drawn.left).toBeGreaterThanOrEqual(horizontal - 1e-6);
    expect(drawn.bottom).toBeLessThanOrEqual(frame.height - vertical + 1e-6);
  });

  it("never zooms in: a camera already farther than the newcomer needs keeps its scale", () => {
    const far = { x: 0, y: 0, k: 0.4 };
    expect(stepWholeFrame(box(100, 100, 300, 200), box(100, 100, 300, 60), far, frame, 0.3).k).toBe(0.4);
  });
});

describe("a step's frame under Step, With Its Lines", () => {
  it("frames the newcomer and what its lines reach as Fit would, centred, between the floor and reading scale", () => {
    const newcomer = box(1000, 500, 400, 300), reach = box(0, 0, 2000, 1000);
    const end = stepLinesFrame(reach, newcomer, newcomer, frame, 1.2, 0.3);
    const { horizontal } = framePadding(frame);
    expect(end.k).toBeCloseTo((frame.width - 2 * horizontal) / 2000, 9);
    const drawn = onScreen(reach, end);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(frame.width / 2, 6);
    expect((drawn.top + drawn.bottom) / 2).toBeCloseTo(frame.height / 2, 6);
  });

  it("never enlarges past reading scale", () => {
    const small = box(100, 100, 300, 200);
    expect(stepLinesFrame(small, small, small, frame, 1.2, 0.3).k).toBe(1.2);
  });

  it("where even the floor cannot hold what the lines reach, frames the newcomer alone, centred", () => {
    const newcomer = box(2000, 3000, 3000, 300), reach = box(0, 0, 9000, 9000);
    const end = stepLinesFrame(reach, newcomer, box(2000, 3000, 600, 80), frame, 1.2, 0.25);
    expect(end.k).toBeCloseTo((frame.width - 2 * framePadding(frame).horizontal) / 3000, 9);
    const drawn = onScreen(newcomer, end);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(frame.width / 2, 6);
  });

  it("where the newcomer alone does not fit even at the floor, stands its start at the room's top left there", () => {
    const newcomer = box(-2000, 3000, 9000, 300), reach = box(-9000, 0, 20000, 9000), start = box(1000, 3000, 600, 80);
    const end = stepLinesFrame(reach, newcomer, start, frame, 1.2, 0.25);
    expect(end.k).toBe(0.25);
    const drawn = onScreen(start, end), { horizontal, vertical } = framePadding(frame);
    expect(drawn.left).toBeCloseTo(horizontal, 9);
    expect(drawn.top).toBeCloseTo(vertical, 9);
  });
});

describe("the cut counted under Step, Least Pan, Cut Counted", () => {
  const camera = { x: 0, y: 0, k: 1 };

  it("counts the newcomer's cards past each edge, a card cut at a corner at both its edges, and names no edge past which nothing goes", () => {
    const cards = [
      { key: "inside", bounds: box(100, 100, 200, 150) },
      { key: "east", bounds: box(1100, 100, 200, 150) },
      { key: "south", bounds: box(100, 700, 200, 150) },
      { key: "corner", bounds: box(1100, 700, 200, 150) }
    ];
    expect(cutByEdge(cards, camera, frame)).toEqual({ right: ["east", "corner"], bottom: ["south", "corner"] });
  });

  it("reads the cards on screen at the camera's scale and place", () => {
    const cards = [{ key: "a", bounds: box(100, 100, 200, 150) }];
    expect(cutByEdge(cards, { x: -150, y: 0, k: 1 }, frame)).toEqual({ left: ["a"] });
    expect(cutByEdge(cards, { x: 0, y: 0, k: 0.5 }, frame)).toEqual({});
  });

  it("a sign pans along its own axis alone, the least that brings the cards cut there in", () => {
    const cut = [box(1100, 100, 200, 150), box(1150, 300, 200, 150)];
    const end = cutPan(cut, "right", camera, frame);
    const { horizontal } = framePadding(frame);
    expect(end.y).toBe(0);
    expect(end.k).toBe(1);
    expect(end.x + 1350).toBeCloseTo(frame.width - horizontal, 9);
  });
});
