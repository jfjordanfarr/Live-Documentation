import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { compareCSharp, documentationPairs, type CompilerRecord } from "./csharp-compare";

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
      pairs:      ["A.cs → B.cs", "A.cs → C.Part.cs", "A.cs → C.cs", "A.cs → E.cs", "A.cs → F.cs"],
      alsoCode:   ["A.cs → B.cs"],
      authorOnly: ["A.cs → C.Part.cs", "A.cs → C.cs", "A.cs → E.cs", "A.cs → F.cs"]
    });
  });

  it("reads a record written before documentation references were kept as holding none", () => {
    const record: CompilerRecord = { tool: "stand-in", files: 0, names: 0, bound: 0, projects: [], declared: {}, edges: [] };
    expect(documentationPairs(record)).toEqual({ references: 0, unresolved: 0, ambiguous: 0, pairs: [], alsoCode: [], authorOnly: [] });
  });
});
