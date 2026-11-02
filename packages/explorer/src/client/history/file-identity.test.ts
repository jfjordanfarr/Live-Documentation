import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";
import { SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import type { Shape } from "@live-documentation/engine/live-docs/history/shape";

import { historicalDirectories, historicalNode, historicalOrigin, referenceAt, referenceFor } from "./file-identity";

const commit = (n: number): CommitInfo => ({ id: `c${n}`, parents: [], date: `2026-01-0${n + 1}T10:00:00Z`, subject: `change ${n}` });
const shape = (files: Record<string, number>): Shape => ({
  files: new Map(Object.entries(files).map(([path, symbols]) => [path, { archetype: "implementation", symbols, entry: false }])),
  edges: new Map(), docLinks: new Set()
});
const builder = new SequenceBuilder({
  lens: { key: "k", generator: { version: "0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git", root: ".", branch: "main", head: "c4", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" }, authors: false }
}, commit(0), shape({ "old.ts": 2, "live.ts": 1 }));
builder.add(commit(1), shape({ "moved.ts": 3, "live.ts": 1, "temporary.ts": 5 }), { renamed: [["old.ts", "moved.ts"]], modified: [] });
builder.add(commit(2), shape({ "live.ts": 1, "temporary.ts": 5 }), { renamed: [], modified: [] });
builder.add(commit(3), shape({ "moved.ts": 8, "current.ts": 1 }), { renamed: [["live.ts", "current.ts"]], modified: [] });
builder.add(commit(4), shape({ "moved.ts": 8, "current.ts": 1 }), { renamed: [], modified: [] });
const sequence = builder.finish();
const todayHas = (path: string): boolean => ["moved.ts", "current.ts"].includes(path);

describe("historical file identity", () => {
  it("keeps historical source directories without treating linked document destinations as source folders", () => {
    const copy = structuredClone(sequence);
    const pathId = copy.paths.push("gone/deep/a.ts") - 1;
    copy.base.files.push([pathId, copy.base.files[0][1], 1, 0]);
    copy.base.docLinks.push([pathId, copy.paths.push("notes/guide.md") - 1]);
    expect(historicalDirectories(copy)).toEqual(new Set(["", "gone", "gone/deep"]));
  });

  it("keeps a removed file's identity through its rename without confusing a later file at the same path", () => {
    const old = referenceFor(sequence, "old.ts", 0, todayHas);
    expect(referenceFor(sequence, "moved.ts", 1, todayHas)).toBe(old);
    expect(referenceFor(sequence, "moved.ts", 3, todayHas)).toBe("moved.ts");
    expect(referenceAt(sequence, old, 1)).toEqual({ path: "moved.ts", step: 1 });
    expect(referenceAt(sequence, old, 4)).toEqual({ path: null, step: 2 });
    expect(referenceAt(sequence, "moved.ts", 1)).toEqual({ path: null, step: 3 });
    expect(historicalNode(sequence, old)).toMatchObject({ id: old, name: "old.ts", codeRelativePath: "old.ts", symbolCount: 2, publicSymbols: [] });
  });

  it("anchors a transient file to its birth and keeps surviving files under their normal current ids", () => {
    const temporary = referenceFor(sequence, "temporary.ts", 2, todayHas);
    expect(historicalOrigin(sequence, temporary)).toEqual({ path: "temporary.ts", step: 1 });
    expect(referenceAt(sequence, temporary, 0)).toEqual({ path: null, step: 1 });
    expect(referenceAt(sequence, temporary, 2)).toEqual({ path: "temporary.ts", step: 2 });
    expect(referenceAt(sequence, temporary, 4)).toEqual({ path: null, step: 3 });
    expect(referenceFor(sequence, "live.ts", 0, todayHas)).toBe("current.ts");
    expect(referenceAt(sequence, "current.ts", 0)).toEqual({ path: "live.ts", step: 0 });
  });

  it("rejects foreign or malformed addresses and paths that did not exist at the claimed anchor", () => {
    for (const id of ["history:no", "history:[]", 'history:["missing","old.ts"]', 'history:["c0","missing.ts"]']) {
      expect(historicalNode(sequence, id)).toBeUndefined();
    }
  });
});
