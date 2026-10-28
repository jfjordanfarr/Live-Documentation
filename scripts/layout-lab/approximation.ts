/**
 * The approximation of the 3D Local Map's repulsion, measured headlessly (2026-10-28).
 *
 * On 2026-10-27 the T3 bundle's 3D view froze: one exact evaluation of its 21,720 spheres took 2.2 seconds and the first
 * tick fifteen of them (`AI-Agent-Workspace/Probes/2026-10-27/t3-code/3d-startup.md`). The owner decided the next day that
 * an approximation, the field's `approximation` lever, may be the default with the exact sum kept as the oracle. This
 * module measures what each setting of the lever buys and costs against that oracle, on the page's own data, field and
 * motion: what one evaluation takes at D3's seed of a large bundle, how far the approximated forces stand from the exact
 * ones, at that seed and at the exact field's rest, and what the pictures eased to rest from one seed under each setting
 * look like beside the exact one's, in the ticks, the overlaps, the size and the place of every sphere.
 *
 * @module layout-lab/approximation
 */
import { forceSimulation, type SimulationNodeDatum } from "d3-force-3d";
import { performance } from "node:perf_hooks";

import { includeNode, scopePins } from "./evaluate";
import { retainedSubject, type ScopeRun } from "./scopes";
import { spatialReport } from "./spatial";
import { applyLayoutSettings } from "../../packages/explorer/src/client/layout-presets";
import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultFilters, getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ForceGraphTuning, SpatialLayout } from "../../packages/explorer/src/client/types";
import { spatialGraphOf, type SpatialGraphNode } from "../../packages/explorer/src/client/views/forceGraphData";
import { easeSpatialLayout, spatialFieldOf, type SpatialLink, type SpatialNode } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { diagonalOf, SpatialField } from "../../packages/explorer/src/client/views/forceGraphPhysics";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** A picture of a large bundle as a saved address shows it in 3D: every sphere it simulates, the links, and the forces. */
export interface SavedPicture {
  nodes: SpatialGraphNode[];
  links: SpatialLink[];
  tuning: ForceGraphTuning;
  layout: SpatialLayout;
}

/**
 * The 3D picture a saved address shows of a bundle: the file-type filters it names, with the files it selects, pins or
 * asks a path to kept whatever their type, as the page keeps them, every other file simulated; and its layout settings
 * over the defaults.
 */
export function savedPicture(data: StaticExplorerData, address: string): SavedPicture {
  const state = new URL(address).searchParams.get("s");
  const snapshot = state ? decompressSnapshot(state) : null;
  if (!snapshot) throw new Error("The saved address carries no state the Explorer can read.");
  const graph = explorerGraphOf(data.graph);
  const kept = new Set([...snapshot.pinSet.entries.map(pin => pin.nodeId), ...(snapshot.selectedNodeId ? [snapshot.selectedNodeId] : []),
    ...(snapshot.destination?.kind === "file" ? [snapshot.destination.nodeId] : [])]);
  const picture = spatialGraphOf(graph, node => {
    if (kept.has(node.id)) return true;
    const archetype = (node.archetype || "").toLowerCase();
    return !(archetype === "test" && !snapshot.filters.showTests || archetype === "asset" && !snapshot.filters.showAssets);
  }, [], snapshot.spatialLayout);
  return { nodes: picture.nodes, links: picture.links, tuning: applyLayoutSettings(getDefaultTuning(), snapshot.layout).forceGraph, layout: snapshot.spatialLayout };
}

/** A sphere of the picture with the place D3 seated it at. */
type Seated = SpatialGraphNode & SimulationNodeDatum;

