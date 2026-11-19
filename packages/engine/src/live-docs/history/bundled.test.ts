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

describe("bundledSummary", () => {
  it("leaves out of the links and the Cited By lists the documents bundleExclude names, by the bundle's own rule", () => {
    const bundled = bundledSummary(SUMMARY, ["archive/**/*.record.md"]);
    expect(bundled.docLinks).toEqual([
      ["src/a.ts", "docs/design.md"],
      ["src/c.ts", "old-archive/2025/day.record.md"]
    ]);
    expect(bundled.files[0].citedBy).toEqual(["docs/design.md"]);
    // A list left empty is absent, as the summarizing process writes a file no document cites.
    expect("citedBy" in bundled.files[1]).toBe(false);
    expect(JSON.stringify(bundled.files[1])).toBe('{"path":"src/b.ts","archetype":"implementation","entries":[],"symbols":[],"dependencies":[],"authored":"h2"}');
    expect(bundled.files[2]).toBe(SUMMARY.files[2]);
  });

  it("follows an edit of the exclusions: a former layout named as well is left out as well", () => {
    const bundled = bundledSummary(SUMMARY, ["archive/**/*.record.md", "old-archive/**/*.record.md"]);
    expect(bundled.docLinks).toEqual([["src/a.ts", "docs/design.md"]]);
  });

  it("changes nothing of the summary it reads, and nothing at all with no exclusions", () => {
    const before = JSON.stringify(SUMMARY);
    bundledSummary(SUMMARY, ["archive/**"]);
    expect(JSON.stringify(SUMMARY)).toBe(before);
    expect(bundledSummary(SUMMARY, [])).toBe(SUMMARY);
  });
});
