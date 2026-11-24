import { describe, expect, it } from "vitest";

import { LAYOUT_RANGES } from "../../layout-presets";
import { getDefaultTuning } from "../../persistence/local-storage";
import { ARRIVAL_WAITS } from "../../types";
import { ARRIVAL_EASE_MS, ARRIVAL_ENDING_INPUTS, ARRIVAL_FLOOR_RATIO, ARRIVAL_REST_S, arrivalEndedBy, arrivalEndFrame, arrivalLookChange, arrivalPose, arrivalReleased, arrivalRestStartsAgain, cutByEdge, cutPan, easeInOutCubic, FRAMING_EASE_MAX_MS, FRAMING_EASE_MIN_MS, framingEaseMs, framingTravel, holdAsked, keepFrame, smoothZoom, pinsFrame, poseBetween, revealPan, sameCamera, stepLinesFrame, stepWholeFrame, unionOf, type FramingTarget } from "./camera-intent";
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

  describe("holds what was asked (2026-11-22: where the neighbourhood cannot be shown with what was asked in the frame, what was asked wins)", () => {
    // A picture the floor cuts, and a subject taller than the frame at the floor: 3,000 units against 800 px at 0.335.
    const content = box(0, 0, 20_000, 9_000), subject = box(9_000, 2_000, 400, 3_000);
    const name = box(9_000, 2_000, 400, 40), row = (top: number): Bounds => box(9_010, top, 380, 66);
    const { horizontal, vertical } = framePadding(frame);
    const within = (bounds: Bounds, camera: { x: number; y: number; k: number }): boolean => {
      const drawn = onScreen(bounds, camera);
      return drawn.left >= horizontal - 1e-6 && drawn.right <= frame.width - horizontal + 1e-6 && drawn.top >= vertical - 1e-6 && drawn.bottom <= frame.height - vertical + 1e-6;
    };

    it("with nothing asked, centres the subject as before, and a tall subject's name then stands above the frame", () => {
      const end = arrivalEndFrame(content, subject, frame, 1);
      expect((onScreen(subject, end).top + onScreen(subject, end).bottom) / 2).toBeCloseTo(frame.height / 2, 6);
      expect(within(name, end), "the fault the rule mends").toBe(false);
    });

    it("enters a subject taller than the frame at its top, its name inside the padding, and keeps the scale and the place across", () => {
      const plain = arrivalEndFrame(content, subject, frame, 1), end = arrivalEndFrame(content, subject, frame, 1, [name]);
      expect(end.k).toBe(plain.k);
      expect(end.x).toBe(plain.x);
      expect(within(name, end)).toBe(true);
      expect(onScreen(name, end).top, "the least pan: the name at the padding's edge, as a step enters a tall card").toBeCloseTo(vertical, 6);
    });

    it("moves nothing where what was asked is already in the frame: a subject that fits, or a picture framed whole", () => {
      const short = box(9_000, 2_000, 400, 600), shortName = box(9_000, 2_000, 400, 40);
      expect(arrivalEndFrame(content, short, frame, 1, [shortName])).toEqual(arrivalEndFrame(content, short, frame, 1));
      const small = box(0, 0, 2000, 1000), inSmall = box(900, 400, 300, 200);
      expect(arrivalEndFrame(small, inSmall, frame, 1.2, [box(900, 400, 300, 40)])).toEqual(arrivalEndFrame(small, inSmall, frame, 1.2));
    });

    it("holds the row asked for with the name where both fit the frame", () => {
      const asked = [name, row(3_200)];
      const end = arrivalEndFrame(content, subject, frame, 1, asked);
      expect(asked.every(bounds => within(bounds, end))).toBe(true);
    });

    it("where the name and the row cannot both be in the frame, holds the row, the more particular thing asked", () => {
      const far = row(4_800);
      const end = arrivalEndFrame(content, subject, frame, 1, [name, far]);
      expect(within(far, end)).toBe(true);
      expect(within(name, end)).toBe(false);
    });

    it("the least pan that holds what was asked, alone: nothing asked or already inside moves nothing", () => {
      const camera = { x: -100, y: -50, k: 0.5 };
      expect(holdAsked(camera, [], frame)).toEqual(camera);
      expect(holdAsked(camera, [box(400, 300, 200, 100)], frame)).toEqual(camera);
      const moved = holdAsked(camera, [box(400, -400, 200, 100)], frame);
      expect(moved.k).toBe(0.5);
      expect(within(box(400, -400, 200, 100), moved)).toBe(true);
    });
  });

  it("depends on the picture and the frame alone: the same inputs land on the same frame", () => {
    const content = box(-40, 12, 3100, 1700), subject = box(1000, 300, 320, 240);
    expect(arrivalEndFrame(content, subject, frame, 1)).toEqual(arrivalEndFrame({ ...content }, { ...subject }, { ...frame }, 1));
  });

  it("handles each axis independently at the floor: centres an axis that fits and clamps an overflowing axis to content bounds", () => {
    const { horizontal, vertical } = framePadding(frame);
    // Fits across at the floor (1500 * 0.335 = 502 < 1144), overflows down (2600 * 0.335 = 871 > 744), subject near foot:
    // centring subject blindly would slice the top while leaving dead void below content.
    const tallContent = box(0, 0, 1500, 2600), lowSubject = box(950, 1950, 260, 400);
    const end = arrivalEndFrame(tallContent, lowSubject, frame, 1);
    const drawn = onScreen(tallContent, end);
    expect((drawn.left + drawn.right) / 2, "fitting horizontal axis centres content, not subject").toBeCloseTo(frame.width / 2, 6);
    expect(drawn.bottom, "overflowing vertical axis leaves no empty void past content's bottom edge").toBeCloseTo(frame.height - vertical, 6);
    // Asymmetric horizontal overflow with subject near left edge: clamps content's left edge to horizontal padding.
    const wideContent = box(0, 0, 5000, 1000), leftSubject = box(200, 300, 260, 400);
    const wideEnd = arrivalEndFrame(wideContent, leftSubject, frame, 1);
    const wideDrawn = onScreen(wideContent, wideEnd);
    expect(wideDrawn.left, "no empty void past content's left edge while slicing neighbours on the right").toBeCloseTo(horizontal, 6);
    expect((wideDrawn.top + wideDrawn.bottom) / 2, "fitting vertical axis centres content").toBeCloseTo(frame.height / 2, 6);
  });

  it("centres an axis whose floor-clamped extent fits inside the frame even within the padding band, keeping both edges inside", () => {
    const { horizontal, vertical } = framePadding(frame);
    const roomW = frame.width - 2 * horizontal, roomH = frame.height - 2 * vertical;
    // Horizontal: roomW < width * floor <= frame.width, subject near right edge.
    const acrossWidth = (roomW + frame.width) / (2 * ARRIVAL_FLOOR_RATIO);
    const acrossContent = box(0, 0, acrossWidth, 800), rightSubject = box(acrossWidth - 400, 200, 300, 200);
    const acrossEnd = arrivalEndFrame(acrossContent, rightSubject, frame, 1);
    const acrossDrawn = onScreen(acrossContent, acrossEnd);
    expect(acrossContent.width * acrossEnd.k).toBeGreaterThan(roomW);
    expect(acrossContent.width * acrossEnd.k).toBeLessThanOrEqual(frame.width);
    expect(acrossDrawn.left, "left edge stays inside frame").toBeGreaterThan(0);
    expect(acrossDrawn.right, "right edge stays inside frame").toBeLessThan(frame.width);
    expect(acrossDrawn.left, "symmetric horizontal margins").toBeCloseTo(frame.width - acrossDrawn.right, 6);
    // Vertical: roomH < height * floor <= frame.height, subject near bottom edge.
    const downHeight = (roomH + frame.height) / (2 * ARRIVAL_FLOOR_RATIO);
    const downContent = box(0, 0, 1000, downHeight), bottomSubject = box(300, downHeight - 300, 300, 200);
    const downEnd = arrivalEndFrame(downContent, bottomSubject, frame, 1);
    const downDrawn = onScreen(downContent, downEnd);
    expect(downContent.height * downEnd.k).toBeGreaterThan(roomH);
    expect(downContent.height * downEnd.k).toBeLessThanOrEqual(frame.height);
    expect(downDrawn.top, "top edge stays inside frame").toBeGreaterThan(0);
    expect(downDrawn.bottom, "bottom edge stays inside frame").toBeLessThan(frame.height);
    expect(downDrawn.top, "symmetric vertical margins").toBeCloseTo(frame.height - downDrawn.bottom, 6);
  });
});

