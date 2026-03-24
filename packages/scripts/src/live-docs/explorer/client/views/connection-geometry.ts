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
 * Parameters for self-loop "French Corset" stubs.
 */
export interface SelfLoopParams {
  /** How far the stub extends horizontally from the pin edge */
  stubLength: number;
  /** How much the stub curls vertically toward the partner symbol */
  curlAmount: number;
  /** Stroke width at the pin edge */
  baseWidth: number;
  /** Taper factor (0 = no taper, 1 = full taper to 25% width) */
  taper: number;
}

/**
 * Default self-loop parameters for the "French Corset" effect.
 */
export const DEFAULT_SELF_LOOP_PARAMS: SelfLoopParams = {
  stubLength: 14,
  curlAmount: 8,
  baseWidth: 2.5,
  taper: 0.5
};

/**
 * Result of self-loop stub computation.
 * Self-loops render as two small stubs that "imply" a connection behind the card.
 */
export interface SelfLoopStubResult {
  /** Polygon points for the provider (outbound) stub */
  providerPoints: string;
  /** Polygon points for the consumer (inbound) stub */
  consumerPoints: string;
}

/**
 * Computes the polygon points for self-loop "French Corset" stubs.
 *
 * Self-loops occur when a symbol references another symbol on the same node.
 * Rather than drawing a complex looping bezier, we render two small "nubs"
 * that suggest the connection wraps around behind the card.
 *
 * @param source - The provider pin position (outbound side)
 * @param target - The consumer pin position (inbound side)
 * @param params - Self-loop styling parameters
 * @returns Polygon point strings for both stubs
 */
export function computeSelfLoopStubs(
  source: Point,
  target: Point,
  params: SelfLoopParams = DEFAULT_SELF_LOOP_PARAMS
): SelfLoopStubResult {
  const { stubLength, curlAmount, baseWidth, taper } = params;

  // End width tapers based on taper parameter
  const endWidth = baseWidth * (1 - taper * 0.75);

  // Direction of Y curl: toward the partner symbol
  const providerCurlY = target.y > source.y ? curlAmount : -curlAmount;
  const consumerCurlY = source.y > target.y ? curlAmount : -curlAmount;

  const halfBaseWidth = baseWidth / 2;
  const halfEndWidth = endWidth / 2;

  // Provider stub (extends right from source)
  const providerEndX = source.x + stubLength;
  const providerEndY = source.y + providerCurlY;
  const providerPoints = [
    `${source.x},${source.y - halfBaseWidth}`,
    `${providerEndX},${providerEndY - halfEndWidth}`,
    `${providerEndX},${providerEndY + halfEndWidth}`,
    `${source.x},${source.y + halfBaseWidth}`
  ].join(" ");

  // Consumer stub (extends left from target)
  const consumerEndX = target.x - stubLength;
  const consumerEndY = target.y + consumerCurlY;
  const consumerPoints = [
    `${target.x},${target.y - halfBaseWidth}`,
    `${consumerEndX},${consumerEndY - halfEndWidth}`,
    `${consumerEndX},${consumerEndY + halfEndWidth}`,
    `${target.x},${target.y + halfBaseWidth}`
  ].join(" ");

  return { providerPoints, consumerPoints };
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
