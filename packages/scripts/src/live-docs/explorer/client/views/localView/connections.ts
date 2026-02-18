import type { LocalViewRuntime } from "./runtime";
import type { PathResult } from "./state";
import type { ColumnRole, LayoutExtents, LocalEdge, LocalSubgraph } from "./types";
import type { BezierTuning, ExplorerState } from "../../types";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/**
 * Represents a hop in the multi-hop visualization chain.
 * Each hop has a center node and its associated subgraph.
 */
export interface MultiHopEntry {
  /** Zero-based hop index (0 = origin) */
  hopIndex: number;
  /** The center node ID for this hop */
  centerId: string;
  /** The subgraph containing edges for this hop */
  subgraph: LocalSubgraph;
}

/**
 * Ambient context required by {@link drawConnections} to measure DOM
 * anchors, read explorer state, and emit SVG paths.
 */
export interface ConnectionsContext {
  runtime: LocalViewRuntime;
  state: ExplorerState;
  svgNamespace: string;
  getAnchor: (nodeId: string, columnRole: ColumnRole, direction: "inbound" | "outbound", symbol?: string) => HTMLElement | null;
  /**
   * Extended anchor lookup for multi-hop visualization.
   * Includes hop index to disambiguate the same node appearing in multiple columns.
   */
  getAnchorWithHop?: (
    nodeId: string,
    columnRole: ColumnRole,
    hopIndex: number,
    direction: "inbound" | "outbound",
    symbol?: string
  ) => HTMLElement | null;
  measureLayoutExtents: () => LayoutExtents | null;
  /** Card bounds for the center node, used for self-loop routing */
  getCenterCardBounds?: () => { left: number; right: number; top: number; bottom: number } | null;
  /** Card bounds for a specific hop's center node */
  getCardBoundsForHop?: (hopIndex: number) => { left: number; right: number; top: number; bottom: number } | null;
  /**
   * Multi-hop subgraph data. When provided, connections are drawn for all hops.
   * When not provided, falls back to single-hop drawing using currentSubgraph.
   */
  multiHopData?: MultiHopEntry[];
  /**
   * Active pathfinding result. When provided, use path-mode connection drawing
   * where all columns are "center" columns with different hopIndex values.
   */
  activePath?: PathResult;
}

interface AnchorMeasurement {
  centerX: number;
  centerY: number;
  leftX: number;
  rightX: number;
  topY: number;
  bottomY: number;
  isSymbol: boolean;
  cardLeft: number;
  cardRight: number;
  columnPosition: "left" | "center" | "right";
}

/**
 * Main entry point for drawing SVG connection edges in the Local Map view.
 *
 * Delegates to either multi-hop or single-hop rendering depending on the
 * presence of {@link ConnectionsContext.multiHopData}.  Measures DOM anchor
 * positions relative to the container, computes Bézier curves, and appends
 * `<path>` elements to the SVG overlay.
 */
