import { describe, expect, it } from "vitest";

import { NO_REST, REST_DWELL, REST_TOLERANCE, restAt, restedOn, restsAt, type PointerRest, type RestPoint } from "./pointerRest";

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

  it("does not rest on a thing the picture carries under a still pointer, until the pointer itself moves", () => {
    const still = feed([[null, { x: 5, y: 5 }, 0], ["a", { x: 5, y: 5 }, 100], ["a", { x: 5, y: 5 }, 100 + 2 * REST_DWELL]]);
    expect(restedOn(still, 100 + 2 * REST_DWELL)).toBeNull();
    expect(restsAt(still)).toBeNull();
    const nudged = restAt(still, "a", { x: 6, y: 5 }, 1000);
    expect(restedOn(nudged, 1000 + REST_DWELL)).toBe("a");
  });

  it("does not let the picture's move under a still pointer restart a rest already begun", () => {
    const begun = feed([["a", { x: 5, y: 5 }, 0], ["a", { x: 5, y: 5 }, 200]]);
    expect(restedOn(begun, REST_DWELL)).toBe("a");
  });
});
