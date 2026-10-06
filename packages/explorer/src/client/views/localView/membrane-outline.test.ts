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

  it("gives nothing for no segments", () => {
    expect(membraneOutline([])).toEqual([]);
    expect(membranePath([])).toBe("");
  });
});
