import { describe, expect, it } from "vitest";

import type { CommitInfo, HistorySequence } from "./format";
import { SequenceBuilder } from "./sequence";
import { edgeKey, type Shape } from "./shape";
import { followPath, followPins, ticksFor } from "./ticks";
import type { VersionChanges } from "./versionControl";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";

function shape(files: Record<string, number>, edges: Array<[string, string]> = []): Shape {
  return {
    files: new Map(Object.entries(files).map(([path, symbols]) => [path, { archetype: "implementation", symbols, entry: false }])),
    edges: new Map(edges.map(([from, to]) => [edgeKey(from, to), 1]))
  };
}

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git" as const, root: ".", branch: "main", head: "c6", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" as const }, authors: false }
};

function commit(index: number): CommitInfo {
  return { id: `c${index}`, parents: [], date: "2026-01-01T00:00:00Z", subject: `change ${index}` };
}

/**
 * A life of `src/view.ts`: touched in content only (1), wired to the model (2),
 * renamed with its folder to `ui/view.ts` (3), touched again (4), grown (5); and
 * a step that touches nothing of it (6).
 */
function history(): HistorySequence {
  const steps: Array<[Shape, VersionChanges]> = [
    [shape({ "src/view.ts": 1, "src/model.ts": 1 }), { renamed: [], modified: ["src/view.ts"] }],
    [shape({ "src/view.ts": 1, "src/model.ts": 1 }, [["src/view.ts", "src/model.ts"]]), { renamed: [], modified: ["src/view.ts"] }],
    [shape({ "ui/view.ts": 1, "src/model.ts": 1 }, [["ui/view.ts", "src/model.ts"]]), { renamed: [["src/view.ts", "ui/view.ts"]], modified: [] }],
    [shape({ "ui/view.ts": 1, "src/model.ts": 1 }, [["ui/view.ts", "src/model.ts"]]), { renamed: [], modified: ["ui/view.ts"] }],
    [shape({ "ui/view.ts": 2, "src/model.ts": 1 }, [["ui/view.ts", "src/model.ts"]]), { renamed: [], modified: ["ui/view.ts"] }],
    [shape({ "ui/view.ts": 2, "src/model.ts": 3 }, [["ui/view.ts", "src/model.ts"]]), { renamed: [], modified: ["src/model.ts"] }]
  ];
  const builder = new SequenceBuilder(HEAD, commit(0), shape({ "src/view.ts": 1, "src/model.ts": 1 }));
  steps.forEach(([next, version], index) => builder.add(commit(index + 1), next, version));
  return builder.finish();
}

describe("ticksFor", () => {
  it("marks the steps that change a pinned file's shape as major and its content-only changes as minor, through its rename", () => {
    expect(ticksFor(history(), { files: ["ui/view.ts"], directories: [] })).toEqual({ major: [2, 3, 5], minor: [1, 4] });
  });

  it("finds the same life from the pin's name before the rename, read at that step", () => {
    expect(ticksFor(history(), { files: ["src/view.ts"], directories: [] }, 1)).toEqual({ major: [2, 3, 5], minor: [1, 4] });
  });

  it("counts a wire to a pinned file as a change of its shape", () => {
    expect(ticksFor(history(), { files: ["src/model.ts"], directories: [] })).toEqual({ major: [2, 6], minor: [] });
  });

  it("reads a pinned directory as every file under it", () => {
    const sequence = history();
    expect(ticksFor(sequence, { files: [], directories: ["ui"] })).toEqual({ major: [3, 5], minor: [4] });
    expect(ticksFor(sequence, { files: [], directories: ["src"] }, 0)).toEqual({ major: [2, 3, 6], minor: [1] });
  });

  it("follows a pinned directory through its rename whole, back to its old name", () => {
    const builder = new SequenceBuilder(HEAD, commit(0), shape({ "core/a.ts": 1, "core/b.ts": 1, "app.ts": 1 }));
    builder.add(commit(1), shape({ "core/a.ts": 1, "core/b.ts": 1, "app.ts": 1 }), { renamed: [], modified: ["core/a.ts"] });
    builder.add(commit(2), shape({ "engine/a.ts": 1, "engine/b.ts": 1, "app.ts": 1 }), { renamed: [["core/a.ts", "engine/a.ts"], ["core/b.ts", "engine/b.ts"]], modified: [] });
    builder.add(commit(3), shape({ "engine/a.ts": 2, "engine/b.ts": 1, "app.ts": 1 }), { renamed: [], modified: [] });
    builder.add(commit(4), shape({ "engine/a.ts": 2, "engine/b.ts": 1, "app.ts": 2 }), { renamed: [], modified: [] });
    expect(ticksFor(builder.finish(), { files: [], directories: ["engine"] })).toEqual({ major: [2, 3], minor: [1] });
  });

  it("makes every step a major tick when nothing is pinned", () => {
    expect(ticksFor(history(), { files: [], directories: [] })).toEqual({ major: [1, 2, 3, 4, 5, 6], minor: [] });
  });
});

