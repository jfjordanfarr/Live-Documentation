/**
 * Focal overlay for the Membrane Map.
 *
 * DOM module — builds and manages the augmented layer that appears
 * when pins are active, overlaying symbol expansion panels on pinned
 * leaf nodes and drawing SVG connections between them.
 *
 * @module focal-overlay
 */

import type { PinSet, VisibleConnection } from "./pin-state";
import { getPinnedNodeIds, isSymbolPinned, getPathEntries, hasActivePath } from "./pin-state";
import type { PinAnchor, RoutedTrace, FrontTrace, BackTrace } from "./routing";
import { routeConnection } from "./routing";
import type { MembraneLayout, MembraneNode } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";

// ─── Types ─────────────────────────────────────────────────────────

/** Callbacks for focal overlay interaction events. */
export interface FocalOverlayCallbacks {
  /** Called when a pin dot is clicked (toggle pin on/off). */
  onTogglePin: (nodeId: string, symbol: string) => void;
}

/**
 * A measured pin anchor with its absolute position in the layout.
 * Used after DOM insertion to compute connection geometry.
 */
export interface MeasuredAnchor {
  readonly nodeId: string;
  readonly symbol: string;
  readonly direction: "inbound" | "outbound";
  readonly element: HTMLElement;
}

/**
 * The result of rendering the focal overlay — contains the DOM elements
 * and an anchor registry for subsequent connection routing.
 */
export interface FocalOverlayResult {
  /** Symbol expansion panels keyed by node ID. */
  readonly panels: ReadonlyMap<string, HTMLElement>;
  /** All registered pin anchors for connection measurement. */
  readonly anchors: readonly MeasuredAnchor[];
  /** The SVG overlay element (initially empty; populated by drawConnections). */
  readonly svgOverlay: SVGSVGElement;
}

// ─── Constants ─────────────────────────────────────────────────────

const PIN_RADIUS = 6;

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
}

// ─── Panel Rendering ───────────────────────────────────────────────

/**
 * Render the focal overlay: symbol expansion panels on pinned nodes.
 *
 * Call this after browse-mode rendering. The returned panels should be
 * positioned over the corresponding leaf tiles in the membrane container.
 *
 * @param layout - Current membrane layout
 * @param pinSet - Current pin state
 * @param nodesById - Node payload lookup
 * @param callbacks - Pin toggle handler
 * @returns Overlay result with panels, anchors, and SVG overlay
 */
export function renderFocalOverlay(
  layout: MembraneLayout,
  pinSet: PinSet,
  nodesById: Map<string, ExplorerNodePayload>,
  callbacks: FocalOverlayCallbacks,
  selectedNodeId?: string | null,
  skipNodeIds?: ReadonlySet<string>,
): FocalOverlayResult {
  const pinnedNodeIds = getPinnedNodeIds(pinSet);
  const panels = new Map<string, HTMLElement>();
  const anchors: MeasuredAnchor[] = [];

  // Create SVG overlay for connections
  const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgOverlay.classList.add("membrane-focal-svg");
  svgOverlay.style.position = "absolute";
  svgOverlay.style.top = "0";
  svgOverlay.style.left = "0";
  svgOverlay.style.width = "100%";
  svgOverlay.style.height = "100%";
  svgOverlay.style.pointerEvents = "none";
  svgOverlay.style.zIndex = "5";

  // Build the set of node IDs that need focal panels:
  // all pinned nodes + the selected node (if it's a leaf file).
  // Skip nodes already rendered as cards in the card-grid.
  const focalNodeIds = new Set(pinnedNodeIds);
  if (selectedNodeId) {
    const selectedLayout = layout.index.get(selectedNodeId);
    if (selectedLayout && !selectedLayout.isDirectory) {
      focalNodeIds.add(selectedNodeId);
    }
  }
  if (skipNodeIds) {
    for (const id of skipNodeIds) {
      focalNodeIds.delete(id);
    }
  }

  for (const nodeId of focalNodeIds) {
    const layoutNode = layout.index.get(nodeId);
    const payload = nodesById.get(nodeId);

    // Only expand leaf nodes with symbol data
    if (!layoutNode || layoutNode.isDirectory || !payload) continue;

    const panel = renderSymbolPanel(layoutNode, payload, pinSet, anchors, callbacks);
    panels.set(nodeId, panel);
  }

  return { panels, anchors, svgOverlay };
}

/**
 * Build the symbol expansion panel for a single pinned node.
 *
 * The panel is absolutely positioned relative to the membrane container
 * at the node's layout rect position, expanding downward from the leaf.
 */
