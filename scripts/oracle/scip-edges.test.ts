import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { edgesFromIndex, readProjects, type OracleProject, type ScipIndex } from "./scip-edges";

const DEFINITION = 1;
const REFERENCE  = 0;

function index(documents: ScipIndex["documents"], tool = "scip-dotnet"): ScipIndex {
  return { metadata: { tool_info: { name: tool, version: "test" } }, documents };
}

function occurrence(symbol: string, roles: number) {
  return { symbol, symbol_roles: roles };
}

const SINGLE_PROJECT: OracleProject[] = [{ name: "App", directory: ".", references: [] }];
const APP = { projects: SINGLE_PROJECT, projectFile: "App.csproj" };

describe("edgesFromIndex", () => {
  it("makes an edge from a reference to a definition in another file, carrying the symbol", () => {
    const result = edgesFromIndex(
      index([
        { relative_path: "A.cs", occurrences: [occurrence("scip-dotnet nuget . . App/A#", DEFINITION), occurrence("scip-dotnet nuget . . App/B#Run().", REFERENCE)] },
        { relative_path: "B.cs", occurrences: [occurrence("scip-dotnet nuget . . App/B#", DEFINITION), occurrence("scip-dotnet nuget . . App/B#Run().", DEFINITION)] }
      ]),
      APP
    );

    expect(result.edges).toEqual([{ from: "A.cs", to: "B.cs", symbols: ["App/B#Run()."] }]);
    expect(result.documents).toEqual(["A.cs", "B.cs"]);
    expect(result.outside).toEqual([]);
    expect(result.ambiguous).toEqual([]);
    expect(result.tool).toBe("scip-dotnet test");
    expect(result.projectFile).toBe("App.csproj");
  });

  it("ignores local symbols and references to symbols the same file defines", () => {
    const result = edgesFromIndex(
      index([
        { relative_path: "A.cs", occurrences: [occurrence("scip-dotnet nuget . . App/A#", DEFINITION), occurrence("scip-dotnet nuget . . App/A#", REFERENCE), occurrence("local 0", REFERENCE)] },
        { relative_path: "B.cs", occurrences: [occurrence("local 0", DEFINITION)] }
      ]),
      APP
    );

    expect(result.edges).toEqual([]);
  });

  it("shows a symbol by its descriptors alone, whichever indexer wrote it", () => {
    const java = "semanticdb maven maven/com.rosetta/java-rosetta-fixture 1.0.0 com/rosetta/types/Entry#";
    const rust = "rust-analyzer cargo rust-rosetta-fixture 0.1.0 models/Record#";
    const go   = "scip-go gomod rosetta . `rosetta/src/helpers`/Sum().";
    const result = edgesFromIndex(
      index([
        { relative_path: "use.rs", occurrences: [occurrence(java, REFERENCE), occurrence(rust, REFERENCE), occurrence(go, REFERENCE)] },
        { relative_path: "def.rs", occurrences: [occurrence(java, DEFINITION), occurrence(rust, DEFINITION), occurrence(go, DEFINITION)] }
      ], "rust-analyzer"),
      { projects: SINGLE_PROJECT }
    );

    expect(result.edges).toEqual([{ from: "use.rs", to: "def.rs", symbols: ["`rosetta/src/helpers`/Sum().", "com/rosetta/types/Entry#", "models/Record#"] }]);
    expect(result.tool).toBe("rust-analyzer test");
    expect(result.projectFile).toBeUndefined();
  });

  it("lists documents outside the fixture and takes no edges from or to them", () => {
    const helper   = "scip-go gomod rosetta . `rosetta/src/helpers`/Sum().";
    const testMain = "scip-go gomod rosetta . `rosetta/src/helpers.test`/tests.";
    const result = edgesFromIndex(
      index([
        { relative_path: "src/helpers/helpers.go",                      occurrences: [occurrence(helper, DEFINITION), occurrence(testMain, REFERENCE)] },
        { relative_path: "../../home/node/.cache/go-build/ab/abcd-d", occurrences: [occurrence(testMain, DEFINITION), occurrence(helper, REFERENCE)] }
      ], "scip-go"),
      { projects: SINGLE_PROJECT, projectFile: "go.mod" }
    );

    expect(result.documents).toEqual(["src/helpers/helpers.go"]);
    expect(result.outside).toEqual(["../../home/node/.cache/go-build/ab/abcd-d"]);
    expect(result.edges).toEqual([]);
  });

  it("links a partial class's code-behind to the peer that declares the member it uses", () => {
    const result = edgesFromIndex(
      index([
        { relative_path: "Default.aspx.cs",          occurrences: [occurrence("scip-dotnet nuget . . Pages/Default#", DEFINITION), occurrence("scip-dotnet nuget . . Pages/Default#Field.", REFERENCE)] },
        { relative_path: "Default.aspx.designer.cs", occurrences: [occurrence("scip-dotnet nuget . . Pages/Default#", DEFINITION), occurrence("scip-dotnet nuget . . Pages/Default#Field.", DEFINITION)] }
      ]),
      APP
    );

    expect(result.edges).toEqual([{ from: "Default.aspx.cs", to: "Default.aspx.designer.cs", symbols: ["Pages/Default#Field."] }]);
  });

  it("resolves a symbol two projects both define by what the referencing project can see", () => {
    const projects: OracleProject[] = [
      { name: "Contracts", directory: "Contracts", references: [] },
      { name: "Gateway",   directory: "Gateway",   references: ["Contracts"] },
      { name: "Portal",    directory: "Portal",    references: [] }
    ];
    const controller = "scip-dotnet nuget . . Controllers/PaymentsController#";
    const result = edgesFromIndex(
      index([
        { relative_path: "Portal/Controllers/PaymentsController.cs",  occurrences: [occurrence(controller, DEFINITION)] },
        { relative_path: "Portal/Startup.cs",                         occurrences: [occurrence(controller, REFERENCE)] },
        { relative_path: "Gateway/Controllers/PaymentsController.cs", occurrences: [occurrence(controller, DEFINITION)] }
      ]),
      { projects, projectFile: "Estate.sln" }
    );

    expect(result.edges).toEqual([{ from: "Portal/Startup.cs", to: "Portal/Controllers/PaymentsController.cs", symbols: ["Controllers/PaymentsController#"] }]);
    expect(result.ambiguous).toEqual([]);
  });

  it("sees definitions through transitive project references", () => {
    const projects: OracleProject[] = [
      { name: "Core",    directory: "Core",    references: [] },
      { name: "Middle",  directory: "Middle",  references: ["Core"] },
      { name: "Top",     directory: "Top",     references: ["Middle"] }
    ];
    const result = edgesFromIndex(
      index([
        { relative_path: "Core/Thing.cs", occurrences: [occurrence("scip-dotnet nuget . . Core/Thing#", DEFINITION)] },
        { relative_path: "Top/Use.cs",    occurrences: [occurrence("scip-dotnet nuget . . Core/Thing#", REFERENCE)] }
      ]),
      { projects, projectFile: "All.sln" }
    );

    expect(result.edges).toEqual([{ from: "Top/Use.cs", to: "Core/Thing.cs", symbols: ["Core/Thing#"] }]);
  });

  it("reports an ambiguity, and keeps every candidate, when two visible files define the same symbol", () => {
    const symbol = "scip-dotnet nuget . . Models/Item#";
    const result = edgesFromIndex(
      index([
        { relative_path: "A/Models/Item.cs", occurrences: [occurrence(symbol, DEFINITION)] },
        { relative_path: "B/Models/Item.cs", occurrences: [occurrence(symbol, DEFINITION)] },
        { relative_path: "Use.cs",           occurrences: [occurrence(symbol, REFERENCE)] }
      ]),
      APP
    );

    expect(result.edges.map((edge) => edge.to)).toEqual(["A/Models/Item.cs", "B/Models/Item.cs"]);
    expect(result.ambiguous).toEqual([{ from: "Use.cs", symbol: "Models/Item#", candidates: ["A/Models/Item.cs", "B/Models/Item.cs"] }]);
  });
});

