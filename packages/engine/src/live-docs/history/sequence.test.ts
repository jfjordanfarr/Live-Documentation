import { describe, expect, it } from "vitest";

import { decodeChange, decodeShape, encodeChange, encodeShape, Interner } from "./codec";
import { KEYFRAME_INTERVAL, type CommitInfo, type HistoryLens, type HistorySource } from "./format";
import { changeAt, commitAt, headOf, seek, SequenceBuilder } from "./sequence";
import { edgeKey, shapeDifferences, type Shape } from "./shape";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";

const LENS: HistoryLens = { key: "0123456789abcdef", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG };
const SOURCE: HistorySource = { system: "git", root: ".", branch: "main", head: "c9", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" }, authors: true };

function commit(index: number): CommitInfo {
  return { id: `c${index}`, parents: index === 0 ? [] : [`c${index - 1}`], date: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(), author: "Ada", subject: `change ${index}` };
}

/** The shape after change `index` of a history in which file i is born at change i and grows by one symbol each change. */
function growingShape(index: number): Shape {
  const shape: Shape = { files: new Map(), edges: new Map() };
  for (let file = 0; file <= index; file += 1) {
    shape.files.set(`src/f${file}.ts`, { archetype: file % 2 === 0 ? "implementation" : "test", symbols: index - file, entry: file === 0 });
    if (file > 0) {
      shape.edges.set(edgeKey(`src/f${file}.ts`, "src/f0.ts"), 1 + (index % 3));
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
    expect(sequence.paths).toEqual(["src/f0.ts", "src/f1.ts", "src/f2.ts", "src/f3.ts"]);
    expect(sequence.archetypes).toEqual(["implementation", "test"]);
    expect(Object.keys(sequence.steps[0].delta).sort()).toEqual(["born", "edgesAdded", "resized"]);
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
    expect(headOf(sequence)).toMatchObject({ format: "live-docs-history/1", commits: 5, first: { id: "c0" }, last: { id: "c4" }, lens: LENS, source: SOURCE });
    expect(changeAt(sequence, 0).born).toEqual([]);
    expect(() => seek(sequence, 5)).toThrow(RangeError);
  });

  it("decodes a step's change once and hands the same object back, one sequence apart from another", () => {
    const sequence = build(3);
    const again = build(3);
    expect(changeAt(sequence, 2)).toBe(changeAt(sequence, 2));
    expect(changeAt(sequence, 2)).not.toBe(changeAt(again, 2));
    expect(changeAt(sequence, 2)).toEqual(changeAt(again, 2));
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
      directoriesRenamed: [["src/sub", "lib/sub"]] as Array<[string, string]>,
      touched: ["src/f0.ts"]
    };
    const delta = encodeChange(change, interners);
    expect(decodeChange(delta, { paths: interners.paths.values, archetypes: interners.archetypes.values })).toEqual(change);
    expect(interners.paths.values).toContain("new/x.ts");
    expect(interners.archetypes.values).toContain("component");
  });
});