/** The first `count` spheres of a picture with the links among them, where D3 seats a first picture. */
export function seatedPrefix(picture: SavedPicture, count: number): { nodes: Seated[]; links: SpatialLink[]; positions: Float64Array } {
  const nodes: Seated[] = picture.nodes.slice(0, count).map(node => ({ ...node }));
  const ids = new Set(nodes.map(node => node.id));
  const end = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;
  const links = picture.links.filter(link => ids.has(end(link.source)) && ids.has(end(link.target)));
  forceSimulation(nodes, 3).stop();
  return { nodes, links, positions: Float64Array.from(nodes.flatMap(node => [node.x!, node.y!, node.z!])) };
}

/** What one evaluation of the field took at one setting, the median of several after one to warm the engine. */
export interface EvaluationTiming {
  spheres: number;
  links: number;
  approximation: number;
  ms: number;
  runs: number;
  stiffness: number;
  overlaps: number;
}

/** Time one evaluation of each setting's field over the same seated spheres. */
export function timeEvaluations(picture: SavedPicture, counts: readonly number[], approximations: readonly number[], runs: number): EvaluationTiming[] {
  const rows: EvaluationTiming[] = [];
  for (const count of counts) {
    const { nodes, links, positions } = seatedPrefix(picture, Math.min(count, picture.nodes.length));
    for (const approximation of [0, ...approximations]) {
      const field = spatialFieldOf(nodes, links, { ...picture.tuning, approximation }, picture.layout), out = new Float64Array(positions.length);
      field.forces(positions, out);
      const times: number[] = [];
      let reading = field.forces(positions, out);
      // The exact sum of a large picture takes seconds; three runs of it are enough for a median.
      const repeats = approximation === 0 && nodes.length > 10_000 ? Math.min(runs, 3) : runs;
      for (let run = 0; run < repeats; run++) {
        const started = performance.now();
        reading = field.forces(positions, out);
        times.push(performance.now() - started);
      }
      times.sort((a, b) => a - b);
      rows.push({ spheres: nodes.length, links: links.length, approximation, ms: times[times.length >> 1], runs: repeats, stiffness: reading.stiffness, overlaps: reading.overlaps });
    }
  }
  return rows;
}

/** One first tick as the page takes it: the field built, the motion begun from D3's seed, one tick, every evaluation counted. */
export interface FirstTick {
  spheres: number;
  approximation: number;
  evaluations: number;
  ms: number;
}

/**
 * The page's first tick of a whole picture at one setting, through the headless twin of the page: the evaluations are
 * counted by wrapping the field's one entry for the length of the tick, and the wrapper is removed after it.
 */
export function firstTick(picture: SavedPicture, approximation: number): FirstTick {
  // Every evaluation begins once, whole or in parts (the pacing, 2026-10-28), so the beginnings are the count.
  const original = SpatialField.prototype.begin;
  let evaluations = 0;
  SpatialField.prototype.begin = function (this: SpatialField, ...args: Parameters<typeof original>) { evaluations++; return original.apply(this, args); };
  try {
    const started = performance.now();
    easeSpatialLayout(picture.nodes, picture.links, { ...picture.tuning, approximation }, picture.layout, { maxTicks: 1 });
    return { spheres: picture.nodes.length, approximation, evaluations, ms: performance.now() - started };
  } finally {
    SpatialField.prototype.begin = original;
  }
}

/** How far a setting's forces stand from the exact ones at some positions, measured against the exact repulsion's own. */
export interface ForceError {
  subject: string;
  spheres: number;
  approximation: number;
  /** The root of the summed squared errors over the summed squared exact repulsions. */
  relativeRms: number;
  /** The greatest error of any one sphere over that sphere's exact repulsion. */
  maxRelative: number;
  /** The greatest error of any one sphere over the exact repulsions' root mean square: the worst sphere against the scale of the forces. */
  maxOfScale: number;
}

/**
 * The error of each setting's forces at these positions. The approximation changes the repulsion alone, so the error is
 * the whole field's difference from the exact field's, and its measure is the exact repulsion, the exact field less the
 * same field without charge: at a picture at rest the whole field's forces nearly vanish and would measure nothing.
 */
