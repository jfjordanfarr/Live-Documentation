import { describe, expect, it } from "vitest";

import { dims, emphasisStrength, emphasizedSphere, emphasizedWireAlpha, glows, pairKey } from "./forceGraphEmphasis";

describe("how a step's changed files stand out", () => {
  it("holds at full strength at rest, and while playing fades from the step's arrival to nothing at the next step's", () => {
    expect(emphasisStrength(false, 1000, 5000, 500)).toBe(1);
    expect(emphasisStrength(true, 1000, 1000, 500)).toBe(1);
    expect(emphasisStrength(true, 1000, 1250, 500)).toBe(0.5);
    expect(emphasisStrength(true, 1000, 1500, 500)).toBe(0);
    expect(emphasisStrength(true, 1000, 9000, 500)).toBe(0);
    expect(emphasisStrength(true, 1000, 1250, 0), "no interval holds").toBe(1);
  });

  it("lifts a changed sphere toward white and draws it whole where the mode glows, and dims an unchanged one where it dims", () => {
    expect(emphasizedSphere("#0091ff", 1, true, "glow", 1)).toBe("rgba(179, 222, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "glow", 0.5)).toBe("rgba(89, 184, 255, 0.700)");
    expect(emphasizedSphere("#0091ff", 1, false, "glow", 1), "the rest keeps its colour under glow").toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "dim", 1)).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, false, "dim", 0.5)).toBe("rgba(0, 145, 255, 0.240)");
    expect(emphasizedSphere("#0091ff", 1, true, "dim", 1), "a changed sphere keeps its colour under dim").toBe("rgba(0, 145, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, true, "both", 1)).toBe("rgba(179, 222, 255, 1.000)");
    expect(emphasizedSphere("#0091ff", 1, false, "both", 1)).toBe("rgba(0, 145, 255, 0.200)");
    expect(emphasizedSphere("#0091ff", 0.4, true, "none", 1)).toBe("rgba(0, 145, 255, 0.400)");
    expect(emphasizedSphere("#0091ff", 1, true, "glow", 0), "faded out, the colour is its own").toBe("rgba(0, 145, 255, 1.000)");
    expect(() => emphasizedSphere("blue", 1, true, "glow", 1)).toThrow(/#rrggbb/);
  });

  it("raises a changed wire toward the glow and lowers an unchanged one, by the mode", () => {
    expect(emphasizedWireAlpha(0.3, true, "glow", 1)).toBeCloseTo(0.85);
    expect(emphasizedWireAlpha(0.3, true, "glow", 0.5)).toBeCloseTo(0.575);
    expect(emphasizedWireAlpha(0.3, false, "glow", 1)).toBe(0.3);
    expect(emphasizedWireAlpha(0.3, false, "dim", 1)).toBeCloseTo(0.06);
    expect(emphasizedWireAlpha(0.3, true, "none", 1)).toBe(0.3);
    expect(glows("both") && dims("both")).toBe(true);
    expect(glows("dim") || dims("glow") || glows("none") || dims("none")).toBe(false);
  });

  it("keys a pair the same whichever end is named first", () => {
    expect(pairKey("b", "a")).toBe(pairKey("a", "b"));
    expect(pairKey("a", "b")).not.toBe(pairKey("a", "c"));
  });
});
