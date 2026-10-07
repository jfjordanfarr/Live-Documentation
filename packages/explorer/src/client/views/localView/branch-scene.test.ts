import { describe, expect, it } from "vitest";

import { placementCost } from "./branch-placement";
import { BAND_BORDER, DEFAULT_SCENE_TUNING, hostOf, layoutScene, planBranches, SLOT_LINE, type SceneMeasurer } from "./branch-scene";
import { buildBranches } from "./branches";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET } from "../pin-state";

function node(id: string, symbols: string[] = ["value"]): ExplorerNodePayload {
  return { id, name: id.slice(id.lastIndexOf("/") + 1), codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: symbols };
}

// Three files in two directories: y uses x beside it, z uses y, and z uses x two columns away, so a lane threads column 1.
const files = [node("a/x.ts"), node("a/y.ts"), node("b/z.ts")];
const links = [
  { source: "a/y.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const },
  { source: "b/z.ts", target: "a/y.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const },
  { source: "b/z.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const }
];
const graph: ExplorerGraphPayload = { nodes: files, links, stats: { nodes: 3, links: 3, missingDependencies: 0 } };
const pins = files.reduce((set, file) => addPin(set, file.id, "*"), EMPTY_PIN_SET);
const branches = buildBranches(files[0], graph, pins, () => true);

/** What the measurer was asked, call by call. */
interface Seen { widths: Map<string, number>[]; cards: Map<string, number>[]; labels: Map<string, number>[] }

/** A page that answers with fixed sizes: every card 100 tall, its pins at 40 and its internals at 80, every label 14 tall. */
function measurer(natural: Record<string, number>, seen: Seen): SceneMeasurer {
  return {
    widths(cap) {
      const widths = new Map(Object.entries(natural).map(([id, width]) => [id, cap === null ? width : Math.min(width, cap)]));
      seen.widths.push(widths);
      return widths;
    },
    measure(cardWidths, labelWidths) {
      seen.cards.push(new Map(cardWidths));
      seen.labels.push(new Map(labelWidths));
      return {
        heights: new Map([...cardWidths.keys()].map(id => [id, 100])),
        pin: (_id, direction, symbol) => (symbol === "value" ? 40 : direction === "inbound" ? 80 : 50),
        labelHeights: new Map([...labelWidths.keys()].map(key => [key, 14]))
      };
    }
  };
}

describe("the Local Map's scene", () => {
  it("plans a box per directory with its cards, and a lane where a reference skips a column", () => {
    const plan = planBranches(branches);
    expect(plan.root.kind).toBe("root");
    expect(plan.columnCount).toBe(3);
    const directories = plan.boxes.filter(box => box.kind === "directory").map(box => box.directory).sort();
    expect(directories).toEqual(["a", "b"]);
    expect([...plan.items.values()].map(item => [item.id, item.column])).toEqual([["a/x.ts", 0], ["a/y.ts", 1], ["b/z.ts", 2]]);
    // Every card stands inside a drawn directory, so its inset is the padding and the border.
    for (const item of plan.items.values()) expect(item.inset).toBe(DEFAULT_SCENE_TUNING.bandPadding + BAND_BORDER);
    expect(plan.lanes.size).toBe(1);
    const [lane] = plan.lanes.values();
    expect(lane.kind).toBe("lane");
    expect(lane.minColumn).toBe(1);
    expect(lane.slots).toHaveLength(1);
    expect(lane.directory).toBe("a");
    // The column's stack holds the card and the lane; the lane's element sits in its directory's, and so do the cards'.
    expect(plan.columns[1]).toHaveLength(2);
    expect(hostOf(lane)).toBe(lane);
    expect(lane.anchor?.kind).toBe("directory");
    expect(hostOf(plan.items.get("a/x.ts")!.box).directory).toBe("a");
  });

  it("lays the columns across by the widest card with its insets, asks the page at those widths, and places down", () => {
    const plan = planBranches(branches);
    const seen: Seen = { widths: [], cards: [], labels: [] };
    const scene = layoutScene(plan, branches, measurer({ "a/x.ts": 300, "a/y.ts": 260, "b/z.ts": 280 }, seen), DEFAULT_SCENE_TUNING);
    const inset = DEFAULT_SCENE_TUNING.bandPadding + BAND_BORDER;
    expect(scene.widths).toEqual([300 + 2 * inset, 260 + 2 * inset, 280 + 2 * inset]);
    expect(scene.lefts).toEqual([0, 326 + 100, 326 + 100 + 286 + 100]);
    expect(scene.pictureWidth).toBe(326 + 100 + 286 + 100 + 306);
    // The page was asked once for widths with no cap, and once for heights at each card's column width less its insets.
    expect(seen.widths).toHaveLength(1);
    expect(seen.cards).toHaveLength(1);
    expect([...seen.cards[0]]).toEqual([["a/x.ts", 300], ["a/y.ts", 260], ["b/z.ts", 280]]);
    // Each drawn directory's label was asked at its leftmost segment's width less the insets.
    const a = plan.boxes.find(box => box.directory === "a")!;
    expect(seen.labels[0].get(a.key)).toBe(326 - 2 * inset);
    expect(a.insetTop).toBe(inset + 14);
    // The segments hug the column; the cards stand inside them by the inset, below the label's room.
    expect(a.segments.map(segment => [segment.left, segment.right])).toEqual([[0, 326], [426, 426 + 286]]);
    const x = scene.tops.get("a/x.ts")!;
    expect(x).toBeGreaterThanOrEqual(a.segments[0].top + a.insetTop);
    expect(a.segments[0].bottom).toBeGreaterThanOrEqual(x + 100 + inset);
    // Four wires: y from x, z from y, and z from x in two pieces through the lane's slot at its middle line.
    expect(scene.wires).toHaveLength(4);
    expect(scene.wires.filter(wire => wire.to.offset === SLOT_LINE || wire.from.offset === SLOT_LINE)).toHaveLength(2);
    const [laneKey, lines] = [...scene.slotLines][0];
    expect(plan.lanes.has(laneKey)).toBe(true);
    expect(lines).toEqual([6 + SLOT_LINE]);
    // The positions the scene publishes, the cards' tops and the lanes' slot lines alike, give back the placement's own
    // cost: the slot wires carry cost here, since the lane stands above y in its column while its slot wants x's pin.
    const published = new Map(scene.tops);
    for (const [key, lines] of scene.slotLines) {
      const box = plan.lanes.get(key)!;
      lines.forEach((line, i) => published.set(box.slots![i], box.top + line - SLOT_LINE));
    }
    expect(placementCost(scene.wires, published)).toBe(scene.placement.cost);
    expect(scene.placement.optimal).toBe(true);
    let lowest = 0;
    for (const [id, top] of scene.tops) lowest = Math.max(lowest, top + scene.heights.get(id)!);
    expect(scene.pictureHeight).toBeGreaterThanOrEqual(lowest);
  });

  it("caps the cards' widths through the measurer and takes its gaps and padding from the tuning", () => {
    const plan = planBranches(branches, 20);
    const seen: Seen = { widths: [], cards: [], labels: [] };
    const scene = layoutScene(plan, branches, measurer({ "a/x.ts": 300, "a/y.ts": 260, "b/z.ts": 280 }, seen), { ...DEFAULT_SCENE_TUNING, columnGap: 50, bandPadding: 20, cardMaxWidth: 270 });
    expect([...seen.widths[0].values()]).toEqual([270, 260, 270]);
    expect(scene.widths).toEqual([270 + 42, 260 + 42, 270 + 42]);
    expect(scene.lefts[1]).toBe(312 + 50);
  });
});