function renderSymbolPanel(
  node: MembraneNode,
  payload: ExplorerNodePayload,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
  callbacks: FocalOverlayCallbacks,
): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "membrane-focal-panel";
  panel.dataset.nodeId = node.id;
  panel.style.position = "absolute";
  panel.style.left = `${node.rect.x}px`;
  panel.style.top = `${node.rect.y}px`;
  panel.style.width = `${node.rect.width}px`;
  panel.style.height = `${node.rect.height}px`;

  // Header with file name
  const header = document.createElement("div");
  header.className = "membrane-focal-panel__header";
  header.textContent = escapeHtml(node.name);
  panel.appendChild(header);

  // Symbol list
  const symbolList = document.createElement("div");
  symbolList.className = "membrane-focal-panel__symbols";

  const symbols = payload.publicSymbols ?? [];
  for (const symbol of symbols) {
    const row = renderSymbolRow(node.id, symbol, pinSet, anchors, callbacks);
    symbolList.appendChild(row);
  }

  // If no symbols, show placeholder
  if (symbols.length === 0) {
    const empty = document.createElement("div");
    empty.className = "membrane-focal-panel__empty";
    empty.textContent = "No public symbols";
    symbolList.appendChild(empty);

    // Add wildcard anchors for file-level connections
    const wildcardRow = renderWildcardRow(node.id, anchors);
    symbolList.appendChild(wildcardRow);
  }

  panel.appendChild(symbolList);
  return panel;
}

/**
 * Render a single symbol row with inbound and outbound pin anchors.
 */
function renderSymbolRow(
  nodeId: string,
  symbol: string,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
  callbacks: FocalOverlayCallbacks,
): HTMLElement {
  const row = document.createElement("div");
  row.className = "membrane-focal-row";
  row.dataset.nodeId = nodeId;
  row.dataset.symbol = symbol;

  // Inbound pin (left side, green)
  const inboundPin = document.createElement("div");
  inboundPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
  if (isSymbolPinned(pinSet, nodeId, symbol)) {
    inboundPin.classList.add("membrane-focal-pin--active");
  }
  inboundPin.style.pointerEvents = "auto";
  inboundPin.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onTogglePin(nodeId, symbol);
  });
  row.appendChild(inboundPin);

  anchors.push({ nodeId, symbol, direction: "inbound", element: inboundPin });

  // Symbol name label
  const label = document.createElement("span");
  label.className = "membrane-focal-row__label";
  label.textContent = symbol;
  label.title = `${nodeId}::${symbol}`;
  row.appendChild(label);

  // Outbound pin (right side, blue)
  const outboundPin = document.createElement("div");
  outboundPin.className = "membrane-focal-pin membrane-focal-pin--outbound";
  if (isSymbolPinned(pinSet, nodeId, symbol)) {
    outboundPin.classList.add("membrane-focal-pin--active");
  }
  outboundPin.style.pointerEvents = "auto";
  outboundPin.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onTogglePin(nodeId, symbol);
  });
  row.appendChild(outboundPin);

  anchors.push({ nodeId, symbol, direction: "outbound", element: outboundPin });

  return row;
}

/**
 * Render a wildcard row for nodes with no public symbols.
 * Provides file-level anchors for connections.
 */
function renderWildcardRow(
  nodeId: string,
  anchors: MeasuredAnchor[],
): HTMLElement {
  const row = document.createElement("div");
  row.className = "membrane-focal-row membrane-focal-row--wildcard";

  const inboundPin = document.createElement("div");
  inboundPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
  row.appendChild(inboundPin);
  anchors.push({ nodeId, symbol: "*", direction: "inbound", element: inboundPin });

  const label = document.createElement("span");
  label.className = "membrane-focal-row__label membrane-focal-row__label--wildcard";
  label.textContent = "(file)";
  row.appendChild(label);

  const outboundPin = document.createElement("div");
  outboundPin.className = "membrane-focal-pin membrane-focal-pin--outbound";
  row.appendChild(outboundPin);
  anchors.push({ nodeId, symbol: "*", direction: "outbound", element: outboundPin });

  return row;
}

// ─── Connection Drawing ────────────────────────────────────────────

/**
 * Measure anchor positions and draw SVG connections.
 *
 * Must be called after the focal overlay panels are inserted into the DOM
 * (so getBoundingClientRect returns real positions).
 *
 * @param svgOverlay - The SVG element to draw into (from FocalOverlayResult)
 * @param anchorRegistry - All measured anchors (from FocalOverlayResult)
 * @param visibleConnections - Connections to draw (from getVisibleConnections)
 * @param containerEl - The membrane container element (for coordinate transform)
 * @param scale - Current zoom scale factor
 */
