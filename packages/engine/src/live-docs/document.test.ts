import { describe, expect, it } from "vitest";

import {
  DEFAULT_AUTHORED_BLOCK,
  LiveDocSyntaxError,
  authoredBlockOf,
  parseLiveDoc,
  renderLiveDoc,
  type LiveDoc
} from "./document";

/** A doc that uses every production of the grammar once. */
const FULL: LiveDoc = {
  codePath: "src/widgets/widget.ts",
  layer: 4,
  archetype: "implementation",
  entries: [
    { reason: "program", symbol: { name: "main", link: "#symbol-main" } },
    { reason: "command", command: "build", declarer: { label: "package.json", link: "../../package.json.md" } },
    { reason: "module", declarer: { label: "src/widgets/package.json", link: "./package.json.md" } },
    { reason: "opening", symbol: { name: "GET api/widgets", link: "#symbol-get-apiwidgets" } },
    { reason: "tooling" },
    { reason: "declared" }
  ],
  generatedAt: "2026-09-27T12:00:00.000Z",
  authored: ["### Purpose", "Draws widgets.", "", "### Notes", "- Keep it small.", "- A line with `code` and a [link](../other.md)."].join("\n"),
  symbols: [
    {
      name: "Widget",
      slug: "symbol-widget",
      kind: "interface",
      flags: [],
      source: { path: "../../../../src/widgets/widget.ts", line: 3 },
      references: [
        { role: "Extends", types: [{ name: "Shape", link: "./shape.ts.md#symbol-shape" }] }
      ],
      sections: [
        { title: "Summary", body: ["A widget."] },
        { title: "Remarks", body: ["First paragraph.", "", "Second paragraph."] }
      ]
    },
    {
      name: "draw (function)",
      slug: "symbol-draw-function",
      kind: "function",
      flags: ["default", "type-only"],
      source: { path: "../../../../src/widgets/widget.ts", line: 10 },
      references: [
        { role: "Returns", types: [{ name: "Widget", link: "#symbol-widget", array: true }, { name: "Error" }] },
        { role: "Parameters", parameters: [
          { name: "items", types: [{ name: "Widget", link: "#symbol-widget", array: true }] },
          { name: "options", types: [{ name: "DrawOptions" }, { name: "Result", promise: true }] }
        ] },
        { role: "Implements", types: [{ name: "Drawable", link: "./drawable.ts.md#symbol-drawable" }] },
        { role: "Constraints", types: [{ name: "Number", link: "../stock/quantity.go.md#symbol-number" }] }
      ],
      sections: [
        { title: "Parameters", body: ["- `items`: the widgets", "- `options`: _Not documented_"] },
        { title: "Examples", body: ["Draw one:", "", "```ts", "#### not a heading", "draw([widget]);", "```"] },
        { title: "Links", body: ["- [docs](https://example.test)", "- `Shape` — the base"] }
      ]
    },
    { name: "SIZE", slug: "symbol-size", kind: "const", flags: [], references: [], sections: [] }
  ],
  dependencies: [
    { label: "shape.Shape", link: "./shape.ts.md#symbol-shape", qualifiers: [] },
    { label: "types.DrawOptions", link: "./types.ts.md#symbol-drawoptions", qualifiers: ["type-only"] },
    { label: "index.Widget", link: "./index.ts.md#symbol-widget", qualifiers: ["re-export", "type-only"] },
    { label: "node:path", qualifiers: [] },
    { label: "node:fs", symbols: ["Dirent"], qualifiers: ["type-only"] },
    { label: "vitest", symbols: ["describe", "expect", "it"], qualifiers: [] }
  ],
  citedBy: [
    { label: "README.md", link: "../../../../README.md" },
    { label: "docs/widgets.md", link: "../../../../docs/widgets.md" }
  ],
  reExports: [
    { name: "Circle", slug: "symbol-circle", from: { label: "circle", link: "./circle.ts.md#symbol-circle" }, flags: [] },
    { name: "Square", slug: "symbol-square", from: { label: "square", link: "./square.ts.md#symbol-square" }, flags: ["type-only"] },
    { name: "Vendor", slug: "symbol-vendor", flags: [] }
  ]
};

