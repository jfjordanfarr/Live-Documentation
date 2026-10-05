import { describe, expect, it } from "vitest";

import { curveTo, threadedRoute, type RoutePoint } from "./branch-routing";
import type { BezierTuning } from "../../types";

const tuning: BezierTuning = { stubFactor: 0.4, stubMin: 24, stubMaxOffset: 20, verticalOffset: 0.1 };

/** The cubic's points at `steps` parameters, from the command text `curveTo` returns. */
function sampleCurve(from: RoutePoint, command: string, steps = 24): RoutePoint[] {
  const numbers = command.match(/-?\d+(?:\.\d+)?/gu)!.map(Number);
  if (command.startsWith("Q")) {
    const [cx, cy, x, y] = numbers;
    return Array.from({ length: steps + 1 }, (_, i) => { const t = i / steps, u = 1 - t; return { x: u * u * from.x + 2 * u * t * cx + t * t * x, y: u * u * from.y + 2 * u * t * cy + t * t * y }; });
  }
  const [c1x, c1y, c2x, c2y, x, y] = numbers;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, u = 1 - t;
    return { x: u ** 3 * from.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t ** 3 * x, y: u ** 3 * from.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t ** 3 * y };
  });
}

describe("threaded routes", () => {
  const cards = [
    { left: 0, right: 240, top: 100, bottom: 300 },
    { left: 340, right: 580, top: 60, bottom: 380 },
    { left: 340, right: 580, top: 440, bottom: 700 },
    { left: 680, right: 920, top: 200, bottom: 500 }
  ];
  const from = { x: 246, y: 150 }, to = { x: 674, y: 300 };
  const lane = { left: 332, right: 588, y: 410 };

  it("runs forward through the lane and never enters a card", () => {
    const route = threadedRoute(from, to, [lane], tuning);
    expect(route.d).not.toMatch(/NaN|Infinity/);
    expect(route.d.startsWith(`M ${from.x} ${from.y}`)).toBe(true);
    expect(route.d.endsWith(`${to.x} ${to.y}`)).toBe(true);
    expect(route.pieces.map(piece => piece.kind)).toEqual(["curve", "lane", "curve"]);
    let x = from.x;
    for (const piece of route.pieces) {
      const points = piece.kind === "lane" ? [piece.from, piece.to] : sampleCurve(piece.from, curveTo(piece.from, piece.to, tuning));
      for (const point of points) {
        expect(point.x).toBeGreaterThanOrEqual(x - 0.01);
        x = Math.max(x, point.x);
        expect(cards.some(card => point.x > card.left && point.x < card.right && point.y > card.top && point.y < card.bottom), `(${point.x}, ${point.y}) is inside a card`).toBe(false);
      }
      if (piece.kind === "lane") expect([piece.from.y, piece.to.y]).toEqual([lane.y, lane.y]);
    }
  });

  it("threads two columns with one lane each, in order", () => {
    const route = threadedRoute(from, { x: 1020, y: 90 }, [lane, { left: 672, right: 928, y: 520 }], tuning);
    expect(route.pieces.map(piece => piece.kind)).toEqual(["curve", "lane", "curve", "lane", "curve"]);
    expect(route.pieces.filter(piece => piece.kind === "lane").map(piece => piece.from.y)).toEqual([410, 520]);
    expect(route.d.split(" L ")).toHaveLength(3);
  });

  it("curves leave to the right and arrive from the left, and a near-vertical hop is a quadratic", () => {
    const cubic = curveTo({ x: 0, y: 0 }, { x: 200, y: 80 }, tuning);
    const [c1x, , c2x] = cubic.match(/-?\d+(?:\.\d+)?/gu)!.map(Number);
    expect(c1x).toBeGreaterThan(0);
    expect(c2x).toBeLessThan(200);
    expect(curveTo({ x: 0, y: 0 }, { x: 10, y: 80 }, tuning).startsWith("Q")).toBe(true);
  });
});
