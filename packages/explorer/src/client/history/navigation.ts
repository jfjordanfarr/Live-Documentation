/** Finding a commit and viewing a contiguous interval without dropping any history from the bundle. */
import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import { tickModel, type TickModel, type TickModelInput } from "./tick-model";

/** Inclusive step indices in the complete sequence, not a sampled or rebuilt history. */
export type HistoryRange = readonly [first: number, last: number];

/** Find commits by hash, displayed date and message; exact hash prefixes lead, otherwise most recent first. */
export function findCommits(commits: readonly CommitInfo[], query: string): number[] {
  const text = query.trim().toLowerCase(), words = text.split(/\s+/u).filter(Boolean);
  return commits.flatMap((commit, step) => words.every(word => `${commit.id} ${commit.date.slice(0, 10)} ${commit.subject}`.toLowerCase().includes(word)) ? [step] : [])
    .sort((a, b) => Number(!!text && commits[b].id.toLowerCase().startsWith(text)) - Number(!!text && commits[a].id.toLowerCase().startsWith(text)) || b - a);
}

/**
 * Recompute tick density inside a selected interval while keeping every returned step in the sequence's numbering. The
 * granularity is chosen over the interval's own steps, so that as a zoom narrows the range months resolve into weeks,
 * days and single commits. The stops are the interval's own, its two ends among them, and beyond it the whole history's,
 * so that the coarse pair can carry the thumb past an end of the interval to the next mark (2026-11-19).
 */
export function rangedTickModel(input: TickModelInput, range: HistoryRange): TickModel {
  const [first, last] = range;
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last < first || last >= input.dates.length) throw new RangeError("The history range must name existing steps in order.");
  if (first === 0 && last === input.dates.length - 1) return tickModel(input);
  const whole = tickModel(input);
  const local = tickModel({ ...input, dates: input.dates.slice(first, last + 1), ticks: {
    major: input.ticks.major.filter(step => step >= first && step <= last).map(step => step - first),
    minor: input.ticks.minor.filter(step => step >= first && step <= last).map(step => step - first)
  } });
  return {
    ...local,
    positions: input.dates.map((_date, step) => step < first ? -1 : step > last ? 2 : local.positions[step - first]),
    ticks: local.ticks.map(tick => ({ ...tick, step: tick.step + first,
      // The first visible step is not the history's base and retains its actual change weight.
      ...(tick.step === 0 && input.pinned ? { weight: input.ticks.major.includes(first) ? "major" as const : input.ticks.minor.includes(first) ? "minor" as const : "quiet" as const } : {}) })),
    stops: [...whole.stops.filter(step => step < first), ...local.stops.map(step => step + first), ...whole.stops.filter(step => step > last)],
    ruler: local.ruler.map(label => ({ ...label, step: label.step + first }))
  };
}
