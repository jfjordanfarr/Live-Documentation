import { describe, expect, it } from "vitest";

import { overlapsAmong, textOverShapes, type Outline, type TextBox } from "./design-audit";

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

/**
 * The World Map's judge of words drawn across a piece (2026-11-12): a newcomer found every piece's second line struck
 * through by the piece's own edges, which no comparison of text with text could see.
 */
describe("textOverShapes", () => {
  const owned = (text: string, owner: string, x: number, y: number, w: number, h: number): TextBox => ({ ...box(text, x, y, w, h), owner });
  // A diamond, as a lid is drawn at an angle: corners at (50, 0), (100, 25), (50, 50) and (0, 25).
  const lid = (owner: string): Outline => ({ owner, points: [[50, 0], [100, 25], [50, 50], [0, 25]] });

  it("finds a text an edge passes through, and says whether the shape is the text's own", () => {
    const found = textOverShapes([owned("workflow", "ci", 30, 2, 40, 12)], [lid("ci"), lid("other")]);
    expect(found.map(strike => [strike.text.text, strike.outline.owner, strike.own])).toEqual([["workflow", "ci", true], ["workflow", "other", false]]);
  });

  it("finds a text lying wholly on a face, where no edge reaches it", () => {
    expect(textOverShapes([owned("files", "a", 40, 20, 20, 10)], [lid("a")])).toHaveLength(1);
  });

  it("finds a shape wholly inside a text's box", () => {
    expect(textOverShapes([owned("long words", "b", -10, -10, 200, 80)], [lid("a")])).toHaveLength(1);
  });

  it("ignores a text above the shape, one that touches a corner within the tolerance, and one beside it", () => {
    expect(textOverShapes([owned("name", "a", 30, -15, 40, 14)], [lid("a")])).toEqual([]);
    // Half a pixel over the top corner, within the one-pixel tolerance.
    expect(textOverShapes([owned("touch", "a", 30, -13.5, 40, 14)], [lid("a")])).toEqual([]);
    expect(textOverShapes([owned("beside", "a", 101, 20, 40, 10)], [lid("a")])).toEqual([]);
  });

  it("counts a shape once for a text however many of its owner's faces meet it", () => {
    const faces: Outline[] = [lid("a"), { owner: "a", points: [[0, 25], [50, 50], [50, 80], [0, 55]] }];
    expect(textOverShapes([owned("files", "a", 30, 40, 40, 12)], faces)).toHaveLength(1);
  });
});
