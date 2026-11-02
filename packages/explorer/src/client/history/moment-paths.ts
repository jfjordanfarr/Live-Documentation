/**
 * The ground a path is asked over: today's files and wires, or, while the 3D
 * Local Map shows a moment of the history, that moment's (2026-10-30). The
 * pathfinder reads the same three things either way: the files by their names
 * on the ground, the links between them, and a file of today as it is named
 * there. A moment's ground is the moment's own graph, which the history
 * control has already built for the view, so nothing is derived a second
 * time; its names are the moment's, so a path can run through a file that is
 * gone today, and an end that does not stand at the moment has no files.
 *
 * Search and path results keep the displayed moment's names. Selection is converted to a persistent historical
 * reference only when a person chooses it; a reachable past-only file must not disappear from the offered results.
 *
 * Pure-function module: no DOM.
 *
 * @module moment-paths
 */

import type { HistoryMoment } from "./moment";
import type { ExplorerLinkPayload, ExplorerNodePayload } from "../../shared/types";
import { under } from "../views/localView/directory-state";
import type { RetainedItem } from "../views/retained-state";

/** The files and wires a path is asked over, and the names of today's things on them. */
export interface PathGround {
  /** The files, by their names on this ground. */
  nodesById: Map<string, ExplorerNodePayload>;
  /** The wires between them, in the shape `findPath`, `reachOf` and `referencesAgainstPath` read. */
  links: ExplorerLinkPayload[];
  /** A file of today, by its id, as named on this ground; undefined where it does not stand. */
  fileAt(todayId: string): string | undefined;
  /** A directory of today as named on this ground. */
  directoryAt(todayDirectory: string): string;
  /** A file of this ground, by its name here, as it stands today; null where it is gone. */
  fileToday(id: string): string | null;
}

/** Today's ground: the bundle's files and links, every name its own. */
export function todayGround(nodesById: Map<string, ExplorerNodePayload>, links: ExplorerLinkPayload[]): PathGround {
  return {
    nodesById,
    links,
    fileAt: id => (nodesById.has(id) ? id : undefined),
    directoryAt: directory => directory,
    fileToday: id => (nodesById.has(id) ? id : null)
  };
}

/** A moment's ground: its own graph, and today's things followed to it, and back, through every rename between. */
export function momentGround(moment: Pick<HistoryMoment, "graph" | "fileAt" | "directoryAt" | "fileToday">): PathGround {
  return {
    nodesById: new Map(moment.graph.nodes.map(node => [node.id, node])),
    links: moment.graph.links,
    fileAt: id => moment.fileAt(id),
    directoryAt: directory => moment.directoryAt(directory),
    fileToday: id => moment.fileToday(id)
  };
}

/** The files an end of a path stands for on the ground: its one file where it stands, or every file under its directory. */
export function endFiles(item: RetainedItem, ground: PathGround): string[] {
  if (item.kind === "pin") {
    const at = ground.fileAt(item.pin.nodeId);
    return at === undefined ? [] : [at];
  }
  const directory = ground.directoryAt(item.directory);
  return [...ground.nodesById.keys()].filter(id => under(id, directory));
}
