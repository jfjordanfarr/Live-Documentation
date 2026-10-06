import { describe, expect, it } from "vitest";

import type { Capture } from "./capture";
import { chipsHeight, resolvePin, synthesizedHeight, type CardMetrics } from "./card-model";
import { insidePolygon } from "./signals";

describe("the lab's card model, the parts that need no page", () => {
  it("wraps a row of chips as a flex row does: a line as tall as its tallest chip, the lines a gap apart", () => {
    const chips = [{ width: 40, height: 14 }, { width: 100, height: 18 }, { width: 100, height: 18 }, { width: 30, height: 18 }];
    // All on one line at 300 wide: 40 + 6 + 100 + 6 + 100 + 6 + 30 = 288.
    expect(chipsHeight(chips, 300, 6)).toBe(18);
    // At 200 wide the third chip starts a new line, and the fourth fits beside it.
    expect(chipsHeight(chips, 200, 6)).toBe(18 + 6 + 18);
    // A chip wider than the row still takes a line of its own.
    expect(chipsHeight(chips, 50, 6)).toBe(14 + 6 + 18 + 6 + 18 + 6 + 18);
  });

  it("sets a text the page never showed from its glyphs' widths, one line until its words overflow", () => {
    const capture = { fonts: { note: { font: "11px sans-serif", letterSpacing: 0, lineHeight: 13, glyphs: { " ": 3, "+": 6, "1": 6, "2": 6, s: 5, y: 5, m: 8, b: 6, o: 6, l: 3 } } } } as unknown as Capture;
    const height = synthesizedHeight(capture, "note", "+12 symbols");
    // "+12" is 18 wide, "symbols" 38; with the space, 59.
    expect(height(100)).toBe(13);
    expect(height(50)).toBe(26);
  });

  it("resolves a wire's pin as the page's registry does: the row by name or normalized name, else the direction's default, else the middle", () => {
    const metrics: CardMetrics = { height: 100, pins: new Map([["inbound:Foo", 20], ["outbound:Foo", 20], ["inbound:foo", 20], ["outbound:foo", 20], ["inbound:__internals__", 80], ["inbound:*", 80], ["outbound:*", 50]]), rowKeys: new Set(["inbound:Foo", "outbound:Foo", "inbound:foo", "outbound:foo", "inbound:__internals__", "inbound:*"]), hiddenKeys: new Set(["inbound:Bar", "outbound:Bar", "inbound:bar", "outbound:bar"]) };
    expect(resolvePin(metrics, "inbound", "Foo")).toEqual({ offset: 20, key: "inbound:Foo" });
    // A call's parentheses normalize away, and the normalized name is the key the page registered beside the raw one.
    expect(resolvePin(metrics, "outbound", "Foo()")).toEqual({ offset: 20, key: "outbound:foo" });
    expect(resolvePin(metrics, "inbound", undefined)).toEqual({ offset: 80, key: "inbound:*" });
    expect(resolvePin(metrics, "outbound", "Missing")).toEqual({ offset: 50, key: "outbound:*" });
    // A collapsed row's pin is known but unreachable: the page places no wire to it.
    expect(resolvePin(metrics, "inbound", "Bar")).toEqual({ offset: null, key: "inbound:Bar" });
    expect(resolvePin({ height: 100, pins: new Map(), rowKeys: new Set(), hiddenKeys: new Set() }, "inbound", "x")).toEqual({ offset: 50, key: null });
  });

  it("tells a point inside a stepped membrane from one outside, by the even-odd rule", () => {
    const polygon = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 100 }, { x: 0, y: 100 }];
    expect(insidePolygon(polygon, 50, 25)).toBe(true);
    expect(insidePolygon(polygon, 150, 25)).toBe(false);
    expect(insidePolygon(polygon, 150, 75)).toBe(true);
    expect(insidePolygon(polygon, 250, 75)).toBe(false);
  });
});
