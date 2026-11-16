import { frameFor } from "./sprites";

describe("frameFor", () => {
  it("gives each species its own cell of the sheet", () => {
    const xs = (["crab", "anemone", "shrimp", "starfish"] as const).map((species) => frameFor(species).x);
    expect(new Set(xs).size).toBe(4);
  });
});
