/**
 * Drift: what repeated membership changes do to the 3D picture, measured headlessly.
 *
 * The owner saw it in the product on 2026-10-17: toggle a file type on and off a few times and "the microgalaxies
 * drift further apart". Each toggle is a full reheat of the simulation, and nothing in it pulled two unconnected
 * clusters together, so every reheat pushed them apart a little more. This module plays that cycle over the page's
 * own spatial data and motion, with the page's rule for what carries across a membership change (a sphere keeps its
 * place; a new one starts beside what holds it), each change eased as the page eases it, held where the spheres stand at
 * the update energy of ticket C2 (2026-10-18; a constant strength since 2026-10-21), and reports the picture's extent
 * after every cycle, how far the spheres that never left moved when the others came back, and how many ticks each change
 * took to be still. A picture with a compact equilibrium leaves the extent where it began; one without lets it grow.
 *
 * @module layout-lab/drift
 */
import type { ForceGraphTuning, SpatialLayout } from "../../packages/explorer/src/client/types";
import { spatialGraphOf, type SpatialGraphNode } from "../../packages/explorer/src/client/views/forceGraphData";
import { easeSpatialLayout, placeNewSpheres, type Placed, type SpatialLink, type SpatialNode } from "../../packages/explorer/src/client/views/forceGraphLayout";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

export type { Placed };

/** The measure of one cycle: the picture's extent after the toggled files came back, how far the others moved, and how long each change took to settle. */
export interface DriftCycle {
  cycle: number;
  /** Root-mean-square distance of every sphere from the picture's centroid, after the restore. */
  extent: number;
  /** The diagonal of the box around every sphere's centre, after the restore. */
  diagonal: number;
  /** Mean move of the spheres that were never toggled, between this restore and the one before (the settled start for cycle one). */
  meanMoveOfUnchanged: number;
  /** The greatest such move. */
  greatestMoveOfUnchanged: number;
  /** The ticks the removal and the restore each took to be still at the update energy, or the bound (2026-10-18, 2026-10-21). */
  settleTicks: { removed: number; restored: number };
}

/** What one setting of the forces does over the cycles. */
export interface DriftReport {
  layout: SpatialLayout;
  tuning: ForceGraphTuning;
  /** The most ticks any one easing may take. */
  ticks: number;
  /** The spheres the toggle removes and restores, by id. */
  toggled: number;
  /** The spheres in the full picture. */
  total: number;
  /** The settled start's extent and diagonal, before any toggle. */
  start: { extent: number; diagonal: number };
  cycles: DriftCycle[];
}

/** Root-mean-square distance from the centroid: the picture's spread, insensitive to one far sphere. */
export function extentOf(points: readonly Placed[]): number {
  if (!points.length) return 0;
  const centre = points.reduce((sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length, z: sum.z + point.z / points.length }), { x: 0, y: 0, z: 0 });
  return Math.sqrt(points.reduce((sum, point) => sum + (point.x - centre.x) ** 2 + (point.y - centre.y) ** 2 + (point.z - centre.z) ** 2, 0) / points.length);
}

/** The diagonal of the box around every point. */
export function diagonalOf(points: readonly Placed[]): number {
  if (!points.length) return 0;
  const span = (axis: keyof Placed): number => Math.max(...points.map(point => point[axis])) - Math.min(...points.map(point => point[axis]));
  return Math.hypot(span("x"), span("y"), span("z"));
}

const placed = (node: SpatialNode): node is SpatialNode & Placed => Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z);

/**
 * The archetype a `--toggle` option names: the filter's plural (`tests`, `assets`) to the doc's singular archetype
 * (`test`, `asset`), or null for `none`, the control that reheats the picture with no change at all. Any other word is
 * refused, since a toggle that matches nothing would measure the control while claiming a toggle (found 2026-10-17).
 */
export function toggledArchetype(option: string): string | null {
  if (option === "none") return null;
  if (option === "tests") return "test";
  if (option === "assets") return "asset";
  throw new Error(`--toggle must be tests, assets or none, not ${JSON.stringify(option)}.`);
}

/**
 * Carry positions across a membership change as the page does: a sphere that was in the picture keeps its place, and the
 * spheres new to it start beside what holds them by the page's own rule, `placeNewSpheres` (a hub at its members' centroid,
 * a file at its hub's or its neighbours' rest length), which this measure shares with the page since 2026-10-18.
 */
export function carryPositions(nodes: readonly SpatialGraphNode[], links: readonly SpatialLink[], previous: ReadonlyMap<string, Placed>, tuning: ForceGraphTuning, layout: SpatialLayout): SpatialNode[] {
  const carried: Array<SpatialGraphNode & Partial<Placed>> = nodes.map(node => {
    const known = previous.get(node.id);
    return known ? { ...node, x: known.x, y: known.y, z: known.z } : { ...node };
  });
  for (const [id, start] of placeNewSpheres(carried, links as readonly SpatialLink<SpatialGraphNode & Partial<Placed>>[], tuning, layout)) {
    Object.assign(carried.find(node => node.id === id)!, start);
  }
  return carried;
}

const positionsOf = (nodes: readonly SpatialNode[]): Map<string, Placed> =>
  new Map(nodes.filter(placed).map(node => [node.id, { x: node.x, y: node.y, z: node.z }]));

