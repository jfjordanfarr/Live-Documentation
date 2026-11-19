import { describe, expect, it } from "vitest";

import { compareText } from "./compareText";

describe("compareText", () => {
  it("sorts alphabetically without regard to case, then capitals first, and everything else by code unit", () => {
    const names = ["paymentStatus", "PaymentsEnabledHidden", "paymentForm", "b", "B", "a", "_private", "$", "10", "9", "é", "z"];
    expect([...names].sort(compareText)).toEqual(["$", "10", "9", "_private", "a", "B", "b", "paymentForm", "PaymentsEnabledHidden", "paymentStatus", "z", "é"]);
  });

  it("calls two texts the same only when they are", () => {
    expect(compareText("Model", "Model")).toBe(0);
    expect(compareText("Model", "model")).toBeLessThan(0);
    expect(compareText("model", "Model")).toBeGreaterThan(0);
  });
});
