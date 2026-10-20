/**
 * A moment of the history the 3D Local Map shows in place of today: the step
 * and its commit, the picture's data as the snapshot gives it, and the names
 * of today's things at that moment and of its things today, followed through
 * every rename between (the plan's C4 and scenario 9, 2026-10-18). The view
 * reads its pins, its subject and its open directories through the first, so
 * that a pinned file is found under its old name; a click on a sphere of the
 * past goes through the second to the file as it stands today.
 *
 * @module moment
 */

import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type { ExplorerGraphPayload } from "../../shared/types";

/** One step of the history as the view draws it. */
export interface HistoryMoment {
  step: number;
  commit: CommitInfo;
  graph: ExplorerGraphPayload;
  /** The documents the step's files linked to then, by their paths at the step: the moment's Related Docs. */
  relatedDocLinks: RelatedDocLink[];
  /** A file of today's bundle, by its path, as it stands at the step; undefined when it does not stand there. */
  fileAt(todayPath: string): string | undefined;
  /** A directory of today, by its path, as it stands at the step, whether or not a file stands under it there. */
  directoryAt(todayDirectory: string): string;
  /** A file of the step, by its path there, as it stands today; null when it is gone or today's bundle lacks it. */
  fileToday(path: string): string | null;
  /** A directory of the step, by its path there, as it stands today. */
  directoryToday(directory: string): string;
}
