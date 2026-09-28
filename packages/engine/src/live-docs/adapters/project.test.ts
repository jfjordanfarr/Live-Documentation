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

  it("publishes the project and links its project, package and assembly references", async () => {
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
      { specifier: "EntityFramework",                    symbols: [], kind: "import" },
      { specifier: "Microsoft.AspNet.WebApi.Core@5.3.0", symbols: [], kind: "import" },
      { specifier: "Newtonsoft.Json@13.0.3",             symbols: [], kind: "import" },
      { specifier: "System.Configuration",               symbols: [], kind: "import" },
      { specifier: "System.ServiceModel",                symbols: [], kind: "import" }
    ]);
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
