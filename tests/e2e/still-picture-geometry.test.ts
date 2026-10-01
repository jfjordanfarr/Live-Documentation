import { describe, expect, it } from "vitest";

import { angleBetween, boxGap, crossings, flowOf, folderAdjacency, intersectionOf, planTour, sharedChannels, type Polyline, type TourFact } from "./still-picture-geometry";

/** A straight line sampled every 4 px, so the stub exclusion and the run lengths behave as on a real path. */
const sampled = (id: string, from: [number, number], to: [number, number], step = 4): Polyline => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const points: Array<[number, number]> = [];
  for (let at = 0; at <= length; at += step) points.push([from[0] + ((to[0] - from[0]) * at) / length, from[1] + ((to[1] - from[1]) * at) / length]);
  return { id, points };
};

describe("crossings", () => {
  it("counts an X as one point, one pair, two wires", () => {
    const score = crossings([sampled("a", [0, 0], [200, 200]), sampled("b", [0, 200], [200, 0])]);
    expect(score).toEqual({ points: 1, farPoints: 1, pairs: 1, wiresCrossed: 2 });
  });

  it("does not count parallel wires, touching ends, or two wires leaving one pin", () => {
    expect(crossings([sampled("a", [0, 0], [200, 0]), sampled("b", [0, 20], [200, 20])]).points).toBe(0);
    expect(crossings([sampled("a", [0, 0], [100, 100]), sampled("b", [100, 100], [200, 0])]).points).toBe(0);
    // Two wires leave the same pin at (0, 0) and diverge; the only place they meet is the stub.
    expect(crossings([sampled("a", [0, 0], [200, 60]), sampled("b", [0, 0], [200, -60])]).points).toBe(0);
  });

  it("does not count two wires weaving inside one cable, and does count a wire cutting across a cable", () => {
    // Two wires 2 px apart that trade places twice over 300 px: a cable, not two crossings.
    const weave = (id: string, y0: number, y1: number): Polyline => ({ id, points: [[0, y0], [100, y1], [200, y0], [300, y1]] });
    expect(crossings([weave("a", 0, 2), weave("b", 2, 0)]).points).toBe(0);
    expect(angleBetween({ ax: 0, ay: 0, bx: 100, by: 2 }, { ax: 0, ay: 2, bx: 100, by: 0 })).toBeLessThan(3);
    // A third wire cutting across them at 90 degrees crosses both.
    const score = crossings([weave("a", 0, 2), weave("b", 2, 0), sampled("c", [150, -100], [150, 100])]);
    expect(score.points).toBe(2);
    expect(score.wiresCrossed).toBe(3);
  });

  it("counts a wire crossed twice by two others as two pairs and three wires", () => {
    const score = crossings([sampled("a", [0, 100], [400, 100]), sampled("b", [100, 0], [100, 200]), sampled("c", [300, 0], [300, 200])]);
    expect(score).toEqual({ points: 2, farPoints: 2, pairs: 2, wiresCrossed: 3 });
  });

  it("tells a crossing in a fan at a pin from one in the open", () => {
    // Two wires leave pins 20 px apart on one card edge and swap heights within 50 px: a fan crossing, not an open one.
    const fan = crossings([sampled("a", [0, 0], [300, 60]), sampled("b", [0, 20], [300, -40])]);
    expect(fan.points).toBe(1);
    expect(fan.farPoints).toBe(0);
  });

  it("finds where two segments meet, counts a touch at a sample point, and leaves collinear overlap to the channel measure", () => {
    expect(intersectionOf({ ax: 0, ay: 0, bx: 10, by: 10 }, { ax: 0, ay: 10, bx: 10, by: 0 })).toEqual([5, 5]);
    expect(intersectionOf({ ax: 0, ay: 0, bx: 10, by: 0 }, { ax: 5, ay: 0, bx: 5, by: 8 })).toEqual([5, 0]);
    expect(intersectionOf({ ax: 0, ay: 0, bx: 10, by: 0 }, { ax: 0, ay: 1, bx: 10, by: 1 })).toBeNull();
    expect(intersectionOf({ ax: 0, ay: 0, bx: 10, by: 0 }, { ax: 5, ay: 0, bx: 15, by: 0 })).toBeNull();
  });
});

describe("shared channels", () => {
  it("counts two wires 4 px apart over 100 px and ignores two 12 px apart", () => {
    expect(sharedChannels([sampled("a", [0, 0], [200, 0]), sampled("b", [0, 4], [200, 4])])).toEqual({ wires: 2, longestRunPx: 152 });
    expect(sharedChannels([sampled("a", [0, 0], [200, 0]), sampled("b", [0, 12], [200, 12])]).wires).toBe(0);
  });

  it("ignores a shared stub shorter than the minimum run", () => {
    // Both leave (0, 0); they are within 6 px of each other only for the first 20 px or so, inside the exclusion.
    expect(sharedChannels([sampled("a", [0, 0], [200, 80]), sampled("b", [0, 0], [200, -80])]).wires).toBe(0);
  });
});

