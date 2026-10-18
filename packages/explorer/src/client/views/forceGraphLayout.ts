import "../../shared/d3-force-3d";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceRadial, forceSimulation, type Force, type ForceLink, type ForceManyBody, type SimulationNodeDatum } from "d3-force-3d";

import type { ForceGraphTuning, SpatialLayout } from "../types";
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

/** How many public symbols a file exposes: the count it carries, or its names counted. */
export const symbolCountOf = (node: Pick<SpatialNode, "publicSymbols" | "symbolCount">): number => node.symbolCount ?? node.publicSymbols.length;

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
 * them by their declared directories. The other kind stays in the data to be drawn on demand and moves nothing.
 */
export function linkPulls(link: Pick<SpatialLink, "kind">, layout: SpatialLayout): boolean {
  return layout === "structure" ? link.kind === "containment" : link.kind !== "containment";
}

type PullingLinkForce<N extends SpatialNode, L extends SpatialLink<N>> = ForceLink<N, L> & { readonly inner: ForceLink<N, L>; all: L[]; nodes?: N[] };

/**
 * D3's link force over the links that pull in a layout. It accepts every link like the force it wraps and hands the
 * inner force only the pulling ones, so that a documented reference drawn on demand in the structure layout neither
 * pulls nor counts in a spring's degree, and containment never does in the connections layout. Wrapping a wrapper for
 * another layout starts again from the complete list it was given.
 *
 * D3 resolves the endpoints of only the links it holds, and three-forcegraph draws no line whose endpoints have no
 * coordinates, so the wrapper resolves the others against the same nodes, as D3 would and with D3's error for an id
 * it cannot find: a reference revealed in the structure layout runs between its two spheres (2026-10-16).
 */
export function pullingLinkForce<N extends SpatialNode, L extends SpatialLink<N>>(link: ForceLink<N, L>, layout: SpatialLayout, share: () => number = FULL_SHARE): ForceLink<N, L> {
  const wrapped = link as unknown as Partial<PullingLinkForce<N, L>>;
  const inner = wrapped.inner ?? link;
  const all = wrapped.all ?? link.links();
  const force = ((alpha: number): void => { inner(alpha * share()); }) as PullingLinkForce<N, L>;
  type Setter = number | ((edge: L, index: number, links: L[]) => number);
  const resolveHeldBack = (): void => {
    const nodes = force.nodes;
    if (!nodes) return;
    const id = inner.id();
    const byId = new Map(nodes.map((node, index) => [id(node, index, nodes), node]));
    const find = (endpoint: string | N): N => {
      if (typeof endpoint === "object") return endpoint;
      const node = byId.get(endpoint);
      if (!node) throw new Error(`node not found: ${endpoint}`);
      return node;
    };
    for (const edge of force.all) {
      if (linkPulls(edge, layout)) continue;
      edge.source = find(edge.source);
      edge.target = find(edge.target);
    }
  };
  Object.assign(force, {
    inner,
    all,
    nodes: wrapped.nodes,
    initialize: (nodes: N[], ...rest: unknown[]): void => {
      (inner.initialize as ((nodes: N[], ...rest: unknown[]) => void) | undefined)?.(nodes, ...rest);
      force.nodes = nodes;
      resolveHeldBack();
    },
    links: (...args: [L[]?]): L[] | typeof force => {
      if (!args.length) return force.all;
      force.all = args[0]!;
      inner.links(force.all.filter(edge => linkPulls(edge, layout)));
      resolveHeldBack();
      return force;
    },
    id: (by: (node: N, index: number, nodes: N[]) => string | number): typeof force => { inner.id(by); return force; },
    distance: (...args: [Setter?]): Setter | typeof force => args.length ? (inner.distance(args[0]!), force) : inner.distance(),
    strength: (...args: [Setter?]): Setter | typeof force => args.length ? (inner.strength(args[0]!), force) : inner.strength()
  });
  force.links(all);
  return force;
}

/** The alpha below which the engine stops: the stillness the first picture cools to, and every later update with it. */
export const SETTLED_ALPHA = 0.001;

/** The library's cooling rate, three-forcegraph's default applied to its simulation at construction, which the page never changes. */
export const LIBRARY_ALPHA_DECAY = 0.0228;

/** The forces see all of alpha: the first picture and a change of the forces. */
export const FULL_SHARE = (): number => 1;

