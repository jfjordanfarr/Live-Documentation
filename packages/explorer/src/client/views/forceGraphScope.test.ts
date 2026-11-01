import { describe, expect, it } from "vitest";

import { linkPulls, type SpatialLink } from "./forceGraphLayout";
import { spatialScope, startOf, type StartableNode } from "./forceGraphScope";
import { getDefaultTuning } from "../persistence/local-storage";

const node = (id: string, more: Partial<StartableNode> = {}): StartableNode => ({ id, publicSymbols: [], ...more });
const link = (source: string, target: string, kind = "dependency"): SpatialLink<StartableNode> => ({ source, target, count: 1, kind });
const tuning = getDefaultTuning().forceGraph;
const connections = (edge: SpatialLink<StartableNode>): boolean => linkPulls(edge, "connections", tuning);
const structure = (edge: SpatialLink<StartableNode>): boolean => linkPulls(edge, "structure", tuning);

// a - b - c - d - e, with f hanging off c and g an island.
const chain = ["a", "b", "c", "d", "e", "f", "g"].map(id => node(id));
const chainLinks = [link("a", "b"), link("b", "c"), link("c", "d"), link("d", "e"), link("c", "f")];

describe("what the picture shows around what was asked about", () => {
  it("shows the attention set, then a hop at a time up to the hops asked, each sphere at its nearest hop", () => {
    const scope = spatialScope(chain, chainLinks, new Set(["c"]), 2, connections);
    expect([...scope.hops]).toEqual([["c", 0], ["b", 1], ["d", 1], ["f", 1], ["a", 2], ["e", 2]]);
    expect(spatialScope(chain, chainLinks, new Set(["a"]), 1, connections).hops).toEqual(new Map([["a", 0], ["b", 1]]));
    expect(spatialScope(chain, chainLinks, new Set(["a", "e"]), 0, connections).hops).toEqual(new Map([["a", 0], ["e", 0]]));
    // Reached from two sides, c stands at the nearer hop.
    expect(spatialScope(chain, chainLinks, new Set(["b", "e"]), 2, connections).hops.get("c")).toBe(1);
  });

  it("counts, for the spheres shown, the connected spheres the picture leaves out", () => {
    const scope = spatialScope(chain, chainLinks, new Set(["a"]), 1, connections);
    expect(scope.beyond).toEqual(new Map([["b", 1]]));
    const whole = spatialScope(chain, chainLinks, new Set(["c"]), 2, connections);
    expect(whole.beyond.size, "nothing connected is left out of the whole island").toBe(0);
    expect(spatialScope(chain, chainLinks, new Set(["c"]), 1, connections).beyond).toEqual(new Map([["b", 1], ["d", 1]]));
  });

  it("ignores attention that is not in the picture, counts a pair once however many links join it, and refuses a hop count that is not whole", () => {
    const doubled = [...chainLinks, link("a", "b", "type-reference"), link("b", "a")];
    const scope = spatialScope(chain, doubled, new Set(["a", "missing"]), 1, connections);
    expect(scope.hops).toEqual(new Map([["a", 0], ["b", 1]]));
    expect(scope.beyond).toEqual(new Map([["b", 1]]));
    expect(() => spatialScope(chain, chainLinks, new Set(["a"]), 1.5, connections)).toThrow(/whole/);
    expect(() => spatialScope(chain, chainLinks, new Set(["a"]), -1, connections)).toThrow(/nonnegative/);
  });

  it("reaches only over the links that connect in the layout: references in connections, containment in structure", () => {
    const nodes = [node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" }), node("src/a"), node("src/b"), node("lib/c")];
    const links = [link("directory:", "directory:src", "containment"), link("directory:src", "src/a", "containment"), link("directory:src", "src/b", "containment"), link("src/a", "lib/c")];
    expect(spatialScope(nodes, links, new Set(["src/a"]), 2, connections).hops).toEqual(new Map([["src/a", 0], ["lib/c", 1]]));
    expect(spatialScope(nodes, links, new Set(["src/a"]), 2, structure).hops).toEqual(new Map([["src/a", 0], ["directory:src", 1], ["directory:", 2], ["src/b", 2]]));
    // The root with its children in full and its grandchildren one hop further: the structure start.
    expect(spatialScope(nodes, links, new Set(["directory:"]), 2, structure).hops).toEqual(new Map([["directory:", 0], ["directory:src", 1], ["src/a", 2], ["src/b", 2]]));
  });
});

describe("where a picture starts with nothing asked about", () => {
  const nodes = [node("src/main.ts", { entryReasons: ["declared"] }), node("src/style.css", { entryReasons: ["declared"] }), node("src/hub.ts", { entryReasons: ["program"] }),
    node("src/a.ts"), node("src/b.ts"), node("related:README.md", { archetype: "related-doc" }), node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" })];
  const links = [link("src/hub.ts", "src/a.ts"), link("src/hub.ts", "src/b.ts"), link("src/hub.ts", "src/main.ts"), link("src/a.ts", "related:README.md", "related-doc"),
    link("src/b.ts", "related:README.md", "related-doc"), link("src/main.ts", "related:README.md", "related-doc"), link("src/hub.ts", "related:README.md", "related-doc"),
    link("directory:", "directory:src", "containment"), link("directory:src", "src/main.ts", "containment")];

  it("starts the structure layout at the scan root's hub", () => {
    expect(startOf(nodes, links, "structure", structure)).toEqual(new Set(["directory:"]));
  });

  it("starts the connections layout at the declared entry points when the repository declares any", () => {
    expect(startOf(nodes, links, "connections", connections)).toEqual(new Set(["src/main.ts", "src/style.css"]));
  });

  it("falls back to the most connected file, never a document or a hub, ties by id, and has no start for an empty picture", () => {
    const undeclared = nodes.filter(entry => !entry.entryReasons?.includes("declared"));
    // The document is cited by four files, the hub file connects to three: the file wins.
    expect(startOf(undeclared, links, "connections", connections)).toEqual(new Set(["src/hub.ts"]));
    expect(startOf([node("z"), node("y")], [link("z", "y")], "connections", connections)).toEqual(new Set(["y"]));
    expect(startOf([], [], "connections", connections)).toEqual(new Set());
    // A structure picture without a root hub (none built yet) starts as the connections one would.
    expect(startOf([node("lone")], [], "structure", structure)).toEqual(new Set(["lone"]));
  });
});
