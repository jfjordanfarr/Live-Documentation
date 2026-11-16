/** The colours the pool is painted in. */
export const SAND = "#e8d8a8";
export const ROCK = "#6f6a61";

/** Water colour for a tide level from 0 to 1, mixed from shallow to deep. */
export function waterFor(level: number): string {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * level).toString(16).padStart(2, "0");
  return `#${mix(0x5f, 0x1d)}${mix(0xa8, 0x4e)}${mix(0xc4, 0x6b)}`;
}
