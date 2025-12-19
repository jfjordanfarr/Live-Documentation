import { describe, expect, it } from "vitest";
import {
  type LayoutConfig,
  type LayoutColumn,
  type LayoutNode,
  type LocalMapLayout,
  type ColumnRole,
  type HopData,
  DEFAULT_LAYOUT_CONFIG,
  computeGridTemplate,
  computeColumnCount,
  getColumnRole,
  getHopIndex,
  generateColumnLabel,
  computeSingleHopLayout,
  computeMultiHopLayout,
  pinsToHopData,
  computeVerticalAlignments,
  sortByAlignment,
  getIntermediateColumns,
  isMultiHopConnection
} from "./layout-math";
import { type SymbolPin } from "./state";

describe("layout-math", () => {
  describe("computeGridTemplate", () => {
    it("returns repeat() CSS grid template", () => {
      expect(computeGridTemplate(3)).toBe("repeat(3, max-content)");
      expect(computeGridTemplate(5)).toBe("repeat(5, max-content)");
      expect(computeGridTemplate(7)).toBe("repeat(7, max-content)");
    });

    it("handles edge cases", () => {
      expect(computeGridTemplate(1)).toBe("repeat(1, max-content)");
      expect(computeGridTemplate(0)).toBe("repeat(0, max-content)");
    });
  });

  describe("computeColumnCount", () => {
    it("returns 3 for 0 hops (minimum)", () => {
      expect(computeColumnCount(0)).toBe(3);
    });

    it("returns 3 for 1 hop", () => {
      expect(computeColumnCount(1)).toBe(3);
    });

    it("returns 4 for 2 hops (skip destination dependents)", () => {
      // Multi-hop: we skip the last hop's dependents column
      // 2 hops = [Deps, Origin, Dependents, Hop1] = 4 columns
      expect(computeColumnCount(2)).toBe(4);
    });

    it("returns 6 for 3 hops (skip destination dependents)", () => {
      // 3 hops = [Deps, Origin, Dependents, Hop1, Via1, Hop2] = 6 columns
      expect(computeColumnCount(3)).toBe(6);
    });

    it("follows formula: hopCount * 2 for multi-hop (hopCount > 1)", () => {
      // Single-hop: 3 columns
      expect(computeColumnCount(1)).toBe(3);
      // Multi-hop: hopCount * 2 (skip last hop's dependents)
      for (let hops = 2; hops <= 10; hops++) {
        const expected = hops * 2;
        expect(computeColumnCount(hops)).toBe(expected);
      }
    });

    it("handles negative input gracefully", () => {
      expect(computeColumnCount(-1)).toBe(3);
    });
  });

  describe("getColumnRole", () => {
    it("column 0 is always upstream", () => {
      expect(getColumnRole(0)).toBe("upstream");
    });

    it("odd columns are center", () => {
      expect(getColumnRole(1)).toBe("center");
      expect(getColumnRole(3)).toBe("center");
      expect(getColumnRole(5)).toBe("center");
    });

    it("even columns (except 0) are downstream", () => {
      expect(getColumnRole(2)).toBe("downstream");
      expect(getColumnRole(4)).toBe("downstream");
      expect(getColumnRole(6)).toBe("downstream");
    });
  });

  describe("getHopIndex", () => {
    it("column 0 belongs to hop 0", () => {
      expect(getHopIndex(0)).toBe(0);
    });

    it("columns 1-2 belong to hop 0-1", () => {
      expect(getHopIndex(1)).toBe(0);
      expect(getHopIndex(2)).toBe(1);
    });

    it("columns 3-4 belong to hop 1-2", () => {
      expect(getHopIndex(3)).toBe(1);
      expect(getHopIndex(4)).toBe(2);
    });

    it("follows floor(columnIndex / 2) pattern for col > 0", () => {
      for (let col = 1; col <= 10; col++) {
        expect(getHopIndex(col)).toBe(Math.floor(col / 2));
      }
    });
  });

  describe("generateColumnLabel", () => {
    describe("single-hop mode (totalHops <= 1)", () => {
      it("upstream label is 'Dependencies (Inputs)'", () => {
        expect(generateColumnLabel("upstream", 0, 1)).toBe("Dependencies (Inputs)");
      });

      it("center label is 'Selected Artifact'", () => {
        expect(generateColumnLabel("center", 0, 1)).toBe("Selected Artifact");
      });

      it("downstream label is 'Dependents (Outputs)'", () => {
        expect(generateColumnLabel("downstream", 0, 1)).toBe("Dependents (Outputs)");
      });
    });

    describe("multi-hop mode (totalHops > 1)", () => {
      it("upstream is simple 'Dependencies'", () => {
        expect(generateColumnLabel("upstream", 0, 3)).toBe("Dependencies");
      });

      it("center at hop 0 is 'Origin'", () => {
        expect(generateColumnLabel("center", 0, 3)).toBe("Origin");
      });

      it("center at hop N is 'Hop N'", () => {
        expect(generateColumnLabel("center", 1, 3)).toBe("Hop 1");
        expect(generateColumnLabel("center", 2, 3)).toBe("Hop 2");
      });

      it("downstream at hop 0 is 'Dependents'", () => {
        expect(generateColumnLabel("downstream", 0, 3)).toBe("Dependents");
      });

      it("downstream at hop N is 'Via N'", () => {
        expect(generateColumnLabel("downstream", 1, 3)).toBe("Via 1");
        expect(generateColumnLabel("downstream", 2, 3)).toBe("Via 2");
      });
    });
  });

  describe("computeSingleHopLayout", () => {
    it("creates 3-column layout", () => {
      const result = computeSingleHopLayout(
        { id: "center-id", name: "Center" },
        [{ id: "dep-1", name: "Dependency 1" }],
        [{ id: "dept-1", name: "Dependent 1" }]
      );

      expect(result.columnCount).toBe(3);
      expect(result.columns).toHaveLength(3);
      expect(result.gridTemplate).toBe("repeat(3, max-content)");
    });

    it("places center node in column 1", () => {
      const result = computeSingleHopLayout(
        { id: "center", name: "Center Node" },
        [],
        []
      );

      const centerColumn = result.columns.find(c => c.role === "center");
      expect(centerColumn?.index).toBe(1);
      expect(centerColumn?.nodes).toHaveLength(1);
      expect(centerColumn?.nodes[0].id).toBe("center");
    });

    it("places dependencies in column 0 (upstream)", () => {
      const result = computeSingleHopLayout(
        { id: "center", name: "Center" },
        [
          { id: "dep-a", name: "Dep A" },
          { id: "dep-b", name: "Dep B" }
        ],
        []
      );

      const upstreamColumn = result.columns.find(c => c.role === "upstream");
      expect(upstreamColumn?.index).toBe(0);
      expect(upstreamColumn?.nodes).toHaveLength(2);
      expect(upstreamColumn?.nodes.map(n => n.id)).toEqual(["dep-a", "dep-b"]);
    });

    it("places dependents in column 2 (downstream)", () => {
      const result = computeSingleHopLayout(
        { id: "center", name: "Center" },
        [],
        [
          { id: "dept-x", name: "Dependent X" },
          { id: "dept-y", name: "Dependent Y" }
        ]
      );

      const downstreamColumn = result.columns.find(c => c.role === "downstream");
      expect(downstreamColumn?.index).toBe(2);
      expect(downstreamColumn?.nodes).toHaveLength(2);
    });

    it("handles empty dependencies and dependents", () => {
      const result = computeSingleHopLayout(
        { id: "lonely", name: "Lonely Node" },
        [],
        []
      );

      expect(result.columns[0].nodes).toHaveLength(0);
      expect(result.columns[1].nodes).toHaveLength(1);
      expect(result.columns[2].nodes).toHaveLength(0);
    });

    it("assigns correct CSS class names", () => {
      const result = computeSingleHopLayout(
        { id: "c", name: "C" },
        [{ id: "d", name: "D" }],
        [{ id: "e", name: "E" }]
      );

      expect(result.columns[0].className).toContain("outbound");
      expect(result.columns[1].className).toContain("center");
      expect(result.columns[2].className).toContain("inbound");
    });
  });

  describe("computeMultiHopLayout", () => {
    it("returns empty layout for empty hops", () => {
      const result = computeMultiHopLayout([]);

      expect(result.columnCount).toBe(0);
      expect(result.columns).toHaveLength(0);
      expect(result.gridTemplate).toBe("");
    });

    it("computes 3-column layout for single hop", () => {
      const hops: HopData[] = [
        {
          centerId: "origin",
          centerName: "Origin",
          dependencies: [{ id: "d1", name: "D1" }],
          dependents: [{ id: "t1", name: "T1" }]
        }
      ];

      const result = computeMultiHopLayout(hops);

      expect(result.columnCount).toBe(3);
    });

    it("computes 5-column layout for two hops", () => {
      const hops: HopData[] = [
        {
          centerId: "origin",
          centerName: "Origin",
          dependencies: [],
          dependents: [{ id: "hop1", name: "Hop1" }]
        },
        {
          centerId: "hop1",
          centerName: "Hop1",
          dependencies: [],
          dependents: [{ id: "final", name: "Final" }]
        }
      ];

      const result = computeMultiHopLayout(hops);

      // 2 hops: [Deps, Origin, Dependents, Hop1] = 4 columns (skip Hop1's dependents)
      expect(result.columnCount).toBe(4);
    });

    it("computes 6-column layout for three hops (skip destination dependents)", () => {
      const hops: HopData[] = [
        { centerId: "h0", centerName: "H0", dependencies: [], dependents: [] },
        { centerId: "h1", centerName: "H1", dependencies: [], dependents: [] },
        { centerId: "h2", centerName: "H2", dependencies: [], dependents: [] }
      ];

      const result = computeMultiHopLayout(hops);

      // 3 hops: [Deps, Origin, Dependents, Hop1, Via1, Hop2] = 6 columns (skip Hop2's dependents)
      expect(result.columnCount).toBe(6);
    });

    it("limits hops to maxHops config", () => {
      const config: LayoutConfig = { columnGap: 200, maxHops: 2 };
      const hops: HopData[] = Array.from({ length: 5 }, (_, i) => ({
        centerId: `h${i}`,
        centerName: `H${i}`,
        dependencies: [],
        dependents: []
      }));

      const result = computeMultiHopLayout(hops, config);

      // Should only use first 2 hops: [Deps, Origin, Dependents, Hop1] = 4 columns
      expect(result.columnCount).toBe(4); // 2 * 2
    });

    it("assigns hop-center class to non-origin centers", () => {
      const hops: HopData[] = [
        { centerId: "h0", centerName: "H0", dependencies: [], dependents: [] },
        { centerId: "h1", centerName: "H1", dependencies: [], dependents: [] }
      ];

      const result = computeMultiHopLayout(hops);

      const centerColumns = result.columns.filter(c => c.role === "center");
      expect(centerColumns[0].className).not.toContain("hop-center");
      expect(centerColumns[1].className).toContain("hop-center");
    });
  });

  describe("pinsToHopData", () => {
    const mockGetNodeData = (id: string) => ({ id, name: `Node ${id}` });
    const mockGetDeps = (id: string) => [{ id: `dep-${id}`, name: `Dep of ${id}` }];
    const mockGetDepts = (id: string) => [{ id: `dept-${id}`, name: `Dept of ${id}` }];

    it("returns empty array for empty pins", () => {
      const result = pinsToHopData([], mockGetNodeData, mockGetDeps, mockGetDepts);
      expect(result).toEqual([]);
    });

    it("converts single pin to single hop data", () => {
      const pins: SymbolPin[] = [
        { nodeId: "A", symbol: "funcA", hopIndex: 0 }
      ];

      const result = pinsToHopData(pins, mockGetNodeData, mockGetDeps, mockGetDepts);

      expect(result).toHaveLength(1);
      expect(result[0].centerId).toBe("A");
      expect(result[0].centerName).toBe("Node A");
      expect(result[0].pinnedSymbol).toBe("funcA");
    });

    it("sorts pins by hopIndex", () => {
      const pins: SymbolPin[] = [
        { nodeId: "C", symbol: "c", hopIndex: 2 },
        { nodeId: "A", symbol: "a", hopIndex: 0 },
        { nodeId: "B", symbol: "b", hopIndex: 1 }
      ];

      const result = pinsToHopData(pins, mockGetNodeData, mockGetDeps, mockGetDepts);

      expect(result[0].centerId).toBe("A");
      expect(result[1].centerId).toBe("B");
      expect(result[2].centerId).toBe("C");
    });

    it("includes dependencies and dependents from callbacks", () => {
      const pins: SymbolPin[] = [
        { nodeId: "X", symbol: "x", hopIndex: 0 }
      ];

      const result = pinsToHopData(pins, mockGetNodeData, mockGetDeps, mockGetDepts);

      expect(result[0].dependencies).toEqual([{ id: "dep-X", name: "Dep of X" }]);
      expect(result[0].dependents).toEqual([{ id: "dept-X", name: "Dept of X" }]);
    });

    it("filters out pins with null node data", () => {
      const getNode = (id: string) => id === "missing" ? null : { id, name: `Node ${id}` };
      const pins: SymbolPin[] = [
        { nodeId: "A", symbol: "a", hopIndex: 0 },
        { nodeId: "missing", symbol: "m", hopIndex: 1 },
        { nodeId: "B", symbol: "b", hopIndex: 2 }
      ];

      const result = pinsToHopData(pins, getNode, mockGetDeps, mockGetDepts);

      expect(result).toHaveLength(2);
      expect(result.map(h => h.centerId)).toEqual(["A", "B"]);
    });
  });

  describe("computeVerticalAlignments", () => {
    it("returns empty map for empty nodes", () => {
      const result = computeVerticalAlignments(
        [],
        new Map(),
        () => []
      );

      expect(result.size).toBe(0);
    });

    it("assigns Infinity for nodes with no connections", () => {
      const nodes = [{ id: "orphan" }];
      const symbolPositions = new Map([["sym1", 100]]);

      const result = computeVerticalAlignments(
        nodes,
        symbolPositions,
        () => [] // No connections
      );

      expect(result.get("orphan")).toBe(Infinity);
    });

    it("averages Y positions of connected symbols", () => {
      const nodes = [{ id: "connected" }];
      const symbolPositions = new Map([
        ["sym1", 100],
        ["sym2", 200],
        ["sym3", 300]
      ]);

      const result = computeVerticalAlignments(
        nodes,
        symbolPositions,
        (id) => id === "connected" ? ["sym1", "sym2", "sym3"] : []
      );

      // Average of 100, 200, 300 = 200
      expect(result.get("connected")).toBe(200);
    });

    it("handles partial symbol matches", () => {
      const nodes = [{ id: "partial" }];
      const symbolPositions = new Map([
        ["known", 100]
      ]);

      const result = computeVerticalAlignments(
        nodes,
        symbolPositions,
        () => ["known", "unknown"]
      );

      // Only "known" has a position, so average is 100
      expect(result.get("partial")).toBe(100);
    });
  });

  describe("sortByAlignment", () => {
    it("sorts nodes by alignment value ascending", () => {
      const nodes = [
        { id: "C" },
        { id: "A" },
        { id: "B" }
      ];
      const alignments = new Map([
        ["A", 10],
        ["B", 20],
        ["C", 30]
      ]);

      const result = sortByAlignment(nodes, alignments);

      expect(result.map(n => n.id)).toEqual(["A", "B", "C"]);
    });

    it("handles missing alignments (defaults to Infinity)", () => {
      const nodes = [
        { id: "known" },
        { id: "unknown" }
      ];
      const alignments = new Map([["known", 50]]);

      const result = sortByAlignment(nodes, alignments);

      expect(result[0].id).toBe("known");
      expect(result[1].id).toBe("unknown");
    });

    it("preserves original order for equal alignments", () => {
      const nodes = [
        { id: "A" },
        { id: "B" },
        { id: "C" }
      ];
      const alignments = new Map([
        ["A", 100],
        ["B", 100],
        ["C", 100]
      ]);

      const result = sortByAlignment(nodes, alignments);

      // Stable sort should preserve order
      expect(result.map(n => n.id)).toEqual(["A", "B", "C"]);
    });

    it("does not mutate original array", () => {
      const original = [{ id: "B" }, { id: "A" }];
      const alignments = new Map([["A", 1], ["B", 2]]);

      sortByAlignment(original, alignments);

      expect(original[0].id).toBe("B"); // Original unchanged
    });
  });

  describe("getIntermediateColumns", () => {
    it("returns empty array for adjacent columns", () => {
      expect(getIntermediateColumns(1, 2)).toEqual([]);
      expect(getIntermediateColumns(2, 1)).toEqual([]);
    });

    it("returns intermediate column indices", () => {
      expect(getIntermediateColumns(0, 4)).toEqual([1, 2, 3]);
      expect(getIntermediateColumns(4, 0)).toEqual([1, 2, 3]);
    });

    it("returns single column for gap of 2", () => {
      expect(getIntermediateColumns(1, 3)).toEqual([2]);
    });

    it("handles same column (no intermediates)", () => {
      expect(getIntermediateColumns(3, 3)).toEqual([]);
    });
  });

  describe("isMultiHopConnection", () => {
    it("returns false for adjacent columns", () => {
      expect(isMultiHopConnection(0, 1)).toBe(false);
      expect(isMultiHopConnection(1, 0)).toBe(false);
      expect(isMultiHopConnection(3, 4)).toBe(false);
    });

    it("returns false for same column", () => {
      expect(isMultiHopConnection(2, 2)).toBe(false);
    });

    it("returns true for columns with gap > 1", () => {
      expect(isMultiHopConnection(0, 2)).toBe(true);
      expect(isMultiHopConnection(2, 0)).toBe(true);
      expect(isMultiHopConnection(1, 5)).toBe(true);
    });
  });

  describe("Layout Types", () => {
    it("LayoutNode has required fields", () => {
      const node: LayoutNode = {
        id: "test-id",
        name: "Test Node",
        columnIndex: 1,
        role: "center",
        sortOrder: 0
      };

      expect(node.id).toBe("test-id");
      expect(node.name).toBe("Test Node");
      expect(node.columnIndex).toBe(1);
      expect(node.role).toBe("center");
      expect(node.sortOrder).toBe(0);
    });

    it("LayoutNode supports optional alignmentY", () => {
      const nodeWithAlignment: LayoutNode = {
        id: "aligned",
        name: "Aligned Node",
        columnIndex: 0,
        role: "upstream",
        sortOrder: 2,
        alignmentY: 150
      };

      expect(nodeWithAlignment.alignmentY).toBe(150);
    });

    it("LocalMapLayout has required fields", () => {
      const layout: LocalMapLayout = {
        columns: [],
        columnCount: 3,
        gridTemplate: "repeat(3, max-content)"
      };

      expect(layout.columns).toEqual([]);
      expect(layout.columnCount).toBe(3);
      expect(layout.gridTemplate).toBe("repeat(3, max-content)");
    });
  });

  describe("Edge Cases", () => {
    it("handles very large hop counts", () => {
      const hops: HopData[] = Array.from({ length: 20 }, (_, i) => ({
        centerId: `h${i}`,
        centerName: `Hop ${i}`,
        dependencies: [],
        dependents: []
      }));

      // With default maxHops of 5
      const result = computeMultiHopLayout(hops);

      // 5 hops (capped): [Deps, Origin, Deps, Hop1, Via1, Hop2, Via2, Hop3, Via3, Hop4] = 10 columns
      expect(result.columnCount).toBe(10); // 5 * 2
    });

    it("handles nodes with many dependencies", () => {
      const manyDeps = Array.from({ length: 100 }, (_, i) => ({
        id: `dep-${i}`,
        name: `Dependency ${i}`
      }));

      const result = computeSingleHopLayout(
        { id: "center", name: "Center" },
        manyDeps,
        []
      );

      expect(result.columns[0].nodes).toHaveLength(100);
    });

    it("handles unicode in names", () => {
      const result = computeSingleHopLayout(
        { id: "center", name: "中心节点 🎯" },
        [{ id: "dep", name: "依赖 📦" }],
        [{ id: "dept", name: "依赖者 🔗" }]
      );

      expect(result.columns[1].nodes[0].name).toBe("中心节点 🎯");
      expect(result.columns[0].nodes[0].name).toBe("依赖 📦");
      expect(result.columns[2].nodes[0].name).toBe("依赖者 🔗");
    });
  });
});
