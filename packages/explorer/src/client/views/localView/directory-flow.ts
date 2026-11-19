/**
 * An opened directory that shows how its own files connect: Flow, first a trial beside the grid of 2026-10-07 behind
 * Tuning's Opened Directory (2026-11-12), the default since 2026-11-13 with the grid one choice away. A newcomer opened
 * three directories, saw cards and no line, and concluded that the map draws no connections (the first-visit review of
 * 2026-11-12, finding 3); the owner asked for a trial to feel, and then found it better "in basically every place I look".
 *
 * In Flow, every pair of file cards on screen where one uses the other is joined by one line, from the offering
 * card's node-level hub to the using card's, standing for every link between them the picture does not draw symbol by
 * symbol ({@link pairLines}). The lines join the picture's references, so the ranking stands a file left of the files that
 * use it, and the ordering and the placement solve the picture as they solve a pinned neighbourhood. This module lays out
 * what the ranking cannot place: where the closed boxes and the cards no line joins stand, and how a tall rank wraps
 * ({@link flowColumns}, {@link wrapRanks}), each in the shape the picture's price chooses ({@link searchFlowShape}).
 *
 * Pure-function module: no DOM.
 *
 * @module directory-flow
 */

import type { ExplorerLinkKind } from "../../../shared/types";
import type { SceneMeasurer } from "./branch-scene";
import { HANDLE_STRIP } from "./directory-handle";
import { under, type OpenDirectories } from "./directory-state";
import type { LocalEdge } from "./types";
import { HUB_CENTRE, NODE_HUB } from "./wire-gathering";

/** A link of the graph between two file cards on screen that the picture draws no wire for. */
export interface UndrawnLink {
  /** The file that uses. */
  sourceId: string;
  /** The file that offers. */
  targetId: string;
  kind: ExplorerLinkKind;
  /** The symbol of the using file the link leaves from; none for its Internals. */
  sourceSymbol?: string;
  /** The symbol of the offering file the link reaches; none for its Internals. */
  targetSymbol?: string;
}

/**
 * One line for each pair of files, each way: every undrawn link from one file to another gathered under one edge between
 * their node-level hubs, in the order the pairs first came, counting its links and keeping the symbols at their ends
 * (`standsFor`), by which a hovered row finds the lines that carry its links (2026-11-19). A file's links to itself join
 * no pair of cards and make no line.
 */
export function pairLines(undrawn: readonly UndrawnLink[]): LocalEdge[] {
  const pairs = new Map<string, LocalEdge & { gathered: number; standsFor: Array<Pick<LocalEdge, "sourceSymbol" | "targetSymbol">> }>();
  for (const link of undrawn) {
    if (link.sourceId === link.targetId) continue;
    const key = JSON.stringify([link.targetId, link.sourceId]);
    const ends = { sourceSymbol: link.sourceSymbol, targetSymbol: link.targetSymbol };
    const pair = pairs.get(key);
    if (pair) { pair.gathered++; pair.standsFor.push(ends); }
    else pairs.set(key, { sourceId: link.sourceId, targetId: link.targetId, sourceSymbol: NODE_HUB, targetSymbol: NODE_HUB, kind: link.kind, direction: "inbound", gathered: 1, standsFor: [ends] });
  }
  return [...pairs.values()];
}

/**
 * The cards a hover of one card keeps lit (the directory flow trial's hover): the card itself and the card at the far
 * end of every line and wire that touches it, a return's among them. Null when the card is not in the picture, and then
 * nothing is faded.
 */
export function flowNeighbours(links: readonly LocalEdge[], cards: ReadonlySet<string>, id: string): Set<string> | null {
  if (!cards.has(id)) return null;
  const lit = new Set([id]);
  for (const edge of links) {
    if (edge.sourceId === id) lit.add(edge.targetId);
    if (edge.targetId === id) lit.add(edge.sourceId);
  }
  return lit;
}

/** Whether an edge is a pair line of an opened directory rather than a reference between two symbols. */
export const isPairLine = (edge: LocalEdge): boolean => edge.gathered !== undefined;

/** How many of the graph's links an edge stands for: a pair line's count, one for a reference. */
export const linksOf = (edge: LocalEdge): number => edge.gathered ?? 1;

/**
 * The ranking's columns with every rank that holds more than `rows` cards wrapped into neighbouring columns, as few as
 * hold it and as even as they can be, its cards in the order given. No line joins two cards of one rank, so the wrap
 * drops nothing; the ranks keep their order, so a file still never stands left of a file it offers to. Null wraps nothing.
 */
export function wrapRanks(ranked: readonly (readonly string[])[], rows: number | null): string[][] {
  const limit = rows === null ? Infinity : Math.max(1, Math.floor(rows));
  return ranked.flatMap(rank => {
    if (rank.length <= limit) return [[...rank]];
    const columns = Math.ceil(rank.length / limit), each = Math.ceil(rank.length / columns);
    return Array.from({ length: columns }, (_, column) => rank.slice(column * each, (column + 1) * each)).filter(column => column.length);
  });
}

