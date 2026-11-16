import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { dotRoom, evenRows, FILE_KEPT_AIR, fileLineRoom, fitKept, fitLines, footHold, HEAD_SPACE, headHeight, HIGHLIGHT_BELOW, layoutTopOf, linesOf, NAME_LINE, nameFill, nameLinesHeld, nameWraps, pinDepth, ROW_MORE, rowsBeforeFirstPin, shortRowHeight } from "./ladder-rooms";
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

describe("shortRowHeight", () => {
  it("is the row's head at the connections look, More held there beside one line of its name, with the highlight's air and the space before the next head", () => {
    // More 17 × 2.2 = 37.4 is taller than the name's line ((17 + 12.65) / 2 × 2.2 = 32.6); 37.4 + 2 + 4 = 43.4.
    expect(shortRowHeight(LOOK_SCALES.connections)).toBe(44);
    const head = headHeight({ nameTop: (ROW_MORE - NAME_LINE) / 2, line: NAME_LINE, moreTop: 0, moreHeight: ROW_MORE }, 1, LOOK_SCALES.connections);
    expect(head + HEAD_SPACE).toBeLessThanOrEqual(shortRowHeight(LOOK_SCALES.connections));
  });

  it("is the height the stylesheet states for a short row", () => {
    const css = readFileSync(path.resolve(__dirname, "../../styles/reading.css"), "utf8");
    const stated = /\.symbol-row\.local-row-short:not\(\.internals-row\) \{ height: (\d+)px; \}/u.exec(css);
    expect(Number(stated?.[1])).toBe(shortRowHeight(LOOK_SCALES.connections));
  });
});

describe("headHeight", () => {
  const at = { nameTop: 2.18, line: 12.65, moreTop: 0, moreHeight: 17 };
  it("is the taller of More held at the scale and the name's lines held about the row's top, with the highlight's air", () => {
    expect(headHeight(at, 1, 2.2)).toBeCloseTo(17 * 2.2 + 2, 6);
    expect(headHeight(at, 2, 2.2)).toBeCloseTo((2.18 + 2 * 12.65) * 2.2 + 2, 6);
  });
});

describe("evenRows", () => {
  it("spaces the heads evenly over the rows' room, each head as tall as it needs and the same space after each", () => {
    // The estate's PaymentService pinned: its class's row of 66 with a name on two lines (head 62.5), Post and Get short
    // rows of 44 (heads 39.4), gaps of 6: the rows span 166, one more gap 172, the heads 141.3, so 10.23 after each.
    const rows = [{ top: 0, height: 66, head: 62.5 }, { top: 72, height: 44, head: 39.4 }, { top: 122, height: 44, head: 39.4 }];
    const placed = evenRows(rows, 6);
    const space = (172 - 141.3) / 3;
    expect(placed.map(each => each.height)).toEqual([62.5, 39.4, 39.4].map(head => expect.closeTo(head + space - 6, 6)));
    expect(placed[0].shift).toBeCloseTo(0, 6);
    expect(placed[1].shift).toBeCloseTo(62.5 + space - 72, 6);
    expect(placed[2].shift).toBeCloseTo(62.5 + 39.4 + 2 * space - 122, 6);
    // The gaps between one head's bottom and the next head's top are the same.
    const tops = rows.map((row, index) => row.top + placed[index].shift);
    expect(tops[1] - (tops[0] + 62.5)).toBeCloseTo(tops[2] - (tops[1] + 39.4), 6);
  });

  it("moves nothing where every row is of one height, whatever its head, and nothing at all for no rows", () => {
    const rows = [{ top: 0, height: 66, head: 50 }, { top: 72, height: 66, head: 50 }, { top: 144, height: 66, head: 30 }];
    expect(evenRows(rows.slice(0, 2), 6).map(each => Number(each.shift.toFixed(6)))).toEqual([0, 0]);
    expect(evenRows(rows.slice(0, 2), 6).map(each => Number(each.height.toFixed(6)))).toEqual([66, 66]);
    expect(evenRows([], 6)).toEqual([]);
  });
});

describe("fitLines", () => {
  const head = (_: number, lines: number): number => 20 + 30 * lines;
  it("gives each name the lines it wants while the heads fit, then one fewer from the name that takes most", () => {
    expect(fitLines([2, 1, 2], head, 500)).toEqual([2, 1, 2]);
    // 80 + 50 + 80 = 210 > 190: the later of the two-line names gives one up.
    expect(fitLines([2, 1, 2], head, 190)).toEqual([2, 1, 1]);
    expect(fitLines([2, 1, 2], head, 10)).toEqual([1, 1, 1]);
  });
});

