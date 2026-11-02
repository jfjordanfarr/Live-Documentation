import { describe, expect, it } from "vitest";

import { linkPulls, type SpatialLink } from "./forceGraphLayout";
import { componentLandmarks, componentMembers, connectedNeighbours, defaultSpatialLayout, directoryHubOf, directoryMembersWithinHops, spatialScope, startHops, startOf, type StartableNode } from "./forceGraphScope";
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
  it("carries a directory's bounded file neighborhood into Connections and resolves collapsed chains", () => {
    const nodes = [node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" }),
      node("directory:src/deep", { directoryPath: "src/deep" }), node("directory:src/deep/deeper", { directoryPath: "src/deep/deeper" }),
      node("src/direct"), node("src/deep/child"), node("src/deep/deeper/leaf"), node("outside")];
    const links = [link("directory:", "directory:src", "containment"), link("directory:", "outside", "containment"),
      link("directory:src", "src/direct", "containment"), link("directory:src", "directory:src/deep", "containment"),
      link("directory:src/deep", "src/deep/child", "containment"), link("directory:src/deep", "directory:src/deep/deeper", "containment"),
      link("directory:src/deep/deeper", "src/deep/deeper/leaf", "containment")];
    expect(directoryMembersWithinHops(nodes, links, "src", 1)).toEqual(new Set(["src/direct"]));
    expect(directoryMembersWithinHops(nodes, links, "src", 2)).toEqual(new Set(["src/direct", "src/deep/child"]));
    const collapsed = [nodes[0], node("directory:src/deep", { directoryPath: "src/deep" }), node("src/deep/child")];
    expect(directoryHubOf(collapsed, "src")).toBe("directory:src/deep");
    expect(directoryHubOf(collapsed, "missing")).toBeUndefined();
    expect(directoryHubOf([...collapsed, node("src/direct")], "src")).toBeUndefined();
    expect(directoryMembersWithinHops(collapsed, [link("directory:src/deep", "src/deep/child", "containment")], "src", 1))
      .toEqual(new Set(["src/deep/child"]));
  });

  it("names every disconnected group and isolated file, choosing the most connected member deterministically", () => {
    const graph = [...chain, node("x"), node("y")], links = [...chainLinks, link("x", "y")];
    expect(componentLandmarks(connectedNeighbours(graph, links, connections))).toEqual(new Map([["c", 6], ["g", 1], ["x", 2]]));
    expect(componentLandmarks(connectedNeighbours([...graph].reverse(), [...links].reverse(), connections))).toEqual(new Map([["c", 6], ["g", 1], ["x", 2]]));
    expect(componentMembers(connectedNeighbours(graph, links, connections)).get("c")).toEqual(["a", "b", "c", "d", "e", "f"]);
    // A seed must be allowed to seed: barred from c, the group is seeded by its next most connected member; barred from every member, by its most connected.
    expect([...componentMembers(connectedNeighbours(graph, links, connections), id => id !== "c").keys()]).toEqual(["b", "g", "x"]);
    expect([...componentMembers(connectedNeighbours(graph, links, connections), () => false).keys()]).toEqual(["c", "g", "x"]);
  });

  it("shows the attention set, then a hop at a time up to the hops asked, each sphere at its nearest hop, and every unreached group's seed one hop past the last", () => {
    const scope = spatialScope(chain, chainLinks, new Set(["c"]), 2, connections);
    expect([...scope.hops]).toEqual([["c", 0], ["b", 1], ["d", 1], ["f", 1], ["a", 2], ["e", 2], ["g", 3]]);
    expect(scope.groups, "the island g stands by its seed, a group of one").toEqual(new Map([["g", 1]]));
    expect(spatialScope(chain, chainLinks, new Set(["a"]), 1, connections).hops).toEqual(new Map([["a", 0], ["b", 1], ["g", 2]]));
    expect(spatialScope(chain, chainLinks, new Set(["a", "e"]), 0, connections).hops).toEqual(new Map([["a", 0], ["e", 0], ["g", 1]]));
    // Reached from two sides, c stands at the nearer hop.
    expect(spatialScope(chain, chainLinks, new Set(["b", "e"]), 2, connections).hops.get("c")).toBe(1);
  });

  it("names a group by its seed while nothing else of it is shown, and stops once the group grows", () => {
    const graph = [...chain, node("x"), node("y")], links = [...chainLinks, link("x", "y")];
    // The archipelago: every seed asked about, nothing grown; the groups of more than one file are named by their size.
    const archipelago = spatialScope(graph, links, startOf(graph, links, "connections", connections), startHops("connections", 2), connections);
    expect(archipelago.hops).toEqual(new Map([["c", 0], ["g", 0], ["x", 0]]));
    expect(archipelago.groups).toEqual(new Map([["c", 6], ["x", 2]]));
    // The pin on c grows its group; x's group stands by its dimmed seed and g by itself.
    const pinned = spatialScope(graph, links, new Set(["c"]), 1, connections);
    expect(pinned.hops).toEqual(new Map([["c", 0], ["b", 1], ["d", 1], ["f", 1], ["g", 2], ["x", 2]]));
    expect(pinned.groups).toEqual(new Map([["g", 1], ["x", 2]]));
    expect(pinned.beyond.get("x"), "a seed's count beyond is its own connections, not shown").toBe(1);
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
    expect(scope.hops).toEqual(new Map([["a", 0], ["b", 1], ["g", 2]]));
    expect(scope.beyond).toEqual(new Map([["b", 1]]));
    expect(() => spatialScope(chain, chainLinks, new Set(["a"]), 1.5, connections)).toThrow(/whole/);
    expect(() => spatialScope(chain, chainLinks, new Set(["a"]), -1, connections)).toThrow(/nonnegative/);
  });

  it("reaches only over the links that connect in the layout: references in connections, containment in structure", () => {
    const nodes = [node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" }), node("src/a"), node("src/b"), node("lib/c")];
    const links = [link("directory:", "directory:src", "containment"), link("directory:src", "src/a", "containment"), link("directory:src", "src/b", "containment"), link("src/a", "lib/c")];
    // Over the references src/b is a group of its own, so its seed stands past the last hop; the hubs, joined by nothing
    // here, are the tree's and never a group of the picture.
    expect(spatialScope(nodes, links, new Set(["src/a"]), 2, connections).hops).toEqual(new Map([["src/a", 0], ["lib/c", 1], ["src/b", 3]]));
    // Over containment lib/c, which no directory holds in this fixture, is the group the hops cannot reach.
    expect(spatialScope(nodes, links, new Set(["src/a"]), 2, structure).hops).toEqual(new Map([["src/a", 0], ["directory:src", 1], ["directory:", 2], ["src/b", 2], ["lib/c", 3]]));
    // The root with its children in full and its grandchildren one hop further: the structure start.
    expect(spatialScope(nodes, links, new Set(["directory:"]), 2, structure).hops).toEqual(new Map([["directory:", 0], ["directory:src", 1], ["src/a", 2], ["src/b", 2], ["lib/c", 3]]));
  });

  it("stands a tree by its top hub when the hops reach nothing of it, as a group stands by its seed", () => {
    const nodes = [node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" }), node("src/a"), node("src/b"), node("readme")];
    const links = [link("directory:", "directory:src", "containment"), link("directory:", "readme", "containment"),
      link("directory:src", "src/a", "containment"), link("directory:src", "src/b", "containment")];
    // Asked about a file the picture does not hold, as at a moment before its birth: the root alone, one past the hops,
    // named by the tree's three files; before, the tree was seeded by its first file by id, a handle of nothing.
    const absent = spatialScope(nodes, links, new Set(["src/born-later"]), 2, structure);
    expect(absent.hops).toEqual(new Map([["directory:", 3]]));
    expect(absent.groups).toEqual(new Map([["directory:", 3]]));
    // Reached, the tree needs no handle; a root asked about alone is named by its files.
    expect(spatialScope(nodes, links, new Set(["src/a"]), 1, structure).groups.size).toBe(0);
    expect(spatialScope(nodes, links, new Set(["directory:"]), 0, structure).groups).toEqual(new Map([["directory:", 3]]));
    // In Connections the same files are three lone seeds, and the hubs, joined by no reference, are no group of the picture's.
    expect(spatialScope(nodes, links, new Set(["src/born-later"]), 2, connections).hops).toEqual(new Map([["src/a", 3], ["src/b", 3], ["readme", 3]]));
  });
});