describe("flow", () => {
  it("reads a rightward wire as flowing whichever end the path starts at", () => {
    expect(flowOf([[0, 0], [100, 10], [200, 0]], 0)).toEqual({ flowing: true, backward: false });
    expect(flowOf([[200, 0], [100, 10], [0, 0]], 1)).toEqual({ flowing: true, backward: false });
  });

  it("reads a wire whose using end is left of its offering end as backward", () => {
    expect(flowOf([[200, 0], [0, 0]], 0)).toEqual({ flowing: false, backward: true });
  });

  it("forgives a stub-sized step back and not a detour", () => {
    expect(flowOf([[0, 0], [20, 0], [10, 40], [200, 40]], 0).flowing).toBe(true);
    expect(flowOf([[0, 0], [120, 0], [40, 60], [200, 60]], 0).flowing).toBe(false);
  });
});

describe("folder adjacency", () => {
  const box = (x: number, y: number) => ({ x, y, width: 100, height: 50 });

  it("counts only cards with a sibling drawn, and credits the nearest neighbour sharing the folder", () => {
    const score = folderAdjacency([
      { id: "a/1", folder: "a", box: box(0, 0) },
      { id: "a/2", folder: "a", box: box(0, 60) },
      { id: "b/1", folder: "b", box: box(0, 300) },
      { id: "c/1", folder: "c", box: box(0, 120) }
    ]);
    // a/1's nearest is a/2 (gap 10); a/2's nearest is a/1 (10) over c/1 (10, a tie that counts); b/1 and c/1 have no sibling.
    expect(score).toEqual({ counted: 2, adjacent: 2 });
  });

  it("charges a card whose nearest neighbour is from another folder", () => {
    const score = folderAdjacency([
      { id: "a/1", folder: "a", box: box(0, 0) },
      { id: "b/1", folder: "b", box: box(0, 60) },
      { id: "a/2", folder: "a", box: box(0, 400) },
      { id: "b/2", folder: "b", box: box(0, 460) }
    ]);
    expect(score).toEqual({ counted: 4, adjacent: 0 });
  });

  it("measures the gap between boxes, not their centers", () => {
    expect(boxGap({ x: 0, y: 0, width: 100, height: 100 }, { x: 150, y: 0, width: 100, height: 100 })).toBe(50);
    expect(boxGap({ x: 0, y: 0, width: 100, height: 100 }, { x: 50, y: 50, width: 100, height: 100 })).toBe(0);
  });
});

describe("the tour", () => {
  const frame = { x: 0, y: 0, width: 1000, height: 600 };
  const fact = (key: string, x: number, y: number, extra: Partial<TourFact> = {}): TourFact => ({ key, box: { x, y, width: 200, height: 100 }, atReadingSize: true, legibleNow: false, ...extra });

  it("needs no pan when everything is legible already", () => {
    const plan = planTour(frame, [fact("a", 100, 100, { legibleNow: true })], [{ x: 100, y: 100, width: 200, height: 100 }], 800, 500);
    expect(plan.pans).toEqual([]);
    expect(plan.legibleAfter).toBe(1);
  });

  it("takes one pan for two facts that sit together below the frame, keeping a card in view", () => {
    const facts = [fact("a", 100, 100, { legibleNow: true }), fact("b", 300, 700), fact("c", 600, 760)];
    // The second card sits low enough to stay in frame after the pan that brings b and c up.
    const cards = [{ x: 100, y: 100, width: 200, height: 100 }, { x: 300, y: 480, width: 200, height: 100 }];
    const plan = planTour(frame, facts, cards, 800, 500);
    expect(plan.pans).toHaveLength(1);
    expect(plan.pans[0].newlySeen).toBe(2);
    expect(plan.pans[0].blind).toBe(false);
    expect(plan.legibleAfter).toBe(3);
  });

  it("steps toward a far fact in pans no larger than the limit, and calls a pan blind when no card survives it", () => {
    const facts = [fact("a", 100, 100, { legibleNow: true }), fact("b", 2500, 100)];
    // The card at the right edge survives the first 800 px pan; nothing survives the second.
    const cards = [{ x: 100, y: 100, width: 200, height: 100 }, { x: 850, y: 100, width: 100, height: 100 }];
    const plan = planTour(frame, facts, cards, 800, 500);
    expect(plan.pans.map(pan => pan.dx)).toEqual([-800, -800, -500]);
    expect(plan.pans.map(pan => pan.blind)).toEqual([false, true, true]);
    expect(plan.legibleAfter).toBe(2);
  });

  it("reports a fact under reading size, or wider than the frame, as unreachable by panning", () => {
    const facts = [fact("small", 100, 700, { atReadingSize: false }), { key: "wide", box: { x: 0, y: 700, width: 1200, height: 50 }, atReadingSize: true, legibleNow: false }];
    const plan = planTour(frame, facts, [], 800, 500);
    expect(plan.unreachable).toBe(2);
    expect(plan.pans).toEqual([]);
  });
});
