/**
 * The signals the lab scores a layout on, each a number the deck also reads
 * from the page or that the scene knows outright: the wires' length in its
 * parts, the crossings by the deck's own count, the samples over membranes
 * that hold neither end, the wires that escape the membrane holding both
 * their ends, the lanes, the picture's size, and the exact placement's
 * measure.
 *
 * @module layout-lab/signals
 */
import type { Route } from "./routes";
import type { Scene } from "../../packages/explorer/src/client/views/localView/branch-scene";
import type { BranchGraph } from "../../packages/explorer/src/client/views/localView/branches";
import { membraneOutline } from "../../packages/explorer/src/client/views/localView/membrane-outline";
import { parentDirectory } from "../../packages/explorer/src/client/views/membraneView/pin-layout";
import { crossings, type CrossingScore, type Polyline } from "../../tests/e2e/still-picture-geometry";

/** The signals of one layout. */
export interface Signals {
  wires: number;
  lengthPx: number;
  meanPx: number;
  horizontalPx: number;
  verticalPx: number;
  crossings: CrossingScore;
  /** Samples of wires inside a membrane that holds neither of their ends, and the wires with any. */
  foreignSamples: number;
  foreignWires: number;
  samples: number;
  laneSamples: number;
  /** Wires whose two ends one membrane holds and that leave it anywhere, and their samples outside. */
  escapingWires: number;
  escapingSamples: number;
  /** Lane runs over all wires, and the wires that run through any lane. */
  passages: number;
  threaded: number;
  /** References read against the columns. */
  backward: number;
  columns: number;
  lanes: number;
  pictureWidth: number;
  pictureHeight: number;
  placementCost: number;
  optimal: boolean;
  /**
   * How far the files' own directories are broken up in the columns: for each directory in each column, its runs of
   * neighbouring cards beyond the first, summed. Zero when every directory's cards stand together in every column, as
   * the membranes keep them; counted on the files' real directories whatever membranes the layout drew.
   */
  fragments: number;
}

interface Membrane {
  directory: string;
  points: ReadonlyArray<{ x: number; y: number }>;
  box: { left: number; top: number; right: number; bottom: number };
}

const folderOf = (id: string): string => (id.lastIndexOf("/") < 0 ? "" : id.slice(0, id.lastIndexOf("/")));
const under = (directory: string, file: string): boolean => directory === "" || folderOf(file) === directory || folderOf(file).startsWith(`${directory}/`);

/** Whether a point lies inside a polygon, by the even-odd rule. */
export function insidePolygon(points: ReadonlyArray<{ x: number; y: number }>, x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** The runs beyond the first that each directory's cards form in each column, summed: how far the directories interleave. */
export function fragmentsOf(columns: ReadonlyArray<ReadonlyArray<{ codeRelativePath: string }>>): number {
  let fragments = 0;
  for (const column of columns) {
    const runs = new Map<string, number>();
    let previous: string | null = null;
    for (const file of column) {
      const directory = parentDirectory(file.codeRelativePath);
      if (directory !== previous) runs.set(directory, (runs.get(directory) ?? 0) + 1);
      previous = directory;
    }
    for (const count of runs.values()) fragments += count - 1;
  }
  return fragments;
}

/** Every signal of a laid-out scene and its routes. */
export function measureScene(scene: Scene, branches: BranchGraph, routes: readonly Route[]): Signals {
  const membranes: Membrane[] = scene.boxes.filter(box => box.kind === "directory").map(box => ({
    directory: box.directory,
    points: membraneOutline(box.segments),
    box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom }
  }));
  const inMembrane = (membrane: Membrane, x: number, y: number): boolean =>
    x >= membrane.box.left && x <= membrane.box.right && y >= membrane.box.top && y <= membrane.box.bottom && insidePolygon(membrane.points, x, y);
  const lanes = [...scene.lanes.values()].map(box => box.segments[0]);
  let lengthPx = 0, horizontalPx = 0, verticalPx = 0, samples = 0, laneSamples = 0, foreignSamples = 0, foreignWires = 0, escapingSamples = 0, escapingWires = 0, passages = 0, threaded = 0;
  for (const route of routes) {
    lengthPx += route.lengthPx;
    horizontalPx += route.horizontalPx;
    verticalPx += route.verticalPx;
    passages += route.passages;
    if (route.passages) threaded++;
    // The membrane holding both ends: the deepest drawn directory over both.
    const holding = membranes.filter(membrane => under(membrane.directory, route.consumer) && under(membrane.directory, route.provider))
      .sort((a, b) => b.directory.length - a.directory.length)[0];
    let foreign = 0, escaping = 0;
    for (const point of route.samples) {
      samples++;
      if (lanes.some(lane => point.x >= lane.left && point.x <= lane.right && point.y >= lane.top && point.y <= lane.bottom)) laneSamples++;
      if (membranes.some(membrane => !under(membrane.directory, route.consumer) && !under(membrane.directory, route.provider) && inMembrane(membrane, point.x, point.y))) foreign++;
      if (holding && !inMembrane(holding, point.x, point.y)) escaping++;
    }
    foreignSamples += foreign;
    if (foreign) foreignWires++;
    escapingSamples += escaping;
    if (escaping) escapingWires++;
  }
  const polylines: Polyline[] = routes.map(route => ({ id: route.key, points: route.samples.map(point => [point.x, point.y] as const) }));
  return {
    wires: routes.length,
    lengthPx: Math.round(lengthPx),
    meanPx: routes.length ? Math.round(lengthPx / routes.length) : 0,
    horizontalPx: Math.round(horizontalPx),
    verticalPx: Math.round(verticalPx),
    crossings: crossings(polylines),
    foreignSamples,
    foreignWires,
    samples,
    laneSamples,
    escapingWires,
    escapingSamples,
    passages,
    threaded,
    backward: branches.back.size,
    columns: scene.columnCount,
    lanes: scene.lanes.size,
    pictureWidth: scene.pictureWidth,
    pictureHeight: scene.pictureHeight,
    placementCost: scene.placement.cost,
    optimal: scene.placement.optimal,
    fragments: fragmentsOf(branches.columns)
  };
}
