import { describe, expect, it } from "vitest";

import { lengthOf, resample, tracePath } from "./routes";

describe("the lab's tracing of a drawn wire", () => {
  it("traces lines exactly and curves finely, and measures their length", () => {
    const straight = tracePath("M 0 0 L 30 40");
    expect(straight).toEqual([{ x: 0, y: 0 }, { x: 30, y: 40 }]);
    expect(lengthOf(straight)).toBe(50);
    // A cubic whose control points lie on the chord is the chord: 100 px long, traced in 48 steps.
    const chord = tracePath("M 0 0 C 25 0 75 0 100 0");
    expect(chord).toHaveLength(49);
    expect(lengthOf(chord)).toBeCloseTo(100, 6);
    // A quadratic from the router's near-vertical hop, with the control point above the start: longer than the chord, shorter than the detour.
    const hop = tracePath("M 0 0 Q 0 50 10 100");
    expect(lengthOf(hop)).toBeGreaterThan(Math.hypot(10, 100));
    expect(lengthOf(hop)).toBeLessThan(150);
  });

  it("refuses a command it does not know rather than guessing", () => {
    expect(() => tracePath("M 0 0 A 1 1 0 0 0 1 1")).toThrow(/cannot trace/u);
  });

  it("samples a polyline every step from its start and keeps its end, as the deck samples a path", () => {
    const points = resample([{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }], 8);
    expect(points).toEqual([{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 16, y: 0 }, { x: 20, y: 4 }, { x: 20, y: 10 }]);
    expect(resample([], 8)).toEqual([]);
    expect(resample([{ x: 3, y: 3 }], 8)).toEqual([{ x: 3, y: 3 }, { x: 3, y: 3 }]);
  });
});
