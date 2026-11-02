import { describe, expect, it } from "vitest";

import { linkPulls, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
import { nextRevealCount, revealCorresponding, revealLayers, revealOrder } from "./forceGraphReveal";
import { getDefaultTuning } from "../persistence/local-storage";

const node = (id: string): SpatialNode => ({ id, publicSymbols: [] });
const link = (source: string, target: string, kind?: string): SpatialLink => ({ source, target, count: 1, ...(kind ? { kind } : {}) });
const every = (): boolean => true;
const tuning = getDefaultTuning().forceGraph;

describe("the order a 3D picture is revealed in", () => {
  it("carries corresponding 2D identities forward without adding absent facts or hiding anything already shown", () => {
    const order = ["hub", "near", "later", "folder", "file", "orphan"];
    const next = revealCorresponding(order, 2, new Set(["folder", "file", "hub", "outside-scope"]));
    expect(next).toEqual({ order: ["hub", "near", "folder", "file", "later", "orphan"], shown: 4 });
    expect(order).toEqual(["hub", "near", "later", "folder", "file", "orphan"]);
    expect(revealCorresponding(next.order, next.shown, new Set(["folder", "outside-scope"]))).toEqual(next);
    expect(() => revealCorresponding(order, 7, new Set())).toThrow("within the picture");
  });

  it("enters the attention set first, then what the connecting links reach, a layer at a time, nearest first", () => {
    const chain = ["a", "b", "c", "d", "e"].map(node);
    const links = [link("a", "b"), link("b", "c"), link("c", "d"), link("d", "e")];
    expect(revealLayers(chain, links, { asked: new Set(["c"]) }, every)).toEqual([["c"], ["b", "d"], ["a", "e"]]);
    expect(revealOrder(chain, links, new Set(["c"]), every)).toEqual(["c", "b", "d", "a", "e"]);
    expect(revealOrder(chain, links, new Set(["a"]), every)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("orders a layer most connected first and ties by id, and starts from the most connected sphere with nothing asked", () => {
    const star = ["hub", "leaf-b", "leaf-a", "twig", "sprig"].map(node);
    const links = [link("hub", "leaf-b"), link("hub", "leaf-a"), link("hub", "twig"), link("twig", "sprig")];
    expect(revealLayers(star, links, { asked: new Set() }, every)).toEqual([["hub"], ["twig", "leaf-a", "leaf-b"], ["sprig"]]);
    expect(revealOrder(star, links, new Set(["sprig", "leaf-b"]), every)).toEqual(["leaf-b", "sprig", "hub", "twig", "leaf-a"]);
  });

  it("goes on to the next most connected part when the reach runs out, and enters the spheres nothing reaches last, together", () => {
    const parts = ["p", "q", "r", "x", "y", "z", "w", "lone", "alone"].map(node);
    const links = [link("p", "q"), link("p", "r"), link("x", "y"), link("x", "z"), link("x", "w")];
    expect(revealLayers(parts, links, { asked: new Set(["q"]) }, every)).toEqual([["q"], ["p"], ["r"], ["x"], ["w", "y", "z"], ["alone", "lone"]]);
    const order = revealOrder(parts, links, new Set(), every);
    expect(order).toEqual(["x", "w", "y", "z", "p", "q", "r", "alone", "lone"]);
    expect(new Set(order).size).toBe(parts.length);
  });

  it("enters an open directory's files by hops within the directory from its most connected, part by part, its unconnected files last together, before anything beyond", () => {
    // The directory holds hub, a, b (an island of three), c and d (a pair) and o (alone); outside it, out hangs off a and far off out.
    const nodes = ["hub", "a", "b", "c", "d", "o", "out", "far"].map(node);
    const links = [link("hub", "a"), link("hub", "b"), link("c", "d"), link("a", "out"), link("out", "far")];
    const members = new Set(["hub", "a", "b", "c", "d", "o"]);
    expect(revealLayers(nodes, links, { asked: new Set(), members }, every)).toEqual([["hub"], ["a", "b"], ["c"], ["d"], ["o"], ["out"], ["far"]]);
    // Asked about directly, a file enters first and the directory unfurls from it before the rest of the directory's parts.
    expect(revealLayers(nodes, links, { asked: new Set(["b"]), members }, every)).toEqual([["b"], ["hub"], ["a"], ["c"], ["d"], ["o"], ["out"], ["far"]]);
  });

  it("reaches only over the links the layout says connect, and ignores attention that is not in the picture", () => {
    const nodes = ["directory:src", "src/a", "src/b", "lib/c"].map(node);
    const links = [link("directory:src", "src/a", "containment"), link("directory:src", "src/b", "containment"), link("src/a", "lib/c")];
    const connections = revealOrder(nodes, links, new Set(["src/a", "missing"]), edge => linkPulls(edge, "connections", tuning));
    expect(connections).toEqual(["src/a", "lib/c", "directory:src", "src/b"]);
    const structure = revealOrder(nodes, links, new Set(["src/a", "missing"]), edge => linkPulls(edge, "structure", tuning));
    expect(structure).toEqual(["src/a", "directory:src", "src/b", "lib/c"]);
  });

  it("accepts resolved endpoints, refuses a repeated id, never leaves a layer empty, and enters a sphere once however many links reach it", () => {
    const [a, b, c] = ["a", "b", "c"].map(node);
    const links: SpatialLink[] = [{ source: a, target: b, count: 2 }, { source: b, target: c, count: 1 }, { source: a, target: c, count: 1 }, { source: "a", target: "a", count: 1 }];
    expect(revealLayers([a, b, c], links, { asked: new Set(["b"]) }, every)).toEqual([["b"], ["a", "c"]]);
    expect(revealLayers([], [], { asked: new Set(["b"]) }, every)).toEqual([]);
    expect(() => revealOrder([a, b, node("a")], links, new Set(), every)).toThrow(/one node per id/);
  });
});

describe("how fast it grows", () => {
  it("adds a share of the whole so that any picture enters in the frames given, at least one sphere a frame, never past the total", () => {
    expect(nextRevealCount(1, 124, 60)).toBe(4);
    expect(nextRevealCount(300, 21720, 60)).toBe(662);
    expect(nextRevealCount(21700, 21720, 60)).toBe(21720);
    expect(nextRevealCount(21720, 21720, 60)).toBe(21720);
    expect(nextRevealCount(3, 15, 60)).toBe(4);
    expect(nextRevealCount(0, 7, 1)).toBe(7);
    for (const total of [15, 124, 903, 21720]) {
      let shown = 1, frames = 0;
      while (shown < total) { shown = nextRevealCount(shown, total, 60); frames++; }
      expect(frames, `${total} spheres enter in at most sixty frames`).toBeLessThanOrEqual(60);
    }
  });

  it("refuses counts that are not whole and frames that are not a whole number of at least one", () => {
    expect(() => nextRevealCount(1.5, 10, 60)).toThrow(/whole spheres/);
    expect(() => nextRevealCount(11, 10, 60)).toThrow(/whole spheres/);
    expect(() => nextRevealCount(1, 10, 0)).toThrow(/frames/);
    expect(() => nextRevealCount(1, 10, 2.5)).toThrow(/frames/);
  });
});
