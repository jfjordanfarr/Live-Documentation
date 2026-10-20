import { describe, expect, it } from "vitest";

import type { CommitInfo } from "./format";
import { seek, SequenceBuilder } from "./sequence";
import { edgeKey, shapeDifferences, type Shape } from "./shape";
import { windowOf } from "./window";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git" as const, root: ".", branch: "main", head: "c5", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" as const }, authors: true }
};

function commit(index: number): CommitInfo {
  return { id: `c${index}`, parents: [], date: `2026-03-0${index + 1}T12:00:00+02:00`, subject: `change ${index}` };
}

/** Change i holds files f_i and f_(i+1), the older wired to the newer: every file lives two changes. */
function shapeAt(index: number): Shape {
  return {
    files: new Map([index, index + 1].map((file) => [`f${file}.ts`, { archetype: "implementation", symbols: file, entry: false }])),
    edges: new Map([[edgeKey(`f${index}.ts`, `f${index + 1}.ts`), 1]]),
    docLinks: new Set([edgeKey(`f${index}.ts`, `docs/d${index % 2}.md`)])
  };
}

function sequence(): ReturnType<SequenceBuilder["finish"]> {
  const builder = new SequenceBuilder(HEAD, commit(0), shapeAt(0));
  for (let index = 1; index <= 5; index += 1) {
    builder.add(commit(index), shapeAt(index), { renamed: [], modified: [] });
  }
  return builder.finish();
}

describe("windowOf", () => {
  it("carries the whole sequence when asked for all of it", () => {
    const whole = sequence();
    expect(windowOf(whole, { rule: "all" })).toBe(whole);
  });

  it("re-bases the last changes on the first of them, naming only the paths it uses", () => {
    const window = windowOf(sequence(), { rule: "last", count: 2 });
    expect(window.window).toEqual({ rule: "last", count: 2 });
    expect(window.base.commit.id).toBe("c4");
    expect(window.steps.map((step) => step.commit.id)).toEqual(["c5"]);
    expect(window.paths).toEqual(["f4.ts", "f5.ts", "docs/d0.md", "f6.ts", "docs/d1.md"]);
    expect(shapeDifferences(shapeAt(4), seek(window, 0))).toEqual([]);
    expect(shapeDifferences(shapeAt(5), seek(window, 1))).toEqual([]);
    expect(window.source).toEqual(HEAD.source);
  });

  it("begins a window since a date at the first change on or after it, reading offsets as instants", () => {
    // Change 2 is at 2026-03-03T10:00Z; a window since 10:00Z that day begins there, since 10:01Z at change 3.
    expect(windowOf(sequence(), { rule: "since", since: "2026-03-03T10:00:00Z" }).base.commit.id).toBe("c2");
    expect(windowOf(sequence(), { rule: "since", since: "2026-03-03T10:01:00Z" }).base.commit.id).toBe("c3");
  });

  it("carries all of it when the last count exceeds the history, and refuses an empty or a malformed window", () => {
    expect(windowOf(sequence(), { rule: "last", count: 99 }).base.commit.id).toBe("c0");
    expect(() => windowOf(sequence(), { rule: "since", since: "2027-01-01" })).toThrow("no change of the history is on or after 2027-01-01");
    expect(() => windowOf(sequence(), { rule: "since", since: "soon" })).toThrow("soon is not a date");
    expect(() => windowOf(sequence(), { rule: "last", count: 0 })).toThrow("count of one or more");
  });
});
