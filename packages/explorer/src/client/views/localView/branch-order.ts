import { computeDirectoryBands, type DirectoryBand, type FlowNode } from "../membraneView/pin-layout";

/**
 * Orders a ranked exploration so that its wires cross as little as the
 * directory bands allow, bundles the wires of one offering pin through the
 * columns they pass together, and finds each bundle a lane inside a directory
 * that holds an end of every wire in it.
 *
 * Pure-function module: no DOM. The columns come from the ranking; the bands
 * come from the Membrane Map's band computation; this module decides the order
 * of band rows, the order of files within a band, and where the threaded wires
 * pass. A bundle's stand-in in a column it passes is a virtual node: in a
 * directory's stack of files it takes a place among them, and in a directory
 * of directories it takes a row of its own beside them. A barycenter sweep
 * walks the columns left to right and then right to left, each column ordered
 * against the one just settled, and the order with the fewest crossings
 * between adjacent columns is kept.
 *
 * @module branch-order
 */

/** A reference that reads forward, from a provider's column to a consumer's column to its right. */
export interface ForwardReference {
  /** The edge's key, by which the renderer finds its lanes. */
  key: string;
  provider: string;
  consumer: string;
  /** The offering pin the wire leaves, the provider's symbol row; the wires of one pin bundle. */
  pin: string;
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

/** The wires of one offering pin that pass one column together, sharing a slot in its lane. */
export interface Bundle {
  pin: string;
  /** The keys of the wires still in the bundle here: those whose consumer stands further right. */
  edges: string[];
}

/** A gap through which threaded wires pass, inside a directory that holds an end of every wire in it. */
export interface Lane {
  key: string;
  column: number;
  /** The directory whose box holds the lane, "" at the root: of the directories spanning the column, the deepest that holds an end of every wire here. */
  host: string;
  /** In a directory's stack of files: the file the lane follows, or null above the first. Null in a directory of directories. */
  after: string | null;
  /** In a directory of directories: the lane's row among the sibling directories' rows. Null in a stack of files. */
  row: number | null;
  /** The bundles passing here, top to bottom; each takes one slot. */
  bundles: Bundle[];
}

/** The chosen order: the bands as rows and lists, the columns top to bottom, the lanes, each threaded reference's passages, and the crossings. */
export interface BranchOrder {
  /** The bands, their rows and their file lists in the chosen order. */
  bands: DirectoryBand[];
  /** The files of each column, top to bottom. */
  columns: string[][];
  /** The lanes, keyed as `Lane.key`. */
  lanes: Map<string, Lane>;
  /** For each wire and each column it passes (`${edge}\0${column}`), its lane and its bundle's slot in it. */
  passages: Map<string, { lane: string; index: number }>;
  /** Wire crossings between adjacent columns in the chosen order, counting a bundle's shared run once. */
  crossings: number;
}

interface Segment {
  a: string;
  b: string;
  aRow: number;
  bRow: number;
  column: number;
}

/** A bundle's stand-in in one column it passes. */
interface Virtual {
  id: string;
  column: number;
  pin: string;
  provider: string;
  /** The wires passing this column in the bundle, with their consumers. */
  members: Array<{ key: string; consumer: string }>;
}

const LANE_FRACTION = 0.5;

/** The directory of a lane's own band in a directory of directories; never a real directory's name. */
const LANE_BAND = "\0lane";

/**
 * Orders a ranked exploration and reserves its lanes: the band rows and the
 * files within them by a barycenter sweep that keeps the fewest crossings, and
 * a lane through every column a bundle passes. See the module note.
 */
export function orderBranches(input: OrderInput): BranchOrder {
  const columnOf = new Map<string, number>();
  input.columns.forEach((files, column) => files.forEach(id => columnOf.set(id, column)));
  const { virtuals, segments } = bundleWires(input.edges, columnOf);
  const virtualById = new Map(virtuals.map(virtual => [virtual.id, virtual]));
  const columnCount = input.columns.length;

  const flow = new Map<string, FlowNode>();
  input.columns.forEach((files, column) => files.forEach(id => flow.set(id, { id, column, role: "pinned", directory: input.directoryOf(id) })));

  // The starting order: each column as the ranking gave it, each stand-in at the mean place of its wires' ends.
  const start = new Map<string, number>();
  input.columns.forEach(files => files.forEach((id, index) => start.set(id, index + 0.5)));
  for (const virtual of virtuals) {
    const ends = [virtual.provider, ...virtual.members.map(member => member.consumer)].map(id => start.get(id) ?? 0);
    start.set(virtual.id, ends.reduce((sum, value) => sum + value, 0) / ends.length);
  }
  const startKey = (id: string): number => start.get(id) ?? 0;
  let bands = placeVirtuals(computeDirectoryBands(flow), virtuals, input.directoryOf);
  for (let column = 0; column < columnCount; column++) bands = reorderColumn(bands, column, startKey);
  bands = repackRows(bands, startKey);

  const keys = new Map<string, number>();
  const keyOf = (id: string): number | undefined => keys.get(id);
  let merged = walkColumns(bands, columnCount);
  let positions = positionsOf(merged);
  let best = { bands, crossings: countCrossings(segments, positions) };

  const sweeps = input.sweeps ?? 4;
  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (const side of ["left", "right"] as const) {
      const order = side === "left"
        ? Array.from({ length: Math.max(0, columnCount - 1) }, (_, i) => i + 1)
        : Array.from({ length: Math.max(0, columnCount - 1) }, (_, i) => columnCount - 2 - i);
      for (const column of order) {
        const bary = barycenters(segments, positions, side, column);
        for (const id of merged[column]) keys.set(id, bary.get(id) ?? positions.get(id) ?? 0);
        bands = reorderColumn(bands, column, keyOf);
        merged[column] = walkColumns(bands, columnCount)[column];
        merged[column].forEach((id, index) => positions.set(id, index));
      }
      // Band rows are shared by every column, so they are settled once per pass, from where every member's wires lead.
      const neighbours = neighbourMeans(segments, positions);
      bands = repackRows(bands, id => neighbours.get(id) ?? positions.get(id) ?? 0);
      merged = walkColumns(bands, columnCount);
      positions = positionsOf(merged);
      const crossings = countCrossings(segments, positions);
      if (crossings < best.crossings) best = { bands, crossings };
    }
  }

