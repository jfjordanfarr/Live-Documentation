import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { analyzeWithLanguageAdapters } from "./index";

describe("solutionAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "solution-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("links a solution to the projects it names, in any case as Windows reads them, and keeps by name those it cannot find", async () => {
    const solutionPath = path.join(workspaceRoot, "Shop.sln");
    await fs.writeFile(solutionPath, [
      "Microsoft Visual Studio Solution File, Format Version 12.00",
      "# Visual Studio Version 17",
      "Project(\"{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}\") = \"Shop.Web\", \"Shop.Web\\Shop.Web.csproj\", \"{8E511D65-4779-4689-82D4-811D3FE6866E}\"",
      "EndProject",
      "Project(\"{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}\") = \"Shop.Data.pgSQL\", \"Shop.Data.pgSQL\\Shop.Data.pgSQL.csproj\", \"{B528429F-7155-496A-86B3-8B23219C10D4}\"",
      "EndProject",
      "Project(\"{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}\") = \"Shop.Net\", \"Shop.Net\\Shop.Net.csproj\", \"{0F1A2B3C-0000-0000-0000-000000000001}\"",
      "EndProject",
      "Project(\"{2150E333-8FDC-42A3-9474-1A3956D46DE8}\") = \"Solution Items\", \"Solution Items\", \"{EA9DE58E-4583-43D4-8C9E-43D433A27729}\"",
      "\tProjectSection(SolutionItems) = preProject",
      "\t\tDirectory.Build.props = Directory.Build.props",
      "\tEndProjectSection",
      "EndProject",
      "Global",
      "EndGlobal"
    ].join("\r\n"), "utf8");
    // The index stands for a Windows checkout: these paths are never asked of the disk, which on Linux tells case apart.
    const fileIndex = new Set(["Shop.sln", "Shop.Web/Shop.Web.csproj", "Shop.Data.pgsql/Shop.Data.pgSQL.csproj", "Directory.Build.props"]);

    const result = await analyzeWithLanguageAdapters({ absolutePath: solutionPath, workspaceRoot, fileIndex });

    expect(result).toEqual({
      symbols: [],
      dependencies: [
        { specifier: "Shop.Data.pgsql/Shop.Data.pgSQL.csproj", resolvedPath: "Shop.Data.pgsql/Shop.Data.pgSQL.csproj", symbols: ["Shop.Data.pgSQL"], kind: "import" },
        { specifier: "Shop.Net", symbols: [], kind: "import" },
        { specifier: "Shop.Web/Shop.Web.csproj", resolvedPath: "Shop.Web/Shop.Web.csproj", symbols: ["Shop.Web"], kind: "import" }
      ]
    });
  });

  it("reads the XML solution format", async () => {
    const solutionPath = path.join(workspaceRoot, "build", "Shop.slnx");
    await fs.mkdir(path.dirname(solutionPath), { recursive: true });
    await fs.writeFile(solutionPath, [
      "<Solution>",
      "  <Folder Name=\"/src/\">",
      "    <Project Path=\"../src/Shop.Web/Shop.Web.csproj\" Type=\"Classic C#\" />",
      "  </Folder>",
      "  <Project Path=\"../tests/Shop.Tests/Shop.Tests.csproj\" />",
      "</Solution>"
    ].join("\n"), "utf8");
    const fileIndex = new Set(["build/Shop.slnx", "src/Shop.Web/Shop.Web.csproj", "tests/Shop.Tests/Shop.Tests.csproj"]);

    const result = await analyzeWithLanguageAdapters({ absolutePath: solutionPath, workspaceRoot, fileIndex });

    expect(result?.dependencies.map((entry) => entry.resolvedPath)).toEqual(["src/Shop.Web/Shop.Web.csproj", "tests/Shop.Tests/Shop.Tests.csproj"]);
  });

  // `dotnet sln Shop.slnx list` names no project a comment holds (2026-11-21).
  it("names no project an XML comment holds", async () => {
    const solutionPath = path.join(workspaceRoot, "Shop.slnx");
    await fs.writeFile(solutionPath, ["<Solution>", "  <Project Path=\"Shop.Web/Shop.Web.csproj\" />", "  <!-- <Project Path=\"Shop.Old/Shop.Old.csproj\" /> -->", "</Solution>"].join("\n"), "utf8");
    const fileIndex = new Set(["Shop.slnx", "Shop.Web/Shop.Web.csproj", "Shop.Old/Shop.Old.csproj"]);
    const result = await analyzeWithLanguageAdapters({ absolutePath: solutionPath, workspaceRoot, fileIndex });
    expect(result?.dependencies.map((entry) => entry.specifier)).toEqual(["Shop.Web/Shop.Web.csproj"]);
  });
});
