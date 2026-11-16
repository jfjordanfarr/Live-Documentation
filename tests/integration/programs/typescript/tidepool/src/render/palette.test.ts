import { waterFor } from "./palette";

describe("waterFor", () => {
  it("runs from shallow at low water to deep at high water", () => {
    expect(waterFor(0)).toBe("#5fa8c4");
    expect(waterFor(1)).toBe("#1d4e6b");
  });
});
