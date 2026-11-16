import type { Pool } from "../pool";
import { ROCK, SAND, waterFor } from "./palette";
import { frameFor, spriteSheet } from "./sprites";

const CELL = 16;

/** Paints the pool: sand, the water at its level, every creature, and the player's hand. */
export function drawPool(context: CanvasRenderingContext2D, pool: Pool, hand: { x: number; y: number }): void {
  const { width, height } = pool.level;
  context.fillStyle = SAND;
  context.fillRect(0, 0, width * CELL, height * CELL);
  context.fillStyle = waterFor(pool.tide.level);
  context.globalAlpha = 0.4 + 0.5 * pool.tide.level;
  context.fillRect(0, 0, width * CELL, height * CELL);
  context.globalAlpha = 1;
  const sheet = spriteSheet();
  for (const creature of pool.creatures) {
    const frame = frameFor(creature.species);
    context.drawImage(sheet, frame.x, frame.y, frame.size, frame.size, creature.x * CELL, creature.y * CELL, CELL, CELL);
  }
  context.strokeStyle = ROCK;
  context.strokeRect(hand.x * CELL, hand.y * CELL, CELL, CELL);
}
