import { describe, expect, it } from "vitest";

import { renderLiveDoc, parseLiveDoc, type LiveDoc } from "./document";
import { deriveLiveDocGraph, linkTarget } from "./graph";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

/** A doc at `docPath` for `codePath`, rendered and parsed so the test reads what a consumer reads. */
function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

describe("deriveLiveDocGraph", () => {
  const types = doc("src/types.ts", {
    symbols: [{ name: "Widget", slug: "symbol-widget", kind: "interface", flags: [], references: [], sections: [] }]
  });
  const walk = doc("src/graph/walk.ts", {
    symbols: [
      {
        name: "walk",
        slug: "symbol-walk",
        kind: "function",
        flags: [],
        references: [
          { role: "Returns", types: [{ name: "Edge", link: "#symbol-edge", array: true }] },
          {
            role: "Parameters",
            parameters: [
              { name: "from", types: [{ name: "Widget", link: "../types.ts.md#symbol-widget" }] },
              { name: "options", types: [{ name: "Options" }] }
            ]
          }
        ],
        sections: []
      },
      { name: "Edge", slug: "symbol-edge", kind: "interface", flags: [], references: [], sections: [] }
    ],
    dependencies: [
      { label: "node:path", symbols: ["join"], qualifiers: [] },
      { label: "types.Widget", link: "../types.ts.md#symbol-widget", qualifiers: ["type-only"] },
      { label: "missing", link: "../missing.ts.md", qualifiers: [] },
      { label: "index", link: "../index.ts.md", qualifiers: ["re-export"] }
    ]
  });
  const index = doc("src/index.ts", { dependencies: [{ label: "walk", link: "./graph/walk.ts.md", qualifiers: ["re-export"] }] });
  const graph = deriveLiveDocGraph([walk, index, types], location);

  it("keys the files by code path, in order, each carrying its parsed doc", () => {
    expect(Object.keys(graph.files)).toEqual(["src/graph/walk.ts", "src/index.ts", "src/types.ts"]);
    expect(graph.files["src/types.ts"]).toMatchObject({ ...types.doc, docPath: types.docPath });
  });

  it("makes one edge per dependency line and per linked type reference, resolved where a doc answers", () => {
    expect(graph.files["src/graph/walk.ts"].edges).toEqual([
      { kind: "import", label: "node:path" },
      { kind: "import", label: "types.Widget", link: "../types.ts.md#symbol-widget", to: "src/types.ts", toSymbol: "symbol-widget", typeOnly: true },
      { kind: "import", label: "missing", link: "../missing.ts.md" },
      { kind: "re-export", label: "index", link: "../index.ts.md", to: "src/index.ts" },
      { kind: "returns", label: "Edge", link: "#symbol-edge", to: "src/graph/walk.ts", toSymbol: "symbol-edge", from: "symbol-walk" },
      { kind: "parameter", label: "Widget", link: "../types.ts.md#symbol-widget", to: "src/types.ts", toSymbol: "symbol-widget", from: "symbol-walk", parameter: "from" }
    ]);
  });

  it("derives the file-level adjacency both ways, without self edges", () => {
    expect(graph.files["src/graph/walk.ts"].outbound).toEqual(["src/index.ts", "src/types.ts"]);
    expect(graph.files["src/graph/walk.ts"].inbound).toEqual(["src/index.ts"]);
    expect(graph.files["src/index.ts"]).toMatchObject({ outbound: ["src/graph/walk.ts"], inbound: ["src/graph/walk.ts"] });
    expect(graph.files["src/types.ts"]).toMatchObject({ outbound: [], inbound: ["src/graph/walk.ts"] });
  });

  it("refuses two docs for one code path", () => {
    expect(() => deriveLiveDocGraph([types, { ...types, docPath: "elsewhere.md" }], location)).toThrow("two docs describe src/types.ts");
  });
});

describe("linkTarget", () => {
  const from = ".live-documentation/source/src/graph/walk.ts.md";

  it("resolves a relative link to the doc and the file it mirrors", () => {
    expect(linkTarget(from, "../types.ts.md#symbol-widget", location)).toEqual({
      docPath: ".live-documentation/source/src/types.ts.md",
      codePath: "src/types.ts",
      anchor: "symbol-widget"
    });
  });

  it("names the doc itself for a bare fragment", () => {
    expect(linkTarget(from, "#symbol-edge", location)).toEqual({ docPath: from, codePath: "src/graph/walk.ts", anchor: "symbol-edge" });
  });

  it("returns nothing for a link that leaves the docs, is absolute, or is not a Live Doc", () => {
    expect(linkTarget(from, "../../../../README.md", location)).toBeUndefined();
    expect(linkTarget(from, "https://example.com/x.md", location)).toBeUndefined();
    expect(linkTarget(from, "../../../../src/graph/walk.ts", location)).toBeUndefined();
    expect(linkTarget(from, "../types.ts", location)).toBeUndefined();
  });

  it("matches the extension without regard to case, as the workspace mount does", () => {
    expect(linkTarget(from, "../Types.ts.MD", location)?.codePath).toBe("src/Types.ts");
  });
});
