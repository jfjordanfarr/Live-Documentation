import { describe, expect, it } from "vitest";

import { FIRST_STEP, LAST_STEP, ladderBand, ladderScales, ladderStep, STEP_HYSTERESIS, STEP_RATIO } from "./ladder-steps";

/** The ratio a given number of steps out from reading scale. */
const stepsOut = (steps: number): number => STEP_RATIO ** -steps;

describe("ladderStep", () => {
  it("names a step for every 20 % of zoom out from reading scale, each centred on a whole number of steps", () => {
    expect(ladderStep(1, null)).toBe(0);
    expect(ladderStep(stepsOut(0.45), null)).toBe(0);
    expect(ladderStep(stepsOut(0.55), null)).toBe(1);
    expect(ladderStep(stepsOut(1), null)).toBe(1);
    expect(ladderStep(stepsOut(1.45), null)).toBe(1);
    expect(ladderStep(stepsOut(4), null)).toBe(4);
    expect(ladderStep(0.5, null)).toBe(4); // 1.2^-3.8 = 0.5
  });

  it("moves one step for each Zoom button press, landing in the middle of the step, whatever the rounding", () => {
    // The buttons zoom by the step ratio, so each press lands a whole step from the last: never near an edge.
    let step: number | null = null, ratio = 1;
    for (let press = 0; press <= LAST_STEP; press += 1) {
      step = ladderStep(ratio * (1 + 1e-12), step);
      expect(step).toBe(press);
      step = ladderStep(ratio * (1 - 1e-12), step);
      expect(step).toBe(press);
      ratio /= STEP_RATIO;
    }
  });

  it("keeps the step shown until the camera passes a quarter step beyond its edges, either way", () => {
    // Zooming out from step 2: still 2 a little past its far edge (2.5), 3 a quarter step past it.
    expect(ladderStep(stepsOut(2.7), 2)).toBe(2);
    expect(ladderStep(stepsOut(2.5 + STEP_HYSTERESIS), 2)).toBe(3);
    // Zooming in from step 3: still 3 a little before its near edge (2.5), 2 a quarter step before it.
    expect(ladderStep(stepsOut(2.3), 3)).toBe(3);
    expect(ladderStep(stepsOut(2.5 - STEP_HYSTERESIS - 0.01), 3)).toBe(2);
    // A camera resting on an edge and trembling across it keeps its step.
    let step = ladderStep(stepsOut(2.51), null);
    for (const wobble of [2.49, 2.52, 2.47, 2.53, 2.48]) step = ladderStep(stepsOut(wobble), step);
    expect(step).toBe(3);
  });

  it("jumps straight to the step of a ratio far from the one shown", () => {
    expect(ladderStep(stepsOut(7.2), 1)).toBe(7);
    expect(ladderStep(stepsOut(0.2), 6)).toBe(0);
  });

  it("is the first step for every zoom closer than reading scale and the last for every zoom past the last step", () => {
    for (const ratio of [1, 1.3, 2, 3, 40]) {
      expect(ladderStep(ratio, null)).toBe(FIRST_STEP);
      expect(ladderStep(ratio, 4)).toBe(FIRST_STEP);
    }
    for (const ratio of [stepsOut(LAST_STEP), stepsOut(LAST_STEP + 3), 0.01, 1e-6]) {
      expect(ladderStep(ratio, null)).toBe(LAST_STEP);
      expect(ladderStep(ratio, LAST_STEP)).toBe(LAST_STEP);
    }
    // At the last step the far side has no edge to pass, and at the first the near side has none.
    expect(ladderStep(1e-9, LAST_STEP)).toBe(LAST_STEP);
    expect(ladderStep(1e9, FIRST_STEP)).toBe(FIRST_STEP);
  });

  it("keeps the step for a ratio that is not a positive number", () => {
    for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(ladderStep(ratio, 5)).toBe(5);
    expect(ladderStep(Number.NaN, null)).toBe(FIRST_STEP);
  });
});

describe("ladderBand", () => {
  it("lets each band give way to the next one out at its edge", () => {
    expect(ladderBand(1, "reading")).toBe("reading");
    expect(ladderBand(0.73, "reading")).toBe("middle");
    expect(ladderBand(0.44, "middle")).toBe("far");
    expect(ladderBand(0.24, "far")).toBe("overview");
    expect(ladderBand(0.1, "reading")).toBe("overview");
    expect(ladderBand(1.31 * 1.15, "reading")).toBe("close");
  });

  it("returns closer only 15 % past an edge", () => {
    expect(ladderBand(0.8, "middle")).toBe("middle");
    expect(ladderBand(0.86, "middle")).toBe("reading");
    expect(ladderBand(0.5, "far")).toBe("far");
    expect(ladderBand(0.52, "far")).toBe("middle");
  });

  it("keeps the band for a ratio that is not a positive number", () => {
    expect(ladderBand(Number.NaN, "far")).toBe("far");
    expect(ladderBand(0, "middle")).toBe("middle");
  });
});

describe("ladderScales", () => {
  it("holds the reading screen size at a step's centre at resistance 1, and follows the map at 0", () => {
    expect(ladderScales(0, { textResistance: 1, controlResistance: 1 })).toEqual({ text: 1, control: 1 });
    const held = ladderScales(3, { textResistance: 1, controlResistance: 0 });
    expect(held.text).toBeCloseTo(STEP_RATIO ** 3, 10);
    expect(held.text * stepsOut(3)).toBeCloseTo(1, 10);
    expect(held.control).toBe(1);
    // Across the step and its margins a held size on screen lies between 0.87 and 1.15 of its reading size.
    expect(held.text * stepsOut(3 + 0.5 + STEP_HYSTERESIS)).toBeCloseTo(0.872, 3);
    expect(held.text * stepsOut(3 - 0.5 - STEP_HYSTERESIS)).toBeCloseTo(1.147, 3);
  });

  it("goes partway at a resistance between", () => {
    expect(ladderScales(4, { textResistance: 0.5, controlResistance: 0.25 })).toEqual({ text: STEP_RATIO ** 2, control: STEP_RATIO });
  });

  it("never shrinks below the map's scale nor grows past the last step's, whatever the step or the lever", () => {
    const last = ladderScales(LAST_STEP, { textResistance: 1, controlResistance: 1 });
    expect(ladderScales(LAST_STEP + 20, { textResistance: 1, controlResistance: 1 })).toEqual(last);
    expect(ladderScales(-4, { textResistance: 1, controlResistance: 1 })).toEqual({ text: 1, control: 1 });
    expect(ladderScales(5, { textResistance: 7, controlResistance: -3 })).toEqual({ text: STEP_RATIO ** 5, control: 1 });
    expect(ladderScales(5, { textResistance: Number.NaN, controlResistance: 1 }).text).toBeCloseTo(STEP_RATIO ** 5, 10);
  });
});
