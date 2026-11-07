import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { chooseHeldLines, HELD_BANDS, heldTitle, type TitleRooms } from "./held-lines";
import { FIRST_STEP, LAST_STEP } from "./ladder-steps";
import { seamsOf } from "./word-seams";

/** One unit a character, as a monospaced font would measure. */
const measure = (text: string): number => text.length;
const lines = (name: string, width: number, besideWidth: number, besideLines: number, count: number): string[] =>
  chooseHeldLines(seamsOf(name), { width, besideWidth, besideLines, lines: count }, measure);

/** Whether a line ends inside a segment that would fit a full line: what the four rules forbid. */
const brokenInside = (name: string, drawn: readonly string[], width: number): boolean => {
  let at = 0;
  const seams = new Set<number>([0, name.length]);
  for (const segment of seamsOf(name)) { at += segment.length; seams.add(at); }
  let offset = 0;
  for (const line of drawn.slice(0, -1)) {
    offset += line.replace("…", "").length;
    if (seams.has(offset)) continue;
    // The segment this line ended inside: allowed only when it is wider than a full line.
    let start = 0;
    for (const segment of seamsOf(name)) {
      if (offset > start && offset < start + segment.length) return segment.length <= width;
      start += segment.length;
    }
  }
  return false;
};

describe("chooseHeldLines", () => {
  it("draws a name that fits beside the buttons on one line", () => {
    expect(lines("types.ts", 20, 10, 1, 3)).toEqual(["types.ts"]);
  });

  it("moves a name that fits whole below the buttons there, rather than breaking it beside them (verif / y.ts)", () => {
    // "verify.ts" is one segment, nine wide: beside the buttons there are six, below them twenty.
    expect(lines("verify.ts", 20, 6, 1, 3)).toEqual(["", "verify.ts"]);
    expect(lines("main.rs", 12, 5, 1, 2)).toEqual(["", "main.rs"]);
  });

  it("never breaks a segment that fits a full line, waiting for a line with room for it", () => {
    // Seams: still- / picture.ts. Beside the buttons four, below ten.
    const drawn = lines("still-picture.ts", 10, 4, 1, 4);
    expect(drawn).toEqual(["", "still-", "picture.ts"]);
    expect(brokenInside("still-picture.ts", drawn, 10)).toBe(false);
    // Room below for the whole name: it starts there. Without it, beside the buttons, at a seam, and the last line kept
    // ends with an ellipsis.
    expect(lines("local-map-branches.spec.ts", 12, 8, 1, 4)).toEqual(["", "local-map-", "branches.", "spec.ts"]);
    expect(lines("local-map-branches.spec.ts", 12, 8, 1, 3)).toEqual(["local-", "map-", "branches.sp…"]);
  });

  it("breaks a segment inside only when it is wider than a full line", () => {
    expect(lines("averyveryverylongname", 8, 8, 0, 4)).toEqual(["averyver", "yverylon", "gname"]);
    // Ten characters, wider than a full line of eight: it may break inside.
    expect(lines("still-picture.ts", 8, 8, 0, 3)).toEqual(["still-pi", "cture.ts"]);
  });

  it("ends the last line the room holds with an ellipsis that fits it", () => {
    const drawn = lines("local-map-simplicity.spec.ts", 10, 10, 0, 2);
    expect(drawn).toHaveLength(2);
    expect(drawn[1].endsWith("…")).toBe(true);
    expect(measure(drawn[1])).toBeLessThanOrEqual(10);
    // The last line holds as much of the rest of the name as fits it, beside the buttons too.
    expect(lines("still-picture.ts", 8, 4, 1, 1)).toEqual(["sti…"]);
    expect(lines("still-picture.ts", 8, 8, 0, 1)).toEqual(["still-p…"]);
    expect(lines("still-picture.ts", 12, 12, 0, 1)).toEqual(["still-pictu…"]);
    expect(lines("local-map-branches.spec.ts", 10, 4, 1, 2)).toEqual(["", "local-map…"]);
  });

  it("keeps the four rules over many rooms and names", () => {
    const names = ["still-picture.ts", "local-map-branches.spec.ts", "verify.ts", "Main.cs", "compiler-edges.json", "PaymentService.cs", "a"];
    for (const name of names) for (const width of [4, 6, 9, 14, 30]) for (const beside of [0, 2, width]) for (const count of [1, 2, 3, 6]) {
      const drawn = lines(name, width, Math.min(beside, width), 1, count);
      expect(drawn.length, `${name} ${width} ${beside} ${count}`).toBeLessThanOrEqual(Math.max(1, count));
      drawn.forEach((line, index) => expect(measure(line), `${name} line ${index}`).toBeLessThanOrEqual(index < 1 ? Math.min(beside, width) : width));
      // A drawing is whole unless it ends with an ellipsis, or on a line beside the buttons too narrow for one.
      const besideLast = drawn.length - 1 < 1 ? Math.min(beside, width) : width;
      if (!drawn.at(-1)!.endsWith("…") && measure("…") <= besideLast) {
        expect(drawn.join(""), name).toBe(name);
        expect(brokenInside(name, drawn, width), `${name} ${width}: ${drawn.join(" / ")}`).toBe(false);
      }
    }
  });
});

