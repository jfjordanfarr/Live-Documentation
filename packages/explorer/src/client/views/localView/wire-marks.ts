/**
 * Direction Marks, a trial behind Tuning's 2D Wires (2026-11-21, default none), on strangers' top-ranked stumble, which
 * way a line runs: small open chevrons on each 2D wire, a stroke and not a filled arrowhead, drawn as part of the wire's
 * own path so that they take its colour at their point (its gradient runs from the offering blue to the using green), its
 * opacity and its fading. *Along* points them from what is offered to what uses it, the owner's rule ("we should always
 * always always draw from blue ... to green", 2025-12-04); *Against* points them from the user to what it uses, the
 * dependency arrow's convention, which runs against the owner's rule and is in the trial only to learn which convention a
 * stranger brings. Pure: a wire's path in, its marks' strokes out, walked along the path's own commands (the absolute
 * `M`, `L`, `C` and `Q` the router writes), so that a drawing, which runs every frame of a move, asks the page for no
 * geometry (connections.ts).
 *
 * @module wire-marks
 */

/**
 * How far apart a long wire's marks stand, in the map's own pixels: about the width of a gutter and a card, so that a
 * wire threaded past a column keeps one in sight while a wire across one gutter has only its middle's.
 */
export const MARK_SPACING = 320;

/** How near a wire's end a mark may stand, in the map's own pixels: clear of the pins, where the wires of a row crowd. */
export const MARK_MARGIN = 28;

/** A point, or a heading, in the wires' overlay. */
export interface MarkPoint {
  x: number;
  y: number;
}

/**
 * Where a wire's marks stand, as distances along it from its offering end: one at its middle, and on a wire longer than
 * twice the spacing, one in the middle of each of the equal stretches the spacing divides it into, so that the marks are
 * evenly spread and none stands within the margin of an end. A wire too short to hold a mark clear of both ends has none.
 */
export function markStations(length: number, spacing = MARK_SPACING, margin = MARK_MARGIN): number[] {
  if (!(length > 2 * margin)) return [];
  const stretches = Math.max(1, Math.floor(length / spacing));
  const step = length / stretches;
  return Array.from({ length: stretches }, (_, i) => (i + 0.5) * step);
}

/** A mark's size, the length of each arm, for a wire of the given width: larger on a gathered wire, so that it shows past the line. */
export function markSize(width: number): number {
  return 4 + 1.1 * width;
}

/**
 * One mark as path commands: an open chevron whose point stands at `at` and points along `heading` (the wire's way from
 * its offering end, or, against, the reverse), its two arms swept back at forty-five degrees. A heading of no length
 * draws nothing.
 */
export function chevron(at: MarkPoint, heading: MarkPoint, size: number, against = false): string {
  const length = Math.hypot(heading.x, heading.y);
  if (!(length > 0)) return "";
  const sign = against ? -1 : 1;
  const ux = (sign * heading.x) / length, uy = (sign * heading.y) / length;
  // The point leads the station by half an arm, so that the chevron is centred on it.
  const tip = { x: at.x + ux * size * 0.35, y: at.y + uy * size * 0.35 };
  const back = size * Math.SQRT1_2;
  const arm = (side: number): MarkPoint => ({ x: tip.x - ux * back - side * uy * back, y: tip.y - uy * back + side * ux * back });
  const a = arm(1), b = arm(-1);
  const f = (value: number): string => String(Math.round(value * 100) / 100);
  return `M ${f(a.x)} ${f(a.y)} L ${f(tip.x)} ${f(tip.y)} L ${f(b.x)} ${f(b.y)}`;
}

/** How many straight pieces a curve is walked in: enough that a mark's place and heading are true to a pixel on a wire. */
const CURVE_PIECES = 16;

/**
 * A path's commands walked as a line of points: its first subpath only, `M` then any of `L`, `C` and `Q` in absolute
 * coordinates, each curve cut into {@link CURVE_PIECES} straight pieces. Anything else ends the walk.
 */
export function pathPoints(d: string): MarkPoint[] {
  const tokens = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?|[A-Za-z]/g) ?? [];
  const points: MarkPoint[] = [];
  let at = 0;
  const number = (): number => Number(tokens[at++]);
  const point = (): MarkPoint => ({ x: number(), y: number() });
  let command = "";
  while (at < tokens.length) {
    if (/[A-Za-z]/.test(tokens[at])) command = tokens[at++];
    if (command === "M") {
      if (points.length) break;
      points.push(point());
      command = "L";
    } else if (command === "L") {
      points.push(point());
    } else if (command === "C" || command === "Q") {
      const from = points.at(-1);
      if (!from) break;
      const controls = command === "C" ? [point(), point()] : [point()];
      const to = point();
      for (let i = 1; i <= CURVE_PIECES; i++) {
        const t = i / CURVE_PIECES, u = 1 - t;
        points.push(command === "C"
          ? { x: u * u * u * from.x + 3 * u * u * t * controls[0].x + 3 * u * t * t * controls[1].x + t * t * t * to.x,
              y: u * u * u * from.y + 3 * u * u * t * controls[0].y + 3 * u * t * t * controls[1].y + t * t * t * to.y }
          : { x: u * u * from.x + 2 * u * t * controls[0].x + t * t * to.x, y: u * u * from.y + 2 * u * t * controls[0].y + t * t * to.y });
      }
    } else {
      break;
    }
  }
  return points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
}

/**
 * A wire's marks as path commands to write after its own: a chevron at each of {@link markStations} along the walked
 * path, pointing along the piece it stands on, or against it; empty where the wire holds none.
 */
export function markStrokes(d: string, width: number, against: boolean): string {
  const points = pathPoints(d);
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const size = markSize(width);
  let piece = 1;
  return markStations(lengths.at(-1) ?? 0).map(station => {
    while (piece < points.length - 1 && lengths[piece] < station) piece++;
    const a = points[piece - 1], b = points[piece];
    const share = (station - lengths[piece - 1]) / ((lengths[piece] - lengths[piece - 1]) || 1);
    return chevron({ x: a.x + (b.x - a.x) * share, y: a.y + (b.y - a.y) * share }, { x: b.x - a.x, y: b.y - a.y }, size, against);
  }).filter(Boolean).join(" ");
}
