import { computeDirectoryBands, type DirectoryBand, type FlowNode } from "../membraneView/pin-layout";

/**
 * Orders a ranked exploration so that its wires cross as little as the
 * directory bands allow, bundles the wires of one offering pin through the
 * columns they pass together, and finds each bundle a lane inside a directory
 * that holds an end of every wire in it.
 *
 * Pure-function module: no DOM. The columns come from the ranking; the bands
 * come from the Membrane Map's band computation; this module decides the order
 * of band rows, the order of files within a band, the order of each card's
 * rows, and where the threaded wires pass. A bundle's stand-in in a column it
 * passes is a virtual node: in a directory's stack of files it takes a place
 * among them, and in a directory of directories it takes a row of its own
 * beside them. A barycenter sweep walks the columns left to right and then
 * right to left, each column ordered against the one just settled, and the
 * order with the fewest crossings between adjacent columns is kept. When the
 * rows may move, each card's rows are then sorted by the mean height of their
 * wires' far ends, ties broken by the file's own references, the columns are
 * swept once more at the new heights, and the result is kept only if it
 * crosses no more than the given rows did.
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
  /** The row on the provider's card the wire leaves, by name, as `OrderInput.rows` lists it. */
  providerRow: string;
  /** The row on the consumer's card the wire arrives at, by name. */
  consumerRow: string;
}

/** What the ordering takes: the ranked columns, each file's directory, and the forward references with their heights on the cards. */
export interface OrderInput {
  /** The files of each column, left to right, in any order. */
  columns: readonly (readonly string[])[];
  directoryOf: (id: string) => string;
  /** The rows each card shows, top to bottom as given; a wire's height on its card is its row's place in this list. */
  rows: ReadonlyMap<string, readonly string[]>;
  /** Which rows may move to where their wires lead; a row refused keeps its place. Omitted, every row stays as given. */
  movable?: (row: string) => boolean;
  edges: readonly ForwardReference[];
  /**
   * Each card's own references, as pairs of its row names, provider first. They break ties among rows whose
   * wires lead alike, drawing the two rows of a reference together; a wire to another card always outweighs them.
   */
  internal?: ReadonlyMap<string, readonly (readonly [string, string])[]>;
  /** How many left-and-right sweeps to try; the best order seen is kept. Zero keeps the starting order. */
  sweeps?: number;
  /** A seed for a shuffled starting order of each column, so that the sweep starts elsewhere; omitted, the columns start as given. */
  seed?: number;
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
  /** The rows of each card, top to bottom, in the chosen order. */
  rows: Map<string, string[]>;
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
  /** The row names at each end, null at a bundle's stand-in. */
  aName: string | null;
  bName: string | null;
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
  const columnCount = input.columns.length;
  const given = new Map([...input.rows].map(([id, rows]) => [id, [...rows]]));
  const { virtuals, segments } = bundleWires(input.edges, columnOf, fractionsOf(given));
  const virtualById = new Map(virtuals.map(virtual => [virtual.id, virtual]));

  const flow = new Map<string, FlowNode>();
  input.columns.forEach((files, column) => files.forEach(id => flow.set(id, { id, column, role: "pinned", directory: input.directoryOf(id) })));

  // The starting order: each column as the ranking gave it, or shuffled by the seed, each stand-in at the mean place of its wires' ends.
  const start = new Map<string, number>();
  const startColumns = input.seed === undefined ? input.columns : shuffledColumns(input.columns, input.seed);
  startColumns.forEach(files => files.forEach((id, index) => start.set(id, index + 0.5)));
  for (const virtual of virtuals) {
    const ends = [virtual.provider, ...virtual.members.map(member => member.consumer)].map(id => start.get(id) ?? 0);
    start.set(virtual.id, ends.reduce((sum, value) => sum + value, 0) / ends.length);
  }
  const startKey = (id: string): number => start.get(id) ?? 0;
  let bands = placeVirtuals(computeDirectoryBands(flow), virtuals, input.directoryOf);
  for (let column = 0; column < columnCount; column++) bands = reorderColumn(bands, column, startKey);
  bands = repackRows(bands, startKey);

