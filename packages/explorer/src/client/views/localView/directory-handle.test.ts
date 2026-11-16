import { describe, expect, it } from "vitest";

import { closedFamily, fitHandle, HANDLE_AIR, HANDLE_HOLD, HANDLE_LINE, HANDLE_FLOOR, HANDLE_STRIP, handleParts, handleReach, inEverySibling, stripColumns, wholeAtSeams, type ClosedSibling, type StripBox } from "./directory-handle";
import type { HeldRoom } from "./held-lines";
import { LOOK_SCALES } from "./ladder-steps";
import { seamsOf } from "./word-seams";

/** Every character ten units wide, so a width says a count of characters. */
const measure = (text: string): number => text.length * 10;

/** A box of a width and a height in the map's own units, with a 15-unit line and no controls. */
const box = (width: number, height: number) => (scale: number): HeldRoom =>
  ({ width: width / scale, height: height / scale, line: 15, controlsWidth: 0, controlsHeight: 0, gap: 0 });

describe("the strip above an opened directory's cards", () => {
  it("holds a line of the handle at every look's scale, with air below", () => {
    expect(HANDLE_HOLD).toBe(Math.max(...Object.values(LOOK_SCALES)));
    for (const scale of Object.values(LOOK_SCALES)) expect(HANDLE_STRIP - HANDLE_AIR).toBeGreaterThanOrEqual(scale * HANDLE_LINE);
    expect(HANDLE_STRIP).toBe(60);
    // A name comes down no further than the connections look's size before it is cut, in a closed box and on a handle alike.
    expect(HANDLE_FLOOR).toBe(LOOK_SCALES.connections);
  });
});

describe("a directory's path as its handle draws it", () => {
  it("parts the directory's own name from its parent's path", () => {
    expect(handleParts("packages/explorer/src/client")).toEqual({ parent: "packages/explorer/src/", leaf: "client" });
    expect(handleParts("scripts")).toEqual({ parent: "", leaf: "scripts" });
  });
});

describe("the handle's room across", () => {
  const segments = [{ left: 0, right: 300, top: 40 }, { left: 400, right: 700, top: 40 }, { left: 800, right: 1100, top: 10 }, { left: 1200, right: 1500, top: 40 }];

  it("is the leading run of the strip's segments level with the leftmost", () => {
    expect(handleReach(segments, 4, 72, [])).toBe(700);
    expect(handleReach(segments, 1, 72, [{ left: 400, right: 700, top: 52 }])).toBe(300);
    expect(handleReach([], 1, 72, [])).toBe(0);
  });

  it("runs on past the strip's own columns over level columns that hold nothing under it, as placed", () => {
    // A membrane placed by its wires keeps the strip over its first column alone. Its second column's first card stands
    // 110 units down and its third column holds a membrane 170 down: the handle reaches both, to the step at the fourth.
    const standing = [{ left: 12, right: 288, top: 112 }, { left: 412, right: 688, top: 150 }, { left: 800, right: 1100, top: 210 }];
    const level = segments.map((segment, index) => ({ ...segment, top: index === 3 ? 10 : 40 }));
    expect(handleReach(level, 1, 72, standing)).toBe(1100);
    // A card within the strip's height of the top ends the reach where it stands; one exactly at the strip's foot does not.
    expect(handleReach(level, 1, 72, [...standing, { left: 412, right: 688, top: 100 }])).toBe(300);
    expect(handleReach(level, 1, 72, [...standing, { left: 812, right: 1088, top: 111 }])).toBe(700);
    expect(handleReach(level, 1, 72, [...standing, { left: 812, right: 1088, top: 112 }])).toBe(1100);
    // The strip's own columns are reached whatever stands in them: the layout kept the strip there.
    expect(handleReach(level.slice(0, 2), 2, 72, [...standing, { left: 412, right: 688, top: 52 }])).toBe(700);
    expect(handleReach(level.slice(0, 2), 1, 72, [...standing, { left: 412, right: 688, top: 52 }])).toBe(300);
  });
});

