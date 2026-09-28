import { describe, expect, it } from "vitest";

import { DEFAULT_LEGEND, legendFor, lintBoard, parseBoard, renderBoard, type Board } from "./board";

const AUTHORED = "### Purpose\nThe estate.\n\n### Notes\nNone.";

/** A board with every section filled. */
function fullBoard(): Board {
  return {
    title: "Payments estate",
    layer: 3,
    authored: AUTHORED,
    things: [
      { name: "CLOUD", kind: "cloud", serves: [], holds: ["portal", "gateway"] },
      { name: "portal", kind: "web", from: "../portal", serves: [], holds: [] },
      { name: "gateway", kind: "web", from: "../gateway", serves: [], holds: [] },
      { name: "warehouse", kind: "database", serves: [{ name: "usp_PostPayment", kind: "procedure" }, { name: "dbo.Payments", kind: "table" }], holds: [] },
      { name: "nobody", serves: [], holds: [] }
    ],
    connections: [
      { from: "CLOUD", to: "warehouse", over: "site-to-site VPN" },
      { from: "gateway", to: "warehouse", door: "usp_PostPayment" },
      { from: "portal", to: "gateway", door: "POST api/payments", over: "HTTPS" }
    ],
    legend: [{ kind: "cloud", as: "blue" }, { kind: "web", as: "cube" }],
    layout: [{ name: "portal", x: 2, y: 1 }, { name: "gateway", x: 5.5, y: -1 }]
  };
}

const FULL_TEXT = [
  "# Payments estate",
  "",
  "## Metadata",
  "- Layer: 3",
  "",
  "## Authored",
  "### Purpose",
  "The estate.",
  "",
  "### Notes",
  "None.",
  "",
  "## Declared",
  "",
  "### Things",
  "",
  "#### `CLOUD`",
  "- Kind: cloud",
  "- Holds: `portal`, `gateway`",
  "",
  "#### `portal`",
  "- Kind: web",
  "- From: `../portal`",
  "",
  "#### `gateway`",
  "- Kind: web",
  "- From: `../gateway`",
  "",
  "#### `warehouse`",
  "- Kind: database",
  "- Serves: `usp_PostPayment` (procedure), `dbo.Payments` (table)",
  "",
  "#### `nobody`",
  "",
  "### Connections",
  "- `CLOUD` to `warehouse` over `site-to-site VPN`",
  "- `gateway` to `warehouse.usp_PostPayment`",
  "- `portal` to `gateway.POST api/payments` over `HTTPS`",
  "",
  "## Legend",
  "- `cloud` as blue",
  "- `web` as cube",
  "",
  "## Layout",
  "- `portal` at 2, 1",
  "- `gateway` at 5.5, -1",
  ""
].join("\n");

describe("renderBoard and parseBoard", () => {
  it("write and read back a full board, byte for byte", () => {
    expect(renderBoard(fullBoard())).toBe(FULL_TEXT);
    expect(parseBoard(FULL_TEXT)).toEqual(fullBoard());
    expect(renderBoard(parseBoard(FULL_TEXT))).toBe(FULL_TEXT);
  });

  it("say when there is nothing, and leave out the sections that are empty", () => {
    const board: Board = { title: "Empty", layer: 3, authored: AUTHORED, things: [], connections: [], legend: [], layout: [] };
    const text = renderBoard(board);
    expect(text).toContain("### Things\n_No things declared_\n\n### Connections\n_No connections declared_\n");
    expect(text).not.toContain("## Legend");
    expect(text).not.toContain("## Layout");
    expect(parseBoard(text)).toEqual(board);
  });

  it("accept a layout without a legend", () => {
    const board = { ...fullBoard(), legend: [] };
    expect(parseBoard(renderBoard(board))).toEqual(board);
  });

  it.each([
    ["a line the grammar does not know under a thing", "#### `a`\n- Colour: red\n", "unexpected line"],
    ["a thing named with a space", "#### `a b`\n", "a thing heading"],
    ["a things section with neither things nor the placeholder", "### Connections", "the Things section is empty"],
    ["a connection to a name with a dot in the door but a space in the thing", "- `a` to `b c.door`\n", "unexpected connection line"],
    ["a legend word with digits", "- `web` as cube2\n", "unexpected legend line"],
    ["a layout line without both numbers", "- `a` at 2\n", "unexpected layout line"],
    ["text after the layout", "- `a` at 2, 1\n\nmore\n", "text after the Layout section"]
  ])("refuse %s", (_name, fragment, detail) => {
    const head = "# T\n\n## Metadata\n- Layer: 3\n\n## Authored\n### Purpose\nX.\n\n## Declared\n\n### Things\n";
    let text: string;
    if (fragment.startsWith("####")) {
      text = `${head}\n${fragment}\n### Connections\n_No connections declared_\n`;
    } else if (fragment === "### Connections") {
      text = `${head}${fragment}\n_No connections declared_\n`;
    } else if (fragment.startsWith("- `a` to") || fragment.startsWith("- `a` at") || fragment.startsWith("- `web`")) {
      const section = fragment.startsWith("- `a` at") ? "## Layout" : fragment.startsWith("- `web`") ? "## Legend" : "### Connections";
      const things = "\n#### `a`\n\n#### `b`\n\n";
      text = section === "### Connections"
        ? `${head}${things}### Connections\n${fragment}`
        : `${head}${things}### Connections\n_No connections declared_\n\n${section}\n${fragment}`;
    } else {
      text = `${head}${fragment}`;
    }
    expect(() => parseBoard(text)).toThrow(detail);
  });
});

describe("lintBoard", () => {
  it("passes a well-formed board", () => {
    expect(lintBoard(fullBoard())).toEqual([]);
  });

  it("names every fault the grammar cannot refuse", () => {
    const board: Board = {
      title: "Faulty",
      layer: 3,
      authored: AUTHORED,
      things: [
        { name: "a", serves: [{ name: "x", kind: "widget" }, { name: "y", kind: "table" }, { name: "y", kind: "table" }], holds: ["b", "ghost"] },
        { name: "b", serves: [], holds: ["a"] },
        { name: "c", serves: [], holds: ["b"] },
        { name: "a", serves: [], holds: [] }
      ],
      connections: [{ from: "a", to: "a" }, { from: "a", to: "nowhere" }],
      legend: [{ kind: "a", as: "sphere" }],
      layout: [{ name: "a", x: 0, y: 0 }, { name: "a", x: 1, y: 1 }, { name: "missing", x: 0, y: 0 }]
    };
    expect(lintBoard(board).map((issue) => issue.message)).toEqual([
      "a is declared twice",
      "a serves x as widget, which is not an opening kind",
      "a serves y twice",
      "a names ghost, which is not declared",
      "b is held by both a and c",
      "a holds itself through b",
      "b holds itself through a",
      "a connects to itself",
      "a connection names nowhere, which is not declared",
      "the legend draws a as sphere, which is neither a shape nor a tint",
      "the layout places a twice",
      "the layout names missing, which is not declared"
    ]);
  });
});

describe("legendFor", () => {
  it("prefers the board's legend and falls back to the tool's", () => {
    const board = fullBoard();
    expect(legendFor(board, "web")).toEqual({ kind: "web", as: "cube" });
    expect(legendFor({ ...board, legend: [{ kind: "web", as: "sheet" }] }, "web")).toEqual({ kind: "web", as: "sheet" });
    expect(legendFor(board, "database")).toEqual(DEFAULT_LEGEND.find((entry) => entry.kind === "database"));
    expect(legendFor(board, "storefront")).toBeUndefined();
    expect(legendFor(board, undefined)).toBeUndefined();
  });
});
