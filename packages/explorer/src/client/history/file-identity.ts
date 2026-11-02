/**
 * Portable identities for files that exist in the history but not in today's bundle. A surviving file keeps today's
 * ordinary id. A past-only file is anchored to its creation (or the known base), so its renames share one identity and
 * a later file at the same path is distinct. The engine's lifetime-aware walk is the authority; these helpers add no
 * source facts to the sequence. Introduced for the November 1 review's unsearchable GraphStore files.
 */
import type { HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { changeAt, commitAt, seek } from "@live-documentation/engine/live-docs/history/sequence";
import { followPath, type FollowedPath } from "@live-documentation/engine/live-docs/history/ticks";

import { snapshotGraphOf } from "./snapshot";
import type { ExplorerNodePayload } from "../../shared/types";
import { directoriesOf } from "../search/graph-search";

const PREFIX = "history:";

/** The known moment and path a portable historical file names; malformed or foreign references are absent. */
export function historicalOrigin(sequence: HistorySequence, id: string): { path: string; step: number } | null {
  if (!id.startsWith(PREFIX)) return null;
  try {
    const value: unknown = JSON.parse(id.slice(PREFIX.length));
    if (!Array.isArray(value) || value.length !== 2 || !value.every(part => typeof part === "string" && part.length > 0)) return null;
    const [commit, path] = value as [string, string];
    const step = sequence.base.commit.id === commit ? 0 : sequence.steps.findIndex(entry => entry.commit.id === commit) + 1;
    if (step === 0 && sequence.base.commit.id !== commit) return null;
    return { path, step };
  } catch { return null; }
}

/** Follow either an ordinary current-file id or a portable historical identity to the requested moment. */
export function referenceAt(sequence: HistorySequence, id: string, step: number): FollowedPath {
  const origin = historicalOrigin(sequence, id);
  if (id.startsWith(PREFIX) && !origin) return { path: null, step };
  return followPath(sequence, origin?.path ?? id, origin?.step ?? sequence.steps.length, step);
}

/** A file selected at a moment, as a stable id suitable for pins, inspection, paths and sharing. */
export function referenceFor(sequence: HistorySequence, path: string, step: number, todayHas: (path: string) => boolean): string {
  const today = followPath(sequence, path, step, sequence.steps.length);
  if (today.path !== null && todayHas(today.path)) return today.path;
  const beginning = followPath(sequence, path, step, 0);
  const birth = beginning.path === null ? beginning.step : 0;
  const original = followPath(sequence, path, step, birth).path;
  if (original === null) throw new Error(`No historical identity for ${path} at step ${step}.`);
  return PREFIX + JSON.stringify([commitAt(sequence, birth).id, original]);
}

/** Validate and recover a historical selection from canonical snapshot facts, never from its untrusted address alone. */
export function historicalNode(sequence: HistorySequence, id: string): ExplorerNodePayload | undefined {
  const origin = historicalOrigin(sequence, id);
  if (!origin) return undefined;
  const graph = snapshotGraphOf(seek(sequence, origin.step));
  const node = graph.nodes.find(file => file.id === origin.path);
  return node ? { ...node, id } : undefined;
}

/** Directory names actually containing source files somewhere in the sequence; citation targets do not create folders. */
export function historicalDirectories(sequence: HistorySequence): Set<string> {
  const files = new Set(sequence.base.files.map(([path]) => sequence.paths[path]));
  for (let step = 1; step <= sequence.steps.length; step++) {
    const change = changeAt(sequence, step);
    for (const [path] of change.born) files.add(path);
    for (const [, path] of change.renamed) files.add(path);
  }
  return new Set(directoriesOf([...files].map(id => ({ id }))));
}