export function forceErrors(subject: string, nodes: readonly SpatialGraphNode[], links: readonly SpatialLink[], positions: Float64Array, tuning: ForceGraphTuning, layout: SpatialLayout, approximations: readonly number[]): ForceError[] {
  const forcesAt = (settings: ForceGraphTuning): Float64Array => {
    const out = new Float64Array(positions.length);
    spatialFieldOf<SpatialNode>(nodes, links, settings, layout).forces(positions, out);
    return out;
  };
  const exact = forcesAt({ ...tuning, approximation: 0 }), uncharged = forcesAt({ ...tuning, approximation: 0, charge: 0 });
  const repulsion = exact.map((value, k) => value - uncharged[k]);
  const length = (vector: Float64Array, i: number): number => Math.hypot(vector[3 * i], vector[3 * i + 1], vector[3 * i + 2]);
  let scale = 0;
  for (let i = 0; i < nodes.length; i++) scale += length(repulsion, i) ** 2;
  return approximations.map(approximation => {
    const approximate = forcesAt({ ...tuning, approximation }), error = approximate.map((value, k) => value - exact[k]);
    let squared = 0, maxRelative = 0, maxError = 0;
    for (let i = 0; i < nodes.length; i++) {
      const own = length(error, i);
      squared += own * own;
      maxError = Math.max(maxError, own);
      maxRelative = Math.max(maxRelative, own / length(repulsion, i));
    }
    return { subject, spheres: nodes.length, approximation, relativeRms: Math.sqrt(squared / scale), maxRelative, maxOfScale: maxError / Math.sqrt(scale / nodes.length) };
  });
}

/** A picture eased to rest from D3's seed at one setting, beside the exact field's rest from the same seed. */
export interface RestPicture {
  bundle: string;
  layout: SpatialLayout;
  approximation: number;
  spheres: number;
  ticks: number;
  still: boolean;
  /** Pairs of spheres that interpenetrate, and the deepest, as the lab's spatial report counts them. */
  overlaps: number;
  worstOverlap: number;
  bounds: { width: number; height: number; depth: number };
  /** The wall time of the headless easing, the report around it included. */
  ms: number;
  /** Each sphere's distance from where the exact field's rest put it, as a share of that picture's diagonal. */
  meanShift: number;
  maxShift: number;
}

/**
 * How exactly the motion settles the exact field's picture: the exact rest eased again, held where it stopped as the page
 * holds a picture it moves again, and how far its spheres go. A rest that stops when every sphere moves less than a share
 * of the diagonal a tick is only that sure of where the spheres belong, and a setting that moves them less than this moves
 * them within the motion's own resolution.
 */
export interface RestResolution {
  bundle: string;
  layout: SpatialLayout;
  ticks: number;
  still: boolean;
  meanShift: number;
  maxShift: number;
}

/**
 * Ease the page's cold-start picture of a scope's bundle (tests shown, assets hidden) to rest at each setting, from the
 * same seed, and compare each rest with the exact field's, beside the exact rest eased again as the measure of how surely
 * the motion places a sphere. The exact rest's positions are returned too, for the error of the forces at rest.
 */
