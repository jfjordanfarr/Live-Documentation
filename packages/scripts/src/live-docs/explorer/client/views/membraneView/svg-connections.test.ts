import { describe, expect, it } from "vitest";
import {
  bundleStrokeWidth,
  computeEdgeExitPoint,
  computeBundleCurvePath,
  computeBundleMidpoint,
} from "./svg-connections";

// ─── bundleStrokeWidth ─────────────────────────────────────────────

describe("bundleStrokeWidth", () => {
  it("returns minimum ~2 for a single connection", () => {
    const w = bundleStrokeWidth(1);
    expect(w).toBeGreaterThanOrEqual(2);
    expect(w).toBeLessThan(4);
  });

  it("scales logarithmically: 10 > 1, 100 > 10", () => {
    const w1 = bundleStrokeWidth(1);
    const w10 = bundleStrokeWidth(10);
    const w100 = bundleStrokeWidth(100);
    expect(w10).toBeGreaterThan(w1);
    expect(w100).toBeGreaterThan(w10);
  });

  it("is capped at 10 for very large counts", () => {
    expect(bundleStrokeWidth(10_000)).toBe(10);
    expect(bundleStrokeWidth(1_000_000)).toBe(10);
  });

  it("handles zero and negative gracefully", () => {
    expect(bundleStrokeWidth(0)).toBeGreaterThanOrEqual(2);
    expect(bundleStrokeWidth(-5)).toBeGreaterThanOrEqual(2);
  });
});

// ─── computeEdgeExitPoint ──────────────────────────────────────────

describe("computeEdgeExitPoint", () => {
  const rect = { x: 100, y: 100, width: 200, height: 100 };
  // Center = (200, 150)

  it("exits through the right edge when target is to the right", () => {
    const p = computeEdgeExitPoint(rect, 500, 150);
    expect(p.x).toBeCloseTo(300); // rect.x + rect.width
    expect(p.y).toBeCloseTo(150); // same height
  });

  it("exits through the left edge when target is to the left", () => {
    const p = computeEdgeExitPoint(rect, 0, 150);
    expect(p.x).toBeCloseTo(100); // rect.x
    expect(p.y).toBeCloseTo(150);
  });

  it("exits through the top edge when target is above", () => {
    const p = computeEdgeExitPoint(rect, 200, 0);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(100); // rect.y
  });

  it("exits through the bottom edge when target is below", () => {
    const p = computeEdgeExitPoint(rect, 200, 500);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(200); // rect.y + rect.height
  });

  it("exits through a corner when target is diagonal", () => {
    // Target is right and down from center (200, 150)
    const p = computeEdgeExitPoint(rect, 500, 350);
    // Ray direction: (300, 200) normalized
    // Should exit through the right edge (x=300) or bottom edge (y=200)
    // t_right = (300 - 200) / 300 = 0.333
    // t_bottom = (200 - 150) / 200 = 0.25
    // t_bottom < t_right, so exit through bottom
    expect(p.y).toBeCloseTo(200);
    expect(p.x).toBeGreaterThanOrEqual(100);
    expect(p.x).toBeLessThanOrEqual(300);
  });

  it("returns center for degenerate case (target at center)", () => {
    const p = computeEdgeExitPoint(rect, 200, 150);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(150);
  });
});

// ─── computeBundleCurvePath ────────────────────────────────────────

describe("computeBundleCurvePath", () => {
  it("produces a valid SVG quadratic Bézier path", () => {
    const d = computeBundleCurvePath({ x: 10, y: 20 }, { x: 100, y: 80 });
    expect(d).toMatch(/^M\s/);
    expect(d).toContain("Q");
  });

  it("handles degenerate same-point without NaN", () => {
    const d = computeBundleCurvePath({ x: 50, y: 50 }, { x: 50, y: 50 });
    expect(d).not.toContain("NaN");
    expect(d).toContain("M 50 50");
  });

  it("curve path has different control point from endpoints", () => {
    const d = computeBundleCurvePath({ x: 0, y: 0 }, { x: 100, y: 0 });
    // Q cpx cpy tx ty — the control point should be offset from the midpoint
    const match = d.match(/Q\s+([\d.-]+)\s+([\d.-]+)/);
    expect(match).not.toBeNull();
    const cpx = parseFloat(match![1]);
    const cpy = parseFloat(match![2]);
    // Control point should be at midpoint x but offset in y (perpendicular)
    expect(cpx).toBeCloseTo(50); // midpoint x
    expect(cpy).not.toBeCloseTo(0); // offset in y (the perpendicular direction)
  });
});

// ─── computeBundleMidpoint ─────────────────────────────────────────

describe("computeBundleMidpoint", () => {
  it("returns the midpoint between two points", () => {
    const m = computeBundleMidpoint({ x: 0, y: 0 }, { x: 100, y: 200 });
    expect(m.x).toBe(50);
    expect(m.y).toBe(100);
  });

  it("handles same-point case", () => {
    const m = computeBundleMidpoint({ x: 42, y: 42 }, { x: 42, y: 42 });
    expect(m.x).toBe(42);
    expect(m.y).toBe(42);
  });

  it("handles negative coordinates", () => {
    const m = computeBundleMidpoint({ x: -100, y: -50 }, { x: 100, y: 50 });
    expect(m.x).toBe(0);
    expect(m.y).toBe(0);
  });
});