const EMPTY: LiveDoc = {
  codePath: "assets/logo.png",
  layer: 4,
  archetype: "asset",
  entries: [],
  authored: DEFAULT_AUTHORED_BLOCK,
  symbols: [],
  dependencies: []
};

describe("the Live Doc grammar", () => {
  it("renders a doc and reads it back unchanged", () => {
    const text = renderLiveDoc(FULL);
    expect(parseLiveDoc(text)).toEqual(FULL);
    expect(renderLiveDoc(parseLiveDoc(text))).toBe(text);
  });

  it("renders an empty doc with the placeholder lines and reads it back", () => {
    const text = renderLiveDoc(EMPTY);
    expect(text).toContain("_No public symbols detected_");
    expect(text).toContain("_No dependencies documented yet_");
    expect(text).not.toContain("Re-Exported");
    expect(text).not.toContain("Cited By");
    expect(parseLiveDoc(text)).toEqual(EMPTY);
  });

  it("writes the Cited By section after the Dependencies and before the Re-Exported Symbol Anchors, each present on its own", () => {
    const text = renderLiveDoc(FULL);
    const order = ["Public Symbols", "Dependencies", "Cited By", "Re-Exported Symbol Anchors"].map((name) => text.indexOf(`<!-- LIVE-DOC:BEGIN ${name} -->`));
    expect(order.every((at, index) => at > (order[index - 1] ?? -1))).toBe(true);
    expect(text).toContain([
      "<!-- LIVE-DOC:BEGIN Cited By -->",
      "### Cited By",
      "- [`README.md`](../../../../README.md)",
      "- [`docs/widgets.md`](../../../../docs/widgets.md)",
      "<!-- LIVE-DOC:END Cited By -->"
    ].join("\n"));
    const cited = { ...EMPTY, citedBy: FULL.citedBy };
    expect(parseLiveDoc(renderLiveDoc(cited))).toEqual(cited);
    const { reExports, ...withoutReExports } = FULL;
    void reExports;
    expect(parseLiveDoc(renderLiveDoc(withoutReExports))).toEqual(withoutReExports);
  });

  it("refuses a Cited By line it cannot read", () => {
    const text = renderLiveDoc({ ...EMPTY, citedBy: [{ label: "README.md", link: "../README.md" }] }).replace("- [`README.md`](../README.md)", "- README.md");
    expect(() => parseLiveDoc(text)).toThrow(/line 28: unexpected Cited By line/u);
  });

  it("writes exactly the shape the generator has always written", () => {
    expect(renderLiveDoc(EMPTY)).toBe([
      "# assets/logo.png",
      "",
      "## Metadata",
      "- Layer: 4",
      "- Archetype: asset",
      "- Code Path: assets/logo.png",
      "",
      "## Authored",
      "### Purpose",
      "_Pending authored purpose_",
      "",
      "### Notes",
      "_Pending notes_",
      "",
      "## Generated",
      "<!-- LIVE-DOC:BEGIN Public Symbols -->",
      "### Public Symbols",
      "_No public symbols detected_",
      "<!-- LIVE-DOC:END Public Symbols -->",
      "",
      "<!-- LIVE-DOC:BEGIN Dependencies -->",
      "### Dependencies",
      "_No dependencies documented yet_",
      "<!-- LIVE-DOC:END Dependencies -->",
      ""
    ].join("\n"));
  });

  it("writes the Entry lines between the Code Path and the Generated At, one per reason with its evidence", () => {
    const lines = renderLiveDoc(FULL).split("\n");
    const codePath = lines.indexOf("- Code Path: src/widgets/widget.ts");
    expect(lines.slice(codePath + 1, codePath + 8)).toEqual([
      "- Entry: program [`main`](#symbol-main)",
      "- Entry: command `build` of [`package.json`](../../package.json.md)",
      "- Entry: module of [`src/widgets/package.json`](./package.json.md)",
      "- Entry: opening [`GET api/widgets`](#symbol-get-apiwidgets)",
      "- Entry: tooling",
      "- Entry: declared",
      "- Generated At: 2026-09-27T12:00:00.000Z"
    ]);
  });

  it("reads a program entry with a bare symbol, or with none, back as written", () => {
    const forms: LiveDoc["entries"][] = [[{ reason: "program" }], [{ reason: "program", symbol: { name: "main" } }]];
    for (const entries of forms) {
      const doc: LiveDoc = { ...EMPTY, entries };
      const text = renderLiveDoc(doc);
      expect(text).toContain(entries[0].symbol ? "- Entry: program `main`\n" : "- Entry: program\n");
      expect(parseLiveDoc(text)).toEqual(doc);
    }
  });

  it("refuses an Entry line whose evidence does not fit its reason", () => {
    const text = renderLiveDoc(EMPTY);
    const withLine = (line: string): string => text.replace("- Code Path: assets/logo.png\n", `- Code Path: assets/logo.png\n${line}\n`);
    expect(() => parseLiveDoc(withLine("- Entry: opening `GET api/widgets`"))).toThrow(/line 7: unexpected evidence on the opening entry/u);
    expect(() => parseLiveDoc(withLine("- Entry: command `build`"))).toThrow(/unexpected evidence on the command entry/u);
    expect(() => parseLiveDoc(withLine("- Entry: module [`package.json`](../package.json.md)"))).toThrow(/unexpected evidence on the module entry/u);
    expect(() => parseLiveDoc(withLine("- Entry: tooling by hand"))).toThrow(/unexpected evidence on the tooling entry/u);
    expect(() => parseLiveDoc(withLine("- Entry: program main"))).toThrow(/unexpected evidence on the program entry/u);
    expect(() => parseLiveDoc(withLine("- Entry: whim"))).toThrow(LiveDocSyntaxError);
  });

  it("names the line of anything outside the grammar", () => {
    const lines = renderLiveDoc(FULL).split("\n");
    const detail = lines.findIndex((line) => line === "- Type: interface");
    lines.splice(detail + 1, 0, "- Colour: blue");
    expect(() => parseLiveDoc(lines.join("\n"))).toThrow(LiveDocSyntaxError);
    expect(() => parseLiveDoc(lines.join("\n"))).toThrow(`line ${detail + 2}: unexpected detail line "- Colour: blue"`);
  });

  it("refuses a dependency line it cannot read", () => {
    const text = renderLiveDoc(EMPTY).replace("_No dependencies documented yet_", "- something unlinked without code spans");
    expect(() => parseLiveDoc(text)).toThrow(/unexpected dependency line/u);
  });

  it("refuses a section that belongs to another symbol", () => {
    const text = renderLiveDoc(FULL).replace("##### `Widget` — Remarks", "##### `Other` — Remarks");
    expect(() => parseLiveDoc(text)).toThrow(/section of Other under Widget/u);
  });

  it("refuses a missing section marker", () => {
    const text = renderLiveDoc(EMPTY).replace("<!-- LIVE-DOC:END Dependencies -->\n", "");
    expect(() => parseLiveDoc(text)).toThrow(/the end of Dependencies never comes/u);
  });

  it("refuses text after the last section and text without a final newline", () => {
    expect(() => parseLiveDoc(`${renderLiveDoc(EMPTY)}stray\n`)).toThrow(/text after the last generated section/u);
    expect(() => parseLiveDoc(renderLiveDoc(EMPTY).trimEnd())).toThrow(/must end with a newline/u);
  });

  it("reads the authored block of any text that has one", () => {
    expect(authoredBlockOf(renderLiveDoc(FULL))).toBe(FULL.authored);
    expect(authoredBlockOf("# x\n\n## Authored\n\n### Purpose\nOld words\n\n\n## Generated\nwhatever")).toBe("### Purpose\nOld words");
    expect(authoredBlockOf("no sections here")).toBe(DEFAULT_AUTHORED_BLOCK);
    expect(authoredBlockOf(undefined)).toBe(DEFAULT_AUTHORED_BLOCK);
    expect(authoredBlockOf("## Authored\n\n\n## Generated\n")).toBe(DEFAULT_AUTHORED_BLOCK);
  });
});
