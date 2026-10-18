/**
 * The ticks of the history's scrubber, as one pure function: from the steps'
 * dates, the pins' major and minor ticks (the engine's `ticksFor`, the plan's
 * C3) and a chosen granularity and axis, to the ticks the scrubber draws, the
 * stops the step key moves between, and the ruler of dates beneath. The view's
 * half of the granularity seam (the plan's C14; the owner, 2026-10-17: "there
 * is no one right granularity, depending on the size of the history").
 *
 * A major tick is a step that changed the shape of what is pinned, or, with
 * nothing pinned, any step; a minor tick a step in which the version control
 * saw a pinned file's content change and the graph saw nothing; every other
 * step is quiet and drawn faint, so that the whole history stays in view. A
 * coarser granularity groups the steps by calendar period (UTC) and draws one
 * tick per period, at the period's last step, carrying the heaviest weight of
 * its steps. The automatic choice is the finest granularity whose ticks fit
 * the budget, so that a five-commit repository shows five ticks and a long
 * history shows months. Whatever the ticks, a drag passes through every step.
 *
 * Pure-function module: no DOM. The scrubber draws what this returns.
 *
 * @module tick-model
 */

import type { Ticks } from "@live-documentation/engine/live-docs/history/ticks";

import type { HistoryAxis, HistoryGranularity } from "../types";

/** How many ticks a track shows at most before the automatic choice coarsens them. */
export const TICK_BUDGET = 120;

/** What the model is made from. */
export interface TickModelInput {
  /** Every step's commit date, step 0 first, as ISO 8601. */
  dates: readonly string[];
  /** The engine's ticks for the pins: the steps that changed the shape of what is pinned, and the content-only ones. */
  ticks: Ticks;
  /** Whether anything is pinned; with nothing pinned every step is a major tick, the beginning among them. */
  pinned: boolean;
  granularity: HistoryGranularity;
  axis: HistoryAxis;
}

/** How a tick is drawn: a change of the shape of what is pinned, a change of content alone, or neither. */
export type TickWeight = "major" | "minor" | "quiet";

/** One tick drawn: the step the thumb lands on, where it stands on the track, and its weight. */
export interface Tick {
  step: number;
  /** Along the track, from 0 at the beginning to 1 at the end. */
  position: number;
  weight: TickWeight;
  /** How many steps the tick stands for: one, or a period's. */
  steps: number;
}

/** One label of the ruler beneath the ticks. */
export interface RulerLabel {
  step: number;
  position: number;
  text: string;
}

/** What the scrubber draws and the keys move by. */
export interface TickModel {
  /** The granularity in force, the automatic choice resolved. */
  granularity: Exclude<HistoryGranularity, "auto">;
  ticks: Tick[];
  /** The steps the step key moves between, ascending: the major ticks', with the beginning and the end. */
  stops: number[];
  ruler: RulerLabel[];
}

const DAY = 24 * 60 * 60 * 1000;

/** The instants of the dates, each at least its predecessor's, so that an out-of-order commit date cannot fold the track. */
function instants(dates: readonly string[]): number[] {
  const result: number[] = [];
  for (const date of dates) {
    const parsed = Date.parse(date);
    const instant = Number.isFinite(parsed) ? parsed : result[result.length - 1] ?? 0;
    result.push(Math.max(instant, result[result.length - 1] ?? -Infinity));
  }
  return result;
}

/** Where a step stands on the track: by its index, or by its date between the first and the last. */
export function positionOfStep(dates: readonly string[], axis: HistoryAxis, step: number): number {
  const last = dates.length - 1;
  if (last <= 0) return 0;
  if (axis === "steps") return step / last;
  const when = instants(dates);
  const span = when[last] - when[0];
  return span > 0 ? (when[step] - when[0]) / span : step / last;
}

/**
 * The step a position on the track names: by index the nearest step; by date the latest step at or before the instant
 * the position names, which is the shape as of that date, so that a drag through a quiet stretch holds the step before it.
 */
export function stepAtPosition(dates: readonly string[], axis: HistoryAxis, position: number): number {
  const last = dates.length - 1;
  if (last <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, position));
  if (axis === "steps") return Math.round(clamped * last);
  const when = instants(dates);
  const span = when[last] - when[0];
  if (span <= 0) return Math.round(clamped * last);
  const instant = when[0] + clamped * span;
  let step = 0;
  while (step < last && when[step + 1] <= instant) step += 1;
  return clamped >= 1 ? last : step;
}