describe("when an arrival's rest at reading size is over", () => {
  const rest = ARRIVAL_REST_S * 1000;

  it("never before the rest has passed, whoever attends or does not", () => {
    for (const waits of ARRIVAL_WAITS) {
      for (const attended of [false, true]) expect(arrivalReleased(waits, rest - 1, rest, attended), `${waits}, attended ${attended}`).toBe(false);
    }
  });

  it("at the rest's end where the pointer and the focus were never on the card", () => {
    for (const waits of ARRIVAL_WAITS) expect(arrivalReleased(waits, rest, rest, false), waits).toBe(true);
  });

  it("waiting on attention: not while the card is attended, however long, and at once when it no longer is", () => {
    expect(arrivalReleased("attended", rest, rest, true)).toBe(false);
    expect(arrivalReleased("attended", rest * 40, rest, true)).toBe(false);
    // The frame after the pointer or the focus left a card it stayed on past the rest: no second rest is owed.
    expect(arrivalReleased("attended", rest * 40 + 16, rest, false)).toBe(true);
  });

  it("never waiting: at the rest's end, attended or not", () => {
    expect(arrivalReleased("never", rest, rest, true)).toBe(true);
  });

  it("the trial of 2026-11-21 starts the rest again while pointed at, so its ease begins a whole rest after the pointer left", () => {
    expect(arrivalRestStartsAgain("pointed", true)).toBe(true);
    expect(arrivalRestStartsAgain("pointed", false)).toBe(false);
    for (const waits of ["attended", "never"] as const) expect(arrivalRestStartsAgain(waits, true), waits).toBe(false);
  });

  it("the default rest is the one the template and the defaults carry, inside the lever's range", () => {
    const [min, max] = LAYOUT_RANGES.localMap.arrivalRest;
    expect(ARRIVAL_REST_S).toBeGreaterThanOrEqual(min);
    expect(ARRIVAL_REST_S).toBeLessThanOrEqual(max);
    expect(getDefaultTuning().localMap.arrivalRest).toBe(ARRIVAL_REST_S);
  });
});

