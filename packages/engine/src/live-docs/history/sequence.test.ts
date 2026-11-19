import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";
import { decodeChange, decodeShape, encodeChange, encodeShape, Interner } from "./codec";
import { KEYFRAME_INTERVAL, type CommitInfo, type HistoryLens, type HistorySource } from "./format";
import { rowsDifferences, type Rows } from "./rows";
import { changeAt, commitAt, headOf, momentAt, rowsChangeAt, seek, SequenceBuilder } from "./sequence";
import { edgeKey, shapeDifferences, type Shape } from "./shape";
import { windowOf } from "./window";

const LENS: HistoryLens = { key: "0123456789abcdef", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG };
const SOURCE: HistorySource = { system: "git", root: ".", branch: "main", head: "c9", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" }, authors: true };

function commit(index: number): CommitInfo {
  return { id: `c${index}`, parents: index === 0 ? [] : [`c${index - 1}`], date: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(), author: "Ada", subject: `change ${index}` };
}

/**
 * The shape after change `index` of a history in which file i is born at change i and grows by one symbol each
 * change, and every file but the first links to the notes at even changes and to its own document from its birth.
 */
function growingShape(index: number): Shape {
  const shape: Shape = { files: new Map(), edges: new Map(), docLinks: new Set() };
  for (let file = 0; file <= index; file += 1) {
    shape.files.set(`src/f${file}.ts`, { archetype: file % 2 === 0 ? "implementation" : "test", symbols: index - file, entry: file === 0 });
    if (file > 0) {
      shape.edges.set(edgeKey(`src/f${file}.ts`, "src/f0.ts"), 1 + (index % 3));
      shape.docLinks.add(edgeKey(`src/f${file}.ts`, `docs/f${file}.md`));
      if (index % 2 === 0) shape.docLinks.add(edgeKey(`src/f${file}.ts`, "docs/notes.md"));
    }
  }
  return shape;
}

function build(changes: number): ReturnType<SequenceBuilder["finish"]> {
  const builder = new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), growingShape(0));
  for (let index = 1; index <= changes; index += 1) {
    builder.add(commit(index), growingShape(index), { renamed: [], modified: [] });
  }
  return builder.finish();
}

