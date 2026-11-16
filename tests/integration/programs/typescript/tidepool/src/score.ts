import type { Pool } from "./pool";

/** Ten points for every creature at peace, less one for each step of hunger. */
export function scorePool(pool: Pool): number {
  return pool.creatures.reduce((total, creature) => total + 10 - creature.hunger, 0);
}

/** The best of a run of scores, or zero before any game is played. */
export function bestScore(scores: readonly number[]): number {
  return scores.length === 0 ? 0 : Math.max(...scores);
}
