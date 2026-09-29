import { describe, expect, it } from "vitest";

import type { Board } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import { parseLiveDoc, renderLiveDoc, type LiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { buildWorldModel, regionsOf } from "./model";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

const graph = deriveLiveDocGraph(
  [
    doc("portal/p.js", { dependencies: [{ label: "g.POST api/pay", link: "../gateway/g.cs.md#symbol-post-apipay", qualifiers: ["contract"] }] }),
    doc("portal/portal.csproj", { symbols: [{ name: "Portal", slug: "symbol-portal", kind: "web", flags: [], references: [], sections: [] }], dependencies: [{ label: "Newtonsoft.Json@13.0.3", symbols: [], qualifiers: [] }, { label: "System.Web", symbols: [], qualifiers: [] }] }),
    doc("gateway/g.cs", { symbols: [{ name: "POST api/pay", slug: "symbol-post-apipay", kind: "route", flags: [], references: [], sections: [] }], dependencies: [{ label: "c", link: "../contracts/c.cs.md", qualifiers: [] }] }),
    doc("gateway/gateway.csproj", { symbols: [{ name: "Gateway", slug: "symbol-gateway", kind: "web", flags: [], references: [], sections: [] }], dependencies: [{ label: "Newtonsoft.Json@13.0.3", symbols: [], qualifiers: [] }] }),
    doc("contracts/c.cs", { symbols: [{ name: "IPay", slug: "symbol-ipay", kind: "interface", flags: [], references: [], sections: [] }] })
  ],
  location
);

const board: Board = {
  title: "Test estate",
  layer: 3,
  authored: "### Purpose\nX.",
  things: [
    { name: "CLOUD", kind: "cloud", serves: [], holds: ["portal", "gateway", "INNER"] },
    { name: "INNER", kind: "office", serves: [], holds: ["contracts"] },
    { name: "ON-PREM", kind: "on-prem", serves: [], holds: ["warehouse"] },
    { name: "portal", kind: "web", from: "portal", serves: [], holds: [] },
    { name: "gateway", kind: "web", from: "gateway", serves: [], holds: [] },
    { name: "contracts", kind: "library", from: "contracts", serves: [], holds: [] },
    { name: "warehouse", kind: "database", serves: [{ name: "usp_Post", kind: "procedure" }], holds: [] },
    { name: "someone", kind: "person", serves: [], holds: [] }
  ],
  connections: [
    { from: "CLOUD", to: "ON-PREM", over: "VPN" },
    { from: "gateway", to: "warehouse", door: "usp_Post" },
    { from: "someone", to: "CLOUD" }
  ],
  legend: [{ kind: "office", as: "violet" }],
  layout: [{ name: "portal", x: 1, y: 1 }, { name: "CLOUD", x: 0, y: 0 }]
};

describe("buildWorldModel", () => {
  const model = buildWorldModel(board, deriveBoardGraph(board, graph, "board.md"), graph);

  it("makes regions of the things that hold things, nested, with their pieces at every depth", () => {
    expect(model.regions.map((region) => [region.name, region.tint, region.parent, region.depth, region.pieces])).toEqual([
      ["CLOUD", "blue", undefined, 0, ["portal", "gateway", "contracts"]],
      ["INNER", "violet", "CLOUD", 1, ["contracts"]],
      ["ON-PREM", "orange", undefined, 0, ["warehouse"]]
    ]);
  });

  it("makes pieces of the rest, shaped by the legend, counted from their docs", () => {
    expect(model.pieces.map((piece) => [piece.name, piece.shape, piece.region, piece.files.length, piece.symbols, piece.imagined])).toEqual([
      ["portal", "cube", "CLOUD", 2, 1, false],
      ["gateway", "cube", "CLOUD", 2, 2, false],
      ["contracts", "tile", "INNER", 1, 1, false],
      ["warehouse", "drum", "ON-PREM", 0, 0, true],
      ["someone", "figure", undefined, 0, 0, true]
    ]);
    expect(model.pieces.find((piece) => piece.name === "gateway")?.doors).toEqual([{ name: "POST api/pay", kind: "route", file: "gateway/g.cs" }]);
    expect(model.pieces.find((piece) => piece.name === "contracts")?.files).toEqual(["contracts/c.cs"]);
    expect(model.pieces.find((piece) => piece.name === "portal")?.standsOn.map((item) => item.label)).toEqual(["Newtonsoft.Json@13.0.3", "System.Web"]);
  });

  it("makes roads in the air of calls and on the board of what stands on what, and crossings of declared connections between regions", () => {
    expect(model.roads.map((road) => [road.from, road.to, road.kind, road.door?.name, road.basis, road.count])).toEqual([
      ["gateway", "contracts", "stands", undefined, "source", 1],
      ["gateway", "warehouse", "call", "usp_Post", "declared", 1],
      ["portal", "gateway", "call", "POST api/pay", "contract", 1]
    ]);
    expect(model.crossings).toEqual([{ id: "CLOUD>ON-PREM", from: "CLOUD", to: "ON-PREM", over: "VPN" }]);
    expect(model.issues).toEqual(["someone to CLOUD joins a thing and a region, which is not drawn yet"]);
  });

  it("makes a token of what two or more pieces stand on", () => {
    expect(model.tokens).toEqual([{ key: "Newtonsoft.Json@13.0.3", label: "Newtonsoft.Json@13.0.3", kind: "package", users: ["portal", "gateway"] }]);
  });

  it("keeps the layout's positions for pieces only", () => {
    expect([...model.positions.entries()]).toEqual([["portal", [1, 1]]]);
  });

  it("lists a piece's regions nearest first", () => {
    expect(regionsOf(model, "contracts").map((region) => region.name)).toEqual(["INNER", "CLOUD"]);
    expect(regionsOf(model, "someone")).toEqual([]);
  });
});
