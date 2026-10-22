import { describe, expect, it } from "vitest";

import { automaticGranularity, nextStop, periodOf, positionOfStep, rulerOf, stepAtPosition, tickModel, TICK_BUDGET } from "./tick-model";

/** One commit a day from the 5th of January 2026, at noon UTC. */
const daily = (count: number): string[] => Array.from({ length: count }, (_, step) => new Date(Date.UTC(2026, 0, 5 + step, 12)).toISOString());

/** Steps 0 to 2 in October 2025, a quiet half-year, then 3 to 6 in April 2026, hours apart. */
const gapped = [
  "2025-10-16T10:00:00Z", "2025-10-17T10:00:00Z", "2025-10-18T10:00:00Z",
  "2026-04-18T10:00:00Z", "2026-04-18T12:00:00Z", "2026-04-18T14:00:00Z", "2026-04-19T10:00:00Z"
];

const EVERY = (steps: number) => ({ major: Array.from({ length: steps }, (_, index) => index + 1), minor: [] as number[] });

describe("positions on the track", () => {
  it("lays steps out evenly by index, and by date between the first and the last, where a quiet half-year is a gap", () => {
    expect(positionOfStep(gapped, "steps", 3)).toBeCloseTo(0.5);
    expect(positionOfStep(gapped, "time", 2)).toBeLessThan(0.02);
    expect(positionOfStep(gapped, "time", 3)).toBeGreaterThan(0.98);
    expect(positionOfStep(gapped, "time", 6)).toBe(1);
    expect(positionOfStep(["2026-01-01T00:00:00Z"], "time", 0)).toBe(0);
  });

  it("reads the nearest step by index, and by date the latest step at or before the instant, so that a gap holds the step before it", () => {
    expect(stepAtPosition(gapped, "steps", 0.49)).toBe(3);
    expect(stepAtPosition(gapped, "steps", -1)).toBe(0);
    expect(stepAtPosition(gapped, "steps", 2)).toBe(6);
    expect(stepAtPosition(gapped, "time", 0.5)).toBe(2);
    expect(stepAtPosition(gapped, "time", 0.999)).toBe(5);
    expect(stepAtPosition(gapped, "time", 1)).toBe(6);
    expect(stepAtPosition(gapped, "time", 0)).toBe(0);
  });

  it("by date takes a step within reach of the pointer when it is the nearer, and otherwise still the step before a gap", () => {
    const fourth = positionOfStep(gapped, "time", 3);
    // A hair before step 3's instant reads step 2, the shape as of that date, unless step 3 stands within reach.
    expect(stepAtPosition(gapped, "time", fourth - 0.001)).toBe(2);
    expect(stepAtPosition(gapped, "time", fourth - 0.001, 0.003)).toBe(3);
    // In the middle of the quiet half-year nothing is within reach: the step before the gap.
    expect(stepAtPosition(gapped, "time", 0.5, 0.003)).toBe(2);
    // Past the midpoint between two steps within reach, the nearer one, never one further.
    expect(stepAtPosition(gapped, "time", positionOfStep(gapped, "time", 4) - 0.0001, 0.003)).toBe(4);
    expect(stepAtPosition(gapped, "steps", 0.49, 0.003)).toBe(3);
  });

  it("does not fold the track when a commit's date runs before its predecessor's", () => {
    const dates = ["2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z", "2026-01-03T00:00:00Z"];
    expect(positionOfStep(dates, "time", 1)).toBe(0);
    expect(stepAtPosition(dates, "time", 0.5)).toBe(1);
  });
});

describe("periods", () => {
  it("names the day, the week from its Monday and the month, in UTC", () => {
    expect(periodOf("2026-01-07T23:30:00-02:00", "day")).toBe("2026-01-08");
    expect(periodOf("2026-01-07T10:00:00Z", "week")).toBe("2026-01-05");
    expect(periodOf("2026-01-11T10:00:00Z", "week")).toBe("2026-01-05");
    expect(periodOf("2026-01-12T10:00:00Z", "week")).toBe("2026-01-12");
    expect(periodOf("2026-01-31T23:59:59Z", "month")).toBe("2026-01");
    expect(periodOf("not a date", "day")).toBe("");
  });
});

