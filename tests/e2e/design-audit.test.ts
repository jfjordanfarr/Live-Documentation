import { describe, expect, it } from "vitest";

import { overlapsAmong, type TextBox } from "./design-audit";

/**
 * The collision judge of the browser specs: about fifteen of them expect it to find nothing among a view's text boxes,
 * so a judge that always found nothing would pass them all. These cases make sure it finds a real collision, ignores
 * a touch within the tolerance, and ranks the worst first (the gap found on 2026-11-05).
 */
const box = (text: string, x: number, y: number, w: number, h: number): TextBox => ({ text, tag: "span", x, y, w, h });

describe("overlapsAmong", () => {
  it("reports two boxes that overlap past the tolerance, with the overlapping area", () => {
    const a = box("name", 0, 0, 100, 20), b = box("path", 60, 10, 100, 20);
    const found = overlapsAmong([a, b]);
    expect(found).toHaveLength(1);
    expect(found[0].a).toBe(a);
    expect(found[0].b).toBe(b);
    // 40 px wide by 10 px tall, less the one-pixel tolerance on each side.
    expect(found[0].area).toBe(39 * 9);
  });

  it("ignores boxes that are apart, that touch, or that overlap within the tolerance", () => {
    const left = box("left", 0, 0, 50, 20);
    expect(overlapsAmong([left, box("apart", 80, 0, 50, 20)])).toEqual([]);
    expect(overlapsAmong([left, box("touching", 50, 0, 50, 20)])).toEqual([]);
    expect(overlapsAmong([left, box("within tolerance", 49, 0, 50, 20)])).toEqual([]);
    expect(overlapsAmong([left, box("within a wider tolerance", 47, 0, 50, 20)], 3)).toEqual([]);
    expect(overlapsAmong([left, box("past a wider tolerance", 46, 0, 50, 20)], 3)).toHaveLength(1);
  });

  it("ranks the largest collision first among many boxes", () => {
    const base = box("base", 0, 0, 100, 100);
    const small = box("small", 90, 90, 20, 20), large = box("large", 50, 50, 100, 100), away = box("away", 500, 500, 10, 10);
    const found = overlapsAmong([base, small, large, away]);
    // base and large share 49 × 49, small sits inside large for 19 × 19, and base and small share 9 × 9.
    expect(found.map(overlap => [overlap.a.text, overlap.b.text])).toEqual([["base", "large"], ["small", "large"], ["base", "small"]]);
    expect(found[0].area).toBeGreaterThan(found[1].area);
    expect(found[1].area).toBeGreaterThan(found[2].area);
  });
});