export function drawConnections(context: ConnectionsContext): void {
  const { runtime, state } = context;
  const { overlay, container, currentSubgraph, mapTransform } = runtime;
  overlay.innerHTML = "";

  // Multi-hop path: delegate to dedicated drawing logic
  if (context.multiHopData && context.multiHopData.length > 0 && context.getAnchorWithHop) {
    drawMultiHopConnections(context);
    return;
  }

  // Single-hop (legacy) path
  if (!state.selectedNode || !currentSubgraph) {
    overlay.dataset.active = "false";
    return;
  }

  const extents = context.measureLayoutExtents();
  if (!extents) {
    overlay.dataset.active = "false";
    return;
  }
  const bounds = extents.content;

  const rootRect = container.getBoundingClientRect();
  const scale = mapTransform.k || 1;

  const positionCache = new Map<HTMLElement, AnchorMeasurement | null>();
  const measureAnchor = (anchor: HTMLElement | null): AnchorMeasurement | null => {
    if (!anchor) {
      return null;
    }
    if (positionCache.has(anchor)) {
      return positionCache.get(anchor) ?? null;
    }
    const rect = anchor.getBoundingClientRect();
    // Hidden elements (display: none or collapsed) return zero-sized rects.
    // Treat them as unmeasurable so edges skip them instead of drawing garbage paths.
    if (rect.width === 0 && rect.height === 0) {
      positionCache.set(anchor, null);
      return null;
    }
    const cardElem = anchor.closest(".node-card");
    const cardRect = cardElem instanceof HTMLElement ? cardElem.getBoundingClientRect() : null;
    const columnElem = anchor.closest(".local-column");
    let columnPosition: "left" | "center" | "right" = "center";
    const position = columnElem instanceof HTMLElement ? columnElem.dataset.position : undefined;
    if (position === "left" || position === "right" || position === "center") {
      columnPosition = position;
    }
    const measurement: AnchorMeasurement = {
      centerX: (rect.left - rootRect.left + rect.width / 2) / scale,
      centerY: (rect.top - rootRect.top + rect.height / 2) / scale,
      leftX: (rect.left - rootRect.left) / scale,
      rightX: (rect.right - rootRect.left) / scale,
      topY: (rect.top - rootRect.top) / scale,
      bottomY: (rect.bottom - rootRect.top) / scale,
      isSymbol: anchor.classList.contains("symbol-anchor"),
      cardLeft: cardRect ? (cardRect.left - rootRect.left) / scale : (rect.left - rootRect.left) / scale,
      cardRight: cardRect ? (cardRect.right - rootRect.left) / scale : (rect.right - rootRect.left) / scale,
      columnPosition
    };
    positionCache.set(anchor, measurement);
    return measurement;
  };

  const segments: Array<{
    edge: LocalEdge;
    renderDirection: "inbound" | "outbound";
    source: { x: number; y: number };
    target: { x: number; y: number };
  }> = [];

  const centerId = currentSubgraph.center.id;

  // Pin radius in CSS pixels (half of the 11.33px anchor width).
  // Paths stop one radius shy of the pin center so they don't overlap the circle.
  const PIN_RADIUS = 6;

  // Get center card bounds for self-loop routing
  const centerCardBounds = context.getCenterCardBounds?.();

  // Offset a point horizontally by `distance` pixels based on pin direction.
  // This keeps Y at the pin center while offsetting X to the pin edge.
  // Outbound pins: connections exit to the right → offset to right edge (+distance)
  // Inbound pins: connections enter from the left → offset to left edge (-distance)
  const offsetToEdge = (
    anchor: AnchorMeasurement,
    pinDirection: "inbound" | "outbound",
    distance: number
  ): { x: number; y: number } => {
    // Outbound pins emit to the right, inbound pins receive from the left
    const offsetX = pinDirection === "outbound"
      ? anchor.centerX + distance  // Right edge for outbound
      : anchor.centerX - distance; // Left edge for inbound
    return { x: offsetX, y: anchor.centerY };
  };

  // Self-loop segments need special wraparound rendering
  const selfLoopSegments: Array<{
    edge: LocalEdge;
    source: AnchorMeasurement;
    target: AnchorMeasurement;
    sourcePoint: { x: number; y: number };
    targetPoint: { x: number; y: number };
  }> = [];

  currentSubgraph.links.forEach(edge => {
    // Detect self-loops: both source and target reference the center node
    const isSelfLoop = edge.sourceId === centerId && edge.targetId === centerId;

    if (isSelfLoop) {
      // Self-loop: a symbol on the center card references another symbol on the same card
      // Provider is the outbound pin (targetSymbol), consumer is the inbound pin (sourceSymbol)
      const providerAnchor = measureAnchor(context.getAnchor(centerId, "center", "outbound", edge.targetSymbol));
      const consumerAnchor = measureAnchor(context.getAnchor(centerId, "center", "inbound", edge.sourceSymbol));

      if (!providerAnchor || !consumerAnchor) {
        return;
      }

      const sourcePoint = offsetToEdge(providerAnchor, "outbound", PIN_RADIUS);
      const targetPoint = offsetToEdge(consumerAnchor, "inbound", PIN_RADIUS);
      selfLoopSegments.push({ edge, source: providerAnchor, target: consumerAnchor, sourcePoint, targetPoint });
      return;
    }

    // For dependencies (direction === "outbound"), draw from the dependency's outbound side to the center's inbound side.
    // For dependents (direction === "inbound"), draw from the center's outbound side to the dependent's inbound side.
    const isDependency = edge.direction === "outbound";

    // Column role mapping:
    // - Dependencies live in "upstream" column, center node in "center", dependents in "downstream"
    const providerAnchor = isDependency
      ? measureAnchor(context.getAnchor(edge.targetId, "upstream", "outbound", edge.targetSymbol))
      : measureAnchor(context.getAnchor(centerId, "center", "outbound", edge.targetSymbol));

    const consumerAnchor = isDependency
      ? measureAnchor(context.getAnchor(centerId, "center", "inbound", edge.sourceSymbol))
      : measureAnchor(context.getAnchor(edge.sourceId, "downstream", "inbound", edge.sourceSymbol));

    if (!providerAnchor || !consumerAnchor) {
      return;
    }

    // Offset both endpoints by PIN_RADIUS so paths stop at the pin edge, not center.
    // Provider is always outbound (emitting), consumer is always inbound (receiving).
    const sourcePoint = offsetToEdge(providerAnchor, "outbound", PIN_RADIUS);
    const targetPoint = offsetToEdge(consumerAnchor, "inbound", PIN_RADIUS);
    const renderDirection: "inbound" | "outbound" = isDependency ? "inbound" : "outbound";
    segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint });
  });

  if (segments.length === 0 && selfLoopSegments.length === 0) {
    overlay.dataset.active = "false";
    return;
  }

  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);
  const svg = document.createElementNS(context.svgNamespace, "svg") as SVGSVGElement;
  svg.classList.add("connection-svg");
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.position = "absolute";
  svg.style.left = `${bounds.left}px`;
  svg.style.top = `${bounds.top}px`;
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
  svg.style.pointerEvents = "none";

  // Create defs element for gradients
  const defs = document.createElementNS(context.svgNamespace, "defs") as SVGDefsElement;
  svg.appendChild(defs);

  overlay.appendChild(svg);

  let gradientIndex = 0;
  segments.forEach(({ edge, renderDirection, source, target }) => {
    const adjustedSource = {
      x: source.x - bounds.left,
      y: source.y - bounds.top
    };
    const adjustedTarget = {
      x: target.x - bounds.left,
      y: target.y - bounds.top
    };
    const gradientId = `conn-grad-${gradientIndex++}`;
    appendConnectionPath(svg, defs, adjustedSource, adjustedTarget, renderDirection, edge, context.svgNamespace, state.tuning.bezier, gradientId);
  });

  // Render self-loop connections (intra-node type references) with wraparound beziers
  if (centerCardBounds) {
    const taper = state.tuning.localMap?.selfLoopTaper ?? 0.5;
    selfLoopSegments.forEach(({ edge, source, target, sourcePoint, targetPoint }) => {
      const adjustedSource = {
        x: sourcePoint.x - bounds.left,
        y: sourcePoint.y - bounds.top
      };
      const adjustedTarget = {
        x: targetPoint.x - bounds.left,
        y: targetPoint.y - bounds.top
      };
      const cardBoundsAdjusted = {
        left: centerCardBounds.left - bounds.left,
        right: centerCardBounds.right - bounds.left,
        top: centerCardBounds.top - bounds.top,
        bottom: centerCardBounds.bottom - bounds.top
      };
      appendSelfLoopPath(svg, adjustedSource, adjustedTarget, source, target, cardBoundsAdjusted, edge, context.svgNamespace, taper);
    });
  }

  overlay.dataset.active = "true";
}

