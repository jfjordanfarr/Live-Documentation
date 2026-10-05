import { computeDirectoryBands, type DirectoryBand, type FlowNode } from "../membraneView/pin-layout";

/**
 * Orders a ranked exploration so that its wires cross as little as the
 * directory bands allow, and finds a lane for every wire that passes through
 * a column it neither starts nor ends in.
 *
 * Pure-function module: no DOM. The columns come from the ranking; the bands
 * come from the Membrane Map's band computation; this module decides the order
 * of band rows, the order of files within a band, and where the threaded wires
 * pass. A barycenter sweep walks the columns left to right and then right to
 * left, each column ordered against the one just settled, and the order with
 * the fewest crossings between adjacent columns is kept.
 *
 * @module branch-order
 */

/** A reference that reads forward, from a provider's column to a consumer's column to its right. */
export interface ForwardReference {
  /** The edge's key, by which the renderer finds its lanes. */
  key: string;
  provider: string;
  consumer: string;
  /** Where on the provider's card the wire leaves, as a fraction of the card's rows from the top. */
  providerRow: number;
  /** Where on the consumer's card the wire arrives, as a fraction of the card's rows from the top. */
  consumerRow: number;
}

/** What the ordering takes: the ranked columns, each file's directory, and the forward references with their heights on the cards. */
export interface OrderInput {
  /** The files of each column, left to right, in any order. */
  columns: readonly (readonly string[])[];
  directoryOf: (id: string) => string;
  edges: readonly ForwardReference[];
  /** How many left-and-right sweeps to try; the best order seen is kept. Zero keeps the starting order. */
  sweeps?: number;
}

/** A gap in a column through which threaded wires pass: after the named file, or above the first file when `after` is null. */
export interface Lane {
  key: string;
  column: number;
  after: string | null;
  /** The keys of the edges that pass here, top to bottom. */
  edges: string[];
}

/** The chosen order: the bands as rows and lists, the columns top to bottom, the lanes, each threaded reference's passages, and the crossings. */
export interface BranchOrder {
  /** The bands, their rows and their file lists in the chosen order. */
  bands: DirectoryBand[];
  /** The files of each column, top to bottom. */
  columns: string[][];
  /** The lanes, keyed as `Lane.key`. */
  lanes: Map<string, Lane>;
  /** For each edge and each column it passes through (`${edge}\0${column}`), its lane and its place in it. */
  passages: Map<string, { lane: string; index: number }>;
  /** Wire crossings between adjacent columns in the chosen order, counting a threaded wire's segments. */
  crossings: number;
}

interface Segment {
  a: string;
  b: string;
  aRow: number;
  bRow: number;
  column: number;
}

interface Virtual {
  id: string;
  column: number;
  edge: string;
}

const LANE_FRACTION = 0.5;

/**
 * Orders a ranked exploration and reserves its lanes: the band rows and the
 * files within them by a barycenter sweep that keeps the fewest crossings, and
 * a lane through every column a reference skips. See the module note.
 */
