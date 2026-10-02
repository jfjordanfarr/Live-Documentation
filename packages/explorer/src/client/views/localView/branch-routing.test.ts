import { expect, it } from "vitest";

import { branchDetourPoints, roundedBranchRoute } from "./branch-routing";

it.each([0, 1, 2])("routes a connection to column %i outside all card interiors", consumerColumn => {
  const cards = [0, 1, 2].map(i => ({ left: i * 340, right: i * 340 + 240, top: 50, bottom: 300 }));
  const source = { x: 246, y: 150 }, target = { x: cards[consumerColumn].left - 6, y: 230 };
  const points = branchDetourPoints(source, target, cards[0].right, cards[consumerColumn].left, 20);
  expect(points[1].x).toBeGreaterThan(source.x);
  expect(points[points.length - 2].x).toBeLessThan(target.x);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    for (let step = 0; step <= 20; step++) {
      const x = a.x + (b.x - a.x) * step / 20, y = a.y + (b.y - a.y) * step / 20;
      expect(cards.some(card => x > card.left && x < card.right && y > card.top && y < card.bottom)).toBe(false);
    }
  }
  const rounded = roundedBranchRoute(points);
  expect(rounded).not.toMatch(/NaN|Infinity/);
  expect(rounded.startsWith(`M ${source.x} ${source.y}`)).toBe(true);
  expect(rounded.endsWith(`L ${target.x} ${target.y}`)).toBe(true);
});
