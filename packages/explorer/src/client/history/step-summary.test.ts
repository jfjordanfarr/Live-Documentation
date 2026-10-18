import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { CommitInfo, HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { seek, SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { edgeKey, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import { changeCount, stepSummary } from "./step-summary";

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git" as const, root: ".", branch: "main", head: "c3", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" as const }, authors: true }
};

const commit = (index: number): CommitInfo => ({ id: `c${index}`.padEnd(8, "0"), parents: [], date: `2026-01-0${index + 1}T10:00:00Z`, author: "Ada", subject: `change ${index}` });

const shape = (files: Record<string, [string, number]>, edges: Array<[string, string, number]> = []): Shape => ({
  files: new Map(Object.entries(files).map(([path, [archetype, symbols]]) => [path, { archetype, symbols, entry: false }])),
  edges: new Map(edges.map(([from, to, count]) => [edgeKey(from, to), count]))
});

/**
 * Step 1 renames `core` to `engine` whole and the main file grows; step 2 kills `lib/old.ts`, bears `lib/new.ts`, rewires
 * main to it and counts one wire higher; step 3 touches main's content alone.
 */
function sequence(): HistorySequence {
  const builder = new SequenceBuilder(HEAD, commit(0), shape({ "core/a.ts": ["implementation", 1], "core/b.ts": ["implementation", 2], "main.ts": ["implementation", 1], "lib/old.ts": ["implementation", 0] }, [["main.ts", "core/a.ts", 1], ["main.ts", "lib/old.ts", 1]]));
  builder.add(commit(1), shape({ "engine/a.ts": ["implementation", 1], "engine/b.ts": ["implementation", 2], "main.ts": ["implementation", 3], "lib/old.ts": ["implementation", 0] }, [["main.ts", "engine/a.ts", 1], ["main.ts", "lib/old.ts", 1]]), { renamed: [["core/a.ts", "engine/a.ts"], ["core/b.ts", "engine/b.ts"]], modified: ["main.ts"] });
  builder.add(commit(2), shape({ "engine/a.ts": ["implementation", 1], "engine/b.ts": ["implementation", 2], "main.ts": ["implementation", 3], "lib/new.ts": ["test", 0] }, [["main.ts", "engine/a.ts", 2], ["main.ts", "lib/new.ts", 1]]), { renamed: [], modified: [] });
  builder.add(commit(3), shape({ "engine/a.ts": ["implementation", 1], "engine/b.ts": ["implementation", 2], "main.ts": ["implementation", 3], "lib/new.ts": ["test", 0] }, [["main.ts", "engine/a.ts", 2], ["main.ts", "lib/new.ts", 1]]), { renamed: [], modified: ["main.ts"] });
  return builder.finish();
}

describe("stepSummary", () => {
  const today = new Set(["engine/a.ts", "engine/b.ts", "main.ts", "lib/new.ts"]);
  const has = (path: string): boolean => today.has(path);

  it("says what a rename step did: the files under their new names, pinnable today, the directory renamed whole, the growth", () => {
    const history = sequence();
    const summary = stepSummary(history, 1, seek(history, 1), has);
    expect(summary.base).toBe(false);
    expect(summary.commit.subject).toBe("change 1");
    expect([summary.files, summary.edges]).toEqual([4, 2]);
    expect(summary.renamed).toEqual([
      { from: "core/a.ts", file: { path: "engine/a.ts", name: "a.ts", archetype: "implementation", symbols: 1, today: { kind: "today", path: "engine/a.ts" } } },
      { from: "core/b.ts", file: { path: "engine/b.ts", name: "b.ts", archetype: "implementation", symbols: 2, today: { kind: "today", path: "engine/b.ts" } } }
    ]);
    expect(summary.directoriesRenamed).toEqual([{ from: "core", to: "engine" }]);
    expect(summary.resized).toEqual([{ file: expect.objectContaining({ path: "main.ts", symbols: 3 }), before: 1, after: 3 }]);
    expect(summary.touched).toEqual([]);
    expect(summary.edgesAdded).toEqual([]);
    expect(changeCount(summary)).toBe(3);
  });

  it("says a dead file is gone since the step that killed it, with its shape before, and a born file where it stands today", () => {
    const history = sequence();
    const summary = stepSummary(history, 2, seek(history, 2), has);
    expect(summary.dead).toEqual([{ path: "lib/old.ts", name: "old.ts", archetype: "implementation", symbols: 0, today: { kind: "gone", since: expect.objectContaining({ subject: "change 2" }) } }]);
    expect(summary.born).toEqual([{ path: "lib/new.ts", name: "new.ts", archetype: "test", symbols: 0, today: { kind: "today", path: "lib/new.ts" } }]);
    expect(summary.edgesAdded).toEqual([{ from: "main.ts", to: "lib/new.ts", count: 1 }]);
    expect(summary.edgesRemoved).toEqual([{ from: "main.ts", to: "lib/old.ts", count: 0 }]);
    expect(summary.edgesChanged).toEqual([{ from: "main.ts", to: "engine/a.ts", count: 2, before: 1 }]);
  });

  it("reads a file of an earlier step under its name today, and says it is gone when today's bundle lacks it", () => {
    const history = sequence();
    const atBase = stepSummary(history, 0, seek(history, 0), has);
    expect(atBase.base).toBe(true);
    expect(atBase.born).toEqual([]);
    expect([atBase.files, atBase.edges]).toEqual([4, 2]);
    // A file of the base, followed to today: renamed with its directory, so pinnable under the new name.
    const touched = stepSummary(history, 3, seek(history, 3), (path) => path !== "main.ts");
    expect(touched.touched).toEqual([{ path: "main.ts", name: "main.ts", archetype: "implementation", symbols: 3, today: { kind: "gone", since: null } }]);
    expect(changeCount(touched)).toBe(1);
  });
});
