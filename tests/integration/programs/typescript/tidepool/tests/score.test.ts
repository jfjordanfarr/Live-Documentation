import { bestScore, scorePool } from "../src/score";
import { emptyPool } from "./helpers";

describe("score", () => {
  it("gives ten points for a creature that is not hungry", () => {
    const pool = emptyPool();
    pool.add("starfish");
    expect(scorePool(pool)).toBe(10);
  });

  it("is zero before any game", () => {
    expect(bestScore([])).toBe(0);
  });
});
