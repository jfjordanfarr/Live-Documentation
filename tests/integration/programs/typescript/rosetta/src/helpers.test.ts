/**
 * Unit tests for the helpers module.
 * 
 * This test file exercises name-matched test detection:
 * helpers.test.ts should automatically back helpers.ts.
 */

import { format, sum, average } from "./helpers";

describe("helpers", () => {
  describe("format", () => {
    it("formats numbers with two decimal places", () => {
      expect(format(100)).toBe("100.00");
      expect(format(3.14159)).toBe("3.14");
      expect(format(0)).toBe("0.00");
    });
  });

  describe("sum", () => {
    it("sums an array of numbers", () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([100, 200, 300])).toBe(600);
    });

    it("returns 0 for empty array", () => {
      expect(sum([])).toBe(0);
    });
  });

  describe("average", () => {
    it("calculates average of numbers", () => {
      expect(average([10, 20, 30])).toBe(20);
      expect(average([100])).toBe(100);
    });

    it("returns 0 for empty array", () => {
      expect(average([])).toBe(0);
    });
  });
});
