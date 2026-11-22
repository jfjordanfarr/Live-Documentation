import { describe, expect, it } from "vitest";

import { NO_REST, onTheWay, REST_DWELL, REST_TOLERANCE, restAt, restedOn, restsAt, WAY_SLACK, type PointerRest, type RestPoint } from "./pointerRest";

/** Feeds a run of looks, each a thing under the pointer, a place and a time, and returns the rest after the last. */
function feed(looks: Array<[string | null, RestPoint, number]>, from: PointerRest = NO_REST): PointerRest {
  return looks.reduce((rest, [on, at, now]) => restAt(rest, on, at, now), from);
}

describe("pointerRest", () => {
  it("rests on a thing only once the pointer has stayed on it for the dwell", () => {
    const rest = feed([["a", { x: 10, y: 10 }, 0]]);
    expect(restedOn(rest, REST_DWELL - 1)).toBeNull();
    expect(restedOn(rest, REST_DWELL)).toBe("a");
    expect(restsAt(rest)).toBe(REST_DWELL);
  });

  it("shows nothing for a sweep across several things, however long the sweep lasts", () => {
    const looks: Array<[string | null, RestPoint, number]> = [];
    // A pointer crossing five things at 20 px a frame, each thing 60 px wide: three frames, 50 ms, on each.
    for (let frame = 0; frame < 15; frame += 1) looks.push([`thing-${Math.floor(frame / 3)}`, { x: frame * 20, y: 40 }, frame * 16.7]);
    let rest: PointerRest = NO_REST;
    for (const [on, at, now] of looks) {
      rest = restAt(rest, on, at, now);
      expect(restedOn(rest, now)).toBeNull();
    }
  });

  it("makes every thing wait afresh: a rest on one does not let the next show its words without a rest", () => {
    const rested = feed([["a", { x: 0, y: 0 }, 0], ["a", { x: 0, y: 0 }, REST_DWELL + 10]]);
    expect(restedOn(rested, REST_DWELL + 10)).toBe("a");
    const next = restAt(rested, "b", { x: 30, y: 0 }, REST_DWELL + 20);
    expect(restedOn(next, REST_DWELL + 20)).toBeNull();
    expect(restedOn(next, REST_DWELL + 20 + REST_DWELL)).toBe("b");
  });

  it("lets go at once when the pointer moves off, onto nothing or onto something else", () => {
    const rested = feed([["a", { x: 0, y: 0 }, 0]]);
    expect(restedOn(restAt(rested, null, { x: 50, y: 0 }, REST_DWELL + 1), REST_DWELL + 1)).toBeNull();
    expect(restedOn(restAt(rested, "b", { x: 50, y: 0 }, REST_DWELL + 1), REST_DWELL + 1)).toBeNull();
  });

  it("keeps resting through a drift within the tolerance, and starts again past it", () => {
    const drifting = feed([["a", { x: 0, y: 0 }, 0], ["a", { x: REST_TOLERANCE, y: 0 }, 100], ["a", { x: 0, y: REST_TOLERANCE }, 200]]);
    expect(restedOn(drifting, REST_DWELL)).toBe("a");
    const moved = feed([["a", { x: 0, y: 0 }, 0], ["a", { x: REST_TOLERANCE + 1, y: 0 }, 200]]);
    expect(restedOn(moved, REST_DWELL)).toBeNull();
    expect(restedOn(moved, 200 + REST_DWELL)).toBe("a");
  });

  it("does not rest on a slow pointer gliding across one thing", () => {
    let rest: PointerRest = NO_REST;
    for (let frame = 0; frame <= 60; frame += 1) {
      rest = restAt(rest, "a", { x: frame * 2, y: 0 }, frame * 16.7);
      expect(restedOn(rest, frame * 16.7)).toBeNull();
    }
  });

  it("keeps a rested thing while the pointer moves about on it", () => {
    const rested = feed([["a", { x: 0, y: 0 }, 0], ["a", { x: 0, y: 0 }, REST_DWELL]]);
    const wandered = feed([["a", { x: 40, y: 12 }, REST_DWELL + 50], ["a", { x: 80, y: 30 }, REST_DWELL + 100]], rested);
    expect(restedOn(wandered, REST_DWELL + 100)).toBe("a");
  });

  it("lets the picture, not the pointer, move a thing under a still pointer without starting the rest again", () => {
    // The pointer stops on a; the picture carries a away and brings b under the same point.
    const carried = feed([["a", { x: 5, y: 5 }, 0], [null, { x: 5, y: 5 }, 100], ["b", { x: 5, y: 5 }, 200]]);
    expect(restedOn(carried, REST_DWELL - 1)).toBeNull();
    expect(restedOn(carried, REST_DWELL)).toBe("b");
    // A sphere flickering with its wrapper under a still pointer does not hold the rest back either.
    const flicker = feed([["a", { x: 5, y: 5 }, 0], ["wrap", { x: 5, y: 5 }, 100], ["a", { x: 5, y: 5 }, 300]]);
    expect(restedOn(flicker, REST_DWELL)).toBe("a");
  });

  it("ends the words when the picture carries the thing away from a still pointer", () => {
    const rested = feed([["a", { x: 5, y: 5 }, 0], ["a", { x: 5, y: 5 }, REST_DWELL]]);
    expect(restedOn(restAt(rested, null, { x: 5, y: 5 }, REST_DWELL + 16), REST_DWELL + 16)).toBeNull();
  });

  it("starts again when the pointer itself steps onto another thing, however small the step", () => {
    const rested = feed([["a", { x: 5, y: 5 }, 0], ["a", { x: 5, y: 5 }, REST_DWELL]]);
    const stepped = restAt(rested, "b", { x: 6, y: 5 }, REST_DWELL + 16);
    expect(restedOn(stepped, REST_DWELL + 16)).toBeNull();
    expect(restsAt(stepped)).toBe(REST_DWELL + 16 + REST_DWELL);
  });
});

