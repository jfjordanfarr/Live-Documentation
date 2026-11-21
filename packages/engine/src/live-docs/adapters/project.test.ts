import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "../coreTypes";
import { projectAdapter, projectKind } from "./project";

describe("projectAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "project-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes the project, links its project references, keeps the ones it cannot find by name, and lists package and assembly references", async () => {
    await fs.mkdir(path.join(workspaceRoot, "Gateway"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, "Contracts"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "Contracts", "Contracts.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>\n", "utf8");
    const projectPath = path.join(workspaceRoot, "Gateway", "Gateway.csproj");
    await fs.writeFile(projectPath, [
      "<Project Sdk=\"Microsoft.NET.Sdk\">",
      "  <PropertyGroup><TargetFramework>net48</TargetFramework></PropertyGroup>",
      "  <ItemGroup>",
      "    <Reference Include=\"System.Configuration\" />",
      "    <Reference Include=\"System.ServiceModel, Version=4.0.0.0, Culture=neutral\" />",
      "  </ItemGroup>",
      "  <ItemGroup>",
      "    <PackageReference Include=\"Microsoft.AspNet.WebApi.Core\" Version=\"5.3.0\" />",
      "    <PackageReference Include=\"Newtonsoft.Json\"><Version>13.0.3</Version></PackageReference>",
      "    <PackageReference Update=\"EntityFramework\" />",
      "  </ItemGroup>",
      "  <ItemGroup>",
      "    <ProjectReference Include=\"..\\Contracts\\Contracts.csproj\" />",
      "    <ProjectReference Include=\"../Missing/Missing.csproj\" />",
      "    <ProjectReference Include=\"..\\..\\Elsewhere\\Elsewhere.csproj\" />",
      "    <ProjectReference Include=\"../../Elsewhere/Elsewhere.csproj\" />",
      "  </ItemGroup>",
      "</Project>"
    ].join("\n"), "utf8");
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["Estate.Contracts", [{ liveDocPath: "d", sourcePath: "Contracts/Contracts.csproj", anchor: "symbol-estatecontracts", kind: "library" }]]
    ]);

    const result = await projectAdapter.analyze({ absolutePath: projectPath, workspaceRoot, fileIndex: new Set(["Contracts/Contracts.csproj", "Gateway/Gateway.csproj"]), symbolIndex });

    expect(result?.symbols).toEqual([{ name: "Gateway", kind: "library", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "Contracts/Contracts.csproj", resolvedPath: "Contracts/Contracts.csproj", symbols: ["Estate.Contracts"], kind: "import" },
      { specifier: "Elsewhere",                          symbols: [], kind: "import" },
      { specifier: "Missing",                            symbols: [], kind: "import" },
      { specifier: "EntityFramework",                    symbols: [], kind: "import" },
      { specifier: "Microsoft.AspNet.WebApi.Core@5.3.0", symbols: [], kind: "import" },
      { specifier: "Newtonsoft.Json@13.0.3",             symbols: [], kind: "import" },
      { specifier: "System.Configuration",               symbols: [], kind: "import" },
      { specifier: "System.ServiceModel",                symbols: [], kind: "import" }
    ]);
  });

  it("finds a project referenced in another case, as Windows does, links it in its own spelling, and keeps by name one of two that differ by case alone", async () => {
    await fs.mkdir(path.join(workspaceRoot, "Web"), { recursive: true });
    const projectPath = path.join(workspaceRoot, "Web", "Web.csproj");
    await fs.writeFile(projectPath, [
      "<Project>",
      "  <ItemGroup>",
      "    <ProjectReference Include=\"..\\mojoPortal.Data.pgSQL\\mojoPortal.Data.pgSQL.csproj\" />",
      "    <ProjectReference Include=\"..\\Twins\\Twins.csproj\" />",
      "  </ItemGroup>",
      "</Project>"
    ].join("\n"), "utf8");
    // The index stands for a Windows checkout; it is never asked of the disk, which on Linux tells case apart.
    const fileIndex = new Set(["Web/Web.csproj", "mojoPortal.Data.pgsql/mojoPortal.Data.pgSQL.csproj", "Twins/twins.csproj", "Twins/TWINS.csproj"]);

    const result = await projectAdapter.analyze({ absolutePath: projectPath, workspaceRoot, fileIndex });

    expect(result?.dependencies).toEqual([
      { specifier: "mojoPortal.Data.pgsql/mojoPortal.Data.pgSQL.csproj", resolvedPath: "mojoPortal.Data.pgsql/mojoPortal.Data.pgSQL.csproj", symbols: ["mojoPortal.Data.pgSQL"], kind: "import" },
      { specifier: "Twins", symbols: [], kind: "import" }
    ]);
  });

  // An XML comment is no element: MSBuild (`dotnet msbuild -getItem`) reads none of these, and until 2026-11-21 the
  // reader read every one of them as real (the review of the readers' joining).
  it("reads nothing a comment holds: no project, package or assembly reference, and no kind, name or output type", async () => {
    await fs.mkdir(path.join(workspaceRoot, "A"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, "B"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "B", "B.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>\n", "utf8");
    const projectPath = path.join(workspaceRoot, "A", "A.csproj");
    await fs.writeFile(projectPath, [
      "<Project Sdk=\"Microsoft.NET.Sdk\">",
      "  <!-- <PropertyGroup><OutputType>Exe</OutputType><AssemblyName>Old.Name</AssemblyName></PropertyGroup> -->",
      "  <ItemGroup>",
      "    <!-- <ProjectReference Include=\"../B/B.csproj\" /> -->",
      "    <!--",
      "    <PackageReference Include=\"Newtonsoft.Json\" Version=\"13.0.3\" />",
      "    <Reference Include=\"System.Web\" />",
      "    -->",
      "  </ItemGroup>",
      "</Project>"
    ].join("\n"), "utf8");
    const result = await projectAdapter.analyze({ absolutePath: projectPath, workspaceRoot, fileIndex: new Set(["A/A.csproj", "B/B.csproj"]) });
    expect(result?.symbols).toEqual([{ name: "A", kind: "library", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([]);
    expect(projectKind("<Project><!-- <PropertyGroup><ProjectTypeGuids>{349C5851-65DF-11DA-9384-00065B846F21}</ProjectTypeGuids></PropertyGroup> --></Project>")).toBe("library");
  });

  it("tells a web application and a program from a library, and takes the assembly name when given", async () => {
    expect(projectKind("<Project Sdk=\"Microsoft.NET.Sdk.Web\"></Project>")).toBe("web");
    expect(projectKind("<Project><PropertyGroup><ProjectTypeGuids>{349C5851-65DF-11DA-9384-00065B846F21};{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}</ProjectTypeGuids></PropertyGroup></Project>")).toBe("web");
    expect(projectKind("<Project Sdk=\"Microsoft.NET.Sdk\"><PropertyGroup><OutputType>Exe</OutputType></PropertyGroup></Project>")).toBe("program");
    expect(projectKind("<Project Sdk=\"Microsoft.NET.Sdk\"></Project>")).toBe("library");

    const projectPath = path.join(workspaceRoot, "Tool.csproj");
    await fs.writeFile(projectPath, "<Project Sdk=\"Microsoft.NET.Sdk\"><PropertyGroup><OutputType>WinExe</OutputType><AssemblyName>Estate.Tool</AssemblyName></PropertyGroup></Project>\n", "utf8");
    const result = await projectAdapter.analyze({ absolutePath: projectPath, workspaceRoot });
    expect(result?.symbols).toEqual([{ name: "Estate.Tool", kind: "program", location: { line: 1, character: 1 } }]);
  });
});
