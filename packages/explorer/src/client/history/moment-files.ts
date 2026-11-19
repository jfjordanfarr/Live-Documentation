/**
 * A moment of the history as the 2D Local Map would draw it at file level, the first rung of the history in 2D (the
 * owner, 2026-11-19: "We should be able to scrub through history in the same shared control whose state is continuous
 * in 2D and 3D local map"). The history carries files, their directories, one count per directed pair of files and
 * each file's symbol count, and no symbol's name, so the 2D picture of a moment is the Flow look's files-only cards: a
 * card per file with its kind and its count, the directories that hold them, and one line per pair of files each way
 * between the cards' node-level hubs, carrying the pair's count of references, as an opened directory's pair lines do
 * today (`directory-flow.ts`). Nothing here is drawn yet; the 2D map does not show the history.
 *
 * Pure-function module: no DOM.
 *
 * @module moment-files
 */

import { edgeEnds, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import type { ExplorerGraphPayload } from "../../shared/types";
import { directoryIndex } from "../views/localView/branches";
import type { LocalEdge } from "../views/localView/types";
import { NODE_HUB } from "../views/localView/wire-gathering";
import { snapshotGraphOf } from "./snapshot";

/** What the 2D map would draw of a moment at file level. */
export interface FileLevelPicture {
  /**
   * The moment's graph in the shape the 2D map's builder takes (`buildBranches`): a node per file with its kind and its
   * symbol count and no symbol named, a link per directed pair of files with its count. The same graph the 3D map draws.
   */
  graph: ExplorerGraphPayload;
  /** Every directory that holds a file at the moment, the scan root ("") among them, ascending. */
  directories: string[];
  /**
   * One line per pair of files each way, from the file that uses to the file that offers, between their node-level hubs,
   * carrying how many references it stands for, in the order of the pairs' paths. A file's references to itself make none.
   */
  lines: LocalEdge[];
}

const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** The file-level picture of a moment's shape. */
export function fileLevelPicture(shape: Shape): FileLevelPicture {
  const graph = snapshotGraphOf(shape);
  const directories = [...directoryIndex(graph.nodes).keys()].sort(compare);
  const lines: LocalEdge[] = [...shape.edges]
    .map(([key, count]) => [edgeEnds(key), count] as const)
    .filter(([[from, to]]) => from !== to)
    .sort(([[a, b]], [[c, d]]) => compare(a, c) || compare(b, d))
    .map(([[from, to], count]) => ({ sourceId: from, targetId: to, sourceSymbol: NODE_HUB, targetSymbol: NODE_HUB, kind: "dependency", direction: "inbound", referenceCount: count, gathered: count }));
  return { graph, directories, lines };
}
