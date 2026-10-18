/**
 * Which changes of the mainline the history command regenerates: the lever of
 * granularity at generation, one of the two the plan's C14 asks for, since
 * "there is no one right granularity, depending on the size of the history"
 * (the owner, 2026-10-17).
 *
 * @remarks
 * The deltas between two sampled changes are exact whatever is skipped, since
 * each is derived from the two changes' own shapes and the version control's
 * word between them; what sampling skips is the intermediate states, lost to
 * the sequence until a finer run regenerates them. Every rule keeps the first
 * change of its window, where the sequence's knowledge begins, and the last,
 * the head, so that a sequence spans what it samples.
 *
 * @module
 */

import type { Sampling } from "./format";
import type { MainlineChange } from "./versionControl";

/**
 * The indices of the changes the rule samples, ascending.
 *
 * @param changes - The mainline, oldest first.
 * @param sampling - The rule, and the date the window begins at, if any.
 * @param tagged - The ids of the changes a tag names, for the `tags` rule.
 */
export function sampleChanges(changes: readonly MainlineChange[], sampling: Sampling, tagged: ReadonlySet<string> = new Set()): number[] {
  const window = windowOf(changes, sampling.since);
  if (window.length === 0) {
    return [];
  }
  const chosen = new Set<number>([window[0], window[window.length - 1]]);
  window.forEach((index, position) => {
    if (keeps(sampling, changes, window, position, tagged)) {
      chosen.add(index);
    }
  });
  return [...chosen].sort((a, b) => a - b);
}

/** The indices of the changes on or after `since`, or all of them. */
function windowOf(changes: readonly MainlineChange[], since: string | undefined): number[] {
  const indices = changes.map((_, index) => index);
  if (since === undefined) {
    return indices;
  }
  const from = Date.parse(since);
  if (Number.isNaN(from)) {
    throw new Error(`${since} is not a date`);
  }
  return indices.filter((index) => Date.parse(changes[index].date) >= from);
}

function keeps(sampling: Sampling, changes: readonly MainlineChange[], window: readonly number[], position: number, tagged: ReadonlySet<string>): boolean {
  const change = changes[window[position]];
  const next = position + 1 < window.length ? changes[window[position + 1]] : undefined;
  switch (sampling.rule) {
    case "every-commit":
      return true;
    case "every-nth": {
      const n = sampling.n ?? 1;
      if (!Number.isInteger(n) || n < 1) {
        throw new Error(`every n-th change needs an n of one or more, not ${n}`);
      }
      return position % n === 0;
    }
    case "daily":
      // The last change of each run of one day: the day's last when the mainline's dates rise, as they do.
      return next === undefined || dayOf(change.date) !== dayOf(next.date);
    case "weekly":
      return next === undefined || weekOf(change.date) !== weekOf(next.date);
    case "tags":
      return tagged.has(change.id);
  }
}

/** The UTC day of an ISO date, as `YYYY-MM-DD`. */
function dayOf(date: string): string {
  return new Date(Date.parse(date)).toISOString().slice(0, 10);
}

/** The UTC day of the Monday that begins the week of an ISO date. */
function weekOf(date: string): string {
  const day = new Date(Date.parse(date));
  const sinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() - sinceMonday)).toISOString().slice(0, 10);
}