/** `core` renamed to `engine` whole at change 2; `app.ts` stands throughout. */
function renamedDirectory(): HistorySequence {
  const builder = new SequenceBuilder(HEAD, commit(0), shape({ "core/a.ts": 1, "core/b.ts": 1, "app.ts": 1 }));
  builder.add(commit(1), shape({ "core/a.ts": 1, "core/b.ts": 1, "app.ts": 1 }), { renamed: [], modified: ["core/a.ts"] });
  builder.add(commit(2), shape({ "engine/a.ts": 1, "engine/b.ts": 1, "app.ts": 1 }), { renamed: [["core/a.ts", "engine/a.ts"], ["core/b.ts", "engine/b.ts"]], modified: [] });
  builder.add(commit(3), shape({ "engine/a.ts": 2, "engine/b.ts": 1, "app.ts": 1 }), { renamed: [], modified: [] });
  return builder.finish();
}

describe("followPins", () => {
  it("carries today's pins back to their old names and an old step's pins forward to today's", () => {
    const sequence = history();
    expect(followPins(sequence, { files: ["ui/view.ts", "src/model.ts"], directories: [] }, 6, 1)).toEqual({ files: ["src/view.ts", "src/model.ts"], directories: [] });
    expect(followPins(sequence, { files: ["ui/view.ts"], directories: [] }, 6, 3)).toEqual({ files: ["ui/view.ts"], directories: [] });
    expect(followPins(sequence, { files: ["src/view.ts"], directories: [] }, 0, 6)).toEqual({ files: ["ui/view.ts"], directories: [] });
    expect(followPins(sequence, { files: ["src/view.ts"], directories: [] }, 2, 2)).toEqual({ files: ["src/view.ts"], directories: [] });
  });

  it("carries a pinned directory through its rename whole, either way, and leaves one no rename touched", () => {
    const sequence = renamedDirectory();
    expect(followPins(sequence, { files: ["engine/a.ts"], directories: ["engine"] }, 3, 1)).toEqual({ files: ["core/a.ts"], directories: ["core"] });
    expect(followPins(sequence, { files: [], directories: ["core", "lib"] }, 0, 3)).toEqual({ files: [], directories: ["engine", "lib"] });
    expect(() => followPins(sequence, { files: [], directories: [] }, 0, 4)).toThrow(RangeError);
  });

  it("answers path for path, in the order given, a path named twice answered twice", () => {
    const sequence = renamedDirectory();
    expect(followPins(sequence, { files: ["engine/a.ts", "app.ts", "engine/a.ts"], directories: ["engine", "engine"] }, 3, 0))
      .toEqual({ files: ["core/a.ts", "app.ts", "core/a.ts"], directories: ["core", "core"] });
  });
});

describe("followPath", () => {
  /** a.ts is renamed twice; old.ts dies at change 2; tmp.ts is born at 1 and dies at 2; new.ts is born at 2. */
  function lives(): HistorySequence {
    const builder = new SequenceBuilder(HEAD, commit(0), shape({ "a.ts": 1, "old.ts": 1 }));
    builder.add(commit(1), shape({ "c.ts": 1, "old.ts": 1, "tmp.ts": 1 }), { renamed: [["a.ts", "c.ts"]], modified: [] });
    builder.add(commit(2), shape({ "d.ts": 1, "new.ts": 1 }), { renamed: [["c.ts", "d.ts"]], modified: [] });
    return builder.finish();
  }

  it("follows a file forward through every rename to where it stands, or to the step it died at", () => {
    const sequence = lives();
    expect(followPath(sequence, "a.ts", 0, 2)).toEqual({ path: "d.ts", step: 2 });
    expect(followPath(sequence, "a.ts", 0, 1)).toEqual({ path: "c.ts", step: 1 });
    expect(followPath(sequence, "old.ts", 0, 2)).toEqual({ path: null, step: 2 });
    expect(followPath(sequence, "tmp.ts", 1, 2)).toEqual({ path: null, step: 2 });
    expect(followPath(sequence, "old.ts", 0, 1)).toEqual({ path: "old.ts", step: 1 });
  });

  it("follows a file back to its old name, or to the step it was born at, before which it did not exist", () => {
    const sequence = lives();
    expect(followPath(sequence, "d.ts", 2, 0)).toEqual({ path: "a.ts", step: 0 });
    expect(followPath(sequence, "new.ts", 2, 0)).toEqual({ path: null, step: 2 });
    expect(followPath(sequence, "tmp.ts", 1, 0)).toEqual({ path: null, step: 1 });
    expect(followPath(sequence, "d.ts", 2, 2)).toEqual({ path: "d.ts", step: 2 });
    expect(() => followPath(sequence, "d.ts", 3, 0)).toThrow(RangeError);
  });
});
