import type { BezierTuning } from "../../types";

/** A point in unscaled Local Map coordinates. */
export interface RoutePoint { x: number; y: number }

/** A lane slot's height, the least room between neighbouring wires through a lane, in CSS pixels; the placement may spread them further. */
export const LANE_PITCH = 7;

/** The room between a lane's edge and its first or last slot, in CSS pixels. */
export const LANE_PADDING = 6;

/** How far outside a column's cards a lane's straight run begins and ends, in CSS pixels. */
export const LANE_MARGIN = 10;

/** A gap in a column a wire passes through: the column's horizontal extent, widened by a margin, at the lane's height. */
export interface Passage { left: number; right: number; y: number }

/** One piece of a threaded route: a curve across a gutter, or a straight run along a lane through a column. */
export type RoutePiece =
  | { kind: "curve"; from: RoutePoint; to: RoutePoint }
  | { kind: "lane"; from: RoutePoint; to: RoutePoint };

const stubLength = (gap: number, tuning: BezierTuning): number =>
  Math.min(Math.max(gap * tuning.stubFactor, tuning.stubMin), Math.max(44, gap - tuning.stubMaxOffset));

/** Whether an ordinary routed connection ever travels left, including a curve whose horizontal controls overshoot. */
export function routeBacktracks(pieces: readonly RoutePiece[], tuning: BezierTuning): boolean {
  return pieces.some(piece => {
    const gap = piece.to.x - piece.from.x;
    // The symmetric cubic's smallest horizontal derivative is at its midpoint: (gap - stub) / 2.
    return gap < 0 || piece.kind === "curve" && gap >= 24 && stubLength(gap, tuning) > gap;
  });
}

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
  const stub = stubLength(gapX, tuning);
  const control1X = from.x + horizontalDirection * stub;
  const control2X = to.x - horizontalDirection * stub;
  const deltaY = to.y - from.y;
  const control1Y = from.y + deltaY * tuning.verticalOffset;
  const control2Y = to.y - deltaY * tuning.verticalOffset;
  return `C ${control1X} ${control1Y} ${control2X} ${control2Y} ${to.x} ${to.y}`;
}

/**
 * Where a wire's own columns end, in the route's coordinates: the x past which the offering column's gutter begins, and
 * the x before which the using column's gutter ends; each a column's extent widened by the lane margin, as a passage is.
 */
export interface Clearance { leaving: number; arriving: number }

/**
 * A wire that skips columns: from its offering pin it curves across the first
 * gutter into a lane through the next column, runs straight along that lane,
 * and curves on, until it enters its using pin. Every curve lives in a gutter
 * and every straight run in a lane, so the route never reaches backward and
 * never enters a card, given lanes that lie in gaps between cards.
 *
 * A pin can stand inside its column's extent: a column holds the cards of
 * several directory bands, each band's as wide as its own text asks and set
 * in by its depth, so a card can end well before the column's widest does.
 * A curve begun at such a pin dives while still over the column, through the
 * membrane and the lane ends of the bands below (seen 2026-11-06 and again
 * 2026-11-07, the wires of `compressed-url-state.ts` cutting a corner of the
 * layout lab's membrane). Given the clearance, the wire first runs straight
 * from its pin to where the gutter begins, and arrives straight from where the
 * gutter ends to its pin; those runs are commands of the path, not pieces, so
 * the pieces stay the curve into each lane and the run along it, in pairs,
 * which a bundle's shared run reads by index.
 */
export function threadedRoute(from: RoutePoint, to: RoutePoint, passages: readonly Passage[], tuning: BezierTuning, clearance?: Clearance): { d: string; pieces: RoutePiece[] } {
  const pieces: RoutePiece[] = [];
  const firstReach = passages.length ? passages[0].left : to.x;
  const start = clearance && clearance.leaving > from.x && clearance.leaving < firstReach ? { x: clearance.leaving, y: from.y } : from;
  let current = start;
  for (const passage of passages) {
    const entry = { x: passage.left, y: passage.y }, exit = { x: passage.right, y: passage.y };
    pieces.push({ kind: "curve", from: current, to: entry }, { kind: "lane", from: entry, to: exit });
    current = exit;
  }
  const end = clearance && clearance.arriving < to.x && clearance.arriving > current.x ? { x: clearance.arriving, y: to.y } : to;
  pieces.push({ kind: "curve", from: current, to: end });
  const commands = [`M ${from.x} ${from.y}`];
  if (start !== from) commands.push(`L ${start.x} ${start.y}`);
  for (const piece of pieces) commands.push(piece.kind === "lane" ? `L ${piece.to.x} ${piece.to.y}` : curveTo(piece.from, piece.to, tuning));
  if (end !== to) commands.push(`L ${to.x} ${to.y}`);
  return { d: commands.join(" "), pieces };
}