export function drawConnections(
  svgOverlay: SVGSVGElement,
  anchorRegistry: readonly MeasuredAnchor[],
  visibleConnections: readonly VisibleConnection[],
  containerEl: HTMLElement,
  scale: number,
): void {
  // Clear previous connections
  while (svgOverlay.firstChild) {
    svgOverlay.removeChild(svgOverlay.firstChild);
  }

  if (visibleConnections.length === 0) return;

  const containerRect = containerEl.getBoundingClientRect();

  // Build anchor index: "nodeId\0symbol\0direction" → element
  const anchorIndex = new Map<string, HTMLElement>();
  for (const anchor of anchorRegistry) {
    anchorIndex.set(`${anchor.nodeId}\0${anchor.symbol}\0${anchor.direction}`, anchor.element);
  }

  for (const conn of visibleConnections) {
    const sourceId = typeof conn.link.source === "string" ? conn.link.source : conn.link.source.id;
    const targetId = typeof conn.link.target === "string" ? conn.link.target : conn.link.target.id;
    const sourceSymbol = conn.link.sourceSymbol ?? "*";
    const targetSymbol = conn.link.targetSymbol ?? "*";

    const outboundEl = anchorIndex.get(`${sourceId}\0${sourceSymbol}\0outbound`);
    const inboundEl = anchorIndex.get(`${targetId}\0${targetSymbol}\0inbound`);

    if (!outboundEl || !inboundEl) continue;

    const outboundRect = outboundEl.getBoundingClientRect();
    const inboundRect = inboundEl.getBoundingClientRect();

    // Skip hidden/unmeasurable elements
    if ((outboundRect.width === 0 && outboundRect.height === 0) ||
        (inboundRect.width === 0 && inboundRect.height === 0)) {
      continue;
    }

    // Convert to svg-local coordinates (relative to container, unscaled)
    const outboundAnchor: PinAnchor = {
      center: {
        x: (outboundRect.left + outboundRect.width / 2 - containerRect.left) / scale,
        y: (outboundRect.top + outboundRect.height / 2 - containerRect.top) / scale,
      },
      direction: "outbound",
      pinRadius: PIN_RADIUS / scale,
    };

    const inboundAnchor: PinAnchor = {
      center: {
        x: (inboundRect.left + inboundRect.width / 2 - containerRect.left) / scale,
        y: (inboundRect.top + inboundRect.height / 2 - containerRect.top) / scale,
      },
      direction: "inbound",
      pinRadius: PIN_RADIUS / scale,
    };

    const trace = routeConnection(outboundAnchor, inboundAnchor);
    renderTrace(svgOverlay, trace, conn.link.kind);
  }
}

/**
 * Render a single routed trace into the SVG overlay.
 */
function renderTrace(
  svg: SVGSVGElement,
  trace: RoutedTrace,
  kind: string,
): void {
  if (trace.kind === "front") {
    renderFrontTrace(svg, trace, kind);
  } else {
    renderBackTrace(svg, trace, kind);
  }
}

/**
 * Render a front-trace Bézier as an SVG path.
 */
function renderFrontTrace(
  svg: SVGSVGElement,
  trace: FrontTrace,
  kind: string,
): void {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", trace.path.d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", getStrokeColor(kind));
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-opacity", "0.6");
  path.classList.add("membrane-connection", "membrane-connection--front");
  svg.appendChild(path);
}

/**
 * Render back-trace stubs as SVG polygons (French Corset).
 */
function renderBackTrace(
  svg: SVGSVGElement,
  trace: BackTrace,
  kind: string,
): void {
  const color = getStrokeColor(kind);

  const outStub = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  outStub.setAttribute("points", trace.outboundStubPoints);
  outStub.setAttribute("fill", color);
  outStub.setAttribute("fill-opacity", "0.25");
  outStub.setAttribute("stroke", color);
  outStub.setAttribute("stroke-width", "0.8");
  outStub.setAttribute("stroke-opacity", "0.5");
  outStub.classList.add("membrane-connection", "membrane-connection--back-stub");
  svg.appendChild(outStub);

  const inStub = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  inStub.setAttribute("points", trace.inboundStubPoints);
  inStub.setAttribute("fill", color);
  inStub.setAttribute("fill-opacity", "0.25");
  inStub.setAttribute("stroke", color);
  inStub.setAttribute("stroke-width", "0.8");
  inStub.setAttribute("stroke-opacity", "0.5");
  inStub.classList.add("membrane-connection", "membrane-connection--back-stub");
  svg.appendChild(inStub);
}

