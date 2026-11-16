/** A seeded random source, so that a pool started from the same seed plays the same way. */
export type Rng = () => number;

/** Mulberry32: small, fast and good enough for a game. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A whole number from `low` to `high`, both included. */
export function between(rng: Rng, low: number, high: number): number {
  return low + Math.floor(rng() * (high - low + 1));
}
