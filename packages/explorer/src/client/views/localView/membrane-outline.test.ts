import { describe, expect, it } from "vitest";

import { membraneOutline, membranePath } from "./membrane-outline";

describe("a membrane's outline", () => {
  it("is the rectangle itself for one segment", () => {
    expect(membraneOutline([{ left: 10, right: 110, top: 20, bottom: 70 }])).toEqual([
      { x: 10, y: 20 }, { x: 110, y: 20 }, { x: 110, y: 70 }, { x: 10, y: 70 }
    ]);
    expect(membranePath([{ left: 10, right: 110, top: 20, bottom: 70 }])).toBe("M 10 20 L 110 20 L 110 70 L 10 70 Z");
  });

  it("steps down across the gutter to a lower neighbour, through the corridor where the two overlap", () => {
    // Column 0's segment stands from 0 to 100, column 1's from 60 to 200; the gutter runs from x 100 to 140.
    const points = membraneOutline([{ left: 0, right: 100, top: 0, bottom: 100 }, { left: 140, right: 240, top: 60, bottom: 200 }]);
    expect(points).toEqual([
      { x: 0, y: 0 }, { x: 100, y: 0 },
      { x: 100, y: 60 }, { x: 140, y: 60 },   // the corridor's top is the lower of the two tops
      { x: 240, y: 60 }, { x: 240, y: 200 }, { x: 140, y: 200 },
      { x: 140, y: 100 }, { x: 100, y: 100 }, // the corridor's bottom is the higher of the two bottoms
      { x: 0, y: 100 }
    ]);
  });

  it("drops the step when neighbours share an edge, so a level membrane is one rectangle's worth of corners", () => {
    const points = membraneOutline([{ left: 0, right: 100, top: 0, bottom: 100 }, { left: 140, right: 240, top: 0, bottom: 100 }]);
    expect(points).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 140, y: 0 }, { x: 240, y: 0 }, { x: 240, y: 100 }, { x: 140, y: 100 }, { x: 100, y: 100 }, { x: 0, y: 100 }]);
  });

  it("rounds every corner by the radius, convex and concave, and by half a short edge where the radius would not fit", () => {
    // The rectangle: each corner's curve starts and ends 8 px along its edges, with the corner as the control point.
    expect(membranePath([{ left: 10, right: 110, top: 20, bottom: 70 }], 8)).toBe(
      "M 18 20 L 102 20 Q 110 20 110 28 L 110 62 Q 110 70 102 70 L 18 70 Q 10 70 10 62 L 10 28 Q 10 20 18 20 Z"
    );
    // A step of 6 px between two segments is rounded by 3 at each of its two corners, so the two curves meet without overlapping.
    const stepped = membranePath([{ left: 0, right: 100, top: 0, bottom: 100 }, { left: 140, right: 240, top: 6, bottom: 100 }], 8);
    expect(stepped).toContain("L 97 0 Q 100 0 100 3");
    expect(stepped).toContain("Q 100 6 103 6");
  });

  it("gives nothing for no segments", () => {
    expect(membraneOutline([])).toEqual([]);
    expect(membranePath([])).toBe("");
  });
});
