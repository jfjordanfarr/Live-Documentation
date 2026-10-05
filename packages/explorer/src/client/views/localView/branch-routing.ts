import type { BezierTuning } from "../../types";

/** A point in unscaled Local Map coordinates. */
export interface RoutePoint { x: number; y: number }

/** The vertical room each threaded wire takes in a lane, in CSS pixels. */
export const LANE_PITCH = 7;

/** The room above and below a lane's wires, in CSS pixels. */
export const LANE_PADDING = 6;

/** How far outside a column's cards a lane's straight run begins and ends, in CSS pixels. */
export const LANE_MARGIN = 10;

/** A gap in a column a wire passes through: the column's horizontal extent, widened by a margin, at the lane's height. */
export interface Passage { left: number; right: number; y: number }

/** One piece of a threaded route: a curve across a gutter, or a straight run along a lane through a column. */
export type RoutePiece =
  | { kind: "curve"; from: RoutePoint; to: RoutePoint }
  | { kind: "lane"; from: RoutePoint; to: RoutePoint };

/**
 * The curve the Local Map draws between two pins: a cubic whose control points
 * leave and arrive horizontally, so a wire departs an offering pin to the right
 * and enters a using pin from the left; a near-vertical hop is a quadratic.
 * Returns the path commands after the move to `from`.
 */
export function curveTo(from: RoutePoint, to: RoutePoint, tuning: BezierTuning): string {
  const horizontalDirection = to.x >= from.x ? 1 : -1;
  const gapX = Math.abs(to.x - from.x);
  if (gapX < 24) {
    const midY = (from.y + to.y) / 2;
    return `Q ${from.x} ${midY} ${to.x} ${to.y}`;
  }
  const stubBase = Math.max(gapX * tuning.stubFactor, tuning.stubMin);
  const stubLimit = Math.max(44, gapX - tuning.stubMaxOffset);
  const stub = Math.min(stubBase, stubLimit);
  const control1X = from.x + horizontalDirection * stub;
  const control2X = to.x - horizontalDirection * stub;
  const deltaY = to.y - from.y;
  const control1Y = from.y + deltaY * tuning.verticalOffset;
  const control2Y = to.y - deltaY * tuning.verticalOffset;
  return `C ${control1X} ${control1Y} ${control2X} ${control2Y} ${to.x} ${to.y}`;
}

/**
 * A wire that skips columns: from its offering pin it curves across the first
 * gutter into a lane through the next column, runs straight along that lane,
 * and curves on, until it enters its using pin. Every curve lives in a gutter
 * and every straight run in a lane, so the route never reaches backward and
 * never enters a card, given lanes that lie in gaps between cards.
 */
export function threadedRoute(from: RoutePoint, to: RoutePoint, passages: readonly Passage[], tuning: BezierTuning): { d: string; pieces: RoutePiece[] } {
  const pieces: RoutePiece[] = [];
  let current = from;
  for (const passage of passages) {
    const entry = { x: passage.left, y: passage.y }, exit = { x: passage.right, y: passage.y };
    pieces.push({ kind: "curve", from: current, to: entry }, { kind: "lane", from: entry, to: exit });
    current = exit;
  }
  pieces.push({ kind: "curve", from: current, to });
  const commands = [`M ${from.x} ${from.y}`];
  for (const piece of pieces) commands.push(piece.kind === "lane" ? `L ${piece.to.x} ${piece.to.y}` : curveTo(piece.from, piece.to, tuning));
  return { d: commands.join(" "), pieces };
}
