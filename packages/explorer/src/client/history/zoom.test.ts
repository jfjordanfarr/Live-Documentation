import { describe, expect, it } from "vitest";

import { LEAST_SPAN, panView, rangeOfView, slideToHold, wheelFactor, zoomView } from "./zoom";

describe("zooming the track", () => {
  it("narrows about the focus, which keeps its place on the track", () => {
    const view = zoomView([0, 800], 200, 0.5, 800);
    expect(view).toEqual([100, 500]);
    // The focus stood a quarter of the way along, and still does.
    expect((200 - view[0]) / (view[1] - view[0])).toBeCloseTo(0.25);
  });

  it("widens about the focus, and slides back inside the history rather than past an end", () => {
    expect(zoomView([100, 500], 300, 2, 800)).toEqual([0, 800]);
    expect(zoomView([700, 780], 770, 2, 800), "inside, the focus keeps its place").toEqual([630, 790]);
    expect(zoomView([720, 800], 790, 2, 800), "past the end, slid back").toEqual([640, 800]);
    expect(zoomView([0, 800], 400, 3, 800), "never wider than the whole").toEqual([0, 800]);
  });

  it("stops at the least span, or the whole of a shorter history", () => {
    expect(zoomView([100, 120], 110, 0.01, 800)).toEqual([106, 106 + LEAST_SPAN]);
    expect(zoomView([0, 5], 2, 0.1, 5)).toEqual([0, 5]);
    expect(zoomView([0, 0], 0, 0.5, 0)).toEqual([0, 0]);
  });

  it("adds up a trackpad's many small turns where each alone would round to nothing", () => {
    let view: readonly [number, number] = [0, 800];
    for (let turn = 0; turn < 100; turn += 1) view = zoomView(view, 400, wheelFactor(-2, 0, false), 800);
    expect(rangeOfView(view, 800)).not.toBeNull();
    expect(view[1] - view[0]).toBeCloseTo(800 * Math.exp(-0.4), 5);
    // One turn alone moves the view by less than a step.
    expect(800 - 800 * wheelFactor(-2, 0, false)).toBeLessThan(4);
  });

  it("never widens a range narrower than the least span by narrowing it, and widens a range of one step", () => {
    expect(zoomView([2, 5], 2, 1 / 1.5, 6)).toEqual([2, 5]);
    expect(zoomView([2, 4], 2, 1.5, 6)).toEqual([2, 5]);
    const one = zoomView([3, 3], 3, 2, 6);
    expect(one[1] - one[0]).toBeCloseTo(2);
  });

  it("holds a focus outside the view at the nearer end", () => {
    expect(zoomView([100, 200], 50, 0.5, 800)).toEqual([100, 150]);
  });
});

describe("panning the track", () => {
  it("slides by steps, its span kept, inside the history", () => {
    expect(panView([100, 200], 30, 800)).toEqual([130, 230]);
    expect(panView([100, 200], -500, 800)).toEqual([0, 100]);
    expect(panView([700, 780], 50, 800)).toEqual([720, 800]);
  });
});

describe("the range a view shows", () => {
  it("rounds the view to steps, and is no range at all where it shows the whole", () => {
    expect(rangeOfView([100.4, 499.6], 800)).toEqual([100, 500]);
    expect(rangeOfView([0, 800], 800)).toBeNull();
    expect(rangeOfView([0.2, 799.7], 800)).toBeNull();
    expect(rangeOfView([-3, 900], 800)).toBeNull();
  });
});

describe("holding the step", () => {
  it("slides the range by the least amount that holds the step, its span kept", () => {
    expect(slideToHold([100, 200], 150)).toEqual([100, 200]);
    expect(slideToHold([100, 200], 40)).toEqual([40, 140]);
    expect(slideToHold([100, 200], 260)).toEqual([160, 260]);
  });
});

describe("the wheel's factor", () => {
  it("narrows for a turn away from the reader and widens for one toward, evenly for even notches", () => {
    expect(wheelFactor(-100, 0, false)).toBeLessThan(1);
    expect(wheelFactor(100, 0, false)).toBeGreaterThan(1);
    expect(wheelFactor(100, 0, false) * wheelFactor(-100, 0, false)).toBeCloseTo(1);
    expect(wheelFactor(100, 0, false) ** 2).toBeCloseTo(wheelFactor(200, 0, false));
    expect(wheelFactor(3, 1, false)).toBeCloseTo(wheelFactor(48, 0, false));
    // A pinch's small deltas are read more strongly.
    expect(wheelFactor(-10, 0, true)).toBeLessThan(wheelFactor(-10, 0, false));
  });
});