  const lanes = new Map<string, Lane>();
  const passages = new Map<string, { lane: string; index: number }>();
  const reserve = (key: string, column: number, host: string, after: string | null, row: number | null, ids: readonly string[]): void => {
    const bundles = ids.map(id => { const virtual = virtualById.get(id)!; return { pin: virtual.pin, edges: virtual.members.map(member => member.key) }; });
    lanes.set(key, { key, column, host, after, row, bundles });
    ids.forEach((id, index) => { for (const member of virtualById.get(id)!.members) passages.set(`${member.key}\0${column}`, { lane: key, index }); });
  };
  const collect = (siblings: readonly DirectoryBand[], host: string): void => {
    for (const band of siblings) {
      if (band.directory === LANE_BAND) {
        const column = band.minColumn;
        reserve(`${column}\0${host}\0row:${band.bandRow}`, column, host, null, band.bandRow, band.nodesByColumn.get(column) ?? []);
      } else if (band.children.length) {
        collect(band.children, band.directory);
      } else {
        for (const [column, ids] of band.nodesByColumn) {
          let after: string | null = null;
          let run: string[] = [];
          const flush = (): void => {
            if (run.length) reserve(`${column}\0${band.directory}\0after:${after ?? ""}`, column, band.directory, after, null, run);
            run = [];
          };
          for (const id of ids) {
            if (virtualById.has(id)) run.push(id);
            else { flush(); after = id; }
          }
          flush();
        }
      }
    }
  };
  collect(best.bands, "");

  const strip = (siblings: readonly DirectoryBand[]): DirectoryBand[] => siblings
    .filter(band => band.directory !== LANE_BAND)
    .map(band => ({
      ...band,
      nodesByColumn: new Map([...band.nodesByColumn].map(([column, ids]) => [column, ids.filter(id => !virtualById.has(id))])),
      allNodeIds: band.allNodeIds.filter(id => !virtualById.has(id)),
      children: strip(band.children)
    }));
  const stripped = strip(best.bands);
  return { bands: stripped, columns: walkColumns(stripped, columnCount), lanes, passages, crossings: best.crossings };
}

/**
 * One stand-in per offering pin per column it passes: the wires of a pin run
 * together, and each leaves the bundle in the gutter before its consumer's
 * column. A bundle's shared run is one segment, so the sweep counts it once.
 */
function bundleWires(edges: readonly ForwardReference[], columnOf: ReadonlyMap<string, number>): { virtuals: Virtual[]; segments: Segment[] } {
  const byPin = new Map<string, ForwardReference[]>();
  for (const edge of edges) {
    const a = columnOf.get(edge.provider), b = columnOf.get(edge.consumer);
    if (a === undefined || b === undefined || b <= a) continue;
    (byPin.get(edge.pin) ?? byPin.set(edge.pin, []).get(edge.pin)!).push(edge);
  }
  const byKey = (x: ForwardReference, y: ForwardReference): number => x.key.localeCompare(y.key);
  const virtuals: Virtual[] = [];
  const segments: Segment[] = [];
  for (const [pin, wires] of [...byPin].sort(([x], [y]) => x.localeCompare(y))) {
    const provider = wires[0].provider;
    const a = columnOf.get(provider)!;
    const far = Math.max(...wires.map(wire => columnOf.get(wire.consumer)!));
    let previous = provider, previousRow = wires[0].providerRow;
    for (let column = a + 1; column <= far; column++) {
      for (const wire of wires.filter(wire => columnOf.get(wire.consumer) === column).sort(byKey)) {
        segments.push({ a: previous, b: wire.consumer, aRow: previousRow, bRow: wire.consumerRow, column: column - 1 });
      }
      const passing = wires.filter(wire => columnOf.get(wire.consumer)! > column).sort(byKey);
      if (!passing.length) break;
      const id = `\0${pin}\0${column}`;
      virtuals.push({ id, column, pin, provider, members: passing.map(wire => ({ key: wire.key, consumer: wire.consumer })) });
      segments.push({ a: previous, b: id, aRow: previousRow, bRow: LANE_FRACTION, column: column - 1 });
      previous = id;
      previousRow = LANE_FRACTION;
    }
  }
  return { virtuals, segments };
}