/**
 * What a membership change does to the simulation under the update energy, the lever of ticket C2 of the change-over-time
 * plan: the share of alpha the forces see, the alpha the engine stops at, and whether it ticks at all. In D3 a reheat is one
 * number, the alpha the simulation starts from, so the lever is that number: at one the full reheat the library makes of
 * every change; at a fraction a reheat to that alpha, which cools at the library's rate and stops at the same stillness as
 * the first picture, so sooner; at or below the stillness itself nothing is simulated, and the spheres stand where the carry
 * put them. The library sets alpha to one on every change and exposes no alpha of its own, so the fraction is applied as
 * the share of alpha the forces see, and the stop as the alpha at which that share falls to the stillness.
 */
export interface UpdateSchedule {
  /** The share of alpha the forces see, zero when nothing is simulated. */
  share: number;
  /** The library's alpha below which the engine stops, so that the forces' alpha stops at the settled one. */
  alphaMin: number;
  /** Whether the engine ticks at all. */
  ticks: boolean;
}

/** The schedule of a membership change at this energy; see `UpdateSchedule`. Refuses an energy outside zero to one. */
export function updateSchedule(energy: number): UpdateSchedule {
  if (!(energy >= 0 && energy <= 1)) throw new Error(`Update energy must be between 0 and 1, not ${String(energy)}.`);
  if (energy <= SETTLED_ALPHA) return { share: 0, alphaMin: SETTLED_ALPHA, ticks: false };
  return { share: energy, alphaMin: SETTLED_ALPHA / energy, ticks: true };
}

/** How many ticks the engine takes to settle after a change at this energy, counted as the library counts them: alpha is checked before each tick and decays in it. */
export function settleTicksOf(energy: number, alphaDecay = LIBRARY_ALPHA_DECAY): number {
  const schedule = updateSchedule(energy);
  if (!schedule.ticks) return 0;
  let alpha = 1, ticks = 0;
  while (!(alpha < schedule.alphaMin)) { alpha += (0 - alpha) * alphaDecay; ticks++; }
  return ticks;
}

type ScaledForce<N extends SpatialNode> = Force<N> & { readonly unscaled: Force<N> };

/**
 * A force that sees a share of alpha, read at every tick. D3's accessors are forwarded to the force beneath, so that
 * configuration still reaches it and a chained setter returns the wrapper; wrapping a wrapper wraps the force beneath it,
 * so the share is never applied twice. The collision force is never wrapped: D3's collision ignores alpha.
 */