describe("readProjects", () => {
  it("reads a solution's projects and their project references", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-sln-"));
    try {
      fs.mkdirSync(path.join(root, "Contracts"));
      fs.mkdirSync(path.join(root, "Gateway"));
      fs.writeFileSync(path.join(root, "Contracts", "Contracts.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>\n");
      fs.writeFileSync(path.join(root, "Gateway", "Gateway.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk\"><ItemGroup><ProjectReference Include=\"../Contracts/Contracts.csproj\" /></ItemGroup></Project>\n");
      fs.writeFileSync(
        path.join(root, "Estate.sln"),
        [
          "Microsoft Visual Studio Solution File, Format Version 12.00",
          "Project(\"{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}\") = \"Gateway\", \"Gateway\\Gateway.csproj\", \"{11111111-1111-1111-1111-111111111111}\"",
          "EndProject",
          "Project(\"{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}\") = \"Contracts\", \"Contracts\\Contracts.csproj\", \"{22222222-2222-2222-2222-222222222222}\"",
          "EndProject",
          ""
        ].join("\n")
      );

      expect(readProjects(path.join(root, "Estate.sln"))).toEqual([
        { name: "Contracts", directory: "Contracts", references: [] },
        { name: "Gateway",   directory: "Gateway",   references: ["Contracts"] }
      ]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("treats a lone project file as one project at the root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-csproj-"));
    try {
      fs.writeFileSync(path.join(root, "WebForms.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>\n");
      expect(readProjects(path.join(root, "WebForms.csproj"))).toEqual([{ name: "WebForms", directory: ".", references: [] }]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