/**
 * Map edge kind to stroke color.
 */
function getStrokeColor(kind: string): string {
  switch (kind) {
    case "import": return "rgba(0, 145, 255, 0.7)";
    case "export": return "rgba(0, 211, 170, 0.7)";
    case "type":   return "rgba(180, 120, 255, 0.7)";
    default:       return "rgba(150, 150, 150, 0.6)";
  }
}

// ─── Hop Badges ────────────────────────────────────────────────────

/** Unicode circled-number characters ①-⑳. */
const CIRCLED_NUMBERS = [
  "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩",
  "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳",
];

/**
 * Get the display label for a hop index.
 * Uses circled numbers for 0-19, falls back to plain number for larger indices.
 */
export function hopLabel(hopIndex: number): string {
  return hopIndex < CIRCLED_NUMBERS.length
    ? CIRCLED_NUMBERS[hopIndex]
    : `(${hopIndex + 1})`;
}

/**
 * Attach hop badges to focal panels that are part of an active path.
 *
 * Each panel that contains a path entry gets a numbered badge in its
 * top-right corner showing the hop index.
 *
 * @param panels - Focal panels keyed by node ID
 * @param pinSet - Current pin state (must have active path)
 */
export function attachHopBadges(
  panels: ReadonlyMap<string, HTMLElement>,
  pinSet: PinSet,
): void {
  if (!hasActivePath(pinSet)) return;

  const pathEntries = getPathEntries(pinSet);

  // Build a map: nodeId → lowest hop index for that node
  const hopByNode = new Map<string, number>();
  for (const entry of pathEntries) {
    const existing = hopByNode.get(entry.nodeId);
    if (existing === undefined || entry.hopIndex! < existing) {
      hopByNode.set(entry.nodeId, entry.hopIndex!);
    }
  }

  for (const [nodeId, hopIndex] of hopByNode) {
    const panel = panels.get(nodeId);
    if (!panel) continue;

    const badge = document.createElement("div");
    badge.className = "membrane-hop-badge";
    badge.textContent = hopLabel(hopIndex);
    badge.title = `Path hop ${hopIndex + 1}`;
    panel.appendChild(badge);
  }
}

// ─── Path Breadcrumb Bar ───────────────────────────────────────────

/** Callbacks for breadcrumb bar interaction. */
export interface BreadcrumbCallbacks {
  /** Called when a breadcrumb hop is clicked (navigates to that node). */
  onClickHop: (nodeId: string, symbol: string) => void;
  /** Called when the clear button is clicked (clears the path). */
  onClearPath: () => void;
}

/**
 * Render a path breadcrumb bar showing the sequence of hops.
 *
 * Returns null if no active path exists.
 *
 * @param pinSet - Current pin state
 * @param nodesById - Node payload lookup (for display names)
 * @param callbacks - Click handlers
 */
export function renderPathBreadcrumb(
  pinSet: PinSet,
  nodesById: Map<string, ExplorerNodePayload>,
  callbacks: BreadcrumbCallbacks,
): HTMLElement | null {
  if (!hasActivePath(pinSet)) return null;

  const pathEntries = getPathEntries(pinSet);
  if (pathEntries.length === 0) return null;

  const bar = document.createElement("div");
  bar.className = "membrane-path-breadcrumb";

  // Path label
  const label = document.createElement("span");
  label.className = "membrane-path-breadcrumb__label";
  label.textContent = "Path:";
  bar.appendChild(label);

  pathEntries.forEach((entry, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "membrane-path-breadcrumb__separator";
      sep.textContent = "→";
      bar.appendChild(sep);
    }

    const hop = document.createElement("button");
    hop.className = "membrane-path-breadcrumb__hop";
    hop.type = "button";

    const node = nodesById.get(entry.nodeId);
    const displayName = node?.name ?? entry.nodeId.split("/").pop() ?? entry.nodeId;
    hop.textContent = `${hopLabel(entry.hopIndex!)} ${displayName}`;
    hop.title = `${entry.nodeId}::${entry.symbol}`;

    hop.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onClickHop(entry.nodeId, entry.symbol);
    });

    bar.appendChild(hop);
  });

  // Clear button
  const clear = document.createElement("button");
  clear.className = "membrane-path-breadcrumb__clear";
  clear.type = "button";
  clear.textContent = "✕";
  clear.title = "Clear path";
  clear.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onClearPath();
  });
  bar.appendChild(clear);

  return bar;
}