  const sweeps = input.sweeps ?? 4;
  let best = sweepColumns(bands, segments, columnCount, sweeps);
  let rows = given;
  if (input.movable) {
    // The rows of each card, by where their wires lead at the settled order; then the columns once more at the new heights.
    const merged = walkColumns(best.bands, columnCount);
    const moved = orderRows(given, merged, positionsOf(merged), segments, input.movable, input.internal ?? new Map());
    const resegmented = bundleWires(input.edges, columnOf, fractionsOf(moved)).segments;
    const next = sweepColumns(best.bands, resegmented, columnCount, sweeps);
    if (next.crossings <= best.crossings) { best = next; rows = moved; }
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
  return { bands: stripped, columns: walkColumns(stripped, columnCount), rows, lanes, passages, crossings: best.crossings };
}

/** Each column shuffled by a small deterministic generator (mulberry32) from the seed, the same every time for a seed. */
function shuffledColumns(columns: readonly (readonly string[])[], seed: number): string[][] {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return columns.map(files => {
    const list = [...files];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });
}

/** A barycenter sweep from a starting band tree: the order with the fewest crossings seen, the start included. */
function sweepColumns(start: readonly DirectoryBand[], segments: readonly Segment[], columnCount: number, sweeps: number): { bands: DirectoryBand[]; crossings: number } {
  let bands = [...start];
  const keys = new Map<string, number>();
  const keyOf = (id: string): number | undefined => keys.get(id);
  let merged = walkColumns(bands, columnCount);
  let positions = positionsOf(merged);
  let best = { bands, crossings: countCrossings(segments, positions) };
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
  return best;
}

/** A wire's height on a card: its row's place among the card's rows, from the top; the middle when the row is unknown. */
function fractionsOf(rows: ReadonlyMap<string, readonly string[]>): (id: string, row: string) => number {
  return (id, row) => {
    const list = rows.get(id) ?? [];
    const index = list.indexOf(row);
    return index < 0 || !list.length ? 0.5 : (index + 0.5) / list.length;
  };
}

/**
 * Each card's rows sorted by the mean height of their wires' far ends: the
 * rows that may move take the places of one another in that order, wired
 * rows first and unwired ones after them, while a row that may not move
 * keeps its place. Rows whose wires lead alike, and the unwired rows among
 * themselves, are ordered by the file's own references: such a row moves
 * halfway from where it stands toward the rows it refers to or is built on,
 * so the two rows of a self-reference draw together, and a row with none
 * keeps its place. The cards are settled one at a time, left to right and
 * then right to left, each against its neighbours' rows as they stand, so
 * that two cards wired crosswise do not both turn over and cross again.
 */
function orderRows(
  rows: ReadonlyMap<string, readonly string[]>,
  merged: readonly (readonly string[])[],
  positions: ReadonlyMap<string, number>,
  segments: readonly Segment[],
  movable: (row: string) => boolean,
  internal: ReadonlyMap<string, readonly (readonly [string, string])[]>
): Map<string, string[]> {
  const current = new Map([...rows].map(([id, list]) => [id, [...list]]));
  const partnersOf = new Map<string, string[]>();
  for (const [id, pairs] of internal) for (const [provider, consumer] of pairs) {
    for (const [name, partner] of [[provider, consumer], [consumer, provider]]) {
      const key = `${id}\0${name}`;
      (partnersOf.get(key) ?? partnersOf.set(key, []).get(key)!).push(partner);
    }
  }
  const fraction = (id: string, name: string | null): number => {
    if (name === null) return LANE_FRACTION;
    const list = current.get(id) ?? [];
    const index = list.indexOf(name);
    return index < 0 || !list.length ? 0.5 : (index + 0.5) / list.length;
  };
  const touching = new Map<string, Array<{ neighbour: string; name: string | null }>>();
  const touch = (id: string, name: string | null, neighbour: string, neighbourName: string | null): void => {
    if (name === null) return;
    const key = `${id}\0${name}`;
    (touching.get(key) ?? touching.set(key, []).get(key)!).push({ neighbour, name: neighbourName });
  };
  for (const segment of segments) { touch(segment.a, segment.aName, segment.b, segment.bName); touch(segment.b, segment.bName, segment.a, segment.aName); }
  const settle = (id: string): void => {
    const list = current.get(id);
    if (!list) return;
    const keyOf = (name: string): number | undefined => {
      const ends = (touching.get(`${id}\0${name}`) ?? []).filter(end => positions.has(end.neighbour));
      if (!ends.length) return undefined;
      return ends.reduce((sum, end) => sum + positions.get(end.neighbour)! + fraction(end.neighbour, end.name), 0) / ends.length;
    };
    const tieOf = (name: string): number => {
      const partners = (partnersOf.get(`${id}\0${name}`) ?? []).filter(partner => partner !== name && list.includes(partner));
      return [name, ...partners].reduce((sum, row) => sum + fraction(id, row), 0) / (partners.length + 1);
    };
    const moving = list.map((name, index) => ({ name, index, key: keyOf(name), tie: tieOf(name) })).filter(row => movable(row.name));
    const wired = moving.filter(row => row.key !== undefined).sort((x, y) => x.key! - y.key! || x.tie - y.tie || x.index - y.index);
    const unwired = moving.filter(row => row.key === undefined).sort((x, y) => x.tie - y.tie || x.index - y.index);
    const queue = [...wired, ...unwired].map(row => row.name);
    current.set(id, list.map(name => (movable(name) ? queue.shift()! : name)));
  };
  for (const sweep of [merged, [...merged].reverse()]) for (const column of sweep) for (const id of column) settle(id);
  return current;
}

/**
 * One stand-in per offering pin per column it passes: the wires of a pin run
 * together, and each leaves the bundle in the gutter before its consumer's
 * column. A bundle's shared run is one segment, so the sweep counts it once.
 */
function bundleWires(edges: readonly ForwardReference[], columnOf: ReadonlyMap<string, number>, fraction: (id: string, row: string) => number): { virtuals: Virtual[]; segments: Segment[] } {
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
    let previous = provider, previousRow = fraction(provider, wires[0].providerRow), previousName: string | null = wires[0].providerRow;
    for (let column = a + 1; column <= far; column++) {
      for (const wire of wires.filter(wire => columnOf.get(wire.consumer) === column).sort(byKey)) {
        segments.push({ a: previous, b: wire.consumer, aRow: previousRow, bRow: fraction(wire.consumer, wire.consumerRow), aName: previousName, bName: wire.consumerRow, column: column - 1 });
      }
      const passing = wires.filter(wire => columnOf.get(wire.consumer)! > column).sort(byKey);
      if (!passing.length) break;
      const id = `\0${pin}\0${column}`;
      virtuals.push({ id, column, pin, provider, members: passing.map(wire => ({ key: wire.key, consumer: wire.consumer })) });
      segments.push({ a: previous, b: id, aRow: previousRow, bRow: LANE_FRACTION, aName: previousName, bName: null, column: column - 1 });
      previous = id;
      previousRow = LANE_FRACTION;
      previousName = null;
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

/** The crossings among the wires between adjacent columns of an order, at the given rows, for a scope whose wires skip no column. */
export function crossingsOf(order: readonly (readonly string[])[], rows: ReadonlyMap<string, readonly string[]>, edges: readonly ForwardReference[]): number {
  const columnOf = new Map<string, number>();
  order.forEach((files, column) => files.forEach(id => columnOf.set(id, column)));
  const positions = positionsOf(order);
  const fraction = fractionsOf(rows);
  const segments: Segment[] = [];
  for (const edge of edges) {
    const a = columnOf.get(edge.provider), b = columnOf.get(edge.consumer);
    if (a !== undefined && b === a + 1) {
      segments.push({ a: edge.provider, b: edge.consumer, aRow: fraction(edge.provider, edge.providerRow), bRow: fraction(edge.consumer, edge.consumerRow), aName: edge.providerRow, bName: edge.consumerRow, column: a });
    }
  }
  return countCrossings(segments, positions);
}