function appendConnectionPath(
  svg: SVGSVGElement,
  defs: SVGDefsElement,
  source: { x: number; y: number },
  target: { x: number; y: number },
  renderDirection: "inbound" | "outbound",
  edge: LocalEdge,
  svgNamespace: string,
  tuning: BezierTuning,
  gradientId: string
): void {
  const horizontalDirection = target.x >= source.x ? 1 : -1;
  const gapX = Math.abs(target.x - source.x);
  const commands: string[] = [`M ${source.x} ${source.y}`];

  if (gapX < 24) {
    const midY = (source.y + target.y) / 2;
    commands.push(`Q ${source.x} ${midY} ${target.x} ${target.y}`);
  } else {
    const stubBase = Math.max(gapX * tuning.stubFactor, tuning.stubMin);
    const stubLimit = Math.max(44, gapX - tuning.stubMaxOffset);
    const stub = Math.min(stubBase, stubLimit);
    const control1X = source.x + horizontalDirection * stub;
    const control2X = target.x - horizontalDirection * stub;
    const deltaY = target.y - source.y;
    const control1Y = source.y + deltaY * tuning.verticalOffset;
    const control2Y = target.y - deltaY * tuning.verticalOffset;
    commands.push(`C ${control1X} ${control1Y} ${control2X} ${control2Y} ${target.x} ${target.y}`);
  }

  // Create a linear gradient from source (outbound/blue) to target (inbound/green).
  // Colors match the CSS variables: --outbound-color and --inbound-color.
  // Gradient uses 10%-80%-10% breathing room: pure source color, transition, pure target color.
  const gradient = document.createElementNS(svgNamespace, "linearGradient");
  gradient.setAttribute("id", gradientId);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", String(source.x));
  gradient.setAttribute("y1", String(source.y));
  gradient.setAttribute("x2", String(target.x));
  gradient.setAttribute("y2", String(target.y));

  // 0-10%: Pure source color (blue)
  const stopSourceStart = document.createElementNS(svgNamespace, "stop");
  stopSourceStart.setAttribute("offset", "0%");
  stopSourceStart.setAttribute("stop-color", "#38bdf8"); // outbound blue (sky-400)

  const stopSourceEnd = document.createElementNS(svgNamespace, "stop");
  stopSourceEnd.setAttribute("offset", "10%");
  stopSourceEnd.setAttribute("stop-color", "#38bdf8"); // outbound blue (sky-400)

  // 10-90%: Gradient transition zone
  const stopTargetStart = document.createElementNS(svgNamespace, "stop");
  stopTargetStart.setAttribute("offset", "90%");
  stopTargetStart.setAttribute("stop-color", "#34d399"); // inbound green (emerald-400)

  // 90-100%: Pure target color (green)
  const stopTargetEnd = document.createElementNS(svgNamespace, "stop");
  stopTargetEnd.setAttribute("offset", "100%");
  stopTargetEnd.setAttribute("stop-color", "#34d399"); // inbound green (emerald-400)

  gradient.appendChild(stopSourceStart);
  gradient.appendChild(stopSourceEnd);
  gradient.appendChild(stopTargetStart);
  gradient.appendChild(stopTargetEnd);
  defs.appendChild(gradient);

  const path = document.createElementNS(svgNamespace, "path") as SVGPathElement;
  path.setAttribute("d", commands.join(" "));
  path.setAttribute("stroke", `url(#${gradientId})`);
  path.classList.add("connection-path", renderDirection);
  path.dataset.kind = edge.kind;
  // Normalize symbols for consistent selector matching (fixes duplicate edge format mismatch)
  path.dataset.sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
  path.dataset.targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
  path.dataset.sourceId = edge.sourceId;
  path.dataset.targetId = edge.targetId;
  svg.appendChild(path);
}

