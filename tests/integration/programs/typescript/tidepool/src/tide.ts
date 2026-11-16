/** The water over the pool at one minute of the game: 0 is dry rock, 1 is high water. */
export interface TideState {
  level: number;
  rising: boolean;
}

/** Minutes from one high water to the next. */
export const TIDE_PERIOD = 120;

/** The tide at a minute of play, a smooth rise and fall. */
export function tideAt(minute: number): TideState {
  const phase = (minute % TIDE_PERIOD) / TIDE_PERIOD;
  const level = 0.5 + 0.5 * Math.cos(phase * 2 * Math.PI);
  return { level, rising: phase > 0.5 };
}

/** True when the water is low enough for the player to reach the pool's floor. */
export function isLowWater(tide: TideState): boolean {
  return tide.level < 0.2;
}
