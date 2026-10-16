import "../../shared/d3-force-3d";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type Force, type ForceLink, type ForceManyBody, type SimulationNodeDatum } from "d3-force-3d";

import type { ForceGraphTuning, SpatialLayout } from "../types";

/** The documented interface and mutable position of a file, or of a directory hub, in the spatial layout. */
export interface SpatialNode extends SimulationNodeDatum {
  id: string;
  publicSymbols: readonly string[];
  /** A directory hub's members' public-symbol counts, at every depth; its volume is the sum of theirs (2026-10-14). */
  containedSymbolCounts?: readonly number[];
}

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
  if (!node.containedSymbolCounts) return volume(node.publicSymbols.length);
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
export function pullingLinkForce<N extends SpatialNode, L extends SpatialLink<N>>(link: ForceLink<N, L>, layout: SpatialLayout): ForceLink<N, L> {
  const wrapped = link as unknown as Partial<PullingLinkForce<N, L>>;
  const inner = wrapped.inner ?? link;
  const all = wrapped.all ?? link.links();
  const force = ((alpha: number): void => { inner(alpha); }) as PullingLinkForce<N, L>;
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

/** The force getter/setter shared by D3's simulation and the browser's public force API. */
export interface SpatialForceAccess<N extends SpatialNode> {
  get(name: string): Force<N> | undefined;
  set(name: string, force: Force<N>): void;
}

/** Apply the same forces in the browser and headlessly; the layout says which links pull. */
export function configureSpatialForces<N extends SpatialNode>(engine: SpatialForceAccess<N>, tuning: ForceGraphTuning, layout: SpatialLayout = "connections"): void {
  const link = engine.get("link") as ForceLink<N, SpatialLink<N>> | undefined;
  const charge = engine.get("charge") as ForceManyBody<N> | undefined;
  if (!link || !charge) throw new Error("The spatial layout requires its link and charge forces.");
  engine.set("link", pullingLinkForce(link, layout).distance(edge => spatialLinkDistance(edge, tuning)));
  charge.strength(-tuning.charge);
  engine.set("collide", forceCollide<N>(node => spatialNodeRadius(node, tuning) + tuning.collisionGap / 2).iterations(3));
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
