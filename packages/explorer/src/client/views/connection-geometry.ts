/**
 * Pure geometry functions for computing SVG connection paths.
 *
 * Design principles:
 * - Zero DOM dependencies — works with abstract coordinates
 * - Deterministic output — same inputs always produce same SVG path
 * - Unit testable with simple number assertions
 * - Composable primitives for different connection styles
 *
 * @module connection-geometry
 */

/**
 * A 2D point in the coordinate system.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A rectangle defined by its edges.
 */
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Tuning parameters for Bezier curve generation.
 */
export interface BezierTuningParams {
  /** Multiplier for control point distance as fraction of horizontal gap */
  stubFactor: number;
  /** Minimum control point distance in pixels */
  stubMin: number;
  /** Maximum offset from edge for control points */
  stubMaxOffset: number;
  /** Vertical control point offset as fraction of vertical delta */
  verticalOffset: number;
}

/**
 * Default Bezier tuning that produces aesthetically pleasing curves.
 */
export const DEFAULT_BEZIER_TUNING: BezierTuningParams = {
  stubFactor: 0.4,
  stubMin: 30,
  stubMaxOffset: 80,
  verticalOffset: 0.15
};

/**
 * Result of path computation, containing the SVG path data string.
 */
export interface PathResult {
  /** SVG path "d" attribute value */
  d: string;
  /** Length of the path (for animation timing, stroke-dasharray, etc.) */
  approximateLength: number;
}

/**
 * Computes control point distance ("stub length") for Bezier curves.
 *
 * The stub determines how far from the endpoint the control points are placed,
 * affecting the curve's initial direction and curvature.
 *
 * @param horizontalGap - Absolute horizontal distance between endpoints
 * @param tuning - Bezier tuning parameters
 * @returns The stub length in pixels
 */
export function computeStubLength(horizontalGap: number, tuning: BezierTuningParams): number {
  const stubBase = Math.max(horizontalGap * tuning.stubFactor, tuning.stubMin);
  const stubLimit = Math.max(44, horizontalGap - tuning.stubMaxOffset);
  return Math.min(stubBase, stubLimit);
}

/**
 * Computes a cubic Bezier curve path between two points.
 *
 * The curve flows horizontally from source to target, with control points
 * creating a smooth S-curve when there's vertical displacement.
 *
 * @param source - Starting point (typically the "outbound" pin)
 * @param target - Ending point (typically the "inbound" pin)
 * @param tuning - Optional Bezier tuning parameters
 * @returns PathResult with SVG path data
 *
 * @example
 * ```typescript
 * const path = computeBezierPath(
 *   { x: 100, y: 200 },
 *   { x: 400, y: 250 },
 *   DEFAULT_BEZIER_TUNING
 * );
 * // path.d = "M 100 200 C 160 207.5 340 242.5 400 250"
 * ```
 */
export function computeBezierPath(
  source: Point,
  target: Point,
  tuning: BezierTuningParams = DEFAULT_BEZIER_TUNING
): PathResult {
  const gapX = Math.abs(target.x - source.x);
  const deltaY = target.y - source.y;
  const horizontalDirection = target.x >= source.x ? 1 : -1;

  // For very short horizontal distances, use a simple quadratic curve
  if (gapX < 24) {
    const midY = (source.y + target.y) / 2;
    const d = `M ${source.x} ${source.y} Q ${source.x} ${midY} ${target.x} ${target.y}`;
    // Approximate length for short curves
    const approxLength = Math.sqrt(gapX * gapX + deltaY * deltaY) * 1.1;
    return { d, approximateLength: approxLength };
  }

  const stub = computeStubLength(gapX, tuning);

  // Control points extend horizontally from endpoints, with slight vertical offset
  const control1X = source.x + horizontalDirection * stub;
  const control2X = target.x - horizontalDirection * stub;
  const control1Y = source.y + deltaY * tuning.verticalOffset;
  const control2Y = target.y - deltaY * tuning.verticalOffset;

  const d = `M ${source.x} ${source.y} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${target.x} ${target.y}`;

  // Approximate length using control point polygon
  const approxLength = approximateBezierLength(
    source,
    { x: control1X, y: control1Y },
    { x: control2X, y: control2Y },
    target
  );

  return { d, approximateLength: approxLength };
}

