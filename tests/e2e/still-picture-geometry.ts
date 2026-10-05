/**
 * The geometry under the still-picture deck's expanded measures: crossings, shared channels, flow, folder
 * adjacency and the tour. Pure, so that Vitest can hold each number to a drawing it can see. The page reading
 * that feeds these lives in `still-picture.ts`; the measures are defined in
 * `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md` under "The expanded deck".
 */

export type Point = readonly [number, number];

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A wire as a sampled polyline in screen coordinates, from its first drawn end to its last. */
export interface Polyline {
  id: string;
  points: readonly Point[];
}

const GRID = 32;

/** Beyond this distance from a wire's ends, a crossing is in the open rather than in the fan where many wires leave one pin. */
export const FAR_FROM_PINS_PX = 80;

interface Segment {
  line: number;
  /** The index of the segment's end point in its polyline; it runs from the point before. */
  i: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

/** The arc position of each point along its polyline, in px. */
export function arcLengths(points: readonly Point[]): number[] {
  const at: number[] = [0];
  for (let i = 1; i < points.length; i += 1) {
    at.push(at[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return at;
}

/** The segments of every polyline, leaving out those within `endExclusionPx` of either end, where wires share a pin's stub. */
function segmentsOf(lines: readonly Polyline[], endExclusionPx: number): Segment[] {
  const segments: Segment[] = [];
  lines.forEach((line, index) => {
    const at = arcLengths(line.points);
    const total = at[at.length - 1] ?? 0;
    for (let i = 1; i < line.points.length; i += 1) {
      if (at[i] <= endExclusionPx || at[i - 1] >= total - endExclusionPx) continue;
      const [ax, ay] = line.points[i - 1];
      const [bx, by] = line.points[i];
      segments.push({ line: index, i, ax, ay, bx, by });
    }
  });
  return segments;
}

/** Segments bucketed by the grid cells their boxes touch. */
function gridOf(segments: readonly Segment[]): Map<string, number[]> {
  const grid = new Map<string, number[]>();
  segments.forEach((s, index) => {
    const x0 = Math.floor(Math.min(s.ax, s.bx) / GRID);
    const x1 = Math.floor(Math.max(s.ax, s.bx) / GRID);
    const y0 = Math.floor(Math.min(s.ay, s.by) / GRID);
    const y1 = Math.floor(Math.max(s.ay, s.by) / GRID);
    for (let x = x0; x <= x1; x += 1) {
      for (let y = y0; y <= y1; y += 1) {
        const key = `${x},${y}`;
        const list = grid.get(key);
        if (list) list.push(index);
        else grid.set(key, [index]);
      }
    }
  });
  return grid;
}

const orient = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

type Straight = { ax: number; ay: number; bx: number; by: number };

/**
 * Where two segments meet, or null. Ends count, so a wire sampled exactly through another is not missed; collinear
 * overlap is a shared channel, not a crossing, and returns null.
 */
export function intersectionOf(a: Straight, b: Straight): Point | null {
  const d1 = orient(b.ax, b.ay, b.bx, b.by, a.ax, a.ay);
  const d2 = orient(b.ax, b.ay, b.bx, b.by, a.bx, a.by);
  const d3 = orient(a.ax, a.ay, a.bx, a.by, b.ax, b.ay);
  const d4 = orient(a.ax, a.ay, a.bx, a.by, b.bx, b.by);
  if (d1 === 0 && d2 === 0 && d3 === 0 && d4 === 0) return null;
  if (d1 * d2 > 0 || d3 * d4 > 0) return null;
  const denominator = (a.bx - a.ax) * (b.by - b.ay) - (a.by - a.ay) * (b.bx - b.ax);
  if (denominator === 0) return null;
  const t = ((b.ax - a.ax) * (b.by - b.ay) - (b.ay - a.ay) * (b.bx - b.ax)) / denominator;
  return [a.ax + t * (a.bx - a.ax), a.ay + t * (a.by - a.ay)];
}

export interface CrossingScore {
  /** Points where two wires cross, one per pair of wires. */
  points: number;
  /** Distinct places where wires cross, within 4 px: a cable of many wires crossed once is one spot. */
  spots: number;
  /** Of those, points more than 80 px from both wires' ends: crossings in the open, not in a fan at a pin. */
  farPoints: number;
  /** Pairs of wires that cross at least once. */
  pairs: number;
  /** Wires that take part in at least one crossing. */
  wiresCrossed: number;
}

/** The angle between two segments' directions, in degrees from 0 to 90. */
export function angleBetween(a: Straight, b: Straight): number {
  const dot = (a.bx - a.ax) * (b.bx - b.ax) + (a.by - a.ay) * (b.by - b.ay);
  const lengths = Math.hypot(a.bx - a.ax, a.by - a.ay) * Math.hypot(b.bx - b.ax, b.by - b.ay);
  if (lengths === 0) return 0;
  const cosine = Math.min(1, Math.abs(dot) / lengths);
  return (Math.acos(cosine) * 180) / Math.PI;
}

export interface Crossing {
  a: string;
  b: string;
  x: number;
  y: number;
}

/**
 * Every crossing of two wires, more than `endExclusionPx` from either wire's ends, at an angle of at least
 * `minAngleDeg`. Two wires that merge at a shallower angle are a shared channel, which test 8 counts; without the
 * angle, every weave inside a cable counted as a crossing and the number stopped meaning what the eye sees. A
 * crossing is a crossing: either each segment reaches across the other, or the wires meet at a sample point and
 * their directions out of it alternate around it. Two wires drawn along one path, which touch at every sample,
 * cross nowhere, and two that part from one point cross nowhere either (2026-10-05, when the Local Map began to
 * bundle the wires of one pin and the old count read every bend of a bundle as crossings).
 */
export function findCrossings(lines: readonly Polyline[], endExclusionPx = 24, minAngleDeg = 15): Crossing[] {
  const segments = segmentsOf(lines, endExclusionPx);
  const grid = gridOf(segments);
  const tested = new Set<string>();
  const seenPoints = new Set<string>();
  const found: Crossing[] = [];
  for (const bucket of grid.values()) {
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        const a = segments[bucket[i]];
        const b = segments[bucket[j]];
        if (a.line === b.line) continue;
        const key = bucket[i] < bucket[j] ? `${bucket[i]}:${bucket[j]}` : `${bucket[j]}:${bucket[i]}`;
        if (tested.has(key)) continue;
        tested.add(key);
        const at = intersectionOf(a, b);
        if (!at || angleBetween(a, b) < minAngleDeg) continue;
        if (!reachesAcross(a, b) && !crossesAtVertex(lines, a, b, at)) continue;
        const pair = a.line < b.line ? `${a.line}:${b.line}` : `${b.line}:${a.line}`;
        // One crossing that falls on a sample point is seen by up to four segment pairs; count it once.
        const spot = `${pair}@${Math.round(at[0] * 2) / 2},${Math.round(at[1] * 2) / 2}`;
        if (seenPoints.has(spot)) continue;
        seenPoints.add(spot);
        found.push({ a: lines[Math.min(a.line, b.line)].id, b: lines[Math.max(a.line, b.line)].id, x: at[0], y: at[1] });
      }
    }
  }
  return found;
}

/** Whether each segment's ends lie strictly on either side of the other: a crossing, not a touch at an end. */
const reachesAcross = (a: Straight, b: Straight): boolean =>
  orient(b.ax, b.ay, b.bx, b.by, a.ax, a.ay) * orient(b.ax, b.ay, b.bx, b.by, a.bx, a.by) < 0 &&
  orient(a.ax, a.ay, a.bx, a.by, b.ax, b.ay) * orient(a.ax, a.ay, a.bx, a.by, b.bx, b.by) < 0;

/**
 * Whether two wires that meet at a sample point of one or both cross there: the directions each wire takes out
 * of the point, read from its neighbouring samples, alternate around it. A shared direction is coincidence, not
 * a crossing; a wire's end has one direction and crosses nothing.
 */
function crossesAtVertex(lines: readonly Polyline[], a: Segment, b: Segment, at: Point): boolean {
  const near = (p: Point): boolean => Math.abs(p[0] - at[0]) < 1e-6 && Math.abs(p[1] - at[1]) < 1e-6;
  const heading = (p: Point): number => Math.atan2(p[1] - at[1], p[0] - at[0]);
  const directions = (s: Segment): number[] => {
    const points = lines[s.line].points;
    const k = near(points[s.i - 1]) ? s.i - 1 : near(points[s.i]) ? s.i : -1;
    if (k < 0) return [heading(points[s.i - 1]), heading(points[s.i])];
    const out: number[] = [];
    if (k > 0) out.push(heading(points[k - 1]));
    if (k + 1 < points.length) out.push(heading(points[k + 1]));
    return out;
  };
  const da = directions(a);
  const db = directions(b);
  if (da.length < 2 || db.length < 2) return false;
  const around = [...da.map(t => ({ t, wire: 0 })), ...db.map(t => ({ t, wire: 1 }))].sort((x, y) => x.t - y.t);
  for (let i = 0; i < around.length; i += 1) {
    const gap = Math.abs(around[(i + 1) % around.length].t - around[i].t);
    if (gap < 1e-9 || Math.abs(gap - 2 * Math.PI) < 1e-9) return false;
  }
  return around.every((entry, i) => entry.wire !== around[(i + 1) % around.length].wire);
}

/** Test 7, summarized: points, spots, pairs of wires and wires taking part. */
export function crossings(lines: readonly Polyline[], endExclusionPx = 24, minAngleDeg = 15): CrossingScore {
  const found = findCrossings(lines, endExclusionPx, minAngleDeg);
  const pairs = new Set(found.map(c => `${c.a}|${c.b}`));
  const wires = new Set(found.flatMap(c => [c.a, c.b]));
  const spots = new Set(found.map(c => `${Math.round(c.x / 4)},${Math.round(c.y / 4)}`));
  return { points: found.length, spots: spots.size, farPoints: findCrossings(lines, FAR_FROM_PINS_PX, minAngleDeg).length, pairs: pairs.size, wiresCrossed: wires.size };
}

const pointToSegment = (px: number, py: number, s: Segment): number => {
  const dx = s.bx - s.ax;
  const dy = s.by - s.ay;
  const length2 = dx * dx + dy * dy;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - s.ax) * dx + (py - s.ay) * dy) / length2));
  return Math.hypot(px - (s.ax + t * dx), py - (s.ay + t * dy));
};

