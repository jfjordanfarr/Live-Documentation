import { curveTo, LANE_MARGIN, threadedRoute, type Passage, type RoutePiece } from "./branch-routing";
import { edgeKey, type BranchGraph } from "./branches";
import type { LocalViewRuntime, WireLayer } from "./runtime";
import type { ColumnRole, LayoutExtents, LocalEdge } from "./types";
import type { BezierTuning, ExplorerState, LocalMapTuning } from "../../types";
import { computeSelfLoopStubs, DEFAULT_SELF_LOOP_PARAMS, type LaceEdges, type SelfLoopParams } from "../connection-geometry";
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
  presence: number;
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

/** The laces' shape from the Local Map's tuning: its three dials and the taper. */
function laceShape(tuning: Partial<LocalMapTuning> | undefined): SelfLoopParams {
  return {
    reach: tuning?.laceReach ?? DEFAULT_SELF_LOOP_PARAMS.reach,
    curlAmount: tuning?.laceCurl ?? DEFAULT_SELF_LOOP_PARAMS.curlAmount,
    baseWidth: tuning?.laceWidth ?? DEFAULT_SELF_LOOP_PARAMS.baseWidth,
    taper: tuning?.selfLoopTaper ?? DEFAULT_SELF_LOOP_PARAMS.taper
  };
}

/** The card edges a reference's laces are cut by, from the two pins' cards, in the overlay's frame. */
function cardEdgesOf(provider: AnchorMeasurement, consumer: AnchorMeasurement, bounds: { left: number }): LaceEdges {
  return { provider: provider.cardRight - bounds.left, consumer: consumer.cardLeft - bounds.left };
}

/**
 * Draw every Local Map scope with the shared directory-aware router. The
 * wires' elements are kept by key across drawings and their geometry written
 * in place, so that a move, which draws every frame, measures the page and
 * writes each wire's shape and nothing else; an element whose wire the picture
 * no longer has leaves with its gradient (2026-10-16; the drawing of
 * 2026-10-07 built the SVG anew each frame and reconciled it by key, which
 * cost more than the measuring and the routing together).
 */
export function drawConnections(context: ConnectionsContext): void {
  const layer = layerOf(context.runtime, context.svgNamespace);
  const seen = new Set<string>();
  const drawn = context.branches ? drawBranchConnections(context, layer, seen) : 0;
  for (const [key, element] of layer.elements) {
    if (seen.has(key)) continue;
    element.remove();
    layer.elements.delete(key);
    layer.gradients.get(key)?.remove();
    layer.gradients.delete(key);
  }
  context.runtime.overlay.dataset.active = String(drawn > 0);
}

/** The overlay's one SVG, with the wires' elements by key, made at the first drawing and kept until the overlay is cleared. */
function layerOf(runtime: LocalViewRuntime, svgNamespace: string): WireLayer {
  const existing = runtime.wires;
  if (existing && existing.svg.parentNode === runtime.overlay) return existing;
  const svg = document.createElementNS(svgNamespace, "svg") as SVGSVGElement;
  svg.classList.add("connection-svg");
  svg.style.position = "absolute";
  svg.style.pointerEvents = "none";
  const defs = document.createElementNS(svgNamespace, "defs") as SVGDefsElement;
  svg.appendChild(defs);
  runtime.overlay.replaceChildren(svg);
  runtime.wires = { svg, defs, elements: new Map(), gradients: new Map(), gradientsMade: 0 };
  return runtime.wires;
}

/** Takes every wire off the overlay and forgets the layer; the next drawing makes a new one. */
export function clearConnections(runtime: LocalViewRuntime): void {
  runtime.overlay.replaceChildren();
  runtime.overlay.dataset.active = "false";
  runtime.wires = null;
}

/**
 * The element a key names, made by `create` when the key is new and placed after the others, or beneath them all when
 * `beneath`; an element the layer has keeps its place and whatever classes a hover gave it.
 */
