import { describe, expect, it } from "vitest";

import { dims, emphasizedSphere, emphasizedWireAlpha, glows, pairKey } from "./forceGraphEmphasis";

describe("how a commit's changed files stand out", () => {
  it("makes a changed sphere white immediately, including at the frontier, and restores its base colour in the next changed set", () => {
    expect(emphasizedSphere("#0091ff", 1, true, "glow")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "glow")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "glow")).toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 0.4, false, "glow")).toBe("rgba(0, 145, 255, 0.400)");
    expect(() => emphasizedSphere("blue", 1, true, "glow")).toThrow(/#rrggbb/);
  });

  it("keeps an optionally dimmed background steady and changes only the event's participants", () => {
    expect(emphasizedSphere("#0091ff", 1, false, "dim")).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, false, "dim")).toBe("rgba(0, 145, 255, 0.080)");
    expect(emphasizedSphere("#0091ff", 1, true, "dim")).toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, true, "both")).toBe("rgba(255, 255, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "both")).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "none")).toBe("rgba(0, 145, 255, 0.400)");
  });

  it("makes a changed wire more visible for its commit and leaves the others at their chosen background level", () => {
    expect(emphasizedWireAlpha(0.3, true, "glow")).toBeCloseTo(0.85);
    expect(emphasizedWireAlpha(0.3, false, "glow")).toBe(0.3);
    expect(emphasizedWireAlpha(0.3, false, "dim")).toBeCloseTo(0.06);
    expect(emphasizedWireAlpha(0.3, true, "none")).toBe(0.3);
    expect(glows("both") && dims("both")).toBe(true);
    expect(glows("dim") || dims("glow") || glows("none")).toBe(false);
  });

  it("keys a pair the same whichever end is named first", () => {
    expect(pairKey("b", "a")).toBe(pairKey("a", "b"));
    expect(pairKey("a", "b")).not.toBe(pairKey("a", "c"));
  });
});
