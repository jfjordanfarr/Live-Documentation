/**
 * The wires of a laid-out scene as the router would draw them, sampled as the
 * deck samples the page: the same curves and lane runs from the same routing
 * module, with each wire's length, its horizontal and vertical parts, and its
 * points every eight pixels for the crossing and membrane measures.
 *
 * @module layout-lab/routes
 */
import type { Capture } from "./capture";
import type { CardMetrics } from "./card-model";
import { resolvePin } from "./card-model";
import type { BezierTuning } from "../../packages/explorer/src/client/types";
import { curveTo, LANE_MARGIN, threadedRoute, type Passage, type RoutePoint } from "../../packages/explorer/src/client/views/localView/branch-routing";
import type { Scene } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { edgeKey, type BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";

/** The router's: a wire stops one pin radius shy of the pin's centre. */
const PIN_RADIUS = 6;

/** The deck's sampling step along a wire. */
export const SAMPLE_PX = 8;

/** One wire as the page would draw it, with its measures. */
export interface Route {
  key: string;
  consumer: string;
  provider: string;
  /** The path as the page would draw it. */
  d: string;
  /** The wire every eight pixels, as the deck reads a drawn wire, the end included. */
  samples: RoutePoint[];
  lengthPx: number;
  horizontalPx: number;
  verticalPx: number;
  /** How many lanes the wire runs through. */
  passages: number;
}

/** A card's rectangle in the picture's pixels. */
export interface CardRect { left: number; top: number; right: number; bottom: number }

/** Every card's rectangle in the picture. */
export function cardRects(scene: Scene): Map<string, CardRect> {
  const rects = new Map<string, CardRect>();
  for (const item of scene.items.values()) {
    const left = scene.lefts[item.column] + item.inset;
    const top = scene.tops.get(item.id) ?? 0;
    rects.set(item.id, { left, top, right: left + scene.widths[item.column] - 2 * item.inset, bottom: top + (scene.heights.get(item.id) ?? 0) });
  }
  return rects;
}

/** The routes of every forward reference; a self-reference and a reference read back are stubs, not routes. */
export function routeScene(scene: Scene, branches: BranchGraph, capture: Capture, metrics: Map<string, CardMetrics>, bezier: BezierTuning): Route[] {
  const rects = cardRects(scene);
  const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
  const bounds = branches.columns.map(nodes => {
    const cards = nodes.flatMap(node => rects.get(node.id) ?? []);
    return { left: Math.min(...cards.map(card => card.left)), right: Math.max(...cards.map(card => card.right)) };
  });
  const point = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): RoutePoint | null => {
    const found = metrics.get(id), rect = rects.get(id), card = capture.cards[id];
    if (!found || !rect || !card) return null;
    const { offset, key } = resolvePin(found, direction, symbol);
    if (offset === null) return null;
    const y = rect.top + Math.round(offset + 1e-3);
    const isRow = key !== null && found.rowKeys.has(key);
    if (direction === "outbound") {
      const centre = isRow ? rect.right - card.pinOutboundX : rect.right - card.hubX;
      return { x: centre + PIN_RADIUS, y };
    }
    const centre = isRow ? rect.left + card.pinInboundX : rect.left;
    return { x: centre - PIN_RADIUS, y };
  };
  const routes: Route[] = [];
  for (const edge of branches.subgraph.links) {
    if (edge.sourceId === edge.targetId) continue;
    const key = edgeKey(edge);
    if (branches.back.has(key)) continue;
    const from = point(edge.targetId, "outbound", edge.targetSymbol);
    const to = point(edge.sourceId, "inbound", edge.sourceSymbol);
    if (!from || !to) continue;
    const a = columnOf.get(edge.targetId)!, b = columnOf.get(edge.sourceId)!;
    let d = `M ${from.x} ${from.y} ${curveTo(from, to, bezier)}`;
    let passages = 0;
    if (b > a + 1) {
      const through: Passage[] = [];
      for (let column = a + 1; column < b; column++) {
        const passage = branches.order.passages.get(`${key}\0${column}`);
        const lane = passage ? scene.lanes.get(passage.lane) : undefined;
        const slot = passage ? scene.slotLines.get(passage.lane)?.[passage.index] : undefined;
        if (!passage || !lane || slot === undefined) break;
        through.push({ left: bounds[column].left - LANE_MARGIN, right: bounds[column].right + LANE_MARGIN, y: lane.top + slot });
      }
      if (through.length === b - a - 1) {
        d = threadedRoute(from, to, through, bezier).d;
        passages = through.length;
      }
    }
    const fine = tracePath(d);
    const samples = resample(fine, SAMPLE_PX);
    let horizontalPx = 0, verticalPx = 0;
    for (let i = 1; i < samples.length; i++) { horizontalPx += Math.abs(samples[i].x - samples[i - 1].x); verticalPx += Math.abs(samples[i].y - samples[i - 1].y); }
    routes.push({ key, consumer: edge.sourceId, provider: edge.targetId, d, samples, lengthPx: lengthOf(fine), horizontalPx, verticalPx, passages });
  }
  return routes;
}

/** The path's commands (M, L, C, Q, as the routing module writes them) traced finely into a polyline. */
export function tracePath(d: string): RoutePoint[] {
  const tokens = d.trim().split(/[\s,]+/u);
  const points: RoutePoint[] = [];
  let current: RoutePoint = { x: 0, y: 0 };
  for (let i = 0; i < tokens.length;) {
    const command = tokens[i++];
    const read = (): number => Number(tokens[i++]);
    if (command === "M") { current = { x: read(), y: read() }; points.push(current); }
    else if (command === "L") { current = { x: read(), y: read() }; points.push(current); }
    else if (command === "C") {
      const c1 = { x: read(), y: read() }, c2 = { x: read(), y: read() }, end = { x: read(), y: read() };
      const steps = 48;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, u = 1 - t;
        points.push({ x: u * u * u * current.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x, y: u * u * u * current.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y });
      }
      current = end;
    } else if (command === "Q") {
      const c = { x: read(), y: read() }, end = { x: read(), y: read() };
      const steps = 24;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, u = 1 - t;
        points.push({ x: u * u * current.x + 2 * u * t * c.x + t * t * end.x, y: u * u * current.y + 2 * u * t * c.y + t * t * end.y });
      }
      current = end;
    } else {
      throw new Error(`The lab cannot trace the path command ${JSON.stringify(command)}.`);
    }
  }
  return points;
}

/** The length of a polyline. */
export function lengthOf(points: readonly RoutePoint[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return length;
}

/** The polyline's points every `step` along its length, from its start, and its end. */
export function resample(points: readonly RoutePoint[], step: number): RoutePoint[] {
  if (points.length === 0) return [];
  const out: RoutePoint[] = [points[0]];
  let next = step, walked = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    while (segment > 0 && next <= walked + segment) {
      const t = (next - walked) / segment;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      next += step;
    }
    walked += segment;
  }
  out.push(points[points.length - 1]);
  return out;
}