export interface ChannelScore {
  /** Wires that run within the distance of another wire for at least the minimum run. */
  wires: number;
  /** The longest shared run found, in px. */
  longestRunPx: number;
}

/** Test 8: wires that share a channel, running within `withinPx` of another for more than `minRunPx`, beyond their stubs. */
export function sharedChannels(lines: readonly Polyline[], withinPx = 6, minRunPx = 40, endExclusionPx = 24): ChannelScore {
  const segments = segmentsOf(lines, 0);
  const grid = gridOf(segments);
  const reach = Math.ceil(withinPx / GRID) + 1;
  let wires = 0;
  let longestRunPx = 0;
  lines.forEach((line, index) => {
    const at = arcLengths(line.points);
    const total = at[at.length - 1] ?? 0;
    let run = 0;
    let longest = 0;
    let previousClose = false;
    for (let i = 0; i < line.points.length; i += 1) {
      const [px, py] = line.points[i];
      let close = false;
      if (at[i] >= endExclusionPx && at[i] <= total - endExclusionPx) {
        const cx = Math.floor(px / GRID);
        const cy = Math.floor(py / GRID);
        search: for (let x = cx - reach; x <= cx + reach; x += 1) {
          for (let y = cy - reach; y <= cy + reach; y += 1) {
            for (const s of grid.get(`${x},${y}`) ?? []) {
              const segment = segments[s];
              if (segment.line === index) continue;
              if (pointToSegment(px, py, segment) <= withinPx) {
                close = true;
                break search;
              }
            }
          }
        }
      }
      if (close && previousClose) run += at[i] - at[i - 1];
      else run = 0;
      previousClose = close;
      if (run > longest) longest = run;
    }
    if (longest >= minRunPx) wires += 1;
    if (longest > longestRunPx) longestRunPx = longest;
  });
  return { wires, longestRunPx: Math.round(longestRunPx) };
}

