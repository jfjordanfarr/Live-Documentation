/**
 * Symbol highlighting functions for Local Map.
 *
 * These are pure functions that operate on DOM elements and subgraph data,
 * allowing the LocalViewController to delegate symbol highlighting behavior
 * while keeping the logic testable and independently improvable.
 *
 * @module symbol-highlight
 */

import type { LocalViewOptions, LocalSubgraph, LocalSubgraphLink } from "./types";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/**
 * Describes the result of computing related symbols from a hover.
 */
export interface SymbolHighlightResult {
  /** Set of related node+symbol pairs in format "nodeId:normalizedSymbol" */
  relatedSymbols: Set<string>;
  /** Set of related node IDs for card-level highlighting */
  relatedNodeIds: Set<string>;
  /** Edges that should be highlighted */
  relatedEdges: LocalSubgraphLink[];
  /** Whether to enable collapsing of unrelated symbols */
  shouldCollapse: boolean;
  /** Set of node IDs that are "node-wide exporters" (barrel files, assets) */
  nodeWideExporterIds: Set<string>;
}

/**
 * Helper to normalize edge symbol consistently.
 */
function normalizeEdgeSymbol(sym: string | undefined): string {
  if (!sym) return "";
  return normalizeSymbolIdentifier(sym) ?? sym.toLowerCase();
}

/**
 * Helper to check if an edge symbol represents "Internals" (empty or undefined).
 */
function isInternalsEdge(edgeTargetSymbol: string | undefined): boolean {
  return !edgeTargetSymbol || edgeTargetSymbol === "";
}

/**
 * Computes which symbols, edges, and nodes should be highlighted
 * when a symbol is hovered or pinned.
 *
 * This is a pure function that performs all the computation without
 * touching the DOM, making it testable.
 */
export function computeSymbolHighlight(
  subgraph: LocalSubgraph,
  options: LocalViewOptions,
  nodeId: string,
  symbol: string,
  fromPin: boolean
): SymbolHighlightResult {
  const centerId = subgraph.center.id;

  // Normalize the hovered symbol for matching
  const isInternalsHover = symbol === "__internals__";
  const normalizedHoverSymbol = isInternalsHover
    ? "__internals__"
    : normalizeSymbolIdentifier(symbol) ?? symbol.toLowerCase();

  // Find all edges that involve this symbol on this node
  let relatedEdges: LocalSubgraphLink[];

  if (isInternalsHover && nodeId === centerId) {
    // Hovering Internals on the CENTER node:
    // Find edges where center's receiving end goes to Internals (no specific symbol).
    relatedEdges = subgraph.links.filter(edge => {
      const isDependencyToInternals =
        edge.sourceId === centerId && isInternalsEdge(edge.sourceSymbol);
      const isDependentFromInternals =
        edge.targetId === centerId && isInternalsEdge(edge.targetSymbol);
      return isDependencyToInternals || isDependentFromInternals;
    });
  } else if (isInternalsHover) {
    // Hovering Internals on a NEIGHBOR node:
    // Highlight ALL edges that involve this neighbor
    relatedEdges = subgraph.links.filter(edge => {
      return edge.sourceId === nodeId || edge.targetId === nodeId;
    });
  } else {
    // Normal symbol hover
    relatedEdges = subgraph.links.filter(edge => {
      const edgeSourceSymbol = normalizeEdgeSymbol(edge.sourceSymbol);
      const edgeTargetSymbol = normalizeEdgeSymbol(edge.targetSymbol);

      const isSourceMatch =
        edge.sourceId === nodeId && edgeSourceSymbol === normalizedHoverSymbol;
      const isTargetMatch =
        edge.targetId === nodeId && edgeTargetSymbol === normalizedHoverSymbol;
      return isSourceMatch || isTargetMatch;
    });
  }

  // Build sets of related node+symbol pairs for highlighting
  const relatedSymbols = new Set<string>();
  relatedSymbols.add(`${nodeId}:${normalizedHoverSymbol}`);

  // Build set of related node IDs for card-level highlighting
  const relatedNodeIds = new Set<string>();
  relatedNodeIds.add(nodeId);

  relatedEdges.forEach(edge => {
    if (edge.sourceSymbol) {
      relatedSymbols.add(`${edge.sourceId}:${normalizeEdgeSymbol(edge.sourceSymbol)}`);
    } else {
      relatedSymbols.add(`${edge.sourceId}:__internals__`);
    }
    if (edge.targetSymbol) {
      relatedSymbols.add(`${edge.targetId}:${normalizeEdgeSymbol(edge.targetSymbol)}`);
    } else {
      relatedSymbols.add(`${edge.targetId}:__internals__`);
    }

    relatedNodeIds.add(edge.sourceId);
    relatedNodeIds.add(edge.targetId);
  });

  // Determine if collapse mode is enabled
  const shouldCollapse = fromPin
    ? options.state.tuning.localMap?.collapseOnPin ?? false
    : options.state.tuning.localMap?.collapseOnHover ?? false;

  // Identify node-wide exporters
  const nodeWideExporterIds = new Set<string>();
  if (shouldCollapse) {
    const edgesByNode = new Map<string, LocalSubgraphLink[]>();
    subgraph.links.forEach(edge => {
      if (!edgesByNode.has(edge.sourceId)) edgesByNode.set(edge.sourceId, []);
      if (!edgesByNode.has(edge.targetId)) edgesByNode.set(edge.targetId, []);
      edgesByNode.get(edge.sourceId)!.push(edge);
      edgesByNode.get(edge.targetId)!.push(edge);
    });

    edgesByNode.forEach((edges, nodeIdToCheck) => {
      const allEdgesLackSymbol = edges.every(edge => {
        const isSource = edge.sourceId === nodeIdToCheck;
        const symbolOnThisSide = isSource ? edge.sourceSymbol : edge.targetSymbol;
        return !symbolOnThisSide || symbolOnThisSide === "";
      });
      if (allEdgesLackSymbol && edges.length > 0) {
        nodeWideExporterIds.add(nodeIdToCheck);
      }
    });

    // Also treat assets as node-wide exporters
    subgraph.nodes.forEach(n => {
      if ((n.archetype || "").toLowerCase() === "asset") {
        nodeWideExporterIds.add(n.id);
      }
    });
  }

  return {
    relatedSymbols,
    relatedNodeIds,
    relatedEdges,
    shouldCollapse,
    nodeWideExporterIds
  };
}

