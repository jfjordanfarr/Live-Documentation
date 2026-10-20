import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { CommitInfo, HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { seek, SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import { shapeDifferences, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import { HistoryCursor } from "./cursor";

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git" as const, root: ".", branch: "main", head: "c4", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" as const }, authors: false }
};

const commit = (index: number): CommitInfo => ({ id: `c${index}`, parents: [], date: `2026-01-0${index + 1}T10:00:00Z`, subject: `change ${index}` });

const shape = (files: Record<string, number>): Shape => ({
  files: new Map(Object.entries(files).map(([path, symbols]) => [path, { archetype: "implementation", symbols, entry: false }])),
  edges: new Map(),
  docLinks: new Set()
});

/**
 * `core` moves to `engine` one file per step (1 and 2), so that no one step renames it whole but the span does;
 * `app.ts` is renamed to `main.ts` at 3 and `lib/x.ts` dies there; `tmp.ts` is born at 1 and dies at 4.
 */
function sequence(): HistorySequence {
  const builder = new SequenceBuilder(HEAD, commit(0), shape({ "core/a.ts": 1, "core/b.ts": 1, "app.ts": 1, "lib/x.ts": 1 }));
  builder.add(commit(1), shape({ "engine/a.ts": 1, "core/b.ts": 1, "app.ts": 1, "lib/x.ts": 1, "tmp.ts": 0 }), { renamed: [["core/a.ts", "engine/a.ts"]], modified: [] });
  builder.add(commit(2), shape({ "engine/a.ts": 1, "engine/b.ts": 1, "app.ts": 1, "lib/x.ts": 1, "tmp.ts": 0 }), { renamed: [["core/b.ts", "engine/b.ts"]], modified: [] });
  builder.add(commit(3), shape({ "engine/a.ts": 1, "engine/b.ts": 1, "main.ts": 1, "tmp.ts": 0 }), { renamed: [["app.ts", "main.ts"]], modified: [] });
  builder.add(commit(4), shape({ "engine/a.ts": 1, "engine/b.ts": 1, "main.ts": 2 }), { renamed: [], modified: [] });
  return builder.finish();
}

const entries = (map: ReadonlyMap<string, string>): Array<[string, string]> => [...map].sort(([a], [b]) => (a < b ? -1 : 1));

describe("HistoryCursor", () => {
  it("starts at the last step and holds its shape", () => {
    const history = sequence();
    const cursor = new HistoryCursor(history);
    expect(cursor.step).toBe(4);
    expect(cursor.last).toBe(4);
    expect(shapeDifferences(seek(history, 4), cursor.shape)).toEqual([]);
  });

  it("moves back by a seek, returning the renames from where it stood to where it stands, the directory whole across the span", () => {
    const history = sequence();
    const cursor = new HistoryCursor(history);
    const renames = cursor.moveTo(0);
    expect(cursor.step).toBe(0);
    expect(shapeDifferences(seek(history, 0), cursor.shape)).toEqual([]);
    expect(entries(renames.files)).toEqual([["engine/a.ts", "core/a.ts"], ["engine/b.ts", "core/b.ts"], ["main.ts", "app.ts"]]);
    expect(entries(renames.directories)).toEqual([["engine", "core"]]);
  });

  it("moves forward by the deltas, one step or several, and names no directory whole while half of it still stands", () => {
    const history = sequence();
    const cursor = new HistoryCursor(history, 0);
    const first = cursor.moveTo(1);
    expect(entries(first.files)).toEqual([["core/a.ts", "engine/a.ts"]]);
    expect(entries(first.directories)).toEqual([]);
    expect(shapeDifferences(seek(history, 1), cursor.shape)).toEqual([]);
    const rest = cursor.moveTo(4);
    expect(cursor.step).toBe(4);
    expect(shapeDifferences(seek(history, 4), cursor.shape)).toEqual([]);
    // From step 1: b.ts completes the move, app.ts is renamed; tmp.ts dies on the way and is no rename. `engine` already
    // stood at step 1, so b.ts joining it is a merge into a standing directory, which the rule never reads as a rename:
    // the hub of `core` dies and `engine`'s lives on.
    expect(entries(rest.files)).toEqual([["app.ts", "main.ts"], ["core/b.ts", "engine/b.ts"]]);
    expect(entries(rest.directories)).toEqual([]);
    // Across the whole span from the base, where `engine` did not yet stand, the directory is renamed whole.
    const whole = new HistoryCursor(history, 0);
    expect(entries(whole.moveTo(4).directories)).toEqual([["core", "engine"]]);
  });

  it("returns no rename for a move to where it stands, and refuses a step the sequence lacks", () => {
    const cursor = new HistoryCursor(sequence(), 2);
    const none = cursor.moveTo(2);
    expect(none.files.size + none.directories.size).toBe(0);
    expect(() => cursor.moveTo(5)).toThrow(RangeError);
    expect(() => cursor.moveTo(-1)).toThrow(RangeError);
  });
});