describe("fitKept, the Descriptions Zoomed Out trial (2026-11-13)", () => {
  // Each line of a head is 30 units, as a name's line held at the connections look nearly is.
  const head = (_: number, lines: number, kept: boolean): number => 30 * (lines + (kept ? 1 : 0));

  it("keeps a first line only under a described name that takes one line, as part of its head", () => {
    const fit = fitKept([1, 2, 1, 1], [true, true, false, true], head, 1000);
    expect(fit.kept).toEqual([true, false, false, true]);
    expect(fit.lines).toEqual([1, 2, 1, 1]);
  });

  it("gives kept lines up, the last first, before any name gives up a line", () => {
    // Without kept lines the heads are 150; each kept line adds 30.
    expect(fitKept([1, 2, 1, 1], [true, true, true, true], head, 200)).toEqual({ lines: [1, 2, 1, 1], kept: [true, false, false, false] });
    expect(fitKept([1, 2, 1, 1], [true, true, true, true], head, 150)).toEqual({ lines: [1, 2, 1, 1], kept: [false, false, false, false] });
    // Only when none is left does a name lose a line, as fitLines has it.
    expect(fitKept([1, 2, 1, 1], [true, true, true, true], head, 120)).toEqual({ lines: [1, 1, 1, 1], kept: [false, false, false, false] });
  });

  it("keeps nothing where nothing is described", () => {
    expect(fitKept([1, 1], [false, false], head, 1000)).toEqual({ lines: [1, 1], kept: [false, false] });
  });
});

describe("pinDepth", () => {
  const rows = [
    { shown: true, pinned: false, height: 66, head: 62.5 },
    { shown: false, pinned: false, height: 0 },
    { shown: true, pinned: false, height: 44, head: 39.4 },
    { shown: true, pinned: true, height: 44, head: 39.4 }
  ];
  it("finds the first pinned row's top less the gap, as laid out and as the looks draw its head", () => {
    expect(pinDepth(rows, 6, false)).toBeCloseTo(66 + 6 + 44 + 6 - 6, 6);
    const space = (172 - 141.3) / 3;
    expect(pinDepth(rows, 6, true)).toBeCloseTo(62.5 + 39.4 + 2 * space - 6, 6);
    expect(pinDepth([{ shown: true, pinned: false, height: 66 }], 6, false)).toBeNull();
  });
});

describe("linesOf", () => {
  it("counts a name's lines by its fragments' centres, leaving out its word breaks' empty boxes", () => {
    // "DocumentationLinkViolation" on one line under Segoe UI's lines, emulated: its three text fragments share a line,
    // and its two word breaks' boxes stand a pixel above them, which counting rounded tops had read as a second line.
    const one = [{ top: 10, height: 15, width: 60 }, { top: 9, height: 15, width: 0 }, { top: 10, height: 15, width: 20 }, { top: 9.4, height: 15, width: 0 }, { top: 10, height: 15, width: 40 }];
    expect(linesOf(one)).toBe(1);
    // Two fragments a line apart are two lines, however their tops round.
    expect(linesOf([{ top: 10.4, height: 12, width: 80 }, { top: 22.6, height: 12, width: 40 }])).toBe(2);
    expect(linesOf([{ top: 10.49, height: 12, width: 80 }, { top: 10.51, height: 12, width: 40 }])).toBe(1);
    expect(linesOf([])).toBe(0);
    expect(linesOf([{ top: 3, height: 12, width: 0 }])).toBe(0);
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

describe("the file's own kept line in the connections look", () => {
  const scale = LOOK_SCALES.connections;
  it("stands where the header's room holds a name's line at the held size below the held name, with its air", () => {
    // A header 91 deep and a name on one line of 15 at 2.2, More beside it: 33 below the name's top, 58 left for 29.83.
    expect(fileLineRoom(91, 33, scale)).toEqual({ fits: true, short: 0 });
    // Just enough.
    expect(fileLineRoom(33 + FILE_KEPT_AIR + NAME_LINE * scale, 33, scale).fits).toBe(true);
  });

  it("is not drawn where the room does not hold it, and says by how much, rather than shrink", () => {
    // A name on two lines takes 66 of the 91: 25 left, 4.83 short.
    const two = fileLineRoom(91, 66, scale);
    expect(two.fits).toBe(false);
    expect(two.short).toBeCloseTo(66 + FILE_KEPT_AIR + NAME_LINE * scale - 91, 6);
    expect(two.short).toBeCloseTo(4.83, 2);
  });
});
