import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { compareCSharp, compareDocumentation, DOCUMENTATION_CAUSES, documentationPairs, writesUndeclaredParameter, type CompilerRecord } from "./csharp-compare";

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

function folder(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), "csharp-compare-"));
  folders.push(root);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}

const SDK = "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>\n";

// A record in the compiler program's shape stands in for `dotnet`, so that the comparison is held without .NET.
describe("the C# comparison of a folder", () => {
  it("sets the adapter's edges beside the compiler's, and names an edge drawn on a namesake", async () => {
    const root = folder({
      "App/App.csproj": SDK,
      "App/A.cs": "namespace App { public class A { } }\n",
      "App/Other.cs": "namespace App.Other { public class A { } }\n",
      "App/Use.cs": "using App.Other; namespace App { public class Use { A a; } }\n"
    });
    const record: CompilerRecord = {
      tool: "stand-in", files: 3, names: 3, bound: 3,
      projects: [{ project: "App/App.csproj", readBy: "msbuild", references: [], xmlReferences: [] }],
      edges: [{ from: "App/Use.cs", to: "App/A.cs", type: ["A"], member: [] }],
      declared: { "App/A.cs": ["A"], "App/Other.cs": ["A"], "App/Use.cs": ["Use"] }
    };
    const report = await compareCSharp(root, record);
    expect(report.edges.compiler).toBe(1);
    expect(report.edges.compilerOnly.length + report.edges.both).toBe(1);
    // Whichever namesake the reader takes, an edge to the other is called a namesake, never an ordinary extra.
    expect(report.edges.adapterOnly.other).toEqual([]);
    expect(report.edges.adapterOnly.conditional).toEqual([]);
  });

  it("counts a reference under a condition the default configuration does not meet, and the edges that rest on it, apart", async () => {
    const root = folder({
      "App/App.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\"><ItemGroup><ProjectReference Include=\"../MySql/MySql.csproj\" Condition=\"'$(Configuration)'=='Debug - MySql'\" /></ItemGroup></Project>\n",
      "App/Use.cs": "using Data; namespace App { public class Use { Store s; } }\n",
      "MySql/MySql.csproj": SDK,
      "MySql/Store.cs": "namespace Data { public class Store { } }\n"
    });
    const record: CompilerRecord = {
      tool: "stand-in", files: 2, names: 2, bound: 1,
      projects: [
        { project: "App/App.csproj", readBy: "msbuild", references: [], xmlReferences: ["MySql/MySql.csproj"] },
        { project: "MySql/MySql.csproj", readBy: "msbuild", references: [], xmlReferences: [] }
      ],
      edges: [],
      declared: { "App/Use.cs": ["Use"], "MySql/Store.cs": ["Store"] }
    };
    const report = await compareCSharp(root, record);
    expect(report.conditional).toEqual(["App/App.csproj → MySql/MySql.csproj"]);
    expect(report.edges.adapterOnly).toEqual({ namesake: [], conditional: ["App/Use.cs → MySql/Store.cs"], other: [] });
  });
});

