import { describe, expect, it } from "vitest";

import { wheelPixels } from "./wheel";

describe("wheel units", () => {
  it("normalizes pixels, lines and pages while preserving direction", () => {
    expect(wheelPixels(3, 1, 900)).toBe(48);
    expect(wheelPixels(-1, 2, 900)).toBe(-900);
    expect(wheelPixels(5, 0, 900)).toBe(5);
  });
});