describe("the sequence", () => {
  it("replays to every shape it was built from, by seek", () => {
    const sequence = build(20);
    for (let step = 0; step <= 20; step += 1) {
      expect(shapeDifferences(growingShape(step), seek(sequence, step)), `step ${step}`).toEqual([]);
      expect(commitAt(sequence, step).id).toBe(`c${step}`);
    }
  });

  it("writes a keyframe every 256 steps, each the snapshot whole, and seeks from the nearest", () => {
    const sequence = build(KEYFRAME_INTERVAL * 2 + 3);
    expect(sequence.keyframes.map((keyframe) => keyframe.step)).toEqual([KEYFRAME_INTERVAL, KEYFRAME_INTERVAL * 2]);
    const keyframe = sequence.keyframes[1];
    expect(shapeDifferences(growingShape(keyframe.step), decodeShape(keyframe, sequence))).toEqual([]);
    // A seek past a keyframe must use it: with the deltas before it emptied, the shape is still right.
    const hollowed = { ...sequence, steps: sequence.steps.map((step, index) => (index < KEYFRAME_INTERVAL * 2 ? { ...step, delta: {} } : step)) };
    expect(shapeDifferences(growingShape(KEYFRAME_INTERVAL * 2 + 3), seek(hollowed, KEYFRAME_INTERVAL * 2 + 3))).toEqual([]);
    // On either side of a keyframe the seek gives that step's shape, never the keyframe's.
    for (const step of [KEYFRAME_INTERVAL - 1, KEYFRAME_INTERVAL, KEYFRAME_INTERVAL + 1, KEYFRAME_INTERVAL * 2 - 1, KEYFRAME_INTERVAL * 2]) {
      expect(shapeDifferences(growingShape(step), seek(sequence, step)), `step ${step}`).toEqual([]);
    }
  });

  it("interns every path and archetype once, and leaves empty lists out of a delta", () => {
    const sequence = build(3);
    // A document is a path like any other, interned once where a step first names it.
    expect(sequence.paths).toEqual(["src/f0.ts", "src/f1.ts", "docs/f1.md", "src/f2.ts", "docs/notes.md", "docs/f2.md", "src/f3.ts", "docs/f3.md"]);
    expect(sequence.archetypes).toEqual(["implementation", "test"]);
    expect(Object.keys(sequence.steps[0].delta).sort()).toEqual(["born", "docLinksAdded", "edgesAdded", "resized"]);
    expect(Object.keys(sequence.steps[2].delta).sort()).toEqual(["born", "docLinksAdded", "docLinksRemoved", "edgesAdded", "edgesChanged", "resized"]);
  });

  it("holds to the shapes where the version control's word contradicts them", () => {
    const builder = new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), growingShape(1));
    // Told that f1 was renamed to f2 while f1 stays: the rename is not believed, f2 is born, and the replay still gives the shape.
    const change = builder.add(commit(1), growingShape(2), { renamed: [["src/f1.ts", "src/f2.ts"]], modified: [] });
    expect(change.renamed).toEqual([]);
    expect(change.born.map(([path]) => path)).toEqual(["src/f2.ts"]);
    expect(shapeDifferences(growingShape(2), seek(builder.finish(), 1))).toEqual([]);
  });

  it("says what it holds in its head", () => {
    const sequence = build(4);
    expect(headOf(sequence)).toMatchObject({ format: "live-docs-history/3", commits: 5, first: { id: "c0" }, last: { id: "c4" }, lens: LENS, source: SOURCE });
    expect(changeAt(sequence, 0).born).toEqual([]);
    expect(() => seek(sequence, 5)).toThrow(RangeError);
  });

  it("decodes a step's change once and hands the same object back, one sequence apart from another", () => {
    const sequence = build(3);
    const again = build(3);
    expect(changeAt(sequence, 2)).toBe(changeAt(sequence, 2));
    expect(changeAt(sequence, 2)).not.toBe(changeAt(again, 2));
    expect(changeAt(sequence, 2)).toEqual(changeAt(again, 2));
    expect(rowsChangeAt(sequence, 2)).toBe(rowsChangeAt(sequence, 2));
  });
});

/** {@link growingShape} held to twenty files of at most five symbols, so that a history past a keyframe stays small. */
function smallShape(index: number): Shape {
  const shape = growingShape(index);
  const kept = (path: string): boolean => Number(/f(\d+)/u.exec(path)![1]) < 20;
  return {
    files: new Map([...shape.files].filter(([path]) => kept(path)).map(([path, file]) => [path, { ...file, symbols: Math.min(file.symbols, 5 + (index % 2)) }])),
    edges: new Map([...shape.edges].filter(([key]) => kept(key.split("\u0000")[0]))),
    docLinks: new Set([...shape.docLinks].filter((key) => kept(key.split("\u0000")[0])))
  };
}

/**
 * The rows of {@link smallShape}'s files: each file's symbols named for their age, newest first, each wire one
 * dependency line, the newest symbol's description changing with the change, the order reversed every fifth change,
 * and the first file's words unread until the third change.
 */
function growingRows(index: number): Rows {
  const shape = smallShape(index);
  const rows: Rows = new Map();
  for (const [path, file] of shape.files) {
    const born = Number(/f(\d+)/u.exec(path)![1]);
    rows.set(path, {
      entries: file.entry ? [{ reason: "declared" }] : [],
      // The newest symbol comes first, so that the rows of a file grow at their head and, every fifth change, reorder.
      symbols: Array.from({ length: file.symbols }, (_, age) => ({ name: `s${age}`, slug: `s${age}`, kind: "function", flags: [], references: [], ...(age === 0 ? { text: index } : {}) })).reverse(),
      dependencies: [],
      reExports: [],
      citedBy: [],
      authored: born === 0 && index < 3 ? "unread" : born
    });
    if (index % 5 === 4) rows.get(path)!.symbols.reverse();
  }
  for (const [key, count] of shape.edges) {
    const [from, to] = key.split("\u0000");
    rows.get(from)!.dependencies.push(...Array.from({ length: count }, () => ({ label: to, kind: "import" as const, to })));
  }
  return rows;
}

