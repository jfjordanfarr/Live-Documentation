import { expect, it } from "vitest";

import { findCommits, rangedTickModel } from "./navigation";

it("finds messages and displayed dates, prioritizes a hash prefix, and never loses matching commits", () => {
  const commits = [
    { id: "abc12345", date: "2025-10-16T22:00:00-04:00", subject: "Start the database", parents: [] },
    { id: "def67890", date: "2026-01-12T10:00:00Z", subject: "Remove GraphStore", parents: [] },
    { id: "fed11111", date: "2026-01-13T10:00:00Z", subject: "Document abc12345", parents: [] }
  ];
  expect(findCommits(commits, "graphstore")).toEqual([1]);
  expect(findCommits(commits, "2025-10-16")).toEqual([0]);
  expect(findCommits(commits, "abc12345")).toEqual([0, 2]);
  expect(findCommits(commits, "2026 remove")).toEqual([1]);
  expect(findCommits(commits, "missing")).toEqual([]);
  expect(findCommits(commits, "")).toEqual([2, 1, 0]);
});

it("gives a busy period its own tick density and preserves global identities and the first step's weight", () => {
  const dates = ["2025-01-01T00:00:00Z", ...Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2026, 9, 1, 0, i)).toISOString())];
  const input = { dates, ticks: { major: [350, 352], minor: [351] }, pinned: true, granularity: "auto" as const, axis: "time" as const };
  const local = rangedTickModel(input, [350, 355]);
  expect(local.granularity).toBe("step");
  expect(local.positions[350]).toBe(0);
  expect(local.positions[355]).toBe(1);
  expect(local.ticks.map(tick => tick.step)).toEqual([350, 351, 352, 353, 354, 355]);
  expect(local.ticks.slice(0, 3).map(tick => tick.weight)).toEqual(["major", "minor", "major"]);
  expect(local.stops).toContain(350);
  expect(local.stops).toContain(355);
  expect(rangedTickModel(input, [352, 352]).positions[352]).toBe(0);
  expect(() => rangedTickModel(input, [355, 350])).toThrow(RangeError);
});
