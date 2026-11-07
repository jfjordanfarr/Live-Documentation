import { describe, expect, it } from "vitest";

import { dotRoom, HIGHLIGHT_BELOW, layoutTopOf, nameFill, nameWraps, rowsBeforeFirstPin } from "./ladder-rooms";

describe("nameFill", () => {
  it("lets a name grow about its row's top until it and its highlight reach the row's bottom", () => {
    // A two-line slot's row, 66 px, its name 12 px tall from 2.5 px below the row's top: 64 / 14.5.
    expect(nameFill(66, 2.5, 12)).toBeCloseTo(64 / 14.5, 10);
    const scale = nameFill(66, 2.5, 12);
    expect((2.5 + 12) * scale + HIGHLIGHT_BELOW).toBeCloseTo(66, 10);
  });

  it("never asks a name to shrink, and holds nothing in a row it cannot measure", () => {
    // Internals' row is barely taller than its name.
    expect(nameFill(15, 3.5, 12)).toBe(1);
    expect(nameFill(0, 2, 12)).toBe(1);
    expect(nameFill(66, 0, 0)).toBe(1);
    expect(nameFill(Number.NaN, 2, 12)).toBe(1);
  });
});

describe("nameWraps", () => {
  it("knows a wrapped name in the reading band by its lines and in the far bands by its overflow", () => {
    expect(nameWraps(2, 120, 130)).toBe(true);
    expect(nameWraps(1, 180, 130)).toBe(true);
    expect(nameWraps(1, 128.4, 129)).toBe(false);
    // Sub-pixel noise in a name that just fits is not a wrap.
    expect(nameWraps(1, 129.3, 129)).toBe(false);
  });
});

describe("dotRoom", () => {
  it("bounds a use-dot by the room to its card's left edge and an offer-dot by the room to its right", () => {
    // The 284 px card of the far-zoom review: a 14 px dot 14 px in from each inner edge.
    expect(dotRoom({ left: 15, right: 29, direction: "inbound" }, 1, 283)).toBe(2);
    expect(dotRoom({ left: 255, right: 269, direction: "outbound" }, 1, 283)).toBe(2);
    expect(dotRoom({ left: 255, right: 269, direction: "outbound" }, 1, 276)).toBe(1.5);
  });

  it("lets a dot with no room follow the map, and a dot it cannot measure hold nothing", () => {
    expect(dotRoom({ left: 15, right: 29, direction: "inbound" }, 20, 283)).toBe(1);
    expect(dotRoom({ left: 15, right: 15, direction: "inbound" }, 1, 283)).toBe(1);
  });
});

describe("layoutTopOf", () => {
  it("undoes a shift and a scale about the element's centre", () => {
    // A 14 px dot laid out at 1.5 px, drawn twice its size and 12 px lower: drawn from 1.5 + 12 - 7 = 6.5.
    expect(layoutTopOf(6.5, 14, 12, 2)).toBeCloseTo(1.5, 10);
    expect(layoutTopOf(1.5, 14, 0, 1)).toBe(1.5);
  });
});

describe("rowsBeforeFirstPin", () => {
  it("counts the shown rows above the first pinned one, skipping hidden rows", () => {
    expect(rowsBeforeFirstPin([{ shown: true, pinned: false }, { shown: false, pinned: false }, { shown: true, pinned: false }, { shown: true, pinned: true }])).toBe(2);
    expect(rowsBeforeFirstPin([{ shown: true, pinned: true }, { shown: true, pinned: true }])).toBe(0);
  });

  it("says nothing when no shown row is pinned", () => {
    expect(rowsBeforeFirstPin([])).toBeNull();
    expect(rowsBeforeFirstPin([{ shown: true, pinned: false }, { shown: false, pinned: true }])).toBeNull();
  });
});
