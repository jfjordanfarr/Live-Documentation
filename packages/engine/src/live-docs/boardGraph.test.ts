import { describe, expect, it } from "vitest";

import type { Board } from "./board";
import { deriveBoardGraph } from "./boardGraph";
import { parseLiveDoc, renderLiveDoc, type LiveDoc } from "./document";
import { deriveLiveDocGraph } from "./graph";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

const graph = deriveLiveDocGraph(
  [
    doc("a/x.ts", {
      symbols: [
        { name: "POST api/x", slug: "symbol-post-apix", kind: "route", flags: [], references: [], sections: [] },
        { name: "helper", slug: "symbol-helper", kind: "function", flags: [], references: [], sections: [] }
      ]
    }),
    doc("a/inner/q.ts", { dependencies: [{ label: "x", link: "../x.ts.md", qualifiers: [] }] }),
    doc("a/a.csproj", {
      symbols: [{ name: "A", slug: "symbol-a", kind: "web", flags: [], references: [], sections: [] }],
      dependencies: [{ label: "EntityFramework@6.4.4", symbols: [], qualifiers: [] }, { label: "System.Web", symbols: [], qualifiers: [] }, { label: "q", link: "./inner/q.ts.md", qualifiers: [] }]
    }),
    doc("b/y.ts", {
      dependencies: [
        { label: "x.POST api/x", link: "../a/x.ts.md#symbol-post-apix", qualifiers: ["contract"] },
        { label: "x.helper", link: "../a/x.ts.md#symbol-helper", qualifiers: [] }
      ]
    }),
    doc("b/z.ts", { dependencies: [{ label: "x", link: "../a/x.ts.md", qualifiers: [] }, { label: "y", link: "./y.ts.md", qualifiers: [] }] }),
    doc("c/w.ts", { dependencies: [{ label: "x", link: "../a/x.ts.md", qualifiers: [] }] })
  ],
  location
);

const board: Board = {
  title: "Test",
  layer: 3,
  authored: "### Purpose\nX.",
  things: [
    { name: "A", kind: "service", from: "../a", serves: [], holds: [] },
    { name: "Q", kind: "library", from: "../a/inner", serves: [], holds: [] },
    { name: "B", kind: "web", from: "../b", serves: [], holds: [] },
    { name: "D", kind: "database", serves: [{ name: "usp_Do", kind: "procedure" }], holds: [] },
    { name: "E", kind: "service", from: "../elsewhere", serves: [], holds: [] },
    { name: "F", kind: "service", from: "../../outside", serves: [], holds: [] }
  ],
  connections: [
    { from: "B", to: "D", door: "usp_Do" },
    { from: "B", to: "A", door: "GET api/none", over: "HTTPS" }
  ],
  legend: [],
  layout: []
};

describe("deriveBoardGraph", () => {
  const derived = deriveBoardGraph(board, graph, "boards/test.md");

  it("gives each thing the files under its folder, the nested thing keeping its own", () => {
    expect(derived.things.map((entry) => [entry.thing.name, entry.folder, entry.files])).toEqual([
      ["A", "a", ["a/a.csproj", "a/x.ts"]],
      ["Q", "a/inner", ["a/inner/q.ts"]],
      ["B", "b", ["b/y.ts", "b/z.ts"]],
      ["D", undefined, []],
      ["E", "elsewhere", []],
      ["F", undefined, []]
    ]);
  });

  it("collects the doors a thing serves from its docs and its declaration", () => {
    expect(derived.things.find((entry) => entry.thing.name === "A")?.doors).toEqual([{ name: "POST api/x", kind: "route" }]);
    expect(derived.things.find((entry) => entry.thing.name === "D")?.doors).toEqual([{ name: "usp_Do", kind: "procedure" }]);
  });

  it("collects what a thing stands on from its manifests' externals", () => {
    expect(derived.things.find((entry) => entry.thing.name === "A")?.standsOn).toEqual([
      { label: "EntityFramework@6.4.4", manifest: "a/a.csproj" },
      { label: "System.Web", manifest: "a/a.csproj" }
    ]);
    expect(derived.things.find((entry) => entry.thing.name === "B")?.standsOn).toEqual([]);
  });

  it("implies one wire per pair of things, door and basis, keeping the edges behind it, and adds the declared connections", () => {
    expect(derived.wires).toEqual([
      { from: "A", to: "Q", basis: "source", edges: 1, lines: [{ from: "a/a.csproj", to: "a/inner/q.ts", label: "q" }] },
      { from: "B", to: "A", basis: "source", edges: 2, lines: [{ from: "b/y.ts", to: "a/x.ts", label: "x.helper" }, { from: "b/z.ts", to: "a/x.ts", label: "x" }] },
      { from: "B", to: "A", door: { name: "GET api/none" }, basis: "declared", edges: 1, lines: [], over: "HTTPS" },
      { from: "B", to: "A", door: { name: "POST api/x", kind: "route" }, basis: "contract", edges: 1, lines: [{ from: "b/y.ts", to: "a/x.ts", label: "x.POST api/x" }] },
      { from: "B", to: "D", door: { name: "usp_Do", kind: "procedure" }, basis: "declared", edges: 1, lines: [] },
      { from: "Q", to: "A", basis: "source", edges: 1, lines: [{ from: "a/inner/q.ts", to: "a/x.ts", label: "x" }] }
    ]);
  });

  it("reports what the join found wanting, without refusing", () => {
    expect(derived.issues.map((issue) => issue.message)).toEqual([
      "F comes from ../../outside, which is outside the workspace",
      "E has no docs under elsewhere",
      "B to A.GET api/none: A serves no such door"
    ]);
  });
});
