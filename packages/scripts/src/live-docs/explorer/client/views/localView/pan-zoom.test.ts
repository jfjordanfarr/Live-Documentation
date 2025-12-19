/**
 * Unit tests for pan-zoom pure functions.
 *
 * Tests cover the mathematical computations for zoom, clamping, and easing
 * without requiring DOM or runtime dependencies.
 */

import { describe, expect, it } from "vitest";
import { clamp, easeOutCubic, zoomAtPoint } from "./pan-zoom";
import type { LocalViewRuntime } from "./runtime";
import type { MapTransform } from "./types";

describe("pan-zoom", () => {
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

  describe("easeOutCubic", () => {
    it("returns 0 at t=0", () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    it("returns 1 at t=1", () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    it("decelerates over time (derivative decreases)", () => {
      // Cubic ease-out should accelerate quickly then slow down
      // Check that values grow faster in first half than second half
      const quarter = easeOutCubic(0.25);
      const half = easeOutCubic(0.5);
      const threeQuarter = easeOutCubic(0.75);

      // First quarter should cover more distance than last quarter
      const firstQuarterDistance = quarter;
      const lastQuarterDistance = 1 - threeQuarter;
      expect(firstQuarterDistance).toBeGreaterThan(lastQuarterDistance);

      // Value should be monotonically increasing
      expect(quarter).toBeGreaterThan(0);
      expect(half).toBeGreaterThan(quarter);
      expect(threeQuarter).toBeGreaterThan(half);
    });

    it("passes through midpoint above 0.5 (ease-out characteristic)", () => {
      // Ease-out starts fast, so at t=0.5 we should be more than halfway
      const half = easeOutCubic(0.5);
      expect(half).toBeGreaterThan(0.5);
    });

    it("handles values outside 0-1 range", () => {
      // The formula still works mathematically, even if not intended use
      expect(easeOutCubic(-0.5)).toBeLessThan(0);
      expect(easeOutCubic(1.5)).toBeGreaterThan(1);
    });
  });

  describe("zoomAtPoint", () => {
    /**
     * Creates a minimal mock runtime for testing zoom calculations.
     */
    function createMockRuntime(initialTransform: MapTransform): {
      runtime: LocalViewRuntime;
      getTransform: () => MapTransform;
    } {
      let currentTransform = { ...initialTransform };

      const runtime = {} as LocalViewRuntime;

      // Use defineProperty to set up getter/setter for mapTransform
      Object.defineProperty(runtime, "mapTransform", {
        get: () => currentTransform,
        set: (t: MapTransform) => {
          currentTransform = t;
        },
        enumerable: true,
        configurable: true
      });

      return {
        runtime,
        getTransform: () => currentTransform
      };
    }

    it("zooms in with positive delta", () => {
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 1 });
      let callbackCalled = false;

      zoomAtPoint(runtime, 100, 100, 0.5, () => {
        callbackCalled = true;
      });

      const newTransform = getTransform();
      expect(newTransform.k).toBeGreaterThan(1);
      expect(callbackCalled).toBe(true);
    });

    it("zooms out with negative delta", () => {
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 1 });

      zoomAtPoint(runtime, 100, 100, -0.5, () => {});

      const newTransform = getTransform();
      expect(newTransform.k).toBeLessThan(1);
    });

    it("clamps zoom level to minimum 0.4", () => {
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 0.5 });

      // Large negative delta should hit the floor
      zoomAtPoint(runtime, 100, 100, -10, () => {});

      expect(getTransform().k).toBe(0.4);
    });

    it("clamps zoom level to maximum 3", () => {
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 2.5 });

      // Large positive delta should hit the ceiling
      zoomAtPoint(runtime, 100, 100, 10, () => {});

      expect(getTransform().k).toBe(3);
    });

    it("zooms centered on the specified point", () => {
      // Zooming at the transform origin (0,0) should not change x,y
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 1 });

      zoomAtPoint(runtime, 0, 0, 0.5, () => {});

      const t = getTransform();
      // At origin, zooming should keep x,y at 0
      expect(t.x).toBeCloseTo(0, 5);
      expect(t.y).toBeCloseTo(0, 5);
    });

    it("preserves point under cursor after zoom", () => {
      // When zooming at point (100, 100), that point should remain fixed
      const { runtime, getTransform } = createMockRuntime({ x: 0, y: 0, k: 1 });

      // Point in local coordinates before zoom
      const pointX = 100;
      const pointY = 100;
      const localXBefore = (pointX - 0) / 1; // = 100
      const localYBefore = (pointY - 0) / 1; // = 100

      zoomAtPoint(runtime, pointX, pointY, 0.5, () => {});

      const t = getTransform();
      // After zoom, the same point should map to the same local coordinates
      const localXAfter = (pointX - t.x) / t.k;
      const localYAfter = (pointY - t.y) / t.k;

      expect(localXAfter).toBeCloseTo(localXBefore, 5);
      expect(localYAfter).toBeCloseTo(localYBefore, 5);
    });

    it("handles off-center initial transform", () => {
      const { runtime, getTransform } = createMockRuntime({ x: 50, y: 30, k: 1.5 });

      zoomAtPoint(runtime, 200, 150, 0.3, () => {});

      const t = getTransform();
      // Verify the zoom happened
      expect(t.k).toBeGreaterThan(1.5);
      // The point (200, 150) in viewport coords should still map to the same local coords
      const localXBefore = (200 - 50) / 1.5;
      const localYBefore = (150 - 30) / 1.5;
      const localXAfter = (200 - t.x) / t.k;
      const localYAfter = (150 - t.y) / t.k;
      expect(localXAfter).toBeCloseTo(localXBefore, 5);
      expect(localYAfter).toBeCloseTo(localYBefore, 5);
    });
  });
});
