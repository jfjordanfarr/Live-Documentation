import { curveTo, LANE_MARGIN, LANE_PADDING, LANE_PITCH, threadedRoute, type Passage } from "./branch-routing";
import { edgeKey, type BranchGraph } from "./branches";
import type { LocalViewRuntime } from "./runtime";
import type { PathResult } from "./state";
import type { ColumnRole, LayoutExtents, LocalEdge } from "./types";
import type { BezierTuning, ExplorerState } from "../../types";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/**
 * Ambient context required by {@link drawConnections} to measure DOM
 * anchors, read explorer state, and emit SVG paths.
 */
export interface ConnectionsContext {
  branches?: BranchGraph;
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
   * The drawn path, when the view is in path mode. Its wires come from the
   * path subgraph in `runtime.currentSubgraph`, one column per file.
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

interface Point {
  x: number;
  y: number;
}

/**
 * Pin radius in CSS pixels (half of the 11.33px anchor width).
 * Paths stop one radius shy of the pin center so they don't overlap the circle.
 */
const PIN_RADIUS = 6;

/**
 * Main entry point for drawing SVG connection edges in the Local Map view.
 *
 * Draws an explicit path, independent branches, or the classic neighborhood.
 * Each measures DOM anchor positions relative to the
 * container, computes Bézier curves, and appends `<path>` elements to the SVG
 * overlay.
 */
export function drawConnections(context: ConnectionsContext): void {
  const { runtime, state } = context;
  const { overlay, container, currentSubgraph, mapTransform } = runtime;
  overlay.innerHTML = "";

  if (context.activePath && context.activePath.nodeIds.length > 0) {
    drawPathConnections(context);
    return;
  }

  if (context.branches) {
    drawBranchConnections(context);
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

  const measureAnchor = createAnchorMeasurer(container, mapTransform.k || 1);

  const segments: Array<{
    edge: LocalEdge;
    renderDirection: "inbound" | "outbound";
    source: Point;
    target: Point;
  }> = [];

  const centerId = currentSubgraph.center.id;

  // Get center card bounds for self-loop routing
  const centerCardBounds = context.getCenterCardBounds?.();

  // Self-loop segments need special wraparound rendering
  const selfLoopSegments: Array<{
    edge: LocalEdge;
    source: AnchorMeasurement;
    target: AnchorMeasurement;
    sourcePoint: Point;
    targetPoint: Point;
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

      const sourcePoint = offsetToEdge(providerAnchor, "outbound");
      const targetPoint = offsetToEdge(consumerAnchor, "inbound");
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
    const sourcePoint = offsetToEdge(providerAnchor, "outbound");
    const targetPoint = offsetToEdge(consumerAnchor, "inbound");
    const renderDirection: "inbound" | "outbound" = isDependency ? "inbound" : "outbound";
    segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint });
  });

  if (segments.length === 0 && selfLoopSegments.length === 0) {
    overlay.dataset.active = "false";
    return;
  }

  const { svg, defs } = createOverlaySvg(context, bounds);

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

/**
 * Returns a function that measures an anchor's position in container
 * coordinates, unscaled, caching each anchor. Hidden elements (display: none
 * or collapsed) return zero-sized rects and are treated as unmeasurable so
 * edges skip them instead of drawing garbage paths.
 */
