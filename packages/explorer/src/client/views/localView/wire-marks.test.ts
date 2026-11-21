import { describe, expect, it } from "vitest";

import { chevron, MARK_MARGIN, MARK_SPACING, markSize, markStations, markStrokes, pathPoints } from "./wire-marks";

/** The three points of a chevron's commands: one arm's end, the point, the other arm's end. */
function points(d: string): Array<{ x: number; y: number }> {
  const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return [0, 2, 4].map(i => ({ x: numbers[i], y: numbers[i + 1] }));
}

describe("where a wire's marks stand", () => {
  it("stands one mark at the middle of a wire across one gutter", () => {
    expect(markStations(180)).toEqual([90]);
    expect(markStations(2 * MARK_SPACING - 1)).toEqual([(2 * MARK_SPACING - 1) / 2]);
  });

  it("spreads a long wire's marks evenly, each at the middle of its stretch, none near an end", () => {
    const length = 1000;
    const stations = markStations(length);
    expect(stations).toHaveLength(Math.floor(length / MARK_SPACING));
    const step = length / stations.length;
    stations.forEach((at, i) => expect(at).toBeCloseTo((i + 0.5) * step));
    expect(Math.min(...stations)).toBeGreaterThan(MARK_MARGIN);
    expect(length - Math.max(...stations)).toBeGreaterThan(MARK_MARGIN);
  });

  it("gives a wire too short to hold a mark clear of both ends none", () => {
    expect(markStations(2 * MARK_MARGIN)).toEqual([]);
    expect(markStations(0)).toEqual([]);
    expect(markStations(Number.NaN)).toEqual([]);
  });
});

describe("a mark's stroke", () => {
  it("points along the wire, its point ahead of its arms, which sweep back on both sides", () => {
    const [a, tip, b] = points(chevron({ x: 100, y: 50 }, { x: 1, y: 0 }, 10));
    expect(tip.x).toBeGreaterThan(100);
    expect(a.x).toBeLessThan(tip.x);
    expect(b.x).toBeLessThan(tip.x);
    expect(a.y).toBeCloseTo(50 + (tip.x - a.x));
    expect(b.y).toBeCloseTo(50 - (tip.x - b.x));
  });

  it("against the wire, points back toward where the wire comes from", () => {
    const [a, tip, b] = points(chevron({ x: 100, y: 50 }, { x: 1, y: 0 }, 10, true));
    expect(tip.x).toBeLessThan(100);
    expect(a.x).toBeGreaterThan(tip.x);
    expect(b.x).toBeGreaterThan(tip.x);
  });

  it("follows the wire's heading where it climbs, whatever the heading's length", () => {
    const [, tip] = points(chevron({ x: 0, y: 0 }, { x: 0, y: -40 }, 10));
    expect(tip.x).toBeCloseTo(0);
    expect(tip.y).toBeLessThan(0);
  });

  it("draws nothing for a heading of no length", () => {
    expect(chevron({ x: 0, y: 0 }, { x: 0, y: 0 }, 10)).toBe("");
  });

  it("grows with a wire's width, so that it shows past a gathered wire's line", () => {
    expect(markSize(8.8)).toBeGreaterThan(markSize(2.2));
    expect(markSize(8.8) * Math.SQRT1_2).toBeGreaterThan(8.8 / 2);
  });
});

describe("a wire's path walked, and its marks written", () => {
  it("walks a straight line and a curve, and ends at a second subpath", () => {
    expect(pathPoints("M 0 0 L 100 0")).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
    const curve = pathPoints("M 0 0 C 50 0 50 100 100 100 M 500 500 L 600 600");
    expect(curve[0]).toEqual({ x: 0, y: 0 });
    expect(curve.at(-1)).toEqual({ x: 100, y: 100 });
    expect(curve.every(p => p.x <= 100 && p.y <= 100), "the second subpath is not walked").toBe(true);
  });

  it("reads numbers as JavaScript writes them, a tiny one with its exponent among them", () => {
    expect(pathPoints("M 1e-7 0 L 100 2.5")).toEqual([{ x: 1e-7, y: 0 }, { x: 100, y: 2.5 }]);
  });

  it("stands a mark at the middle of a straight wire, pointing along it, or back against it", () => {
    const along = points(markStrokes("M 0 50 L 200 50", 2.2, false));
    expect(along[1].x).toBeGreaterThan(100);
    expect(along[0].x).toBeLessThan(along[1].x);
    const against = points(markStrokes("M 0 50 L 200 50", 2.2, true));
    expect(against[1].x).toBeLessThan(100);
    expect(against[0].x).toBeGreaterThan(against[1].x);
  });

  it("on a wire's S-curve across a gutter, points the middle mark the way the curve runs there", () => {
    // From the offering pin at the left, down to the using pin at the right: steep at the middle, so the point leads downward.
    const [a, tip, b] = points(markStrokes("M 0 0 L 20 0 C 120 0 80 300 180 300 L 200 300", 2.2, false));
    expect(tip.y).toBeGreaterThan((a.y + b.y) / 2);
  });

  it("writes nothing for a wire too short to hold a mark", () => {
    expect(markStrokes("M 0 0 L 40 0", 2.2, false)).toBe("");
    expect(markStrokes("", 2.2, false)).toBe("");
  });
});
