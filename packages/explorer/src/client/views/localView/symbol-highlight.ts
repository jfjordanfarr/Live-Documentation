/**
 * Symbol highlighting functions for Local Map.
 *
 * These are pure functions that operate on DOM elements and subgraph data,
 * allowing the LocalViewController to delegate symbol highlighting behavior
 * while keeping the logic testable and independently improvable.
 *
 * @module symbol-highlight
 */

import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { isPairLine } from "./directory-flow";
import type { LocalViewOptions, LocalSubgraph, LocalSubgraphLink } from "./types";

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

/** The symbols at a link's two ends. */
type LinkEnds = Pick<LocalSubgraphLink, "sourceSymbol" | "targetSymbol">;

/**
 * The links an edge carries: a reference is its own one; a pair line of an opened directory, which names no symbol at
 * its hubs, carries the links it stands for (2026-11-19: until then a row's hover kept no line, and in Flow, the
 * default, faded every wire of the picture).
 */
const linksOfEdge = (edge: LocalSubgraphLink): readonly LinkEnds[] => (isPairLine(edge) ? edge.standsFor ?? [] : [edge]);

/** Marks the rows at both ends of one of an edge's links, an end with no symbol being its file's Internals. */
function addRows(rows: Set<string>, edge: LocalSubgraphLink, link: LinkEnds): void {
  rows.add(`${edge.sourceId}:${link.sourceSymbol ? normalizeEdgeSymbol(link.sourceSymbol) : "__internals__"}`);
  rows.add(`${edge.targetId}:${link.targetSymbol ? normalizeEdgeSymbol(link.targetSymbol) : "__internals__"}`);
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

  // Normalize the hovered symbol for matching
  const isInternalsHover = symbol === "__internals__";
  const normalizedHoverSymbol = isInternalsHover
    ? "__internals__"
    : normalizeSymbolIdentifier(symbol) ?? symbol.toLowerCase();

  // Whether one end of a link is the hovered row: the row's own symbol, or for Internals an end that names no symbol
  // (Internals denotes unresolved/private implementation on this file, regardless of which retained file currently has
  // reading focus).
  const isHovered = (fileId: string, endSymbol: string | undefined): boolean => fileId === nodeId
    && (isInternalsHover ? isInternalsEdge(endSymbol) : normalizeEdgeSymbol(endSymbol) === normalizedHoverSymbol);
  const carries = (link: LinkEnds, edge: LocalSubgraphLink): boolean =>
    isHovered(edge.sourceId, link.sourceSymbol) || isHovered(edge.targetId, link.targetSymbol);

  // Every edge that carries a link of this symbol on this node
  const relatedEdges = subgraph.links.filter(edge => linksOfEdge(edge).some(link => carries(link, edge)));

  // Build sets of related node+symbol pairs for highlighting
  const relatedSymbols = new Set<string>();
  relatedSymbols.add(`${nodeId}:${normalizedHoverSymbol}`);

  // Build set of related node IDs for card-level highlighting
  const relatedNodeIds = new Set<string>();
  relatedNodeIds.add(nodeId);

  // The rows at both ends of each of the row's links, a pair line's own among them.
  relatedEdges.forEach(edge => {
    for (const link of linksOfEdge(edge).filter(each => carries(each, edge))) addRows(relatedSymbols, edge, link);
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
  drawConnections: () => void,
  reapplyCentering?: () => void
): void {
  // Apply CSS custom properties for dimming
  container.style.setProperty("--hover-dim-symbols", String(dimSymbols));
  container.style.setProperty("--hover-dim-connections", String(dimConnections));

  // If we collapsed any symbols, reapply centering first, then redraw connections
  // (centering changes element positions, so connectors must be drawn after)
  if (markHighlight(container, overlay, highlight, centerId)) {
    reapplyCentering?.();
    drawConnections();
  }
  markConnections(overlay, highlight.relatedEdges);
}

/**
 * The highlight of whole connections, which pointing at a returning connection's lace or at a card's foot on its returns
 * keeps (2026-11-19): every drawn thing of each, a return's two laces and its whole route, both its cards and the rows
 * at both ends of each link it carries. So the two laces are seen to be one connection, and where it goes.
 */
export function connectionsHighlight(edges: readonly LocalSubgraphLink[]): SymbolHighlightResult {
  const relatedSymbols = new Set<string>(), relatedNodeIds = new Set<string>();
  for (const edge of edges) {
    for (const link of linksOfEdge(edge)) addRows(relatedSymbols, edge, link);
    relatedNodeIds.add(edge.sourceId);
    relatedNodeIds.add(edge.targetId);
  }
  return { relatedSymbols, relatedNodeIds, relatedEdges: [...edges], shouldCollapse: false, nodeWideExporterIds: new Set() };
}

/**
 * Keeps the given connections and fades the rest, as a row's hover does, by the fades the picture's render set; the
 * pointer or the keyboard on a lace or a foot (2026-11-19). Nothing is moved or added.
 */
export function lightConnections(container: HTMLElement, overlay: HTMLElement, edges: readonly LocalSubgraphLink[]): void {
  clearSymbolHighlightDOM(container, overlay, () => {});
  const highlight = connectionsHighlight(edges);
  markHighlight(container, overlay, highlight, "");
  markConnections(overlay, highlight.relatedEdges);
  // The cards the connections join stay as they are and every other card fades, as a card's hover in Flow fades them:
  // a lace says nothing of its far card, which the eye finds by the cards left standing (local.css).
  container.classList.add("connections-lit");
}

/**
 * Lets the pointer or the keyboard on an element keep whole connections, a returning lace's or a card's foot on its
 * returns (2026-11-19): lit while either rests on it, put out when both have left, and never putting out a highlight it
 * did not make, such as a row's hover begun as the element lost the keyboard's focus.
 */
export function attendConnections(element: Element, container: HTMLElement, overlay: HTMLElement, carries: () => readonly LocalSubgraphLink[]): void {
  let pointed = false, focused = false;
  const light = (): void => lightConnections(container, overlay, carries());
  element.addEventListener("pointerenter", () => { pointed = true; light(); });
  element.addEventListener("focus", () => { focused = true; light(); });
  element.addEventListener("pointerleave", () => { pointed = false; if (!focused) releaseConnections(container, overlay); });
  element.addEventListener("blur", () => { focused = false; if (!pointed) releaseConnections(container, overlay); });
}

/**
 * Puts out a highlight of whole connections, if one stands: when its element leaves the page under the pointer or the
 * keyboard, which then tells it nothing (a cycle's trial redraws the cards' feet, a drawing drops a lace that no longer
 * returns), as when the pointer or the focus leaves it.
 */
export function releaseConnections(container: HTMLElement, overlay: HTMLElement, leaving?: Element): void {
  if (!container.classList.contains("connections-lit")) return;
  if (leaving && !leaving.matches(":hover") && leaving !== document.activeElement) return;
  clearSymbolHighlightDOM(container, overlay, () => {});
}

/** Marks the hover's rows and cards and turns its fading on; whether any row was collapsed. */
function markHighlight(container: HTMLElement, overlay: HTMLElement, highlight: SymbolHighlightResult, centerId: string): boolean {
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

  return didCollapse;
}

/** Marks the drawn things of the given edges as kept. */
function markConnections(overlay: HTMLElement, edges: readonly LocalSubgraphLink[]): void {
  // Mark related connection paths as highlighted
  // Use normalized symbols to match paths (which also use normalized data attributes)
  edges.forEach(edge => {
    const sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
    const targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
    const pair = `[data-source-id="${CSS.escape(edge.sourceId)}"][data-target-id="${CSS.escape(edge.targetId)}"]`;
    // The wire itself, and at the overview band the gathered wire that holds it (2026-11-06): a gathered wire is
    // emphasized when any of its references would be.
    const selector = `.connection-path${pair}[data-source-symbol="${CSS.escape(sourceSymbol)}"][data-target-symbol="${CSS.escape(targetSymbol)}"], .connection-path.gathered${pair}`;
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
  drawConnections: () => void,
  reapplyCentering?: () => void
): void {
  const hadCollapsed = container.querySelector(".symbol-collapsed") !== null;

  container.classList.remove("symbol-hover-active", "connections-lit");
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

  // If we had collapsed symbols, reapply centering first, then redraw connections
  // (centering changes element positions, so connectors must be drawn after)
  if (hadCollapsed) {
    reapplyCentering?.();
    drawConnections();
  }
}
