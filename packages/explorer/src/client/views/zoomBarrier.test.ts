import { describe, expect, it } from "vitest";

import { ZoomBarrier, wheelPixels } from "./zoomBarrier";

describe("perspective zoom boundary", () => {
  it("rejects arrival and sustained trackpad momentum, accepts a deliberate later nudge", () => {
    const barrier = new ZoomBarrier();
    expect(barrier.push(4000, 0)).toBe(false);
    for (let time = 16; time <= 320; time += 16) expect(barrier.push(30, time)).toBe(false);
    expect(barrier.push(40, 600)).toBe(false);
    expect(barrier.push(40, 616)).toBe(true);
    expect(barrier.push(120, 632)).toBe(false);
  });
  it("forgets partial confirmation after reversing away", () => {
    const barrier = new ZoomBarrier();
    barrier.push(100, 0); barrier.push(30, 300);
    expect(barrier.push(-10, 316)).toBe(false);
    expect(barrier.push(120, 600)).toBe(false);
    expect(barrier.push(100, 900)).toBe(true);
  });
  it("normalizes wheel devices without making one event a second gesture", () => {
    expect(wheelPixels(3, 1, 900)).toBe(48);
    expect(wheelPixels(-1, 2, 900)).toBe(-900);
    expect(wheelPixels(5, 0, 900)).toBe(5);
  });
});
