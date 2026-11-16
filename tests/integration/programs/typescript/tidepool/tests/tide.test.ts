import { isLowWater, TIDE_PERIOD, tideAt } from "../src/tide";

describe("tideAt", () => {
  it("starts at high water and is lowest half a period later", () => {
    expect(tideAt(0).level).toBeCloseTo(1);
    expect(isLowWater(tideAt(TIDE_PERIOD / 2))).toBe(true);
  });

  it("rises through the second half of the period", () => {
    expect(tideAt(TIDE_PERIOD * 0.75).rising).toBe(true);
  });
});
