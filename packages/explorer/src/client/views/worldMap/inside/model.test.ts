import { describe, expect, it } from "vitest";

import { parseLiveDoc, renderLiveDoc, type LiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { buildInsideModel, neighboursOf } from "./model";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

const symbol = (name: string, slug: string, kind = "class") => ({ name, slug, kind, flags: [], references: [], sections: [] });
const dep = (label: string, link: string) => ({ label, link, qualifiers: [] as string[] });

const bigFiles = [1, 2, 3, 4, 5, 6, 7].map((i) => `gw/big/f${i}.ts`);
const graph = deriveLiveDocGraph(
  [
    doc("gw/Web.config", { symbols: [symbol("Gateway.Workload", "symbol-workload", "setting")], dependencies: [dep("I", "../lib/I.cs.md")] }),
    doc("gw/Settings.cs", { symbols: [symbol("Settings", "symbol-settings")], dependencies: [dep("Web.config", "./Web.config.md"), dep("Settings", "./Settings.cs.md#symbol-settings")] }),
    doc("gw/Controllers/Pay.cs", { symbols: [symbol("POST api/pay", "symbol-post", "route")], dependencies: [dep("Settings", "../Settings.cs.md#symbol-settings")] }),
    doc("gw/deep/a/b/one.ts", {}),
    doc("gw/src/x/1.ts", {}),
    doc("gw/src/y/2.ts", {}),
    ...bigFiles.map((file, i) => doc(file, { dependencies: i < 2 ? [dep("Settings", "../Settings.cs.md#symbol-settings"), dep("f7", "./f7.ts.md")] : [] })),
    doc("lib/I.cs", { symbols: [symbol("I", "symbol-i", "interface")] }),
    doc("portal/P.cs", { dependencies: [{ label: "POST api/pay", link: "../gw/Controllers/Pay.cs.md#symbol-post", qualifiers: ["contract"] }] }),
    doc("loose/L.cs", { dependencies: [dep("Web.config", "../gw/Web.config.md")] })
  ],
  location
);
const files = Object.keys(graph.files).filter((file) => file.startsWith("gw/")).sort();
const thingOf = (file: string): string | undefined => (file.startsWith("gw/") ? "gw" : file.startsWith("lib/") ? "lib" : file.startsWith("portal/") ? "portal" : undefined);

describe("buildInsideModel", () => {
  const model = buildInsideModel({ thing: "gw", thingFolder: "gw", folder: "gw", files, graph, thingOf });

  it("makes cards of direct files and of small folders' files, passes folders without files through, and closes a large folder into a box", () => {
    expect(model.nodes.map((node) => [node.kind, node.id, node.name]).sort((a, b) => (a[1] < b[1] ? -1 : 1))).toEqual([
      ["file", "gw/Controllers/Pay.cs", "Pay.cs"],
      ["file", "gw/Settings.cs", "Settings.cs"],
      ["file", "gw/Web.config", "Web.config"],
      ["folder", "gw/big", "big"],
      ["file", "gw/deep/a/b/one.ts", "one.ts"],
      ["file", "gw/src/x/1.ts", "1.ts"],
      ["file", "gw/src/y/2.ts", "2.ts"]
    ]);
    const pay = model.nodes.find((node) => node.id === "gw/Controllers/Pay.cs");
    expect(pay?.kind === "file" && pay.sub).toBe("Controllers/Pay.cs");
    expect(pay?.kind === "file" && pay.rows).toEqual([{ name: "POST api/pay", kind: "route", slug: "symbol-post" }]);
    const big = model.nodes.find((node) => node.id === "gw/big");
    expect(big?.kind === "folder" && big.files).toEqual(bigFiles);
  });

  it("wires the inside: card to card on the provider's row, a box's edges gathered per neighbour, a file's edge to itself kept, edges within a box left out", () => {
    expect(model.edges.map((edge) => [edge.from, edge.to, edge.toSymbol, edge.count])).toEqual([
      ["gw/big", "gw/Settings.cs", undefined, 2],
      ["gw/Controllers/Pay.cs", "gw/Settings.cs", "symbol-settings", 1],
      ["gw/Settings.cs", "gw/Settings.cs", "symbol-settings", 1],
      ["gw/Settings.cs", "gw/Web.config", undefined, 1]
    ]);
    expect(model.edges[0].lines.map((line) => line.from)).toEqual(["gw/big/f1.ts", "gw/big/f2.ts"]);
  });

  it("pins the wall for what leaves and enters: per counterpart, the thing or elsewhere, with the row the edge lands on", () => {
    expect(model.walls.map((wall) => [wall.role, wall.counterpart, wall.count, wall.nodes])).toEqual([
      ["in", "elsewhere", 1, [{ id: "gw/Web.config", count: 1 }]],
      ["in", "portal", 1, [{ id: "gw/Controllers/Pay.cs", symbol: "symbol-post", count: 1 }]],
      ["out", "lib", 1, [{ id: "gw/Web.config", count: 1 }]]
    ]);
  });

  it("ranks providers left of their consumers", () => {
    expect(Object.fromEntries(model.rank)).toEqual({
      "gw/Web.config": 0,
      "gw/Settings.cs": 1,
      "gw/Controllers/Pay.cs": 2,
      "gw/deep/a/b/one.ts": 0,
      "gw/src/x/1.ts": 0,
      "gw/src/y/2.ts": 0,
      "gw/big": 2
    });
  });

  it("opens a folder inside the thing, whose wall names the thing's own files outside it", () => {
    const inner = buildInsideModel({ thing: "gw", thingFolder: "gw", folder: "gw/big", files, graph, thingOf });
    expect(inner.nodes.map((node) => node.id)).toEqual(bigFiles);
    expect(inner.edges.map((edge) => [edge.from, edge.to])).toEqual([["gw/big/f1.ts", "gw/big/f7.ts"], ["gw/big/f2.ts", "gw/big/f7.ts"]]);
    expect(inner.walls.map((wall) => [wall.role, wall.counterpart, wall.count])).toEqual([["out", "gw", 2]]);
    const deeper = buildInsideModel({ thing: "gw", thingFolder: "gw", folder: "gw/Controllers", files, graph, thingOf });
    expect(deeper.walls.map((wall) => [wall.role, wall.counterpart, wall.count])).toEqual([["in", "portal", 1], ["out", "gw", 1]]);
  });

  it("names a node's neighbours through the edges", () => {
    expect([...neighboursOf(model, "gw/Settings.cs")].sort()).toEqual(["gw/Controllers/Pay.cs", "gw/Settings.cs", "gw/Web.config", "gw/big"]);
  });
});
