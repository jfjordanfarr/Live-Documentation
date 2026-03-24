/**
 * Connection routing for the Membrane Map.
 *
 * Pure-function module: no DOM, no side effects.
 *
 * Classifies connections as front-traces or back-traces and computes
 * the appropriate geometry for each:
 * - **Front traces**: Standard Bézier curves (connection flows "naturally"
 *   from outbound pin rightward to inbound pin leftward).
 * - **Back traces**: French Corset stubs only — a short curve departing
 *   each pin, implying the connection routes "behind the board."
 *
 * @module routing
 */

import type { Point, BezierTuningParams, PathResult, SelfLoopParams } from "../connection-geometry";
import {
  computeBezierPath,
  computeSelfLoopStubs,
  DEFAULT_BEZIER_TUNING,
  DEFAULT_SELF_LOOP_PARAMS,
} from "../connection-geometry";

// ─── Types ─────────────────────────────────────────────────────────

/** Whether a connection is a front-trace (natural L→R flow) or back-trace (R→L wrap). */
export type TraceKind = "front" | "back";

/**
 * Anchor positions for a single connection endpoint (one pin on one card).
 */
export interface PinAnchor {
  /** The pin's center position in absolute coordinates. */
  readonly center: Point;
  /** "inbound" = left side green pin, "outbound" = right side blue pin. */
  readonly direction: "inbound" | "outbound";
  /** The pin's radius (for edge offset). */
  readonly pinRadius: number;
}

/**
 * A routed front-trace connection: a full Bézier between two pins.
 */
export interface FrontTrace {
  readonly kind: "front";
  /** SVG path `d` attribute for the Bézier curve. */
  readonly path: PathResult;
  /** Source anchor (outbound pin). */
  readonly source: PinAnchor;
  /** Target anchor (inbound pin). */
  readonly target: PinAnchor;
}

/**
 * A routed back-trace connection: two French Corset stubs with no connecting path.
 */
export interface BackTrace {
  readonly kind: "back";
  /** Source anchor (outbound pin). */
  readonly source: PinAnchor;
  /** Target anchor (inbound pin). */
  readonly target: PinAnchor;
  /** Polygon points for the outbound stub (exits rightward). */
  readonly outboundStubPoints: string;
  /** Polygon points for the inbound stub (enters leftward). */
  readonly inboundStubPoints: string;
}

/** A routed connection: either a full Bézier (front) or paired stubs (back). */
export type RoutedTrace = FrontTrace | BackTrace;

// ─── Classification ────────────────────────────────────────────────

/**
 * Classify a connection as front-trace or back-trace.
 *
 * A connection is a **front trace** when the outbound pin's X position
 * is to the left of the inbound pin's X position — meaning the connection
 * flows "naturally" leftward-to-rightward across the viewport.
 *
 * A connection is a **back trace** when the outbound pin is to the right
 * of (or at the same X as) the inbound pin — meaning the connection would
 * need to wrap "backwards" against the L/R directional grammar.
 *
 * @param outbound - The source pin (outbound/blue/right side of source card)
 * @param inbound - The target pin (inbound/green/left side of target card)
 */
export function classifyTrace(outbound: PinAnchor, inbound: PinAnchor): TraceKind {
  // Offset to pin edges: outbound exits at center.x + radius,
  // inbound receives at center.x - radius
  const outboundEdge = outbound.center.x + outbound.pinRadius;
  const inboundEdge = inbound.center.x - inbound.pinRadius;

  return outboundEdge < inboundEdge ? "front" : "back";
}

// ─── Front Trace Routing ───────────────────────────────────────────

/**
 * Compute a front-trace Bézier path between two pin anchors.
 *
 * The path starts at the outbound pin's right edge and ends at the
 * inbound pin's left edge.
 */
export function computeFrontTrace(
  outbound: PinAnchor,
  inbound: PinAnchor,
  tuning: BezierTuningParams = DEFAULT_BEZIER_TUNING,
): FrontTrace {
  const source: Point = {
    x: outbound.center.x + outbound.pinRadius,
    y: outbound.center.y,
  };
  const target: Point = {
    x: inbound.center.x - inbound.pinRadius,
    y: inbound.center.y,
  };

  const path = computeBezierPath(source, target, tuning);
  return { kind: "front", path, source: outbound, target: inbound };
}

// ─── Back Trace Routing ────────────────────────────────────────────

/**
 * Compute back-trace French Corset stubs for a backward connection.
 *
 * Each pin gets an independent stub:
 * - The outbound pin's stub curves rightward and vanishes.
 * - The inbound pin's stub curves leftward and appears from nowhere.
 *
 * No connecting path is drawn between them.
 */
export function computeBackTrace(
  outbound: PinAnchor,
  inbound: PinAnchor,
  params: SelfLoopParams = DEFAULT_SELF_LOOP_PARAMS,
): BackTrace {
  // The source point is the outbound pin's right edge
  const sourceEdge: Point = {
    x: outbound.center.x + outbound.pinRadius,
    y: outbound.center.y,
  };
  // The target point is the inbound pin's left edge
  const targetEdge: Point = {
    x: inbound.center.x - inbound.pinRadius,
    y: inbound.center.y,
  };

  const stubs = computeSelfLoopStubs(sourceEdge, targetEdge, params);

  return {
    kind: "back",
    source: outbound,
    target: inbound,
    outboundStubPoints: stubs.providerPoints,
    inboundStubPoints: stubs.consumerPoints,
  };
}

// ─── Unified Router ────────────────────────────────────────────────

/**
 * Route a single connection: classify as front or back, then compute geometry.
 *
 * @param outbound - The outbound (source) pin anchor
 * @param inbound - The inbound (target) pin anchor
 * @param tuning - Bézier tuning for front traces
 * @param selfLoopParams - Self-loop params for back trace stubs
 */
export function routeConnection(
  outbound: PinAnchor,
  inbound: PinAnchor,
  tuning: BezierTuningParams = DEFAULT_BEZIER_TUNING,
  selfLoopParams: SelfLoopParams = DEFAULT_SELF_LOOP_PARAMS,
): RoutedTrace {
  const kind = classifyTrace(outbound, inbound);
  if (kind === "front") {
    return computeFrontTrace(outbound, inbound, tuning);
  }
  return computeBackTrace(outbound, inbound, selfLoopParams);
}

// ─── Batch Routing ─────────────────────────────────────────────────

/**
 * A connection to be routed, pairing the outbound and inbound anchors
 * with an opaque identifier for correlation.
 */
export interface ConnectionToRoute {
  /** Opaque identifier for matching results back to the original edge. */
  readonly id: string;
  readonly outbound: PinAnchor;
  readonly inbound: PinAnchor;
}

/**
 * Route a batch of connections, returning classified and computed traces.
 */
export function routeConnections(
  connections: readonly ConnectionToRoute[],
  tuning: BezierTuningParams = DEFAULT_BEZIER_TUNING,
  selfLoopParams: SelfLoopParams = DEFAULT_SELF_LOOP_PARAMS,
): ReadonlyMap<string, RoutedTrace> {
  const result = new Map<string, RoutedTrace>();
  for (const conn of connections) {
    result.set(conn.id, routeConnection(conn.outbound, conn.inbound, tuning, selfLoopParams));
  }
  return result;
}