export function scaledForce<N extends SpatialNode, F extends Force<N>>(force: F, share: () => number): F {
  const inner = ((force as Partial<ScaledForce<N>>).unscaled ?? force) as F;
  const scaled = ((alpha: number): void => { inner(alpha * share()); }) as F;
  for (const key of Object.keys(inner)) {
    const member = (inner as unknown as Record<string, unknown>)[key];
    if (typeof member !== "function") continue;
    (scaled as unknown as Record<string, unknown>)[key] = (...args: unknown[]): unknown => {
      const result = (member as (...rest: unknown[]) => unknown).apply(inner, args);
      return result === inner ? scaled : result;
    };
  }
  Object.defineProperty(scaled, "unscaled", { value: inner });
  return scaled;
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
    if (!linkPulls(link, layout)) continue;
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

/** The force getter/setter shared by D3's simulation and the browser's public force API; setting null removes a force. */
export interface SpatialForceAccess<N extends SpatialNode> {
  get(name: string): Force<N> | undefined;
  set(name: string, force: Force<N> | null): void;
}

/**
 * Apply the same forces in the browser and headlessly; the layout says which links pull.
 *
 * Four forces made the picture before 2026-10-17: the spring on each pulling link, the repulsion of every sphere on
 * every other with unbounded reach, the collision that keeps spheres apart, and the library's centring, which only
 * translates the whole so that its mean sits at the origin. Nothing drew two unconnected clusters together or the whole
 * inward, so every reheat pushed the clusters a little further apart. Gravity is the restoring force: a pull on every
 * sphere toward the origin in proportion to its distance, so that the picture has a compact equilibrium it returns to;
 * the repulsion's reach can be bounded beside it. The spring, the repulsion and the gravity see the given share of alpha,
 * read at every tick, which is how a membership change is fed less than a full reheat (`updateSchedule`); the collision
 * ignores alpha and is never scaled. The springs' strength is D3's rule times the tuning's lever (`springStrength`).
 */
export function configureSpatialForces<N extends SpatialNode>(engine: SpatialForceAccess<N>, tuning: ForceGraphTuning, layout: SpatialLayout = "connections", share: () => number = FULL_SHARE): void {
  const link = engine.get("link") as ForceLink<N, SpatialLink<N>> | undefined;
  const charge = engine.get("charge") as ForceManyBody<N> | undefined;
  if (!link || !charge) throw new Error("The spatial layout requires its link and charge forces.");
  engine.set("link", pullingLinkForce(link, layout, share).distance(edge => spatialLinkDistance(edge, tuning)).strength(springStrength(tuning.linkStrength)));
  engine.set("charge", scaledForce(charge, share).strength(-tuning.charge).distanceMax(tuning.chargeRange > 0 ? tuning.chargeRange : Infinity));
  engine.set("collide", forceCollide<N>(node => spatialNodeRadius(node, tuning) + tuning.collisionGap / 2).iterations(3));
  engine.set("gravity", tuning.gravity > 0 ? scaledForce(forceRadial<N>(0, 0, 0, 0), share).strength(tuning.gravity) : null);
}

/** Deterministic cold layout, using the browser's D3 engine and force configuration; inputs are not mutated. */
export function simulateSpatialLayout(nodes: readonly SpatialNode[], links: readonly SpatialLink[], tuning: ForceGraphTuning, ticks = 300,
  layout: SpatialLayout = "connections"): { nodes: SpatialNode[]; links: SpatialLink[] } {
  if (!Number.isInteger(ticks) || ticks < 0) throw new Error("Spatial simulation ticks must be a nonnegative integer.");
  const placed = nodes.map(node => ({ ...node }));
  const edges = links.map(link => ({ ...link, source: typeof link.source === "string" ? link.source : link.source.id,
    target: typeof link.target === "string" ? link.target : link.target.id } as SpatialLink));
  const simulation = forceSimulation(placed, 3).stop()
    .force("link", forceLink<SpatialNode, SpatialLink>(edges).id(node => node.id))
    .force("charge", forceManyBody<SpatialNode>())
    .force("center", forceCenter<SpatialNode>());
  configureSpatialForces({ get: name => simulation.force(name), set: (name, force) => { simulation.force(name, force); } }, tuning, layout);
  simulation.tick(ticks);
  return { nodes: placed, links: edges };
}

/**
 * Feed a membership change to a simulation headlessly as the page does: the spheres stand where the carry put them (the
 * ones without a position seated by D3), the forces see the energy's share of alpha, and the engine ticks until it would
 * stop, at the library's cooling rate. Returns the placed nodes, the resolved links and the ticks it took; at an energy at or
 * below the settled alpha nothing is simulated. Inputs are not mutated.
 */
export function settleSpatialUpdate(nodes: readonly SpatialNode[], links: readonly SpatialLink[], tuning: ForceGraphTuning, layout: SpatialLayout,
  energy = tuning.updateEnergy): { nodes: SpatialNode[]; links: SpatialLink[]; ticks: number } {
  const schedule = updateSchedule(energy);
  const placed = nodes.map(node => ({ ...node }));
  const edges = links.map(link => ({ ...link, source: typeof link.source === "string" ? link.source : link.source.id,
    target: typeof link.target === "string" ? link.target : link.target.id } as SpatialLink));
  const simulation = forceSimulation(placed, 3).stop().alphaDecay(LIBRARY_ALPHA_DECAY)
    .force("link", forceLink<SpatialNode, SpatialLink>(edges).id(node => node.id))
    .force("charge", forceManyBody<SpatialNode>())
    .force("center", forceCenter<SpatialNode>());
  configureSpatialForces({ get: name => simulation.force(name), set: (name, force) => { simulation.force(name, force); } }, tuning, layout, () => schedule.share);
  let ticks = 0;
  while (schedule.ticks && !(simulation.alpha() < schedule.alphaMin)) {
    simulation.tick();
    if (++ticks > 10_000) throw new Error("The simulation did not settle in ten thousand ticks.");
  }
  return { nodes: placed, links: edges, ticks };
}
