import { describe, expect, it } from "vitest";

import type { Capture, RowCapture } from "./capture";
import { chipsHeight, registerPins, resolvePin, synthesizedHeight, type CardMetrics } from "./card-model";
import { cardViews } from "./measurer";
import { insidePolygon } from "./signals";
import type { BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import { EMPTY_PIN_SET } from "../../packages/explorer/src/client/views/pin-state";

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
    const metrics: CardMetrics = { height: 100, pins: new Map([["inbound:Foo", 20], ["outbound:Foo", 20], ["normalized:inbound:foo", 20], ["normalized:outbound:foo", 20], ["inbound:__internals__", 80], ["inbound:*", 80], ["outbound:*", 50]]), rowKeys: new Set(["inbound:Foo", "outbound:Foo", "normalized:inbound:foo", "normalized:outbound:foo", "inbound:__internals__", "inbound:*"]), hiddenKeys: new Set(["inbound:Bar", "outbound:Bar", "normalized:inbound:bar", "normalized:outbound:bar"]) };
    expect(resolvePin(metrics, "inbound", "Foo")).toEqual({ offset: 20, key: "inbound:Foo" });
    // A call's parentheses normalize away, and the normalized name is the key the page registered beside the raw one.
    expect(resolvePin(metrics, "outbound", "Foo()")).toEqual({ offset: 20, key: "normalized:outbound:foo" });
    expect(resolvePin(metrics, "inbound", undefined)).toEqual({ offset: 80, key: "inbound:*" });
    expect(resolvePin(metrics, "outbound", "Missing")).toEqual({ offset: 50, key: "outbound:*" });
    // A collapsed row's pin is known but unreachable: the page places no wire to it.
    expect(resolvePin(metrics, "inbound", "Bar")).toEqual({ offset: null, key: "inbound:Bar" });
    expect(resolvePin({ height: 100, pins: new Map(), rowKeys: new Set(), hiddenKeys: new Set() }, "inbound", "x")).toEqual({ offset: 50, key: null });
  });

  it("keeps original registration identity when rows move, with exact names ahead of normalized collisions", () => {
    const row = (symbol: string): RowCapture => ({ symbol, label: { text: symbol, font: "row", prepared: null }, badgesWidth: 0 });
    const lower = row("item"), upper = row("Item"), duplicate = row("Item"), internals = row("__internals__");
    // The last original Item remains the endpoint, although it is now above the first Item in the proposed layout.
    const metrics = registerPins([lower, upper, duplicate, internals], new Map([[lower, 90], [upper, 70], [duplicate, 20], [internals, 130]]), 180);
    expect(resolvePin(metrics, "outbound", "Item").offset).toBe(20);
    expect(resolvePin(metrics, "outbound", "item").offset).toBe(90);
    expect(resolvePin(metrics, "outbound", "Item()").offset).toBe(20);
    expect(resolvePin(metrics, "inbound", undefined).offset).toBe(130);
    expect(resolvePin(metrics, "outbound", undefined).offset).toBe(90);
    // A winning registration whose row is hidden prevents a wire; an earlier shown duplicate cannot replace it.
    const hidden = registerPins([lower, upper, duplicate, internals], new Map([[lower, 90], [upper, 70], [internals, 130]]), 180);
    expect(resolvePin(hidden, "outbound", "Item").offset).toBeNull();
    expect(resolvePin(hidden, "outbound", "Item()").offset).toBeNull();
    expect(resolvePin(hidden, "outbound", "item").offset).toBe(90);
    const asset = registerPins([], new Map(), 100);
    expect(resolvePin(asset, "inbound", undefined).offset).toBe(50);
    expect(resolvePin(asset, "outbound", "unknown").offset).toBe(50);
  });

  it("reconstructs registration from the graph's original symbols rather than the capture's displayed row order", () => {
    const row = (symbol: string): RowCapture => ({ symbol, label: { text: symbol, font: "row", prepared: null }, badgesWidth: 0 });
    const lower = row("item"), upper = row("Item"), duplicate = row("Item"), internals = row("__internals__");
    const capture = { cards: { a: { id: "a", rows: [upper, duplicate, lower, internals], notes: [], directory: { font: "row" } } } } as unknown as Capture;
    const branches = { subgraph: { nodes: [{ id: "a", publicSymbols: ["item", "Item", "Item"] }], links: [] }, rows: new Map([["a", ["item", "item", "item", "__internals__"]]]), relevantSymbols: new Map(), back: new Set() } as unknown as BranchGraph;
    const view = cardViews(capture, branches, { pins: EMPTY_PIN_SET, selected: "a", collapseOnPin: true, symbolOrder: "layout" }).get("a")!;
    expect(view.rows).toEqual([lower, upper, duplicate, internals]);
    expect(view.registration).toEqual([lower, upper, duplicate, internals]);
  });

  it("constructs both display and endpoint queues in the requested symbol order before the layout reorders names", () => {
    const row = (symbol: string, badgesWidth = 0): RowCapture => ({ symbol, label: { text: symbol, font: "row", prepared: null }, badgesWidth });
    const upper = row("Item"), duplicate = row("Item", 20), lower = row("item"), z = row("z"), internals = row("__internals__");
    const capture = { cards: { a: { id: "a", rows: [upper, duplicate, lower, z, internals], notes: [], directory: { font: "row" } } } } as unknown as Capture;
    const branches = { subgraph: { nodes: [{ id: "a", publicSymbols: ["Item", "Item", "item", "z"] }], links: [] }, rows: new Map([["a", ["item", "item", "item", "z", "__internals__"]]]), relevantSymbols: new Map(), back: new Set() } as unknown as BranchGraph;
    const options = { pins: EMPTY_PIN_SET, selected: "a", collapseOnPin: true };
    const alphabetical = cardViews(capture, branches, { ...options, symbolOrder: "alphabetical" }).get("a")!;
    expect(alphabetical.rows).toEqual([lower, upper, duplicate, z, internals]);
    expect(alphabetical.registration).toEqual([lower, upper, duplicate, z, internals]);
    // The layout can move z ahead, but cannot reverse distinct rows with the same normalized name.
    branches.rows.set("a", ["z", "item", "item", "item", "__internals__"]);
    const layout = cardViews(capture, branches, { ...options, symbolOrder: "layout" }).get("a")!;
    expect(layout.rows).toEqual([z, upper, duplicate, lower, internals]);
    expect(layout.registration).toEqual([upper, duplicate, lower, z, internals]);
    const centres = new Map(layout.rows.map((entry, index) => [entry, 20 * (index + 1)]));
    const metrics = registerPins(layout.registration, centres, 140);
    expect(resolvePin(metrics, "outbound", "Item").offset).toBe(60);
    expect(resolvePin(metrics, "outbound", "item").offset).toBe(80);
    expect(resolvePin(metrics, "outbound", "Item()").offset).toBe(80);
  });

  it("tells a point inside a stepped membrane from one outside, by the even-odd rule", () => {
    const polygon = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 100 }, { x: 0, y: 100 }];
    expect(insidePolygon(polygon, 50, 25)).toBe(true);
    expect(insidePolygon(polygon, 150, 25)).toBe(false);
    expect(insidePolygon(polygon, 150, 75)).toBe(true);
    expect(insidePolygon(polygon, 250, 75)).toBe(false);
  });
});
