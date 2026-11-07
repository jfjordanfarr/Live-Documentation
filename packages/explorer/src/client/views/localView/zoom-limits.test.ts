import { describe, expect, it } from "vitest";

import { LAST_STEP, STEP_RATIO } from "./ladder-steps";
import { atScale, CLOSEST_SCALE, farthestScale, WHOLE_MAP_MARGIN } from "./zoom-limits";

const frame = { width: 1180, height: 840 };
const lastStep = (reading: number): number => reading * STEP_RATIO ** -LAST_STEP;

describe("farthestScale", () => {
  it("stops a map that fits the frame at the ladder's last step, where its drawing stops changing", () => {
    // A small estate subject's picture, framed at a reading scale of 1.45.
    expect(farthestScale({ width: 1600, height: 900 }, frame, 1.45)).toBeCloseTo(lastStep(1.45), 10);
    // A map smaller than the frame.
    expect(farthestScale({ width: 400, height: 300 }, frame, 1)).toBeCloseTo(lastStep(1), 10);
  });

  it("lets a map too large to stand whole in the frame at the last step be seen whole, with a margin", () => {
    // The still picture's column of a subject 4,351 px tall among neighbours: at the last step (0.16) it is about 870 px
    // on screen, taller than the frame, so the farthest zoom is four fifths of the scale that frames it whole.
    const tall = farthestScale({ width: 2400, height: 6000 }, frame, 1)!;
    expect(tall).toBeLessThan(lastStep(1));
    const whole = (frame.height - 2 * 21) / 6000 * 0.96; // the fit's own padding and share
    expect(tall).toBeCloseTo(WHOLE_MAP_MARGIN * whole, 4);
    expect(6000 * tall).toBeLessThan(frame.height * WHOLE_MAP_MARGIN + 1);
  });

  it("follows the larger map continuously: no scale jumps where the whole map just fits at the last step", () => {
    const scales = [3000, 4000, 5000, 6000, 7000].map(height => farthestScale({ width: 800, height }, frame, 1)!);
    for (let index = 1; index < scales.length; index += 1) expect(scales[index]).toBeLessThanOrEqual(scales[index - 1]);
    expect(scales[0]).toBeCloseTo(lastStep(1), 10);
  });

  it("knows nothing before the first layout, so that the camera is not trapped", () => {
    expect(farthestScale(null, frame, 1)).toBeNull();
    expect(farthestScale({ width: 0, height: 0 }, frame, 1)).toBeNull();
    expect(farthestScale({ width: 400, height: 300 }, null, 1)).toBeNull();
    expect(farthestScale({ width: 400, height: 300 }, { width: 0, height: 0 }, 1)).toBeNull();
    expect(farthestScale({ width: 400, height: 300 }, frame, Number.NaN)).toBeNull();
    expect(farthestScale({ width: 400, height: 300 }, frame, 0)).toBeNull();
  });

  it("never stands closer than the closest zoom, whatever reading scale an extreme input claims", () => {
    for (const reading of [1, 40, 400, 1e9]) expect(farthestScale({ width: 10, height: 10 }, frame, reading)).toBeLessThanOrEqual(CLOSEST_SCALE);
  });
});

describe("atScale", () => {
  it("reads a camera ten presses out as standing at the last step whatever its arithmetic's rounding", () => {
    let k = 1;
    for (let press = 0; press < LAST_STEP; press += 1) k /= STEP_RATIO;
    expect(atScale(k, lastStep(1))).toBe(true);
    expect(atScale(k * STEP_RATIO, lastStep(1))).toBe(false);
  });
});
