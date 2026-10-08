import { describe, expect, it } from "vitest";

import { sourcesFacts, symbolCount } from "./sources-facts";

type LiveDocGraph = Parameters<typeof sourcesFacts>[0];
type GraphFile = LiveDocGraph["files"][string];

/** A graph file with only what the facts read; everything else empty. */
function file(codePath: string, archetype: string, edges: { to: string; toSymbol?: string }[], symbols: string[], generatedAt?: string): GraphFile {
  return {
    codePath,
    docPath: `.mdmd/layer-4/${codePath}.mdmd.md`,
    layer: 4,
    archetype,
    generatedAt,
    authored: "",
    symbols: symbols.map(name => ({ name, slug: `symbol-${name.toLowerCase()}`, kind: "function", flags: [], references: [], sections: [] })),
    dependencies: [],
    edges: edges.map(edge => ({ kind: "import" as const, label: edge.toSymbol ?? edge.to, to: edge.to, toSymbol: edge.toSymbol })),
    outbound: [],
    inbound: []
  };
}

/** A graph whose inbound and outbound lists follow from its edges, as the generator writes them. */
function graph(files: GraphFile[]): LiveDocGraph {
  const byPath = Object.fromEntries(files.map(entry => [entry.codePath, entry]));
  for (const entry of files) {
    entry.outbound = [...new Set(entry.edges.map(edge => edge.to!).filter(to => to !== entry.codePath && to in byPath))].sort();
  }
  for (const entry of files) {
    entry.inbound = files.filter(other => other !== entry && other.outbound.includes(entry.codePath)).map(other => other.codePath).sort();
  }
  return { root: ".docs", baseLayer: "base", extension: ".md", files: byPath };
}

const SAMPLE = graph([
  // core offers three symbols: app uses two of them, the test uses the third, nobody names `spare`'s... (see below)
  file("src/core.ts", "implementation", [], ["Alpha", "Beta", "Gamma", "Delta"], "2026-10-01T00:00:00.000Z"),
  file("src/app.ts", "implementation", [{ to: "src/core.ts", toSymbol: "symbol-alpha" }, { to: "src/core.ts", toSymbol: "symbol-beta" }, { to: "src/util.ts", toSymbol: "symbol-help" }], ["main"], "2026-10-03T00:00:00.000Z"),
  file("src/util.ts", "implementation", [{ to: "src/core.ts", toSymbol: "symbol-alpha" }], ["help", "unused"], "2026-10-02T00:00:00.000Z"),
  file("src/core.test.ts", "test", [{ to: "src/core.ts", toSymbol: "symbol-gamma" }, { to: "src/helper.ts", toSymbol: "symbol-fixture" }], ["spec"]),
  file("src/helper.ts", "implementation", [], ["fixture"]),
  file("assets/data.json", "asset", [], []),
  file("README.md", "asset", [], [])
]);

describe("the bundle's shape", () => {
  it("counts files by archetype, first directory and extension, references between files, and the generation span", () => {
    const { shape } = sourcesFacts(SAMPLE);
    expect(shape.root).toBe(".docs");
    expect(shape.files).toBe(7);
    expect(shape.byArchetype).toEqual([{ name: "implementation", count: 4 }, { name: "asset", count: 2 }, { name: "test", count: 1 }]);
    expect(shape.byDirectory).toEqual([{ name: "src", count: 5 }, { name: "", count: 1 }, { name: "assets", count: 1 }]);
    expect(shape.byExtension).toEqual([{ name: ".ts", count: 5 }, { name: ".json", count: 1 }, { name: ".md", count: 1 }]);
    expect(shape.references).toBe(6);
    expect(shape.generatedFrom).toBe("2026-10-01T00:00:00.000Z");
    expect(shape.generatedTo).toBe("2026-10-03T00:00:00.000Z");
  });

  it("leaves the generation span out when no doc carries a date", () => {
    const { shape } = sourcesFacts(graph([file("a.ts", "implementation", [], [])]));
    expect(shape.generatedFrom).toBeUndefined();
    expect(shape.references).toBe(0);
  });
});

describe("the files most used and most using", () => {
  it("ranks a file by the files referencing it and says how many of its symbols they name", () => {
    const { mostUsed, mostUsing } = sourcesFacts(SAMPLE);
    expect(mostUsed[0]).toEqual({ path: "src/core.ts", archetype: "implementation", users: 3, symbolsUsed: 3, symbols: 4 });
    expect(mostUsed.map(entry => entry.path)).toEqual(["src/core.ts", "src/helper.ts", "src/util.ts"]);
    expect(mostUsing[0]).toEqual({ path: "src/app.ts", archetype: "implementation", uses: 2 });
    expect(mostUsing.map(entry => entry.path)).toEqual(["src/app.ts", "src/core.test.ts", "src/util.ts"]);
  });

  it("caps both lists at the limit", () => {
    const facts = sourcesFacts(SAMPLE, 1);
    expect(facts.mostUsed).toHaveLength(1);
    expect(facts.mostUsing).toHaveLength(1);
  });
});

describe("what nothing references", () => {
  it("lists the files no other file references, and apart from them the non-test files only tests reference", () => {
    const { unreferenced, testsOnly } = sourcesFacts(SAMPLE);
    expect(unreferenced.map(entry => entry.path)).toEqual(["assets/data.json", "README.md", "src/app.ts", "src/core.test.ts"]);
    expect(testsOnly).toEqual([{ path: "src/helper.ts", archetype: "implementation" }]);
  });

  it("lists the public symbols of non-test files that no other file names, and those only tests name, by file", () => {
    const { symbolsUnreferenced, symbolsTestsOnly } = sourcesFacts(SAMPLE);
    expect(symbolsUnreferenced.map(entry => [entry.path, entry.symbols.map(symbol => symbol.name)])).toEqual([
      ["src/app.ts", ["main"]],
      ["src/core.ts", ["Delta"]],
      ["src/util.ts", ["unused"]]
    ]);
    expect(symbolsTestsOnly.map(entry => [entry.path, entry.symbols.map(symbol => symbol.name)])).toEqual([
      ["src/core.ts", ["Gamma"]],
      ["src/helper.ts", ["fixture"]]
    ]);
    expect(symbolCount(symbolsUnreferenced)).toBe(3);
    // A symbol a test names beside another file is not tests-only: Alpha is named by app and util, Gamma by the test alone.
    expect(symbolsTestsOnly.flatMap(entry => entry.symbols.map(symbol => symbol.name))).not.toContain("Alpha");
  });

  it("does not count a test file's own symbols as unreferenced, nor a file without symbols", () => {
    const { symbolsUnreferenced } = sourcesFacts(SAMPLE);
    expect(symbolsUnreferenced.map(entry => entry.path)).not.toContain("src/core.test.ts");
    expect(symbolsUnreferenced.map(entry => entry.path)).not.toContain("assets/data.json");
  });
});