describe("where a picture starts with nothing asked about", () => {
  it("defaults to Structure without declared entries, ignoring inferred fixture mains and commands", () => {
    expect(defaultSpatialLayout([])).toBe("structure");
    expect(defaultSpatialLayout([node("main", { entryReasons: ["program", "command"] })])).toBe("structure");
    expect(defaultSpatialLayout([node("entry", { entryReasons: ["declared", "program"] })])).toBe("connections");
  });

  const nodes = [node("src/main.ts", { entryReasons: ["declared"] }), node("src/style.css", { entryReasons: ["declared"] }), node("src/hub.ts", { entryReasons: ["program"] }),
    node("src/a.ts"), node("src/b.ts"), node("related:README.md", { archetype: "related-doc" }), node("directory:", { directoryPath: "" }), node("directory:src", { directoryPath: "src" })];
  const links = [link("src/hub.ts", "src/a.ts"), link("src/hub.ts", "src/b.ts"), link("src/hub.ts", "src/main.ts"), link("src/a.ts", "related:README.md", "related-doc"),
    link("src/b.ts", "related:README.md", "related-doc"), link("src/main.ts", "related:README.md", "related-doc"), link("src/hub.ts", "related:README.md", "related-doc"),
    link("directory:", "directory:src", "containment"), link("directory:src", "src/main.ts", "containment")];

  it("starts the structure layout at the scan root's hub, with the hops around it", () => {
    expect(startOf(nodes, links, "structure", structure)).toEqual(new Set(["directory:"]));
    expect(startHops("structure", 2)).toBe(2);
  });

  it("starts the connections layout at the archipelago: every group's most connected file, a lone file its own seed, a declared entry no longer the start, and nothing grown", () => {
    // The document is cited by four files and the hub file connects to four: the file seeds the group, since a
    // document or a hub seeds nothing a file is in; the stylesheet, declared but wired to nothing, is a group of one.
    expect(startOf(nodes, links, "connections", connections)).toEqual(new Set(["src/hub.ts", "src/style.css"]));
    expect(startHops("connections", 2)).toBe(0);
    // A document alone in the picture is a group of one, seeded by itself.
    expect(startOf([...nodes, node("related:LONE.md", { archetype: "related-doc" })], links, "connections", connections))
      .toEqual(new Set(["src/hub.ts", "src/style.css", "related:LONE.md"]));
  });

  it("seeds a group by its most connected file, ties by id, and has no start for an empty picture", () => {
    expect(startOf([node("z"), node("y")], [link("z", "y")], "connections", connections)).toEqual(new Set(["y"]));
    expect(startOf([node("z"), node("y"), node("x")], [link("z", "y"), link("z", "x")], "connections", connections)).toEqual(new Set(["z"]));
    expect(startOf([], [], "connections", connections)).toEqual(new Set());
    // A structure picture without a root hub (none built yet) starts as the connections one would.
    expect(startOf([node("lone")], [], "structure", structure)).toEqual(new Set(["lone"]));
  });
});
