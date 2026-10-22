import "../../shared/d3-force-3d";
import { forceLink, forceSimulation, type Force, type SimulationNodeDatum } from "d3-force-3d";

import type { ForceGraphTuning, SpatialLayout } from "../types";
import { diagonalOf, SpatialField, SpatialMotion, type MotionSettings } from "./forceGraphPhysics";
import { under } from "./localView/directory-state";

/** The documented interface and mutable position of a file, or of a directory hub, in the spatial layout. */
export interface SpatialNode extends SimulationNodeDatum {
  id: string;
  publicSymbols: readonly string[];
  /** The public-symbol count when the names are not at hand, as at a step of the history (2026-10-18); `publicSymbols.length` otherwise. */
  symbolCount?: number;
  /** A directory hub's members' public-symbol counts, at every depth; its volume is the sum of theirs (2026-10-14). */
  containedSymbolCounts?: readonly number[];
}

/**
 * How many public symbols a file exposes: the count it carries, or its names counted. A count that is not a number of
 * symbols, as a broken or hostile history file can carry, is none, so that one bad value cannot give a sphere a size the
 * motion refuses and stop the picture (2026-10-21).
 */
export const symbolCountOf = (node: Pick<SpatialNode, "publicSymbols" | "symbolCount">): number => {
  const count: unknown = node.symbolCount ?? node.publicSymbols.length;
  return typeof count === "number" && Number.isFinite(count) && count >= 0 ? count : 0;
};

/** One undirected file pair; count is the number of documented references in either direction. */
export interface SpatialLink<N extends SpatialNode = SpatialNode> {
  source: string | N;
  target: string | N;
  count: number;
  /** Containment remains a separate structural relationship in reports. */
  kind?: string;
}

/**
 * The value is sphere volume. A file's grows with its exposed symbols plus one baseline unit, so a zero-symbol file still
 * has a visible body; a directory hub's is the sum of its members' volumes, so that size means exposed surface at every
 * scale (the owner's "pedagogical" invariant, 2026-10-14).
 */
export function spatialNodeValue(node: SpatialNode, tuning: ForceGraphTuning): number {
  const volume = (symbols: number): number => Math.pow(1 + symbols, tuning.symbolScale);
  if (!node.containedSymbolCounts) return volume(symbolCountOf(node));
  return Math.max(1, node.containedSymbolCounts.reduce((sum, count) => sum + volume(count), 0));
}

/** Actual sphere radius, shared by rendering, collision clearance and the command's report. */
export function spatialNodeRadius(node: SpatialNode, tuning: ForceGraphTuning): number {
  return tuning.nodeSize * Math.cbrt(spatialNodeValue(node, tuning));
}

/** More coupling reduces the desired surface gap with diminishing returns, without changing the node-size meaning. */
export function spatialLinkDistance(link: SpatialLink, tuning: ForceGraphTuning): number {
  if (typeof link.source === "string" || typeof link.target === "string") throw new Error("Spatial link endpoints must be resolved before measuring distance.");
  const gap = Math.max(tuning.collisionGap, tuning.linkGap / (1 + tuning.coupling * Math.log2(Math.max(1, link.count))));
  return spatialNodeRadius(link.source, tuning) + spatialNodeRadius(link.target, tuning) + gap;
}

/**
 * Which links pull in a layout: documented references place files by their analyzed connections, containment places
 * them by their declared directories. The other kind stays in the data to be drawn on demand and moves nothing. A
 * document's citation of a file pulls by the tuning's lever (`citedByPull`), which at zero leaves it drawn alone, so
 * that whether such a link should shape the picture can be seen before it is decided (the owner, 2026-10-22).
 */
export function linkPulls(link: Pick<SpatialLink, "kind">, layout: SpatialLayout, tuning?: Pick<ForceGraphTuning, "citedByPull">): boolean {
  if (layout === "structure") return link.kind === "containment";
  if (link.kind === "cited-by") return tuning === undefined || tuning.citedByPull > 0;
  return link.kind !== "containment";
}