export function orderBranches(input: OrderInput): BranchOrder {
  const columnOf = new Map<string, number>();
  input.columns.forEach((files, column) => files.forEach(id => columnOf.set(id, column)));
  const virtuals: Virtual[] = [];
  const segments: Segment[] = [];
  for (const edge of input.edges) {
    const a = columnOf.get(edge.provider), b = columnOf.get(edge.consumer);
    if (a === undefined || b === undefined || b <= a) continue;
    let previous = edge.provider, previousRow = edge.providerRow;
    for (let column = a + 1; column < b; column++) {
      const id = `\0${edge.key}\0${column}`;
      virtuals.push({ id, column, edge: edge.key });
      segments.push({ a: previous, b: id, aRow: previousRow, bRow: LANE_FRACTION, column: column - 1 });
      previous = id;
      previousRow = LANE_FRACTION;
    }
    segments.push({ a: previous, b: edge.consumer, aRow: previousRow, bRow: edge.consumerRow, column: b - 1 });
  }
  const virtualsByColumn = new Map<number, Virtual[]>();
  for (const virtual of virtuals) (virtualsByColumn.get(virtual.column) ?? virtualsByColumn.set(virtual.column, []).get(virtual.column)!).push(virtual);
  const virtualById = new Map(virtuals.map(virtual => [virtual.id, virtual]));

  const flow = new Map<string, FlowNode>();
  input.columns.forEach((files, column) => files.forEach(id => flow.set(id, { id, column, role: "pinned", directory: input.directoryOf(id) })));
  const columnCount = input.columns.length;

  let bands = computeDirectoryBands(flow);
  const keys = new Map<string, number>();
  const keyOf = (id: string): number | undefined => keys.get(id);
  let merged = walkColumns(bands, columnCount).map((files, column) => mergeColumn(files, virtualsByColumn.get(column) ?? [], keyOf));
  let positions = positionsOf(merged);
  let best = { bands, merged, crossings: countCrossings(segments, positions) };

  const sweeps = input.sweeps ?? 4;
  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (const side of ["left", "right"] as const) {
      // A pass settles columns one at a time in place; the best snapshot must not share its arrays with it.
      merged = merged.map(sequence => [...sequence]);
      const order = side === "left"
        ? Array.from({ length: Math.max(0, columnCount - 1) }, (_, i) => i + 1)
        : Array.from({ length: Math.max(0, columnCount - 1) }, (_, i) => columnCount - 2 - i);
      for (const column of order) {
        const bary = barycenters(segments, positions, side, column);
        for (const id of merged[column]) keys.set(id, bary.get(id) ?? positions.get(id) ?? 0);
        bands = reorderColumn(bands, column, keyOf);
        merged[column] = mergeColumn(walkColumns(bands, columnCount)[column], virtualsByColumn.get(column) ?? [], keyOf);
        merged[column].forEach((id, index) => positions.set(id, index));
      }
      // Band rows are shared by every column, so they are settled once per pass, from where every member's wires lead.
      const neighbours = neighbourMeans(segments, positions);
      bands = repackRows(bands, id => neighbours.get(id) ?? positions.get(id) ?? 0);
      merged = walkColumns(bands, columnCount).map((files, column) => mergeColumn(files, virtualsByColumn.get(column) ?? [], keyOf));
      positions = positionsOf(merged);
      const crossings = countCrossings(segments, positions);
      if (crossings < best.crossings) best = { bands, merged: merged.map(sequence => [...sequence]), crossings };
    }
  }

  const lanes = new Map<string, Lane>();
  const passages = new Map<string, { lane: string; index: number }>();
  best.merged.forEach((sequence, column) => {
    let after: string | null = null;
    for (const id of sequence) {
      const virtual = virtualById.get(id);
      if (!virtual) { after = id; continue; }
      const key = `${column}\0${after ?? ""}`;
      const lane = lanes.get(key) ?? lanes.set(key, { key, column, after, edges: [] }).get(key)!;
      passages.set(`${virtual.edge}\0${column}`, { lane: key, index: lane.edges.length });
      lane.edges.push(virtual.edge);
    }
  });
  return {
    bands: best.bands,
    columns: best.merged.map(sequence => sequence.filter(id => !virtualById.has(id))),
    lanes,
    passages,
    crossings: best.crossings
  };
}

/** The files of every column, top to bottom, as the bands' rows and lists lay them. */
export function walkColumns(bands: readonly DirectoryBand[], columnCount: number): string[][] {
  const columns: string[][] = Array.from({ length: columnCount }, () => []);
  const walk = (siblings: readonly DirectoryBand[]): void => {
    for (const band of [...siblings].sort((x, y) => x.bandRow - y.bandRow)) {
      if (band.children.length) walk(band.children);
      for (const [column, ids] of band.nodesByColumn) columns[column]?.push(...ids);
    }
  };
  walk(bands);
  return columns;
}

/** The bands with one column's file lists sorted by key, ties alphabetical; rows untouched. */
function reorderColumn(bands: readonly DirectoryBand[], column: number, key: (id: string) => number | undefined): DirectoryBand[] {
  const value = (id: string): number => key(id) ?? 0;
  return bands.map(band => {
    const ids = band.nodesByColumn.get(column);
    return {
      ...band,
      children: band.children.length ? reorderColumn(band.children, column, key) : band.children,
      nodesByColumn: ids
        ? new Map([...band.nodesByColumn, [column, [...ids].sort((a, b) => value(a) - value(b) || a.localeCompare(b))]])
        : band.nodesByColumn
    };
  });
}

/**
 * Sorts every level of the band tree by the mean key of its members and packs
 * the siblings into rows in that order; bands whose columns do not overlap may
 * share a row. Ties keep the directories' alphabetical order.
 */
export function repackRows(bands: readonly DirectoryBand[], key: (id: string) => number): DirectoryBand[] {
  const mean = (ids: readonly string[]): number => ids.reduce((sum, id) => sum + key(id), 0) / Math.max(1, ids.length);
  const ordered = bands
    .map(band => ({ ...band, children: band.children.length ? repackRows(band.children, key) : band.children }))
    .sort((x, y) => mean(x.allNodeIds) - mean(y.allNodeIds) || x.directory.localeCompare(y.directory));
  const rows: Array<Array<[number, number]>> = [];
  return ordered.map(band => {
    let row = rows.findIndex(taken => taken.every(([min, max]) => band.minColumn > max || band.maxColumn < min));
    if (row < 0) { row = rows.length; rows.push([]); }
    rows[row].push([band.minColumn, band.maxColumn]);
    return { ...band, bandRow: row };
  });
}