/** What {@link flowColumns} lays out. */
export interface FlowInput {
  /** The ranking's columns: every retained file and every file a line joins, a file left of the files that use it. */
  ranked: readonly (readonly string[])[];
  opened: OpenDirectories;
  /** The closed boxes directly inside an opened directory, in the order they are read. */
  boxesOf(directory: string): readonly string[];
  /** The files directly inside an opened directory that no line joins and no pin retains, in the order they are read. */
  looseOf(directory: string): readonly string[];
  /** The directory an item stands directly in: a file's, and a closed box's parent. */
  directoryOf(id: string): string;
}

/**
 * How the things no line places stand in a picture in flow order: how a tall rank wraps, how many rows each opened
 * directory's closed boxes stand in, and how many columns its files that no line joins stand across. Rules chose these
 * until 2026-11-13; the picture's price now does, its width set against its height ({@link searchFlowShape}), on the
 * owner's leave to add that term ("If a user can understand software at a glance better by adding that extra term to
 * the "price", go ahead and add it", 2026-11-13).
 */
export interface FlowShape {
  /** The most cards a column of the ranks holds before its rank wraps into a neighbouring column; null wraps nothing. */
  rows: number | null;
  /** By opened directory, the rows its closed boxes stand in; absent, as many as the columns its files hold need. */
  boxRows: ReadonlyMap<string, number>;
  /** By opened directory, the columns its files that no line joins stand across; absent, one. */
  looseColumns: ReadonlyMap<string, number>;
}

/** The narrowest shape, where the search begins: no rank wrapped, every box within its files' columns, the line-less files in one column. */
export const NARROW_SHAPE: FlowShape = { rows: null, boxRows: new Map(), looseColumns: new Map() };

/** A shape as plain data, for the page to say which it drew. */
export const shapeRecord = (shape: FlowShape): { rows: number | null; boxRows: Record<string, number>; looseColumns: Record<string, number> } =>
  ({ rows: shape.rows, boxRows: Object.fromEntries(shape.boxRows), looseColumns: Object.fromEntries(shape.looseColumns) });

/** How many columns `count` boxes stand across over a directory whose files hold `span` columns, in `rows` rows when given. */
function boxColumns(count: number, span: number, rows: number | undefined): number {
  const narrow = Math.min(count, span);
  return rows === undefined ? narrow : Math.min(count, Math.max(narrow, Math.ceil(count / Math.max(1, Math.floor(rows)))));
}

/**
 * The ranks wrapped as a shape asks, the opened directories' own files only: a card a pin brought in from elsewhere
 * stands in its rank unwrapped, as before the shape was priced. A rank whose own files fit the cap stays one column as it
 * is; a rank whose own files are wrapped stands its other cards in one column of their own at its left, then its own
 * files across as many columns as the cap needs, so the ranks keep their order.
 */
function wrapOwn(input: FlowInput, rows: number | null): string[][] {
  const own = (id: string): boolean => input.opened.has(input.directoryOf(id));
  return input.ranked.flatMap(rank => {
    const mine = rank.filter(own);
    const wrapped = wrapRanks([mine], rows);
    if (wrapped.length <= 1) return [[...rank]];
    const others = rank.filter(id => !own(id));
    return others.length ? [others, ...wrapped] : wrapped;
  });
}

/** The columns, and for each opened directory in flow order, the columns its files held before its boxes and line-less files joined. */
function layFlow(input: FlowInput, shape: FlowShape): { columns: string[][]; spans: Map<string, number>; flowing: string[] } {
  const columns = wrapOwn(input, shape.rows);
  const ranked = columns.map(column => [...column]);
  const holding = (from: readonly (readonly string[])[], directory: string): number[] =>
    from.flatMap((column, index) => (column.some(id => under(input.directoryOf(id), directory)) ? [index] : []));
  const push = (column: number, id: string): void => {
    while (columns.length <= column) columns.push([]);
    columns[column].push(id);
  };
  const depth = (directory: string): number => (directory === "" ? 0 : directory.split("/").length);
  const flowing = [...input.opened].filter(directory => holding(ranked, directory).length > 0)
    .sort((a, b) => depth(b) - depth(a) || a.localeCompare(b));
  const spans = new Map<string, number>();
  for (const directory of flowing) {
    const held = holding(columns, directory);
    const first = Math.min(...held), last = Math.max(...held), span = last - first + 1;
    spans.set(directory, span);
    const boxes = input.boxesOf(directory);
    const across = boxColumns(boxes.length, span, shape.boxRows.get(directory));
    const heads = new Map<number, string[]>();
    boxes.forEach((box, index) => {
      const column = first + (index % across);
      (heads.get(column) ?? heads.set(column, []).get(column)!).push(box);
    });
    for (const [column, list] of heads) {
      while (columns.length <= column) columns.push([]);
      columns[column].unshift(...list);
    }
    const loose = input.looseOf(directory);
    const width = Math.max(1, Math.min(loose.length, Math.floor(shape.looseColumns.get(directory) ?? 1)));
    loose.forEach((file, index) => push(last + 1 + (index % width), file));
  }
  const flows = new Set(flowing);
  const anchorOf = (directory: string): number => {
    for (let current: string | null = directory; current !== null; current = current === "" ? null : parentOf(current)) {
      const held = holding(ranked, current);
      if (held.length) return Math.min(...held);
    }
    return 0;
  };
  for (const directory of [...input.opened].filter(each => !flows.has(each)).sort()) {
    const items = [...input.boxesOf(directory), ...input.looseOf(directory)];
    if (!items.length) continue;
    const width = Math.ceil(Math.sqrt(items.length));
    const anchor = anchorOf(directory);
    items.forEach((item, index) => push(anchor + (index % width), item));
  }
  return { columns, spans, flowing };
}

