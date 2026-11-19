import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHORED_BLOCK, type LiveDoc } from "../document";
import { deriveLiveDocGraph, type LiveDocGraph } from "../graph";
import { shapeOfSummary } from "./shape";
import { descriptionText, sectionsOfDescription, summarizeGraph, textHash } from "./summary";

const LOCATION = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

function doc(codePath: string, fields: Partial<LiveDoc> = {}): { docPath: string; doc: LiveDoc } {
  return {
    docPath: `.mdmd/layer-4/${codePath}.mdmd.md`,
    doc: { codePath, layer: 4, archetype: "implementation", entries: [], authored: DEFAULT_AUTHORED_BLOCK, symbols: [], dependencies: [], ...fields }
  };
}

/** A graph derived by the graph's own rule, so that its edges stand in the order the summary reads them in. */
function graphOf(...docs: Array<{ docPath: string; doc: LiveDoc }>): LiveDocGraph {
  return deriveLiveDocGraph(docs, LOCATION);
}

const twoFiles = graphOf(
  doc("src/a.ts", {
    entries: [{ reason: "declared" }, { reason: "command", command: "make-a", declarer: { label: "package.json", link: "../package.json.mdmd.md" } }],
    authored: "### Purpose\nThe first file.",
    citedBy: [{ label: "docs/plan.md", link: "../../../docs/plan.md" }],
    reExports: [
      { name: "Widget", slug: "widget", from: { label: "src/b.ts", link: "b.ts.mdmd.md" }, flags: ["type-only"] },
      { name: "gone", from: { label: "src/gone.ts", link: "gone.ts.mdmd.md" }, flags: [] }
    ],
    dependencies: [
      { label: "src/b.ts", link: "b.ts.mdmd.md", qualifiers: [] },
      { label: "src/b.ts.Widget", link: "b.ts.mdmd.md#widget", qualifiers: ["re-export", "type-only"] },
      { label: "node:fs", symbols: ["readFile"], qualifiers: [] }
    ],
    symbols: [
      {
        name: "make",
        slug: "make",
        kind: "function",
        flags: ["default"],
        references: [
          { role: "Parameters", parameters: [{ name: "parts", types: [{ name: "Widget", link: "b.ts.mdmd.md#widget", array: true }, { name: "string" }] }] },
          { role: "Returns", types: [{ name: "Widget", link: "b.ts.mdmd.md#widget", promise: true }, { name: "Own", link: "#own" }] }
        ],
        sections: [{ title: "Summary", body: ["Makes a widget."] }]
      },
      { name: "Own (interface)", slug: "own", kind: "interface", flags: [], references: [], sections: [] }
    ]
  }),
  doc("src/b.ts", { symbols: [{ name: "Widget (interface)", slug: "widget", kind: "interface", flags: [], references: [], sections: [] }] })
);