describe("the way from a thing to the panel of its words", () => {
  // Words asked for at (100, 100); their panel stands to the right and a little below, a gap of 40 px between.
  const from = { x: 100, y: 100 }, panel = { left: 140, top: 110, right: 340, bottom: 170 };

  it("holds the point asked at, the panel, and every point of a straight walk between them", () => {
    expect(onTheWay(from, from, panel)).toBe(true);
    expect(onTheWay({ x: 240, y: 140 }, from, panel)).toBe(true);
    for (let step = 0; step <= 20; step += 1) {
      for (const corner of [{ x: panel.left, y: panel.top }, { x: panel.left, y: panel.bottom }, { x: panel.right, y: panel.top }, { x: panel.right, y: panel.bottom }]) {
        const at = { x: from.x + (corner.x - from.x) * step / 20, y: from.y + (corner.y - from.y) * step / 20 };
        expect(onTheWay(at, from, panel), JSON.stringify(at)).toBe(true);
      }
    }
  });

  it("allows a hand the slack on either side of that walk, and no more", () => {
    // Half way across the gap, the walk to the panel's near edge runs from y 105 to 135 or so.
    expect(onTheWay({ x: 120, y: 100 - WAY_SLACK + 2 }, from, panel)).toBe(true);
    expect(onTheWay({ x: 120, y: 100 - WAY_SLACK - 2 }, from, panel)).toBe(false);
    expect(onTheWay({ x: 100 - WAY_SLACK - 1, y: 100 }, from, panel)).toBe(false);
  });

  it("does not hold a pointer that goes elsewhere: away from the panel, or past it", () => {
    expect(onTheWay({ x: 60, y: 100 }, from, panel)).toBe(false);
    expect(onTheWay({ x: 100, y: 40 }, from, panel)).toBe(false);
    expect(onTheWay({ x: 100, y: 170 }, from, panel)).toBe(false);
    expect(onTheWay({ x: 340 + WAY_SLACK + 1, y: 140 }, from, panel)).toBe(false);
  });

  it("is the same wherever the panel stands about the point: left, above, below", () => {
    const boxes = [{ left: -140, top: 90, right: 60, bottom: 150 }, { left: 60, top: -20, right: 260, bottom: 40 }, { left: 0, top: 160, right: 200, bottom: 220 }];
    for (const box of boxes) {
      const middle = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
      expect(onTheWay({ x: (from.x + middle.x) / 2, y: (from.y + middle.y) / 2 }, from, box), JSON.stringify(box)).toBe(true);
      // The mirror of the panel's middle through the point lies on the far side of the point from the panel.
      expect(onTheWay({ x: 2 * from.x - middle.x, y: 2 * from.y - middle.y }, from, box), JSON.stringify(box)).toBe(false);
    }
  });

  it("with the point inside the panel, is the panel and its slack", () => {
    expect(onTheWay({ x: 150, y: 120 }, { x: 200, y: 140 }, panel)).toBe(true);
    expect(onTheWay({ x: 120, y: 140 }, { x: 200, y: 140 }, panel)).toBe(false);
  });
});
