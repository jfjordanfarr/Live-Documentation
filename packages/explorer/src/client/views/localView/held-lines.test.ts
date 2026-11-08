import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { chooseHeldHeader, HELD_BANDS, heldSegments, heldTitle, type HeldRoom, type TitleRooms } from "./held-lines";
import { FIRST_STEP, LAST_STEP } from "./ladder-steps";

/** One unit a character, as a monospaced font would measure; a line one unit tall. */
const measure = (text: string): number => text.length;
const room = (width: number, height: number, controlsWidth: number, controlsHeight = 1, gap = 1): HeldRoom =>
  ({ width, height, line: 1, controlsWidth, controlsHeight, gap });
const header = (name: string, held: HeldRoom) => chooseHeldHeader(heldSegments(name), held, measure);

describe("heldSegments", () => {
  it("breaks at the name's seams and before a short extension's dot", () => {
    expect(heldSegments("branch-renderer.ts")).toEqual(["branch-", "renderer", ".ts"]);
    expect(heldSegments("local-map-overview.spec.ts")).toEqual(["local-", "map-", "overview.", "spec", ".ts"]);
    expect(heldSegments("PaymentService.cs")).toEqual(["Payment", "Service", ".cs"]);
    // A long extension is a segment of its own already; a name without one is its seams.
    expect(heldSegments("rosetta-manifest.json")).toEqual(["rosetta-", "manifest.", "json"]);
    expect(heldSegments("Makefile")).toEqual(["Makefile"]);
    expect(heldSegments("")).toEqual([]);
  });
});

