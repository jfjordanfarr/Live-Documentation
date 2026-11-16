import { describe, expect, it } from "vitest";

import { fitHandle, HANDLE_AIR, HANDLE_HOLD, HANDLE_LINE, HANDLE_STRIP, handleParts, handleRun, stripColumns, wholeAtSeams, type StripBox } from "./directory-handle";
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
    expect(handleRun(segments)).toBe(700);
    expect(handleRun(segments.slice(0, 1))).toBe(300);
    expect(handleRun([])).toBe(0);
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
