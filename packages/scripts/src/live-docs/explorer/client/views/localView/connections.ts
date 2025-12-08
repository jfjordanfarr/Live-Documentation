import type { LocalViewRuntime } from "./runtime";
import type { ColumnRole, LayoutExtents, LocalEdge } from "./types";
import type { BezierTuning, ExplorerState } from "../../types";

export interface ConnectionsContext {
  runtime: LocalViewRuntime;
  state: ExplorerState;
  svgNamespace: string;
  getAnchor: (nodeId: string, columnRole: ColumnRole, direction: "inbound" | "outbound", symbol?: string) => HTMLElement | null;
  measureLayoutExtents: () => LayoutExtents | null;
  /** Card bounds for the center node, used for self-loop routing */
  getCenterCardBounds?: () => { left: number; right: number; top: number; bottom: number } | null;
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

export function drawConnections(context: ConnectionsContext): void {
  const { runtime, state } = context;
  const { overlay, container, currentSubgraph, mapTransform } = runtime;
  overlay.innerHTML = "";
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

  const positionCache = new Map<HTMLElement, AnchorMeasurement>();
  const measureAnchor = (anchor: HTMLElement | null): AnchorMeasurement | null => {
    if (!anchor) {
      return null;
    }
    if (positionCache.has(anchor)) {
      return positionCache.get(anchor)!;
    }
    const rect = anchor.getBoundingClientRect();
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
  const defs = document.createElementNS(context.svgNamespace, "defs");
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
      const gradientId = `selfloop-grad-${gradientIndex++}`;
      appendSelfLoopPath(svg, defs, adjustedSource, adjustedTarget, source, target, cardBoundsAdjusted, edge, context.svgNamespace, gradientId);
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
  path.dataset.sourceSymbol = edge.sourceSymbol ?? "";
  path.dataset.targetSymbol = edge.targetSymbol ?? "";
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
 */
function appendSelfLoopPath(
  svg: SVGSVGElement,
  defs: SVGDefsElement,
  source: { x: number; y: number },
  target: { x: number; y: number },
  _sourceAnchor: AnchorMeasurement,
  _targetAnchor: AnchorMeasurement,
  _cardBounds: { left: number; right: number; top: number; bottom: number },
  edge: LocalEdge,
  svgNamespace: string,
  gradientId: string
): void {
  // Stub parameters - keep these small for the "nubby" effect
  const STUB_LENGTH = 12;      // How far the stub extends horizontally
  const CURL_AMOUNT = 6;       // How much the stub curls inward (Y direction)
  const TAPER_LENGTH = 4;      // Extra length for the tapered "disappearing" end

  // Direction of Y curl: toward the partner symbol
  const providerCurlY = target.y > source.y ? CURL_AMOUNT : -CURL_AMOUNT;
  const consumerCurlY = source.y > target.y ? CURL_AMOUNT : -CURL_AMOUNT;

  // === Provider stub (outbound/blue side) ===
  // Starts at source, extends right, curls toward target Y, then tapers
  const providerCommands: string[] = [];
  providerCommands.push(`M ${source.x} ${source.y}`);
  
  // Quadratic curve: extend right while curling toward target
  const providerEndX = source.x + STUB_LENGTH;
  const providerEndY = source.y + providerCurlY;
  const providerCtrlX = source.x + STUB_LENGTH * 0.6;
  const providerCtrlY = source.y;
  providerCommands.push(`Q ${providerCtrlX} ${providerCtrlY} ${providerEndX} ${providerEndY}`);
  
  // Tiny taper line that "disappears behind"
  const providerTaperX = providerEndX + TAPER_LENGTH;
  const providerTaperY = providerEndY + (providerCurlY * 0.5);
  providerCommands.push(`L ${providerTaperX} ${providerTaperY}`);

  // === Consumer stub (inbound/green side) ===
  // Starts at target, extends left, curls toward source Y, then tapers
  const consumerCommands: string[] = [];
  consumerCommands.push(`M ${target.x} ${target.y}`);
  
  // Quadratic curve: extend left while curling toward source
  const consumerEndX = target.x - STUB_LENGTH;
  const consumerEndY = target.y + consumerCurlY;
  const consumerCtrlX = target.x - STUB_LENGTH * 0.6;
  const consumerCtrlY = target.y;
  consumerCommands.push(`Q ${consumerCtrlX} ${consumerCtrlY} ${consumerEndX} ${consumerEndY}`);
  
  // Tiny taper line that "disappears behind"
  const consumerTaperX = consumerEndX - TAPER_LENGTH;
  const consumerTaperY = consumerEndY + (consumerCurlY * 0.5);
  consumerCommands.push(`L ${consumerTaperX} ${consumerTaperY}`);

  // === Create gradient for provider stub (blue fading to transparent) ===
  const providerGradientId = `${gradientId}-provider`;
  const providerGradient = document.createElementNS(svgNamespace, "linearGradient");
  providerGradient.setAttribute("id", providerGradientId);
  providerGradient.setAttribute("gradientUnits", "userSpaceOnUse");
  providerGradient.setAttribute("x1", String(source.x));
  providerGradient.setAttribute("y1", String(source.y));
  providerGradient.setAttribute("x2", String(providerTaperX));
  providerGradient.setAttribute("y2", String(providerTaperY));

  const providerStopStart = document.createElementNS(svgNamespace, "stop");
  providerStopStart.setAttribute("offset", "0%");
  providerStopStart.setAttribute("stop-color", "#38bdf8"); // sky-400 (outbound blue)
  providerStopStart.setAttribute("stop-opacity", "1");

  const providerStopEnd = document.createElementNS(svgNamespace, "stop");
  providerStopEnd.setAttribute("offset", "100%");
  providerStopEnd.setAttribute("stop-color", "#38bdf8");
  providerStopEnd.setAttribute("stop-opacity", "0.2"); // Fade out

  providerGradient.appendChild(providerStopStart);
  providerGradient.appendChild(providerStopEnd);
  defs.appendChild(providerGradient);

  // === Create gradient for consumer stub (green fading to transparent) ===
  const consumerGradientId = `${gradientId}-consumer`;
  const consumerGradient = document.createElementNS(svgNamespace, "linearGradient");
  consumerGradient.setAttribute("id", consumerGradientId);
  consumerGradient.setAttribute("gradientUnits", "userSpaceOnUse");
  consumerGradient.setAttribute("x1", String(target.x));
  consumerGradient.setAttribute("y1", String(target.y));
  consumerGradient.setAttribute("x2", String(consumerTaperX));
  consumerGradient.setAttribute("y2", String(consumerTaperY));

  const consumerStopStart = document.createElementNS(svgNamespace, "stop");
  consumerStopStart.setAttribute("offset", "0%");
  consumerStopStart.setAttribute("stop-color", "#34d399"); // emerald-400 (inbound green)
  consumerStopStart.setAttribute("stop-opacity", "1");

  const consumerStopEnd = document.createElementNS(svgNamespace, "stop");
  consumerStopEnd.setAttribute("offset", "100%");
  consumerStopEnd.setAttribute("stop-color", "#34d399");
  consumerStopEnd.setAttribute("stop-opacity", "0.2"); // Fade out

  consumerGradient.appendChild(consumerStopStart);
  consumerGradient.appendChild(consumerStopEnd);
  defs.appendChild(consumerGradient);

  // === Render provider stub ===
  const providerPath = document.createElementNS(svgNamespace, "path") as SVGPathElement;
  providerPath.setAttribute("d", providerCommands.join(" "));
  providerPath.setAttribute("stroke", `url(#${providerGradientId})`);
  providerPath.setAttribute("stroke-width", "2");
  providerPath.setAttribute("fill", "none");
  providerPath.setAttribute("stroke-linecap", "round");
  providerPath.classList.add("connection-path", "self-loop", "self-loop-provider");
  providerPath.dataset.kind = edge.kind;
  providerPath.dataset.sourceId = edge.sourceId;
  providerPath.dataset.targetId = edge.targetId;
  providerPath.dataset.sourceSymbol = edge.sourceSymbol ?? "";
  providerPath.dataset.targetSymbol = edge.targetSymbol ?? "";
  svg.appendChild(providerPath);

  // === Render consumer stub ===
  const consumerPath = document.createElementNS(svgNamespace, "path") as SVGPathElement;
  consumerPath.setAttribute("d", consumerCommands.join(" "));
  consumerPath.setAttribute("stroke", `url(#${consumerGradientId})`);
  consumerPath.setAttribute("stroke-width", "2");
  consumerPath.setAttribute("fill", "none");
  consumerPath.setAttribute("stroke-linecap", "round");
  consumerPath.classList.add("connection-path", "self-loop", "self-loop-consumer");
  consumerPath.dataset.kind = edge.kind;
  consumerPath.dataset.sourceId = edge.sourceId;
  consumerPath.dataset.targetId = edge.targetId;
  consumerPath.dataset.sourceSymbol = edge.sourceSymbol ?? "";
  consumerPath.dataset.targetSymbol = edge.targetSymbol ?? "";
  svg.appendChild(consumerPath);
}
