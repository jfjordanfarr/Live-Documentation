import { describe, expect, it } from "vitest";

import { deriveChange } from "./derive";
import { applyChange, edgeKey, shapeDifferences, type Shape } from "./shape";

function shape(files: Record<string, [archetype: string, symbols: number, entry?: boolean]>, edges: Array<[string, string, number]> = []): Shape {
  return {
    files: new Map(Object.entries(files).map(([path, [archetype, symbols, entry]]) => [path, { archetype, symbols, entry: entry ?? false }])),
    edges: new Map(edges.map(([from, to, count]) => [edgeKey(from, to), count]))
  };
}

describe("deriveChange", () => {
  it("names births, deaths, sizes, kinds, entry marks and wires, and replays to the later shape", () => {
    const before = shape({ "a.ts": ["implementation", 1], "b.ts": ["implementation", 2], "old.ts": ["implementation", 0] }, [
      ["a.ts", "b.ts", 1],
      ["a.ts", "old.ts", 2]
    ]);
    const after = shape({ "a.ts": ["implementation", 3, true], "b.ts": ["test", 2], "new.ts": ["asset", 0] }, [
      ["a.ts", "b.ts", 4],
      ["b.ts", "new.ts", 1]
    ]);
    const change = deriveChange(before, after, { renamed: [], modified: [] });
    expect(change.born).toEqual([["new.ts", { archetype: "asset", symbols: 0, entry: false }]]);
    expect(change.dead).toEqual(["old.ts"]);
    expect(change.resized).toEqual([["a.ts", 3]]);
    expect(change.rekinded).toEqual([["b.ts", "test"]]);
    expect(change.entries).toEqual([["a.ts", true]]);
    expect(change.edgesAdded).toEqual([["b.ts", "new.ts", 1]]);
    expect(change.edgesRemoved).toEqual([["a.ts", "old.ts"]]);
    expect(change.edgesChanged).toEqual([["a.ts", "b.ts", 4]]);
    expect(shapeDifferences(after, applyChange(before, change))).toEqual([]);
  });

  it("believes a rename the shapes can see, and carries the renamed file's wires so that they neither come nor go", () => {
    const before = shape({ "src/view.ts": ["implementation", 2], "src/main.ts": ["implementation", 1] }, [["src/main.ts", "src/view.ts", 1]]);
    const after = shape({ "src/screen.ts": ["implementation", 2], "src/main.ts": ["implementation", 1] }, [["src/main.ts", "src/screen.ts", 1]]);
    const change = deriveChange(before, after, { renamed: [["src/view.ts", "src/screen.ts"]], modified: ["src/main.ts"] });
    expect(change.renamed).toEqual([["src/view.ts", "src/screen.ts"]]);
    expect(change.born).toEqual([]);
    expect(change.dead).toEqual([]);
    expect(change.edgesAdded).toEqual([]);
    expect(change.edgesRemoved).toEqual([]);
    expect(change.touched).toEqual(["src/main.ts"]);
    expect(shapeDifferences(after, applyChange(before, change))).toEqual([]);
  });

  it("reads a rename out of the documented set as a death, into it as a birth, and a rename below the threshold as both", () => {
    const before = shape({ "a.ts": ["implementation", 1], "b.ts": ["implementation", 1] });
    const after = shape({ "c.ts": ["implementation", 1], "b.ts": ["implementation", 1] });
    const change = deriveChange(before, after, { renamed: [["a.ts", "README.md"], ["notes.txt", "c.ts"]], modified: [] });
    expect(change.renamed).toEqual([]);
    expect(change.dead).toEqual(["a.ts"]);
    expect(change.born.map(([path]) => path)).toEqual(["c.ts"]);
  });

  it("calls touched only what changed in content and in nothing of its shape", () => {
    const before = shape({ "a.ts": ["implementation", 1], "b.ts": ["implementation", 1], "c.ts": ["implementation", 1], "d.ts": ["implementation", 1] }, [["c.ts", "d.ts", 1]]);
    const after = shape({ "a.ts": ["implementation", 2], "b.ts": ["implementation", 1], "c.ts": ["implementation", 1], "d.ts": ["implementation", 1] }, [["c.ts", "d.ts", 2]]);
    const change = deriveChange(before, after, { renamed: [], modified: ["a.ts", "b.ts", "c.ts", "d.ts", "gone.ts"] });
    // a.ts resized; c.ts and d.ts share a wire whose count changed; gone.ts is no file of the shape.
    expect(change.touched).toEqual(["b.ts"]);
  });

  it("derives the directories renamed whole from the renames it believes", () => {
    const before = shape({ "core/a.ts": ["implementation", 1], "core/b.ts": ["implementation", 1] });
    const after = shape({ "engine/a.ts": ["implementation", 1], "engine/b.ts": ["implementation", 1] });
    const change = deriveChange(before, after, { renamed: [["core/a.ts", "engine/a.ts"], ["core/b.ts", "engine/b.ts"]], modified: [] });
    expect(change.directoriesRenamed).toEqual([["core", "engine"]]);
  });
});

describe("applyChange", () => {
  it("never changes the shape it is given", () => {
    const before = shape({ "a.ts": ["implementation", 1], "c.ts": ["implementation", 1] }, [["c.ts", "a.ts", 1]]);
    const after = shape({ "b.ts": ["implementation", 5], "c.ts": ["implementation", 1] }, [["c.ts", "b.ts", 1]]);
    const change = deriveChange(before, after, { renamed: [["a.ts", "b.ts"]], modified: [] });
    expect(shapeDifferences(after, applyChange(before, change))).toEqual([]);
    expect([...before.files.keys()]).toEqual(["a.ts", "c.ts"]);
    expect(before.files.get("a.ts")?.symbols).toBe(1);
    expect([...before.edges.keys()]).toEqual([edgeKey("c.ts", "a.ts")]);
  });

  it("refuses a step that changes a file the shape does not hold", () => {
    const change = deriveChange(shape({ "a.ts": ["implementation", 1] }), shape({ "a.ts": ["implementation", 2] }), { renamed: [], modified: [] });
    expect(() => applyChange(shape({}), change)).toThrow("a.ts");
  });
});

describe("shapeDifferences", () => {
  it("says where two shapes differ, at most the limit", () => {
    const one = shape({ "a.ts": ["implementation", 1], "b.ts": ["implementation", 1] }, [["a.ts", "b.ts", 1]]);
    const other = shape({ "a.ts": ["test", 1], "c.ts": ["implementation", 1] });
    expect(shapeDifferences(one, other)).toEqual([
      "a.ts is test with 1 symbols where implementation with 1 symbols was expected",
      "b.ts is missing",
      "c.ts is present and was not expected",
      "the edge a.ts -> b.ts counts nothing where 1 was expected"
    ]);
    expect(shapeDifferences(one, other, 2)).toHaveLength(2);
    expect(shapeDifferences(one, one)).toEqual([]);
  });
});
