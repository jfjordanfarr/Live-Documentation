import { describe, expect, it } from "vitest";

import { decodeRows, decodeRowsChange, encodeRows, encodeRowsChange, newInterners } from "./codec";
import { applyRowsChange, deriveRowsChange, emptyFileRows, linksOf, rowsAgainstShape, rowsDifferences, rowsOfSummary, type FileRows, type Rows, type RowSymbol } from "./rows";
import { edgeKey, emptyChange, type ShapeChange } from "./shape";
import type { CommitSummary } from "./summary";

function symbol(slug: string, fields: Partial<RowSymbol> = {}): RowSymbol {
  return { name: slug, slug, kind: "function", flags: [], references: [], ...fields };
}

function file(fields: Partial<FileRows> = {}): FileRows {
  return { ...emptyFileRows(), ...fields };
}

/** The change of shape a step whose files stay where they are makes, with the given births, deaths and renames. */
function shapeChange(fields: Partial<ShapeChange> = {}): ShapeChange {
  return { ...emptyChange(), ...fields };
}

/** Derives the change, applies it, and holds the result to `after`; encodes and decodes the change on the way, as a reader would. */
function roundTrip(before: Rows, after: Rows, change: ShapeChange = shapeChange()): ReturnType<typeof deriveRowsChange> {
  const rows = deriveRowsChange(before, after, change);
  const interners = newInterners();
  const delta = encodeRowsChange(rows, interners);
  const read = decodeRowsChange(JSON.parse(JSON.stringify(delta)), { paths: interners.paths.values, archetypes: [], names: interners.names.values });
  expect(rowsDifferences(after, applyRowsChange(before, change, read))).toEqual([]);
  return rows;
}