describe("chooseHeldHeader", () => {
  it("fills the first line and gives More the second, beside the extension (the owner's band at the far step)", () => {
    // "branch-renderer.ts" in a room of two lines, sixteen wide, More one unit square: the name had broken "branch- /
    // renderer.ts" beside a More taller than a line (2026-11-07), then stood cut on one line; now it fills its first line.
    expect(header("branch-renderer.ts", room(16, 2, 1))).toEqual({ lines: ["branch-renderer", ".ts"], controls: { line: 1, shared: true, top: 1 } });
  });

  it("stands a name whole on two lines at the overview band, where one line had cut it like its neighbours", () => {
    expect(header("local-map-overview.spec.ts", room(20, 5, 1)).lines).toEqual(["local-map-overview.", "spec.ts"]);
    expect(header("local-map-overview.spec.ts", room(20, 5, 1)).controls).toEqual({ line: 1, shared: true, top: 1 });
  });

  it("shares the first line with the controls when the name fits beside them", () => {
    expect(header("types.ts", room(20, 2, 3))).toEqual({ lines: ["types.ts"], controls: { line: 0, shared: true, top: 0 } });
    // Centred on a line taller than they are.
    expect(header("types.ts", room(20, 2, 3, 0.5)).controls).toEqual({ line: 0, shared: true, top: 0.25 });
  });

  it("gives the controls the line after the name when its last line leaves them no room, if the room has that line", () => {
    expect(header("verify.ts", room(10, 2, 2))).toEqual({ lines: ["verify.ts"], controls: { line: 1, shared: false, top: 1 } });
  });

  it("cuts the room's last line beside the controls when the name fills it and no line follows", () => {
    expect(header("verify.ts", room(10, 1, 2))).toEqual({ lines: ["verify…"], controls: { line: 0, shared: true, top: 0 } });
    // A name longer than the room's lines: the lines it holds, the last cut where the controls begin.
    expect(header("local-map-overview.spec.ts", room(12, 2, 2))).toEqual({ lines: ["local-map-", "overview…"], controls: { line: 1, shared: true, top: 1 } });
  });

  it("makes the controls' line as tall as they are at the middle band, shared or their own", () => {
    // Controls one and a half lines tall: a short name shares their line, at its top; a long one stands above them.
    expect(header("types.ts", room(20, 2, 4, 1.5))).toEqual({ lines: ["types.ts"], controls: { line: 0, shared: true, top: 0 } });
    expect(header("local-map-overview.spec.ts", room(26, 3, 4, 1.5))).toEqual({ lines: ["local-map-overview.spec.ts"], controls: { line: 1, shared: false, top: 1 } });
    // Two and a half lines of room hold a name line and the controls' line shared with the second: whole. A little less
    // holds one line, shared with the controls and cut beside them.
    expect(header("local-map-overview.spec.ts", room(20, 2.5, 4, 1.5)).lines).toEqual(["local-map-overview.", "spec.ts"]);
    expect(header("local-map-overview.spec.ts", room(20, 2.4, 4, 1.5)).lines).toEqual(["local-map-over…"]);
  });

  it("never erases the name: where the controls leave no room for the ellipsis beside them, they take the line after", () => {
    // The review's example (2026-11-08): a room of one line nearly filled by the controls.
    expect(header("main.rs", room(10, 1, 9.5))).toEqual({ lines: ["main.rs"], controls: { line: 1, shared: false, top: 1 } });
    expect(header("verify-files.ts", room(10, 1, 9.5))).toEqual({ lines: ["verify-fi…"], controls: { line: 1, shared: false, top: 1 } });
  });

  it("breaks a segment inside only when it is wider than a line, and draws an empty name as nothing", () => {
    expect(header("averyveryverylongname", room(8, 4, 1)).lines).toEqual(["averyver", "yverylon", "gname"]);
    expect(header("", room(8, 2, 1))).toEqual({ lines: [""], controls: { line: 0, shared: true, top: 0 } });
  });

  it("holds the six principles over many rooms and names", () => {
    const names = ["still-picture.ts", "local-map-branches.spec.ts", "verify.ts", "Main.cs", "compiler-edges.json", "PaymentService.cs", "a", "symbolAnchors.test.ts"];
    for (const name of names) for (const width of [6, 9, 14, 20, 30]) for (const height of [1, 2, 3, 5]) for (const controlsWidth of [1, 3, 5]) for (const controlsHeight of [0.6, 1, 1.6]) {
      const held = room(width, height, controlsWidth, controlsHeight);
      const label = `${name} ${width}×${height} controls ${controlsWidth}×${controlsHeight}`;
      const { lines, controls } = header(name, held);
      const segments = heldSegments(name);
      // The name leads: its first line holds its start.
      expect(lines[0].length > 0 || measure("…") > width - 1 - controlsWidth, label).toBe(true);
      expect(name.startsWith(lines[0].replace("…", "")), label).toBe(true);
      // The controls stand on the name's last line, sharing it, or alone on the line after; their line fits beside the text.
      expect(controls.line === lines.length - 1 && controls.shared || controls.line === lines.length && !controls.shared, label).toBe(true);
      if (controls.shared) expect(measure(lines.at(-1)!) + 1 + controlsWidth, label).toBeLessThanOrEqual(width);
      for (const line of lines) expect(measure(line), label).toBeLessThanOrEqual(width);
      const whole = lines.join("") === name;
      const used = controls.shared ? (lines.length - 1) + Math.max(1, controlsHeight) : lines.length + controlsHeight;
      if (whole) {
        // Whole: within the room, every line but the last filled, every break at a seam unless its segment is wider than a line.
        // (Past the room only where the controls leave no room for the ellipsis beside them and take the line after.)
        if (controls.shared || measure("…") <= width - 1 - controlsWidth) expect(used, label).toBeLessThanOrEqual(height + 1e-9);
        let at = 0;
        const seams = new Set([0, ...segments.map(segment => (at += segment.length))]);
        let offset = 0;
        lines.slice(0, -1).forEach((line, index) => {
          offset += line.length;
          const next = segments.find((_, i) => segments.slice(0, i).join("").length === offset);
          if (seams.has(offset)) expect(measure(line + (next ?? "")), `${label}: line ${index} is filled`).toBeGreaterThan(width);
          else {
            let start = 0;
            const inside = segments.find(segment => (start += segment.length) > offset);
            expect(measure(inside!), `${label}: line ${index} breaks inside a segment that fits`).toBeGreaterThan(width);
          }
        });
      } else {
        // Cut: only the last line, the controls beside it where the line beside them holds the ellipsis at least, and
        // only where the whole header would not fit the room; the name is never erased.
        expect(lines.at(-1)!.endsWith("…") || lines.at(-1)!.length === 1, label).toBe(true);
        expect(controls.shared || measure("…") > width - 1 - controlsWidth, label).toBe(true);
        expect(lines.slice(0, -1).every(line => !line.includes("…")), label).toBe(true);
        expect(name.startsWith(lines.join("").replace("…", "")), label).toBe(true);
        const flowed = chooseHeldHeader(segments, { ...held, height: 1000 }, measure);
        const wholeUsed = flowed.controls.shared ? (flowed.lines.length - 1) + Math.max(1, controlsHeight) : flowed.lines.length + controlsHeight;
        expect(wholeUsed, label).toBeGreaterThan(height);
      }
    }
  });
});

