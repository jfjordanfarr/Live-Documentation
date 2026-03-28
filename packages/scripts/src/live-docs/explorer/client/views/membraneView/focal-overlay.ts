/**
 * Focal overlay for the Membrane Map.
 *
 * DOM module — builds and manages the augmented layer that appears
 * when pins are active, overlaying symbol expansion panels on pinned
 * leaf nodes and drawing SVG connections between them.
 *
 * @module focal-overlay
 */

import { animateLineDrawIn } from "./animation";
import type { PinSet, VisibleConnection } from "./pin-state";
import { getPinnedNodeIds, isSymbolPinned, getPathEntries, hasActivePath } from "./pin-state";
import type { PinAnchor, RoutedTrace, FrontTrace, BackTrace } from "./routing";
import { routeConnection } from "./routing";
import type { BezierTuningParams } from "../connection-geometry";
import type { MembraneLayout, MembraneNode } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";
import { normalizeSymbolIdentifier } from "../../views/symbolAnchors";

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
  svgOverlay.style.overflow = "visible";

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
  tuning?: BezierTuningParams,
): void {
  // Clear previous connections
  while (svgOverlay.firstChild) {
    svgOverlay.removeChild(svgOverlay.firstChild);
  }

  if (visibleConnections.length === 0) return;

  // Create <defs> for per-connection gradients (blue → green, like Local Map)
  const SVG_NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(SVG_NS, "defs");
  svgOverlay.appendChild(defs);

  const containerRect = containerEl.getBoundingClientRect();

  // Build anchor index: "nodeId\0normalizedSymbol\0direction" → element
  // Normalise symbol names so raw names (from UI) and anchor slugs (from graph) both resolve.
  const anchorIndex = new Map<string, HTMLElement>();
  for (const anchor of anchorRegistry) {
    const normSym = anchor.symbol === "*" || anchor.symbol === "__internals__"
      ? anchor.symbol
      : (normalizeSymbolIdentifier(anchor.symbol) ?? anchor.symbol);
    anchorIndex.set(`${anchor.nodeId}\0${normSym}\0${anchor.direction}`, anchor.element);
  }

  let gradientIndex = 0;

  for (const conn of visibleConnections) {
    const sourceId = typeof conn.link.source === "string" ? conn.link.source : conn.link.source.id;
    const targetId = typeof conn.link.target === "string" ? conn.link.target : conn.link.target.id;
    const sourceSymbolRaw = conn.link.sourceSymbol ?? "*";
    const targetSymbolRaw = conn.link.targetSymbol;
    // Null targetSymbol (after flow-direction swap) represents an unattributed
    // dependency — route it to the __internals__ anchor on the target card,
    // mirroring the Local Map's Internals absorption pattern.
    const sourceSymbol = sourceSymbolRaw === "*" ? "*" : (normalizeSymbolIdentifier(sourceSymbolRaw) ?? sourceSymbolRaw);
    const targetSymbol = targetSymbolRaw
      ? (normalizeSymbolIdentifier(targetSymbolRaw) ?? targetSymbolRaw)
      : "__internals__";

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

    const trace = routeConnection(outboundAnchor, inboundAnchor, tuning);
    const gradientId = `membrane-conn-grad-${gradientIndex++}`;
    createConnectionGradient(defs, gradientId, outboundAnchor.center, inboundAnchor.center);
    const edgeInfo: EdgeInfo = { sourceId, sourceSymbol, targetId, targetSymbol };
    renderTrace(svgOverlay, trace, conn.link.kind, gradientId, edgeInfo);
  }
}

/**
 * Create a per-connection linear gradient from outbound (blue) to inbound (green),
 * matching the Local Map's gradient style.
 */
