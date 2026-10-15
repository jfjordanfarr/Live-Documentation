/**
 * Where the Explorer opens when no address, no remembered place and no
 * configuration names a file: the one entry point the docs declare, the root
 * when they declare several or none that can be landed on, and a guess by
 * file name only when the docs declare no entry at all.
 *
 * @remarks
 * An entry that a person would open a system at is a program, a command, a
 * module or a declared start file; a tooling input, an opening served and a
 * test are entries that start the file without being where a reading starts.
 * Entries under the configuration's sample roots are inputs to the tool, not
 * the scanned system, and never the landing. Pure function, Vitest-tested.
 */

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

/** Where to open: a file, the root landing with nothing pinned, or the file-name guess. */
export type Landing = { kind: "file"; codePath: string } | { kind: "root" } | { kind: "guess" };

const LANDING_REASONS: ReadonlySet<string> = new Set(["program", "command", "module", "declared"]);

/** True when the path lies under one of the sample roots. */
export function underSampleRoot(codePath: string, sampleRoots: readonly string[]): boolean {
  return sampleRoots.some(root => root === "." || codePath === root || codePath.startsWith(`${root}/`));
}

/** The landing a graph's Entry lines decide. */
export function landingOf(graph: LiveDocGraph, sampleRoots: readonly string[] = []): Landing {
  const files = Object.values(graph.files);
  if (!files.some(file => file.entries.length > 0)) return { kind: "guess" };
  const candidates = files.filter(file => file.entries.some(entry => LANDING_REASONS.has(entry.reason)) && !underSampleRoot(file.codePath, sampleRoots));
  return candidates.length === 1 ? { kind: "file", codePath: candidates[0].codePath } : { kind: "root" };
}