function createAnchorMeasurer(container: HTMLElement, scale: number): (anchor: HTMLElement | null) => AnchorMeasurement | null {
  const rootRect = container.getBoundingClientRect();
  const positionCache = new Map<HTMLElement, AnchorMeasurement | null>();
  return (anchor: HTMLElement | null): AnchorMeasurement | null => {
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
}

/**
 * The point a wire meets a pin: one pin radius outside its centre, to the
 * right of an outbound pin (wires leave to the right) and to the left of an
 * inbound pin (wires arrive from the left), level with the pin.
 */
function offsetToEdge(anchor: AnchorMeasurement, pinDirection: "inbound" | "outbound"): Point {
  const offsetX = pinDirection === "outbound"
    ? anchor.centerX + PIN_RADIUS
    : anchor.centerX - PIN_RADIUS;
  return { x: offsetX, y: anchor.centerY };
}

/** Creates the overlay's SVG, sized and placed over the content bounds, with its gradient defs. */
function createOverlaySvg(
  context: ConnectionsContext,
  bounds: { left: number; top: number; width: number; height: number }
): { svg: SVGSVGElement; defs: SVGDefsElement } {
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
  context.runtime.overlay.appendChild(svg);
  return { svg, defs };
}

function appendConnectionPath(
  svg: SVGSVGElement,
  defs: SVGDefsElement,
  source: Point,
  target: Point,
  renderDirection: "inbound" | "outbound",
  edge: LocalEdge,
  svgNamespace: string,
  tuning: BezierTuning,
  gradientId: string,
  routedPath?: string,
  extraClass?: string
): void {
  const commands: string[] = [`M ${source.x} ${source.y}`, curveTo(source, target, tuning)];

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
  path.setAttribute("d", routedPath ?? commands.join(" "));
  path.setAttribute("stroke", `url(#${gradientId})`);
  path.classList.add("connection-path", renderDirection);
  if (extraClass) path.classList.add(extraClass);
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
  source: Point,
  target: Point,
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
 * Draws the wires of a path: one column per file, each file depending on the
 * one before it, so what offers stands left of what uses it.
 *
 * Every reference between adjacent files that runs with the path leaves the
 * earlier file's offering pin (blue, right edge) and enters the later file's
 * using pin (green, left edge), the same grammar as the exploration columns.
 * A reference that runs against the path, the earlier file depending on the
 * later, is not drawn: a wire never reaches backwards across the columns (the
 * owner's rule of 2025-12-18). The toolbar counts those references instead.
 */
function drawPathConnections(context: ConnectionsContext): void {
  const { runtime, state, activePath, getAnchorWithHop } = context;
  const { overlay, container, currentSubgraph, mapTransform } = runtime;

  if (!activePath || !currentSubgraph || !getAnchorWithHop) {
    overlay.dataset.active = "false";
    return;
  }

  const extents = context.measureLayoutExtents();
  if (!extents) {
    overlay.dataset.active = "false";
    return;
  }
  const bounds = extents.content;

  const measureAnchor = createAnchorMeasurer(container, mapTransform.k || 1);
  const columnOf = new Map(activePath.nodeIds.map((id, index) => [id, index] as const));

  const segments: Array<{ edge: LocalEdge; source: Point; target: Point; column: number }> = [];
  for (const edge of currentSubgraph.links) {
    // The link runs from the file that depends (its source) to the file it depends on (its target).
    const providerColumn = columnOf.get(edge.targetId);
    const consumerColumn = columnOf.get(edge.sourceId);
    if (providerColumn === undefined || consumerColumn === undefined || consumerColumn !== providerColumn + 1) {
      continue;
    }
    const providerAnchor = measureAnchor(getAnchorWithHop(edge.targetId, "center", providerColumn, "outbound", edge.targetSymbol));
    const consumerAnchor = measureAnchor(getAnchorWithHop(edge.sourceId, "center", consumerColumn, "inbound", edge.sourceSymbol));
    if (!providerAnchor || !consumerAnchor) {
      continue;
    }
    segments.push({
      edge,
      source: offsetToEdge(providerAnchor, "outbound"),
      target: offsetToEdge(consumerAnchor, "inbound"),
      column: providerColumn
    });
  }

  if (segments.length === 0) {
    overlay.dataset.active = "false";
    return;
  }

  const { svg, defs } = createOverlaySvg(context, bounds);
  let gradientIndex = 0;
  for (const { edge, source, target, column } of segments) {
    const adjustedSource = { x: source.x - bounds.left, y: source.y - bounds.top };
    const adjustedTarget = { x: target.x - bounds.left, y: target.y - bounds.top };
    const gradientId = `conn-grad-hop${column}-${gradientIndex++}`;
    appendConnectionPath(svg, defs, adjustedSource, adjustedTarget, "outbound", edge, context.svgNamespace, state.tuning.bezier, gradientId);
  }
  overlay.dataset.active = "true";
}

/**
 * Draw every retained relationship. A reference between adjacent columns is
 * the native curve; one that skips columns is threaded through the lanes the
 * order reserved for it, so it never reaches backward and never enters a card;
 * a reference that reads against the columns, a cycle's feedback, is a pair of
 * French Corset stubs at its pins with its full route drawn only on hover.
 */
function drawBranchConnections(context: ConnectionsContext): void {
  const { runtime, branches, state } = context;
  if (!branches) return;
  const extents = context.measureLayoutExtents();
  if (!extents) return;
  const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
  const measure = createAnchorMeasurer(runtime.container, runtime.mapTransform.k || 1);
  const bounds = extents.content;
  const { svg, defs } = createOverlaySvg(context, bounds);
  const columnBounds = branches.columns.map(nodes => {
    const cards = nodes.flatMap(node => {
      const anchor = measure(context.getAnchor(node.id, "center", "outbound"));
      return anchor ? [anchor] : [];
    });
    return { left: Math.min(...cards.map(card => card.cardLeft)), right: Math.max(...cards.map(card => card.cardRight)) };
  });
  const laneTop = new Map<string, number>();
  runtime.container.querySelectorAll<HTMLElement>(".local-pass-through[data-lane]").forEach(element => {
    const measured = measure(element);
    if (measured) laneTop.set(element.dataset.lane!, measured.topY);
  });
  let drawn = 0;
  branches.subgraph.links.forEach((edge, index) => {
    const provider = measure(context.getAnchor(edge.targetId, "center", "outbound", edge.targetSymbol));
    const consumer = measure(context.getAnchor(edge.sourceId, "center", "inbound", edge.sourceSymbol));
    if (!provider || !consumer) return;
    drawn++;
    const p = offsetToEdge(provider, "outbound"), q = offsetToEdge(consumer, "inbound");
    const from = { x: p.x - bounds.left, y: p.y - bounds.top };
    const to = { x: q.x - bounds.left, y: q.y - bounds.top };
    const cardBounds = { left: provider.cardLeft, right: provider.cardRight, top: 0, bottom: 0 };
    if (edge.sourceId === edge.targetId) {
      appendSelfLoopPath(svg, from, to, provider, consumer, cardBounds, edge, context.svgNamespace, state.tuning.localMap.selfLoopTaper);
      return;
    }
    const key = edgeKey(edge);
    if (branches.back.has(key)) {
      appendSelfLoopPath(svg, from, to, provider, consumer, cardBounds, edge, context.svgNamespace, state.tuning.localMap.selfLoopTaper);
      appendConnectionPath(svg, defs, from, to, "outbound", edge, context.svgNamespace, state.tuning.bezier, `back-${index}`, undefined, "back-route");
      return;
    }
    const a = columnOf.get(edge.targetId)!, b = columnOf.get(edge.sourceId)!;
    let route: string | undefined;
    if (b > a + 1) {
      const passages: Passage[] = [];
      for (let column = a + 1; column < b; column++) {
        const passage = branches.order.passages.get(`${key}\0${column}`);
        const top = passage ? laneTop.get(passage.lane) : undefined;
        if (!passage || top === undefined) break;
        passages.push({
          left: columnBounds[column].left - bounds.left - LANE_MARGIN,
          right: columnBounds[column].right - bounds.left + LANE_MARGIN,
          y: top - bounds.top + LANE_PADDING + passage.index * LANE_PITCH + LANE_PITCH / 2
        });
      }
      if (passages.length === b - a - 1) route = threadedRoute(from, to, passages, state.tuning.bezier).d;
    }
    appendConnectionPath(svg, defs, from, to, "outbound", edge, context.svgNamespace, state.tuning.bezier, `branch-${index}`, route);
  });
  runtime.overlay.dataset.active = String(drawn > 0);
}