/** How hard a pulling link's spring pulls, as a share of a reference's: the tuning's lever for a document's citation, one for the rest. */
export function springShare(link: Pick<SpatialLink, "kind">, tuning: Pick<ForceGraphTuning, "citedByPull">): number {
  return link.kind === "cited-by" ? tuning.citedByPull : 1;
}

/** A point the simulation placed, or the carry did. */
export interface Placed { x: number; y: number; z: number }

/** What the placement of a new sphere reads of a node beside its position: for a hub its directory, for a file its path. */
export interface PlaceableNode extends SpatialNode {
  directoryPath?: string;
  codeRelativePath?: string;
}

const isPlaced = (node: SpatialNode): node is SpatialNode & Placed => Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z);

/** A unit vector seeded by the id, the same on every machine, so that a born sphere's direction is reproducible headlessly. */
export function seededDirection(id: string): Placed {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) { hash ^= id.charCodeAt(index); hash = Math.imul(hash, 16777619) >>> 0; }
  const u = (hash & 0xffff) / 0x10000, v = ((hash >>> 16) & 0xffff) / 0x10000;
  const z = 2 * v - 1, r = Math.sqrt(Math.max(0, 1 - z * z)), theta = 2 * Math.PI * u;
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), z };
}

/**
 * Where the spheres new to the picture start, read from the spheres that already stand somewhere (the carry of ticket C2
 * of the change-over-time plan): a hub new to the picture starts at the centroid of its placed members, at every depth; any
 * other new sphere starts beside what it is wired to by a pulling link, its hub in the structure layout or the files it
 * references in the connections layout, at the mean of those neighbours plus the spring's rest length in a direction seeded
 * by its id, so that nothing erupts from the origin, where D3 would otherwise seat it. A chain of new spheres is placed one
 * after another. A sphere with nothing placed to start from is left to D3. The nodes are not changed; the result is the
 * start of each sphere placed here.
 */
export function placeNewSpheres<N extends PlaceableNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], tuning: ForceGraphTuning, layout: SpatialLayout): Map<string, Placed> {
  const starts = new Map<string, Placed>();
  const byId = new Map(nodes.map(node => [node.id, node]));
  const positionOf = (node: N): Placed | undefined => starts.get(node.id) ?? (isPlaced(node) ? { x: node.x, y: node.y, z: node.z } : undefined);
  const neighbours = new Map<string, Array<{ node: N; count: number }>>();
  const besideOf = (id: string): Array<{ node: N; count: number }> => neighbours.get(id) ?? neighbours.set(id, []).get(id)!;
  for (const link of links) {
    if (!linkPulls(link, layout, tuning)) continue;
    const source = typeof link.source === "string" ? byId.get(link.source) : link.source;
    const target = typeof link.target === "string" ? byId.get(link.target) : link.target;
    if (!source || !target) continue;
    besideOf(source.id).push({ node: target, count: link.count });
    besideOf(target.id).push({ node: source, count: link.count });
  }
  const centroid = (points: readonly Placed[]): Placed => ({
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: points.reduce((sum, point) => sum + point.z, 0) / points.length
  });
  const startOf = (node: N): Placed | undefined => {
    if (node.directoryPath !== undefined) {
      const members = nodes.filter(other => other !== node && positionOf(other) && under(other.directoryPath ?? other.codeRelativePath ?? other.id, node.directoryPath!)).map(other => positionOf(other)!);
      if (members.length) return centroid(members);
    }
    const beside = (neighbours.get(node.id) ?? []).filter(({ node: other }) => positionOf(other));
    if (!beside.length) return undefined;
    const anchor = centroid(beside.map(({ node: other }) => positionOf(other)!));
    const reach = beside.reduce((sum, { node: other, count }) => sum + spatialLinkDistance({ source: node, target: other, count }, tuning), 0) / beside.length;
    const direction = seededDirection(node.id);
    return { x: anchor.x + reach * direction.x, y: anchor.y + reach * direction.y, z: anchor.z + reach * direction.z };
  };
  const waiting = nodes.filter(node => !isPlaced(node));
  for (let placed = true; placed;) {
    placed = false;
    for (const node of waiting) {
      if (starts.has(node.id)) continue;
      const start = startOf(node);
      if (start) { starts.set(node.id, start); placed = true; }
    }
  }
  return starts;
}

