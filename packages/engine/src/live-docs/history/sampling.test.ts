import { describe, expect, it } from "vitest";

import { sampleChanges } from "./sampling";
import type { MainlineChange } from "./versionControl";

function change(id: string, date: string): MainlineChange {
  return { id, parents: [], date, author: "Ada", subject: id };
}

// Two changes on Monday 2026-09-28 (UTC), one on Tuesday, one late on Sunday 2026-10-04 in UTC+2 (still Sunday in UTC), one on Monday 2026-10-05.
const MAINLINE = [
  change("a", "2026-09-28T09:00:00Z"),
  change("b", "2026-09-28T17:00:00Z"),
  change("c", "2026-09-29T08:00:00Z"),
  change("d", "2026-10-04T23:30:00+02:00"),
  change("e", "2026-10-05T07:00:00Z")
];

describe("sampleChanges", () => {
  it("samples every change", () => {
    expect(sampleChanges(MAINLINE, { rule: "every-commit" })).toEqual([0, 1, 2, 3, 4]);
  });

  it("samples every n-th change, and always the first and the last", () => {
    expect(sampleChanges(MAINLINE, { rule: "every-nth", n: 3 })).toEqual([0, 3, 4]);
    expect(sampleChanges(MAINLINE, { rule: "every-nth", n: 10 })).toEqual([0, 4]);
    expect(() => sampleChanges(MAINLINE, { rule: "every-nth", n: 0 })).toThrow("n of one or more");
  });

  it("samples the last change of each UTC day, and the first", () => {
    expect(sampleChanges(MAINLINE, { rule: "daily" })).toEqual([0, 1, 2, 3, 4]);
    expect(sampleChanges(MAINLINE.slice(0, 3), { rule: "daily" })).toEqual([0, 1, 2]);
    expect(sampleChanges([MAINLINE[0], MAINLINE[1], MAINLINE[2], change("c2", "2026-09-29T20:00:00Z")], { rule: "daily" })).toEqual([0, 1, 3]);
  });

  it("samples the last change of each week beginning Monday, in UTC", () => {
    // d is Sunday 21:30 UTC, the last of the week of 2026-09-28; e begins the next.
    expect(sampleChanges(MAINLINE, { rule: "weekly" })).toEqual([0, 3, 4]);
  });

  it("samples the changes a tag names", () => {
    expect(sampleChanges(MAINLINE, { rule: "tags" }, new Set(["c"]))).toEqual([0, 2, 4]);
  });

  it("samples only the changes on or after a date, the first of them where knowledge begins", () => {
    expect(sampleChanges(MAINLINE, { rule: "every-commit", since: "2026-09-29" })).toEqual([2, 3, 4]);
    expect(sampleChanges(MAINLINE, { rule: "every-nth", n: 2, since: "2026-09-28T12:00:00Z" })).toEqual([1, 3, 4]);
    expect(sampleChanges(MAINLINE, { rule: "every-commit", since: "2027-01-01" })).toEqual([]);
    expect(() => sampleChanges(MAINLINE, { rule: "every-commit", since: "later" })).toThrow("later is not a date");
  });
});