describe("tickModel", () => {
  it("draws every step as a major tick with nothing pinned, the beginning too, and stops at each", () => {
    const model = tickModel({ dates: daily(5), ticks: EVERY(4), pinned: false, granularity: "step", axis: "steps" });
    expect(model.granularity).toBe("step");
    expect(model.ticks.map((tick) => [tick.step, tick.weight, tick.steps])).toEqual([[0, "major", 1], [1, "major", 1], [2, "major", 1], [3, "major", 1], [4, "major", 1]]);
    expect(model.ticks.map((tick) => tick.position)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(model.stops).toEqual([0, 1, 2, 3, 4]);
  });

  it("weighs the pinned steps major, the content-only ones minor and the rest quiet, and moves the step key between the major", () => {
    const model = tickModel({ dates: daily(7), ticks: { major: [2, 5], minor: [1, 4] }, pinned: true, granularity: "step", axis: "steps" });
    expect(model.ticks.map((tick) => tick.weight)).toEqual(["quiet", "minor", "major", "quiet", "minor", "major", "quiet"]);
    expect(model.stops).toEqual([0, 2, 5, 6]);
    expect(nextStop(model, 3, 1)).toBe(5);
    expect(nextStop(model, 5, 1)).toBe(6);
    expect(nextStop(model, 6, 1)).toBe(6);
    expect(nextStop(model, 3, -1)).toBe(2);
    expect(nextStop(model, 2, -1)).toBe(0);
    expect(nextStop(model, 0, -1)).toBe(0);
  });

  it("keeps only the salient ticks, and the beginning, when asked", () => {
    const model = tickModel({ dates: daily(7), ticks: { major: [2, 5], minor: [4] }, pinned: true, granularity: "salient", axis: "steps" });
    expect(model.ticks.map((tick) => [tick.step, tick.weight])).toEqual([[0, "quiet"], [2, "major"], [4, "minor"], [5, "major"]]);
  });

  it("groups the steps by day, one tick at the period's last step with the heaviest weight of its steps, the beginning alone", () => {
    const model = tickModel({ dates: gapped, ticks: { major: [4], minor: [1, 3] }, pinned: true, granularity: "day", axis: "steps" });
    expect(model.ticks.map((tick) => [tick.step, tick.weight, tick.steps])).toEqual([[0, "quiet", 1], [1, "minor", 1], [2, "quiet", 1], [5, "major", 3], [6, "quiet", 1]]);
    expect(model.stops).toEqual([0, 5, 6]);
    const months = tickModel({ dates: gapped, ticks: EVERY(6), pinned: false, granularity: "month", axis: "time" });
    expect(months.ticks.map((tick) => [tick.step, tick.steps])).toEqual([[0, 1], [2, 2], [6, 4]]);
    expect(months.ticks[1].position).toBeLessThan(0.02);
  });

  it("places every step where it stands on the axis, a step inside a grouped period too, which has no tick of its own for the thumb to borrow", () => {
    const months = tickModel({ dates: gapped, ticks: EVERY(6), pinned: false, granularity: "month", axis: "time" });
    expect(months.ticks.some((tick) => tick.step === 3)).toBe(false);
    // Step 3 opens April 2026, after the quiet half-year: by date it stands at the end, not halfway along as its index would put it.
    expect(months.positions[3]).toBeGreaterThan(0.98);
    expect(months.positions).toEqual(gapped.map((_date, step) => positionOfStep(gapped, "time", step)));
    expect(months.ticks.map((tick) => tick.position)).toEqual(months.ticks.map((tick) => months.positions[tick.step]));
    expect(tickModel({ dates: gapped, ticks: EVERY(6), pinned: false, granularity: "month", axis: "steps" }).positions).toEqual([0, 1 / 6, 2 / 6, 0.5, 4 / 6, 5 / 6, 1]);
    expect(tickModel({ dates: [], ticks: EVERY(0), pinned: false, granularity: "auto", axis: "time" }).positions).toEqual([]);
  });

  it("chooses the finest granularity whose ticks fit the budget: every step for a few, months for a long history", () => {
    const few = { dates: daily(5), ticks: EVERY(4), pinned: false, axis: "steps" as const };
    expect(automaticGranularity(few)).toBe("step");
    expect(tickModel({ ...few, granularity: "auto" }).granularity).toBe("step");
    const manyDays = { dates: daily(TICK_BUDGET + 5), ticks: EVERY(TICK_BUDGET + 4), pinned: false, axis: "steps" as const };
    expect(automaticGranularity(manyDays)).toBe("week");
    // Ten commits a day for three years: 1,095 days and 157 weeks overflow the budget, 36 months do not.
    const dates: string[] = [];
    for (let day = 0; day < 1095; day += 1) for (let commit = 0; commit < 10; commit += 1) dates.push(new Date(Date.UTC(2024, 0, 1 + day, commit)).toISOString());
    expect(automaticGranularity({ dates, ticks: EVERY(dates.length - 1), pinned: false, axis: "steps" })).toBe("month");
    // The beginning stands alone, then one tick per month.
    expect(tickModel({ dates, ticks: EVERY(dates.length - 1), pinned: false, granularity: "auto", axis: "steps" }).ticks.length).toBe(37);
  });
});

describe("the ruler", () => {
  it("labels the first step of each day over a short history, with the year on the first", () => {
    expect(rulerOf(daily(3), "steps")).toEqual([
      { step: 0, position: 0, text: "5 Jan 2026" },
      { step: 1, position: 0.5, text: "6 Jan" },
      { step: 2, position: 1, text: "7 Jan" }
    ]);
  });

  it("labels months over a history of months and years over one of years, where their steps stand", () => {
    expect(rulerOf(gapped, "time").map((label) => [label.step, label.text])).toEqual([[0, "Oct 2025"], [3, "Apr 2026"]]);
    expect(rulerOf(gapped, "time")[1].position).toBeGreaterThan(0.98);
    const years = ["2023-05-01T00:00:00Z", "2024-02-01T00:00:00Z", "2024-09-01T00:00:00Z", "2026-01-01T00:00:00Z"];
    expect(rulerOf(years, "steps").map((label) => label.text)).toEqual(["2023", "2024", "2026"]);
    expect(rulerOf([], "steps")).toEqual([]);
  });
});
