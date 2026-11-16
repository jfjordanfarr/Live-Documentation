import { between, createRng } from "./rng";

describe("createRng", () => {
  it("repeats itself from the same seed", () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("keeps between() inside its bounds", () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const value = between(rng, 2, 5);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThanOrEqual(5);
    }
  });
});