describe("the columns that keep a directory's strip", () => {
  const box = (key: string, kind: string, columns: [number, number], row: number, parent: StripBox | null): StripBox & { children: StripBox[] } => {
    const made = { key, kind, minColumn: columns[0], maxColumn: columns[1], row, parent, children: [] as StripBox[] };
    (parent?.children as StripBox[] | undefined)?.push(made);
    return made;
  };

  it("are all of them for a directory alone under the picture's root", () => {
    const root = box("root", "root", [0, 6], 0, null);
    expect(stripColumns(box("client", "directory", [0, 6], 0, root))).toBe(7);
  });

  it("end where a nested directory rises beside its parent's own first row", () => {
    // packages/engine/src with live-docs opened: the parent's three boxes stand in a row over the first three of the
    // seven columns; live-docs stands below them there and at its parent's top in the other four.
    const root = box("root", "root", [0, 6], 0, null);
    const src = box("src", "directory", [0, 6], 0, root);
    box("src boxes", "files", [0, 2], 0, src);
    const live = box("live-docs", "directory", [0, 6], 1, src);
    src.stripColumns = stripColumns(src);
    expect(src.stripColumns).toBe(7);
    expect(stripColumns(live)).toBe(3);
  });

  it("end where the parent's own strip ends", () => {
    const root = box("root", "root", [0, 3], 0, null);
    const outer = box("outer", "directory", [0, 3], 0, root);
    outer.stripColumns = 2;
    expect(stripColumns(box("inner", "directory", [0, 3], 0, outer))).toBe(2);
  });
});

describe("a closed box's name, fitted", () => {
  const most = LOOK_SCALES.overview, floor = LOOK_SCALES.connections;

  it("is held at the look's scale where the box holds it whole", () => {
    const fit = fitHandle(seamsOf("history"), box(260, 66), measure, most, floor);
    expect(fit.scale).toBe(most);
    expect(fit.header.lines).toEqual(["history"]);
  });

  it("is brought down in size before it is cut: nine letters in a room that holds seven at the look's scale", () => {
    // 260 units hold 7.2 characters at 3.6 and nine from 2.88 down: the name is whole at the first step at or below that.
    const fit = fitHandle(seamsOf("bootstrap"), box(260, 66), measure, most, floor);
    expect(fit.header.lines).toEqual(["bootstrap"]);
    expect(fit.scale).toBeLessThanOrEqual(260 / 90);
    expect(fit.scale).toBeGreaterThan(260 / 90 - 0.05);
  });

  it("breaks at a seam on the lines the box holds before it goes below the floor", () => {
    // At 2.2, 66 units hold two lines and 200 units nine characters: "language-" and "server".
    const fit = fitHandle(seamsOf("language-server"), box(200, 66), measure, most, floor);
    expect(fit.scale).toBe(floor);
    expect(fit.header.lines).toEqual(["language-", "server"]);
    expect(wholeAtSeams(fit.header, seamsOf("language-server"))).toBe(true);
  });

  it("is never held below the floor: there it breaks inside a word, and is cut with an ellipsis last", () => {
    const fit = fitHandle(seamsOf("bootstrap"), box(120, 66), measure, most, floor);
    expect(fit.scale).toBe(floor);
    expect(wholeAtSeams(fit.header, seamsOf("bootstrap"))).toBe(false);
    expect(fit.header.lines.join("")).toBe("bootstrap");
    const cut = fitHandle(seamsOf("bootstrap"), box(120, 33), measure, most, floor);
    expect(cut.scale).toBe(floor);
    expect(cut.header.lines).toHaveLength(1);
    expect(cut.header.lines[0].endsWith("…")).toBe(true);
  });

  it("holds a short box's name no larger than the box allows", () => {
    const fit = fitHandle(seamsOf("src"), box(400, 20), measure, 20 / 15, floor);
    expect(fit.scale).toBe(20 / 15);
    expect(fit.header.lines).toEqual(["src"]);
  });
});

