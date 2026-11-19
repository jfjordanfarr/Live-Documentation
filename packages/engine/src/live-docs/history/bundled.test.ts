import { describe, expect, it } from "vitest";

import { bundledSummary } from "./bundled";
import { HISTORY_SUMMARY_FORMAT, type CommitSummary } from "./summary";

const SUMMARY: CommitSummary = {
  format: HISTORY_SUMMARY_FORMAT,
  lens: "0123456789abcdef",
  commit: "c".repeat(40),
  files: [
    { path: "src/a.ts", archetype: "implementation", entries: [], symbols: [], dependencies: [], citedBy: ["archive/2026/day.record.md", "docs/design.md"], authored: "h1" },
    { path: "src/b.ts", archetype: "implementation", entries: [], symbols: [], dependencies: [], citedBy: ["archive/2026/day.record.md"], authored: "h2" },
    { path: "src/c.ts", archetype: "implementation", entries: [], symbols: [], dependencies: [] }
  ],
  docLinks: [
    ["src/a.ts", "archive/2026/day.record.md"],
    ["src/a.ts", "docs/design.md"],
    ["src/c.ts", "old-archive/2025/day.record.md"]
  ]
};

/** A copy of the summary of its own for each case, so that no case reads what another changed. */
const fresh = (): CommitSummary => structuredClone(SUMMARY);

describe("bundledSummary", () => {
  it("leaves out of the links and the Cited By lists the documents bundleExclude names, by the bundle's own rule", () => {
    const given = fresh();
    const bundled = bundledSummary(given, ["archive/**/*.record.md"]);
    expect(bundled.docLinks).toEqual([
      ["src/a.ts", "docs/design.md"],
      ["src/c.ts", "old-archive/2025/day.record.md"]
    ]);
    expect(bundled.files[0].citedBy).toEqual(["docs/design.md"]);
    // A list left empty is absent, as the summarizing process writes a file no document cites.
    expect("citedBy" in bundled.files[1]).toBe(false);
    expect(JSON.stringify(bundled.files[1])).toBe('{"path":"src/b.ts","archetype":"implementation","entries":[],"symbols":[],"dependencies":[],"authored":"h2"}');
    expect(bundled.files[2]).toBe(given.files[2]);
  });

  it("follows an edit of the exclusions: a former layout named as well is left out as well", () => {
    const bundled = bundledSummary(fresh(), ["archive/**/*.record.md", "old-archive/**/*.record.md"]);
    expect(bundled.docLinks).toEqual([["src/a.ts", "docs/design.md"]]);
  });

  it("changes nothing of the summary it reads, and nothing at all with no exclusions", () => {
    // The history reads each summary once, but a reader that changed what it was given would change the cache's copy
    // in memory for whoever reads it next.
    const given = fresh();
    const before = JSON.stringify(given);
    const bundled = bundledSummary(given, ["archive/**", "old-archive/**"]);
    expect(bundled.docLinks).toEqual([["src/a.ts", "docs/design.md"]]);
    expect(JSON.stringify(given)).toBe(before);
    expect(bundledSummary(given, [])).toBe(given);
  });
});