describe("the rows' change", () => {
  it("names the symbols gone, born at their places, and changed, and nothing for a file that did not change", () => {
    const before: Rows = new Map([
      ["a.ts", file({ symbols: [symbol("one"), symbol("two"), symbol("three")] })],
      ["b.ts", file({ symbols: [symbol("same")] })]
    ]);
    const after: Rows = new Map([
      ["a.ts", file({ symbols: [symbol("zero"), symbol("one", { kind: "const" }), symbol("three"), symbol("four")] })],
      ["b.ts", file({ symbols: [symbol("same")] })]
    ]);
    const change = roundTrip(before, after);
    expect(change.symbolsGone).toEqual([["a.ts", "two"]]);
    expect(change.symbolsBorn.map(([path, index, row]) => [path, index, row.slug])).toEqual([["a.ts", 0, "zero"], ["a.ts", 3, "four"]]);
    expect(change.symbolsChanged.map(([path, slug, row]) => [path, slug, row.kind])).toEqual([["a.ts", "one", "const"]]);
    expect(change.symbolsOrdered).toEqual([]);
  });

  it("writes a file's order whole only when the symbols that stayed changed places", () => {
    const before: Rows = new Map([["a.ts", file({ symbols: [symbol("one"), symbol("two"), symbol("three")] })]]);
    const after: Rows = new Map([["a.ts", file({ symbols: [symbol("three"), symbol("new"), symbol("one"), symbol("two")] })]]);
    const change = roundTrip(before, after);
    expect(change.symbolsOrdered).toEqual([["a.ts", ["three", "new", "one", "two"]]]);
    expect(change.symbolsBorn.map(([, index, row]) => [index, row.slug])).toEqual([[1, "new"]]);
  });

  it("believes a symbol renamed only when one gone and one born of its kind have the same description, each the other's only match", () => {
    const before: Rows = new Map([["a.ts", file({ symbols: [symbol("old", { text: 7 }), symbol("plain"), symbol("twin1", { text: 9 }), symbol("twin2", { text: 9 })] })]]);
    const after: Rows = new Map([["a.ts", file({ symbols: [symbol("new", { text: 7 }), symbol("other"), symbol("twin3", { text: 9 })] })]]);
    const change = roundTrip(before, after);
    // The described symbol is renamed and keeps its place; the undescribed one and the ambiguous twins are a death and a birth.
    expect(change.symbolsChanged.map(([, slug, row]) => [slug, row.slug])).toEqual([["old", "new"]]);
    expect(change.symbolsGone.map(([, slug]) => slug).sort()).toEqual(["plain", "twin1", "twin2"]);
    expect(change.symbolsBorn.map(([, , row]) => row.slug)).toEqual(["other", "twin3"]);
    // Another kind with the same words is no rename.
    const otherKind: Rows = new Map([["a.ts", file({ symbols: [symbol("new", { text: 7, kind: "class" })] })]]);
    expect(roundTrip(new Map([["a.ts", file({ symbols: [symbol("old", { text: 7 })] })]]), otherKind).symbolsChanged).toEqual([]);
  });

  it("carries a renamed file's rows and every reference into it at no cost", () => {
    const before: Rows = new Map([
      ["old/w.ts", file({ symbols: [symbol("widget", { references: [{ role: "returns", type: "Gear", to: "old/w.ts", toSymbol: "gear" }] }), symbol("gear")] })],
      ["app.ts", file({ dependencies: [{ label: "old/w", kind: "import", to: "old/w.ts" }], symbols: [symbol("main", { references: [{ role: "parameter", parameter: "w", type: "Widget", to: "old/w.ts", toSymbol: "widget" }] })] })]
    ]);
    const after: Rows = new Map([
      ["new/w.ts", file({ symbols: [symbol("widget", { references: [{ role: "returns", type: "Gear", to: "new/w.ts", toSymbol: "gear" }] }), symbol("gear")] })],
      // Only where the line resolves to is renamed; its label, as the doc writes it, is the same at both commits here.
      ["app.ts", file({ dependencies: [{ label: "old/w", kind: "import", to: "new/w.ts" }], symbols: [symbol("main", { references: [{ role: "parameter", parameter: "w", type: "Widget", to: "new/w.ts", toSymbol: "widget" }] })] })]
    ]);
    const change = roundTrip(before, after, shapeChange({ renamed: [["old/w.ts", "new/w.ts"]] }));
    expect(change).toEqual({ ...deriveRowsChange(new Map(), new Map(), shapeChange()) });
  });

  it("gives a born file its rows and lets a dead file's go with it", () => {
    const before: Rows = new Map([["gone.ts", file({ symbols: [symbol("x")] })]]);
    const after: Rows = new Map([["born.ts", file({ symbols: [symbol("y")], entries: [{ reason: "declared" }], citedBy: ["docs/plan.md"], authored: 3 })]]);
    const change = roundTrip(before, after, shapeChange({ born: [["born.ts", { archetype: "implementation", symbols: 1, entry: true }]], dead: ["gone.ts"] }));
    expect(change.symbolsGone).toEqual([]);
    expect(change.symbolsBorn.map(([path, , row]) => [path, row.slug])).toEqual([["born.ts", "y"]]);
    expect(change.authored).toEqual([["born.ts", 3]]);
    expect(change.entryLines).toEqual([["born.ts", [{ reason: "declared" }]]]);
  });

  it("writes a file's lines and words whole where they changed, the unread and the absent kept apart", () => {
    const before: Rows = new Map([["a.ts", file({ dependencies: [{ label: "x", kind: "import" }], authored: "unread" })]]);
    const after: Rows = new Map([["a.ts", file({ dependencies: [{ label: "x", kind: "import" }, { label: "y", kind: "re-export", typeOnly: true }], reExports: [{ name: "Y", from: "y.ts" }], authored: "none" })]]);
    const change = roundTrip(before, after);
    // A line added is all the edit says: the line that stayed is not written again.
    expect(change.dependencyLines).toEqual([["a.ts", [], [[1, { label: "y", kind: "re-export", typeOnly: true }]]]]);
    expect(change.reExports).toEqual([["a.ts", [{ name: "Y", from: "y.ts" }]]]);
    expect(change.authored).toEqual([["a.ts", "none"]]);
  });

  it("edits a file's dependency lines by the lines removed and added, whatever moved", () => {
    const line = (label: string): { label: string; kind: "import" } => ({ label, kind: "import" });
    // Each case with the length of the longest run both lists share in order, which the edit does not write.
    const cases: Array<[string[], string[], number]> = [
      [["a", "b", "c", "d"], ["a", "c", "d"], 3],
      [["a", "b", "c"], ["x", "a", "b", "y", "c", "z"], 3],
      [["a", "b", "c", "d"], ["d", "c", "b", "a"], 1],
      [["a", "a", "b"], ["b", "a", "a", "a"], 2],
      [[], ["a", "b"], 0],
      [["a", "b"], [], 0]
    ];
    for (const [from, to, shared] of cases) {
      const change = roundTrip(new Map([["f.ts", file({ dependencies: from.map(line) })]]), new Map([["f.ts", file({ dependencies: to.map(line) })]]));
      const [, removed, added] = change.dependencyLines[0];
      expect([removed.length, added.length], `${from.join("")} -> ${to.join("")}`).toEqual([from.length - shared, to.length - shared]);
    }
    expect(roundTrip(new Map([["f.ts", file({ dependencies: ["a", "b", "c"].map(line) })]]), new Map([["f.ts", file({ dependencies: ["a", "c"].map(line) })]])).dependencyLines).toEqual([["f.ts", [1], []]]);
  });

  it("refuses a change that names a symbol the rows do not hold", () => {
    const rows: Rows = new Map([["a.ts", file()]]);
    const change = { ...deriveRowsChange(rows, rows, shapeChange()), symbolsGone: [["a.ts", "ghost"] as [string, string]] };
    expect(() => applyRowsChange(rows, shapeChange(), change)).toThrow("which its rows do not hold");
  });

  it("finds where two rows differ, so that a replay gone wrong is caught", () => {
    const expected: Rows = new Map([["a.ts", file({ symbols: [symbol("one"), symbol("two")] })]]);
    expect(rowsDifferences(expected, new Map([["a.ts", file({ symbols: [symbol("two"), symbol("one")] })]]))[0]).toContain("lists the symbols two, one");
    expect(rowsDifferences(expected, new Map([["a.ts", file({ symbols: [symbol("one"), symbol("two", { kind: "class" })] })]]))[0]).toContain("the symbol two of a.ts");
    expect(rowsDifferences(expected, new Map())[0]).toContain("the rows of a.ts are missing");
  });
});