/**
 * Renders a "French Corset" self-loop as two tiny "nubby" stubs that suggest
 * the connection wraps around behind the card.
 *
 * Visual approach:
 * - Provider stub (blue/outbound): tiny curve extending right from the blue pin,
 *   then curling slightly inward (toward target Y) before fading/thinning
 * - Consumer stub (green/inbound): tiny curve extending left from the green pin,
 *   then curling slightly inward (toward source Y) before fading/thinning
 *
 * The stubs don't connect visually — the "behind the card" connection is implied.
 * This creates a cleaner "lacing" effect without tangled beziers.
 * 
 * Tapering: The strokes thin from full width at the pin to a narrower width at the end,
 * controlled by the selfLoopTaper tuning parameter (0 = no taper, 1 = taper to 25% width).
 */
function appendSelfLoopPath(
  svg: SVGSVGElement,
  source: { x: number; y: number },
  target: { x: number; y: number },
  _sourceAnchor: AnchorMeasurement,
  _targetAnchor: AnchorMeasurement,
  _cardBounds: { left: number; right: number; top: number; bottom: number },
  edge: LocalEdge,
  svgNamespace: string,
  taper: number
): void {
  // Stub parameters - small nubs that extend from the pin's outer edge
  const STUB_LENGTH = 14;      // How far the stub extends horizontally from pin edge
  const CURL_AMOUNT = 8;       // How much the stub curls toward partner symbol
  const BASE_WIDTH = 2.5;      // Width at the pin edge
  // Taper: 0 = stay at BASE_WIDTH, 1 = go down to 25% of BASE_WIDTH
  const END_WIDTH = BASE_WIDTH * (1 - taper * 0.75);

  // Direction of Y curl: toward the partner symbol
  const providerCurlY = target.y > source.y ? CURL_AMOUNT : -CURL_AMOUNT;
  const consumerCurlY = source.y > target.y ? CURL_AMOUNT : -CURL_AMOUNT;

  // Calculate perpendicular offsets for the polygon edges
  const halfBaseWidth = BASE_WIDTH / 2;
  const halfEndWidth = END_WIDTH / 2;

  // === Provider stub (outbound/blue side) ===
  // source.x is already at the pin's RIGHT edge (center + PIN_RADIUS from caller)
  // Start right at the pin edge, extend outward
  const providerStartX = source.x;  // Pin's right edge
  const providerEndX = source.x + STUB_LENGTH;  // Extend outward
  const providerEndY = source.y + providerCurlY;
  
  const providerPolygonPoints = [
    `${providerStartX},${source.y - halfBaseWidth}`,
    `${providerEndX},${providerEndY - halfEndWidth}`,
    `${providerEndX},${providerEndY + halfEndWidth}`,
    `${providerStartX},${source.y + halfBaseWidth}`
  ].join(" ");

  // === Consumer stub (inbound/green side) ===
  // target.x is already at the pin's LEFT edge (center - PIN_RADIUS from caller)
  // Start right at the pin edge, extend outward
  const consumerStartX = target.x;  // Pin's left edge
  const consumerEndX = target.x - STUB_LENGTH;  // Extend outward
  const consumerEndY = target.y + consumerCurlY;
  
  const consumerPolygonPoints = [
    `${consumerStartX},${target.y - halfBaseWidth}`,
    `${consumerEndX},${consumerEndY - halfEndWidth}`,
    `${consumerEndX},${consumerEndY + halfEndWidth}`,
    `${consumerStartX},${target.y + halfBaseWidth}`
  ].join(" ");

  // Solid colors matching the pin colors (no gradient/opacity fade)
  const PROVIDER_COLOR = "#38bdf8"; // sky-400 (outbound blue)
  const CONSUMER_COLOR = "#34d399"; // emerald-400 (inbound green)

  // === Render provider stub as filled polygon (true taper) ===
  const providerPolygon = document.createElementNS(svgNamespace, "polygon") as SVGPolygonElement;
  providerPolygon.setAttribute("points", providerPolygonPoints);
  // Use style.fill (inline CSS) instead of attribute to override the CSS fill:none rule
  providerPolygon.style.fill = PROVIDER_COLOR;
  providerPolygon.style.stroke = "none";
  providerPolygon.classList.add("connection-path", "self-loop", "self-loop-provider");
  providerPolygon.dataset.kind = edge.kind;
  providerPolygon.dataset.sourceId = edge.sourceId;
  providerPolygon.dataset.targetId = edge.targetId;
  // Normalize symbols for consistent selector matching (fixes duplicate edge format mismatch)
  providerPolygon.dataset.sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
  providerPolygon.dataset.targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
  svg.appendChild(providerPolygon);

  // === Render consumer stub as filled polygon (true taper) ===
  const consumerPolygon = document.createElementNS(svgNamespace, "polygon") as SVGPolygonElement;
  consumerPolygon.setAttribute("points", consumerPolygonPoints);
  // Use style.fill (inline CSS) instead of attribute to override the CSS fill:none rule
  consumerPolygon.style.fill = CONSUMER_COLOR;
  consumerPolygon.style.stroke = "none";
  consumerPolygon.classList.add("connection-path", "self-loop", "self-loop-consumer");
  consumerPolygon.dataset.kind = edge.kind;
  consumerPolygon.dataset.sourceId = edge.sourceId;
  consumerPolygon.dataset.targetId = edge.targetId;
  // Normalize symbols for consistent selector matching (fixes duplicate edge format mismatch)
  consumerPolygon.dataset.sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
  consumerPolygon.dataset.targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
  svg.appendChild(consumerPolygon);
}