function createConnectionGradient(
  defs: SVGDefsElement,
  gradientId: string,
  source: { x: number; y: number },
  target: { x: number; y: number },
): void {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const gradient = document.createElementNS(SVG_NS, "linearGradient");
  gradient.setAttribute("id", gradientId);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", String(source.x));
  gradient.setAttribute("y1", String(source.y));
  gradient.setAttribute("x2", String(target.x));
  gradient.setAttribute("y2", String(target.y));

  for (const [offset, color] of [
    ["0%",   OUTBOUND_COLOR],
    ["10%",  OUTBOUND_COLOR],
    ["90%",  INBOUND_COLOR],
    ["100%", INBOUND_COLOR],
  ] as const) {
    const stop = document.createElementNS(SVG_NS, "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    gradient.appendChild(stop);
  }

  defs.appendChild(gradient);
}

/** Identifies the endpoints of a connection for data-attribute tagging. */
interface EdgeInfo {
  sourceId: string;
  sourceSymbol: string;
  targetId: string;
  targetSymbol: string;
}

/** Apply data-* edge attributes to an SVG element for hover filtering. */
function tagEdge(el: SVGElement, info: EdgeInfo): void {
  el.dataset.sourceId = info.sourceId;
  el.dataset.sourceSymbol = info.sourceSymbol;
  el.dataset.targetId = info.targetId;
  el.dataset.targetSymbol = info.targetSymbol;
}

/**
 * Render a single routed trace into the SVG overlay.
 */
function renderTrace(
  svg: SVGSVGElement,
  trace: RoutedTrace,
  kind: string,
  gradientId: string,
  edgeInfo: EdgeInfo,
): void {
  if (trace.kind === "front") {
    renderFrontTrace(svg, trace, kind, gradientId, edgeInfo);
  } else {
    renderBackTrace(svg, trace, kind, edgeInfo);
  }
}

/**
 * Render a front-trace Bézier as an SVG path with a blue→green gradient.
 * Applies a "line draw" animation from outbound (source) to inbound (target).
 */
function renderFrontTrace(
  svg: SVGSVGElement,
  trace: FrontTrace,
  _kind: string,
  gradientId: string,
  edgeInfo: EdgeInfo,
): void {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", trace.path.d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", `url(#${gradientId})`);
  path.setAttribute("stroke-width", "2.2");
  path.setAttribute("stroke-opacity", "0.7");
  path.classList.add("membrane-connection", "membrane-connection--front");
  tagEdge(path, edgeInfo);
  svg.appendChild(path);
  animateLineDrawIn(path, 350);
}

/**
 * Render back-trace stubs as SVG polygons (French Corset).
 * Outbound stub uses blue (outbound color), inbound stub uses green (inbound color).
 * Both stubs fade in over 250ms.
 */
function renderBackTrace(
  svg: SVGSVGElement,
  trace: BackTrace,
  _kind: string,
  edgeInfo: EdgeInfo,
): void {
  const outStub = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  outStub.setAttribute("points", trace.outboundStubPoints);
  outStub.setAttribute("fill", OUTBOUND_COLOR);
  outStub.setAttribute("fill-opacity", "0");
  outStub.setAttribute("stroke", OUTBOUND_COLOR);
  outStub.setAttribute("stroke-width", "0.8");
  outStub.setAttribute("stroke-opacity", "0");
  outStub.classList.add("membrane-connection", "membrane-connection--back-stub");
  tagEdge(outStub, edgeInfo);
  svg.appendChild(outStub);

  const inStub = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  inStub.setAttribute("points", trace.inboundStubPoints);
  inStub.setAttribute("fill", INBOUND_COLOR);
  inStub.setAttribute("fill-opacity", "0");
  inStub.setAttribute("stroke", INBOUND_COLOR);
  inStub.setAttribute("stroke-width", "0.8");
  inStub.setAttribute("stroke-opacity", "0");
  inStub.classList.add("membrane-connection", "membrane-connection--back-stub");
  tagEdge(inStub, edgeInfo);
  svg.appendChild(inStub);

  // Fade in both stubs
  requestAnimationFrame(() => {
    outStub.style.transition = "fill-opacity 250ms ease-in, stroke-opacity 250ms ease-in";
    outStub.setAttribute("fill-opacity", "0.25");
    outStub.setAttribute("stroke-opacity", "0.5");

    inStub.style.transition = "fill-opacity 250ms ease-in, stroke-opacity 250ms ease-in";
    inStub.setAttribute("fill-opacity", "0.25");
    inStub.setAttribute("stroke-opacity", "0.5");
  });
}

// ─── Connection Color Constants ──────────────────────────────────
// Match the Local Map's palette: outbound = sky-400, inbound = emerald-400.
const OUTBOUND_COLOR = "#38bdf8";
const INBOUND_COLOR = "#34d399";

/**
 * Map edge kind to a solid stroke color (used for back-trace stubs).
 * For front traces, prefer gradients via {@link createConnectionGradient}.
 */
