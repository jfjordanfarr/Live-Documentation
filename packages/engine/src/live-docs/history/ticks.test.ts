import { describe, expect, it } from "vitest";

import type { CommitInfo, HistorySequence } from "./format";
import { SequenceBuilder } from "./sequence";
import { edgeKey, type Shape } from "./shape";
import { ticksFor } from "./ticks";
import type { VersionChanges } from "./versionControl";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";

function shape(files: Record<string, number>, edges: Array<[string, string]> = []): Shape {
  return {
    files: new Map(Object.entries(files).map(([path, symbols]) => [path, { archetype: "implementation", symbols, entry: false }])),
    edges: new Map(edges.map(([from, to]) => [edgeKey(from, to), 1]))
  };
}

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
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
