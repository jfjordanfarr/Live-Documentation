import { describe, expect, it } from "vitest";

import { mirrorAxis, turnAngle } from "./mirror-turn";

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