describe("heldTitle", () => {
  const rooms: TitleRooms = {
    roomW: 200, headH: 40, cardH: 300, pitch: 66, rowGap: 4,
    actionsW: 64, moreW: 20, moreH: 20, controlCeiling: 3.3, line: 15
  };
  const at = (step: number) => ({ text: 1.2 ** step, control: 1.2 ** step });

  it("holds the step's size, never below the map's own nor taller than the room's height", () => {
    expect(heldTitle(rooms, "far", { text: 0.5, control: 0.5 }, null).scale).toBe(1);
    expect(heldTitle(rooms, "far", at(5), null).scale).toBeCloseTo(1.2 ** 5);
    expect(heldTitle(rooms, "far", { text: 10, control: 1 }, null).scale).toBeCloseTo(40 / 15);
  });

  it("holds More no taller than a line of the name beyond the middle band, and all three controls at their size there", () => {
    const far = heldTitle(rooms, "far", at(5), null), middle = heldTitle(rooms, "middle", at(5), null);
    // The name's line at its held scale is 15 × 2.49; More is 20 × 2.49 at its step's scale, so it is held at 15/20 of it.
    expect(far.control).toBeCloseTo(15 * far.scale / 20);
    expect(far.room.controlsHeight * far.scale).toBeCloseTo(15 * far.scale);
    expect(far.room.controlsWidth * far.scale).toBeCloseTo(20 * far.control);
    expect(middle.control).toBeCloseTo(1.2 ** 5);
    expect(middle.room.controlsWidth * middle.scale).toBeCloseTo(64 * 1.2 ** 5);
    expect(middle.room.controlsHeight).toBeGreaterThan(middle.room.line);
    // The controls stop at their ceiling.
    expect(heldTitle(rooms, "middle", { text: 1, control: 10 }, null).control).toBeCloseTo(3.3);
    // The room in the name's own units: the width to the header's edge, the height to the first row, 4 of air.
    expect(far.room.width).toBeCloseTo(200 / far.scale);
    expect(far.room.height).toBeCloseTo(40 / far.scale);
    expect(far.room.gap).toBeCloseTo(4 / far.scale);
  });

  it("takes the card down to its first drawn row at the overview band, the header's room before it", () => {
    const far = heldTitle(rooms, "far", at(8), null);
    expect(far.room.height * far.scale).toBeCloseTo(40);
    expect(heldTitle(rooms, "overview", at(8), null).room.height * heldTitle(rooms, "overview", at(8), null).scale).toBeCloseTo(300);
    const pinned = heldTitle(rooms, "overview", at(8), 0);
    expect(pinned.room.height * pinned.scale).toBeCloseTo(40);
    const twoRows = heldTitle(rooms, "overview", at(8), 2);
    expect(twoRows.room.height * twoRows.scale).toBeCloseTo(40 + 2 * 66 - 4);
  });
});

describe("the stylesheet's held header", () => {
  it("draws the lines and stands the controls of every band and step the card reading writes", () => {
    const css = readFileSync(path.resolve(__dirname, "../../styles/reading.css"), "utf8");
    for (const band of HELD_BANDS) for (let step = FIRST_STEP; step <= LAST_STEP; step += 1) {
      // No alternative text (content: … / ""): the held name is aria-hidden already, and browsers before Firefox 128 and
      // Safari 17.4 reject such a declaration whole, drawing no name.
      const lines = `[data-lod="${band}"][data-step="${step}"] .local-slot-card .local-file-name-held::after { content: attr(data-lines-${band}-${step}); }`;
      expect(css.includes(lines), lines).toBe(true);
      const controls = `[data-lod="${band}"][data-step="${step}"] .local-slot-card .local-card-actions { top: calc(var(--controls-y-${band}-${step}, 0) * 1px); }`;
      expect(css.includes(controls), controls).toBe(true);
    }
  });
});
