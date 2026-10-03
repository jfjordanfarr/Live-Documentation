import { describe, expect, it } from "vitest";

import { directoryOpacity, gatherWire, perspectivePhases } from "./perspectiveGeometry";

describe("native perspective correspondence", () => {
  it("preserves the original curve and gathers distinct symbol routes onto the same file segment", () => {
    const a = { x: 20, y: 30 }, b = { x: 300, y: 150 };
    const upper = [{ x: 50, y: 70 }, { x: 160, y: -40 }, { x: 260, y: 80 }];
    const lower = [{ x: 50, y: 170 }, { x: 90, y: 280 }, { x: 260, y: 250 }];
    expect(gatherWire(upper, a, b, 0)).toEqual(upper);
    expect(gatherWire(lower, a, b, 0)).toEqual(lower);
    expect(gatherWire(upper, a, b, 1)).toEqual([a, { x: 160, y: 90 }, b]);
    expect(gatherWire(lower, a, b, 1)).toEqual(gatherWire(upper, a, b, 1));
    expect(gatherWire(upper, a, b, .5)[1]).toEqual({ x: 160, y: 25 });
  });

  it("peels ancestors before their children and rebuilds them in the reverse order", () => {
    expect([0, 1, 2].map(depth => directoryOpacity(0, depth, 3))).toEqual([1, 1, 1]);
    expect(directoryOpacity(.08, 0, 3)).toBe(0);
    expect(directoryOpacity(.08, 1, 3)).toBeGreaterThan(0);
    expect(directoryOpacity(.08, 2, 3)).toBe(1);
    expect(directoryOpacity(.18, 0, 3)).toBe(0);
    expect(directoryOpacity(.18, 1, 3)).toBe(0);
    expect(directoryOpacity(.18, 2, 3)).toBeGreaterThan(0);
    expect([0, 1, 2].map(depth => directoryOpacity(1, depth, 3))).toEqual([0, 0, 0]);
  });

  it("removes containment before folding and keeps all phase endpoints exact", () => {
    expect(perspectivePhases(0)).toEqual({ fold: 0, move: 0, background: 0 });
    expect(perspectivePhases(.22).fold).toBe(0);
    expect(perspectivePhases(.4).move).toBe(0);
    expect(perspectivePhases(1)).toEqual({ fold: 1, move: 1, background: 1 });
  });
});
