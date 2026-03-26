/**
 * Tests for the pin-layout dependency-flow layout engine.
 */
import { describe, it, expect } from "vitest";
import type { ExplorerLinkPayload, ExplorerNodePayload } from "../../../shared/types";
import type { PinSet } from "./pin-state";
import { addPin, EMPTY_PIN_SET } from "./pin-state";
import { computePinLayout, parentDirectory, computeLCA, buildAncestorChain, computeDirectoryBands } from "./pin-layout";

// ─── Test Helpers ──────────────────────────────────────────────────

function makeNode(id: string, symbols: string[] = []): ExplorerNodePayload {
  return {
    id,
    name: id.split("/").pop()!,
    codeRelativePath: id,
    docRelativePath: id,
    archetype: "source",
    publicSymbols: symbols,
    dependencyPaths: [],
  } as unknown as ExplorerNodePayload;
}

function makeLink(
  sourceId: string,
  targetId: string,
  sourceSymbol?: string,
  targetSymbol?: string,
): ExplorerLinkPayload {
  return {
    source: sourceId,
    target: targetId,
    kind: "dependency" as const,
    sourceSymbol,
    targetSymbol,
  };
}

function buildNodesById(...nodes: ExplorerNodePayload[]): Map<string, ExplorerNodePayload> {
  return new Map(nodes.map(n => [n.id, n]));
}

// ─── Tests ─────────────────────────────────────────────────────────

describe("parentDirectory", () => {
  it("returns parent path for nested file", () => {
    expect(parentDirectory("packages/shared/types.ts")).toBe("packages/shared");
  });

  it("returns empty string for root-level file", () => {
    expect(parentDirectory("index.ts")).toBe("");
  });

  it("handles deeply nested paths", () => {
    expect(parentDirectory("a/b/c/d.ts")).toBe("a/b/c");
  });
});

