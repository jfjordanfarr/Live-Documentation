import type { Command } from "./input";
import { loadPool, type Pool } from "./pool";
import { createRng } from "./rng";
import { scorePool } from "./score";
import { isLowWater } from "./tide";

/** One game: a pool, the player's hand above it, and the clock. */
export class Game {
  readonly pool: Pool;
  minute = 0;
  paused = false;
  hand = { x: 0, y: 0 };

  constructor(level: string, seed: number) {
    this.pool = loadPool(level, createRng(seed));
  }

  /** Carries out a player's command; feeding needs low water. Returns how many creatures were fed. */
  apply(command: Command): number {
    switch (command.kind) {
      case "move":
        this.hand = { x: this.hand.x + command.dx, y: this.hand.y + command.dy };
        return 0;
      case "pause":
        this.paused = !this.paused;
        return 0;
      case "feed":
        return isLowWater(this.pool.tide) ? this.pool.feedAt(this.hand.x, this.hand.y) : 0;
    }
  }

  tick(): void {
    if (this.paused) return;
    this.minute++;
    this.pool.step(this.minute);
  }

  get score(): number {
    return scorePool(this.pool);
  }
}