describe("the pairs a documentation reference makes", () => {
  const reference = (from: string, outcome: string, resolved: Array<{ kind: string; files: string[] }>) =>
    ({ from, line: 1, element: "see", written: "X", outcome, resolved: resolved.map((symbol) => ({ ...symbol, symbol: "X" })) });

  it("names a pair to every file declaring the symbol, never a namespace nor the file itself, and tells the pairs the code binds too", () => {
    const record: CompilerRecord = {
      tool: "stand-in", files: 4, names: 0, bound: 0, projects: [], declared: {},
      edges: [{ from: "A.cs", to: "B.cs", type: ["B"], member: [] }],
      crefs: [
        reference("A.cs", "resolved", [{ kind: "NamedType", files: ["B.cs"] }]),
        reference("A.cs", "resolved", [{ kind: "NamedType", files: ["C.cs", "C.Part.cs"] }]),
        reference("A.cs", "resolved", [{ kind: "Namespace", files: ["D.cs"] }]),
        reference("A.cs", "resolved", [{ kind: "Method", files: ["A.cs"] }]),
        reference("A.cs", "Ambiguous", [{ kind: "Method", files: ["E.cs"] }, { kind: "Method", files: ["F.cs"] }]),
        reference("A.cs", "unresolved", [])
      ]
    };
    expect(documentationPairs(record)).toEqual({
      references: 6,
      unresolved: 1,
      ambiguous:  1,
      unparsed:   0,
      pairs:      ["A.cs → B.cs", "A.cs → C.Part.cs", "A.cs → C.cs", "A.cs → E.cs", "A.cs → F.cs"],
      alsoCode:   ["A.cs → B.cs"],
      authorOnly: ["A.cs → C.Part.cs", "A.cs → C.cs", "A.cs → E.cs", "A.cs → F.cs"]
    });
  });

  it("sets each reference the reader links beside the compiler's, declaration by declaration, and names each they part on by its cause", () => {
    type Symbol = { kind: string; declarations: Array<{ file: string; line: number }>; holder?: Array<{ file: string; line: number }> };
    const at = (written: string, outcome: string, symbols: Symbol[], on = 2) =>
      ({ from: "A.cs", line: 1, on, element: "see", written, outcome, resolved: symbols.map((symbol) => ({ ...symbol, symbol: written, files: symbol.declarations.map((declaration) => declaration.file) })) });
    const named = (file: string, line: number, holder?: number): Symbol => ({ kind: holder === undefined ? "NamedType" : "Method", declarations: [{ file, line }], holder: holder === undefined ? [] : [{ file, line: holder }] });
    const record: CompilerRecord = {
      tool: "stand-in", files: 0, names: 0, bound: 0, projects: [], edges: [], declared: { "B.cs": ["Calc", "Pair"] },
      crefs: [
        at("Both", "resolved", [named("B.cs", 3)]),
        at("Here", "resolved", [named("A.cs", 9)]),
        at("Here", "resolved", [named("A.cs", 12)], 5),
        at("Calc.Mix(Calc[])", "resolved", [named("B.cs", 5, 3)]),
        at("Calc.Hid", "resolved", [named("B.cs", 7, 3)]),
        at("Calc.Lost", "resolved", [named("B.cs", 8, 3)]),
        at("Calc.Run", "Ambiguous", [named("B.cs", 9, 3), named("B.cs", 10, 3)]),
        at("Calc.Two", "Ambiguous", [named("B.cs", 11, 3), named("B.cs", 12, 3)]),
        at("Moved", "resolved", [named("B.cs", 13)]),
        at("Space", "resolved", [{ kind: "Namespace", declarations: [{ file: "B.cs", line: 1 }] }]),
        at("Calc.Mix(Pair{Calc})", "unresolved", []),
        at("Calc.Put(string)", "unresolved", []),
        at("Far", "unresolved", []),
        at("L::Calc", "unparsed", []),
        at("M::Calc", "unparsed", []),
        at("Unread", "resolved", [named("D.cs", 1)], 40)
      ]
    };
    const reader = [
      { from: "A.cs", on: 2, written: "Both", targets: [{ file: "B.cs", line: 3 }] },
      { from: "A.cs", on: 2, written: "Here", targets: [{ file: "A.cs", line: 9 }] },
      { from: "A.cs", on: 5, written: "Here", targets: [{ file: "A.cs", line: 9 }] },
      { from: "A.cs", on: 2, written: "Calc.Mix(Calc[])", targets: [{ file: "B.cs", line: 5 }, { file: "B.cs", line: 6 }] },
      { from: "A.cs", on: 2, written: "Calc.Hid", targets: [{ file: "B.cs", line: 3 }] },
      { from: "A.cs", on: 2, written: "Calc.Lost", targets: [] },
      { from: "A.cs", on: 2, written: "Calc.Run", targets: [{ file: "B.cs", line: 9 }, { file: "B.cs", line: 10 }] },
      { from: "A.cs", on: 2, written: "Calc.Two", targets: [{ file: "B.cs", line: 11 }] },
      { from: "A.cs", on: 2, written: "Moved", targets: [{ file: "F.cs", line: 1 }] },
      { from: "A.cs", on: 2, written: "Space", targets: [] },
      { from: "A.cs", on: 2, written: "Calc.Mix(Pair<Calc>)", targets: [{ file: "B.cs", line: 5 }] },
      { from: "A.cs", on: 2, written: "Calc.Put(string)", targets: [{ file: "H.cs", line: 1 }] },
      { from: "A.cs", on: 2, written: "Far", targets: [{ file: "I.cs", line: 1 }] },
      { from: "A.cs", on: 2, written: "L::Calc", targets: [{ file: "B.cs", line: 3 }] },
      { from: "A.cs", on: 2, written: "M::Calc", targets: [] },
      { from: "A.cs", on: 2, written: "Inactive", targets: [{ file: "K.cs", line: 1 }] }
    ];
    const relation = compareDocumentation(record, reader, (_from, to) => to === "I.cs");
    expect(relation.pairs).toEqual(["A.cs → B.cs", "A.cs → F.cs", "A.cs → H.cs", "A.cs → I.cs", "A.cs → K.cs"]);
    // Both, Here on line 2, Calc.Run (every candidate of an ambiguous one), Space (a namespace, linked to none) and M::Calc.
    expect(relation.agree).toBe(5);
    expect(relation.compared).toBe(17);
    expect(relation.byCause).toEqual({
      [DOCUMENTATION_CAUSES.elsewhere]:    ["A.cs:1 <see> Here: the compiler A.cs:12; the reader A.cs:9", "A.cs:1 <see> Moved: the compiler B.cs:13; the reader F.cs:1"],
      [DOCUMENTATION_CAUSES.more]:         ["A.cs:1 <see> Calc.Mix(Calc[]): the compiler B.cs:5; the reader B.cs:5, B.cs:6"],
      [DOCUMENTATION_CAUSES.holder]:       ["A.cs:1 <see> Calc.Hid: the compiler B.cs:7; the reader B.cs:3"],
      [DOCUMENTATION_CAUSES.unresolved]:   ["A.cs:1 <see> Calc.Lost: the compiler B.cs:8; the reader nothing"],
      [DOCUMENTATION_CAUSES.fewer]:        ["A.cs:1 <see> Calc.Two: the compiler B.cs:11, B.cs:12; the reader B.cs:11"],
      [DOCUMENTATION_CAUSES.compilerNone]: ["A.cs:1 <see> Calc.Mix(Pair{Calc}): the compiler nothing; the reader B.cs:5"],
      [DOCUMENTATION_CAUSES.framework]:    ["A.cs:1 <see> Calc.Put(string): the compiler nothing; the reader H.cs:1"],
      [DOCUMENTATION_CAUSES.transitive]:   ["A.cs:1 <see> Far: the compiler nothing; the reader I.cs:1"],
      [DOCUMENTATION_CAUSES.unparsed]:     ["A.cs:1 <see> L::Calc: the compiler cannot parse it; the reader B.cs:3"],
      [DOCUMENTATION_CAUSES.notRead]:      ["A.cs:1 <see> Unread"],
      [DOCUMENTATION_CAUSES.unwritten]:    ["A.cs:2 Inactive: the reader K.cs:1"]
    });
  });

  it("tells a parameter's type the compilation cannot bind without framework references from one the folder declares", () => {
    const declared = new Set(["Calc", "Pair"]);
    expect(writesUndeclaredParameter("Calc.Put(string)", declared)).toBe(true);
    expect(writesUndeclaredParameter("Calc.Put(System.IO.Stream, Calc)", declared)).toBe(true);
    expect(writesUndeclaredParameter("Calc.Mix(ref Lib.Pair{Lib.Calc}, Calc[])", declared)).toBe(false);
    expect(writesUndeclaredParameter("Calc.Mix(Calc,)", declared)).toBe(false);
    expect(writesUndeclaredParameter("Calc", declared)).toBe(false);
  });

  it("reads a record written before documentation references were kept as holding none", () => {
    const record: CompilerRecord = { tool: "stand-in", files: 0, names: 0, bound: 0, projects: [], declared: {}, edges: [] };
    expect(documentationPairs(record)).toEqual({ references: 0, unresolved: 0, ambiguous: 0, unparsed: 0, pairs: [], alsoCode: [], authorOnly: [] });
  });
});