/**
 * Ease the full picture until still, then toggle the given files out and back in for the given number of cycles, each
 * change eased from the carried positions at the tuning's update energy, held where the spheres stand, as the page eases
 * it, and measure the picture after every restore. The first picture unfolds at full strength, as the page's does; every
 * easing stops when still or at the given bound of ticks.
 */
export function measureDrift(graph: ExplorerGraphPayload, include: (node: ExplorerNodePayload) => boolean, toggled: (node: ExplorerNodePayload) => boolean,
  tuning: ForceGraphTuning, layout: SpatialLayout, cycles: number, ticks: number): DriftReport {
  if (!Number.isInteger(cycles) || cycles < 1) throw new Error("Drift needs at least one cycle.");
  const full = spatialGraphOf(graph, include, [], layout);
  const reduced = spatialGraphOf(graph, node => include(node) && !toggled(node), [], layout);
  const toggledIds = new Set(full.nodes.filter(node => !reduced.nodes.some(other => other.id === node.id)).map(node => node.id));
  if (toggledIds.size === 0 && graph.nodes.some(node => include(node) && toggled(node))) throw new Error("The toggle names files the picture does not hold.");
  const unchangedIds = full.nodes.filter(node => !toggledIds.has(node.id)).map(node => node.id);
  let positions = positionsOf(easeSpatialLayout(full.nodes, full.links, tuning, layout, { maxTicks: ticks }).nodes);
  const feed = (nodes: SpatialNode[], links: readonly SpatialLink[]): { positions: Map<string, Placed>; ticks: number } => {
    const eased = easeSpatialLayout(nodes, links, tuning, layout, { strength: tuning.updateEnergy, start: "hold", maxTicks: ticks });
    return { positions: positionsOf(eased.nodes), ticks: eased.ticks };
  };
  const start = { extent: extentOf([...positions.values()]), diagonal: diagonalOf([...positions.values()]) };
  const report: DriftReport = { layout, tuning, ticks, toggled: toggledIds.size, total: full.nodes.length, start, cycles: [] };
  for (let cycle = 1; cycle <= cycles; cycle++) {
    const before = positions;
    const removed = feed(carryPositions(reduced.nodes, reduced.links, positions, tuning, layout), reduced.links);
    const restored = feed(carryPositions(full.nodes, full.links, new Map([...positions, ...removed.positions]), tuning, layout), full.links);
    positions = restored.positions;
    const moves = unchangedIds.map(id => {
      const was = before.get(id)!, is = positions.get(id)!;
      return Math.hypot(is.x - was.x, is.y - was.y, is.z - was.z);
    });
    report.cycles.push({
      cycle,
      extent: extentOf([...positions.values()]),
      diagonal: diagonalOf([...positions.values()]),
      meanMoveOfUnchanged: moves.reduce((sum, move) => sum + move, 0) / Math.max(1, moves.length),
      greatestMoveOfUnchanged: moves.length ? Math.max(...moves) : 0,
      settleTicks: { removed: removed.ticks, restored: restored.ticks }
    });
  }
  return report;
}

/** The least and the greatest of some counts, as "a to b", or the one count they all are. */
export function rangeOf(counts: readonly number[]): string {
  const least = Math.min(...counts), most = Math.max(...counts);
  return least === most ? String(least) : `${least} to ${most}`;
}

/** A table a person reads: one row per setting, the extent's growth across the cycles, the unchanged spheres' moves and the ticks each change took to be still. */
export function renderDriftReports(reports: readonly DriftReport[], title: string): string {
  const fixed = (number: number): string => number.toFixed(1);
  const lines = [`# ${title}`, "", `Historical layout-lab measurement, ${new Date().toISOString()}. Each row eases the full picture until still, then toggles the same spheres out and back in for every cycle, each change eased from the carried positions as the page eases it, held where the spheres stand, at the update energy: at 1 the full forces, at a fraction more gently and for longer, at 0 placement alone. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles; the settle is the ticks a change took to be still, the removal and the restore alike, or the bound of ${reports[0]?.ticks ?? 0} ticks.`, ""];
  lines.push("| Layout | Energy | Tether | Spring | Gravity | Reach | Approximation | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move | Settle ticks |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |");
  for (const report of reports) {
    const last = report.cycles[report.cycles.length - 1];
    const meanMove = report.cycles.reduce((sum, cycle) => sum + cycle.meanMoveOfUnchanged, 0) / report.cycles.length;
    const greatest = Math.max(...report.cycles.map(cycle => cycle.greatestMoveOfUnchanged));
    const settles = report.cycles.flatMap(cycle => [cycle.settleTicks.removed, cycle.settleTicks.restored]);
    lines.push(`| ${report.layout} | ${report.tuning.updateEnergy} | ${report.tuning.tether} | ${report.tuning.linkStrength} | ${report.tuning.gravity} | ${report.tuning.chargeRange || "unbounded"} | ${report.tuning.approximation} | ${report.total} (${report.toggled}) | ${fixed(report.start.extent)} | ${report.cycles.map(cycle => fixed(cycle.extent)).join(", ")} | ${(last.extent / report.start.extent).toFixed(2)}× | ${fixed(meanMove)} | ${fixed(greatest)} | ${rangeOf(settles)} |`);
  }
  return lines.join("\n") + "\n";
}