/**
 * The strength of each spring: D3's own rule, one over the smaller of the two ends' pulling-link counts, so that a file
 * with many wires is pulled less by each, times the tuning's lever (`linkStrength`, one for the rule as it is). The
 * counts are read from the links the force holds, which are the pulling ones, and counted once per set of links.
 */
export function springStrength<N extends SpatialNode, L extends SpatialLink<N>>(multiplier: number): (edge: L, index: number, links: L[]) => number {
  let counted: readonly L[] | null = null;
  const degrees = new Map<string | N, number>();
  return (edge, _index, links) => {
    if (counted !== links) {
      counted = links;
      degrees.clear();
      for (const link of links) {
        degrees.set(link.source, (degrees.get(link.source) ?? 0) + 1);
        degrees.set(link.target, (degrees.get(link.target) ?? 0) + 1);
      }
    }
    return multiplier / Math.min(degrees.get(edge.source) ?? 1, degrees.get(edge.target) ?? 1);
  };
}

/** The motion's step and drag: the probe's smooth control, which the owner found "quite natural" (2026-10-19). */
export const MOTION: MotionSettings = { step: 0.5, drag: 0.2 };

/** How hard two spheres closer than their clearance push apart, per unit of overlap. */
export const COLLISION_STIFFNESS = 3;

/** The largest move of a tick, as a share of the picture's diagonal, below which the spheres count as still. */
export const STILL_FRACTION = 3e-5;

/** How many still ticks in a row end the easing. */
export const QUIET_TICKS = 10;

/**
 * The largest move of a tick, as a share of the picture's diagonal, under which a picture unfolding from nothing has
 * calmed and the tether takes hold where it stands. A tenth of a percent: this repository's pictures pass it after about
 * 210 to 250 ticks from the library's seed and are still some 140 ticks later; held from the seed, which is a ball a
 * hundredth of the picture's size, they would stay far too small (measured 2026-10-21).
 */
export const UNFOLDED_FRACTION = 1e-3;

/**
 * The field of a picture: its spheres' radii, a spring on each link that pulls in the layout with the rest length and
 * strength ruled above, and the tuning's repulsion, gravity, collision gap and tether. Links whose ends are not among the
 * nodes are left out, as D3 would refuse them.
 */
export function spatialFieldOf<N extends SpatialNode>(nodes: readonly N[], links: readonly SpatialLink<N>[], tuning: ForceGraphTuning, layout: SpatialLayout): SpatialField {
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const endpoint = (end: string | N): N | undefined => {
    const at = index.get(typeof end === "string" ? end : end.id);
    return at === undefined ? undefined : nodes[at];
  };
  const pulling: SpatialLink<N>[] = [];
  for (const link of links) {
    if (!linkPulls(link, layout, tuning)) continue;
    const source = endpoint(link.source), target = endpoint(link.target);
    if (source && target && source !== target) pulling.push({ ...link, source, target });
  }
  const strengthOf = springStrength<N, SpatialLink<N>>(tuning.linkStrength);
  const springs = pulling.map((link, i) => ({
    a: index.get((link.source as N).id)!, b: index.get((link.target as N).id)!,
    rest: spatialLinkDistance(link, tuning), strength: strengthOf(link, i, pulling) * springShare(link, tuning)
  }));
  return new SpatialField(Float64Array.from(nodes.map(node => spatialNodeRadius(node, tuning))), springs,
    { charge: tuning.charge, chargeRange: tuning.chargeRange, gravity: tuning.gravity, collisionGap: tuning.collisionGap, collisionStiffness: COLLISION_STIFFNESS, tether: tuning.tether },
    (low, high) => seededDirection(`${nodes[low].id}\0${nodes[high].id}`));
}

