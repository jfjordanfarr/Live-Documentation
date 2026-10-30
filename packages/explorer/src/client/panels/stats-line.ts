/**
 * The sidebar's line of counts: the files, the documented references between
 * them, and the dependency lines whose target the scan does not hold. The
 * references are the same total Knowledge Sources prints, one number in both
 * places (the owner's decision, 2026-10-30). The line is written from
 * whatever stats the picture stands on: today's, or a moment of the history,
 * which knows no dependency lines and so leaves that count out.
 *
 * Pure-function module: no DOM.
 *
 * @module stats-line
 */

import type { ExplorerGraphStats } from "../../shared/types";

/** The line for the stats, with thousands separators. */
export function statsLineOf(stats: ExplorerGraphStats): string {
  const parts = [`${stats.nodes.toLocaleString()} files`, `${stats.references.toLocaleString()} references`];
  if (stats.dependenciesOutsideScan !== undefined) {
    parts.push(`${stats.dependenciesOutsideScan.toLocaleString()} dependencies outside the scan`);
  }
  return parts.join(", ");
}
