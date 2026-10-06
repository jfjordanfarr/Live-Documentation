import { describe, expect, it } from "vitest";

import {
  type Point,
  type Rect,
  type BezierTuningParams,
  type PathResult,
  type SelfLoopParams,
  distance,
  computeStubLength,
  computeBezierPath,
  computeSelfLoopStubs,
  LACE_PITCH,
  offsetToPinEdge,
  rectCenter,
  rectSize,
  expandRect,
  boundingBoxFromPoints,
  mergeRects,
  createConnectionGradient,
  DEFAULT_BEZIER_TUNING,
  DEFAULT_SELF_LOOP_PARAMS
} from "./connection-geometry";

describe("connection-geometry", () => {
  describe("distance", () => {
    it("calculates distance between two points (3-4-5 triangle)", () => {
      const result = distance({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(result).toBeCloseTo(5);
    });

    it("returns 0 for same point", () => {
      const p = { x: 10, y: 20 };
      expect(distance(p, p)).toBe(0);
    });

    it("handles negative coordinates", () => {
      const result = distance({ x: -3, y: -4 }, { x: 0, y: 0 });
      expect(result).toBeCloseTo(5);
    });

    it("is commutative", () => {
      const a = { x: 10, y: 20 };
      const b = { x: 50, y: 80 };
      expect(distance(a, b)).toBe(distance(b, a));
    });

    it("handles large distances", () => {
      const result = distance({ x: 0, y: 0 }, { x: 1000, y: 1000 });
      expect(result).toBeCloseTo(Math.sqrt(2000000));
    });
  });

  describe("computeStubLength", () => {
    const tuning = DEFAULT_BEZIER_TUNING;

    it("returns stubMin for very short gaps", () => {
      const result = computeStubLength(10, tuning);
      expect(result).toBe(tuning.stubMin);
    });

    it("scales with horizontal gap", () => {
      const smallGap = computeStubLength(100, tuning);
      const largeGap = computeStubLength(400, tuning);
      expect(largeGap).toBeGreaterThan(smallGap);
    });

    it("respects stubMaxOffset ceiling for large gaps", () => {
      const veryLargeGap = computeStubLength(1000, tuning);
      // Check that it doesn't grow unbounded
      expect(veryLargeGap).toBeLessThan(1000);
    });

    it("handles zero gap gracefully", () => {
      const result = computeStubLength(0, tuning);
      expect(result).toBe(tuning.stubMin);
    });
  });

  describe("computeBezierPath", () => {
    it("computes path from left to right", () => {
      const source: Point = { x: 100, y: 100 };
      const target: Point = { x: 300, y: 150 };

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      expect(result.d).toMatch(/^M 100 100/);
      expect(result.d).toContain("C");
      expect(result.approximateLength).toBeGreaterThan(0);
    });

    it("computes path from right to left", () => {
      const source: Point = { x: 300, y: 100 };
      const target: Point = { x: 100, y: 150 };

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      expect(result.d).toMatch(/^M 300 100/);
      expect(result.d).toContain("C");
    });

    it("uses quadratic curve for very short horizontal distances", () => {
      const source: Point = { x: 100, y: 100 };
      const target: Point = { x: 110, y: 150 }; // Less than 24px horizontal

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      // Should use Q (quadratic) instead of C (cubic)
      expect(result.d).toContain("Q");
      expect(result.d).not.toContain("C");
    });

    it("handles vertical-only displacement (same x)", () => {
      const source: Point = { x: 100, y: 100 };
      const target: Point = { x: 100, y: 300 };

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      expect(result.d).toMatch(/^M 100 100/);
      expect(result.approximateLength).toBeGreaterThan(0);
    });

    it("handles horizontal-only displacement (same y)", () => {
      const source: Point = { x: 100, y: 100 };
      const target: Point = { x: 400, y: 100 };

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      expect(result.d).toMatch(/^M 100 100/);
      // Horizontal path should have length close to distance
      expect(result.approximateLength).toBeCloseTo(300, -1);
    });

    it("approximate length increases with distance", () => {
      const source: Point = { x: 0, y: 0 };
      const shortTarget: Point = { x: 100, y: 0 };
      const longTarget: Point = { x: 500, y: 0 };

      const shortPath = computeBezierPath(source, shortTarget, DEFAULT_BEZIER_TUNING);
      const longPath = computeBezierPath(source, longTarget, DEFAULT_BEZIER_TUNING);

      expect(longPath.approximateLength).toBeGreaterThan(shortPath.approximateLength);
    });

    it("generates valid SVG cubic bezier command", () => {
      const source: Point = { x: 100, y: 100 };
      const target: Point = { x: 300, y: 200 };

      const result = computeBezierPath(source, target, DEFAULT_BEZIER_TUNING);

      // Format: M x y C x1 y1 x2 y2 x y
      expect(result.d).toMatch(/^M\s+\d+\s+\d+\s+C\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+\d+\s+\d+$/);
    });

    it("respects custom tuning parameters", () => {
      const source: Point = { x: 0, y: 0 };
      const target: Point = { x: 200, y: 100 };

      const tightTuning: BezierTuningParams = {
        stubFactor: 0.1,
        stubMin: 10,
        stubMaxOffset: 20,
        verticalOffset: 0.05
      };

      const looseTuning: BezierTuningParams = {
        stubFactor: 0.8,
        stubMin: 50,
        stubMaxOffset: 150,
        verticalOffset: 0.4
      };

      const tightPath = computeBezierPath(source, target, tightTuning);
      const loosePath = computeBezierPath(source, target, looseTuning);

      expect(tightPath.d).not.toBe(loosePath.d);
    });
  });

  describe("computeSelfLoopStubs", () => {
    const params = DEFAULT_SELF_LOOP_PARAMS;
    const parse = (points: string): Point[] => points.split(" ").map(pair => { const [x, y] = pair.split(",").map(Number); return { x, y }; });
    const xs = (points: Point[]): number[] => points.map(point => point.x);
    const ys = (points: Point[]): number[] => points.map(point => point.y);
    /** The outline runs out along one side and back along the other, so the lace's far end is the middle pair of points. */
    const farEnd = (points: Point[]): [Point, Point] => [points[points.length / 2 - 1], points[points.length / 2]];
    /** The far end's centre, between the two sides of the lace. */
    const farMid = (points: Point[]): Point => { const [a, b] = farEnd(points); return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const provider: Point = { x: 150, y: 100 };
    const consumer: Point = { x: 50, y: 200 };

    it("leaves the pin's edge at its full width and returns to the card's edge one radius inward, toward its partner", () => {
      const { providerPoints, consumerPoints } = computeSelfLoopStubs(provider, consumer, params);
      const lace = parse(providerPoints);
      expect(lace).toHaveLength(26);
      // The first and last points are the two sides of the lace at the pin's edge.
      expect(Math.abs(lace[0].x - provider.x)).toBeLessThan(0.3);
      expect(Math.abs(lace[lace.length - 1].x - provider.x)).toBeLessThan(0.3);
      expect(Math.abs(lace[0].y - lace[lace.length - 1].y)).toBeCloseTo(params.baseWidth, 1);
      // The far end lies on the card's edge, curlAmount below the pin, since the consumer stands below.
      expect(farMid(lace).x).toBeCloseTo(provider.x - params.pinRadius, 1);
      expect(farMid(lace).y).toBeCloseTo(provider.y + params.curlAmount, 1);
      // The consumer's lace mirrors it: out to the left and back, turning up toward the provider.
      const other = parse(consumerPoints);
      expect(farMid(other).x).toBeCloseTo(consumer.x + params.pinRadius, 1);
      expect(farMid(other).y).toBeCloseTo(consumer.y - params.curlAmount, 1);
      expect(Math.min(...xs(other))).toBeLessThan(consumer.x - params.stubLength);
    });

    it("turns the other way when the consumer stands above, and parts downward and upward on one row", () => {
      const above = computeSelfLoopStubs({ x: 150, y: 200 }, { x: 50, y: 100 }, params);
      expect(farMid(parse(above.providerPoints)).y).toBeCloseTo(200 - params.curlAmount, 1);
      expect(farMid(parse(above.consumerPoints)).y).toBeCloseTo(100 + params.curlAmount, 1);
      const same = computeSelfLoopStubs({ x: 150, y: 100 }, { x: 50, y: 100 }, params);
      expect(farMid(parse(same.providerPoints)).y).toBeCloseTo(100 + params.curlAmount, 1);
      expect(farMid(parse(same.consumerPoints)).y).toBeCloseTo(100 - params.curlAmount, 1);
    });

    it("never reaches into the card past the pin, and sweeps out no further than its length allows", () => {
      const lace = parse(computeSelfLoopStubs(provider, consumer, params).providerPoints);
      expect(Math.min(...xs(lace))).toBeGreaterThanOrEqual(provider.x - params.pinRadius - 0.3);
      const reach = Math.max(...xs(lace)) - provider.x;
      expect(reach).toBeGreaterThan(params.stubLength);
      expect(reach).toBeLessThan(params.stubLength * 1.6 + params.baseWidth);
      // It stays on its partner's side of the pin's row, bar its own width.
      expect(Math.min(...ys(lace))).toBeGreaterThanOrEqual(provider.y - params.baseWidth);
    });

    it("nests the laces of one pin that turn the same way outward by rank, sharing their return", () => {
      const first = parse(computeSelfLoopStubs(provider, consumer, params, { provider: 0, consumer: 0 }).providerPoints);
      const second = parse(computeSelfLoopStubs(provider, consumer, params, { provider: 1, consumer: 0 }).providerPoints);
      expect(Math.max(...xs(second)) - Math.max(...xs(first))).toBeCloseTo(LACE_PITCH * 1.2, 0);
      expect(farMid(second).x).toBeCloseTo(farMid(first).x, 1);
      expect(farMid(second).y).toBeCloseTo(farMid(first).y, 1);
    });

    it("thins to the card's edge by the taper: a hairline at 1, its full width at 0", () => {
      const width = (taper: number): number => {
        const [a, b] = farEnd(parse(computeSelfLoopStubs(provider, consumer, { ...params, taper }).providerPoints));
        return Math.hypot(a.x - b.x, a.y - b.y);
      };
      expect(width(0)).toBeCloseTo(params.baseWidth, 1);
      expect(width(1)).toBeCloseTo(params.baseWidth * 0.15, 1);
      expect(width(0.5)).toBeGreaterThan(width(1));
      expect(width(0.5)).toBeLessThan(width(0));
    });
  });

  describe("offsetToPinEdge", () => {
    it("offsets point to right edge for outbound", () => {
      const center: Point = { x: 100, y: 100 };
      const pinRadius = 8;

      const result = offsetToPinEdge(center, pinRadius, "outbound");

      expect(result.x).toBe(108);
      expect(result.y).toBe(100);
    });

    it("offsets point to left edge for inbound", () => {
      const center: Point = { x: 100, y: 100 };
      const pinRadius = 8;

      const result = offsetToPinEdge(center, pinRadius, "inbound");

      expect(result.x).toBe(92);
      expect(result.y).toBe(100);
    });

    it("preserves Y coordinate", () => {
      const center: Point = { x: 50, y: 200 };

      const result = offsetToPinEdge(center, 10, "outbound");

      expect(result.y).toBe(200);
    });
  });

  describe("rectCenter", () => {
    it("calculates center of rectangle", () => {
      const rect: Rect = { left: 0, top: 0, right: 100, bottom: 50 };
      expect(rectCenter(rect)).toEqual({ x: 50, y: 25 });
    });

    it("handles offset rectangles", () => {
      const rect: Rect = { left: 10, top: 20, right: 110, bottom: 70 };
      expect(rectCenter(rect)).toEqual({ x: 60, y: 45 });
    });

    it("handles negative coordinates", () => {
      const rect: Rect = { left: -50, top: -50, right: 50, bottom: 50 };
      expect(rectCenter(rect)).toEqual({ x: 0, y: 0 });
    });
  });

  describe("rectSize", () => {
    it("calculates width and height", () => {
      const rect: Rect = { left: 10, top: 20, right: 110, bottom: 70 };
      expect(rectSize(rect)).toEqual({ width: 100, height: 50 });
    });

    it("handles zero-size rectangle", () => {
      const rect: Rect = { left: 50, top: 50, right: 50, bottom: 50 };
      expect(rectSize(rect)).toEqual({ width: 0, height: 0 });
    });
  });

  describe("expandRect", () => {
    it("expands rectangle by margin on all sides", () => {
      const rect: Rect = { left: 10, top: 10, right: 20, bottom: 20 };
      const expanded = expandRect(rect, 5);

      expect(expanded.left).toBe(5);
      expect(expanded.top).toBe(5);
      expect(expanded.right).toBe(25);
      expect(expanded.bottom).toBe(25);
    });

    it("handles negative margin (shrink)", () => {
      const rect: Rect = { left: 0, top: 0, right: 100, bottom: 100 };
      const shrunk = expandRect(rect, -10);

      expect(shrunk.left).toBe(10);
      expect(shrunk.top).toBe(10);
      expect(shrunk.right).toBe(90);
      expect(shrunk.bottom).toBe(90);
    });
  });

  describe("boundingBoxFromPoints", () => {
    it("creates bounding box from multiple points", () => {
      const points: Point[] = [
        { x: 10, y: 20 },
        { x: 50, y: 5 },
        { x: 30, y: 40 }
      ];
      const result = boundingBoxFromPoints(points);

      expect(result).toEqual({ left: 10, top: 5, right: 50, bottom: 40 });
    });

    it("handles single point", () => {
      const points: Point[] = [{ x: 10, y: 20 }];
      const result = boundingBoxFromPoints(points);

      expect(result).toEqual({ left: 10, top: 20, right: 10, bottom: 20 });
    });

    it("returns null for empty array", () => {
      const result = boundingBoxFromPoints([]);
      expect(result).toBeNull();
    });
  });

  describe("mergeRects", () => {
    it("merges multiple rectangles into bounding box", () => {
      const rects: Rect[] = [
        { left: 0, top: 0, right: 50, bottom: 50 },
        { left: 40, top: 40, right: 100, bottom: 100 }
      ];
      const result = mergeRects(rects);

      expect(result).toEqual({ left: 0, top: 0, right: 100, bottom: 100 });
    });

    it("returns null for empty array", () => {
      const result = mergeRects([]);
      expect(result).toBeNull();
    });

    it("returns same rect for single-element array", () => {
      const rect: Rect = { left: 10, top: 20, right: 30, bottom: 40 };
      const result = mergeRects([rect]);

      expect(result).toEqual(rect);
    });
  });

  describe("createConnectionGradient", () => {
    it("creates gradient with specified ID", () => {
      const gradient = createConnectionGradient(
        "test-gradient",
        { x: 0, y: 0 },
        { x: 100, y: 50 }
      );

      expect(gradient.id).toBe("test-gradient");
    });

    it("uses source and target as gradient endpoints", () => {
      const source: Point = { x: 10, y: 20 };
      const target: Point = { x: 100, y: 80 };

      const gradient = createConnectionGradient("g", source, target);

      expect(gradient.x1).toBe(10);
      expect(gradient.y1).toBe(20);
      expect(gradient.x2).toBe(100);
      expect(gradient.y2).toBe(80);
    });

    it("creates four stops with breathing room", () => {
      const gradient = createConnectionGradient(
        "g",
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      );

      expect(gradient.stops).toHaveLength(4);
      expect(gradient.stops[0].offset).toBe("0%");
      expect(gradient.stops[1].offset).toBe("10%");
      expect(gradient.stops[2].offset).toBe("90%");
      expect(gradient.stops[3].offset).toBe("100%");
    });

    it("uses default colors (blue to green)", () => {
      const gradient = createConnectionGradient(
        "g",
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      );

      // Default source is sky-400 blue
      expect(gradient.stops[0].color).toBe("#38bdf8");
      // Default target is emerald-400 green
      expect(gradient.stops[3].color).toBe("#34d399");
    });

    it("allows custom colors", () => {
      const gradient = createConnectionGradient(
        "g",
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        "#ff0000",
        "#00ff00"
      );

      expect(gradient.stops[0].color).toBe("#ff0000");
      expect(gradient.stops[3].color).toBe("#00ff00");
    });
  });

  describe("DEFAULT_BEZIER_TUNING", () => {
    it("has sensible default values", () => {
      expect(DEFAULT_BEZIER_TUNING.stubFactor).toBeGreaterThan(0);
      expect(DEFAULT_BEZIER_TUNING.stubFactor).toBeLessThan(1);
      expect(DEFAULT_BEZIER_TUNING.stubMin).toBeGreaterThan(0);
      expect(DEFAULT_BEZIER_TUNING.stubMaxOffset).toBeGreaterThan(0);
      expect(DEFAULT_BEZIER_TUNING.verticalOffset).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_BEZIER_TUNING.verticalOffset).toBeLessThan(1);
    });
  });

  describe("DEFAULT_SELF_LOOP_PARAMS", () => {
    it("has sensible default values", () => {
      expect(DEFAULT_SELF_LOOP_PARAMS.stubLength).toBeGreaterThan(0);
      expect(DEFAULT_SELF_LOOP_PARAMS.curlAmount).toBeGreaterThan(0);
      expect(DEFAULT_SELF_LOOP_PARAMS.baseWidth).toBeGreaterThan(0);
      expect(DEFAULT_SELF_LOOP_PARAMS.taper).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_SELF_LOOP_PARAMS.taper).toBeLessThanOrEqual(1);
      expect(DEFAULT_SELF_LOOP_PARAMS.pinRadius).toBeGreaterThan(0);
    });
  });

  describe("Integration: Multi-hop Path Workflow", () => {
    it("produces composable paths for multi-hop scenario", () => {
      const positions: Point[] = [
        { x: 0, y: 100 },
        { x: 200, y: 120 },
        { x: 400, y: 80 },
        { x: 600, y: 140 }
      ];

      const paths: PathResult[] = [];
      for (let i = 0; i < positions.length - 1; i++) {
        paths.push(computeBezierPath(positions[i], positions[i + 1], DEFAULT_BEZIER_TUNING));
      }

      paths.forEach(path => {
        expect(path.d).toBeTruthy();
        expect(path.approximateLength).toBeGreaterThan(0);
      });

      const totalLength = paths.reduce((sum, p) => sum + p.approximateLength, 0);
      expect(totalLength).toBeGreaterThan(500);
    });

    it("handles mixed connection types in same layout", () => {
      const regularPath = computeBezierPath(
        { x: 100, y: 100 },
        { x: 300, y: 150 },
        DEFAULT_BEZIER_TUNING
      );

      const selfLoop = computeSelfLoopStubs(
        { x: 150, y: 100 },
        { x: 150, y: 150 },
        DEFAULT_SELF_LOOP_PARAMS
      );

      expect(regularPath.d).toBeTruthy();
      expect(selfLoop.providerPoints).toBeTruthy();
      expect(selfLoop.consumerPoints).toBeTruthy();
    });
  });
});