describe("the sequence's rows", () => {
  function buildWithRows(changes: number): ReturnType<SequenceBuilder["finish"]> {
    const builder = new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), smallShape(0), growingRows(0));
    for (let index = 1; index <= changes; index += 1) {
      builder.add(commit(index), smallShape(index), { renamed: [], modified: [] }, growingRows(index));
    }
    return builder.finish();
  }

  it("replays to every step's rows, by a seek from the nearest keyframe, which repeats them whole", () => {
    const sequence = buildWithRows(KEYFRAME_INTERVAL + 4);
    expect(sequence.keyframes[0].rows.length).toBe(20);
    for (const step of [0, 1, 2, 3, 4, 5, KEYFRAME_INTERVAL - 1, KEYFRAME_INTERVAL, KEYFRAME_INTERVAL + 4]) {
      const moment = momentAt(sequence, step);
      expect(rowsDifferences(growingRows(step), moment.rows), `step ${step}`).toEqual([]);
      expect(shapeDifferences(smallShape(step), moment.shape), `step ${step}`).toEqual([]);
    }
    expect(sequence.names).toContain("s0");
    // The first file's words become readable at the third change, where the third file is born with its own.
    expect(rowsChangeAt(sequence, 3).authored).toEqual([["src/f0.ts", 0], ["src/f3.ts", 3]]);
  });

  it("refuses rows that disagree with the shape they come with", () => {
    const rows = growingRows(1);
    rows.get("src/f1.ts")!.dependencies.push({ label: "x", kind: "import", to: "src/f0.ts" });
    expect(() => new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), smallShape(1), rows)).toThrow("disagree with its shape");
    const builder = new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), smallShape(0), growingRows(0));
    expect(() => builder.add(commit(1), smallShape(1), { renamed: [], modified: [] }, rows)).toThrow("does not give its moment");
    expect(() => builder.add(commit(1), smallShape(1), { renamed: [], modified: [] })).toThrow("gives no rows");
  });

  it("carries the rows through a window re-based on its first change", () => {
    const sequence = buildWithRows(12);
    const window = windowOf(sequence, { rule: "last", count: 4 });
    for (let step = 0; step < 4; step += 1) {
      expect(rowsDifferences(growingRows(9 + step), momentAt(window, step).rows), `step ${step}`).toEqual([]);
    }
  });
});

describe("the codec", () => {
  it("round-trips a shape and a change through the tables", () => {
    const interners = { paths: new Interner(), archetypes: new Interner() };
    const shape = growingShape(3);
    const tuples = encodeShape(shape, interners);
    const tables = { paths: interners.paths.values, archetypes: interners.archetypes.values };
    expect(shapeDifferences(shape, decodeShape(tuples, tables))).toEqual([]);
    const change = {
      born: [["new/x.ts", { archetype: "asset", symbols: 0, entry: false }]] as Array<[string, { archetype: string; symbols: number; entry: boolean }]>,
      dead: ["src/f3.ts"],
      renamed: [["src/f1.ts", "lib/f1.ts"]] as Array<[string, string]>,
      resized: [["src/f2.ts", 9]] as Array<[string, number]>,
      rekinded: [["src/f0.ts", "component"]] as Array<[string, string]>,
      entries: [["src/f2.ts", true]] as Array<[string, boolean]>,
      edgesAdded: [["new/x.ts", "src/f0.ts", 2]] as Array<[string, string, number]>,
      edgesRemoved: [["src/f3.ts", "src/f0.ts"]] as Array<[string, string]>,
      edgesChanged: [["lib/f1.ts", "src/f0.ts", 7]] as Array<[string, string, number]>,
      docLinksAdded: [["new/x.ts", "docs/x.md"]] as Array<[string, string]>,
      docLinksRemoved: [["src/f3.ts", "docs/f3.md"]] as Array<[string, string]>,
      directoriesRenamed: [["src/sub", "lib/sub"]] as Array<[string, string]>,
      touched: ["src/f0.ts"]
    };
    const delta = encodeChange(change, interners);
    expect(decodeChange(delta, { paths: interners.paths.values, archetypes: interners.archetypes.values })).toEqual(change);
    expect(interners.paths.values).toContain("new/x.ts");
    expect(interners.archetypes.values).toContain("component");
  });
});
