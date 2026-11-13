import { describe, expect, it } from "vitest";

import { dotRoom, footHold, HIGHLIGHT_BELOW, layoutTopOf, nameFill, nameLinesHeld, nameWraps, rowsBeforeFirstPin } from "./ladder-rooms";
import { LOOK_SCALES } from "./ladder-steps";

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

describe("nameLinesHeld", () => {
  it("gives a name the lines its row holds below it at a held scale: two in a two-line slot's row in the connections look", () => {
    // The measured row of 2026-11-13: 66 px, the name's line 12 px from 2.5 px below the row's top. At the connections
    // look's 2.2 two lines end at 58.3 px, inside the row with the highlight's air; three would end at 84.7 px.
    expect(nameLinesHeld(66, 2.5, 12, LOOK_SCALES.connections)).toBe(2);
    const two = (2.5 + 2 * 12) * LOOK_SCALES.connections + HIGHLIGHT_BELOW;
    expect(two).toBeLessThanOrEqual(66);
    // The overview look's 3.6 holds one, as does a one-line slot's row (32 + 17 px) at 2.2.
    expect(nameLinesHeld(66, 2.5, 12, LOOK_SCALES.overview)).toBe(1);
    expect(nameLinesHeld(49, 2.5, 12, LOOK_SCALES.connections)).toBe(1);
    // A three-line slot's row (32 + 3 × 17 px) holds two; four lines' (100 px) three. Following the map, five.
    expect(nameLinesHeld(83, 2.5, 12, LOOK_SCALES.connections)).toBe(2);
    expect(nameLinesHeld(100, 2.5, 12, LOOK_SCALES.connections)).toBe(3);
    expect(nameLinesHeld(66, 2.5, 12, 1)).toBe(5);
  });

  it("never erases a name: one line where the row holds less, or cannot be measured", () => {
    expect(nameLinesHeld(15, 3.5, 12, 2.2)).toBe(1);
    expect(nameLinesHeld(0, 2.5, 12, 2.2)).toBe(1);
    expect(nameLinesHeld(66, 2.5, 0, 2.2)).toBe(1);
    expect(nameLinesHeld(66, 2.5, 12, Number.NaN)).toBe(1);
  });
});

describe("footHold", () => {
  // The foot of `documentationLinks.ts` with `scripts/doc-tools` opened, as measured on 2026-11-13 in map units from the
  // card's top and left: "+14 symbols" from 163 to 175, the framed "+16 connections" from 183 to 195, both from 13 across,
  // the card's content ending at 372; its file's name, from 13, held on one line at the connections look (33).
  const counts = [{ top: 163, bottom: 175, left: 13, width: 62.1 }, { top: 183, bottom: 195, left: 13, width: 107.4 }];

  it("holds the counts at the connections look's scale about the last one's foot where a card that draws no row has room", () => {
    const hold = footHold(counts, 13 + 33, 372, LOOK_SCALES.connections, 3, 4);
    expect(hold.held).toBe(true);
    expect(hold.above).toEqual([20, 0]);
    // Lifted by its distance above the foot times the growth, the first stands clear above the second as it is held.
    const firstBottom = 175 - 20 * (LOOK_SCALES.connections - 1), secondTop = 195 - (195 - 183) * LOOK_SCALES.connections;
    expect(firstBottom).toBeLessThan(secondTop);
  });

  it("draws none where they do not all fit at that scale, below what stands above them or across the card", () => {
    // Drawn rows ending at 140: the room is 51 units for a group of 35, its frame included, 77 at 2.2.
    expect(footHold(counts, 140, 372, LOOK_SCALES.connections, 3, 4).held).toBe(false);
    // A card whose content ends at 240 holds "+16 connections" (236 units at 2.2) from 13 no more.
    expect(footHold(counts, 46, 240, LOOK_SCALES.connections, 3, 4).held).toBe(false);
    expect(footHold([], 46, 372, LOOK_SCALES.connections, 3, 4)).toEqual({ held: false, above: [] });
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
