import { Pool, type Level } from "../src/pool";
import { createRng } from "../src/rng";

/** A small empty level for tests, five cells square. */
export const TEST_LEVEL: Level = { name: "test", width: 5, height: 5, creatures: {} };

/** An empty pool on the test level, from a fixed seed. */
export function emptyPool(seed = 42): Pool {
  return new Pool(TEST_LEVEL, createRng(seed));
}
