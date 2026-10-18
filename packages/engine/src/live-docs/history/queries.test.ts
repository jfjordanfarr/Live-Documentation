import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";
import { reachability } from "../pathfind";
import type { CommitInfo } from "./format";
import { changesBetween, entryMarked, fileOfShape, graphOfShape, stepsMatching } from "./queries";
import { SequenceBuilder } from "./sequence";
import { edgeKey, type Shape } from "./shape";
import type { VersionChanges } from "./versionControl";

const HEAD = {
  lens: { key: "k", generator: { version: "0.0.0", commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
  source: { system: "git" as const, root: ".", branch: "main", head: "", shallow: false, knowledgeBegins: "", sampling: { rule: "every-commit" as const }, authors: true }
};

function shape(files: Record<string, [archetype: string, symbols: number, entry?: boolean]>, edges: Array<[string, string, number]> = []): Shape {
  return {
    files: new Map(Object.entries(files).map(([path, [archetype, symbols, entry]]) => [path, { archetype, symbols, entry: entry ?? false }])),
    edges: new Map(edges.map(([from, to, count]) => [edgeKey(from, to), count]))
  };
}

function commit(id: string): CommitInfo {
  return { id, parents: [], date: "2026-01-01T00:00:00Z", subject: id };
}

/** a.ts is renamed twice, b.ts grows, tmp.ts is born and dies between the ends, old.ts dies, new.ts is born. */
function sequence(): ReturnType<SequenceBuilder["finish"]> {
  const changes: Array<[string, Shape, VersionChanges]> = [
    ["bbbb1111", shape({ "b.ts": ["implementation", 1], "c.ts": ["implementation", 1], "old.ts": ["implementation", 0], "tmp.ts": ["implementation", 0] }, [["c.ts", "b.ts", 1], ["c.ts", "old.ts", 1]]), { renamed: [["a.ts", "c.ts"]], modified: [] }],
    ["bbbb2222", shape({ "b.ts": ["implementation", 4], "d.ts": ["implementation", 1], "new.ts": ["test", 0] }, [["d.ts", "b.ts", 1], ["new.ts", "d.ts", 1]]), { renamed: [["c.ts", "d.ts"]], modified: [] }]
  ];
  const builder = new SequenceBuilder(HEAD, commit("aaaa0000"), shape({ "a.ts": ["implementation", 1, true], "b.ts": ["implementation", 1], "old.ts": ["implementation", 0] }, [["a.ts", "b.ts", 1], ["a.ts", "old.ts", 1]]));
  for (const [id, next, version] of changes) {
    builder.add(commit(id), next, version);
  }
  return builder.finish();
}

describe("stepsMatching", () => {
  it("finds a step by a prefix of its commit's id, ignoring case, and every step a short prefix names", () => {
    expect(stepsMatching(sequence(), "AAAA")).toEqual([0]);
    expect(stepsMatching(sequence(), "bbbb2")).toEqual([2]);
    expect(stepsMatching(sequence(), "bbbb")).toEqual([1, 2]);
    expect(stepsMatching(sequence(), "")).toEqual([]);
  });
});

describe("changesBetween", () => {
  it("follows a file through every rename between, and counts neither a file born and dead between nor a wire that followed its rename", () => {
    const changes = changesBetween(sequence(), 0, 2);
    expect(changes.from.id).toBe("aaaa0000");
    expect(changes.to.id).toBe("bbbb2222");
    expect(changes.renamed).toEqual([{ from: "a.ts", to: "d.ts" }]);
    expect(changes.born).toEqual(["new.ts"]);
    expect(changes.dead).toEqual(["old.ts"]);
    expect(changes.resized).toEqual([{ codePath: "b.ts", before: 1, after: 4 }]);
    expect(changes.edgesAdded).toEqual([{ from: "new.ts", to: "d.ts" }]);
    expect(changes.edgesRemoved).toEqual([{ from: "a.ts", to: "old.ts" }]);
  });

  it("finds nothing between a step and itself, and refuses the later step first", () => {
    const same = changesBetween(sequence(), 1, 1);
    expect([same.born, same.dead, same.renamed, same.resized, same.edgesAdded, same.edgesRemoved]).toEqual([[], [], [], [], [], []]);
    expect(() => changesBetween(sequence(), 2, 1)).toThrow(RangeError);
  });
});

describe("a shape for the pathfinder", () => {
  const at = shape({ "main.ts": ["implementation", 1, true], "lib.ts": ["implementation", 2], "lib.test.ts": ["test", 0], "orphan.ts": ["implementation", 0] }, [
    ["main.ts", "lib.ts", 3],
    ["lib.test.ts", "lib.ts", 1]
  ]);

  it("walks from the entries the shape marks, and the tests", () => {
    const graph = graphOfShape(at, { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
    expect(graph.files["lib.ts"].inbound).toEqual(["lib.test.ts", "main.ts"]);
    expect(graph.files["main.ts"].docPath).toBe(".mdmd/layer-4/main.ts.mdmd.md");
    const walk = reachability(graph, undefined, Infinity, entryMarked(at));
    expect(walk.starts.map((start) => start.codePath)).toEqual(["lib.test.ts", "main.ts"]);
    expect(walk.reached).toEqual([{ codePath: "lib.ts", hops: 1 }]);
    expect(walk.unreachable).toEqual(["orphan.ts"]);
    // Without the shape's marks, the pathfinder reads Entry lines the shape does not carry, and finds only the test.
    expect(reachability(graph).starts.map((start) => start.codePath)).toEqual(["lib.test.ts"]);
  });

  it("says what a file was, with its wires' counts, or that it did not exist", () => {
    expect(fileOfShape(at, "lib.ts")).toEqual({
      codePath: "lib.ts",
      exists: true,
      archetype: "implementation",
      symbols: 2,
      entry: false,
      outbound: [],
      inbound: [{ codePath: "lib.test.ts", count: 1 }, { codePath: "main.ts", count: 3 }]
    });
    expect(fileOfShape(at, "gone.ts")).toEqual({ codePath: "gone.ts", exists: false });
  });
});
