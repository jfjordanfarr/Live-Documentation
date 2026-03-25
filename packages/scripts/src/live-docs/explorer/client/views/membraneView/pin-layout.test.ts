/**
 * Tests for the pin-layout dependency-flow layout engine.
 */
import { describe, it, expect } from "vitest";
import type { ExplorerLinkPayload, ExplorerNodePayload } from "../../../shared/types";
import type { PinSet } from "./pin-state";
import { addPin, EMPTY_PIN_SET } from "./pin-state";
import { computePinLayout, parentDirectory, computeLCA, buildAncestorChain } from "./pin-layout";

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