/**
 * Draw connections for multi-hop pathfinding visualization.
 * 
 * Each hop has three columns:
 *   - upstream (dependencies, hopIndex N)
 *   - center (the hop's center node, hopIndex N)
 *   - downstream (dependents, hopIndex N)
 * 
 * Connections are drawn within each hop (upstream→center, center→downstream).
 * No cross-hop connections are drawn - visual continuity comes from
 * the downstream column of hop N containing the center of hop N+1.
 */
function drawMultiHopConnections(context: ConnectionsContext): void {
  const { runtime, state, multiHopData, getAnchorWithHop, activePath } = context;
  const { overlay, container, mapTransform } = runtime;

  if (!multiHopData || !getAnchorWithHop) {
    overlay.dataset.active = "false";
    return;
  }

  // Path mode: all columns are "center" columns with different hopIndex values
  const isPathMode = !!activePath && activePath.nodeIds.length > 0;

  if (!multiHopData || !getAnchorWithHop) {
    overlay.dataset.active = "false";
    return;
  }

  const extents = context.measureLayoutExtents();
  if (!extents) {
    overlay.dataset.active = "false";
    return;
  }
  const bounds = extents.content;

  const rootRect = container.getBoundingClientRect();
  const scale = mapTransform.k || 1;

  const positionCache = new Map<HTMLElement, AnchorMeasurement | null>();
  const measureAnchor = (anchor: HTMLElement | null): AnchorMeasurement | null => {
    if (!anchor) {
      return null;
    }
    if (positionCache.has(anchor)) {
      return positionCache.get(anchor) ?? null;
    }
    const rect = anchor.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      positionCache.set(anchor, null);
      return null;
    }
    const cardElem = anchor.closest(".node-card");
    const cardRect = cardElem instanceof HTMLElement ? cardElem.getBoundingClientRect() : null;
    const columnElem = anchor.closest(".local-column");
    let columnPosition: "left" | "center" | "right" = "center";
    const position = columnElem instanceof HTMLElement ? columnElem.dataset.position : undefined;
    if (position === "left" || position === "right" || position === "center") {
      columnPosition = position;
    }
    const measurement: AnchorMeasurement = {
      centerX: (rect.left - rootRect.left + rect.width / 2) / scale,
      centerY: (rect.top - rootRect.top + rect.height / 2) / scale,
      leftX: (rect.left - rootRect.left) / scale,
      rightX: (rect.right - rootRect.left) / scale,
      topY: (rect.top - rootRect.top) / scale,
      bottomY: (rect.bottom - rootRect.top) / scale,
      isSymbol: anchor.classList.contains("symbol-anchor"),
      cardLeft: cardRect ? (cardRect.left - rootRect.left) / scale : (rect.left - rootRect.left) / scale,
      cardRight: cardRect ? (cardRect.right - rootRect.left) / scale : (rect.right - rootRect.left) / scale,
      columnPosition
    };
    positionCache.set(anchor, measurement);
    return measurement;
  };

  const PIN_RADIUS = 6;

  const offsetToEdge = (
    anchor: AnchorMeasurement,
    pinDirection: "inbound" | "outbound",
    distance: number
  ): { x: number; y: number } => {
    const offsetX = pinDirection === "outbound"
      ? anchor.centerX + distance
      : anchor.centerX - distance;
    return { x: offsetX, y: anchor.centerY };
  };

  const segments: Array<{
    edge: LocalEdge;
    renderDirection: "inbound" | "outbound";
    source: { x: number; y: number };
    target: { x: number; y: number };
    hopIndex: number;
  }> = [];

  // PATH MODE: Draw connections between adjacent path nodes
  // In path mode, all columns are "center" columns with different hopIndex values
  if (isPathMode) {
    // Path edges connect adjacent path nodes: center[hopN] → center[hopN+1]
    for (const hopEntry of multiHopData) {
      const { hopIndex: _hopIndex, centerId: _centerId, subgraph } = hopEntry;
      
      subgraph.links.forEach(edge => {
        // Find the hopIndex of the edge's source and target nodes
        const sourceHopIndex = multiHopData.findIndex(h => h.centerId === edge.sourceId);
        const targetHopIndex = multiHopData.findIndex(h => h.centerId === edge.targetId);
        
        // Only draw edges between adjacent path nodes (no self-loops, no gaps)
        if (sourceHopIndex < 0 || targetHopIndex < 0) {
          return; // Node not in path
        }
        if (Math.abs(sourceHopIndex - targetHopIndex) !== 1) {
          return; // Not adjacent
        }
        
        // Determine direction: left-to-right is the natural flow
        const isForward = sourceHopIndex < targetHopIndex;
        
        // Provider (outbound anchor) is on the source node
        // Consumer (inbound anchor) is on the target node
        // Both are "center" columns but at different hopIndex values
        const providerAnchor = measureAnchor(
          getAnchorWithHop(edge.sourceId, "center", sourceHopIndex, "outbound", edge.targetSymbol)
        );
        const consumerAnchor = measureAnchor(
          getAnchorWithHop(edge.targetId, "center", targetHopIndex, "inbound", edge.sourceSymbol)
        );
        
        if (!providerAnchor || !consumerAnchor) {
          return;
        }
        
        const sourcePoint = offsetToEdge(providerAnchor, "outbound", PIN_RADIUS);
        const targetPoint = offsetToEdge(consumerAnchor, "inbound", PIN_RADIUS);
        const renderDirection: "inbound" | "outbound" = isForward ? "outbound" : "inbound";
        segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint, hopIndex: sourceHopIndex });
      });
    }
  } else {
    // EXPLORATION MODE: Draw connections within each hop (upstream→center, center→downstream)
    for (const hopEntry of multiHopData) {
      const { hopIndex, centerId, subgraph } = hopEntry;

      subgraph.links.forEach(edge => {
        // Skip self-loops for now in multi-hop (can be extended later)
        const isSelfLoop = edge.sourceId === centerId && edge.targetId === centerId;
        if (isSelfLoop) {
          return;
        }

        const isDependency = edge.direction === "outbound";

        // For multi-hop, use hop-aware anchor lookup
        // Dependencies: upstream(hopN) → center(hopN)
        // Dependents: center(hopN) → downstream(hopN)
        const providerAnchor = isDependency
          ? measureAnchor(getAnchorWithHop(edge.targetId, "upstream", hopIndex, "outbound", edge.targetSymbol))
          : measureAnchor(getAnchorWithHop(centerId, "center", hopIndex, "outbound", edge.targetSymbol));

        const consumerAnchor = isDependency
          ? measureAnchor(getAnchorWithHop(centerId, "center", hopIndex, "inbound", edge.sourceSymbol))
          : measureAnchor(getAnchorWithHop(edge.sourceId, "downstream", hopIndex, "inbound", edge.sourceSymbol));

        if (!providerAnchor || !consumerAnchor) {
          return;
        }

        const sourcePoint = offsetToEdge(providerAnchor, "outbound", PIN_RADIUS);
        const targetPoint = offsetToEdge(consumerAnchor, "inbound", PIN_RADIUS);
        const renderDirection: "inbound" | "outbound" = isDependency ? "inbound" : "outbound";
        segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint, hopIndex });
      });
    }
  }

  if (segments.length === 0) {
    overlay.dataset.active = "false";
    return;
  }

  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);
  const svg = document.createElementNS(context.svgNamespace, "svg") as SVGSVGElement;
  svg.classList.add("connection-svg");
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.position = "absolute";
  svg.style.left = `${bounds.left}px`;
  svg.style.top = `${bounds.top}px`;
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
  svg.style.pointerEvents = "none";

  const defs = document.createElementNS(context.svgNamespace, "defs") as SVGDefsElement;
  svg.appendChild(defs);
  overlay.appendChild(svg);

  let gradientIndex = 0;
  segments.forEach(({ edge, renderDirection, source, target, hopIndex }) => {
    const adjustedSource = {
      x: source.x - bounds.left,
      y: source.y - bounds.top
    };
    const adjustedTarget = {
      x: target.x - bounds.left,
      y: target.y - bounds.top
    };
    const gradientId = `conn-grad-hop${hopIndex}-${gradientIndex++}`;
    appendConnectionPath(svg, defs, adjustedSource, adjustedTarget, renderDirection, edge, context.svgNamespace, state.tuning.bezier, gradientId);
  });

  overlay.dataset.active = "true";
}