/** The calendar period a date falls in, in UTC: the day, the week (from its Monday) or the month. */
export function periodOf(date: string, unit: "day" | "week" | "month"): string {
  const when = new Date(date);
  if (Number.isNaN(when.getTime())) return "";
  if (unit === "month") return `${when.getUTCFullYear()}-${String(when.getUTCMonth() + 1).padStart(2, "0")}`;
  if (unit === "week") {
    const monday = new Date(Date.UTC(when.getUTCFullYear(), when.getUTCMonth(), when.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    return monday.toISOString().slice(0, 10);
  }
  return when.toISOString().slice(0, 10);
}

const WEIGHT_RANK: Record<TickWeight, number> = { quiet: 0, minor: 1, major: 2 };

/** The ticks of one granularity, before the positions are read. */
function ticksAt(input: TickModelInput, granularity: Exclude<HistoryGranularity, "auto">): Array<Pick<Tick, "step" | "weight" | "steps">> {
  const last = input.dates.length - 1;
  const major = new Set(input.ticks.major);
  const minor = new Set(input.ticks.minor);
  const weightOf = (step: number): TickWeight => step === 0 ? (input.pinned ? "quiet" : "major") : major.has(step) ? "major" : minor.has(step) ? "minor" : "quiet";
  if (granularity === "step" || granularity === "salient") {
    const ticks: Array<Pick<Tick, "step" | "weight" | "steps">> = [];
    for (let step = 0; step <= last; step += 1) {
      const weight = weightOf(step);
      if (granularity === "salient" && weight === "quiet" && step !== 0) continue;
      ticks.push({ step, weight, steps: 1 });
    }
    return ticks;
  }
  // One tick per period, at its last step, carrying the heaviest weight of its steps; the beginning stands alone.
  const ticks: Array<Pick<Tick, "step" | "weight" | "steps">> = [{ step: 0, weight: weightOf(0), steps: 1 }];
  let period = "";
  for (let step = 1; step <= last; step += 1) {
    const key = periodOf(input.dates[step], granularity);
    const weight = weightOf(step);
    const current = ticks[ticks.length - 1];
    if (key === period && current.step !== 0) {
      current.step = step;
      current.steps += 1;
      if (WEIGHT_RANK[weight] > WEIGHT_RANK[current.weight]) current.weight = weight;
    } else {
      ticks.push({ step, weight, steps: 1 });
      period = key;
    }
  }
  return ticks;
}

/** The finest granularity whose ticks fit the budget; months when none does. */
export function automaticGranularity(input: Omit<TickModelInput, "granularity">): Exclude<HistoryGranularity, "auto"> {
  for (const granularity of ["step", "day", "week", "month"] as const) {
    if (ticksAt({ ...input, granularity }, granularity).length <= TICK_BUDGET) return granularity;
  }
  return "month";
}

/**
 * The ruler's labels: the first step of every year when the history spans more than two years, of every month when it
 * spans more than two, else of every day; each read where its step stands. The scrubber hides the labels that would
 * land on their neighbours.
 */
export function rulerOf(dates: readonly string[], axis: HistoryAxis): RulerLabel[] {
  const last = dates.length - 1;
  if (last < 0) return [];
  const when = instants(dates);
  const span = when[last] - when[0];
  const unit: "year" | "month" | "day" = span > 2 * 365 * DAY ? "year" : span > 60 * DAY ? "month" : "day";
  const labels: RulerLabel[] = [];
  let period = "";
  for (let step = 0; step <= last; step += 1) {
    const date = new Date(when[step]);
    const key = unit === "year" ? String(date.getUTCFullYear()) : unit === "month" ? periodOf(date.toISOString(), "month") : periodOf(date.toISOString(), "day");
    if (key === period) continue;
    period = key;
    labels.push({ step, position: positionOfStep(dates, axis, step), text: labelText(date, unit, labels.length === 0) });
  }
  return labels;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function labelText(date: Date, unit: "year" | "month" | "day", first: boolean): string {
  const year = date.getUTCFullYear();
  const month = MONTHS[date.getUTCMonth()];
  if (unit === "year") return String(year);
  if (unit === "month") return `${month} ${year}`;
  return first ? `${date.getUTCDate()} ${month} ${year}` : `${date.getUTCDate()} ${month}`;
}

/** The model the scrubber draws from. */
export function tickModel(input: TickModelInput): TickModel {
  const granularity = input.granularity === "auto" ? automaticGranularity(input) : input.granularity;
  const ticks: Tick[] = ticksAt(input, granularity).map((tick) => ({ ...tick, position: positionOfStep(input.dates, input.axis, tick.step) }));
  const last = input.dates.length - 1;
  const stops = [...new Set([0, ...ticks.filter((tick) => tick.weight === "major").map((tick) => tick.step), Math.max(0, last)])].sort((a, b) => a - b);
  return { granularity, ticks, stops, ruler: rulerOf(input.dates, input.axis) };
}

/** The stop the step key reaches from a step: the next major tick forward, the previous one back, the ends at the ends. */
export function nextStop(model: TickModel, step: number, direction: 1 | -1): number {
  if (direction === 1) return model.stops.find((stop) => stop > step) ?? model.stops[model.stops.length - 1] ?? step;
  for (let index = model.stops.length - 1; index >= 0; index -= 1) {
    if (model.stops[index] < step) return model.stops[index];
  }
  return model.stops[0] ?? step;
}