describe("computePinLayout", () => {
  describe("empty state", () => {
    it("returns empty result for no pins", () => {
      const result = computePinLayout(EMPTY_PIN_SET, [], new Map());
      expect(result.relevantNodeIds.size).toBe(0);
      expect(result.columnCount).toBe(0);
      expect(result.membraneGroups).toHaveLength(0);
    });
  });

  describe("single pinned node with no connections", () => {
    it("places the pinned node in a single column", () => {
      const nodeA = makeNode("src/a.ts", ["Foo"]);
      const nodesById = buildNodesById(nodeA);
      const pinSet = addPin(EMPTY_PIN_SET, "src/a.ts", "Foo");

      const result = computePinLayout(pinSet, [], nodesById);

      expect(result.relevantNodeIds.size).toBe(1);
      expect(result.relevantNodeIds.has("src/a.ts")).toBe(true);
      expect(result.columnCount).toBe(1);
      expect(result.columns.get("src/a.ts")).toBe(0);
      expect(result.flowNodes.get("src/a.ts")?.role).toBe("pinned");
      expect(result.columnLabels).toEqual(["Pinned"]);
    });
  });

  describe("basic dependency chain", () => {
    // A depends on B (A uses B)
    // link: source=A, target=B means A depends on B
    // So B is upstream (left), A is pinned (center)
    it("places dependency upstream and pinned node center", () => {
      const nodeA = makeNode("src/a.ts", ["Foo"]);
      const nodeB = makeNode("lib/b.ts", ["Bar"]);
      const nodesById = buildNodesById(nodeA, nodeB);
      const links: ExplorerLinkPayload[] = [
        makeLink("src/a.ts", "lib/b.ts", "Foo", "Bar"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/a.ts", "Foo");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(2);
      expect(result.columnCount).toBe(2);

      // B is upstream (dependency), should be in column 0
      // A is pinned, should be in column 1
      const colA = result.columns.get("src/a.ts")!;
      const colB = result.columns.get("lib/b.ts")!;
      expect(colB).toBeLessThan(colA);

      expect(result.flowNodes.get("lib/b.ts")?.role).toBe("upstream");
      expect(result.flowNodes.get("src/a.ts")?.role).toBe("pinned");
    });

    it("places dependent downstream of pinned node", () => {
      const nodeA = makeNode("src/a.ts", ["Foo"]);
      const nodeC = makeNode("views/c.ts", ["Baz"]);
      const nodesById = buildNodesById(nodeA, nodeC);
      // C depends on A (C uses A)
      const links: ExplorerLinkPayload[] = [
        makeLink("views/c.ts", "src/a.ts", "Baz", "Foo"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/a.ts", "Foo");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(2);
      expect(result.columnCount).toBe(2);

      const colA = result.columns.get("src/a.ts")!;
      const colC = result.columns.get("views/c.ts")!;
      expect(colC).toBeGreaterThan(colA);

      expect(result.flowNodes.get("src/a.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("views/c.ts")?.role).toBe("downstream");
    });
  });

  describe("three-node chain", () => {
    it("A→B→C produces 3 columns when B is pinned", () => {
      const nodeA = makeNode("src/a.ts", ["A1"]);
      const nodeB = makeNode("src/b.ts", ["B1"]);
      const nodeC = makeNode("src/c.ts", ["C1"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC);
      // A depends on B, B depends on C
      const links: ExplorerLinkPayload[] = [
        makeLink("src/a.ts", "src/b.ts", "A1", "B1"),
        makeLink("src/b.ts", "src/c.ts", "B1", "C1"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/b.ts", "B1");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(3);
      expect(result.columnCount).toBe(3);

      const colA = result.columns.get("src/a.ts")!;
      const colB = result.columns.get("src/b.ts")!;
      const colC = result.columns.get("src/c.ts")!;

      // C is upstream of B, B is pinned, A is downstream of B
      expect(colC).toBeLessThan(colB);
      expect(colB).toBeLessThan(colA);

      expect(result.flowNodes.get("src/c.ts")?.role).toBe("upstream");
      expect(result.flowNodes.get("src/b.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("src/a.ts")?.role).toBe("downstream");
    });
  });

  describe("membrane grouping", () => {
    it("groups nodes by parent directory within columns", () => {
      const nodeA = makeNode("shared/types.ts", ["Type1"]);
      const nodeB = makeNode("shared/utils.ts", ["Util1"]);
      const nodeC = makeNode("views/main.ts", ["View1"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC);
      // C depends on both A and B
      const links: ExplorerLinkPayload[] = [
        makeLink("views/main.ts", "shared/types.ts", "View1", "Type1"),
        makeLink("views/main.ts", "shared/utils.ts", "View1", "Util1"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "views/main.ts", "View1");

      const result = computePinLayout(pinSet, links, nodesById);

      // A and B should be in the same column (upstream) and same membrane (shared/)
      const colA = result.columns.get("shared/types.ts")!;
      const colB = result.columns.get("shared/utils.ts")!;
      expect(colA).toBe(colB);

      // Find the membrane group for shared/ in the upstream column
      const sharedGroup = result.membraneGroups.find(
        g => g.directory === "shared" && g.column === colA
      );
      expect(sharedGroup).toBeDefined();
      expect(sharedGroup!.nodeIds).toContain("shared/types.ts");
      expect(sharedGroup!.nodeIds).toContain("shared/utils.ts");
    });

    it("separates nodes from different directories into different groups", () => {
      const nodeA = makeNode("lib/a.ts", ["A1"]);
      const nodeB = makeNode("utils/b.ts", ["B1"]);
      const nodeC = makeNode("src/c.ts", ["C1"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC);
      // C depends on A and B (both upstream)
      const links: ExplorerLinkPayload[] = [
        makeLink("src/c.ts", "lib/a.ts", "C1", "A1"),
        makeLink("src/c.ts", "utils/b.ts", "C1", "B1"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/c.ts", "C1");

      const result = computePinLayout(pinSet, links, nodesById);

      // lib/ and utils/ should be separate membrane groups
      const libGroup = result.membraneGroups.find(g => g.directory === "lib");
      const utilsGroup = result.membraneGroups.find(g => g.directory === "utils");
      expect(libGroup).toBeDefined();
      expect(utilsGroup).toBeDefined();
      expect(libGroup!.nodeIds).toContain("lib/a.ts");
      expect(utilsGroup!.nodeIds).toContain("utils/b.ts");
    });
  });

  describe("column labels", () => {
    it("generates correct labels for 3-column layout", () => {
      const nodeA = makeNode("src/a.ts", ["A1"]);
      const nodeB = makeNode("src/b.ts", ["B1"]);
      const nodeC = makeNode("src/c.ts", ["C1"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC);
      const links: ExplorerLinkPayload[] = [
        makeLink("src/a.ts", "src/b.ts", "A1", "B1"),
        makeLink("src/b.ts", "src/c.ts", "B1", "C1"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/b.ts", "B1");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.columnLabels).toEqual(["Dependencies", "Pinned", "Dependents"]);
    });

    it("multiple pinned nodes in a chain spread topologically", () => {
      const nodes = [
        makeNode("a.ts", ["A"]),
        makeNode("b.ts", ["B"]),
        makeNode("c.ts", ["C"]),
        makeNode("d.ts", ["D"]),
        makeNode("e.ts", ["E"]),
      ];
      const nodesById = buildNodesById(...nodes);
      // Chain: a→b→c→d→e (a depends on b depends on c depends on d depends on e)
      const links: ExplorerLinkPayload[] = [
        makeLink("a.ts", "b.ts", "A", "B"),
        makeLink("b.ts", "c.ts", "B", "C"),
        makeLink("c.ts", "d.ts", "C", "D"),
        makeLink("d.ts", "e.ts", "D", "E"),
      ];
      // Pin b, c, d: they have inter-pinned deps, so they spread topologically
      let pinSet = addPin(EMPTY_PIN_SET, "b.ts", "B");
      pinSet = addPin(pinSet, "c.ts", "C");
      pinSet = addPin(pinSet, "d.ts", "D");

      const result = computePinLayout(pinSet, links, nodesById);

      // All 5 nodes visible (a from b, e from d)
      expect(result.relevantNodeIds.size).toBe(5);
      // d(root)→0, c→1, b→2 + e at -1, a at +3 = 5 columns
      expect(result.columnCount).toBe(5);

      const colE = result.columns.get("e.ts")!;
      const colD = result.columns.get("d.ts")!;
      const colC = result.columns.get("c.ts")!;
      const colB = result.columns.get("b.ts")!;
      const colA = result.columns.get("a.ts")!;
      expect(colE).toBeLessThan(colD);
      expect(colD).toBeLessThan(colC);
      expect(colC).toBeLessThan(colB);
      expect(colB).toBeLessThan(colA);

      // All pinned nodes retain "pinned" role regardless of column
      expect(result.flowNodes.get("b.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("c.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("d.ts")?.role).toBe("pinned");
    });

    it("single pin produces 1-hop labels only", () => {
      const nodeA = makeNode("a.ts", ["A"]);
      const nodeB = makeNode("b.ts", ["B"]);
      const nodeC = makeNode("c.ts", ["C"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC);
      // b depends on c, a depends on b
      const links: ExplorerLinkPayload[] = [
        makeLink("a.ts", "b.ts", "A", "B"),
        makeLink("b.ts", "c.ts", "B", "C"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "b.ts", "B");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.columnCount).toBe(3);
      expect(result.columnLabels).toEqual(["Dependencies", "Pinned", "Dependents"]);
    });
  });

  describe("multiple pinned nodes", () => {
    it("pins on two nodes with shared dependency", () => {
      const nodeA = makeNode("src/a.ts", ["A1"]);
      const nodeB = makeNode("src/b.ts", ["B1"]);
      const nodeShared = makeNode("lib/shared.ts", ["S1"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeShared);
      // Both A and B depend on shared
      const links: ExplorerLinkPayload[] = [
        makeLink("src/a.ts", "lib/shared.ts", "A1", "S1"),
        makeLink("src/b.ts", "lib/shared.ts", "B1", "S1"),
      ];
      let pinSet: PinSet = addPin(EMPTY_PIN_SET, "src/a.ts", "A1");
      pinSet = addPin(pinSet, "src/b.ts", "B1");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(3);
      // Both pinned nodes should be in the same column
      expect(result.columns.get("src/a.ts")).toBe(result.columns.get("src/b.ts"));
      // Shared should be upstream
      expect(result.columns.get("lib/shared.ts")).toBeLessThan(
        result.columns.get("src/a.ts")!
      );
    });
  });

  describe("nodes not in nodesById are excluded", () => {
    it("skips links referencing unknown nodes", () => {
      const nodeA = makeNode("src/a.ts", ["A1"]);
      const nodesById = buildNodesById(nodeA);
      // Link to a node not in nodesById
      const links: ExplorerLinkPayload[] = [
        makeLink("src/a.ts", "unknown/x.ts", "A1", "X1"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "src/a.ts", "A1");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(1);
      expect(result.relevantNodeIds.has("unknown/x.ts")).toBe(false);
    });
  });

  describe("diamond dependency pattern", () => {
    it("single pin sees only 1-hop neighbors", () => {
      //   A
      //  / \
      // B   C
      //  \ /
      //   D (pinned)
      const nodeA = makeNode("a.ts", ["A"]);
      const nodeB = makeNode("b.ts", ["B"]);
      const nodeC = makeNode("c.ts", ["C"]);
      const nodeD = makeNode("d.ts", ["D"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC, nodeD);
      // D depends on B and C; B and C both depend on A
      const links: ExplorerLinkPayload[] = [
        makeLink("d.ts", "b.ts", "D", "B"),
        makeLink("d.ts", "c.ts", "D", "C"),
        makeLink("b.ts", "a.ts", "B", "A"),
        makeLink("c.ts", "a.ts", "C", "A"),
      ];
      const pinSet = addPin(EMPTY_PIN_SET, "d.ts", "D");

      const result = computePinLayout(pinSet, links, nodesById);

      // Only 1-hop: D sees B and C but NOT A (A's links don't involve pinned symbol)
      expect(result.relevantNodeIds.size).toBe(3);
      expect(result.columnCount).toBe(2);

      const colB = result.columns.get("b.ts")!;
      const colD = result.columns.get("d.ts")!;
      expect(colB).toBeLessThan(colD);
      // B and C should be in the same column
      expect(result.columns.get("b.ts")).toBe(result.columns.get("c.ts"));
    });

    it("pinning intermediate nodes reveals full diamond with 3 columns", () => {
      const nodeA = makeNode("a.ts", ["A"]);
      const nodeB = makeNode("b.ts", ["B"]);
      const nodeC = makeNode("c.ts", ["C"]);
      const nodeD = makeNode("d.ts", ["D"]);
      const nodesById = buildNodesById(nodeA, nodeB, nodeC, nodeD);
      const links: ExplorerLinkPayload[] = [
        makeLink("d.ts", "b.ts", "D", "B"),
        makeLink("d.ts", "c.ts", "D", "C"),
        makeLink("b.ts", "a.ts", "B", "A"),
        makeLink("c.ts", "a.ts", "C", "A"),
      ];
      // Pin D, B, and C — B and C are roots (no inter-pinned deps),
      // D depends on B and C so it gets depth +1.
      // A is upstream of B/C at depth -1.
      let pinSet = addPin(EMPTY_PIN_SET, "d.ts", "D");
      pinSet = addPin(pinSet, "b.ts", "B");
      pinSet = addPin(pinSet, "c.ts", "C");

      const result = computePinLayout(pinSet, links, nodesById);

      expect(result.relevantNodeIds.size).toBe(4);
      // A(-1→0), B/C(0→1), D(1→2) = 3 columns
      expect(result.columnCount).toBe(3);

      const colA = result.columns.get("a.ts")!;
      const colB = result.columns.get("b.ts")!;
      const colC = result.columns.get("c.ts")!;
      const colD = result.columns.get("d.ts")!;
      expect(colA).toBeLessThan(colB);
      expect(colB).toBe(colC);  // B and C share a column (both roots)
      expect(colB).toBeLessThan(colD);

      // All pinned nodes retain "pinned" role
      expect(result.flowNodes.get("b.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("c.ts")?.role).toBe("pinned");
      expect(result.flowNodes.get("d.ts")?.role).toBe("pinned");
    });
  });

  describe("LCA and ancestor chain", () => {
    it("computes LCA for files in the same directory", () => {
      const a = makeNode("pkg/src/foo.ts", ["A"]);
      const b = makeNode("pkg/src/bar.ts", ["B"]);
      const links = [makeLink("pkg/src/foo.ts", "pkg/src/bar.ts", undefined, "symbol-b")];
      const nodesById = buildNodesById(a, b);
      let pinSet: PinSet = EMPTY_PIN_SET;
      pinSet = addPin(pinSet, "pkg/src/foo.ts", "A");

      const result = computePinLayout(pinSet, links, nodesById);
      expect(result.lcaDirectory).toBe("pkg/src");
      expect(result.ancestorChain).toEqual(["pkg", "pkg/src"]);
    });

    it("computes LCA for files in different directories", () => {
      const a = makeNode("packages/server/handler.ts", ["A"]);
      const b = makeNode("packages/shared/types.ts", ["B"]);
      const links = [makeLink("packages/server/handler.ts", "packages/shared/types.ts", undefined, "symbol-b")];
      const nodesById = buildNodesById(a, b);
      let pinSet: PinSet = EMPTY_PIN_SET;
      pinSet = addPin(pinSet, "packages/server/handler.ts", "A");

      const result = computePinLayout(pinSet, links, nodesById);
      expect(result.lcaDirectory).toBe("packages");
      expect(result.ancestorChain).toEqual(["packages"]);
    });

    it("returns empty LCA when files span root-level directories", () => {
      const a = makeNode("data/stuff.ts", ["A"]);
      const b = makeNode("scripts/tool.ts", ["B"]);
      const links = [makeLink("data/stuff.ts", "scripts/tool.ts", undefined, "symbol-b")];
      const nodesById = buildNodesById(a, b);
      let pinSet: PinSet = EMPTY_PIN_SET;
      pinSet = addPin(pinSet, "data/stuff.ts", "A");

      const result = computePinLayout(pinSet, links, nodesById);
      expect(result.lcaDirectory).toBe("");
      expect(result.ancestorChain).toEqual([]);
    });
  });
});

// ─── Standalone helper tests ───────────────────────────────────────

describe("computeLCA", () => {
  it("returns common prefix for same-directory files", () => {
    expect(computeLCA(["a/b/c/file1.ts", "a/b/c/file2.ts"])).toBe("a/b/c");
  });

  it("returns empty string for root-level files", () => {
    expect(computeLCA(["file1.ts", "file2.ts"])).toBe("");
  });

  it("handles single file", () => {
    expect(computeLCA(["a/b/c/file.ts"])).toBe("a/b/c");
  });

  it("handles empty array", () => {
    expect(computeLCA([])).toBe("");
  });

  it("finds shallow common prefix for divergent paths", () => {
    expect(computeLCA(["a/x/file.ts", "a/y/file.ts"])).toBe("a");
  });
});

describe("buildAncestorChain", () => {
  it("builds progressive path segments", () => {
    expect(buildAncestorChain("a/b/c")).toEqual(["a", "a/b", "a/b/c"]);
  });

  it("returns empty for empty string", () => {
    expect(buildAncestorChain("")).toEqual([]);
  });

  it("handles single segment", () => {
    expect(buildAncestorChain("packages")).toEqual(["packages"]);
  });
});

// ─── Directory Band Tests ──────────────────────────────────────────

describe("computeDirectoryBands", () => {
  function makeFlowNode(id: string, column: number, directory: string) {
    return { id, column, role: "upstream" as const, directory };
  }

  it("returns empty for no nodes", () => {
    expect(computeDirectoryBands(new Map())).toEqual([]);
  });

  it("produces a single band for nodes in one directory", () => {
    const nodes = new Map([
      ["a.ts", makeFlowNode("a.ts", 0, "src")],
      ["b.ts", makeFlowNode("b.ts", 1, "src")],
    ]);
    const bands = computeDirectoryBands(nodes);
    expect(bands).toHaveLength(1);
    expect(bands[0].directory).toBe("src");
    expect(bands[0].minColumn).toBe(0);
    expect(bands[0].maxColumn).toBe(1);
    expect(bands[0].bandRow).toBe(0);
    expect(bands[0].allNodeIds).toEqual(["a.ts", "b.ts"]);
  });

  it("non-overlapping directories share the same band row", () => {
    // dir "lib" spans col 0, dir "views" spans col 2 → no overlap → same row
    const nodes = new Map([
      ["lib/a.ts", makeFlowNode("lib/a.ts", 0, "lib")],
      ["views/c.ts", makeFlowNode("views/c.ts", 2, "views")],
    ]);
    const bands = computeDirectoryBands(nodes);
    expect(bands).toHaveLength(2);
    const libBand = bands.find(b => b.directory === "lib")!;
    const viewsBand = bands.find(b => b.directory === "views")!;
    expect(libBand.bandRow).toBe(viewsBand.bandRow);
  });

  it("overlapping directories get different band rows", () => {
    // dir "src" spans cols 0-2, dir "lib" spans cols 1-3 → overlap → different rows
    const nodes = new Map([
      ["src/a.ts", makeFlowNode("src/a.ts", 0, "src")],
      ["src/b.ts", makeFlowNode("src/b.ts", 2, "src")],
      ["lib/c.ts", makeFlowNode("lib/c.ts", 1, "lib")],
      ["lib/d.ts", makeFlowNode("lib/d.ts", 3, "lib")],
    ]);
    const bands = computeDirectoryBands(nodes);
    expect(bands).toHaveLength(2);
    const srcBand = bands.find(b => b.directory === "src")!;
    const libBand = bands.find(b => b.directory === "lib")!;
    expect(srcBand.bandRow).not.toBe(libBand.bandRow);
  });

  it("builds correct nodesByColumn map", () => {
    const nodes = new Map([
      ["src/a.ts", makeFlowNode("src/a.ts", 0, "src")],
      ["src/b.ts", makeFlowNode("src/b.ts", 0, "src")],
      ["src/c.ts", makeFlowNode("src/c.ts", 2, "src")],
    ]);
    const bands = computeDirectoryBands(nodes);
    expect(bands).toHaveLength(1);
    const band = bands[0];
    expect(band.nodesByColumn.get(0)).toEqual(["src/a.ts", "src/b.ts"]);
    expect(band.nodesByColumn.get(2)).toEqual(["src/c.ts"]);
    expect(band.nodesByColumn.has(1)).toBe(false);
  });

  it("three directories: two share a row, third stacked", () => {
    // "alpha" at col 0, "beta" at col 2, "gamma" at cols 0-2
    // alpha and beta don't overlap → row 0
    // gamma overlaps both → row 1
    const nodes = new Map([
      ["alpha/a.ts", makeFlowNode("alpha/a.ts", 0, "alpha")],
      ["beta/b.ts", makeFlowNode("beta/b.ts", 2, "beta")],
      ["gamma/c.ts", makeFlowNode("gamma/c.ts", 0, "gamma")],
      ["gamma/d.ts", makeFlowNode("gamma/d.ts", 2, "gamma")],
    ]);
    const bands = computeDirectoryBands(nodes);
    expect(bands).toHaveLength(3);
    // gamma spans 0-2 (widest, sorted first), gets row 0
    const gamma = bands.find(b => b.directory === "gamma")!;
    const alpha = bands.find(b => b.directory === "alpha")!;
    const beta = bands.find(b => b.directory === "beta")!;
    // gamma is wider, placed first at row 0; alpha overlaps gamma → row 1
    expect(gamma.bandRow).toBe(0);
    expect(alpha.bandRow).toBe(1);
    // beta at col 2 also overlaps gamma → different row from gamma
    expect(beta.bandRow).not.toBe(gamma.bandRow);
    // alpha and beta don't overlap each other → can share a row
    expect(alpha.bandRow).toBe(beta.bandRow);
  });

  it("integrates with computePinLayout result", () => {
    // Verify directoryBands field is populated from a full layout
    const nodeA = makeNode("shared/types.ts", ["T"]);
    const nodeB = makeNode("shared/utils.ts", ["U"]);
    const nodeC = makeNode("views/main.ts", ["V"]);
    const nodesById = buildNodesById(nodeA, nodeB, nodeC);
    const links: ExplorerLinkPayload[] = [
      makeLink("views/main.ts", "shared/types.ts", "V", "T"),
      makeLink("views/main.ts", "shared/utils.ts", "V", "U"),
    ];
    const pinSet = addPin(EMPTY_PIN_SET, "views/main.ts", "V");

    const result = computePinLayout(pinSet, links, nodesById);
    expect(result.directoryBands.length).toBeGreaterThan(0);

    // "shared" should span the upstream column, "views" the pinned column
    const sharedBand = result.directoryBands.find(b => b.directory === "shared");
    const viewsBand = result.directoryBands.find(b => b.directory === "views");
    expect(sharedBand).toBeDefined();
    expect(viewsBand).toBeDefined();
    expect(sharedBand!.allNodeIds).toContain("shared/types.ts");
    expect(sharedBand!.allNodeIds).toContain("shared/utils.ts");
    expect(viewsBand!.allNodeIds).toContain("views/main.ts");
  });

  describe("hierarchical nesting (Strategy C)", () => {
    it("creates parent band for sibling directories sharing a prefix", () => {
      const nodes = new Map([
        ["pkg/src/config/a.ts", makeFlowNode("pkg/src/config/a.ts", 0, "pkg/src/config")],
        ["pkg/src/models/b.ts", makeFlowNode("pkg/src/models/b.ts", 1, "pkg/src/models")],
      ]);
      const bands = computeDirectoryBands(nodes, "pkg");

      expect(bands).toHaveLength(1);
      const parent = bands[0];
      expect(parent.directory).toBe("pkg/src");
      expect(parent.children).toHaveLength(2);
      expect(parent.minColumn).toBe(0);
      expect(parent.maxColumn).toBe(1);
      expect(parent.allNodeIds).toContain("pkg/src/config/a.ts");
      expect(parent.allNodeIds).toContain("pkg/src/models/b.ts");

      const configBand = parent.children.find(b => b.directory === "pkg/src/config")!;
      const modelsBand = parent.children.find(b => b.directory === "pkg/src/models")!;
      expect(configBand).toBeDefined();
      expect(modelsBand).toBeDefined();
      expect(configBand.children).toEqual([]);
      expect(modelsBand.children).toEqual([]);
    });

    it("does not create parent band for a single child directory", () => {
      const nodes = new Map([
        ["pkg/src/config/a.ts", makeFlowNode("pkg/src/config/a.ts", 0, "pkg/src/config")],
      ]);
      const bands = computeDirectoryBands(nodes, "pkg");

      expect(bands).toHaveLength(1);
      expect(bands[0].directory).toBe("pkg/src/config");
      expect(bands[0].children).toEqual([]);
    });

    it("reproduces the screenshot scenario: shared/src wraps config + live-docs", () => {
      const nodes = new Map([
        ["scripts/fixture-tools/manifest.ts", makeFlowNode("scripts/fixture-tools/manifest.ts", 0, "scripts/fixture-tools")],
        ["scripts/fixture-tools/doc.ts", makeFlowNode("scripts/fixture-tools/doc.ts", 1, "scripts/fixture-tools")],
        ["packages/shared/src/config/config.ts", makeFlowNode("packages/shared/src/config/config.ts", 0, "packages/shared/src/config")],
        ["packages/shared/src/live-docs/archetype.ts", makeFlowNode("packages/shared/src/live-docs/archetype.ts", 1, "packages/shared/src/live-docs")],
        ["packages/shared/src/live-docs/schema.ts", makeFlowNode("packages/shared/src/live-docs/schema.ts", 1, "packages/shared/src/live-docs")],
        ["packages/server/src/features/live-docs/generator.ts", makeFlowNode("packages/server/src/features/live-docs/generator.ts", 1, "packages/server/src/features/live-docs")],
      ]);
      const bands = computeDirectoryBands(nodes, "");

      // Top level: scripts/fixture-tools (leaf) + packages (parent wrapping shared + server)
      expect(bands).toHaveLength(2);

      const scriptsBand = bands.find(b => b.directory === "scripts/fixture-tools")!;
      expect(scriptsBand).toBeDefined();
      expect(scriptsBand.children).toEqual([]);

      const pkgBand = bands.find(b => b.directory === "packages")!;
      expect(pkgBand).toBeDefined();
      expect(pkgBand.children.length).toBe(2);

      // Inside packages: shared/src (parent) + server/src/features/live-docs (leaf)
      const sharedSrc = pkgBand.children.find(b => b.directory === "packages/shared/src")!;
      const serverLeaf = pkgBand.children.find(b => b.directory === "packages/server/src/features/live-docs")!;
      expect(sharedSrc).toBeDefined();
      expect(serverLeaf).toBeDefined();
      expect(serverLeaf.children).toEqual([]);

      // Inside shared/src: config (leaf) + live-docs (leaf)
      expect(sharedSrc.children).toHaveLength(2);
      const configBand = sharedSrc.children.find(b => b.directory === "packages/shared/src/config")!;
      const liveDocsBand = sharedSrc.children.find(b => b.directory === "packages/shared/src/live-docs")!;
      expect(configBand).toBeDefined();
      expect(liveDocsBand).toBeDefined();
      expect(configBand.allNodeIds).toEqual(["packages/shared/src/config/config.ts"]);
      expect(liveDocsBand.allNodeIds).toEqual([
        "packages/shared/src/live-docs/archetype.ts",
        "packages/shared/src/live-docs/schema.ts",
      ]);
    });

    it("collapses single-child chains in the trie", () => {
      // a/b/c/x and a/b/d/y → the "a/b" chain collapses, branching at b
      const nodes = new Map([
        ["a/b/c/x.ts", makeFlowNode("a/b/c/x.ts", 0, "a/b/c")],
        ["a/b/d/y.ts", makeFlowNode("a/b/d/y.ts", 1, "a/b/d")],
      ]);
      const bands = computeDirectoryBands(nodes, "");

      // "a/b" should be the parent, containing "a/b/c" and "a/b/d"
      expect(bands).toHaveLength(1);
      expect(bands[0].directory).toBe("a/b");
      expect(bands[0].children).toHaveLength(2);
    });

    it("assigns child band rows via interval scheduling", () => {
      // Parent with 3 children at interleaving columns
      const nodes = new Map([
        ["p/a/x.ts", makeFlowNode("p/a/x.ts", 0, "p/a")],
        ["p/b/y.ts", makeFlowNode("p/b/y.ts", 1, "p/b")],
        ["p/c/z.ts", makeFlowNode("p/c/z.ts", 2, "p/c")],
      ]);
      const bands = computeDirectoryBands(nodes, "");

      expect(bands).toHaveLength(1);
      const parent = bands[0];
      expect(parent.children).toHaveLength(3);
      // All 3 children span single non-overlapping columns → can share one row
      const rows = new Set(parent.children.map(c => c.bandRow));
      expect(rows.size).toBe(1);
    });

    it("root-level files (in LCA directory) get a band with directory === LCA", () => {
      // Simulates: LCA = "pkg/src", with treeSitter/ subdir files + a root-level file
      const nodes = new Map([
        ["pkg/src/treeSitter/extractor.ts", makeFlowNode("pkg/src/treeSitter/extractor.ts", 0, "pkg/src/treeSitter")],
        ["pkg/src/treeSitter/loader.ts", makeFlowNode("pkg/src/treeSitter/loader.ts", 0, "pkg/src/treeSitter")],
        ["pkg/src/types.ts", makeFlowNode("pkg/src/types.ts", 0, "pkg/src")],
      ]);
      const bands = computeDirectoryBands(nodes, "pkg/src");

      // Should produce 2 bands: treeSitter subdir + root-level files
      expect(bands).toHaveLength(2);
      const treeSitterBand = bands.find(b => b.directory === "pkg/src/treeSitter");
      const rootBand = bands.find(b => b.directory === "pkg/src");
      expect(treeSitterBand).toBeDefined();
      expect(rootBand).toBeDefined();
      // Root band's directory matches LCA — renderer should not membrane-wrap it
      expect(rootBand!.directory).toBe("pkg/src");
      expect(rootBand!.allNodeIds).toEqual(["pkg/src/types.ts"]);
      expect(rootBand!.children).toHaveLength(0);
    });
  });
});