function elementFor<T extends SVGElement>(layer: WireLayer, seen: Set<string>, key: string, create: () => T, beneath = false): T {
  let element = layer.elements.get(key) as T | undefined;
  if (!element) {
    element = create();
    element.dataset.connectionKey = key;
    if (beneath) layer.svg.insertBefore(element, layer.defs.nextSibling);
    else layer.svg.appendChild(element);
    layer.elements.set(key, element);
  }
  seen.add(key);
  return element;
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
    let presence = 1;
    for (let element: HTMLElement | null = anchor; element && element !== container; element = element.parentElement) {
      if (element.style.opacity !== "") presence *= Number(element.style.opacity);
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
      columnPosition,
      presence
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

/** Sizes and places the layer's SVG over the content bounds. */
function placeOverlay(layer: WireLayer, bounds: { left: number; top: number; width: number; height: number }): void {
  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);
  const { svg } = layer;
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.left = `${bounds.left}px`;
  svg.style.top = `${bounds.top}px`;
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
}

/** Draws a wire between two pins: the path kept by its key, the gradient with it; returns the gradient's id for a bundle's run. */
function drawWire(
  layer: WireLayer,
  seen: Set<string>,
  source: Point,
  target: Point,
  renderDirection: "inbound" | "outbound",
  edge: LocalEdge,
  svgNamespace: string,
  tuning: BezierTuning,
  routedPath?: string,
  extraClass?: string,
  presence = 1
): string {
  const key = JSON.stringify([edgeKey(edge), extraClass ?? "wire"]);
  const gradientId = gradientFor(layer, key, source, target, svgNamespace);
  const path = elementFor(layer, seen, key, () => {
    const made = document.createElementNS(svgNamespace, "path") as SVGPathElement;
    made.classList.add("connection-path", renderDirection);
    if (extraClass) made.classList.add(extraClass);
    made.setAttribute("stroke", `url(#${gradientId})`);
    made.dataset.kind = edge.kind;
    // Normalize symbols for consistent selector matching (fixes duplicate edge format mismatch)
    made.dataset.sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
    made.dataset.targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
    made.dataset.sourceId = edge.sourceId;
    made.dataset.targetId = edge.targetId;
    return made;
  });
  path.setAttribute("d", routedPath ?? `M ${source.x} ${source.y} ${curveTo(source, target, tuning)}`);
  path.style.strokeOpacity = String(presence);
  return gradientId;
}

/**
 * A wire's gradient, from the offering side's blue at `source` to the using side's green at `target`, in the overlay's
 * own coordinates: the first and last tenth pure, the transition between. The colours match the stylesheet's
 * `--outbound-color` and `--inbound-color`. Kept with the wire by its key; each drawing moves it to the wire's ends.
 */
function gradientFor(layer: WireLayer, key: string, source: Point, target: Point, svgNamespace: string): string {
  let gradient = layer.gradients.get(key);
  if (!gradient) {
    gradient = document.createElementNS(svgNamespace, "linearGradient") as SVGLinearGradientElement;
    gradient.id = `wire-gradient-${layer.gradientsMade++}`;
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
    for (const [offset, color] of [["0%", "#38bdf8"], ["10%", "#38bdf8"], ["90%", "#34d399"], ["100%", "#34d399"]] as const) {
      const stop = document.createElementNS(svgNamespace, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      gradient.appendChild(stop);
    }
    layer.defs.appendChild(gradient);
    layer.gradients.set(key, gradient);
  }
  gradient.setAttribute("x1", String(source.x));
  gradient.setAttribute("y1", String(source.y));
  gradient.setAttribute("x2", String(target.x));
  gradient.setAttribute("y2", String(target.y));
  return gradient.id;
}

/**
 * Draws a self-reference as the two laces of the French Corset, one at each
 * pin, from {@link computeSelfLoopStubs}: each leaves its pin, sweeps past
 * its card's edge, turns toward the other row and comes back to be cut by
 * that edge, as a wire passing behind the card would be. The laces of one
 * pin that turn the same way nest outward, so a row referred to from several
 * rows below shows as many laces; `ranks` counts them across one drawing.
 * Each lace is a filled polygon in its pin's colour, carrying the
 * reference's symbols for hover. A back reference between two cards gets
 * the same pair, each lace cut by its own card.
 */
function drawLaces(
  layer: WireLayer,
  seen: Set<string>,
  source: Point,
  target: Point,
  cardEdges: LaceEdges,
  edge: LocalEdge,
  svgNamespace: string,
  shape: SelfLoopParams,
  ranks: Map<string, number>,
  presence: number
): void {
  const sourceSymbol = normalizeSymbolIdentifier(edge.sourceSymbol) ?? "";
  const targetSymbol = normalizeSymbolIdentifier(edge.targetSymbol) ?? "";
  const down = target.y >= source.y;
  const rank = (key: string): number => {
    const seenRanks = ranks.get(key) ?? 0;
    ranks.set(key, seenRanks + 1);
    return seenRanks;
  };
  const laces = computeSelfLoopStubs(source, target, cardEdges, shape, {
    provider: rank(`${edge.targetId}\0out\0${targetSymbol}\0${down ? "down" : "up"}`),
    consumer: rank(`${edge.sourceId}\0in\0${sourceSymbol}\0${down ? "up" : "down"}`)
  });
  const PROVIDER_COLOR = "#38bdf8"; // sky-400, the offering side
  const CONSUMER_COLOR = "#34d399"; // emerald-400, the using side
  for (const [points, color, role] of [[laces.providerPoints, PROVIDER_COLOR, "provider"], [laces.consumerPoints, CONSUMER_COLOR, "consumer"]] as const) {
    const polygon = elementFor(layer, seen, JSON.stringify([edgeKey(edge), role]), () => {
      const made = document.createElementNS(svgNamespace, "polygon") as SVGPolygonElement;
      // Inline, since the stylesheet's base rule gives every connection path no fill.
      made.style.fill = color;
      made.style.stroke = "none";
      made.classList.add("connection-path", "self-loop", `self-loop-${role}`);
      made.dataset.kind = edge.kind;
      made.dataset.sourceId = edge.sourceId;
      made.dataset.targetId = edge.targetId;
      made.dataset.sourceSymbol = sourceSymbol;
      made.dataset.targetSymbol = targetSymbol;
      return made;
    });
    polygon.setAttribute("points", points);
    polygon.style.fillOpacity = String(presence);
  }
}

/**
 * Draw every retained relationship. A reference between adjacent columns is
 * the native curve; one that skips columns is threaded through the lanes the
 * order reserved for it, so it never reaches backward and never enters a card;
 * a reference that reads against the columns, a cycle's feedback, is a pair of
 * French Corset stubs at its pins with its full route drawn only on hover.
 * The wires of one pin that pass a column together share one slot there, and
 * their shared run is drawn once more beneath them, as wide as their number,
 * so a bundle says how many it carries before they part.
 */
function drawBranchConnections(context: ConnectionsContext, layer: WireLayer, seen: Set<string>): number {
  const { runtime, branches, state } = context;
  if (!branches) return 0;
  const extents = context.measureLayoutExtents();
  if (!extents) return 0;
  const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
  const measure = createAnchorMeasurer(runtime.container, runtime.mapTransform.k || 1);
  const bounds = extents.content;
  placeOverlay(layer, bounds);
  // Each column's horizontal extent, from the wrappers of its items as the renderer placed them: a card's and a
  // closed directory's box alike, which has no pin to measure (2026-10-08).
  const columnBounds = branches.columns.map((_, column) => {
    const wrappers = [...runtime.container.querySelectorAll<HTMLElement>(`.local-column[data-column="${column}"]`)]
      .flatMap(element => { const measured = measure(element); return measured ? [measured] : []; });
    return { left: Math.min(...wrappers.map(wrapper => wrapper.leftX)), right: Math.max(...wrappers.map(wrapper => wrapper.rightX)) };
  });
  // Each lane as the renderer placed it: its top, and where each slot rests below that top.
  const lanes = new Map<string, { top: number; slots: number[] }>();
  runtime.container.querySelectorAll<HTMLElement>(".local-pass-through[data-lane]").forEach(element => {
    const measured = measure(element);
    if (measured) lanes.set(element.dataset.lane!, { top: measured.topY, slots: (element.dataset.slots ?? "").split(",").filter(Boolean).map(Number) });
  });
  // Every pin measured before any wire is written, so that the page lays itself out once for the drawing rather than
  // once per wire: a move redraws the wires every frame (2026-10-07).
  for (const edge of branches.subgraph.links) {
    measure(context.getAnchor(edge.targetId, "center", "outbound", edge.targetSymbol));
    measure(context.getAnchor(edge.sourceId, "center", "inbound", edge.sourceSymbol));
  }
  let drawn = 0;
  const laceRanks = new Map<string, number>();
  const shape = laceShape(state.tuning.localMap);
  // One shared run per lane slot: the curve into the lane and the run along it, from the first wire drawn through it.
  const runs = new Map<string, { curve: RoutePiece; lane: RoutePiece; gradient: string; members: number; presence: number }>();
  branches.subgraph.links.forEach(edge => {
    const provider = measure(context.getAnchor(edge.targetId, "center", "outbound", edge.targetSymbol));
    const consumer = measure(context.getAnchor(edge.sourceId, "center", "inbound", edge.sourceSymbol));
    if (!provider || !consumer) return;
    const presence = Math.min(provider.presence, consumer.presence);
    drawn++;
    const p = offsetToEdge(provider, "outbound"), q = offsetToEdge(consumer, "inbound");
    const from = { x: p.x - bounds.left, y: p.y - bounds.top };
    const to = { x: q.x - bounds.left, y: q.y - bounds.top };
    if (edge.sourceId === edge.targetId) {
      drawLaces(layer, seen, from, to, cardEdgesOf(provider, consumer, bounds), edge, context.svgNamespace, shape, laceRanks, presence);
      return;
    }
    const key = edgeKey(edge);
    if (branches.back.has(key)) {
      drawLaces(layer, seen, from, to, cardEdgesOf(provider, consumer, bounds), edge, context.svgNamespace, shape, laceRanks, presence);
      drawWire(layer, seen, from, to, "outbound", edge, context.svgNamespace, state.tuning.bezier, undefined, "back-route", presence);
      return;
    }
    const a = columnOf.get(edge.targetId)!, b = columnOf.get(edge.sourceId)!;
    let route: string | undefined;
    const threadedSlots: string[] = [];
    let threaded: { d: string; pieces: RoutePiece[] } | null = null;
    if (b > a + 1) {
      const passages: Passage[] = [];
      const slots: string[] = [];
      for (let column = a + 1; column < b; column++) {
        const passage = branches.order.passages.get(`${key}\0${column}`);
        const lane = passage ? lanes.get(passage.lane) : undefined;
        const slot = passage && lane ? lane.slots[passage.index] : undefined;
        if (!passage || !lane || slot === undefined) break;
        passages.push({
          left: columnBounds[column].left - bounds.left - LANE_MARGIN,
          right: columnBounds[column].right - bounds.left + LANE_MARGIN,
          y: lane.top - bounds.top + slot
        });
        slots.push(`${passage.lane}\0${passage.index}`);
      }
      if (passages.length === b - a - 1) {
        threaded = threadedRoute(from, to, passages, state.tuning.bezier);
        route = threaded.d;
        threadedSlots.push(...slots);
      }
    }
    const gradientId = drawWire(layer, seen, from, to, "outbound", edge, context.svgNamespace, state.tuning.bezier, route, undefined, presence);
    // The first wire drawn through a slot lends its run and its gradient to the bundle's shared run there.
    threadedSlots.forEach((slot, i) => {
      const existing = runs.get(slot);
      if (existing) { existing.presence = Math.max(existing.presence, presence); return; }
      const passage = branches.order.passages.get(`${key}\0${a + 1 + i}`)!;
      const members = branches.order.lanes.get(passage.lane)?.bundles[passage.index]?.edges.length ?? 1;
      runs.set(slot, { curve: threaded!.pieces[2 * i], lane: threaded!.pieces[2 * i + 1], gradient: gradientId, members, presence });
    });
  });
  for (const [key, run] of runs) {
    if (run.members < 2) continue;
    drawBundleRun(layer, seen, run.curve, run.lane, run.gradient, run.members, context.svgNamespace, state.tuning.bezier, key, run.presence);
  }
  return drawn;
}

/**
 * The shared run of a bundle through one column, beneath its wires: the curve
 * into the lane and the run along it, drawn as wide as the bundle's member
 * count on a logarithmic scale. Carries no reference of its own.
 */
function drawBundleRun(
  layer: WireLayer,
  seen: Set<string>,
  curve: RoutePiece,
  lane: RoutePiece,
  gradientId: string,
  members: number,
  svgNamespace: string,
  tuning: BezierTuning,
  slotKey: string,
  presence: number
): void {
  const path = elementFor(layer, seen, JSON.stringify([slotKey, "bundle"]), () => {
    const made = document.createElementNS(svgNamespace, "path") as SVGPathElement;
    made.classList.add("connection-path", "bundle-run");
    return made;
  }, true);
  path.setAttribute("d", `M ${curve.from.x} ${curve.from.y} ${curveTo(curve.from, curve.to, tuning)} L ${lane.to.x} ${lane.to.y}`);
  path.setAttribute("stroke", `url(#${gradientId})`);
  path.style.strokeWidth = `${(2.2 + 1.3 * Math.log(members)).toFixed(2)}px`;
  path.style.strokeOpacity = String(presence);
  path.dataset.members = String(members);
}
