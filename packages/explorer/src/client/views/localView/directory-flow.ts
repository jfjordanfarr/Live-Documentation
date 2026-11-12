/**
 * An opened directory that shows how its own files connect: a trial for comparison beside the grid of 2026-10-07, behind
 * Tuning's Opened Directory (2026-11-12). A newcomer opened three directories, saw cards and no line, and concluded that
 * the map draws no connections (the first-visit review of 2026-11-12, finding 3); the owner asked for a trial to feel.
 *
 * With the trial on, every pair of file cards on screen where one uses the other is joined by one line, from the offering
 * card's node-level hub to the using card's, standing for every link between them the picture does not draw symbol by
 * symbol ({@link pairLines}). The lines join the picture's references, so the ranking stands a file left of the files that
 * use it, and the ordering and the placement solve the picture as they solve a pinned neighbourhood. This module decides
 * what the ranking cannot: where the cards no line joins stand ({@link flowColumns}), and how a tall rank wraps
 * ({@link wrapRanks}) so that the picture is about as wide as tall ({@link squareRows}).
 *
 * Pure-function module: no DOM.
 *
 * @module directory-flow
 */

import { under, type OpenDirectories } from "./directory-state";
import type { LocalEdge } from "./types";
import { NODE_HUB } from "./wire-gathering";
import type { ExplorerLinkKind } from "../../../shared/types";

/** A link of the graph between two file cards on screen that the picture draws no wire for. */
export interface UndrawnLink {
  /** The file that uses. */
  sourceId: string;
  /** The file that offers. */
  targetId: string;
  kind: ExplorerLinkKind;
}

/**
 * One line for each pair of files, each way: every undrawn link from one file to another gathered under one edge between
 * their node-level hubs, in the order the pairs first came, counting its links. A file's links to itself join no pair of
 * cards and make no line.
 */
export function pairLines(undrawn: readonly UndrawnLink[]): LocalEdge[] {
  const pairs = new Map<string, LocalEdge & { gathered: number }>();
  for (const link of undrawn) {
    if (link.sourceId === link.targetId) continue;
    const key = JSON.stringify([link.targetId, link.sourceId]);
    const pair = pairs.get(key);
    if (pair) pair.gathered++;
    else pairs.set(key, { sourceId: link.sourceId, targetId: link.targetId, sourceSymbol: NODE_HUB, targetSymbol: NODE_HUB, kind: link.kind, direction: "inbound", gathered: 1 });
  }
  return [...pairs.values()];
}

/** Whether an edge is a pair line of an opened directory rather than a reference between two symbols. */
export const isPairLine = (edge: LocalEdge): boolean => edge.gathered !== undefined;

/** How many of the graph's links an edge stands for: a pair line's count, one for a reference. */
export const linksOf = (edge: LocalEdge): number => edge.gathered ?? 1;

/**
 * How many cards a column holds before its rank wraps, so that the ranks stand about as wide as tall, as the grid's
 * cards do: the least number of rows at which the wrapped ranks take no more columns than that. It is decided by the
 * ranks alone, so the same directory wraps the same way in every window, and no resize moves a card. A first cap, the
 * cards the frame holds at reading size (three at 1440 by 900), drew this repository's sixty-file directory 23 columns
 * and 10,845 px wide, against 9 ranks and 4,399 px unwrapped (2026-11-12), and changed with the window's height.
 */
export function squareRows(ranked: readonly (readonly string[])[]): number {
  const tallest = Math.max(1, ...ranked.map(rank => rank.length));
  for (let rows = 1; rows < tallest; rows++) {
    if (ranked.reduce((columns, rank) => columns + Math.ceil(rank.length / rows), 0) <= rows) return rows;
  }
  return tallest;
}

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
  /** How many cards a column holds before its rank wraps into a neighbouring column; null wraps nothing. */
  rows: number | null;
}

/**
 * The columns of a picture whose opened directories stand in flow order.
 *
 * The ranks stand left to right, wrapped ({@link wrapRanks}). Then each opened directory that has a file in them, the
 * deepest first so that a directory counts what the directories under it took:
 * - its closed boxes go one to a column across the columns the directory already holds, again from the first when there
 *   are more boxes than columns, and at the head of each column's list: a band above its files (the ordering keeps them
 *   first, by `leading`), since a person browsing looks for the next directory to open before anything else (the root's
 *   answer, 2026-11-12);
 * - its files that no line joins stand together in a block after its last column, read row by row, as tall as its
 *   tallest column, boxes counted, or the square root of their count, whichever is more.
 *
 * An opened directory with no file in the ranks, one that holds only subdirectories or whose files join nothing, is laid
 * out as the grid lays it (`placeMembers` in `branches.ts`): from its nearest ancestor's first column, else the first,
 * about as wide as tall. So a picture with no line and no pin is the grid's picture.
 *
 * Every id given stands in exactly one column, and the ranks' cards keep their order across the columns.
 */
export function flowColumns(input: FlowInput): string[][] {
  const columns = wrapRanks(input.ranked, input.rows);
  const ranked = columns.map(column => [...column]);
  const holding = (from: readonly (readonly string[])[], directory: string): number[] =>
    from.flatMap((column, index) => (column.some(id => under(input.directoryOf(id), directory)) ? [index] : []));
  const push = (column: number, id: string): void => {
    while (columns.length <= column) columns.push([]);
    columns[column].push(id);
  };
  const depth = (directory: string): number => (directory === "" ? 0 : directory.split("/").length);
  const flowing = [...input.opened].filter(directory => holding(ranked, directory).length > 0);
  for (const directory of flowing.sort((a, b) => depth(b) - depth(a) || a.localeCompare(b))) {
    const held = holding(columns, directory);
    const first = Math.min(...held), last = Math.max(...held), span = last - first + 1;
    const heads = new Map<number, string[]>();
    input.boxesOf(directory).forEach((box, index) => {
      const column = first + (index % span);
      (heads.get(column) ?? heads.set(column, []).get(column)!).push(box);
    });
    for (const [column, boxes] of heads) columns[column].unshift(...boxes);
    const loose = input.looseOf(directory);
    if (!loose.length) continue;
    const tallest = Math.max(...held.map(column => columns[column].filter(id => under(input.directoryOf(id), directory)).length));
    const rows = Math.max(tallest, Math.ceil(Math.sqrt(loose.length)));
    const width = Math.ceil(loose.length / rows);
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
  return columns;
}

/** A directory's parent, "" for a directory at the scan root. */
function parentOf(directory: string): string {
  const slash = directory.lastIndexOf("/");
  return slash > 0 ? directory.slice(0, slash) : "";
}