/**
 * Approximates the length of a cubic Bezier curve using the control polygon.
 * This is a fast approximation, not exact arc length.
 */
function approximateBezierLength(p0: Point, p1: Point, p2: Point, p3: Point): number {
  // Chord length (straight line)
  const chord = distance(p0, p3);
  // Control polygon length
  const poly = distance(p0, p1) + distance(p1, p2) + distance(p2, p3);
  // Average of chord and polygon gives decent approximation
  return (chord + poly) / 2;
}

/**
 * Euclidean distance between two points.
 */
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Parameters for the laces of a self-reference, the "French Corset": at each
 * of its two pins a lace leaves the pin, sweeps out past the card's edge,
 * turns toward the partner and comes back, to be cut by the card's edge as a
 * wire passing behind the card would be.
 */
export interface SelfLoopParams {
  /** How far beyond the card's edge the lace sweeps before it turns back. */
  reach: number;
  /** How far along the card's edge from the pin's row the lace returns, toward the partner. */
  curlAmount: number;
  /** The lace's width where it leaves the pin. */
  baseWidth: number;
  /** How much the lace thins by the card's edge: 0 keeps its width, 1 ends in a hairline. */
  taper: number;
}

/**
 * Default lace parameters. The Local Map's tuning carries the same four numbers as dials (`laceReach`, `laceCurl`,
 * `laceWidth`, `selfLoopTaper`), so the shape can be tuned by eye in the page (the owner's ask, 2026-10-06).
 */
export const DEFAULT_SELF_LOOP_PARAMS: SelfLoopParams = {
  reach: 18,
  curlAmount: 12,
  baseWidth: 2.5,
  taper: 0.5
};

/** Laces of one pin that turn the same way stand each this much further out, nested, sharing their return. */
export const LACE_PITCH = 3;

/** How far under the card's edge a lace's return runs on before it is cut, so that it meets the edge nearly level. */
const LACE_UNDER = 6;

/** The control distance that bends a cubic into a quarter of an ellipse. */
const QUARTER_TURN = 0.5523;

/** The card edges a self-reference's two laces are cut by, as x coordinates in the laces' own frame. */
export interface LaceEdges {
  /** The right edge of the card the provider's pin stands on. */
  provider: number;
  /** The left edge of the card the consumer's pin stands on. */
  consumer: number;
}

/**
 * The two laces of a self-reference, as SVG polygon point strings.
 */
export interface SelfLoopStubResult {
  /** The lace at the provider's (outbound) pin. */
  providerPoints: string;
  /** The lace at the consumer's (inbound) pin. */
  consumerPoints: string;
}

/**
 * Computes the two laces of a self-reference, a symbol referring to another on
 * the same card. No route is drawn between them: the provider's lace leaves
 * its pin outward, past its card's right edge, turns toward the consumer's row
 * and comes back, and the consumer's lace does the same past its card's left
 * edge toward the provider's row. Each is cut flush where its card's edge
 * begins, so that it reads as one wire that passes behind the card: the
 * owner's picture of 2026-10-07 painted the card's colour over every return
 * from the border inward, and this is that picture drawn. A lace that turns
 * back is a shape no wire between cards ever makes, and two laces of one pin,
 * one turning up and one down, make a bracket rather than an arrowhead, which
 * two straight stubs did (the owner's note, 2026-10-06).
 *
 * @param source - The provider pin's outer edge
 * @param target - The consumer pin's outer edge
 * @param edges - The card edges the two laces are cut by
 * @param params - The laces' shape
 * @param ranks - Each lace's place among the laces of its pin that turn the same way, from 0; later ones nest outward
 */
