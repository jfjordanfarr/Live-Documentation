/**
 * Unit tests for subgraph-builder pure functions.
 *
 * Tests cover the graph-theoretic operations for building local subgraphs
 * and path subgraphs from explorer graph data.
 */

import { describe, expect, it } from "vitest";

import {
  buildSelfLoopEdges,
  buildPathSubgraph,
  type LinkEndpointResolver,
  type NodeResolver
} from "./subgraph-builder";
import type { ExplorerNodePayload, ExplorerLinkPayload, ExplorerGraphPayload, ExplorerPublicSymbol, ExplorerTypeReference } from "../../../shared/types";

describe("subgraph-builder", () => {
  /**
   * Creates a minimal node for testing.
   */
  function createNode(id: string, overrides: Partial<ExplorerNodePayload> = {}): ExplorerNodePayload {
    return {
      id,
      name: id,
      codePath: `/${id}`,
      codeRelativePath: id,
      docPath: `/.live-documentation/source/${id}.md`,
      docRelativePath: `.live-documentation/source/${id}.md`,
      archetype: "implementation",
      dependencies: [],
      dependents: [],
      missingDependencies: [],
      publicSymbols: [],
      ...overrides
    };
  }

  /**
   * Creates a link between two nodes.
   */
  function createLink(
    source: string,
    target: string,
    overrides: Partial<ExplorerLinkPayload> = {}
  ): ExplorerLinkPayload {
    return {
      source,
      target,
      kind: "dependency",
      ...overrides
    };
  }

  /**
   * Creates a minimal graph payload for testing.
   */
  function createGraphData(
    nodes: ExplorerNodePayload[],
    links: ExplorerLinkPayload[]
  ): ExplorerGraphPayload {
    return {
      nodes,
      links,
      stats: { nodes: nodes.length, links: links.length, references: links.length, dependenciesOutsideScan: 0 }
    };
  }

  /**
   * Creates a public symbol with optional type references.
   */
  function createSymbol(
    name: string,
    typeReferences?: Array<{ typeName: string; isResolved: boolean; targetId?: string }>
  ): ExplorerPublicSymbol {
    return {
      name,
      typeReferences: typeReferences?.map((ref): ExplorerTypeReference => ({
        typeName: ref.typeName,
        role: "return", // Default role for testing
        isResolved: ref.isResolved,
        targetId: ref.targetId
      }))
    };
  }

  /**
   * Standard resolvers for testing.
   */
  const resolveLinkEndpoint: LinkEndpointResolver = (endpoint) => {
    if (typeof endpoint === "string") return endpoint;
    return endpoint.id;
  };

  describe("buildSelfLoopEdges", () => {
    it("returns empty array when node has no publicSymbolsExtended", () => {
      const node = createNode("test");
      const edges = buildSelfLoopEdges(node);
      expect(edges).toHaveLength(0);
    });

    it("returns empty array when symbols have no type references", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [createSymbol("foo")]
      });
      const edges = buildSelfLoopEdges(node);
      expect(edges).toHaveLength(0);
    });

    it("creates self-loop edge for intra-file type reference (same file symbols)", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [
          createSymbol("Config"),
          createSymbol("createConfig", [{ typeName: "Config", isResolved: false }])
        ]
      });

      const edges = buildSelfLoopEdges(node);

      expect(edges).toHaveLength(1);
      expect(edges[0].sourceId).toBe("test");
      expect(edges[0].targetId).toBe("test");
      expect(edges[0].kind).toBe("type-reference");
      expect(edges[0].sourceSymbol).toBe("createConfig");
      expect(edges[0].targetSymbol).toBe("Config");
    });

    it("creates self-loop edge for resolved intra-file reference", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [
          createSymbol("Config"),
          createSymbol("createConfig", [{ typeName: "Config", isResolved: true, targetId: "test" }])
        ]
      });

      const edges = buildSelfLoopEdges(node);

      expect(edges).toHaveLength(1);
      expect(edges[0].sourceSymbol).toBe("createConfig");
      expect(edges[0].targetSymbol).toBe("Config");
    });

    it("does not create edge for external type reference", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [
          createSymbol("doSomething", [{ typeName: "ExternalType", isResolved: true, targetId: "other-file" }])
        ]
      });

      const edges = buildSelfLoopEdges(node);
      expect(edges).toHaveLength(0);
    });

    it("deduplicates identical self-loop edges", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [
          createSymbol("Config"),
          createSymbol("createConfig", [
            { typeName: "Config", isResolved: false },
            { typeName: "Config", isResolved: false } // Duplicate
          ])
        ]
      });

      const edges = buildSelfLoopEdges(node);
      expect(edges).toHaveLength(1);
    });

    it("creates multiple edges for different type references", () => {
      const node = createNode("test", {
        publicSymbolsExtended: [
          createSymbol("ConfigA"),
          createSymbol("ConfigB"),
          createSymbol("initialize", [
            { typeName: "ConfigA", isResolved: false },
            { typeName: "ConfigB", isResolved: false }
          ])
        ]
      });

      const edges = buildSelfLoopEdges(node);
      expect(edges).toHaveLength(2);
      expect(edges.map((e) => e.targetSymbol).sort()).toEqual(["ConfigA", "ConfigB"]);
    });
  });

  describe("buildPathSubgraph", () => {
    it("returns null for path with fewer than 2 nodes", () => {
      const graphData = createGraphData([createNode("a")], []);
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      expect(buildPathSubgraph([], graphData, resolveLinkEndpoint, resolveNode)).toBeNull();
      expect(buildPathSubgraph(["a"], graphData, resolveLinkEndpoint, resolveNode)).toBeNull();
    });

    it("returns null if any path node cannot be resolved", () => {
      const graphData = createGraphData([createNode("a")], []);
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const result = buildPathSubgraph(["a", "missing"], graphData, resolveLinkEndpoint, resolveNode);
      expect(result).toBeNull();
    });

    it("builds subgraph with path nodes and adjacent edges", () => {
      const a = createNode("a");
      const b = createNode("b");
      const c = createNode("c");
      const graphData = createGraphData(
        [a, b, c],
        [createLink("a", "b"), createLink("b", "c")]
      );
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const subgraph = buildPathSubgraph(["a", "b", "c"], graphData, resolveLinkEndpoint, resolveNode);

      expect(subgraph).not.toBeNull();
      expect(subgraph!.nodes).toHaveLength(3);
      expect(subgraph!.links).toHaveLength(2);
      expect(subgraph!.center).toBe(a);
    });

    it("filters out edges between non-adjacent path nodes", () => {
      const a = createNode("a");
      const b = createNode("b");
      const c = createNode("c");
      const graphData = createGraphData(
        [a, b, c],
        [
          createLink("a", "b"),
          createLink("b", "c"),
          createLink("a", "c") // Shortcut edge - should be excluded
        ]
      );
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const subgraph = buildPathSubgraph(["a", "b", "c"], graphData, resolveLinkEndpoint, resolveNode);

      expect(subgraph!.links).toHaveLength(2);
      // Should only have a→b and b→c, not a→c
      const edgePairs = subgraph!.links.map((l) => `${l.sourceId}→${l.targetId}`);
      expect(edgePairs).toContain("a→b");
      expect(edgePairs).toContain("b→c");
      expect(edgePairs).not.toContain("a→c");
    });

    it("handles reverse edges between adjacent nodes", () => {
      const a = createNode("a");
      const b = createNode("b");
      const graphData = createGraphData(
        [a, b],
        [createLink("b", "a")] // Reverse direction
      );
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const subgraph = buildPathSubgraph(["a", "b"], graphData, resolveLinkEndpoint, resolveNode);

      expect(subgraph!.links).toHaveLength(1);
      expect(subgraph!.links[0].sourceId).toBe("b");
      expect(subgraph!.links[0].targetId).toBe("a");
      expect(subgraph!.links[0].direction).toBe("inbound"); // Opposite to path flow
    });

    it("correctly assigns direction based on path flow", () => {
      const a = createNode("a");
      const b = createNode("b");
      const c = createNode("c");
      const graphData = createGraphData(
        [a, b, c],
        [
          createLink("a", "b"), // Same direction as path
          createLink("c", "b") // Opposite direction from path
        ]
      );
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const subgraph = buildPathSubgraph(["a", "b", "c"], graphData, resolveLinkEndpoint, resolveNode);

      expect(subgraph!.links).toHaveLength(2);

      const abEdge = subgraph!.links.find((l) => l.sourceId === "a" && l.targetId === "b");
      const cbEdge = subgraph!.links.find((l) => l.sourceId === "c" && l.targetId === "b");

      expect(abEdge).toBeDefined();
      expect(abEdge!.direction).toBe("outbound"); // a(0) → b(1), sourceIndex < targetIndex

      expect(cbEdge).toBeDefined();
      expect(cbEdge!.direction).toBe("inbound"); // c(2) → b(1), sourceIndex > targetIndex
    });

    it("preserves edge symbol metadata", () => {
      const a = createNode("a");
      const b = createNode("b");
      const graphData = createGraphData(
        [a, b],
        [
          createLink("a", "b", {
            sourceSymbol: "exportedFunc",
            targetSymbol: "importedFunc",
            kind: "import"
          })
        ]
      );
      const resolveNode: NodeResolver = (id) => graphData.nodes.find((n) => n.id === id);

      const subgraph = buildPathSubgraph(["a", "b"], graphData, resolveLinkEndpoint, resolveNode);

      expect(subgraph!.links[0].sourceSymbol).toBe("exportedFunc");
      expect(subgraph!.links[0].targetSymbol).toBe("importedFunc");
      expect(subgraph!.links[0].kind).toBe("import");
    });
  });
});