describe("the closed boxes of one parent at a far look", () => {
  const overview = LOOK_SCALES.overview, floor = LOOK_SCALES.connections;
  /** A box of a width and a height with a 15-unit line: after the chevron's 16 units a name of n characters is whole on a line from width / (10n + 16) down. */
  const sibling = (name: string, width: number, height = 66): ClosedSibling => ({ segments: seamsOf(name), measure, room: { width, height, line: 15 } });

  it("says a row is in every sibling or in none", () => {
    expect(inEverySibling([true, true, true])).toBe(true);
    expect(inEverySibling([true, false, true])).toBe(false);
    expect(inEverySibling([])).toBe(false);
  });

  it("fits each sibling's name on its own, as a file's is: no sibling's size follows another's", () => {
    // "bootstrap" in 260 units is whole from 260 / 106 = 2.45 down; "src" and "history" in 400 at the look's own 3.6.
    const family = closedFamily([sibling("src", 400), sibling("history", 400), sibling("bootstrap", 260)], overview, floor, 8);
    expect(family.boxes.map(held => held.lines)).toEqual([["src"], ["history"], ["bootstrap"]]);
    expect(family.boxes.slice(0, 2).map(held => held.scale)).toEqual([overview, overview]);
    expect(family.boxes[2].scale).toBeLessThanOrEqual(260 / 106);
    expect(family.boxes[2].scale).toBeGreaterThan(260 / 106 - 0.05);
    // Each is the size the box alone would give its name.
    for (const [index, box] of [sibling("src", 400), sibling("history", 400), sibling("bootstrap", 260)].entries()) {
      expect(closedFamily([box], overview, floor, 8).boxes[0]).toEqual(family.boxes[index]);
    }
  });

  it("never holds a name below the floor, nor above the look's size or what the box's height holds", () => {
    // "persistence" in 200 units would be whole only from 1.59 down: it stands at the floor, broken inside the word.
    const family = closedFamily([sibling("persistence", 200), sibling("src", 400), sibling("src", 400, 30)], overview, floor, 8);
    expect(family.boxes[0].scale).toBe(floor);
    expect(family.boxes[0].lines.join("")).toBe("persistence");
    expect(family.boxes[0].lines.length).toBeGreaterThan(1);
    expect(family.boxes[1].scale).toBe(overview);
    expect(family.boxes[2].scale).toBe(30 / 15);
  });

  it("draws the cells' row in every sibling where each has a whole row under its name at its own size, and in none otherwise", () => {
    // At the connections look one line of a name at 2.2 leaves 28.6 of 66 units, and a row of cells takes 17.6; two lines leave none.
    const one = [sibling("src", 240), sibling("history", 240)];
    const all = closedFamily(one, floor, floor, 8);
    expect(all.cells).toBe(true);
    for (const held of all.boxes) expect(held.under).toBeCloseTo(66 - 17 * 2.2, 6);
    const none = closedFamily([...one, sibling("language-server", 240)], floor, floor, 8);
    expect(none.boxes[2].lines).toEqual(["language-", "server"]);
    expect(none.boxes[2].under).toBeLessThan(0);
    expect(none.cells).toBe(false);
    // At the overview look two names brought down to 2.45 and 2.35 each leave a row at that size: in both.
    const small = [sibling("bootstrap", 260), sibling("persistence", 300)];
    const held = closedFamily(small, overview, floor, 8);
    expect(held.boxes.map(box => box.under >= 8 * box.scale)).toEqual([true, true]);
    expect(held.cells).toBe(true);
    // A sibling whose name stands at the look's full size leaves 4.8 units, less than a row: then in none of them.
    const mixed = closedFamily([...small, sibling("src", 400)], overview, floor, 8);
    expect(mixed.boxes[2]).toMatchObject({ scale: overview, lines: ["src"] });
    expect(mixed.boxes[2].under).toBeCloseTo(66 - 17 * 3.6, 6);
    expect(mixed.cells).toBe(false);
    // A taller box holds the row at that size.
    expect(closedFamily([sibling("src", 400, 100)], overview, floor, 8).cells).toBe(true);
  });

  it("is nothing for no boxes", () => {
    expect(closedFamily([], overview, floor, 8)).toEqual({ cells: false, boxes: [] });
  });
});