export function restPictures(graph: ExplorerGraphPayload, run: ScopeRun, tuning: ForceGraphTuning, layout: SpatialLayout, approximations: readonly number[], maxTicks: number):
  { rows: RestPicture[]; resolution: RestResolution; rest: { nodes: SpatialGraphNode[]; links: SpatialLink[]; positions: Float64Array } } {
  const filters = getDefaultFilters();
  const ease = (approximation: number) => {
    const started = performance.now();
    const report = spatialReport(graph, run, { ...tuning, approximation }, maxTicks, filters, [], layout);
    return { report, ms: performance.now() - started };
  };
  const exact = ease(0);
  const places = (report: typeof exact.report): Float64Array => Float64Array.from(report.nodes.flatMap(node => [node.x, node.y, node.z]));
  const exactPlaces = places(exact.report), diagonal = diagonalOf(exactPlaces);
  const shiftsFrom = (at: Float64Array): number[] => Array.from({ length: at.length / 3 }, (_, i) => Math.hypot(at[3 * i] - exactPlaces[3 * i], at[3 * i + 1] - exactPlaces[3 * i + 1], at[3 * i + 2] - exactPlaces[3 * i + 2]) / diagonal);
  const rows = [0, ...approximations].map(approximation => {
    const eased = approximation === 0 ? exact : ease(approximation), at = places(eased.report);
    if (eased.report.nodes.some((node, i) => node.id !== exact.report.nodes[i].id)) throw new Error("The pictures of two settings hold different spheres.");
    const shifts = shiftsFrom(at);
    return {
      bundle: run.bundle, layout, approximation, spheres: eased.report.nodes.length, ticks: eased.report.ticks, still: eased.report.still,
      overlaps: eased.report.overlaps, worstOverlap: eased.report.worstOverlap, bounds: eased.report.bounds, ms: eased.ms,
      meanShift: shifts.reduce((sum, shift) => sum + shift, 0) / shifts.length, maxShift: Math.max(...shifts)
    };
  });
  // The forces at rest are read, and the rest eased again, over the very spheres and links the report simulated, in its order.
  const data = spatialGraphOf(graph, includeNode(scopePins(run), retainedSubject(run), filters), [], layout);
  if (data.nodes.length !== exact.report.nodes.length || data.nodes.some((node, i) => node.id !== exact.report.nodes[i].id)) throw new Error("The picture at rest is not the one the report eased.");
  const placed = data.nodes.map((node, i) => ({ ...node, x: exactPlaces[3 * i], y: exactPlaces[3 * i + 1], z: exactPlaces[3 * i + 2] }));
  const again = easeSpatialLayout(placed, data.links, { ...tuning, approximation: 0 }, layout, { start: "hold", maxTicks });
  const againShifts = shiftsFrom(Float64Array.from(again.nodes.flatMap(node => [node.x!, node.y!, node.z!])));
  const resolution = { bundle: run.bundle, layout, ticks: again.ticks, still: again.still, meanShift: againShifts.reduce((sum, shift) => sum + shift, 0) / againShifts.length, maxShift: Math.max(...againShifts) };
  return { rows, resolution, rest: { nodes: data.nodes, links: data.links, positions: exactPlaces } };
}

/** Everything one run measured, for the report and its JSON companion. */
export interface ApproximationReport {
  measuredAt: string;
  large?: { label: string; spheres: number; links: number; tuning: ForceGraphTuning; layout: SpatialLayout; timings: EvaluationTiming[]; firstTick?: FirstTick; errors: ForceError[] };
  scopes: string[];
  tuning: ForceGraphTuning;
  maxTicks: number;
  errors: ForceError[];
  rests: RestPicture[];
  resolutions: RestResolution[];
}

const fixed = (value: number, digits = 1): string => value.toFixed(digits);
const percent = (share: number): string => `${(100 * share).toPrecision(2)}%`;
const setting = (approximation: number): string => approximation === 0 ? "0 (exact)" : approximation < 1e-6 ? `${approximation} (every cell opened)` : String(approximation);

