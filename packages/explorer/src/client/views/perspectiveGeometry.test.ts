import { describe, expect, it } from "vitest";

import { directoryOpacity, gatherWire, outlineLength, pathOutline, perspectiveCorrespondences, perspectivePhases, polygonOutline, sampleOutline } from "./perspectiveGeometry";

describe("native perspective correspondence", () => {
  it("matches real cell hubs and single-file directory representatives without inventing absent destinations", () => {
    const representatives = new Map([["directory:src/one", "src/one/a.ts"], ["directory:missing", "missing.ts"]]);
    expect(perspectiveCorrespondences(["directory:src/many", "directory:src/one", "directory:missing"],
      new Set(["directory:src/many", "src/one/a.ts"]), representatives))
      .toEqual(new Map([["directory:src/many", "directory:src/many"], ["directory:src/one", "src/one/a.ts"]]));
  });

  it.each([false, true])("draws and names a canonical file once when its directory alias also appears, exact card first: %s", reverse => {
    const ids = ["directory:src", "src/a.ts"];
    if (reverse) ids.reverse();
    expect(perspectiveCorrespondences(ids, new Set(["src/a.ts"]), new Map([["directory:src", "src/a.ts"]])))
      .toEqual(new Map([["src/a.ts", "src/a.ts"]]));
  });

  it("uses only one of several aliases for the same real destination and does not infer Connections counterparts", () => {
    const aliases = new Map([["directory:src", "src/deep/a.ts"], ["directory:src/deep", "src/deep/a.ts"]]);
    expect(perspectiveCorrespondences([...aliases.keys()], new Set(["src/deep/a.ts"]), aliases))
      .toEqual(new Map([["directory:src", "src/deep/a.ts"]]));
    expect(perspectiveCorrespondences(["directory:src"], new Set(["src/deep/a.ts"]))).toEqual(new Map());
  });

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

describe("a native wire's outline, read from its data", () => {
  /** A cubic's point at t, and its length by fine integration: the reference the flattened outline is held to. */
  const cubic = (p: number[][], t: number) => {
    const u = 1 - t;
    return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
  };
  const cubicLength = (p: number[][]) => {
    let length = 0, last = cubic(p, 0);
    for (let i = 1; i <= 100000; i++) { const next = cubic(p, i / 100000); length += Math.hypot(next[0] - last[0], next[1] - last[1]); last = next; }
    return length;
  };

  it("reads the Local Map's forms, M, L, C and Q, and refuses any other", () => {
    expect(pathOutline("M 0 0 L 30 40")).toEqual([{ x: 0, y: 0 }, { x: 30, y: 40 }]);
    expect(outlineLength(pathOutline("M 0 0 L 30 40 L 30 0")!)).toBe(90);
    // A wire as connections.ts writes a bundle's run: a curve and then a straight lane.
    const run = pathOutline("M 10 20 C 60 20 60 120 110 120 L 400 120")!;
    expect(run[0]).toEqual({ x: 10, y: 20 });
    expect(run.at(-1)).toEqual({ x: 400, y: 120 });
    expect(pathOutline("M 0 0 Q 0 50 100 50")!.at(-1)).toEqual({ x: 100, y: 50 });
    for (const other of ["M 0 0 c 10 10 20 20 30 30", "M 0 0 A 5 5 0 0 1 10 10", "L 10 10", "M 0 0 L 10", ""]) expect(pathOutline(other), other).toBeNull();
    expect(polygonOutline("0,0 10,0 10,10")).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 0 }]);
    expect(polygonOutline("0,0 10")).toBeNull();
  });

  it("measures a curve's length to a small fraction of a pixel, as the browser's sampling does", () => {
    for (const p of [[[0, 0], [120, 0], [80, 300], [200, 300]], [[500, 40], [380, 40], [420, -260], [300, -260]], [[0, 0], [5, 0], [5, 3], [10, 3]]]) {
      const outline = pathOutline(`M ${p[0].join(" ")} C ${p.slice(1).flat().join(" ")}`)!;
      expect(Math.abs(outlineLength(outline) - cubicLength(p)), JSON.stringify(p)).toBeLessThan(0.05);
    }
  });

  it("samples at equal distances along the outline, both ends exact", () => {
    const samples = sampleOutline(pathOutline("M 0 0 L 100 0 L 100 50")!, 6);
    expect(samples).toHaveLength(7);
    expect(samples[0]).toEqual({ x: 0, y: 0 });
    expect(samples[6]).toEqual({ x: 100, y: 50 });
    expect(samples[2]).toEqual({ x: 50, y: 0 });
    expect(samples[4]).toEqual({ x: 100, y: 0 });
    expect(samples[5]).toEqual({ x: 100, y: 25 });
    // Along a curve, consecutive samples stand as far apart as the curve's length allows them, within a pixel's fraction.
    const curve = sampleOutline(pathOutline("M 0 0 C 120 0 80 300 200 300")!, 40);
    const gaps = curve.slice(1).map((point, i) => Math.hypot(point.x - curve[i].x, point.y - curve[i].y));
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.2);
    // A point alone is sampled as itself.
    expect(sampleOutline([{ x: 3, y: 4 }], 2)).toEqual([{ x: 3, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 4 }]);
  });
});