/**
 * The columns of a picture whose opened directories stand in flow order, in a given shape.
 *
 * The ranks stand left to right, wrapped at the shape's rows ({@link wrapRanks}). Then each opened directory that has a
 * file in them, the deepest first so that a directory counts what the directories under it took:
 * - its closed boxes stand at the head of its columns, from its first column, in the shape's rows for it: one to a
 *   column across as many columns as that needs, again from the first column in the next row, and no fewer columns than
 *   its files hold or its boxes need; past its files' last column they stand in columns of their own. They head their
 *   columns' lists, a band above its files (the ordering keeps them first, by `leading`), since a person browsing looks
 *   for the next directory to open before anything else (the root's answer, 2026-11-12);
 * - its files that no line joins stand together in a block after its files' last column, under any boxes there, read
 *   row by row across the shape's columns for it.
 *
 * An opened directory with no file in the ranks, one that holds only subdirectories or whose files join nothing, is laid
 * out as the grid lays it (`placeMembers` in `branches.ts`): from its nearest ancestor's first column, else the first,
 * about as wide as tall. So a picture with no line and no pin is the grid's picture.
 *
 * Every id given stands in exactly one column, and the ranks' cards keep their order across the columns.
 */
export function flowColumns(input: FlowInput, shape: FlowShape = NARROW_SHAPE): string[][] {
  return layFlow(input, shape).columns;
}

/**
 * The nominal sizes the shape is chosen on, in the picture's own pixels (2026-11-13). A directory's shape is a coarse
 * choice, how a rank wraps and how many rows of boxes and columns of line-less files it takes, and is chosen on the
 * directory's structure with every unpinned file card at one size and every closed box at another, so that no font,
 * screen, pin or path the person took enters it: two people opening the same link are shown the same shape. The picture
 * itself is still drawn from the page's own measurements. The numbers are the page's unpinned cards at their natural
 * sizes on 2026-11-13, at 1440 by 900 in this container's fonts, on `scripts`, `scripts/live-docs`, the explorer's
 * `client` and `localView` and the estate sample's `Contracts`: file cards 200 to 491 wide (medians 200 to 311) and 154
 * to 208 tall (medians 154 to 183); every closed box 160 by 81; a directory's label 30 tall, 42 where it wraps. A browser
 * case holds the file card to the page's median unpinned card, so that a change to the card does not leave it behind.
 */
export const NOMINAL_CARD = { width: 240, height: 180 } as const;
/** A closed directory's box on the nominal model: every box the page drew on 2026-11-13. */
export const NOMINAL_BOX = { width: 160, height: 81 } as const;
/** A directory's label on the nominal model: the strip the layout keeps for its handle, the page's own constant since 2026-11-15 (one line, 30, before). */
export const NOMINAL_LABEL = HANDLE_STRIP;

/**
 * The scene's measurer on the nominal model: every file card {@link NOMINAL_CARD}, every closed box {@link NOMINAL_BOX},
 * no wider than a card cap when one is set, every directory's label {@link NOMINAL_LABEL} tall, and every line's end at a
 * card's node-level hub, at its name's height as the stylesheet stands it ({@link HUB_CENTRE}, rounded as the page rounds a
 * pin; half way down the card until 2026-11-19). A closed box ends no line.
 */
