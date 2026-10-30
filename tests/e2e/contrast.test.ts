import { describe, expect, it } from "vitest";

import { AA_SMALL_TEXT, backdrop, contrastRatio, luminance, over, parseColour } from "./contrast";

describe("contrast", () => {
  it("reads computed colours, opaque or not, and refuses anything else", () => {
    expect(parseColour("rgb(102, 102, 102)")).toEqual([102, 102, 102, 1]);
    expect(parseColour("rgba(0, 145, 255, 0.12)")).toEqual([0, 145, 255, 0.12]);
    expect(() => parseColour("#666")).toThrow();
    expect(() => parseColour("transparent")).toThrow();
  });

  it("gives the WCAG luminances and ratios at their known points", () => {
    expect(luminance([0, 0, 0, 1])).toBe(0);
    expect(luminance([255, 255, 255, 1])).toBeCloseTo(1, 10);
    expect(contrastRatio([255, 255, 255, 1], [0, 0, 0, 1])).toBeCloseTo(21, 10);
    expect(contrastRatio([0, 0, 0, 1], [0, 0, 0, 1])).toBe(1);
    // #767676 on white is the well-known lightest grey that passes AA, at 4.54:1; #777 fails at 4.48:1
    expect(contrastRatio(parseColour("rgb(118, 118, 118)"), [255, 255, 255, 1])).toBeCloseTo(4.54, 2);
    expect(contrastRatio(parseColour("rgb(119, 119, 119)"), [255, 255, 255, 1])).toBeLessThan(AA_SMALL_TEXT);
  });

  it("lays translucent backgrounds over the ones beneath, and transparent ones change nothing", () => {
    expect(over([0, 0, 0, 0.5], [255, 255, 255, 1])).toEqual([127.5, 127.5, 127.5, 1]);
    const results = backdrop(["rgba(0, 0, 0, 0)", "rgb(31, 31, 34)", "rgba(0, 0, 0, 0)"]);
    expect(results).toEqual([31, 31, 34, 1]);
    const selected = backdrop(["rgb(31, 31, 34)", "rgba(0, 145, 255, 0.12)"]);
    expect(selected.map(Math.round)).toEqual([27, 45, 61, 1]);
    expect(backdrop([]), "with no background at all the browser's canvas is white").toEqual([255, 255, 255, 1]);
  });

  it("judges the search's former path colour as the review did: #666 on the results' #1f1f22 is under 3:1", () => {
    const ratio = contrastRatio(parseColour("rgb(102, 102, 102)"), backdrop(["rgb(31, 31, 34)"]));
    expect(ratio).toBeGreaterThan(2.8);
    expect(ratio).toBeLessThan(3);
  });
});