describe("summarizeGraph", () => {
  it("keeps each file's rows in the doc's order, each type reference and dependency line with what it resolved to", () => {
    const { summary } = summarizeGraph(twoFiles, "lens", "abc");
    expect(summary.format).toBe("live-docs-history-summary/4");
    expect(summary.files.map((file) => file.path)).toEqual(["src/a.ts", "src/b.ts"]);
    const [a, b] = summary.files;
    expect(a.entries).toEqual([{ reason: "declared" }, { reason: "command", command: "make-a", declarer: "package.json" }]);
    expect(a.citedBy).toEqual(["docs/plan.md"]);
    // A re-export names the file it comes from only when that file stood at the change.
    expect(a.reExports).toEqual([
      { name: "Widget", slug: "widget", from: "src/b.ts", fromLabel: "src/b.ts", flags: ["type-only"] },
      { name: "gone", fromLabel: "src/gone.ts" }
    ]);
    expect(a.symbols).toEqual([
      {
        name: "make",
        slug: "make",
        kind: "function",
        flags: ["default"],
        references: [
          { role: "parameter", parameter: "parts", type: "Widget", array: true, to: "src/b.ts", toSymbol: "widget" },
          { role: "parameter", parameter: "parts", type: "string" },
          { role: "returns", type: "Widget", promise: true, to: "src/b.ts", toSymbol: "widget" },
          { role: "returns", type: "Own", to: "src/a.ts", toSymbol: "own" }
        ],
        text: textHash(descriptionText([{ title: "Summary", body: ["Makes a widget."] }]))
      },
      { name: "Own (interface)", slug: "own", kind: "interface" }
    ]);
    expect(a.dependencies).toEqual([
      { label: "src/b.ts", kind: "import", to: "src/b.ts" },
      { label: "src/b.ts.Widget", kind: "re-export", typeOnly: true, to: "src/b.ts", toSymbol: "widget" },
      { label: "node:fs", kind: "import", symbols: ["readFile"] }
    ]);
    expect(b.reExports).toBeUndefined();
    expect(b).toMatchObject({ path: "src/b.ts", entries: [], dependencies: [], symbols: [{ name: "Widget (interface)", slug: "widget", kind: "interface" }] });
  });

  it("names each text by the hash of its content and hands the texts over, each once", () => {
    const { summary, texts } = summarizeGraph(twoFiles, "lens", "abc");
    const [a, b] = summary.files;
    expect(texts.get(a.authored!)).toBe("### Purpose\nThe first file.");
    expect(texts.get(b.authored!)).toBe(DEFAULT_AUTHORED_BLOCK);
    expect(sectionsOfDescription(texts.get(a.symbols[0].text!)!)).toEqual([{ title: "Summary", body: ["Makes a widget."] }]);
    expect(texts.size).toBe(3);
    for (const [hash, text] of texts) {
      expect(textHash(text)).toBe(hash);
    }
  });

  it("says unread where the doc that stood carried no authored block today's reader finds, and nothing where no doc stood", () => {
    const { summary, texts } = summarizeGraph(twoFiles, "lens", "abc", new Map(), new Map([[".mdmd/layer-4/src/a.ts.mdmd.md", "unread"]]));
    expect(summary.files[0]).toMatchObject({ unread: true });
    expect(summary.files[0].authored).toBeUndefined();
    expect(summary.files[1].authored).toBeUndefined();
    expect(summary.files[1].unread).toBeUndefined();
    // The placeholder the generator wrote for either is no text of that day's.
    expect([...texts.values()]).not.toContain(DEFAULT_AUTHORED_BLOCK);
  });

  it("gives the shape's counts from the rows: one per dependency line and per type reference that lands on another file", () => {
    const shape = shapeOfSummary(summarizeGraph(twoFiles, "lens", "abc").summary);
    expect(shape.files.get("src/a.ts")).toEqual({ archetype: "implementation", symbols: 2, entry: true });
    expect(shape.files.get("src/b.ts")).toEqual({ archetype: "implementation", symbols: 1, entry: false });
    // Two dependency lines and two references land on b; the reference to its own Own and the line to node:fs count for nothing.
    expect([...shape.edges]).toEqual([["src/a.ts\u0000src/b.ts", 4]]);
  });

  it("records the documents each file's authored words link to, each once, sorted, and only for files of the graph", () => {
    const { summary } = summarizeGraph(twoFiles, "lens", "abc", new Map([["src/b.ts", ["docs/z.md", "docs/a.md", "docs/z.md"]], ["gone.ts", ["docs/a.md"]]]));
    expect(summary.docLinks).toEqual([["src/b.ts", "docs/a.md"], ["src/b.ts", "docs/z.md"]]);
    expect([...shapeOfSummary(summary).docLinks].sort()).toEqual(["src/b.ts\u0000docs/a.md", "src/b.ts\u0000docs/z.md"]);
  });

  it("keeps a description's text apart from its symbol's name, so that a rename keeps it", () => {
    const sections = [{ title: "Summary", body: ["One line.", "", "Two."] }, { title: "Remarks", body: ["More."] }];
    expect(sectionsOfDescription(descriptionText(sections))).toEqual(sections);
    expect(descriptionText(sections)).not.toContain("make");
  });

  it("keeps a citing document by its path, as the doc reader reads it, whatever its name holds", () => {
    // The doc writes the path as its line's name and the link percent-encoded; the reader gives the path back.
    const graph = graphOf(doc("src/a.ts", { citedBy: [{ label: "docs/C#.md", link: "../../../docs/C%23.md" }, { label: "docs/50%41off.md", link: "../../../docs/50%2541off.md" }, { label: "notes/a`b.md", link: "../../../notes/a%60b.md" }] }));
    const { summary } = summarizeGraph(graph, "lens", "abc");
    expect(summary.files[0].citedBy).toEqual(["docs/C#.md", "docs/50%41off.md", "notes/a`b.md"]);
  });

  it("refuses a doc without an archetype, which only a generator bug writes", () => {
    const graph = graphOf(doc("a.ts", { archetype: undefined }));
    expect(() => summarizeGraph(graph, "lens", "abc")).toThrow("carries no archetype");
  });
});
