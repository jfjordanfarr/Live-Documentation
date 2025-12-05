import type { LocalViewRuntime } from "./runtime";
import type { LayoutExtents, LocalEdge } from "./types";
import type { BezierTuning, ExplorerState } from "../../types";

export interface ConnectionsContext {
  runtime: LocalViewRuntime;
  state: ExplorerState;
  svgNamespace: string;
  getAnchor: (nodeId: string, direction: "inbound" | "outbound", symbol?: string) => HTMLElement | null;
  measureLayoutExtents: () => LayoutExtents | null;
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

  const faceToward = (anchor: AnchorMeasurement, otherX: number): { x: number; y: number } => {
    if (anchor.columnPosition === "left") {
      return { x: anchor.cardRight, y: anchor.centerY };
    }
    if (anchor.columnPosition === "right") {
      return { x: anchor.cardLeft, y: anchor.centerY };
    }
    const towardsLeft = otherX < anchor.centerX;
    return { x: towardsLeft ? anchor.cardLeft : anchor.cardRight, y: anchor.centerY };
  };

  currentSubgraph.links.forEach(edge => {
    // For dependencies (direction === "outbound"), draw from the dependency's outbound side to the center's inbound side.
    // For dependents (direction === "inbound"), draw from the center's outbound side to the dependent's inbound side.
    const isDependency = edge.direction === "outbound";

    const providerAnchor = isDependency
      ? measureAnchor(context.getAnchor(edge.targetId, "outbound", edge.targetSymbol))
      : measureAnchor(context.getAnchor(centerId, "outbound", edge.targetSymbol));

    const consumerAnchor = isDependency
      ? measureAnchor(context.getAnchor(centerId, "inbound", edge.sourceSymbol))
      : measureAnchor(context.getAnchor(edge.sourceId, "inbound", edge.sourceSymbol));

    if (!providerAnchor || !consumerAnchor) {
      return;
    }

    const sourcePoint = faceToward(providerAnchor, consumerAnchor.centerX);
    const targetPoint = faceToward(consumerAnchor, providerAnchor.centerX);
    const renderDirection: "inbound" | "outbound" = isDependency ? "inbound" : "outbound";
    segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint });
  });

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
  overlay.appendChild(svg);

  segments.forEach(({ edge, renderDirection, source, target }) => {
    const adjustedSource = {
      x: source.x - bounds.left,
      y: source.y - bounds.top
    };
    const adjustedTarget = {
      x: target.x - bounds.left,
      y: target.y - bounds.top
    };
    appendConnectionPath(svg, adjustedSource, adjustedTarget, renderDirection, edge, context.svgNamespace, state.tuning.bezier);
  });

  overlay.dataset.active = "true";
}

function appendConnectionPath(
  svg: SVGSVGElement,
  source: { x: number; y: number },
  target: { x: number; y: number },
  renderDirection: "inbound" | "outbound",
  edge: LocalEdge,
  svgNamespace: string,
  tuning: BezierTuning
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

  const path = document.createElementNS(svgNamespace, "path") as SVGPathElement;
  path.setAttribute("d", commands.join(" "));
  path.classList.add("connection-path", renderDirection);
  path.dataset.kind = edge.kind;
  svg.appendChild(path);
}