export function computeSelfLoopStubs(
  source: Point,
  target: Point,
  edges: LaceEdges,
  params: SelfLoopParams = DEFAULT_SELF_LOOP_PARAMS,
  ranks: { provider: number; consumer: number } = { provider: 0, consumer: 0 }
): SelfLoopStubResult {
  // The consumer stands below the provider, or on its row, in which case the laces part downward and upward.
  const down = target.y >= source.y;
  return {
    providerPoints: lace(source, 1, down ? 1 : -1, edges.provider, params, ranks.provider),
    consumerPoints: lace(target, -1, down ? -1 : 1, edges.consumer, params, ranks.consumer)
  };
}

/**
 * One lace as a tapered polygon. Its centre line is a hairpin of two quarter
 * ellipses: out from the pin, level, to a tip `reach` beyond the card's edge
 * (nested laces further by the pitch), turning `toward` (1 down, -1 up); then
 * back from the tip to a point under the card, level again, `curlAmount` from
 * the pin's row. The return is cut where it crosses the card's edge, its end
 * flush with the edge, and nothing of it is drawn inside the card; the stem
 * at the pin's row is the only part of the lace over the card. The width
 * thins from the pin to the cut by the taper.
 */
function lace(pin: Point, side: 1 | -1, toward: 1 | -1, edge: number, params: SelfLoopParams, rank: number): string {
  // The tip, as a distance from the pin along `side`: at least a bend's worth beyond a pin that stands outside its card.
  const tip = Math.max(side * (edge - pin.x) + params.reach + Math.max(0, rank) * LACE_PITCH, 4);
  const half = params.curlAmount / 2;
  const apex = { x: pin.x + side * tip, y: pin.y + toward * half };
  const end = { x: edge - side * LACE_UNDER, y: pin.y + toward * params.curlAmount };
  const back = side * (apex.x - end.x);
  const outbound: Cubic = [pin, { x: pin.x + side * QUARTER_TURN * tip, y: pin.y }, { x: apex.x, y: apex.y - toward * QUARTER_TURN * half }, apex];
  const inbound: Cubic = [apex, { x: apex.x, y: apex.y + toward * QUARTER_TURN * half }, { x: end.x + side * QUARTER_TURN * back, y: end.y }, end];
  const steps = 10;
  const line: Sample[] = [];
  for (let i = 0; i <= steps; i++) line.push(sampleCubic(outbound, i / steps));
  for (let i = 1; i <= steps; i++) line.push(sampleCubic(inbound, i / steps));
  // The cut: the return's first sample at or past the edge, and the point on the edge between it and the one before.
  let cut = line.length - 1;
  for (let i = steps + 1; i < line.length; i++) if (side * (line[i].point.x - edge) <= 0) { cut = i; break; }
  const before = line[cut - 1], after = line[cut];
  const f = after.point.x === before.point.x ? 1 : (edge - before.point.x) / (after.point.x - before.point.x);
  const atEdge: Sample = {
    point: { x: edge, y: before.point.y + (after.point.y - before.point.y) * f },
    tangent: unit({ x: before.tangent.x + (after.tangent.x - before.tangent.x) * f, y: before.tangent.y + (after.tangent.y - before.tangent.y) * f })
  };
  const centre = [...line.slice(0, cut), atEdge];
  // The width thins along the lace's length, from the pin to the cut.
  const lengths = [0];
  for (let i = 1; i < centre.length; i++) lengths.push(lengths[i - 1] + distance(centre[i - 1].point, centre[i].point));
  const total = lengths[lengths.length - 1] || 1;
  const endWidth = params.baseWidth * (1 - 0.85 * Math.min(1, Math.max(0, params.taper)));
  const left: Point[] = [];
  const right: Point[] = [];
  centre.forEach(({ point, tangent }, i) => {
    const halfWidth = (params.baseWidth + (endWidth - params.baseWidth) * (lengths[i] / total)) / 2;
    const normal = { x: -tangent.y, y: tangent.x };
    let a = { x: point.x + normal.x * halfWidth, y: point.y + normal.y * halfWidth };
    let b = { x: point.x - normal.x * halfWidth, y: point.y - normal.y * halfWidth };
    // On the return, nothing past the edge; at the cut, both sides flush with it.
    if (i > steps) {
      a = { x: side * Math.max(side * a.x, side * edge), y: a.y };
      b = { x: side * Math.max(side * b.x, side * edge), y: b.y };
    }
    if (i === centre.length - 1) { a = { x: edge, y: a.y }; b = { x: edge, y: b.y }; }
    left.push(a);
    right.push(b);
  });
  return [...left, ...right.reverse()].map(point => `${round2(point.x)},${round2(point.y)}`).join(" ");
}

