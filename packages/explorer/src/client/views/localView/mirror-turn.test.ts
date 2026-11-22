import { describe, expect, it } from "vitest";

import { mirrorAxis, turnAngle, turnKeyframes, turnStrength } from "./mirror-turn";

describe("the mirror's upright axis", () => {
  it("stands through what holds still, and says the camera of each of the two pictures", () => {
    // As laid out: the root's edge at the page's 100, the held card's middle at 400, drawn at scale 2. The card is 150
    // across the layout; reflected about the root's edge it would stand 600 px to the left, so the mirrored camera is 600 on.
    expect(mirrorAxis(400, 100, { x: 60, k: 2 }, false)).toEqual({ across: 150, laidOutX: 60, mirroredX: 660 });
  });

  it("is the same axis read back from the mirrored picture", () => {
    // Mirrored, the root's box lies to the left of its edge, which the camera 660 puts at the page's 700; the card, held
    // at 400, is still 150 across the layout and the picture as laid out still wants the camera at 60.
    expect(mirrorAxis(400, 700, { x: 660, k: 2 }, true)).toEqual({ across: 150, laidOutX: 60, mirroredX: 660 });
  });
});

describe("the turn's angle", () => {
  it("runs from the picture as laid out round to the mirrored one, and on round the same way to come back", () => {
    expect(turnAngle(0, "turn", true)).toBe(0);
    expect(turnAngle(0.5, "turn", true)).toBeCloseTo(90);
    expect(turnAngle(1, "turn", true)).toBe(180);
    expect(turnAngle(0, "turn", false)).toBe(180);
    expect(turnAngle(0.5, "turn", false)).toBeCloseTo(270);
    expect(turnAngle(1, "turn", false)).toBe(360);
  });

  it("never runs backward and stays inside its half turn whatever progress it is given", () => {
    for (const form of ["turn", "slide"] as const) {
      let last = -1;
      for (let step = -2; step <= 12; step++) {
        const angle = turnAngle(step / 10, form, true);
        expect(angle).toBeGreaterThanOrEqual(Math.max(0, last));
        expect(angle).toBeLessThanOrEqual(180);
        last = angle;
      }
    }
  });

  it("slides every card straight across: its place across is the eased share of the way, edge-on at the middle", () => {
    const across = (progress: number): number => Math.cos(turnAngle(progress, "slide", true) * Math.PI / 180);
    expect(across(0)).toBeCloseTo(1);
    expect(across(0.5)).toBeCloseTo(0);
    expect(across(1)).toBeCloseTo(-1);
    // A quarter of the way in time is the eased quarter of the way across, 0.15625 of it, not the quarter of the angle.
    expect(across(0.25)).toBeCloseTo(1 - 2 * 0.15625);
  });
});

describe("the motion as the browser is given it", () => {
  it("is the whole turn, evenly spaced, from one picture to the other with the edge-on instant among its moments", () => {
    for (const form of ["turn", "slide"] as const) {
      const to = turnKeyframes(form, true), back = turnKeyframes(form, false);
      expect(to.map(frame => frame.offset)).toEqual(Array.from({ length: 21 }, (_, index) => index / 20));
      expect([to[0].angle, to[10].angle, to[20].angle].map(angle => Math.round(angle * 1e6) / 1e6)).toEqual([0, 90, 180]);
      expect([back[0].angle, back[10].angle, back[20].angle].map(angle => Math.round(angle * 1e6) / 1e6)).toEqual([180, 270, 360]);
      for (const frames of [to, back]) for (let index = 1; index < frames.length; index++) expect(frames[index].angle).toBeGreaterThan(frames[index - 1].angle);
    }
  });

  it("fades everything but the held card to its faintest as the plane stands edge-on, and not at all at rest", () => {
    const frames = turnKeyframes("turn", true);
    expect(frames[0].strength).toBeCloseTo(1);
    expect(frames[20].strength).toBeCloseTo(1);
    expect(frames[10].strength).toBeCloseTo(0.12);
    expect(Math.min(...frames.map(frame => frame.strength))).toBeCloseTo(0.12);
    for (const frame of frames) expect(frame.strength).toBeCloseTo(turnStrength(frame.angle));
  });

  it("follows the eased angle closely enough that a straight line between two of its moments is the turn", () => {
    // The browser moves in a straight line between two keyframes: half way between them it is off the eased angle by
    // less than a third of a degree (0.32 at its worst), and every part of the picture is off by the same.
    const frames = turnKeyframes("turn", true);
    for (let index = 1; index < frames.length; index++) {
      const between = (frames[index - 1].angle + frames[index].angle) / 2;
      expect(Math.abs(between - turnAngle((frames[index - 1].offset + frames[index].offset) / 2, "turn", true))).toBeLessThan(0.34);
    }
  });

  it("always holds the edge-on instant, whatever number of steps is asked", () => {
    for (const steps of [1, 7, 20, 31]) {
      const frames = turnKeyframes("turn", true, steps);
      expect(frames.some(frame => Math.abs(frame.angle - 90) < 1e-9), String(steps)).toBe(true);
    }
  });
});
