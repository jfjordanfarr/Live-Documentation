import { loadPool } from "../src/pool";
import { createRng } from "../src/rng";
import { emptyPool } from "./helpers";

describe("Pool", () => {
  it("stocks a level with the creatures it names", () => {
    const pool = loadPool("rockpool", createRng(1));
    expect(pool.creatures.length).toBe(9);
  });

  it("feeds only the creatures within reach of the hand", () => {
    const pool = emptyPool();
    const crab = pool.add("crab");
    expect(pool.feedAt(crab.x, crab.y)).toBe(1);
  });
});