/** For the nodes of one column, the mean position of what they are wired to in the column on the given side. */
function barycenters(segments: readonly Segment[], positions: ReadonlyMap<string, number>, side: "left" | "right", column: number): Map<string, number> {
  const sums = new Map<string, { sum: number; count: number }>();
  for (const segment of segments) {
    if (segment.column !== (side === "left" ? column - 1 : column)) continue;
    const [node, neighbour, neighbourRow] = side === "left" ? [segment.b, segment.a, segment.aRow] : [segment.a, segment.b, segment.bRow];
    const position = positions.get(neighbour);
    if (position === undefined) continue;
    const entry = sums.get(node) ?? sums.set(node, { sum: 0, count: 0 }).get(node)!;
    entry.sum += position + neighbourRow;
    entry.count += 1;
  }
  return new Map([...sums].map(([id, { sum, count }]) => [id, sum / count]));
}

/** Every node's mean neighbour position over all its wires, on both sides. */
function neighbourMeans(segments: readonly Segment[], positions: ReadonlyMap<string, number>): Map<string, number> {
  const sums = new Map<string, { sum: number; count: number }>();
  const add = (node: string, neighbour: string, row: number): void => {
    const position = positions.get(neighbour);
    if (position === undefined) return;
    const entry = sums.get(node) ?? sums.set(node, { sum: 0, count: 0 }).get(node)!;
    entry.sum += position + row;
    entry.count += 1;
  };
  for (const segment of segments) { add(segment.a, segment.b, segment.bRow); add(segment.b, segment.a, segment.aRow); }
  return new Map([...sums].map(([id, { sum, count }]) => [id, sum / count]));
}

/**
 * Slots a column's virtual nodes among its files by key: a virtual goes after
 * as many files as have a smaller key than it. Virtuals in one gap keep their
 * own key order. A virtual with no key yet goes last.
 */
function mergeColumn(files: readonly string[], virtuals: readonly Virtual[], key: (id: string) => number | undefined): string[] {
  if (!virtuals.length) return [...files];
  const values = files.map((id, index) => key(id) ?? index + 0.5);
  const virtualValue = (virtual: Virtual): number => key(virtual.id) ?? Number.POSITIVE_INFINITY;
  const gaps = new Map<number, Virtual[]>();
  for (const virtual of [...virtuals].sort((x, y) => virtualValue(x) - virtualValue(y) || x.id.localeCompare(y.id))) {
    const value = virtualValue(virtual);
    const gap = Number.isFinite(value) ? values.filter(v => v < value).length : files.length;
    (gaps.get(gap) ?? gaps.set(gap, []).get(gap)!).push(virtual);
  }
  const sequence: string[] = [];
  for (let gap = 0; gap <= files.length; gap++) {
    for (const virtual of gaps.get(gap) ?? []) sequence.push(virtual.id);
    if (gap < files.length) sequence.push(files[gap]);
  }
  return sequence;
}

function positionsOf(merged: readonly (readonly string[])[]): Map<string, number> {
  const positions = new Map<string, number>();
  for (const sequence of merged) sequence.forEach((id, index) => positions.set(id, index));
  return positions;
}

/** Crossings between the wires of each adjacent column pair, by endpoint order. */
export function countCrossings(segments: readonly Segment[], positions: ReadonlyMap<string, number>): number {
  const byColumn = new Map<number, Array<[number, number]>>();
  for (const segment of segments) {
    const a = positions.get(segment.a), b = positions.get(segment.b);
    if (a === undefined || b === undefined) continue;
    (byColumn.get(segment.column) ?? byColumn.set(segment.column, []).get(segment.column)!).push([a + segment.aRow, b + segment.bRow]);
  }
  let crossings = 0;
  for (const wires of byColumn.values()) {
    for (let i = 0; i < wires.length; i++) {
      for (let j = i + 1; j < wires.length; j++) {
        if ((wires[i][0] - wires[j][0]) * (wires[i][1] - wires[j][1]) < 0) crossings++;
      }
    }
  }
  return crossings;
}

/** The crossings among the wires between adjacent columns of an order, for a scope whose wires skip no column. */
export function crossingsOf(order: readonly (readonly string[])[], edges: readonly ForwardReference[]): number {
  const columnOf = new Map<string, number>();
  order.forEach((files, column) => files.forEach(id => columnOf.set(id, column)));
  const positions = positionsOf(order);
  const segments: Segment[] = [];
  for (const edge of edges) {
    const a = columnOf.get(edge.provider), b = columnOf.get(edge.consumer);
    if (a !== undefined && b === a + 1) segments.push({ a: edge.provider, b: edge.consumer, aRow: edge.providerRow, bRow: edge.consumerRow, column: a });
  }
  return countCrossings(segments, positions);
}