export interface FlowReading {
  /** The using end lies to the right of the offering end and the path never runs back left by more than the tolerance. */
  flowing: boolean;
  /** The using end lies left of the offering end. */
  backward: boolean;
}

/** Test 9: one wire's flow, from its offering end to its using end. */
export function flowOf(points: readonly Point[], providerEnd: 0 | 1, tolerancePx = 24): FlowReading {
  if (points.length < 2) return { flowing: false, backward: false };
  const ordered = providerEnd === 0 ? points : [...points].reverse();
  const backward = ordered[ordered.length - 1][0] <= ordered[0][0];
  let runningMax = -Infinity;
  let worst = 0;
  for (const [x] of ordered) {
    if (x > runningMax) runningMax = x;
    if (runningMax - x > worst) worst = runningMax - x;
  }
  return { flowing: !backward && worst <= tolerancePx, backward };
}

export interface CardPlace {
  id: string;
  folder: string;
  box: Box;
}

/** The gap between two boxes, 0 when they touch or overlap. */
export function boxGap(a: Box, b: Box): number {
  const dx = Math.max(0, a.x - (b.x + b.width), b.x - (a.x + a.width));
  const dy = Math.max(0, a.y - (b.y + b.height), b.y - (a.y + a.height));
  return Math.hypot(dx, dy);
}

