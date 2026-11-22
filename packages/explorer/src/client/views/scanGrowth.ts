/**
 * A scan's rhythm, for the trial that lets the 3D Local Map fill while a person watches (the owner, 2026-11-21: "I
 * aspire to be able to let users do some exploring in 2D/3D local map _while the scan is happening_ ... if our scanning
 * process is heavily batch-oriented, that might be totally ugly and stupid-looking unless we buffer what we add to the
 * rendered space piecemeal ourselves").
 *
 * Nothing here scans. The bundle's finished graph is cut to the files that have "arrived" at a moment of a clock, in
 * the order a scan would finish them, so that the look can be judged before the engine is changed (the root's
 * recommendation to the owner: see it before building it). The rhythm is the one the root measured on one scan of this
 * repository on 2026-11-22: 1,292 files in 21 s, of which about 3 s listing the folder, 5 s of a first pass in which no
 * file is finished, and 12 s in which files finish one at a time in path order. Each of the three parts is scaled by
 * the number of files, so a small sample is over as soon as its scan would be. What a file uses is known when it
 * arrives; what uses it is complete only at the end, since any later file may add to it, and that is what the cut
 * graph shows: a wire stands once both its files have arrived.
 *
 * The words of the sign are the owner's (2026-11-21): "Listing Files... ({fileCountSoFar})" and "Reading File
 * Text... ({scannedCount}/{listedCount})", with the product's one ellipsis character.
 *
 * Pure-function module: no DOM. `scanGrowthPlay.ts` plays it.
 *
 * @module scanGrowth
 */

import type { HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { changeAt, seek } from "@live-documentation/engine/live-docs/history/sequence";

import type { ExplorerGraphPayload } from "../../shared/types";
import type { ScanPace } from "../types";

/** One scan of this repository as the root measured it on 2026-11-22: its files, and the milliseconds of its three parts. */
export const MEASURED_SCAN = { files: 1292, listing: 3000, firstPass: 5000, arriving: 12000 } as const;

/** How many times slower the slower pace is: the owner's work machine is a weak virtual machine. */
export const SLOWER_PACE = 4;

/** A scan's three parts for a number of files, in milliseconds: the listing, the first pass that finishes no file, and the arrivals. */
export interface ScanSchedule {
  readonly files: number;
  readonly listing: number;
  readonly firstPass: number;
  readonly arriving: number;
}

/** The measured scan's rhythm for this many files at a pace, each part in proportion to the files. */
export function scanSchedule(files: number, pace: ScanPace): ScanSchedule {
  const scale = Math.max(0, files) / MEASURED_SCAN.files * (pace === "slower" ? SLOWER_PACE : 1);
  return { files: Math.max(0, files), listing: MEASURED_SCAN.listing * scale, firstPass: MEASURED_SCAN.firstPass * scale, arriving: MEASURED_SCAN.arriving * scale };
}

/** Where a scan stands: listing, with the files listed so far; reading, with the files finished of those listed; or done. */
export type ScanProgress =
  | { readonly phase: "listing"; readonly listed: number }
  | { readonly phase: "reading"; readonly read: number; readonly listed: number }
  | { readonly phase: "done" };

/**
 * Where a scan of this schedule stands so many milliseconds after it began. The listing counts up evenly to every file;
 * the first pass finishes none; then the files finish evenly, the last at the schedule's end, where the scan is done.
 */
export function scanProgress(schedule: ScanSchedule, elapsed: number): ScanProgress {
  const { files, listing, firstPass, arriving } = schedule;
  if (elapsed < listing) return { phase: "listing", listed: Math.min(files, Math.floor(files * Math.max(0, elapsed) / listing)) };
  const since = elapsed - listing - firstPass;
  if (since < 0) return { phase: "reading", read: 0, listed: files };
  if (since >= arriving) return { phase: "done" };
  return { phase: "reading", read: Math.min(files, Math.floor(files * since / arriving)), listed: files };
}

/** How many files have arrived at a point of the scan: none before the first pass ends, every one when it is done. */
export function arrivedAt(schedule: ScanSchedule, progress: ScanProgress): number {
  return progress.phase === "done" ? schedule.files : progress.phase === "reading" ? progress.read : 0;
}

/** The sign's words, the owner's: the files listed so far, then the files read of those listed; none once the scan is done. */
export function progressWords(progress: ScanProgress): string {
  const n = (count: number): string => count.toLocaleString("en-US");
  if (progress.phase === "listing") return `Listing Files… (${n(progress.listed)})`;
  if (progress.phase === "reading") return `Reading File Text… (${n(progress.read)}/${n(progress.listed)})`;
  return "";
}

/** The files in the order a scan finishes them: by path, compared by code unit, so that the order is the same on every machine. */
export function pathOrder(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * The files in the order they were first committed: by the step of the history at which each was born, followed back
 * through its renames; files of one step by path; a file the history does not hold, last, by path.
 */
export function firstCommitOrder(ids: readonly string[], births: ReadonlyMap<string, number>): string[] {
  const born = (id: string): number => births.get(id) ?? Infinity;
  return [...ids].sort((a, b) => born(a) - born(b) || (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * The step at which each file standing at the history's last step was born, by its path there: zero for a file that
 * stood at the base, where a windowed or shallow history begins and so knows no earlier; a renamed file keeps the step
 * of the path it began under. One pass over the steps.
 */
export function birthSteps(sequence: HistorySequence): Map<string, number> {
  const births = new Map<string, number>([...seek(sequence, 0).files.keys()].map(path => [path, 0]));
  for (let step = 1; step <= sequence.steps.length; step++) {
    const change = changeAt(sequence, step);
    for (const [from, to] of change.renamed) {
      const born = births.get(from);
      births.delete(from);
      if (born !== undefined) births.set(to, born);
    }
    for (const path of change.dead) births.delete(path);
    for (const [path] of change.born) births.set(path, step);
  }
  return births;
}

/**
 * The graph as a scan has it once the first `count` files of `order` have arrived: those files, in the graph's own
 * order, and every link both of whose files have arrived. The counts are the cut graph's own.
 */
export function arrivedGraph(graph: ExplorerGraphPayload, order: readonly string[], count: number): ExplorerGraphPayload {
  const arrived = new Set(order.slice(0, Math.max(0, count)));
  const id = (end: string | { id: string }): string => typeof end === "string" ? end : end.id;
  const nodes = graph.nodes.filter(node => arrived.has(node.id));
  const links = graph.links.filter(link => arrived.has(id(link.source)) && arrived.has(id(link.target)));
  return { nodes, links, stats: { nodes: nodes.length, links: links.length, references: links.reduce((sum, link) => sum + (link.referenceCount ?? 1), 0) } };
}
