import "../../shared/d3-force-3d";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type Force, type ForceLink, type ForceManyBody, type SimulationNodeDatum } from "d3-force-3d";

import type { ForceGraphTuning } from "../types";

/** The documented interface and mutable position of a file in the spatial layout. */
export interface SpatialNode extends SimulationNodeDatum {
  id: string;
  publicSymbols: readonly string[];
}

/** One undirected file pair; count is the number of documented references in either direction. */
export interface SpatialLink<N extends SpatialNode = SpatialNode> {
  source: string | N;
  target: string | N;
  count: number;
  /** Containment remains a separate structural relationship in reports. */
  kind?: string;
}

/** The value is sphere volume; zero-symbol files still have a visible body. */
export function spatialNodeValue(node: SpatialNode, tuning: ForceGraphTuning): number {
  return Math.pow(1 + node.publicSymbols.length, tuning.symbolScale);
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

/** The force getter/setter shared by D3's simulation and the browser's public force API. */
export interface SpatialForceAccess<N extends SpatialNode> {
  get(name: string): Force<N> | undefined;
  set(name: string, force: Force<N>): void;
}

/** Apply the same forces in the browser and headlessly, retaining D3's degree-normalized spring strengths. */
export function configureSpatialForces<N extends SpatialNode>(engine: SpatialForceAccess<N>, tuning: ForceGraphTuning): void {
  const link = engine.get("link") as ForceLink<N, SpatialLink<N>> | undefined;
  const charge = engine.get("charge") as ForceManyBody<N> | undefined;
  if (!link || !charge) throw new Error("The spatial layout requires its link and charge forces.");
  link.distance(edge => spatialLinkDistance(edge, tuning));
  charge.strength(-tuning.charge);
  engine.set("collide", forceCollide<N>(node => spatialNodeRadius(node, tuning) + tuning.collisionGap / 2).iterations(3));
}

/** Deterministic cold layout, using the browser's D3 engine and force configuration; inputs are not mutated. */
export function simulateSpatialLayout(nodes: readonly SpatialNode[], links: readonly SpatialLink[], tuning: ForceGraphTuning, ticks = 300): {
  nodes: SpatialNode[]; links: SpatialLink[];
} {
  if (!Number.isInteger(ticks) || ticks < 0) throw new Error("Spatial simulation ticks must be a nonnegative integer.");
  const placed = nodes.map(node => ({ ...node }));
  const edges = links.map(link => ({ ...link, source: typeof link.source === "string" ? link.source : link.source.id,
    target: typeof link.target === "string" ? link.target : link.target.id } as SpatialLink));
  const simulation = forceSimulation(placed, 3).stop()
    .force("link", forceLink<SpatialNode, SpatialLink>(edges).id(node => node.id))
    .force("charge", forceManyBody<SpatialNode>())
    .force("center", forceCenter<SpatialNode>());
  configureSpatialForces({ get: name => simulation.force(name), set: (name, force) => { simulation.force(name, force); } }, tuning);
  simulation.tick(ticks);
  return { nodes: placed, links: edges };
}