/**
 * Puts each bundle's stand-ins into the band tree: into the deepest band
 * spanning their column that holds an end of every wire in the bundle, else
 * the root. In a band of files a stand-in joins the column's list; in a band
 * of bands, the stand-ins of one column share a lane band of their own. Among
 * siblings a named directory is preferred to the root's loose files.
 */
function placeVirtuals(bands: readonly DirectoryBand[], virtuals: readonly Virtual[], directoryOf: (id: string) => string): DirectoryBand[] {
  const holds = (directory: string, virtual: Virtual): boolean => {
    const under = (file: string): boolean => directory === "" || directoryOf(file) === directory || directoryOf(file).startsWith(`${directory}/`);
    return under(virtual.provider) || virtual.members.every(member => under(member.consumer));
  };
  const place = (siblings: readonly DirectoryBand[], pending: readonly Virtual[]): { bands: DirectoryBand[]; left: Virtual[] } => {
    const taken = new Map<DirectoryBand, Virtual[]>();
    const left: Virtual[] = [];
    for (const virtual of pending) {
      const fits = (band: DirectoryBand): boolean => virtual.column >= band.minColumn && virtual.column <= band.maxColumn && holds(band.directory, virtual);
      const holder = siblings.find(band => band.directory !== "" && fits(band)) ?? siblings.find(fits);
      if (holder) (taken.get(holder) ?? taken.set(holder, []).get(holder)!).push(virtual);
      else left.push(virtual);
    }
    const placed = siblings.map(band => {
      const mine = taken.get(band);
      if (!mine) return band;
      const allNodeIds = [...band.allNodeIds, ...mine.map(virtual => virtual.id)];
      if (band.children.length) {
        const inner = place(band.children, mine);
        return { ...band, children: [...inner.bands, ...laneBands(inner.left)], allNodeIds };
      }
      const nodesByColumn = new Map(band.nodesByColumn);
      for (const virtual of mine) nodesByColumn.set(virtual.column, [...(nodesByColumn.get(virtual.column) ?? []), virtual.id]);
      return { ...band, nodesByColumn, allNodeIds };
    });
    return { bands: placed, left };
  };
  const { bands: placed, left } = place(bands, virtuals);
  return [...placed, ...laneBands(left)];
}

/** A lane band per stand-in that sits beside a directory's subdirectories; `repackRows` joins those that stand together. */
function laneBands(virtuals: readonly Virtual[]): DirectoryBand[] {
  return virtuals.map(virtual => laneBand(virtual.column, [virtual.id]));
}

function laneBand(column: number, ids: string[]): DirectoryBand {
  return { directory: LANE_BAND, minColumn: column, maxColumn: column, bandRow: -1, nodesByColumn: new Map([[column, ids]]), allNodeIds: ids, children: [] };
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

/** The bands with one column's lists sorted by key, ties alphabetical; rows untouched. */
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
 * share a row. Ties keep the directories' alphabetical order. Lane stand-ins
 * are sorted one by one, and those of one column that stand together, with no
 * directory spanning that column between them, share one lane band, so that a
 * lane goes where its wires lead and no row is spent that another lane can
 * share.
 */
export function repackRows(bands: readonly DirectoryBand[], key: (id: string) => number): DirectoryBand[] {
  const mean = (ids: readonly string[]): number => ids.reduce((sum, id) => sum + key(id), 0) / Math.max(1, ids.length);
  const byKey = (a: string, b: string): number => key(a) - key(b) || a.localeCompare(b);
  const sorted = bands
    .flatMap(band => band.directory === LANE_BAND ? band.allNodeIds.map(id => laneBand(band.minColumn, [id])) : [band])
    .map(band => ({ ...band, children: band.children.length ? repackRows(band.children, key) : band.children }))
    .sort((x, y) => mean(x.allNodeIds) - mean(y.allNodeIds) || x.directory.localeCompare(y.directory) || (x.allNodeIds[0] ?? "").localeCompare(y.allNodeIds[0] ?? ""));
  const ordered: DirectoryBand[] = [];
  const open = new Map<number, number>();
  for (const band of sorted) {
    if (band.directory !== LANE_BAND) {
      for (let column = band.minColumn; column <= band.maxColumn; column++) open.delete(column);
      ordered.push(band);
      continue;
    }
    const column = band.minColumn;
    const at = open.get(column);
    if (at === undefined) {
      open.set(column, ordered.length);
      ordered.push(band);
    } else {
      ordered[at] = laneBand(column, [...ordered[at].allNodeIds, ...band.allNodeIds].sort(byKey));
    }
  }
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
