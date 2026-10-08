/**
 * Unit tests for layout-measure pure functions.
 *
 * Tests cover the mathematical computations for layout bounds,
 * transform fitting, and alignment calculations.
 *
 * Note: DOM-dependent functions like measureElementsBounds require jsdom/happy-dom
 * and are tested via integration tests. These unit tests focus on the pure
 * mathematical logic.
 */

import { describe, expect, it } from "vitest";

import { clamp, computeFitTransform, computePathFitTransform, type Bounds, type LayoutExtents } from "./layout-measure";

describe("layout-measure", () => {
  describe("computePathFitTransform", () => {
    const frame = { width: 1340, height: 880 } as DOMRect;
    const bounds = (left: number, top: number, width: number, height: number): Bounds =>
      ({ left, top, width, height, right: left + width, bottom: top + height });

    it("centres a path that fits the frame, at reading size", () => {
      const transform = computePathFitTransform(bounds(40, 20, 1000, 200), frame);
      expect(transform.k).toBe(1);
      expect(transform.x + 40 + 500).toBeCloseTo(670);
      expect(transform.y + 20 + 100).toBeCloseTo(440);
    });

    it("puts the first file at the left edge when the path is wider than the frame", () => {
      const transform = computePathFitTransform(bounds(40, 20, 1700, 200), frame);
      expect(transform.k).toBe(1);
      // the content's left lands one padding (2% of the frame, 26.8 px) inside the frame
      expect(transform.x + 40).toBeCloseTo(26.8);
      expect(transform.y + 20 + 100).toBeCloseTo(440);
    });

    it("never shrinks the text to make the path fit", () => {
      expect(computePathFitTransform(bounds(0, 0, 4000, 200), frame).k).toBe(1);
    });
  });

  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("clamps to minimum when below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    it("clamps to maximum when above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(1000, 0, 10)).toBe(10);
    });

    it("handles floating point values", () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(-0.1, 0, 1)).toBe(0);
      expect(clamp(1.1, 0, 1)).toBe(1);
    });

    it("handles negative ranges", () => {
      expect(clamp(-5, -10, -2)).toBe(-5);
      expect(clamp(-15, -10, -2)).toBe(-10);
      expect(clamp(0, -10, -2)).toBe(-2);
    });

    it("handles equal min and max", () => {
      expect(clamp(5, 3, 3)).toBe(3);
      expect(clamp(0, 3, 3)).toBe(3);
    });
  });

  describe("computeFitTransform", () => {
    /**
     * Creates a Bounds object for testing.
     */
    function createBounds(
      left: number,
      top: number,
      width: number,
      height: number
    ): Bounds {
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height
      };
    }

    /**
     * Creates a mock DOMRect for testing.
     */
    function createViewportRect(width: number, height: number): DOMRect {
      return {
        x: 0,
        y: 0,
        width,
        height,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
        toJSON: () => ({})
      };
    }

    it("scales content to fit within viewport", () => {
      // Content is 1000x1000, viewport is 500x500
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 1000, 1000),
        focus: null
      };
      const viewport = createViewportRect(500, 500);

      const transform = computeFitTransform(extents, viewport);

      // Scale should be less than 1 to fit large content in small viewport
      expect(transform.k).toBeLessThan(1);
      expect(transform.k).toBeGreaterThan(0);
    });

    it("keeps a picture that fits wholly in the frame when the focus stands at its edge, and keeps the frame full when it does not", () => {
      const viewport = createViewportRect(1540, 1030);
      // A 1200 by 560 picture with its focus at the left edge: centred on the focus, the right 400 px would be cut.
      const fits: LayoutExtents = { content: createBounds(0, 0, 1200, 560), focus: createBounds(0, 0, 300, 150) };
      const framed = computeFitTransform(fits, viewport, { minScale: 1 });
      expect(framed.k).toBe(1);
      expect(framed.x + 1200).toBeLessThanOrEqual(1540);
      expect(framed.x).toBeGreaterThanOrEqual(0);
      expect(framed.y + 560).toBeLessThanOrEqual(1030);
      // A picture wider than the frame, focused at its left edge: the frame starts at the picture's left edge, no gap.
      const wide: LayoutExtents = { content: createBounds(0, 0, 3000, 560), focus: createBounds(0, 0, 300, 150) };
      const cut = computeFitTransform(wide, viewport, { minScale: 1 });
      expect(cut.k).toBe(1);
      expect(cut.x).toBeLessThanOrEqual(72);
      expect(cut.x + 3000).toBeGreaterThanOrEqual(1540 - 72);
    });

    it("respects minimum scale constraint", () => {
      // Very large content relative to viewport
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 10000, 10000),
        focus: null
      };
      const viewport = createViewportRect(100, 100);

      const transform = computeFitTransform(extents, viewport, { minScale: 0.5 });

      expect(transform.k).toBeGreaterThanOrEqual(0.5);
    });

    it("respects maximum scale constraint", () => {
      // Small content relative to viewport
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 50, 50),
        focus: null
      };
      const viewport = createViewportRect(1000, 1000);

      const transform = computeFitTransform(extents, viewport, { maxScale: 1.0 });

      expect(transform.k).toBeLessThanOrEqual(1.0);
    });

    it("centers content horizontally and vertically", () => {
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 400, 400),
        focus: null
      };
      const viewport = createViewportRect(800, 800);

      const transform = computeFitTransform(extents, viewport);

      // At scale 1, content center (200, 200) should map to viewport center (400, 400)
      // So transform.x should be around 400 - 200*k = something that centers content
      // The exact value depends on padding, but it should be positive
      expect(transform.x).toBeGreaterThan(0);
      expect(transform.y).toBeGreaterThan(0);
    });

    it("uses focus element for centering when provided", () => {
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 2000, 500),
        focus: createBounds(1500, 100, 200, 200) // Focus on right side
      };
      const viewport = createViewportRect(800, 600);

      const transform = computeFitTransform(extents, viewport);

      // With focus on the right side, the transform.x should be more negative
      // to bring the focus element into view
      // We don't know exact values but can verify the transform is valid
      expect(typeof transform.x).toBe("number");
      expect(typeof transform.y).toBe("number");
      expect(transform.k).toBeGreaterThan(0);
    });

    it("handles very narrow content (width < height)", () => {
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 100, 1000),
        focus: null
      };
      const viewport = createViewportRect(800, 600);

      const transform = computeFitTransform(extents, viewport);

      // Height-constrained: scale should be based on height fitting
      expect(transform.k).toBeLessThan(1);
      expect(transform.k).toBeGreaterThan(0);
    });

    it("handles very wide content (width > height)", () => {
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 2000, 200),
        focus: null
      };
      const viewport = createViewportRect(800, 600);

      const transform = computeFitTransform(extents, viewport);

      // Width-constrained: scale should be based on width fitting
      expect(transform.k).toBeLessThan(1);
      expect(transform.k).toBeGreaterThan(0);
    });

    it("handles content not starting at origin", () => {
      const extents: LayoutExtents = {
        content: createBounds(500, 300, 400, 400),
        focus: null
      };
      const viewport = createViewportRect(800, 800);

      const transform = computeFitTransform(extents, viewport);

      // Should still compute valid transform that brings content into view
      expect(typeof transform.x).toBe("number");
      expect(typeof transform.y).toBe("number");
      expect(transform.k).toBeGreaterThan(0);
    });

    it("handles zero-size content gracefully", () => {
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 0, 0),
        focus: null
      };
      const viewport = createViewportRect(800, 600);

      // Should not throw or return NaN
      const transform = computeFitTransform(extents, viewport);

      expect(Number.isFinite(transform.x)).toBe(true);
      expect(Number.isFinite(transform.y)).toBe(true);
      expect(Number.isFinite(transform.k)).toBe(true);
    });

    it("applies 96% scaling factor for visual breathing room", () => {
      // Content and viewport same size
      const extents: LayoutExtents = {
        content: createBounds(0, 0, 800, 600),
        focus: null
      };
      const viewport = createViewportRect(800, 600);

      const transform = computeFitTransform(extents, viewport);

      // Due to the 0.96 factor and padding, scale should be less than 1
      expect(transform.k).toBeLessThan(1);
    });

    it("produces consistent results for same inputs", () => {
      const extents: LayoutExtents = {
        content: createBounds(100, 50, 600, 400),
        focus: createBounds(200, 100, 200, 200)
      };
      const viewport = createViewportRect(1024, 768);

      const transform1 = computeFitTransform(extents, viewport);
      const transform2 = computeFitTransform(extents, viewport);

      expect(transform1.x).toBe(transform2.x);
      expect(transform1.y).toBe(transform2.y);
      expect(transform1.k).toBe(transform2.k);
    });
  });
});