export interface AdjacencyScore {
  /** Cards that have a same-folder card drawn. */
  counted: number;
  /** Of those, cards whose nearest neighbour shares their folder (a tie counts). */
  adjacent: number;
}

/** Test 10: folder adjacency over the whole drawing. */
export function folderAdjacency(cards: readonly CardPlace[]): AdjacencyScore {
  let counted = 0;
  let adjacent = 0;
  for (const card of cards) {
    const others = cards.filter(other => other !== card && other.id !== card.id);
    if (!others.some(other => other.folder === card.folder)) continue;
    counted += 1;
    let nearest = Infinity;
    let nearestSame = Infinity;
    for (const other of others) {
      const gap = boxGap(card.box, other.box);
      if (gap < nearest) nearest = gap;
      if (other.folder === card.folder && gap < nearestSame) nearestSame = gap;
    }
    if (nearestSame <= nearest + 0.5) adjacent += 1;
  }
  return { counted, adjacent };
}

export interface TourFact {
  key: string;
  /** The union of the fact's four endpoint texts, in screen coordinates at the start of the tour. */
  box: Box;
  /** Every endpoint text at reading size, so a pan alone can make the fact legible. */
  atReadingSize: boolean;
  legibleNow: boolean;
}

export interface TourPan {
  dx: number;
  dy: number;
  newlySeen: number;
  /** No card that was fully in frame before the pan is fully in frame after it. */
  blind: boolean;
}

export interface TourPlan {
  pans: TourPan[];
  blindPans: number;
  /** Facts legible at least once by the end of the tour, counting those legible at the start. */
  legibleAfter: number;
  /** Facts no pan can make legible: under reading size, or wider or taller than the frame. */
  unreachable: number;
  seen: string[];
}

const insideFrame = (box: Box, frame: Box, offsetX: number, offsetY: number): boolean =>
  box.x + offsetX >= frame.x - 0.5 && box.x + box.width + offsetX <= frame.x + frame.width + 0.5 && box.y + offsetY >= frame.y - 0.5 && box.y + box.height + offsetY <= frame.y + frame.height + 0.5;

/**
 * Test 15: a greedy tour. Each pan is at most `maxPanX` by `maxPanY` and aims a not-yet-seen fact at the frame's
 * center; the pan that makes the most facts legible wins, a pan that keeps a card in view beats one that does not,
 * and the shortest pan breaks the tie. A pan toward a fact that is still too far to arrive is a step, not a waste.
 */
export function planTour(frame: Box, facts: readonly TourFact[], cards: readonly Box[], maxPanX: number, maxPanY: number, maxPans = 40): TourPlan {
  const fits = (fact: TourFact): boolean => fact.atReadingSize && fact.box.width <= frame.width && fact.box.height <= frame.height;
  const unreachable = facts.filter(fact => !fits(fact)).length;
  const seen = new Set(facts.filter(fact => fact.legibleNow).map(fact => fact.key));
  const pans: TourPan[] = [];
  let ox = 0;
  let oy = 0;
  const clamp = (value: number, limit: number): number => Math.max(-limit, Math.min(limit, value));
  const centerX = frame.x + frame.width / 2;
  const centerY = frame.y + frame.height / 2;
  while (pans.length < maxPans) {
    const unseen = facts.filter(fact => fits(fact) && !seen.has(fact.key));
    if (unseen.length === 0) break;
    let best: { dx: number; dy: number; newly: TourFact[]; blind: boolean; distance: number } | null = null;
    for (const target of unseen) {
      const dx = Math.round(clamp(centerX - (target.box.x + target.box.width / 2 + ox), maxPanX));
      const dy = Math.round(clamp(centerY - (target.box.y + target.box.height / 2 + oy), maxPanY));
      if (dx === 0 && dy === 0) continue;
      const newly = unseen.filter(fact => insideFrame(fact.box, frame, ox + dx, oy + dy));
      const kept = cards.some(card => insideFrame(card, frame, ox, oy) && insideFrame(card, frame, ox + dx, oy + dy));
      const distance = Math.hypot(dx, dy);
      const better = best === null || newly.length > best.newly.length || (newly.length === best.newly.length && ((best.blind && kept) || (best.blind === !kept && distance < best.distance)));
      if (better) best = { dx, dy, newly, blind: !kept, distance };
    }
    if (!best) break;
    ox += best.dx;
    oy += best.dy;
    for (const fact of best.newly) seen.add(fact.key);
    pans.push({ dx: best.dx, dy: best.dy, newlySeen: best.newly.length, blind: best.blind });
  }
  return { pans, blindPans: pans.filter(pan => pan.blind).length, legibleAfter: seen.size, unreachable, seen: [...seen] };
}