describe("which input ends an arrival where it stands", () => {
  it("a press, the wheel and a touch always do", () => {
    for (const waits of ARRIVAL_WAITS) {
      for (const type of ["pointerdown", "wheel", "touchstart"]) expect(arrivalEndedBy(type, undefined, waits), `${type} under ${waits}`).toBe(true);
    }
  });

  it("waiting on attention, a key that only moves the focus does not: the focus holds the picture and lets it go", () => {
    for (const key of ["Tab", "Shift", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]) {
      expect(arrivalEndedBy("keydown", key, "attended"), key).toBe(false);
    }
  });

  it("a key that acts does, and under the other choices every key does, as before", () => {
    for (const key of ["Enter", " ", "Escape", "ContextMenu", "a", "+"]) expect(arrivalEndedBy("keydown", key, "attended"), key).toBe(true);
    for (const waits of ["never", "pointed"] as const) expect(arrivalEndedBy("keydown", "Tab", waits), waits).toBe(true);
  });

  it("every ending input is one the rule knows", () => {
    expect([...ARRIVAL_ENDING_INPUTS].sort()).toEqual(["keydown", "pointerdown", "touchstart", "wheel"]);
  });
});

describe("an arrival's ease", () => {
  const start = { x: -500, y: -200, k: 1.2 }, end = { x: 100, y: 50, k: 0.4 };

  it("rests at reading size until its rest is over, then eases, then ends exactly on the end frame", () => {
    expect(arrivalPose(start, end, -1, frame)).toEqual({ phase: "hold", transform: start });
    expect(arrivalPose(start, end, 0, frame)).toEqual({ phase: "ease", transform: start });
    const middle = arrivalPose(start, end, ARRIVAL_EASE_MS / 2, frame);
    expect(middle.phase).toBe("ease");
    expect(middle.transform.k).toBeLessThan(start.k);
    expect(middle.transform.k).toBeGreaterThan(end.k);
    expect(arrivalPose(start, end, ARRIVAL_EASE_MS, frame)).toEqual({ phase: "done", transform: end });
  });

  it("zooms out without ever passing the end scale, and moves the frame's middle along a straight line", () => {
    let previous = start.k;
    const middles: Array<{ x: number; y: number }> = [];
    for (let elapsed = 0; elapsed <= ARRIVAL_EASE_MS; elapsed += 35) {
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

describe("where an arrival's pull-back changes the look", () => {
  it("changes it where the zoom crosses its edge, after the ease, or before it, by the Arrival choice", () => {
    expect(arrivalLookChange("then-neighbours")).toBe("crossing");
    expect(arrivalLookChange("then-neighbours-after")).toBe("after");
    expect(arrivalLookChange("then-neighbours-before")).toBe("before");
  });

  it("has nothing to change where the arrival does not pull back", () => {
    expect(arrivalLookChange("reading")).toBeNull();
    expect(arrivalLookChange("neighbours")).toBeNull();
  });

  it("ends every pull-back that leaves reading size in the connections look, so that a look taken before the ease is the one it ends in", () => {
    // The end's zoom lies between the connections look's last press (ARRIVAL_FLOOR_RATIO) and the reading look's edge.
    expect(zoomLook(ARRIVAL_FLOOR_RATIO, "reading")).toBe("connections");
    expect(zoomLook(ARRIVAL_FLOOR_RATIO * STEP_RATIO ** 2, "reading")).toBe("connections");
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
    const end = stepWholeFrame(newcomer, camera, frame, 0.5)!;
    const pan = revealPan(newcomer, camera, frame);
    expect(end).toEqual({ x: pan.x, y: pan.y, k: 1 });
    expect(inside(newcomer, end)).toBe(true);
  });

  it("does not move a newcomer already whole in view", () => {
    expect(stepWholeFrame(box(100, 100, 300, 200), camera, frame, 0.5)).toEqual(camera);
  });

  it("eases out just far enough to hold a newcomer that does not fit at the scale but does above the floor, and holds it whole", () => {
    const newcomer = box(200, 100, 1600, 900);
    const end = stepWholeFrame(newcomer, camera, frame, 0.3)!;
    const { horizontal, vertical } = framePadding(frame);
    expect(end.k).toBeCloseTo(Math.min((frame.width - 2 * horizontal) / 1600, (frame.height - 2 * vertical) / 900), 9);
    expect(inside(newcomer, end)).toBe(true);
  });

  it("does not ease out at all for a newcomer the floor cannot hold whole: the step is then Least Pan's", () => {
    expect(stepWholeFrame(box(200, 100, 5000, 4000), camera, frame, 0.5)).toBeNull();
  });

  it("never zooms in: a camera already farther than the newcomer needs keeps its scale", () => {
    expect(stepWholeFrame(box(100, 100, 300, 200), { x: 0, y: 0, k: 0.4 }, frame, 0.3)!.k).toBe(0.4);
  });
});

describe("a step's frame under Step, With Its Lines", () => {
  const camera = { x: 0, y: 0, k: 1 };

  it("frames the newcomer and what its lines reach as Fit would, centred, between the floor and reading scale", () => {
    const newcomer = box(1000, 500, 400, 300), reach = box(0, 0, 2000, 1000);
    const end = stepLinesFrame(reach, newcomer, camera, frame, 1.2, 0.3)!;
    const { horizontal } = framePadding(frame);
    expect(end.k).toBeCloseTo((frame.width - 2 * horizontal) / 2000, 9);
    const drawn = onScreen(reach, end);
    expect((drawn.left + drawn.right) / 2).toBeCloseTo(frame.width / 2, 6);
    expect((drawn.top + drawn.bottom) / 2).toBeCloseTo(frame.height / 2, 6);
  });

  it("never enlarges past reading scale", () => {
    const small = box(100, 100, 300, 200);
    expect(stepLinesFrame(small, small, camera, frame, 1.2, 0.3)!.k).toBe(1.2);
  });

  it("where the floor cannot hold what the lines reach, takes Whole's frame of the newcomer alone", () => {
    const newcomer = box(200, 100, 1600, 900), reach = box(-9000, 0, 20000, 9000);
    expect(stepLinesFrame(reach, newcomer, camera, frame, 1.2, 0.3)).toEqual(stepWholeFrame(newcomer, camera, frame, 0.3));
  });

  it("where the floor cannot hold even the newcomer whole, does not ease at all: the step is then Least Pan's", () => {
    expect(stepLinesFrame(box(-9000, 0, 20000, 9000), box(0, 0, 9000, 300), camera, frame, 1.2, 0.25)).toBeNull();
  });
});

describe("the cut counted under Step, Least Pan, Cut Counted", () => {
  const camera = { x: 0, y: 0, k: 1 };

  it("counts each cut card at one edge only, the one it lies farthest past, and names no edge past which nothing goes", () => {
    const cards = [
      { key: "inside", bounds: box(100, 100, 200, 150) },
      { key: "east", bounds: box(1100, 100, 200, 150) },
      { key: "south", bounds: box(100, 700, 200, 150) },
      // 100 px past the right edge and 50 past the bottom: counted at the right.
      { key: "corner", bounds: box(1100, 700, 200, 150) },
      // 20 px past the right edge and 90 past the bottom: counted at the bottom.
      { key: "low corner", bounds: box(1020, 740, 200, 150) }
    ];
    expect(cutByEdge(cards, camera, frame)).toEqual({ right: ["east", "corner"], bottom: ["south", "low corner"] });
  });

  it("gives a card as far past two edges to the edge across, left or right", () => {
    // 100 px past the right edge and 100 past the bottom.
    expect(cutByEdge([{ key: "even", bounds: box(1100, 750, 200, 150) }], camera, frame)).toEqual({ right: ["even"] });
  });

  it("reads the cards on screen at the camera's scale and place", () => {
    const cards = [{ key: "a", bounds: box(100, 100, 200, 150) }];
    expect(cutByEdge(cards, { x: -150, y: 0, k: 1 }, frame)).toEqual({ left: ["a"] });
    expect(cutByEdge(cards, { x: 0, y: 0, k: 0.5 }, frame)).toEqual({});
  });

  it("a sign's press brings the nearest card cut at its edge wholly into view, on both axes, the scale kept", () => {
    const cut = [box(1100, 100, 200, 150), box(1600, 300, 200, 150)];
    const end = cutPan(cut, "right", camera, frame);
    const { horizontal, vertical } = framePadding(frame), drawn = onScreen(cut[0], end);
    expect(end.k).toBe(1);
    expect(drawn.right).toBeCloseTo(frame.width - horizontal, 9);
    expect(drawn.top).toBeGreaterThanOrEqual(vertical);
  });
});

/**
 * The boxes the page drew on 2026-11-21, read in the browser after live-docs/history was opened by its handle from
 * pathfind.ts under Least Pan, at 1,280 by 800: each of the directory's cards relative to the map's frame, at the camera
 * then (so the camera here is the identity). Counted at every edge a card goes past, as first built, the page said 31 past
 * the right edge, 27 above and 4 below: 62 for 32 cards, since the folder lies up and to the right of the view.
 */
const HISTORY_FRAME = { width: 1019, height: 680 };
const HISTORY_CARDS: Array<[string, number, number, number, number]> = [
  ["summary.ts", 654, 378, 999, 589],
  ["format.ts", 1203, 598, 1553, 829],
  ["textStore.ts", 1203, 853, 1553, 1064],
  ["shape.ts", 1203, 1088, 1553, 1299],
  ["bundled.ts", 1203, 1323, 1553, 1534],
  ["lens.ts", 2217, -1669, 2556, -1458],
  ["bundled.test.ts", 2217, -1370, 2556, -1215],
  ["rows.ts", 2217, -1190, 2556, -979],
  ["directories.ts", 2217, -955, 2556, -744],
  ["summary.test.ts", 2760, -1676, 3102, -1521],
  ["textStore.test.ts", 2760, -1439, 3102, -1284],
  ["versionControl.ts", 2760, -1195, 3102, -984],
  ["lens.test.ts", 3306, -1676, 3699, -1521],
  ["git.ts", 3306, -1446, 3699, -1235],
  ["codec.ts", 3306, -1154, 3699, -943],
  ["derive.ts", 3306, -862, 3699, -672],
  ["sampling.ts", 3306, -648, 3699, -437],
  ["directories.test.ts", 3306, -413, 3699, -258],
  ["git.test.ts", 3903, -1662, 4248, -1507],
  ["rows.test.ts", 3903, -1439, 4248, -1284],
  ["sequence.ts", 3903, -1216, 4248, -1005],
  ["sampling.test.ts", 3903, -924, 4248, -769],
  ["derive.test.ts", 3903, -701, 4248, -546],
  ["queries.ts", 4452, -1676, 4693, -1465],
  ["words.ts", 4452, -1441, 4693, -1210],
  ["window.ts", 4452, -1101, 4693, -890],
  ["ticks.ts", 4452, -866, 4693, -655],
  ["queries.test.ts", 4897, -1463, 5165, -1289],
  ["words.test.ts", 4897, -1264, 5165, -1109],
  ["sequence.test.ts", 4897, -1084, 5165, -929],
  ["window.test.ts", 4897, -904, 5165, -749],
  ["ticks.test.ts", 4897, -724, 5165, -569]
];


describe("the cut counted on the page's own boxes", () => {
  const cards = HISTORY_CARDS.map(([key, left, top, right, bottom]) => ({ key, bounds: box(left, top, right - left, bottom - top) }));
  const identity = { x: 0, y: 0, k: 1 };

  it("counts each of the 31 cards not wholly in view at one edge, so the counts sum to what is cut", () => {
    const cut = cutByEdge(cards, identity, HISTORY_FRAME);
    const counts = { left: cut.left?.length ?? 0, right: cut.right?.length ?? 0, top: cut.top?.length ?? 0, bottom: cut.bottom?.length ?? 0 };
    // Worked from the boxes above by hand: of the 32, summary.ts alone is wholly in view; shape.ts and bundled.ts reach
    // farther past the bottom (619, 854 px) than the right (534); lens.ts farther past the top (1,669) than the right
    // (1,537); every other card farthest past the right.
    expect(counts).toEqual({ left: 0, right: 28, top: 1, bottom: 2 });
    const inView = cards.filter(({ bounds }) => bounds.left >= 0 && bounds.top >= 0 && bounds.right <= HISTORY_FRAME.width && bounds.bottom <= HISTORY_FRAME.height);
    expect(counts.left + counts.right + counts.top + counts.bottom).toBe(cards.length - inView.length);
  });

  it("the right-hand sign's press lands on format.ts, the nearest past that edge, whole", () => {
    const right = cutByEdge(cards, identity, HISTORY_FRAME).right!;
    const end = cutPan(cards.filter(card => right.includes(card.key)).map(card => card.bounds), "right", identity, HISTORY_FRAME);
    const format = cards.find(card => card.key === "format.ts")!.bounds, drawn = onScreen(format, end);
    const { horizontal, vertical } = framePadding(HISTORY_FRAME);
    expect(drawn.left).toBeGreaterThanOrEqual(horizontal - 1e-6);
    expect(drawn.right).toBeLessThanOrEqual(HISTORY_FRAME.width - horizontal + 1e-6);
    expect(drawn.top).toBeGreaterThanOrEqual(vertical - 1e-6);
    expect(drawn.bottom).toBeLessThanOrEqual(HISTORY_FRAME.height - vertical + 1e-6);
    expect(cutByEdge(cards, end, HISTORY_FRAME).right?.includes("format.ts") ?? false).toBe(false);
  });
});