describe("heldTitle", () => {
  const rooms: TitleRooms = {
    roomW: 200, headH: 40, cardH: 300, pitch: 66, rowGap: 4,
    actionsW: 60, moreW: 20, moreH: 20, overX: 4, overY: 6, controlCeiling: 3.3, line: 15
  };
  const at = (step: number) => ({ text: 1.2 ** step, control: 1.2 ** step });

  it("holds the step's size, never below the map's own nor taller than the room's height", () => {
    expect(heldTitle(rooms, "far", { text: 0.5, control: 0.5 }, null).scale).toBe(1);
    expect(heldTitle(rooms, "far", at(5), null).scale).toBeCloseTo(1.2 ** 5);
    expect(heldTitle(rooms, "far", { text: 10, control: 1 }, null).scale).toBeCloseTo(40 / 15);
  });

  it("keeps the lines beside the node's held buttons clear of them: all three at the middle band, More alone beyond", () => {
    const far = heldTitle(rooms, "far", at(5), null), middle = heldTitle(rooms, "middle", at(5), null);
    const scale = far.scale;
    // More, 20 wide at its held scale, standing 4 past the header's edge, with 4 of air: in the name's own units.
    expect(far.room.besideWidth).toBeCloseTo((200 - 20 * scale) / scale);
    expect(middle.room.besideWidth).toBeCloseTo((200 - 60 * scale) / scale);
    // More's 20 at its held scale less the 6 it stands above the name, with 4 of air, in lines of the name's 15.
    expect(far.room.besideLines).toBe(Math.ceil((20 * scale - 2) / scale / 15));
    // The buttons stop at their ceiling, and so does what they take of the name's room.
    expect(heldTitle(rooms, "far", { text: 1, control: 10 }, null).room.besideWidth).toBeCloseTo(200 - 20 * 3.3);
  });

  it("takes the card down to its first drawn row at the overview band, the header's room before it", () => {
    const far = heldTitle(rooms, "far", at(8), null);
    expect(far.room.lines).toBe(1);
    expect(heldTitle(rooms, "overview", at(8), null).room.lines).toBe(Math.floor(300 / (15 * 1.2 ** 8)));
    expect(heldTitle(rooms, "overview", at(8), 0).room.lines).toBe(far.room.lines);
    const twoRows = 40 + 2 * 66 - 4;
    expect(heldTitle(rooms, "overview", at(8), 2).room.lines).toBe(Math.floor(twoRows / (15 * Math.min(1.2 ** 8, twoRows / 15))));
  });
});

describe("the stylesheet's held lines", () => {
  it("draws the lines of every band and step the card reading writes", () => {
    const css = readFileSync(path.resolve(__dirname, "../../styles/reading.css"), "utf8");
    for (const band of HELD_BANDS) for (let step = FIRST_STEP; step <= LAST_STEP; step += 1) {
      // No alternative text (content: … / ""): the held name is aria-hidden already, and browsers before Firefox 128 and
      // Safari 17.4 reject such a declaration whole, drawing no name.
      const rule = `[data-lod="${band}"][data-step="${step}"] .local-slot-card .local-file-name-held::after { content: attr(data-lines-${band}-${step}); }`;
      expect(css.includes(rule), rule).toBe(true);
    }
  });
});