/** The tables a person reads, with the run's settings beside them. */
export function renderApproximationReport(report: ApproximationReport): string {
  const lines = [`# 3D Local Map: the repulsion's approximation measured`, "", `Historical layout-lab measurement, ${report.measuredAt}. Every number is of the code as it stood then; the JSON companion holds them all.`, ""];
  if (report.large) {
    const large = report.large;
    lines.push(`## One evaluation at D3's seed: ${large.label}`, "", `${large.spheres.toLocaleString("en-US")} spheres and ${large.links.toLocaleString("en-US")} links in the ${large.layout} layout; settings \`${JSON.stringify(large.tuning)}\`. The first spheres of the picture with the links among them, seated where D3 seats a first picture; the median of the runs after one to warm the engine.`, "");
    lines.push("| Spheres | Approximation | Milliseconds | Runs | Stiffness | Overlaps |", "| ---: | --- | ---: | ---: | ---: | ---: |");
    for (const row of large.timings) lines.push(`| ${row.spheres.toLocaleString("en-US")} | ${setting(row.approximation)} | ${fixed(row.ms)} | ${row.runs} | ${fixed(row.stiffness)} | ${row.overlaps.toLocaleString("en-US")} |`);
    if (large.firstTick) lines.push("", `The first tick of the whole picture at approximation ${large.firstTick.approximation}, as the page takes it (the field built, the motion begun, one tick): ${large.firstTick.evaluations} evaluations in ${fixed(large.firstTick.ms / 1000, 2)} s.`);
    lines.push("");
  }
  lines.push("## The forces' error against the exact sum", "", "The approximation changes the repulsion alone, so the error of a setting is its field's difference from the exact field's, measured against the exact repulsion. Relative RMS is the root of the summed squared errors over the summed squared repulsions; the greatest is the worst sphere's error over its own repulsion, and over the repulsions' root mean square.", "");
  lines.push("| Picture | Spheres | Approximation | Relative RMS | Greatest, own | Greatest, of the scale |", "| --- | ---: | --- | ---: | ---: | ---: |");
  for (const row of [...report.large?.errors ?? [], ...report.errors]) lines.push(`| ${row.subject} | ${row.spheres.toLocaleString("en-US")} | ${setting(row.approximation)} | ${row.relativeRms.toPrecision(3)} | ${row.maxRelative.toPrecision(3)} | ${row.maxOfScale.toPrecision(3)} |`);
  lines.push("", "## Pictures eased to rest from one seed", "", `The page's cold-start picture of each bundle (tests shown, assets hidden), eased headlessly as the page eases a first picture until still or ${report.maxTicks.toLocaleString("en-US")} ticks, at each setting from the same seed; settings \`${JSON.stringify({ ...report.tuning, approximation: undefined })}\`. The shift is each sphere's distance from where the exact field's rest put it, over that picture's diagonal; overlaps are pairs of spheres that interpenetrate. Two rows measure noise: the exact sum taken in another order, every cell of the tree opened, and the exact rest eased again from where it stopped, held there, which is how surely the motion's stillness places a sphere at all.`, "");
  lines.push("| Bundle | Layout | Approximation | Spheres | Ticks to still | Overlaps | Deepest | Bounds | Seconds | Mean shift | Greatest shift |", "| --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |");
  for (const row of report.rests) {
    lines.push(`| ${row.bundle} | ${row.layout} | ${setting(row.approximation)} | ${row.spheres} | ${row.still ? row.ticks : `not still after ${row.ticks}`} | ${row.overlaps} | ${fixed(row.worstOverlap, 2)} | ${fixed(row.bounds.width)} × ${fixed(row.bounds.height)} × ${fixed(row.bounds.depth)} | ${fixed(row.ms / 1000, 1)} | ${percent(row.meanShift)} | ${percent(row.maxShift)} |`);
    const resolution = report.resolutions.find(found => found.bundle === row.bundle && found.layout === row.layout);
    if (row.approximation === 0 && resolution) lines.push(`| ${row.bundle} | ${row.layout} | 0, its rest eased again | ${row.spheres} | ${resolution.still ? resolution.ticks : `not still after ${resolution.ticks}`} | | | | | ${percent(resolution.meanShift)} | ${percent(resolution.maxShift)} |`);
  }
  return lines.join("\n") + "\n";
}

/** The subject a scope's rows of error are reported under: its bundle's picture in a layout, at the exact field's rest. */
export const restSubject = (run: ScopeRun, layout: SpatialLayout): string => `${run.bundle} ${layout} at rest`;
