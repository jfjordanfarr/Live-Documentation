import { describe, expect, it } from "vitest";

import { BAND_MARGIN, FIRST_STEP, LAST_STEP, ladderBand, ladderScales, ladderStep, STEP_HYSTERESIS, STEP_RATIO } from "./ladder-steps";

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
  /** The band of each press, walking from one press to the next in the given order, each ratio a hair off its step. */
  const walk = (presses: readonly number[], start: Parameters<typeof ladderBand>[1], wobble = 0): Map<number, string> => {
    const bands = new Map<number, string>();
    let band = start;
    for (const press of presses) {
      band = ladderBand(stepsOut(press) * (1 + wobble), band);
      bands.set(press, band);
    }
    return bands;
  };
  const out = Array.from({ length: 15 }, (_, index) => index - 4); // -4, two presses past the close band's edge, to 10

  it("gives each press its band: close two presses in, reading to one out, middle to the fourth, far the fifth and sixth, overview from the seventh", () => {
    const bands = walk(out, "reading");
    expect([...bands].filter(([press]) => press >= -2).map(([press, band]) => `${press} ${band}`)).toEqual([
      "-2 close", "-1 reading", "0 reading", "1 reading", "2 middle", "3 middle", "4 middle", "5 far", "6 far",
      "7 overview", "8 overview", "9 overview", "10 overview"
    ]);
  });

  it("reads the same band at every press walking out and walking back in, from two presses in to the last step", () => {
    // Returning to a place keeps its picture (the root's review of 2026-11-06): with the edges at literal ratios one press
    // out was the reading band going out and the middle band coming back, and so at the far, overview and close edges.
    for (const wobble of [0, 1e-9, -1e-9]) {
      const going = walk(out, "close", wobble);
      const coming = walk([...out].reverse(), "overview", wobble);
      for (let press = -2; press <= LAST_STEP; press += 1) expect(coming.get(press), `press ${press}`).toBe(going.get(press));
    }
  });

  it("keeps a band a margin past its edge between presses, so that a camera resting on an edge does not chatter", () => {
    // Out of the reading band between the first and the second press, back only 15 % past that edge.
    const edge = stepsOut(1) / Math.sqrt(BAND_MARGIN * STEP_RATIO);
    expect(ladderBand(edge * 1.001, "reading")).toBe("reading");
    expect(ladderBand(edge * 0.999, "reading")).toBe("middle");
    expect(ladderBand(edge * 1.1, "middle")).toBe("middle");
    expect(ladderBand(edge * BAND_MARGIN * 1.001, "middle")).toBe("reading");
    // A camera trembling across the edge keeps the band it had.
    let band = ladderBand(edge * 0.99, "reading");
    for (const wobble of [1.01, 0.99, 1.05, 0.98, 1.1]) band = ladderBand(edge * wobble, band);
    expect(band).toBe("middle");
    expect(ladderBand(0.1, "reading")).toBe("overview");
    expect(ladderBand(stepsOut(-3), "reading")).toBe("close");
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