/**
 * How a motion begins: held from where the spheres stand, for a change of what is shown or a hand, so that the picture
 * keeps a person's bearings; or unfolding freely until it calms and held there, for a first picture, a layout or new
 * forces, which rearrange the whole and leave the old places no reference.
 */
export type MotionStart = "hold" | "unfold";

/** The one force that moves the 3D picture, with what the page asks of it. */
export interface MotionForce<N extends SpatialNode> extends Force<N> {
  /** Ease again from where the spheres stand, held there or unfolding first; held unless said. */
  wake(start?: MotionStart): void;
  /** Build the field again before the next tick, since the spheres' sizes, the links or the tuning changed. */
  invalidate(): void;
  /** Whether the spheres have been still for `QUIET_TICKS` ticks since the last `wake`. */
  readonly still: boolean;
}

/** What the motion force reads at every tick. */
export interface MotionSource<N extends SpatialNode> {
  tuning(): ForceGraphTuning;
  layout(): SpatialLayout;
  /** Every link the page holds; the field takes the pulling ones. */
  links(): readonly SpatialLink<N>[];
  /** The constant strength of the easing now: one for the first picture, a hand or new forces, the update energy for a change. */
  strength(): number;
  /** Called once when the spheres fall still. */
  onStill?(): void;
}

/**
 * D3's simulation drives the ticks, this force does all the moving (2026-10-21). Each tick it reads the spheres where they
 * stand, since the carry of a change and a hand move them between ticks, holds every sphere D3 has fixed (`fx`, a hand's
 * drag), steps the damped motion through the field at the source's strength, writes the positions back and zeroes D3's
 * velocities, so that D3's own integration adds nothing. A sphere keeps its velocity and its anchor by id when the field is
 * built again. A picture that has never moved unfolds first. Alpha is ignored: the easing has no schedule, and ends when
 * the tether holds and the largest move of a tick has stayed under `STILL_FRACTION` of the picture's diagonal for
 * `QUIET_TICKS` ticks with no sphere held by a hand.
 */
