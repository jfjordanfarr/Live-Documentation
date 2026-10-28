import { describe, expect, it } from "vitest";

import { linkPulls, type SpatialLink, type SpatialNode } from "./forceGraphLayout";
import { nextRevealCount, revealOrder } from "./forceGraphReveal";
import { getDefaultTuning } from "../persistence/local-storage";

const node = (id: string): SpatialNode => ({ id, publicSymbols: [] });
const link = (source: string, target: string, kind?: string): SpatialLink => ({ source, target, count: 1, ...(kind ? { kind } : {}) });
const every = (): boolean => true;
const tuning = getDefaultTuning().forceGraph;

describe("the order a 3D picture is revealed in", () => {
  it("enters the attention set first, then what the pulling links reach, a layer at a time, nearest first", () => {
    const chain = ["a", "b", "c", "d", "e"].map(node);
    const links = [link("a", "b"), link("b", "c"), link("c", "d"), link("d", "e")];
    expect(revealOrder(chain, links, new Set(["c"]), every)).toEqual(["c", "b", "d", "a", "e"]);
    expect(revealOrder(chain, links, new Set(["a"]), every)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("orders a layer most connected first and ties by id, and starts from the most connected sphere with nothing retained", () => {
    const star = ["hub", "leaf-b", "leaf-a", "twig", "sprig"].map(node);
    const links = [link("hub", "leaf-b"), link("hub", "leaf-a"), link("hub", "twig"), link("twig", "sprig")];
    expect(revealOrder(star, links, new Set(), every)).toEqual(["hub", "twig", "leaf-a", "leaf-b", "sprig"]);
    expect(revealOrder(star, links, new Set(["sprig", "leaf-b"]), every)).toEqual(["leaf-b", "sprig", "hub", "twig", "leaf-a"]);
  });

  it("goes on to the next most connected part when the reach runs out, until every sphere has entered once", () => {
    const parts = ["p", "q", "r", "x", "y", "z", "w", "lone"].map(node);
    const links = [link("p", "q"), link("p", "r"), link("x", "y"), link("x", "z"), link("x", "w")];
    expect(revealOrder(parts, links, new Set(["q"]), every)).toEqual(["q", "p", "r", "x", "w", "y", "z", "lone"]);
    const order = revealOrder(parts, links, new Set(), every);
    expect(order).toEqual(["x", "w", "y", "z", "p", "q", "r", "lone"]);
    expect(new Set(order).size).toBe(parts.length);
  });

  it("reaches only over the links the layout says pull, and ignores attention that is not in the picture", () => {
    const nodes = ["directory:src", "src/a", "src/b", "lib/c"].map(node);
    const links = [link("directory:src", "src/a", "containment"), link("directory:src", "src/b", "containment"), link("src/a", "lib/c")];
    const connections = revealOrder(nodes, links, new Set(["src/a", "missing"]), edge => linkPulls(edge, "connections", tuning));
    expect(connections).toEqual(["src/a", "lib/c", "directory:src", "src/b"]);
    const structure = revealOrder(nodes, links, new Set(["src/a", "missing"]), edge => linkPulls(edge, "structure", tuning));
    expect(structure).toEqual(["src/a", "directory:src", "src/b", "lib/c"]);
  });

  it("accepts resolved endpoints, refuses a repeated id, and enters a sphere once however many links reach it", () => {
    const [a, b, c] = ["a", "b", "c"].map(node);
    const links: SpatialLink[] = [{ source: a, target: b, count: 2 }, { source: b, target: c, count: 1 }, { source: a, target: c, count: 1 }, { source: "a", target: "a", count: 1 }];
    expect(revealOrder([a, b, c], links, new Set(["b"]), every)).toEqual(["b", "a", "c"]);
    expect(() => revealOrder([a, b, node("a")], links, new Set(), every)).toThrow(/one node per id/);
  });
});

describe("how fast it grows", () => {
  it("adds a share of what is shown, at least the floor, and never passes the total", () => {
    expect(nextRevealCount(300, 21720, 0.1, 10)).toBe(330);
    expect(nextRevealCount(5, 21720, 0.1, 10)).toBe(15);
    expect(nextRevealCount(21700, 21720, 0.1, 10)).toBe(21720);
    expect(nextRevealCount(21720, 21720, 0.1, 10)).toBe(21720);
    expect(nextRevealCount(0, 7, 0.1, 10)).toBe(7);
    let shown = 300, ticks = 0;
    while (shown < 21720) { shown = nextRevealCount(shown, 21720, 0.1, 10); ticks++; }
    expect(ticks).toBe(45);
  });

  it("refuses counts that are not whole, a share that is not finite, or a floor under one", () => {
    expect(() => nextRevealCount(1.5, 10, 0.1, 1)).toThrow(/whole spheres/);
    expect(() => nextRevealCount(11, 10, 0.1, 1)).toThrow(/whole spheres/);
    expect(() => nextRevealCount(1, 10, Infinity, 1)).toThrow(/share/);
    expect(() => nextRevealCount(1, 10, 0.1, 0)).toThrow(/least growth/);
  });
});
