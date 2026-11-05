import { describe, expect, it } from "vitest";

import type { Capture, CardCapture, PreparedText } from "./capture";
import { cardMetrics, chipsHeight, registerPins, resolvePin, synthesizedHeight, type CardMetrics } from "./card-model";
import { cardViews } from "./measurer";
import { insidePolygon } from "./signals";
import { edgeKey, type BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import { EMPTY_PIN_SET } from "../../packages/explorer/src/client/views/pin-state";

describe("the lab's card model, the parts that need no page", () => {
  it("places relationship buttons before the prose and pins, wraps them at the available width, and includes them in the overflow decision", () => {
    // A serialized one-glyph text: no browser or font measurement is needed to lay it out again.
    const label: PreparedText = { text: "X", font: "text", prepared: {
      widths: [10], lineEndFitAdvances: [10], lineEndPaintAdvances: [10], kinds: ["text"],
      simpleLineWalkFastPath: true, segLevels: null, breakableFitAdvances: [null], breakablePreferredBreaks: [null],
      letterSpacing: 0, spacingGraphemeCounts: [1], discretionaryHyphenWidth: 0, tabStopAdvance: 0,
      chunks: [{ startSegmentIndex: 0, endSegmentIndex: 1, consumedEndSegmentIndex: 1 }], segments: ["X"]
    } as PreparedText["prepared"] };
    const constants = Object.fromEntries([
      "titleMarginBottom", "titlePaddingRight", "symbolsMarginTop", "gridRowGap", "gridColumnGap", "gridSideColumn",
      "badgeHeight", "badgeGap", "testsMarginTop", "testsMarginBottom", "testsGap", "directoryMarginTop",
      "disclosureMarginTop", "labelPaddingBottom", "internalsDotMarginTop", "placeholderHeight"
    ].map(key => [key, 0])) as unknown as Capture["constants"];
    constants.dotHeight = 10;
    const capture = { fonts: { text: { lineHeight: 10 } }, constants } as unknown as Capture;
    const row = { symbol: "X", label, badgesWidth: 0 };
    const view = { rows: [row], registration: [row], notes: [] };
    const base = { borderWidth: 0, padding: 0, title: label, path: label, directory: label,
      directoryHidden: true, rows: [row], tests: null } as CardCapture;
    const footer = { items: [{ width: 100, height: 32 }, { width: 100, height: 32 }], gap: 8, top: 12, marginTop: 12 };
    const plain = cardMetrics(capture, base, 208, view);
    // Older captures retain their bottom placement and leave symbol pins where they were.
    const old = cardMetrics(capture, { ...base, footer }, 208, view);
    expect(old.height - plain.height).toBe(44);
    expect(old.pins.get("inbound:X")).toBe(plain.pins.get("inbound:X"));
    const top = { ...base, footer: { ...footer, position: "after-path" as const } };
    const wide = cardMetrics(capture, top, 208, view);
    expect(wide.height).toBe(old.height);
    expect(wide.pins.get("inbound:X")! - plain.pins.get("inbound:X")!).toBe(44);
    const narrow = cardMetrics(capture, top, 207, view);
    expect(narrow.height - wide.height).toBe(40);
    expect(narrow.pins.get("inbound:X")! - wide.pins.get("inbound:X")!).toBe(40);
    // Coarse pointers have 44px buttons; an over-wide unbreakable button stays one line.
    const touch = { ...top, footer: { ...top.footer, items: footer.items.map(item => ({ ...item, height: 44 })) } };
    expect(cardMetrics(capture, touch, 50, view).height - plain.height).toBe(12 + 44 + 8 + 44);
    const overflow = { children: [], lineHeight: 10, inset: { horizontal: 0, vertical: 20 }, margin: { top: 0, bottom: 0 }, maxHeight: null };
    const bounded = { ...top, overflow, readingFrameHeight: wide.height };
    expect(cardMetrics(capture, bounded, 208, view).height).toBe(wide.height);
    const clipped = cardMetrics(capture, bounded, 207, view);
    expect(clipped.height).toBe(narrow.height + 20);
    expect(clipped.pins.get("inbound:X")).toBe(narrow.pins.get("inbound:X")! + 20);
  });

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

  it("regenerates a cycle disclosure once rather than also retaining the captured copy", () => {
    const link = { sourceId: "a", targetId: "b", direction: "outbound" as const, kind: "dependency" as const };
    const capture = { fonts: { note: { lineHeight: 14, glyphs: { a: 6, " ": 3 } } }, cards: {
      a: { id: "a", rows: [], notes: [{ text: "1\u00a0connection returns in a cycle", font: "note" }], directory: { font: "note" } }
    } } as unknown as Capture;
    const branches = { subgraph: { nodes: [{ id: "a", publicSymbols: [] }], links: [link] }, rows: new Map(),
      relevantSymbols: new Map(), back: new Set([edgeKey(link)]) } as unknown as BranchGraph;
    const view = cardViews(capture, branches, { pins: EMPTY_PIN_SET, selected: "a", collapseOnPin: true, symbolOrder: "layout" }).get("a")!;
    expect(view.notes).toHaveLength(1);
    expect(view.notes[0](500)).toBe(14);
  });

  it("resolves a wire's pin as the page's registry does: the row by name or normalized name, else the direction's default, else the middle", () => {
    const metrics: CardMetrics = { height: 100, pins: new Map([["inbound:Foo", 20], ["outbound:Foo", 20], ["normalized:inbound:Foo", 20], ["normalized:outbound:Foo", 20], ["inbound:__internals__", 80], ["inbound:*", 80], ["outbound:*", 50]]), rowKeys: new Set(["inbound:Foo", "outbound:Foo", "normalized:inbound:Foo", "normalized:outbound:Foo", "inbound:__internals__", "inbound:*"]), hiddenKeys: new Set(["inbound:Bar", "outbound:Bar", "normalized:inbound:Bar", "normalized:outbound:Bar"]) };
    expect(resolvePin(metrics, "inbound", "Foo")).toEqual({ offset: 20, key: "inbound:Foo" });
    // Surrounding whitespace may be trimmed; declaration distinctions are preserved by the projected heading.
    expect(resolvePin(metrics, "outbound", " Foo ")).toEqual({ offset: 20, key: "normalized:outbound:Foo" });
    expect(resolvePin(metrics, "inbound", undefined)).toEqual({ offset: 80, key: "inbound:*" });
    expect(resolvePin(metrics, "outbound", "Missing")).toEqual({ offset: 50, key: "outbound:*" });
    // A collapsed row's pin is known but unreachable: the page places no wire to it.
    expect(resolvePin(metrics, "inbound", "Bar")).toEqual({ offset: null, key: "inbound:Bar" });
    expect(resolvePin({ height: 100, pins: new Map(), rowKeys: new Set(), hiddenKeys: new Set() }, "inbound", "x")).toEqual({ offset: 50, key: null });
  });

  it("keeps original registration identity when rows move, without merging case-distinct names", () => {
    const row = (symbol: string): { symbol: string } => ({ symbol });
    const lower = row("item"), upper = row("Item"), duplicate = row("Item"), internals = row("__internals__");
    // The last original Item remains the endpoint, although it is now above the first Item in the proposed layout.
    const metrics = registerPins([lower, upper, duplicate, internals], new Map([[lower, 90], [upper, 70], [duplicate, 20], [internals, 130]]), 180);
    expect(resolvePin(metrics, "outbound", "Item").offset).toBe(20);
    expect(resolvePin(metrics, "outbound", "item").offset).toBe(90);
    expect(resolvePin(metrics, "outbound", " Item ").offset).toBe(20);
    expect(resolvePin(metrics, "inbound", undefined).offset).toBe(130);
    expect(resolvePin(metrics, "outbound", undefined).offset).toBe(90);
    // A winning registration whose row is hidden prevents a wire; an earlier shown duplicate cannot replace it.
    const hidden = registerPins([lower, upper, duplicate, internals], new Map([[lower, 90], [upper, 70], [internals, 130]]), 180);
    expect(resolvePin(hidden, "outbound", "Item").offset).toBeNull();
    expect(resolvePin(hidden, "outbound", " Item ").offset).toBeNull();
    expect(resolvePin(hidden, "outbound", "item").offset).toBe(90);
    const asset = registerPins([], new Map(), 100);
    expect(resolvePin(asset, "inbound", undefined).offset).toBe(50);
    expect(resolvePin(asset, "outbound", "unknown").offset).toBe(50);
  });

  it("reconstructs registration from the graph's original symbols rather than the capture's displayed row order", () => {
    const row = (symbol: string) => ({ symbol });
    const lower = row("item"), upper = row("Item"), duplicate = row("Item"), internals = row("__internals__");
    const capture = { cards: { a: { id: "a", rows: [upper, duplicate, lower, internals], notes: [], directory: { font: "row" } } } } as unknown as Capture;
    const branches = { subgraph: { nodes: [{ id: "a", publicSymbols: ["item", "Item", "Item"] }], links: [] }, rows: new Map([["a", ["item", "Item", "Item", "__internals__"]]]), relevantSymbols: new Map(), back: new Set() } as unknown as BranchGraph;
    const view = cardViews(capture, branches, { pins: EMPTY_PIN_SET, selected: "a", collapseOnPin: true, symbolOrder: "layout" }).get("a")!;
    expect(view.rows).toEqual([lower, upper, duplicate, internals]);
    expect(view.registration).toEqual([lower, upper, duplicate, internals]);
  });

  it("constructs both display and endpoint queues in the requested symbol order before the layout reorders names", () => {
    const row = (symbol: string, badgesWidth = 0) => ({ symbol, badgesWidth });
    const upper = row("Item"), duplicate = row("Item", 20), lower = row("item"), z = row("z"), internals = row("__internals__");
    const capture = { cards: { a: { id: "a", rows: [upper, duplicate, lower, z, internals], notes: [], directory: { font: "row" } } } } as unknown as Capture;
    const branches = { subgraph: { nodes: [{ id: "a", publicSymbols: ["Item", "Item", "item", "z"] }], links: [] }, rows: new Map([["a", ["item", "Item", "Item", "z", "__internals__"]]]), relevantSymbols: new Map(), back: new Set() } as unknown as BranchGraph;
    const options = { pins: EMPTY_PIN_SET, selected: "a", collapseOnPin: true };
    const alphabetical = cardViews(capture, branches, { ...options, symbolOrder: "alphabetical" }).get("a")!;
    expect(alphabetical.rows).toEqual([lower, upper, duplicate, z, internals]);
    expect(alphabetical.registration).toEqual([lower, upper, duplicate, z, internals]);
    // The layout can move z ahead, but cannot reverse distinct rows with the same normalized name.
    branches.rows.set("a", ["z", "Item", "Item", "item", "__internals__"]);
    const layout = cardViews(capture, branches, { ...options, symbolOrder: "layout" }).get("a")!;
    expect(layout.rows).toEqual([z, upper, duplicate, lower, internals]);
    expect(layout.registration).toEqual([upper, duplicate, lower, z, internals]);
    const centres = new Map(layout.rows.map((entry, index) => [entry, 20 * (index + 1)]));
    const metrics = registerPins(layout.registration, centres, 140);
    expect(resolvePin(metrics, "outbound", "Item").offset).toBe(60);
    expect(resolvePin(metrics, "outbound", "item").offset).toBe(80);
    expect(resolvePin(metrics, "outbound", " Item ").offset).toBe(60);
  });

  it("tells a point inside a stepped membrane from one outside, by the even-odd rule", () => {
    const polygon = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 100 }, { x: 0, y: 100 }];
    expect(insidePolygon(polygon, 50, 25)).toBe(true);
    expect(insidePolygon(polygon, 150, 25)).toBe(false);
    expect(insidePolygon(polygon, 150, 75)).toBe(true);
    expect(insidePolygon(polygon, 250, 75)).toBe(false);
  });
});
