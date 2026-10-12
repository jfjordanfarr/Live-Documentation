/** Wheel units normalized to CSS pixels for consistent mouse and trackpad zoom. */
export function wheelPixels(delta: number, mode: number, height: number): number {
  return delta * (mode === 1 ? 16 : mode === 2 ? height : 1);
}
