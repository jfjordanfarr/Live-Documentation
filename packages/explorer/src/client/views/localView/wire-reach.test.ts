import { describe, expect, it } from "vitest";

import { distanceTo, reachOf, wireAt } from "./wire-reach";

describe("a wire's reach for the pointer", () => {
  const level = reachOf("M 0 0 L 100 0")!;
  const curve = reachOf("M 0 0 C 50 0 50 100 100 100")!;

  it("walks a route to its points and the box that holds them", () => {
    expect([level.left, level.top, level.right, level.bottom]).toEqual([0, 0, 100, 0]);
    expect(curve.points.length).toBe(34);
    expect([curve.left, curve.top, curve.right, curve.bottom]).toEqual([0, 0, 100, 100]);
    expect(reachOf("")).toBeNull();
    expect(reachOf("M 5 5")).toBeNull();
  });

  it("measures to the nearest straight piece, and to an end beyond the route's ends", () => {
    expect(distanceTo(level, 50, 7)).toBeCloseTo(7, 9);
    expect(distanceTo(level, -3, 4)).toBeCloseTo(5, 9);
    expect(distanceTo(level, 104, -3)).toBeCloseTo(5, 9);
    // The curve's middle is the middle of its box: the walk in sixteen pieces passes through it.
    expect(distanceTo(curve, 50, 50)).toBeLessThan(0.01);
    expect(distanceTo(curve, 50, 0)).toBeGreaterThan(20);
  });

  it("gives the pointer to the nearer of two wires whose reaches hold it, and of two as near to the later", () => {
    const wires = [{ wire: "upper", reach: reachOf("M 0 0 L 100 0") }, { wire: "lower", reach: reachOf("M 0 10 L 100 10") }];
    const half = (): number => 6;
    expect(wireAt(wires, 50, 4, half, 6)).toBe("upper");
    expect(wireAt(wires, 50, 6, half, 6)).toBe("lower");
    // The later in the list was the page's choice wherever both bands held the point; now only where they are as near.
    expect(wireAt(wires, 50, 5, half, 6)).toBe("lower");
    expect(wireAt([...wires].reverse(), 50, 5, half, 6)).toBe("upper");
  });

  it("holds the pointer no farther than half a wire's own width, and never outside the widest reach", () => {
    const wires = [{ wire: "thin", reach: reachOf("M 0 0 L 100 0") }, { wire: "wide", reach: reachOf("M 0 40 L 100 40") }, { wire: "none", reach: null }];
    const half = (wire: string): number => (wire === "wide" ? 12 : 4);
    expect(wireAt(wires, 50, 5, half, 12)).toBeNull();
    expect(wireAt(wires, 50, 3, half, 12)).toBe("thin");
    expect(wireAt(wires, 50, 30, half, 12)).toBe("wide");
    expect(wireAt(wires, 50, 27, half, 12)).toBeNull();
    expect(wireAt(wires, 120, 40, half, 12)).toBeNull();
    expect(wireAt(wires, 108, 40, half, 12)).toBe("wide");
  });
});