/**
 * Applies the computed highlight result to the DOM.
 * This is the side-effectful part of symbol highlighting.
 */
export function applySymbolHighlight(
  container: HTMLElement,
  overlay: HTMLElement,
  highlight: SymbolHighlightResult,
  centerId: string,
  dimSymbols: number,
  dimConnections: number,
  drawConnections: () => void
): void {
  // Apply CSS custom properties for dimming
  container.style.setProperty("--hover-dim-symbols", String(dimSymbols));
  container.style.setProperty("--hover-dim-connections", String(dimConnections));

  // Add class to container AND overlay to enable dimming mode
  container.classList.add("symbol-hover-active");
  overlay.classList.add("symbol-hover-active");

  // Track whether we collapsed anything
  let didCollapse = false;

  // Mark related symbols as highlighted
  container.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
    const rowNodeId = row.dataset.nodeId;
    const rowSymbol = row.dataset.symbol;
    if (rowNodeId && rowSymbol) {
      const normalizedRowSymbol =
        rowSymbol === "__internals__"
          ? "__internals__"
          : normalizeSymbolIdentifier(rowSymbol) ?? rowSymbol.toLowerCase();
      const isRelated = highlight.relatedSymbols.has(`${rowNodeId}:${normalizedRowSymbol}`);

      if (isRelated) {
        row.classList.add("symbol-highlighted");
      } else if (highlight.shouldCollapse && rowNodeId !== centerId) {
        row.classList.add("symbol-collapsed");
        didCollapse = true;
      }
    }
  });

  // Mark related cards as highlighted
  container.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const cardId = card.dataset.id;
    if (cardId && highlight.relatedNodeIds.has(cardId)) {
      card.classList.add("card-highlighted");
    }
  });

  // If we collapsed any symbols, redraw connections
  if (didCollapse) {
    drawConnections();
  }

  // Mark related connection paths as highlighted
  highlight.relatedEdges.forEach(edge => {
    const sourceSymbol = edge.sourceSymbol ?? "";
    const targetSymbol = edge.targetSymbol ?? "";
    const selector = `.connection-path[data-source-id="${edge.sourceId}"][data-target-id="${edge.targetId}"][data-source-symbol="${sourceSymbol}"][data-target-symbol="${targetSymbol}"]`;
    overlay.querySelectorAll<SVGPathElement>(selector).forEach(path => {
      path.classList.add("connection-highlighted");
    });
  });
}

/**
 * Clears all symbol highlighting from the DOM.
 */
export function clearSymbolHighlightDOM(
  container: HTMLElement,
  overlay: HTMLElement,
  drawConnections: () => void
): void {
  const hadCollapsed = container.querySelector(".symbol-collapsed") !== null;

  container.classList.remove("symbol-hover-active");
  overlay.classList.remove("symbol-hover-active");

  container.querySelectorAll<HTMLElement>(".symbol-highlighted").forEach(el => {
    el.classList.remove("symbol-highlighted");
  });
  container.querySelectorAll<HTMLElement>(".symbol-collapsed").forEach(el => {
    el.classList.remove("symbol-collapsed");
  });
  container.querySelectorAll<HTMLElement>(".card-highlighted").forEach(el => {
    el.classList.remove("card-highlighted");
  });
  overlay.querySelectorAll<SVGPathElement>(".connection-highlighted").forEach(path => {
    path.classList.remove("connection-highlighted");
  });
  container.querySelectorAll<HTMLElement>(".symbol-pinned").forEach(el => {
    el.classList.remove("symbol-pinned");
  });

  // If we had collapsed symbols, redraw connections to restore all paths
  if (hadCollapsed) {
    drawConnections();
  }
}
