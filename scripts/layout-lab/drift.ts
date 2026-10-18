/**
 * Drift: what repeated membership changes do to the 3D picture, measured headlessly.
 *
 * The owner saw it in the product on 2026-10-17: toggle a file type on and off a few times and "the microgalaxies
 * drift further apart". Each toggle is a full reheat of the simulation, and nothing in it pulled two unconnected
 * clusters together, so every reheat pushed them apart a little more. This module plays that cycle over the page's
 * own spatial data and forces, with the page's rules for what carries across a membership change (a sphere keeps its
 * place; a hub new to the picture starts at its members' centroid), and reports the picture's extent after every cycle
 * and how far the spheres that never left moved when the others came back. A simulation with a compact equilibrium
 * leaves the extent where it began; one without lets it grow.
 *
 * @module layout-lab/drift
 */
import type { ForceGraphTuning, SpatialLayout } from "../../packages/explorer/src/client/types";
import { spatialGraphOf, type SpatialGraphNode } from "../../packages/explorer/src/client/views/forceGraphData";
import { simulateSpatialLayout, type SpatialLink, type SpatialNode } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { under } from "../../packages/explorer/src/client/views/localView/directory-state";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

/** A point the simulation placed. */
export interface Placed { x: number; y: number; z: number }

/** The measure of one cycle: the picture's extent after the toggled files came back, and how far the others moved. */
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
}

/** What one setting of the forces does over the cycles. */
export interface DriftReport {
  layout: SpatialLayout;
  tuning: ForceGraphTuning;
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
 * Carry positions across a membership change as the page does: a sphere that was in the picture keeps its place, and a
 * hub new to the picture starts at the centroid of the members that already stand somewhere (forceGraphView.ts, 2026-10-14).
 */
export function carryPositions(nodes: readonly SpatialGraphNode[], previous: ReadonlyMap<string, Placed>): SpatialNode[] {
  const carried: Array<SpatialGraphNode & Partial<Placed>> = nodes.map(node => {
    const known = previous.get(node.id);
    return known ? { ...node, x: known.x, y: known.y, z: known.z } : { ...node };
  });
  for (const hub of carried) {
    if (hub.directoryPath === undefined || Number.isFinite(hub.x)) continue;
    const members = carried.filter(node => node !== hub && placed(node) && under(node.directoryPath ?? node.codeRelativePath, hub.directoryPath!)) as Array<SpatialGraphNode & Placed>;
    if (!members.length) continue;
    hub.x = members.reduce((sum, node) => sum + node.x, 0) / members.length;
    hub.y = members.reduce((sum, node) => sum + node.y, 0) / members.length;
    hub.z = members.reduce((sum, node) => sum + node.z, 0) / members.length;
  }
  return carried;
}

const positionsOf = (nodes: readonly SpatialNode[]): Map<string, Placed> =>
  new Map(nodes.filter(placed).map(node => [node.id, { x: node.x, y: node.y, z: node.z }]));

/**
 * Settle the full picture, then toggle the given files out and back in for the given number of cycles, each change a
 * full reheat of the page's forces from the carried positions, and measure the picture after every restore.
 */
export function measureDrift(graph: ExplorerGraphPayload, include: (node: ExplorerNodePayload) => boolean, toggled: (node: ExplorerNodePayload) => boolean,
  tuning: ForceGraphTuning, layout: SpatialLayout, cycles: number, ticks: number): DriftReport {
  if (!Number.isInteger(cycles) || cycles < 1) throw new Error("Drift needs at least one cycle.");
  const full = spatialGraphOf(graph, include, [], layout);
  const reduced = spatialGraphOf(graph, node => include(node) && !toggled(node), [], layout);
  const toggledIds = new Set(full.nodes.filter(node => !reduced.nodes.some(other => other.id === node.id)).map(node => node.id));
  if (toggledIds.size === 0 && graph.nodes.some(node => include(node) && toggled(node))) throw new Error("The toggle names files the picture does not hold.");
  const unchangedIds = full.nodes.filter(node => !toggledIds.has(node.id)).map(node => node.id);
  const settle = (nodes: SpatialNode[], links: readonly SpatialLink[]): Map<string, Placed> =>
    positionsOf(simulateSpatialLayout(nodes, links, tuning, ticks, layout).nodes);
  let positions = settle(full.nodes.map(node => ({ ...node })), full.links);
  const start = { extent: extentOf([...positions.values()]), diagonal: diagonalOf([...positions.values()]) };
  const report: DriftReport = { layout, tuning, ticks, toggled: toggledIds.size, total: full.nodes.length, start, cycles: [] };
  for (let cycle = 1; cycle <= cycles; cycle++) {
    const before = positions;
    const removed = settle(carryPositions(reduced.nodes, positions), reduced.links);
    positions = settle(carryPositions(full.nodes, new Map([...positions, ...removed])), full.links);
    const moves = unchangedIds.map(id => {
      const was = before.get(id)!, is = positions.get(id)!;
      return Math.hypot(is.x - was.x, is.y - was.y, is.z - was.z);
    });
    report.cycles.push({
      cycle,
      extent: extentOf([...positions.values()]),
      diagonal: diagonalOf([...positions.values()]),
      meanMoveOfUnchanged: moves.reduce((sum, move) => sum + move, 0) / Math.max(1, moves.length),
      greatestMoveOfUnchanged: moves.length ? Math.max(...moves) : 0
    });
  }
  return report;
}

/** A table a person reads: one row per setting, the extent's growth across the cycles and the unchanged spheres' moves. */
export function renderDriftReports(reports: readonly DriftReport[], title: string): string {
  const fixed = (number: number): string => number.toFixed(1);
  const lines = [`# ${title}`, "", `Historical layout-lab measurement, ${new Date().toISOString()}. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change a full reheat from the carried positions, as the page does today. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles.`, ""];
  lines.push("| Layout | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |");
  for (const report of reports) {
    const last = report.cycles[report.cycles.length - 1];
    const meanMove = report.cycles.reduce((sum, cycle) => sum + cycle.meanMoveOfUnchanged, 0) / report.cycles.length;
    const greatest = Math.max(...report.cycles.map(cycle => cycle.greatestMoveOfUnchanged));
    lines.push(`| ${report.layout} | ${report.tuning.gravity} | ${report.tuning.chargeRange || "unbounded"} | ${report.total} (${report.toggled}) | ${fixed(report.start.extent)} | ${report.cycles.map(cycle => fixed(cycle.extent)).join(", ")} | ${(last.extent / report.start.extent).toFixed(2)}× | ${fixed(meanMove)} | ${fixed(greatest)} |`);
  }
  return lines.join("\n") + "\n";
}