function _getStrokeColor(kind: string): string {
  switch (kind) {
    case "dependency": return OUTBOUND_COLOR;
    case "extends":    return "rgba(180, 120, 255, 0.7)";
    case "implements": return "rgba(255, 180, 50, 0.7)";
    default:           return OUTBOUND_COLOR;
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

// ─── Hover Dimming ─────────────────────────────────────────────────

const HOVER_ACTIVE_CLASS = "membrane-hover-active";
const CONN_HIGHLIGHTED_CLASS = "membrane-connection--highlighted";
const PIN_PARTICIPATING_CLASS = "membrane-focal-pin--participating";
const ROW_PARTICIPATING_CLASS = "membrane-row--participating";

/**
 * Set up hover dimming on symbol rows within `container`.
 *
 * When the user hovers a symbol row that participates in at least one
 * visible connection, all connections in the `svgOverlay` that do NOT
 * involve that symbol are dimmed.  If the hovered symbol has no
 * connections, nothing happens — no spurious dimming.
 *
 * Endpoint pins and labels of highlighted connections that are not
 * themselves pinned are marked as "participating" so they can be
 * partially un-dimmed, guiding the user toward further exploration.
 *
 * Handlers are attached via event delegation on the container so setup
 * is called once, not per-row.
 *
 * @param container - The membrane container element (holds symbol rows)
 * @param svgOverlay - The SVG overlay element (holds connection paths)
 */
export function setupHoverDimming(
  container: HTMLElement,
  svgOverlay: SVGSVGElement,
): void {
  container.addEventListener("mouseenter", (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>(
      ".membrane-focal-row, .membrane-card__symbol-row",
    );
    if (!row) return;

    const nodeId = row.dataset.nodeId;
    const symbolRaw = row.dataset.symbol;
    if (!nodeId || !symbolRaw) return;

    const symbol = symbolRaw === "__internals__"
      ? "__internals__"
      : (normalizeSymbolIdentifier(symbolRaw) ?? symbolRaw);

    // Collect connections that involve this node+symbol on either end
    const connections = svgOverlay.querySelectorAll<SVGElement>(".membrane-connection");
    let matchCount = 0;

    // Track the opposite-end endpoints of matched connections so we can
    // mark their pin dots / labels as "participating".
    const participatingEndpoints: Array<{ nodeId: string; symbol: string; direction: "inbound" | "outbound" }> = [];

    for (const el of connections) {
      const srcId = el.dataset.sourceId;
      const srcSym = el.dataset.sourceSymbol;
      const tgtId = el.dataset.targetId;
      const tgtSym = el.dataset.targetSymbol;

      const isSourceMatch = srcId === nodeId && srcSym === symbol;
      const isTargetMatch = tgtId === nodeId && tgtSym === symbol;

      if (isSourceMatch || isTargetMatch) {
        el.classList.add(CONN_HIGHLIGHTED_CLASS);
        matchCount++;

        // Record the *opposite* endpoint so its pin dot can be highlighted
        if (isSourceMatch && tgtId && tgtSym) {
          participatingEndpoints.push({ nodeId: tgtId, symbol: tgtSym, direction: "inbound" });
        }
        if (isTargetMatch && srcId && srcSym) {
          participatingEndpoints.push({ nodeId: srcId, symbol: srcSym, direction: "outbound" });
        }
      }
    }

    // If the hovered symbol has no connections, do nothing
    if (matchCount === 0) return;

    // Activate dimming mode
    svgOverlay.classList.add(HOVER_ACTIVE_CLASS);

    // Mark participating endpoints: find their pin dots and containing rows
    for (const ep of participatingEndpoints) {
      // Find pin dots via the anchor registry in the DOM
      // Pin dots share the same nodeId/symbol data attributes on their parent row
      const selector = `.membrane-focal-row[data-node-id="${CSS.escape(ep.nodeId)}"][data-symbol="${CSS.escape(ep.symbol)}"], .membrane-card__symbol-row[data-node-id="${CSS.escape(ep.nodeId)}"][data-symbol="${CSS.escape(ep.symbol)}"]`;
      for (const matchRow of container.querySelectorAll<HTMLElement>(selector)) {
        matchRow.classList.add(ROW_PARTICIPATING_CLASS);
        // Find the specific directional pin dot
        const pinClass = ep.direction === "inbound"
          ? "membrane-focal-pin--inbound"
          : "membrane-focal-pin--outbound";
        const pin = matchRow.querySelector<HTMLElement>(`.${pinClass}`);
        if (pin) pin.classList.add(PIN_PARTICIPATING_CLASS);
      }
    }
  }, true); // useCapture so we catch before bubbling

  container.addEventListener("mouseleave", (e) => {
    const row = (e.target as HTMLElement).closest?.(
      ".membrane-focal-row, .membrane-card__symbol-row",
    );
    if (!row) return;

    clearHoverDimming(svgOverlay, container);
  }, true);
}

/** Remove all hover-dimming state from the SVG overlay and container. */
export function clearHoverDimming(svgOverlay: SVGSVGElement, container?: HTMLElement): void {
  svgOverlay.classList.remove(HOVER_ACTIVE_CLASS);
  for (const el of svgOverlay.querySelectorAll<SVGElement>(`.${CONN_HIGHLIGHTED_CLASS}`)) {
    el.classList.remove(CONN_HIGHLIGHTED_CLASS);
  }
  if (container) {
    for (const el of container.querySelectorAll<HTMLElement>(`.${PIN_PARTICIPATING_CLASS}`)) {
      el.classList.remove(PIN_PARTICIPATING_CLASS);
    }
    for (const el of container.querySelectorAll<HTMLElement>(`.${ROW_PARTICIPATING_CLASS}`)) {
      el.classList.remove(ROW_PARTICIPATING_CLASS);
    }
    for (const el of container.querySelectorAll<HTMLElement>(".membrane-card__symbol-row--connected")) {
      el.classList.remove("membrane-card__symbol-row--connected");
    }
  }
}

// ─── Static Connected-Endpoint Marking ─────────────────────────────

const ROW_CONNECTED_CLASS = "membrane-card__symbol-row--connected";

/**
 * After connections are drawn in pin-active mode, scan all SVG connection
 * elements and mark the symbol rows of connected-but-unpinned endpoints
 * with a persistent CSS class.  This provides always-visible indication
 * of which symbols participate in the dependency graph — not just on hover.
 *
 * Pinned symbols already have `.membrane-focal-pin--active` styling;
 * this function targets the unpinned endpoints that complete a connection.
 */
export function markConnectedEndpoints(
  svgOverlay: SVGSVGElement,
  container: HTMLElement,
  pinSet: PinSet,
): void {
  // Clear previous marks
  for (const el of container.querySelectorAll<HTMLElement>(`.${ROW_CONNECTED_CLASS}`)) {
    el.classList.remove(ROW_CONNECTED_CLASS);
  }

  // Collect all unique endpoint (nodeId, symbol) pairs from drawn connections
  const endpoints = new Set<string>();
  for (const el of svgOverlay.querySelectorAll<SVGElement>(".membrane-connection")) {
    const srcId = el.dataset.sourceId;
    const srcSym = el.dataset.sourceSymbol;
    const tgtId = el.dataset.targetId;
    const tgtSym = el.dataset.targetSymbol;
    if (srcId && srcSym) endpoints.add(`${srcId}\0${srcSym}`);
    if (tgtId && tgtSym) endpoints.add(`${tgtId}\0${tgtSym}`);
  }

  // Build lowercase lookup: graph edges store symbols lowercased but
  // symbol rows use original case.  Index all rows by (nodeId, lower(symbol))
  // so we can match case-insensitively.
  const rowsByKey = new Map<string, HTMLElement[]>();
  for (const row of container.querySelectorAll<HTMLElement>(".membrane-card__symbol-row[data-node-id][data-symbol]")) {
    const key = `${row.dataset.nodeId}\0${row.dataset.symbol!.toLowerCase()}`;
    const arr = rowsByKey.get(key);
    if (arr) arr.push(row);
    else rowsByKey.set(key, [row]);
  }

  // Mark rows that are connected but not pinned
  for (const key of endpoints) {
    const [nodeId, symbol] = key.split("\0");
    // Skip synthetic __internals__ symbol — no matching row
    if (symbol === "__internals__") continue;

    const lowerKey = `${nodeId}\0${symbol.toLowerCase()}`;
    const rows = rowsByKey.get(lowerKey);
    if (rows) {
      for (const row of rows) {
        // Use the row's original-case symbol for the pinned check
        const rowSymbol = row.dataset.symbol!;
        if (isSymbolPinned(pinSet, nodeId, rowSymbol)) continue;
        row.classList.add(ROW_CONNECTED_CLASS);
      }
    }
  }
}
