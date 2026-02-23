/**
 * Unit tests for symbol-highlight pure computation functions.
 *
 * Tests cover the logic for computing which symbols, edges, and nodes
 * should be highlighted when a symbol is hovered or pinned.
 */

import { describe, expect, it } from "vitest";
import { computeSymbolHighlight, type SymbolHighlightResult } from "./symbol-highlight";
import type { LocalSubgraph, LocalEdge, LocalViewOptions } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";

describe("symbol-highlight", () => {
  /**
   * Creates a minimal node for testing.
   */
  function createNode(id: string, archetype = "implementation"): ExplorerNodePayload {
    return {
      id,
      name: id,
      codePath: `/${id}`,
      codeRelativePath: id,
      docPath: `/.live-documentation/source/${id}.md`,
      docRelativePath: `.live-documentation/source/${id}.md`,
      archetype,
      dependencies: [],
      dependents: [],
      missingDependencies: [],
      publicSymbols: [],
      symbolDocumentation: undefined
    };
  }

  /**
   * Creates a link for testing.
   */
  function createLink(
    sourceId: string,
    targetId: string,
    direction: "inbound" | "outbound",
    sourceSymbol?: string,
    targetSymbol?: string,
    kind = "dependency"
  ): LocalEdge {
    return {
      sourceId,
      targetId,
      direction,
      kind,
      sourceSymbol,
      targetSymbol
    };
  }

  /**
   * Creates minimal LocalViewOptions for testing.
   */
  function createOptions(tuning: { collapseOnHover?: boolean; collapseOnPin?: boolean } = {}): LocalViewOptions {
    return {
      state: {
        tuning: {
          localMap: {
            collapseOnHover: tuning.collapseOnHover ?? false,
            collapseOnPin: tuning.collapseOnPin ?? false
          }
        }
      }
    } as unknown as LocalViewOptions;
  }

  describe("computeSymbolHighlight", () => {
    it("includes hovered node+symbol in relatedSymbols", () => {
      const center = createNode("center");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center],
        links: [],
        inboundIds: new Set(),
        outboundIds: new Set()
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "MyFunction", false);

      expect(result.relatedSymbols.has("center:myfunction")).toBe(true);
      expect(result.relatedNodeIds.has("center")).toBe(true);
    });

    it("finds outbound edges where source matches hovered symbol", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          createLink("center", "dep", "outbound", "useHelper", "helper")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["dep"])
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "useHelper", false);

      expect(result.relatedEdges).toHaveLength(1);
      expect(result.relatedSymbols.has("center:usehelper")).toBe(true);
      expect(result.relatedSymbols.has("dep:helper")).toBe(true);
      expect(result.relatedNodeIds.has("dep")).toBe(true);
    });

    it("finds inbound edges where target matches hovered symbol", () => {
      const center = createNode("center");
      const dependent = createNode("dependent");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dependent],
        links: [
          createLink("dependent", "center", "inbound", "consumerFunc", "exportedAPI")
        ],
        inboundIds: new Set(["dependent"]),
        outboundIds: new Set()
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "exportedAPI", false);

      expect(result.relatedEdges).toHaveLength(1);
      expect(result.relatedSymbols.has("center:exportedapi")).toBe(true);
      expect(result.relatedSymbols.has("dependent:consumerfunc")).toBe(true);
      expect(result.relatedNodeIds.has("dependent")).toBe(true);
    });

    it("normalizes symbol names for case-insensitive matching", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          createLink("center", "dep", "outbound", "MyFunction", "targetFunc")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["dep"])
      };
      const options = createOptions();

      // Hover with different casing
      const result = computeSymbolHighlight(subgraph, options, "center", "MYFUNCTION", false);

      expect(result.relatedEdges).toHaveLength(1);
    });

    it("handles __internals__ hover on center node", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          // Edge where center's source symbol is empty (Internals)
          createLink("center", "dep", "outbound", "", "helper"),
          // Edge where center's target symbol is empty (Internals)
          createLink("dep", "center", "inbound", "consumer", "")
        ],
        inboundIds: new Set(["dep"]),
        outboundIds: new Set(["dep"])
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "__internals__", false);

      // Should find both edges since they involve Internals on center
      expect(result.relatedEdges).toHaveLength(2);
    });

    it("handles __internals__ hover on neighbor node (highlights all edges)", () => {
      const center = createNode("center");
      const neighbor = createNode("neighbor");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, neighbor],
        links: [
          createLink("center", "neighbor", "outbound", "funcA", "targetA"),
          createLink("neighbor", "center", "inbound", "funcB", "targetB")
        ],
        inboundIds: new Set(["neighbor"]),
        outboundIds: new Set(["neighbor"])
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "neighbor", "__internals__", false);

      // Hovering Internals on a neighbor highlights ALL edges involving that neighbor
      expect(result.relatedEdges).toHaveLength(2);
    });

    it("marks edges without source symbol as __internals__", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          createLink("center", "dep", "outbound", undefined, "helper")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["dep"])
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "__internals__", false);

      expect(result.relatedSymbols.has("center:__internals__")).toBe(true);
    });

    it("marks edges without target symbol as __internals__", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          createLink("dep", "center", "inbound", "consumer", undefined)
        ],
        inboundIds: new Set(["dep"]),
        outboundIds: new Set()
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "__internals__", false);

      expect(result.relatedSymbols.has("center:__internals__")).toBe(true);
    });

    it("respects collapseOnHover setting when not pinned", () => {
      const center = createNode("center");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center],
        links: [],
        inboundIds: new Set(),
        outboundIds: new Set()
      };

      const optionsOff = createOptions({ collapseOnHover: false });
      const resultOff = computeSymbolHighlight(subgraph, optionsOff, "center", "func", false);
      expect(resultOff.shouldCollapse).toBe(false);

      const optionsOn = createOptions({ collapseOnHover: true });
      const resultOn = computeSymbolHighlight(subgraph, optionsOn, "center", "func", false);
      expect(resultOn.shouldCollapse).toBe(true);
    });

    it("respects collapseOnPin setting when pinned", () => {
      const center = createNode("center");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center],
        links: [],
        inboundIds: new Set(),
        outboundIds: new Set()
      };

      const optionsOff = createOptions({ collapseOnPin: false });
      const resultOff = computeSymbolHighlight(subgraph, optionsOff, "center", "func", true);
      expect(resultOff.shouldCollapse).toBe(false);

      const optionsOn = createOptions({ collapseOnPin: true });
      const resultOn = computeSymbolHighlight(subgraph, optionsOn, "center", "func", true);
      expect(resultOn.shouldCollapse).toBe(true);
    });

    it("identifies node-wide exporters (nodes where all edges lack symbol)", () => {
      const center = createNode("center");
      const barrelFile = createNode("barrel");
      const normalDep = createNode("normal");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, barrelFile, normalDep],
        links: [
          // Barrel file: no symbols on the barrel side
          createLink("center", "barrel", "outbound", "consumer", ""),
          createLink("barrel", "center", "inbound", "", "export"),
          // Normal dep: has symbols
          createLink("center", "normal", "outbound", "func", "helper")
        ],
        inboundIds: new Set(["barrel"]),
        outboundIds: new Set(["barrel", "normal"])
      };
      const options = createOptions({ collapseOnHover: true });

      const result = computeSymbolHighlight(subgraph, options, "center", "consumer", false);

      expect(result.nodeWideExporterIds.has("barrel")).toBe(true);
      expect(result.nodeWideExporterIds.has("normal")).toBe(false);
    });

    it("treats asset archetype as node-wide exporter when collapsing", () => {
      const center = createNode("center");
      const asset = createNode("asset", "asset");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, asset],
        links: [
          createLink("center", "asset", "outbound", "loadImage", "image.png")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["asset"])
      };
      const options = createOptions({ collapseOnHover: true });

      const result = computeSymbolHighlight(subgraph, options, "center", "loadImage", false);

      expect(result.nodeWideExporterIds.has("asset")).toBe(true);
    });

    it("does not identify node-wide exporters when collapse is off", () => {
      const center = createNode("center");
      const asset = createNode("asset", "asset");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, asset],
        links: [
          createLink("center", "asset", "outbound", "", "")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["asset"])
      };
      const options = createOptions({ collapseOnHover: false });

      const result = computeSymbolHighlight(subgraph, options, "center", "__internals__", false);

      expect(result.nodeWideExporterIds.size).toBe(0);
    });

    it("handles multiple edges with same symbol on different nodes", () => {
      const center = createNode("center");
      const dep1 = createNode("dep1");
      const dep2 = createNode("dep2");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep1, dep2],
        links: [
          createLink("center", "dep1", "outbound", "commonFunc", "handler"),
          createLink("center", "dep2", "outbound", "commonFunc", "handler")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["dep1", "dep2"])
      };
      const options = createOptions();

      const result = computeSymbolHighlight(subgraph, options, "center", "commonFunc", false);

      expect(result.relatedEdges).toHaveLength(2);
      expect(result.relatedNodeIds.has("dep1")).toBe(true);
      expect(result.relatedNodeIds.has("dep2")).toBe(true);
    });

    it("only matches edges where hovered node is the relevant endpoint", () => {
      const center = createNode("center");
      const dep = createNode("dep");
      const subgraph: LocalSubgraph = {
        center,
        nodes: [center, dep],
        links: [
          // Edge where the symbol is on dep, not on center
          createLink("center", "dep", "outbound", "centerFunc", "depFunc")
        ],
        inboundIds: new Set(),
        outboundIds: new Set(["dep"])
      };
      const options = createOptions();

      // Hovering 'depFunc' on center should NOT match (depFunc is on dep)
      const resultWrong = computeSymbolHighlight(subgraph, options, "center", "depFunc", false);
      expect(resultWrong.relatedEdges).toHaveLength(0);

      // Hovering 'centerFunc' on center SHOULD match
      const resultRight = computeSymbolHighlight(subgraph, options, "center", "centerFunc", false);
      expect(resultRight.relatedEdges).toHaveLength(1);

      // Hovering 'depFunc' on dep SHOULD match
      const resultDep = computeSymbolHighlight(subgraph, options, "dep", "depFunc", false);
      expect(resultDep.relatedEdges).toHaveLength(1);
    });
  });
});