type Cubic = [Point, Point, Point, Point];

interface Sample {
  point: Point;
  /** The unit tangent, along the curve's direction. */
  tangent: Point;
}

function sampleCubic([p0, p1, p2, p3]: Cubic, t: number): Sample {
  const u = 1 - t;
  const point = {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
  };
  const derivative = {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
  };
  // Where the derivative vanishes, as at the end of a degenerate bend, the chord to the far point gives the direction.
  const tangent = Math.hypot(derivative.x, derivative.y) > 1e-6 ? unit(derivative) : unit({ x: p3.x - p0.x, y: p3.y - p0.y });
  return { point, tangent };
}

function unit(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Offsets a point from the pin center to the pin edge.
 *
 * Pins have a radius, and connections should start/end at the edge,
 * not the center. This function computes the edge position.
 *
 * @param center - The pin's center point
 * @param pinRadius - Radius of the pin circle
 * @param direction - Which edge to offset to ("inbound" = left, "outbound" = right)
 * @returns The point at the pin's edge
 */
export function offsetToPinEdge(
  center: Point,
  pinRadius: number,
  direction: "inbound" | "outbound"
): Point {
  const offsetX = direction === "outbound"
    ? center.x + pinRadius  // Right edge for outbound
    : center.x - pinRadius; // Left edge for inbound
  return { x: offsetX, y: center.y };
}

/**
 * Computes the center point of a rectangle.
 */
export function rectCenter(rect: Rect): Point {
  return {
    x: (rect.left + rect.right) / 2,
    y: (rect.top + rect.bottom) / 2
  };
}

/**
 * Computes the dimensions of a rectangle.
 */
export function rectSize(rect: Rect): { width: number; height: number } {
  return {
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };
}

/**
 * Expands a rectangle by a given margin on all sides.
 */
export function expandRect(rect: Rect, margin: number): Rect {
  return {
    left: rect.left - margin,
    top: rect.top - margin,
    right: rect.right + margin,
    bottom: rect.bottom + margin
  };
}

/**
 * Computes the bounding box that contains all given points.
 */
export function boundingBoxFromPoints(points: Point[]): Rect | null {
  if (points.length === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const p of points) {
    left = Math.min(left, p.x);
    top = Math.min(top, p.y);
    right = Math.max(right, p.x);
    bottom = Math.max(bottom, p.y);
  }

  return { left, top, right, bottom };
}

/**
 * Merges multiple rectangles into their bounding box.
 */
export function mergeRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;

  return {
    left: Math.min(...rects.map(r => r.left)),
    top: Math.min(...rects.map(r => r.top)),
    right: Math.max(...rects.map(r => r.right)),
    bottom: Math.max(...rects.map(r => r.bottom))
  };
}

/**
 * Linear gradient definition for path coloring.
 */
export interface GradientDef {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: Array<{ offset: string; color: string }>;
}

/**
 * Creates a gradient definition for connection path coloring.
 *
 * The gradient flows from source (outbound/blue) to target (inbound/green),
 * with breathing room at the endpoints.
 *
 * @param id - Unique ID for the gradient
 * @param source - Start point of the path
 * @param target - End point of the path
 * @param sourceColor - Color at the source end (default: sky-400 blue)
 * @param targetColor - Color at the target end (default: emerald-400 green)
 * @returns GradientDef ready for SVG rendering
 */
export function createConnectionGradient(
  id: string,
  source: Point,
  target: Point,
  sourceColor = "#38bdf8",
  targetColor = "#34d399"
): GradientDef {
  return {
    id,
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y,
    stops: [
      { offset: "0%", color: sourceColor },
      { offset: "10%", color: sourceColor },
      { offset: "90%", color: targetColor },
      { offset: "100%", color: targetColor }
    ]
  };
}
