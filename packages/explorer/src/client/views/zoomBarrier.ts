/** Deliberate wheel boundary between two stable perspectives, independent of rendering. */
export class ZoomBarrier {
  private last = -Infinity;
  private armed = false;
  private confirmed = false;
  private effort = 0;

  /** Once reached, the boundary stays latched despite layout motion. */
  get waiting(): boolean { return this.armed; }

  /** Forget the boundary after a reversal, a perspective change or a distant approach. */
  reset(): void { this.armed = false; this.confirmed = false; this.effort = 0; this.last = -Infinity; }

  /**
   * The arrival gesture cannot cross. After a pause, a second nudge can;
   * trackpad momentum from the first gesture cannot accumulate confirmation.
   */
  push(delta: number, now: number): boolean {
    if (delta <= 0) { this.reset(); return false; }
    if (this.armed && now - this.last >= 180) this.confirmed = true;
    this.armed = true;
    this.last = now;
    if (this.confirmed) this.effort += Math.min(delta, 100);
    if (this.effort < 80) return false;
    this.reset();
    return true;
  }
}

/** Wheel units normalized to CSS pixels; a single huge event is still one gesture. */
export function wheelPixels(delta: number, mode: number, height: number): number {
  return delta * (mode === 1 ? 16 : mode === 2 ? height : 1);
}