describe("the rows as tuples", () => {
  it("reads back every field it writes, its defaults left out", () => {
    const rows: Rows = new Map([
      [
        "a.ts",
        file({
          authored: 4,
          entries: [{ reason: "command", command: "go", declarer: "package.json" }],
          symbols: [
            symbol("make", { name: "make (function)", flags: ["default"], text: 0, references: [{ role: "parameter", parameter: "p", type: "P", array: true, promise: true, to: "b.ts", toSymbol: "p" }, { role: "returns", type: "string" }] }),
            symbol("bare")
          ],
          dependencies: [{ label: "node:fs", kind: "import", symbols: ["readFile"] }, { label: "b", kind: "re-export", typeOnly: true, basis: "contract", to: "b.ts", toSymbol: "p" }],
          reExports: [{ name: "P", slug: "p", from: "b.ts", fromLabel: "b", flags: ["type-only"] }, { name: "Q" }],
          citedBy: ["docs/plan.md"]
        })
      ],
      ["b.ts", file({ authored: "unread" })],
      ["c.ts", file()]
    ]);
    const interners = newInterners();
    const tuples = encodeRows(rows, interners);
    expect(tuples.find((tuple) => interners.paths.values[tuple[0]] === "c.ts")).toHaveLength(1);
    expect(rowsDifferences(rows, decodeRows(tuples, { paths: interners.paths.values, archetypes: [], names: interners.names.values }))).toEqual([]);
  });
});

describe("the links between rows", () => {
  const rows: Rows = new Map([
    [
      "app.ts",
      file({
        dependencies: [{ label: "w", kind: "import", to: "w.ts" }, { label: "w.Widget", kind: "import", to: "w.ts", toSymbol: "widget" }, { label: "node:fs", kind: "import" }],
        symbols: [symbol("main", { references: [{ role: "parameter", type: "Widget", to: "w.ts", toSymbol: "widget" }, { role: "parameter", type: "Widget", to: "w.ts", toSymbol: "widget" }, { role: "returns", type: "Self", to: "app.ts", toSymbol: "self" }] })]
      })
    ],
    ["w.ts", file({ symbols: [symbol("widget")] })]
  ]);

  it("are each resolved line and reference, from the file or the symbol to the file or the symbol, counted", () => {
    expect(linksOf(rows)).toEqual([
      { from: "app.ts", to: "w.ts", kind: "import", count: 1 },
      { from: "app.ts", to: "w.ts", toSymbol: "widget", kind: "import", count: 1 },
      { from: "app.ts", fromSymbol: "main", to: "w.ts", toSymbol: "widget", kind: "parameter", count: 2 }
    ]);
    expect(linksOf(rows, new Set(["w.ts"]))).toEqual([]);
  });

  it("agree with a shape whose wire counts every one of them, and are caught where it does not", () => {
    const files = new Map([
      ["app.ts", { symbols: 1, entry: false }],
      ["w.ts", { symbols: 1, entry: false }]
    ]);
    expect(rowsAgainstShape(rows, { files, edges: new Map([[edgeKey("app.ts", "w.ts"), 4]]) })).toEqual([]);
    expect(rowsAgainstShape(rows, { files, edges: new Map([[edgeKey("app.ts", "w.ts"), 3]]) })[0]).toContain("counts 3 in the shape and 4 in the rows");
    expect(rowsAgainstShape(rows, { files: new Map([...files, ["x.ts", { symbols: 0, entry: false }]]), edges: new Map([[edgeKey("app.ts", "w.ts"), 4]]) })[0]).toContain("x.ts has a shape and no rows");
  });
});

describe("rowsOfSummary", () => {
  it("names each text by the id given its hash, and keeps the unread and the absent apart", () => {
    const summary: CommitSummary = {
      format: "live-docs-history-summary/3",
      lens: "l",
      commit: "c",
      docLinks: [],
      files: [
        { path: "a.ts", archetype: "implementation", entries: [], symbols: [{ name: "a", slug: "a", kind: "const", text: "h2" }], dependencies: [], authored: "h1" },
        { path: "b.ts", archetype: "implementation", entries: [], symbols: [], dependencies: [], unread: true },
        { path: "c.ts", archetype: "implementation", entries: [], symbols: [], dependencies: [] }
      ]
    };
    const ids = new Map([["h1", 0], ["h2", 1]]);
    const rows = rowsOfSummary(summary, (hash) => ids.get(hash)!);
    expect(rows.get("a.ts")).toMatchObject({ authored: 0, symbols: [{ slug: "a", text: 1, flags: [], references: [] }] });
    expect(rows.get("b.ts")?.authored).toBe("unread");
    expect(rows.get("c.ts")?.authored).toBe("none");
  });
});