export function nominalMeasurer(ids: Iterable<string>, isBox: (id: string) => boolean): SceneMeasurer {
  const items = [...ids];
  const size = (id: string): { width: number; height: number } => (isBox(id) ? NOMINAL_BOX : NOMINAL_CARD);
  return {
    widths: cardMaxWidth => new Map(items.map(id => [id, Math.min(size(id).width, cardMaxWidth ?? Infinity)])),
    measure: (cardWidths, labelWidths) => ({
      heights: new Map([...cardWidths.keys()].map(id => [id, size(id).height])),
      labelHeights: new Map([...labelWidths.keys()].map(key => [key, NOMINAL_LABEL])),
      pin: id => (isBox(id) ? null : Math.round(HUB_CENTRE))
    })
  };
}

/** What {@link searchFlowShape} found: the cheapest shape it met and its price, and every shape it priced, in order. */
export interface ShapeSearch {
  shape: FlowShape;
  price: number;
  priced: Array<{ shape: FlowShape; price: number }>;
}

/**
 * The shape the price chooses, by a walk from the narrowest shape that prices each choice in turn: first how a tall rank
 * wraps, from no wrap toward more columns; then, for each opened directory in flow order, the deepest first, its boxes
 * from as many rows as its files' columns need toward one row, and its line-less files from one column toward one row.
 * Each walk moves on while the next value is strictly cheaper and stops at the first that is not, so that a choice the
 * price does not ask for is never made, and a tie keeps the narrower shape. The price is the picture's own, what the
 * page pays for every picture, its width counted against its height, so that nothing is decided by a rule beside it;
 * the walk only bounds how many shapes are priced. The page prices the shapes on the nominal model
 * ({@link nominalMeasurer}) and the directory's own files, unpinned, so the same directory under the same tuning and
 * filters takes the same shape on every screen, after any pins and from any link.
 */
export function searchFlowShape(input: FlowInput, price: (shape: FlowShape) => number): ShapeSearch {
  let shape = NARROW_SHAPE, best = price(shape);
  const priced = [{ shape, price: best }];
  const walk = (values: readonly FlowShape[]): void => {
    for (const candidate of values) {
      const cost = price(candidate);
      priced.push({ shape: candidate, price: cost });
      if (!(cost < best)) return;
      shape = candidate;
      best = cost;
    }
  };
  walk(wrapChoices(input.ranked).map(rows => ({ ...shape, rows })));
  for (const directory of layFlow(input, shape).flowing) {
    // A deeper directory's choices are made by now, and may have widened this one's columns.
    const span = layFlow(input, shape).spans.get(directory)!;
    walk(boxRowChoices(input.boxesOf(directory).length, span).map(row => withBoxRows(shape, directory, row)));
    walk(looseChoices(input.looseOf(directory).length).map(width => withLooseColumns(shape, directory, width)));
  }
  return { shape, price: best, priced };
}

/** The rows a directory's boxes may stand in that stand them across more columns, from as many as its files' columns need toward one. */
function boxRowChoices(boxes: number, span: number): number[] {
  const rows: number[] = [];
  for (let row = Math.ceil(boxes / span) - 1, across = boxColumns(boxes, span, undefined); row >= 1; row--) {
    if (boxColumns(boxes, span, row) !== across) { rows.push(row); across = boxColumns(boxes, span, row); }
  }
  return rows;
}

/** The columns a directory's line-less files may stand across past one, each standing them in fewer rows. */
function looseChoices(loose: number): number[] {
  const widths: number[] = [];
  for (let row = loose - 1, across = 1; row >= 1; row--) {
    if (Math.ceil(loose / row) !== across) { across = Math.ceil(loose / row); widths.push(across); }
  }
  return widths;
}

/** A shape with one directory's boxes in so many rows; none given, as many as its files' columns need. */
function withBoxRows(shape: FlowShape, directory: string, rows: number | undefined): FlowShape {
  const boxRows = new Map(shape.boxRows);
  if (rows === undefined) boxRows.delete(directory);
  else boxRows.set(directory, rows);
  return { ...shape, boxRows };
}

/** A shape with one directory's line-less files across so many columns. */
function withLooseColumns(shape: FlowShape, directory: string, columns: number): FlowShape {
  const looseColumns = new Map(shape.looseColumns);
  if (columns === 1) looseColumns.delete(directory);
  else looseColumns.set(directory, columns);
  return { ...shape, looseColumns };
}

/** The rows at which the ranks wrap differently, from the tallest rank's down: each wraps them into more columns than the last. */
export function wrapChoices(ranked: readonly (readonly string[])[]): number[] {
  const tallest = Math.max(0, ...ranked.map(rank => rank.length));
  const choices: number[] = [];
  let columns = ranked.length;
  for (let rows = tallest - 1; rows >= 1; rows--) {
    const count = ranked.reduce((sum, rank) => sum + Math.ceil(rank.length / rows), 0);
    if (count !== columns) { choices.push(rows); columns = count; }
  }
  return choices;
}

/** A directory's parent, "" for a directory at the scan root. */
function parentOf(directory: string): string {
  const slash = directory.lastIndexOf("/");
  return slash > 0 ? directory.slice(0, slash) : "";
}
