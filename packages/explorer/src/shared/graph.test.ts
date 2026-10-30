import { describe, expect, it } from "vitest";

import { documentedReferences, explorerGraphOf } from "./graph";
import { parseLiveDoc, renderLiveDoc, type LiveDoc } from "../../../engine/src/live-docs/document";
import { deriveLiveDocGraph } from "../../../engine/src/live-docs/graph";

describe("documented reference multiplicity in the Explorer projection", () => {
  it("counts each documented fact once, including repeated parameters, and keeps inheritance and reciprocal imports", () => {
    const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };
    const doc = (codePath: string, parts: Partial<LiveDoc>) => ({
      docPath: `${location.root}/${location.baseLayer}/${codePath}.md`,
      doc: parseLiveDoc(renderLiveDoc({ codePath, layer: 4, archetype: "implementation", entries: [], authored: "### Purpose\nTest.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts }))
    });
    const target = { name: "Widget", link: "./types.ts.md#symbol-widget" };
    const graph = deriveLiveDocGraph([
      doc("src/consumer.ts", {
        dependencies: [{ label: "Widget", link: target.link, qualifiers: [] }, { label: "external", qualifiers: [] }],
        symbols: [
          { name: "send", slug: "symbol-send", kind: "function", flags: [], sections: [], references: [
            { role: "Returns", types: [target] },
            { role: "Parameters", parameters: [{ name: "left", types: [target] }, { name: "right", types: [{ ...target, array: true }] }] }
          ] },
          { name: "Derived", slug: "symbol-derived", kind: "class", flags: [], sections: [], references: [{ role: "Extends", types: [target] }] }
        ]
      }),
      doc("src/types.ts", {
        symbols: [{ name: "Widget", slug: "symbol-widget", kind: "interface", flags: [], references: [], sections: [] }],
        dependencies: [{ label: "consumer", link: "./consumer.ts.md", qualifiers: [] }]
      })
    ], location);
    const before = JSON.stringify(graph);
    const projected = explorerGraphOf(graph);
    expect(projected.links).toHaveLength(4);
    expect(projected.links.find(edge => edge.sourceSymbol === "send")).toMatchObject({
      kind: "type-reference", targetSymbol: "symbol-widget", referenceCount: 3
    });
    expect(projected.links.find(edge => edge.kind === "extends")).toMatchObject({ referenceCount: 1 });
    expect(projected.links.filter(edge => edge.sourceSymbol === "send")).toHaveLength(1);
    const documented = Object.values(graph.files).flatMap(file => file.edges.filter(edge => edge.to && edge.to !== file.codePath));
    expect(projected.links.reduce((total, edge) => total + edge.referenceCount!, 0)).toBe(documented.length);
    expect(documented).toHaveLength(6);
    expect(projected.nodes.find(node => node.id === "src/consumer.ts")!.missingDependencies).toHaveLength(1);
    expect(JSON.stringify(graph)).toBe(before);
  });
});

describe("the stats' reference total", () => {
  const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };
  const doc = (codePath: string, parts: Partial<LiveDoc>) => ({
    docPath: `${location.root}/${location.baseLayer}/${codePath}.md`,
    doc: parseLiveDoc(renderLiveDoc({ codePath, layer: 4, archetype: "implementation", entries: [], authored: "### Purpose\nTest.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts }))
  });

  it("counts a signature that names one type in three places as one link and three references, and a dependency with no target as outside the scan", () => {
    const target = { name: "Widget", link: "./types.ts.md#symbol-widget" };
    const graph = deriveLiveDocGraph([
      doc("src/consumer.ts", {
        dependencies: [{ label: "external", qualifiers: [] }],
        symbols: [{ name: "send", slug: "symbol-send", kind: "function", flags: [], sections: [], references: [
          { role: "Returns", types: [target] },
          { role: "Parameters", parameters: [{ name: "left", types: [target] }, { name: "right", types: [target] }] }
        ] }]
      }),
      doc("src/types.ts", { symbols: [{ name: "Widget", slug: "symbol-widget", kind: "interface", flags: [], references: [], sections: [] }] })
    ], location);
    const { links, stats } = explorerGraphOf(graph);
    expect(links).toEqual([expect.objectContaining({ kind: "type-reference", referenceCount: 3 })]);
    expect(stats).toEqual({ nodes: 2, links: 1, references: 3, dependenciesOutsideScan: 1 });
  });

  it("sums each link's count, one for a link that carries none", () => {
    expect(documentedReferences([
      { source: "a", target: "b", kind: "type-reference", referenceCount: 3 },
      { source: "a", target: "c", kind: "dependency" },
      { source: "c", target: "b", kind: "dependency", referenceCount: 1 }
    ])).toBe(5);
    expect(documentedReferences([])).toBe(0);
  });
});