export function motionForce<N extends SpatialNode>(source: MotionSource<N>): MotionForce<N> {
  let nodes: N[] = [];
  let motion: SpatialMotion | null = null;
  let builtFor: readonly string[] = [];
  let quiet = 0, still = false, holding = false;
  let begin: MotionStart | null = "unfold";
  const kept = new Map<string, { velocity: number[]; anchor: number[] }>();
  const keep = (): void => {
    const last = motion;
    if (!last) return;
    builtFor.forEach((id, i) => kept.set(id, {
      velocity: Array.from(last.velocity.subarray(3 * i, 3 * i + 3)),
      anchor: Array.from(last.anchor.subarray(3 * i, 3 * i + 3))
    }));
  };
  const build = (): SpatialMotion => {
    keep();
    const field = spatialFieldOf(nodes, source.links(), source.tuning(), source.layout());
    const places = nodes.map(node => [node.x ?? 0, node.y ?? 0, node.z ?? 0]);
    const positions = Float64Array.from(places.flat());
    const velocity = Float64Array.from(nodes.flatMap(node => kept.get(node.id)?.velocity ?? [0, 0, 0]));
    // A sphere new to the picture is held where it was placed.
    const anchor = Float64Array.from(nodes.flatMap((node, i) => kept.get(node.id)?.anchor ?? places[i]));
    kept.clear();
    builtFor = nodes.map(node => node.id);
    const next = new SpatialMotion(field, positions, MOTION, velocity, anchor);
    if (!holding) next.release();
    return next;
  };
  const force = ((): void => {
    if (!nodes.length) return;
    motion ??= build();
    const x = motion.positions;
    const fixed = new Set<number>();
    let moved = false;
    nodes.forEach((node, i) => {
      const a = 3 * i;
      const at = [node.fx ?? node.x ?? 0, node.fy ?? node.y ?? 0, node.fz ?? node.z ?? 0];
      if (node.fx != null || node.fy != null || node.fz != null) fixed.add(i);
      for (let k = 0; k < 3; k++) if (x[a + k] !== at[k]) { x[a + k] = at[k]; moved = true; }
    });
    if (moved) motion.refresh();
    if (begin) {
      holding = begin === "hold";
      if (holding) motion.anchorHere(); else motion.release();
      begin = null;
    }
    const tick = motion.tick(source.strength(), fixed);
    nodes.forEach((node, i) => {
      node.x = x[3 * i]; node.y = x[3 * i + 1]; node.z = x[3 * i + 2];
      node.vx = 0; node.vy = 0; node.vz = 0;
    });
    const diagonal = diagonalOf(x);
    if (!holding && tick.moveMax <= UNFOLDED_FRACTION * diagonal) {
      motion.anchorHere();
      holding = true;
    }
    if (still) return;
    quiet = holding && !fixed.size && tick.moveMax <= STILL_FRACTION * diagonal ? quiet + 1 : 0;
    if (quiet >= QUIET_TICKS) {
      still = true;
      source.onStill?.();
    }
  }) as unknown as MotionForce<N>;
  Object.assign(force, {
    initialize: (next: N[]): void => { keep(); motion = null; nodes = next; },
    wake: (start: MotionStart = "hold"): void => { still = false; quiet = 0; begin = start; },
    invalidate: (): void => { keep(); motion = null; }
  });
  Object.defineProperty(force, "still", { get: () => still });
  return force;
}

/** How a headless easing runs: its constant strength, how it begins, and the most ticks it may take. */
export interface EaseOptions {
  strength?: number;
  start?: MotionStart;
  maxTicks?: number;
}

/**
 * Ease a picture headlessly as the page does: D3's simulation seats the spheres without a position, as the library does,
 * resolves the links and drives the ticks, and the motion force moves the spheres at the strength given until they are
 * still or `maxTicks` have passed. A first picture unfolds (the default); a change carried from a still picture is held
 * from where its spheres stand. Inputs are not mutated; the result says whether the picture came to rest.
 */
export function easeSpatialLayout(nodes: readonly SpatialNode[], links: readonly SpatialLink[], tuning: ForceGraphTuning, layout: SpatialLayout,
  { strength = 1, start = "unfold", maxTicks = 20_000 }: EaseOptions = {}): { nodes: SpatialNode[]; links: SpatialLink[]; ticks: number; still: boolean } {
  if (!Number.isInteger(maxTicks) || maxTicks < 0) throw new Error("Spatial easing's tick bound must be a nonnegative integer.");
  const placed = nodes.map(node => ({ ...node }));
  const edges = links.map(link => ({ ...link, source: typeof link.source === "string" ? link.source : link.source.id,
    target: typeof link.target === "string" ? link.target : link.target.id } as SpatialLink));
  // The link force pulls nothing; it holds every link, pulling or not, so that each one's ends resolve to their spheres.
  const simulation = forceSimulation(placed, 3).stop().force("link", forceLink<SpatialNode, SpatialLink>(edges).id(node => node.id).strength(0));
  const motion = motionForce<SpatialNode>({ tuning: () => tuning, layout: () => layout, links: () => edges, strength: () => strength });
  motion.wake(start);
  simulation.force("motion", motion);
  let ticks = 0;
  if (strength > 0) while (!motion.still && ticks < maxTicks) { simulation.tick(); ticks++; }
  return { nodes: placed, links: edges, ticks, still: motion.still };
}
