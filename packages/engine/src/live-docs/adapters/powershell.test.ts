import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { analyzePowerShellSource, powershellAdapter } from "./powershell";
import { readTree, type SyntaxNode } from "./treeSitter";

const repoRoot = path.resolve(__dirname, "../../../../..");
const fixtureRoot = path.join(repoRoot, "tests", "integration", "fixtures", "powershell-compendium");

let workspaceRoot: string;

beforeEach(async () => {
  workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "powershell-adapter-"));
  await fs.cp(fixtureRoot, path.join(workspaceRoot, "powershell-compendium"), { recursive: true });
});

afterEach(async () => {
  await fs.rm(workspaceRoot, { recursive: true, force: true });
});

/** Writes files into the workspace, by relative path. */
async function write(files: Record<string, string>): Promise<void> {
  for (const [relative, content] of Object.entries(files)) {
    const absolute = path.join(workspaceRoot, relative);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, content, "utf8");
  }
}

/** The workspace's files, workspace-relative, as the generator indexes them. */
async function fileIndex(): Promise<Set<string>> {
  const entries = await fs.readdir(workspaceRoot, { recursive: true, withFileTypes: true });
  return new Set(entries.filter((entry) => entry.isFile()).map((entry) => path.relative(workspaceRoot, path.join(entry.parentPath, entry.name)).split(path.sep).join("/")));
}

/** Analyzes text as the file at a relative path of the workspace. */
async function analyze(relative: string, content: string) {
  return analyzePowerShellSource({ content, absolutePath: path.join(workspaceRoot, relative), workspaceRoot, fileIndex: await fileIndex() });
}

/** Analyzes a file of the workspace through the adapter, as the generator does. */
async function analyzeFile(relative: string) {
  return powershellAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot, fileIndex: await fileIndex() });
}

async function names(content: string, relative = "module.psm1"): Promise<string[]> {
  return (await analyze(relative, content)).symbols.map((symbol) => symbol.name);
}

async function dependencies(content: string, relative = "script.ps1"): Promise<Array<{ specifier: string; resolvedPath?: string }>> {
  return (await analyze(relative, content)).dependencies.map(({ specifier, resolvedPath }) => (resolvedPath ? { specifier, resolvedPath } : { specifier }));
}

describe("powershellAdapter over the compendium", () => {
  it("extracts public functions and dependency graph data from scripts", async () => {
    const analysis = await analyzeFile("powershell-compendium/scripts/deploy.ps1");
    expect(analysis?.symbols.map((symbol) => symbol.name)).toEqual(["Invoke-Deployment"]);
    expect(analysis?.symbols[0].location).toEqual({ line: 12, character: 1 });
    expect(analysis?.dependencies).toEqual([
      { specifier: "MyCompany.Inventory", resolvedPath: undefined, symbols: [], kind: "import" },
      { specifier: "Microsoft.PowerShell.Utility", resolvedPath: undefined, symbols: [], kind: "import" },
      { specifier: "Microsoft.PowerShell.Management", resolvedPath: undefined, symbols: [], kind: "import" },
      { specifier: "powershell-compendium/common/logging.ps1", resolvedPath: "powershell-compendium/common/logging.ps1", symbols: ["Write-DeploymentLog"], kind: "import" }
    ]);
  });

  it("honors Export-ModuleMember filters when reporting module exports", async () => {
    const analysis = await analyzeFile("powershell-compendium/modules/Inventory.psm1");
    expect(analysis?.symbols.map((symbol) => symbol.name)).toEqual(["Get-InventorySnapshot"]);
  });

  it("carries comment-based help, each parameter under the spelling the function declares", async () => {
    const analysis = await analyzeFile("powershell-compendium/workspace/scripts/deploy.ps1");
    expect(analysis?.symbols[0].documentation).toEqual({
      source: "comment-help",
      summary: "Deploys compiled artifacts to the requested region.",
      remarks: "Wraps shared logging and inventory refresh helpers so deployments stay observable.",
      parameters: [{ name: "Region", description: "The geographic region to target during deployment operations." }]
    });
    expect(analysis?.dependencies.find((dependency) => dependency.specifier.endsWith("Inventory.psm1"))).toEqual({
      specifier: "powershell-compendium/workspace/scripts/modules/Inventory.psm1",
      resolvedPath: "powershell-compendium/workspace/scripts/modules/Inventory.psm1",
      symbols: ["Get-InventorySnapshot"],
      kind: "import"
    });
  });

  it("reports a script that runs anything as the program entry, even one with nothing else to report, and no module", async () => {
    expect((await analyzeFile("powershell-compendium/scripts/deploy.ps1"))?.program).toEqual({});

    await write({ "bare.ps1": "Write-Output 'hello'\n" });
    expect(await analyzeFile("bare.ps1")).toStrictEqual({ symbols: [], dependencies: [], program: {} });

    expect(await analyzeFile("powershell-compendium/modules/Inventory.psm1")).not.toHaveProperty("program");
  });

  it("reads a data file's table and finds nothing a manifest would name", async () => {
    expect(await analyzeFile("powershell-compendium/config/settings.psd1")).toStrictEqual({ symbols: [], dependencies: [] });
  });

  it("reads a file by its byte order mark, as PowerShell does", async () => {
    const text = "\ufeffExport-ModuleMember -Function Get-Wide\nfunction Get-Wide { }\nfunction Get-Hidden { }\n";
    const littleEndian = Buffer.from(text, "utf16le");
    const bigEndian    = Buffer.from(littleEndian).swap16();
    await fs.writeFile(path.join(workspaceRoot, "le.psm1"), littleEndian);
    await fs.writeFile(path.join(workspaceRoot, "be.psm1"), bigEndian);
    await fs.writeFile(path.join(workspaceRoot, "bom.psm1"), Buffer.from(text, "utf8"));
    for (const file of ["le.psm1", "be.psm1", "bom.psm1"]) {
      expect((await analyzeFile(file))?.symbols.map((symbol) => [symbol.name, symbol.location]), file).toEqual([["Get-Wide", { line: 2, character: 1 }]]);
    }
  });
});

describe("symbols", () => {
  it("lists functions, filters and workflows, nested ones included, under the name as written, at the keyword", async () => {
    const analysis = await analyze("module.psm1", [
      "function global:Get-Thing { 'x' }",
      "filter Select-Odd { if ($_ % 2) { $_ } }",
      "workflow Invoke-Flow { 'w' }",
      "FUNCTION script:Get-Outer {",
      "    function Get-Inner { 1 }",
      "}"
    ].join("\n"));
    expect(analysis.symbols.map((symbol) => [symbol.name, symbol.kind, symbol.location])).toEqual([
      ["global:Get-Thing", "function", { line: 1, character: 1 }],
      ["Select-Odd", "function", { line: 2, character: 1 }],
      ["Invoke-Flow", "function", { line: 3, character: 1 }],
      ["script:Get-Outer", "function", { line: 4, character: 1 }],
      ["Get-Inner", "function", { line: 5, character: 5 }]
    ]);
  });

  it("lists classes and enums at their keyword, in document order with the functions, but not a class's constructors and methods", async () => {
    const analysis = await analyze("module.psm1", [
      "enum Tier { Web; Worker }",
      "function Get-First { }",
      "class Target {",
      "    [string]$Name",
      "    Target([string]$name) { $this.Name = $name }",
      "    [string] ToString() { return $this.Name }",
      "}",
      "  class Second : Target { }"
    ].join("\n"));
    expect(analysis.symbols.map((symbol) => [symbol.name, symbol.kind, symbol.location])).toEqual([
      ["Tier", "enum", { line: 1, character: 1 }],
      ["Get-First", "function", { line: 2, character: 1 }],
      ["Target", "class", { line: 3, character: 1 }],
      ["Second", "class", { line: 8, character: 3 }]
    ]);
  });

  it("does not take text inside strings for functions", async () => {
    expect(await names([
      "$banner = @\"",
      "# function Fake-Banner { }",
      "\"@",
      "$quoted = 'function Fake-Quoted { }'",
      "$marker = \"<#PSScriptInfo\"",
      "function Get-Real { }",
      "<# .SYNOPSIS closes nothing the string opened #>",
      "function Get-After { }"
    ].join("\n"))).toEqual(["Get-Real", "Get-After"]);
  });
});

describe("comment-based help", () => {
  const help = async (content: string) => (await analyze("help.ps1", content)).symbols.map((symbol) => [symbol.name, symbol.documentation?.summary ?? null]);

  it("is found before the keyword with at most one blank line between, then at the start of the body, then at its end", async () => {
    expect(await help([
      "<#", ".SYNOPSIS", "One blank line before.", "#>", "", "function Get-A { }",
      "<#", ".SYNOPSIS", "Two blank lines before.", "#>", "", "", "function Get-B { }",
      "function Get-C {", "    # plain", "", "    <#", "    .SYNOPSIS", "    Second block of the body.", "    #>", "    param($X)", "}",
      "function Get-D {", "    'body'", "    # .SYNOPSIS", "    # Line comments at the end.", "", "}",
      "function Get-E {", "    'body'", "    # .SYNOPSIS", "    # Not the last block.", "", "    # plain", "}"
    ].join("\n"))).toEqual([
      ["Get-A", "One blank line before."],
      ["Get-B", null],
      ["Get-C", "Second block of the body."],
      ["Get-D", "Line comments at the end."],
      ["Get-E", null]
    ]);
  });

  it("is not help when a line outside a section is text, a keyword is unknown, or a keyword takes the wrong argument", async () => {
    expect(await help([
      "<#", "Free text first.", ".SYNOPSIS", "x", "#>", "function Get-A { }",
      "<#", ".SYNOPSIS", "x", ".FOOBAR", "#>", "function Get-B { }",
      "<#", ".SYNOPSIS Same line.", "#>", "function Get-C { }",
      "<#", ".DESCRIPTION", ".NET is a keyword here", "#>", "function Get-D { }",
      "#requires -Version 5", "function Get-E { }",
      "<#", ".SYNOPSIS", "x", "#>; function Get-F { }"
    ].join("\n"))).toEqual([["Get-A", null], ["Get-B", null], ["Get-C", null], ["Get-D", null], ["Get-E", null], ["Get-F", null]]);
  });

  it("stops at an empty help block before the keyword, but not at an empty comment", async () => {
    expect(await help([
      "<#", ".SYNOPSIS", "#>", "function Get-A {", "    <#", "    .SYNOPSIS", "    In the body.", "    #>", "}",
      "<# #>", "function Get-B {", "    <#", "    .SYNOPSIS", "    In the body.", "    #>", "}"
    ].join("\n"))).toEqual([["Get-A", null], ["Get-B", "In the body."]]);
  });

  it("reads sections as PowerShell does: relative indentation kept, the last synopsis and the first of a repeated parameter winning", async () => {
    const analysis = await analyze("help.ps1", [
      "<#",
      ".synopsis",
      "  First synopsis.",
      ".SYNOPSIS",
      "",
      "  Second synopsis,",
      "    indented further.",
      ".Parameter name",
      "  The first.",
      ".PARAMETER NAME",
      "  The second.",
      ".PARAMETER Undeclared",
      "  Not a parameter of the function.",
      ".EXAMPLE",
      "  Get-A -Name x",
      "#>",
      "function Get-A([string]$Name) { }"
    ].join("\n"));
    expect(analysis.symbols[0].documentation).toEqual({
      source: "comment-help",
      summary: "Second synopsis,\n  indented further.",
      remarks: undefined,
      parameters: [
        { name: "Name", description: "The first." },
        { name: "UNDECLARED", description: "Not a parameter of the function." }
      ]
    });
  });
});

describe("Export-ModuleMember", () => {
  const module = (exports: string) => ["function Get-Alpha { }", "function Get-Beta { }", "function Set-Gamma { }", exports].join("\n");

  it("narrows by PowerShell's wildcards, without regard to case, and by -Function or the first argument only", async () => {
    expect(await names(module("Export-ModuleMember -Function get-*"))).toEqual(["Get-Alpha", "Get-Beta"]);
    expect(await names(module("Export-ModuleMember Set-Gamma -Alias Get-Alpha"))).toEqual(["Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function 'Get-Alpha', 'Set-Gamma'"))).toEqual(["Get-Alpha", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function Get-?eta"))).toEqual(["Get-Beta"]);
    expect(await names(module("Export-ModuleMember -Function *"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Variable Count"))).toEqual([]);
  });

  it("narrows by a comma list of bare words, mixed with strings, written over several lines", async () => {
    expect(await names(module("Export-ModuleMember -Function Get-Alpha, Set-Gamma"))).toEqual(["Get-Alpha", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function 'Get-Alpha', Get-Beta"))).toEqual(["Get-Alpha", "Get-Beta"]);
    expect(await names(module("Export-ModuleMember -Function Get-Beta,\n    Set-Gamma"))).toEqual(["Get-Beta", "Set-Gamma"]);
  });

  it("narrows nothing when a pattern is not written out, which only a run of the module could read, so private functions show rather than public ones hide", async () => {
    expect(await names(module("$public = @('Get-Alpha')\nExport-ModuleMember -Function $public"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function Get-Alpha, $more"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function (Get-Command -Module x).Name"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
    expect(await names(module("Export-ModuleMember -Function Get-Alpha\nExport-ModuleMember -Function $more"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
  });

  it("narrows nothing when the grammar cannot read the command in full, rather than hide what it could not read", async () => {
    // An assembly-qualified type name is one of the constructs the grammar still reads with an error.
    expect(await names(module("Export-ModuleMember -Function Get-Alpha -Variable [Type, Assembly]::Name"))).toEqual(["Get-Alpha", "Get-Beta", "Set-Gamma"]);
  });
});

describe("dependencies", () => {
  it("binds Import-Module's arguments as PowerShell does: a switch takes none, another parameter takes its own", async () => {
    expect(await dependencies([
      "Import-Module Az.Accounts -Force -ErrorAction Stop",
      "Import-Module -Prefix Pre -Name:Az.Storage -Verbose:$false",
      "Import-Module -MinimumVersion 2.0 Pester -DisableNameChecking",
      "ipmo PSReadLine",
      "Microsoft.PowerShell.Core\\Import-Module Qualified.Module",
      "Import-Module First.Module, Second.Module",
      "Import-Module $modulePath"
    ].join("\n"))).toEqual([
      { specifier: "Az.Accounts" },
      { specifier: "Az.Storage" },
      { specifier: "Pester" },
      { specifier: "PSReadLine" },
      { specifier: "Qualified.Module" },
      { specifier: "First.Module" },
      { specifier: "Second.Module" }
    ]);
  });

  it("resolves a path against the file's directory, $PSScriptRoot standing for it written either way, and a module directory to its manifest", async () => {
    await write({
      "tools/lib/common.ps1": "",
      "tools/lib/paths.ps1": "",
      "tools/lib/braced.ps1": "",
      "tools/modules/Tools/Tools.psd1": "@{}",
      "tools/modules/Tools/Tools.psm1": "",
      "tools/modules/Other.psm1": "",
      "tools/modules/Bare.psm1": ""
    });
    expect(await dependencies([
      ". \"$PSScriptRoot/lib/common.ps1\"",
      ". $PSScriptRoot\\lib\\paths.ps1",
      ". ${PSScriptRoot}/lib/braced.ps1",
      ". ./lib/common.ps1",
      "Import-Module \"$PSScriptRoot/modules/Tools\"",
      "Import-Module './modules/Other.psm1'",
      "Import-Module $PSScriptRoot\\modules\\Bare.psm1 -Force",
      "Import-Module ./modules/Missing.psm1",
      ". \"$PSScriptRoot/lib/$name.ps1\"",
      ". ../../outside.ps1",
      ". C:\\Scripts\\rooted.ps1"
    ].join("\n"), "tools/run.ps1")).toEqual([
      { specifier: "tools/modules/Tools/Tools.psd1", resolvedPath: "tools/modules/Tools/Tools.psd1" },
      { specifier: "tools/modules/Other.psm1", resolvedPath: "tools/modules/Other.psm1" },
      { specifier: "tools/modules/Bare.psm1", resolvedPath: "tools/modules/Bare.psm1" },
      { specifier: "./modules/Missing.psm1" },
      { specifier: "tools/lib/common.ps1", resolvedPath: "tools/lib/common.ps1" },
      { specifier: "tools/lib/paths.ps1", resolvedPath: "tools/lib/paths.ps1" },
      { specifier: "tools/lib/braced.ps1", resolvedPath: "tools/lib/braced.ps1" },
      { specifier: "$PSScriptRoot/lib/$name.ps1" },
      { specifier: "../../outside.ps1" },
      { specifier: "C:\\Scripts\\rooted.ps1" }
    ]);
  });

  it("finds a file as Windows finds it, without regard to case, and leaves a path that names several such files unresolved", async () => {
    await write({ "lib/logging.ps1": "", "Modules/Tools/tools.psm1": "", "twins/Same.ps1": "", "twins/same.ps1": "" });
    expect(await dependencies([
      ". .\\Lib\\Logging.ps1",
      "Import-Module $PSScriptRoot\\modules\\TOOLS",
      ". ./twins/SAME.ps1",
      ". ./twins/same.ps1"
    ].join("\n"))).toEqual([
      { specifier: "Modules/Tools/tools.psm1", resolvedPath: "Modules/Tools/tools.psm1" },
      { specifier: "lib/logging.ps1", resolvedPath: "lib/logging.ps1" },
      { specifier: "./twins/SAME.ps1" },
      { specifier: "twins/same.ps1", resolvedPath: "twins/same.ps1" }
    ]);
  });

  it("resolves nothing without the workspace's files to resolve against", async () => {
    await write({ "lib/common.ps1": "" });
    const analysis = await analyzePowerShellSource({ content: ". ./lib/common.ps1", absolutePath: path.join(workspaceRoot, "script.ps1"), workspaceRoot });
    expect(analysis.dependencies).toEqual([{ specifier: "./lib/common.ps1", resolvedPath: undefined, symbols: [], kind: "import" }]);
  });

  it("reads using module by name, string, module specification and path, before a param block, and leaves using namespace and assembly alone", async () => {
    await write({ "modules/Types.psm1": "" });
    expect(await dependencies([
      "using namespace System.Text",
      "using module Bare.Module",
      "using module 'Quoted.Module'",
      "using module @{ ModuleName = 'Hashed.Module'; ModuleVersion = '1.0' }",
      "using module ./Modules/types.psm1",
      "using assembly System.Windows.Forms",
      "[CmdletBinding()]",
      "param($Name)",
      "Import-Module After.Param"
    ].join("\n"))).toEqual([
      { specifier: "After.Param" },
      { specifier: "Bare.Module" },
      { specifier: "Quoted.Module" },
      { specifier: "Hashed.Module" },
      { specifier: "modules/Types.psm1", resolvedPath: "modules/Types.psm1" }
    ]);
  });

  it("reads #requires -Modules wherever it stands, by name, string or hashtable, and nothing else #requires names", async () => {
    expect(await dependencies([
      "#Requires -Version 7.0",
      "  #requires -Modules Indented.Module",
      "Write-Output x #requires -Module Trailing.Module",
      "#REQUIRES -Modules First.Module, 'Second.Module',@{ModuleName=\"Third.Module\";RequiredVersion=\"2.0\"} -PSEdition Core",
      "$text = @'",
      "#requires -Modules Inside.HereString",
      "'@"
    ].join("\n"))).toEqual([
      { specifier: "Indented.Module" },
      { specifier: "Trailing.Module" },
      { specifier: "First.Module" },
      { specifier: "Second.Module" },
      { specifier: "Third.Module" }
    ]);
  });
});

describe("module manifests", () => {
  it("publish the module by the file's stem, and name what they load: linked from the manifest's folder when the workspace holds it, by name and version otherwise", async () => {
    await write({
      "Modules/Contoso.Tools/Contoso.Tools.psd1": [
        "# The Contoso tools.",
        "@{",
        "    RootModule        = 'contoso.tools.psm1'",
        "    ModuleVersion     = '1.2.0'",
        "    NestedModules     = @('Private\\Helpers.psm1', 'Shared')",
        "    ScriptsToProcess  = \"Init.ps1\", 'Missing.ps1'",
        "    RequiredModules   = @(",
        "        'Pester'",
        "        @{ ModuleName = 'Az.Accounts'; ModuleVersion = '2.0' }",
        "        @{ ModuleName = \"Az.Storage\"; RequiredVersion = '5.1.0' }",
        "    )",
        "    FunctionsToExport = @('Get-Tool')",
        "}"
      ].join("\n"),
      "Modules/Contoso.Tools/Contoso.Tools.psm1": "",
      "Modules/Contoso.Tools/Private/Helpers.psm1": "",
      "Modules/Contoso.Tools/Shared/Shared.psm1": "",
      "Modules/Contoso.Tools/Init.ps1": ""
    });
    expect(await analyzeFile("Modules/Contoso.Tools/Contoso.Tools.psd1")).toStrictEqual({
      symbols: [{ name: "Contoso.Tools", kind: "package", location: { line: 1, character: 1 } }],
      dependencies: [
        { specifier: "Modules/Contoso.Tools/Contoso.Tools.psm1", resolvedPath: "Modules/Contoso.Tools/Contoso.Tools.psm1", symbols: [], kind: "import" },
        { specifier: "Modules/Contoso.Tools/Init.ps1", resolvedPath: "Modules/Contoso.Tools/Init.ps1", symbols: [], kind: "import" },
        { specifier: "Modules/Contoso.Tools/Private/Helpers.psm1", resolvedPath: "Modules/Contoso.Tools/Private/Helpers.psm1", symbols: [], kind: "import" },
        { specifier: "Modules/Contoso.Tools/Shared/Shared.psm1", resolvedPath: "Modules/Contoso.Tools/Shared/Shared.psm1", symbols: [], kind: "import" },
        { specifier: "Az.Accounts@2.0", symbols: [], kind: "import" },
        { specifier: "Az.Storage@5.1.0", symbols: [], kind: "import" },
        { specifier: "Missing.ps1", symbols: [], kind: "import" },
        { specifier: "Pester", symbols: [], kind: "import" }
      ],
      declares: [{ reason: "module", file: "Modules/Contoso.Tools/Contoso.Tools.psm1" }]
    });
  });

  it("are known by a root module, a module version or functions to export, written in any case; the legacy ModuleToProcess names the root module", async () => {
    await write({
      "a/A.psd1": "@{ moduleversion = '1.0' }",
      "b/B.psd1": "@{ 'FunctionsToExport' = '*' }",
      "c/C.psd1": "@{ ModuleToProcess = 'C.psm1' }",
      "c/C.psm1": ""
    });
    expect(await analyzeFile("a/A.psd1")).toStrictEqual({ symbols: [{ name: "A", kind: "package", location: { line: 1, character: 1 } }], dependencies: [] });
    expect((await analyzeFile("b/B.psd1"))?.symbols.map((symbol) => symbol.name)).toEqual(["B"]);
    expect((await analyzeFile("c/C.psd1"))?.declares).toEqual([{ reason: "module", file: "c/C.psm1" }]);
  });

  it("read a double-quoted value as PowerShell does, its escapes undone, and leave one that holds a variable unread", async () => {
    await write({
      "e/E.psd1": "@{ ModuleVersion = '1.0'; RootModule = \"E`.psm1\"; NestedModules = \"$Name.psm1\", 'It''s.psm1' }",
      "e/E.psm1": "",
      "e/It's.psm1": ""
    });
    const analysis = await analyzeFile("e/E.psd1");
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["e/E.psm1", "e/It's.psm1"]);
    expect(analysis?.declares).toEqual([{ reason: "module", file: "e/E.psm1" }]);
  });

  it("are not a data file's table, nor a table that only a run could fill", async () => {
    await write({
      "config/targets.psd1": "@{ Staging = @('web-01'); RootModuleName = 'not a manifest key' }",
      "config/computed.psd1": "Get-Content x\n@{ RootModule = 'x.psm1' }"
    });
    expect(await analyzeFile("config/targets.psd1")).toStrictEqual({ symbols: [], dependencies: [] });
    expect(await analyzeFile("config/computed.psd1")).toStrictEqual({ symbols: [], dependencies: [] });
  });
});

/** The files a file's dependencies resolve to, each with the functions it calls there. */
async function wires(relative: string): Promise<Record<string, string[]>> {
  const analysis = await analyzeFile(relative);
  return Object.fromEntries((analysis?.dependencies ?? []).filter((dependency) => dependency.resolvedPath).map((dependency) => [dependency.resolvedPath!, dependency.symbols]));
}

describe("calls to functions other files define: loaded, else unique", () => {
  const common = { "lib/Common.ps1": "function Write-Log { param($Message) }\nfunction Get-Setting { }\n" };

  it("wire a call to the only file that defines the function, under the name it is defined by there, however it is called", async () => {
    await write({ ...common, "lib/Region.ps1": "function Set-Region { }\n", "Run.ps1": "write-log 'hello'\nGet-Setting\n& 'Get-Setting'\n. Set-Region -Name west\n" });
    expect(await wires("Run.ps1")).toEqual({ "lib/Common.ps1": ["Get-Setting", "Write-Log"], "lib/Region.ps1": ["Set-Region"] });
  });

  it("count only a definition at a file's own level: one inside a script block or a function is local to it", async () => {
    await write({
      ...common,
      "tests/Run.Tests.ps1": "Describe 'x' {\n  BeforeAll {\n    function Write-Log { }\n    function Get-Stub { }\n  }\n}\n",
      "lib/Outer.ps1": "function Invoke-Outer {\n  function Get-Inner { }\n}\n",
      "Run.ps1": "Write-Log 'hello'\nGet-Stub\nGet-Inner\n"
    });
    expect(await wires("Run.ps1")).toEqual({ "lib/Common.ps1": ["Write-Log"] });
  });

  it("leave a call to a name the caller defines itself, at any depth, to its own definition", async () => {
    await write({ ...common, "Own.ps1": "Describe 'x' {\n  function Write-Log { }\n}\nWrite-Log 'mine'\n" });
    expect(await wires("Own.ps1")).toEqual({});
  });

  it("choose the one definition the caller loads among several the workspace holds", async () => {
    await write({
      "Copies/Alpha.psm1": "function Resolve-Target { 'alpha' }\n",
      "Copies/Beta.psm1": "function Resolve-Target { 'beta' }\n",
      "Copies/Use-Alpha.ps1": "Import-Module \"$PSScriptRoot/Alpha.psm1\"\nResolve-Target\n"
    });
    expect(await wires("Copies/Use-Alpha.ps1")).toEqual({ "Copies/Alpha.psm1": ["Resolve-Target"] });
  });

  it("draw no call wire when the caller loads several definitions of the name", async () => {
    await write({
      "Copies/Alpha.psm1": "function Resolve-Target { 'alpha' }\n",
      "Copies/Beta.psm1": "function Resolve-Target { 'beta' }\n",
      "Copies/Use-Both.ps1": "Import-Module \"$PSScriptRoot/Alpha.psm1\"\nImport-Module \"$PSScriptRoot/Beta.psm1\"\nResolve-Target\n"
    });
    expect(await wires("Copies/Use-Both.ps1")).toEqual({ "Copies/Alpha.psm1": [], "Copies/Beta.psm1": [] });
  });

  it("draw none when the caller loads no definition and two files define the name", async () => {
    await write({
      "Copies/Alpha.psm1": "function Resolve-Target { 'alpha' }\n",
      "Copies/Beta.psm1": "function Resolve-Target { 'beta' }\n",
      "Copies/Use-Neither.ps1": "Resolve-Target\n"
    });
    expect(await wires("Copies/Use-Neither.ps1")).toEqual({});
  });

  it("count a definition inside text the grammar could not read as none", async () => {
    // PowerShell ends a string at a typographic quote, and the grammar does not: it loses the Describe block and reads
    // the function after it inside an error, though PowerShell reads this without one. The smallest input found so.
    const unread = ["Describe 'x' {", "    $path = 'C:\\\u2019", "    $name = 'y'", "}", "function Get-Thing { }", "$z = 'w'"].join("\n");
    const lost: string[] = [];
    const visit = (node: SyntaxNode, inError: boolean): void => {
      if (node.type === "function_statement" && inError) lost.push(node.text);
      for (const child of node.children) if (child) visit(child, inError || node.type === "ERROR");
    };
    await readTree("powershell", unread, (root) => visit(root, false));
    // Should the grammar learn to read this, the test proves nothing until it is given another input the grammar loses.
    expect(lost).toEqual(["function Get-Thing { }"]);
    await write({ "Unread.ps1": unread, "Run.ps1": "Get-Thing\n" });
    expect(await wires("Run.ps1")).toEqual({});
  });

  it("never wire a command PowerShell ships merely because one file defines it, but wire it when the caller loads that file", async () => {
    await write({
      "Backport/Expand-Archive.ps1": "if ($PSVersionTable.PSVersion.Major -lt 5) {\n  function Expand-Archive { }\n}\n",
      "Backport/Use-Archive.ps1": "Expand-Archive -Path a.zip\n",
      "Backport/Use-Backport.ps1": ". \"$PSScriptRoot\\Expand-Archive.ps1\"\nExpand-Archive -Path a.zip\n"
    });
    expect(await wires("Backport/Use-Archive.ps1")).toEqual({});
    expect(await wires("Backport/Use-Backport.ps1")).toEqual({ "Backport/Expand-Archive.ps1": ["Expand-Archive"] });
  });

  it("treat a function PowerShell defines without a module as shipped: wired only to a definition the caller loads", async () => {
    // PowerShell's own answer (`pwsh -NoProfile -NonInteractive -File run.ps1`, pwsh 7.7.0): in run.ps1, which loads
    // nothing, `Get-Command Pause` is "Function source='' file=''", PowerShell's own; in loads.ps1, which dot-sources the
    // helper, it is the helper's ("file='…/lib/Helpers.ps1'"), a later function replacing an earlier one. `Invoke-Thing`
    // is wired by the measured rule's "else unique", which PowerShell's run of run.ps1 alone cannot show.
    await write({
      "lib/Helpers.ps1": "function Pause { Read-Host 'Press Enter' | Out-Null }\nfunction Invoke-Thing { }\nfunction mkdir { }\nfunction ImportSystemModules { }\n",
      "run.ps1": "Write-Host 'Building'\nPause\nInvoke-Thing\nmkdir out\nImportSystemModules\n",
      "loads.ps1": ". \"$PSScriptRoot/lib/Helpers.ps1\"\nPause\n"
    });
    // `mkdir` is Windows PowerShell's and PowerShell 7's on Windows; `ImportSystemModules` is Windows PowerShell 5.1's alone.
    expect(await wires("run.ps1")).toEqual({ "lib/Helpers.ps1": ["Invoke-Thing"] });
    expect(await wires("loads.ps1")).toEqual({ "lib/Helpers.ps1": ["Pause"] });
  });

  it("read a call by one of PowerShell's aliases as a call to the command it names, never to a function of the alias's name", async () => {
    // PowerShell's own answer (`pwsh -NoProfile -NonInteractive -File run.ps1`, pwsh 7.7.0), lib.ps1 defining `select` and
    // `Get-ChildItem` and run.ps1 dot-sourcing it: `'x' | select` printed "x", the alias Select-Object answering ahead of
    // the loaded function; `gci` printed "the workspace's Get-ChildItem", the alias naming a command the loaded function
    // answers. `sort` is an alias of Sort-Object in Windows PowerShell 5.1 (and PowerShell 7 on Windows), not on Linux.
    await write({
      "lib.ps1": "function select { }\nfunction Get-ChildItem { }\nfunction sort { }\n",
      "run.ps1": ". \"$PSScriptRoot/lib.ps1\"\n'x' | select\ngci\n",
      "elsewhere.ps1": "'x' | select\ngci\n'y' | sort\n"
    });
    expect(await wires("run.ps1")).toEqual({ "lib.ps1": ["Get-ChildItem"] });
    expect(await wires("elsewhere.ps1")).toEqual({});
  });

  it("never reach a test's definition as the only one from working code, but let a test reach another test's helper", async () => {
    await write({
      "tests/Stubs.Tests.ps1": "function Get-External { }\nfunction Get-Thing { }\n",
      "lib/Impl.ps1": "function Get-Thing { }\n",
      "lib/Run.ps1": "Get-External\nGet-Thing\n",
      "tests/Other.Tests.ps1": "Get-External\n"
    });
    expect(await wires("lib/Run.ps1")).toEqual({ "lib/Impl.ps1": ["Get-Thing"] });
    expect(await wires("tests/Other.Tests.ps1")).toEqual({ "tests/Stubs.Tests.ps1": ["Get-External"] });
  });

  it("treat a module that runs tests as working code: AL-Go's RunTests.psm1 never reaches a test's stub", async () => {
    await write({
      // AL-Go's Tests/RunTests.Test.ps1 stubs BcContainerHelper's commands at its own level.
      "Tests/RunTests.Test.ps1": "function Get-AppJsonFromAppFile { }\nfunction Get-BcContainerEventLog { }\n",
      "Actions/RunTests/RunTests.psm1": "function Invoke-Run {\n    Get-AppJsonFromAppFile\n    Get-BcContainerEventLog\n}\n"
    });
    expect(await wires("Actions/RunTests/RunTests.psm1")).toEqual({});
  });

  it("let a module's files call each other, and its importers reach them through its manifest and what its root module loads", async () => {
    await write({
      "Tools/Tools.psd1": "@{ RootModule = 'Tools.psm1'; ModuleVersion = '1.0' }",
      "Tools/Tools.psm1": "foreach ($file in (Get-ChildItem -Path \"$PSScriptRoot/Public\" -Filter *.ps1)) { . $file.FullName }\n. \"$PSScriptRoot/Private/Format-Tool.ps1\"\n",
      "Tools/Public/Get-Tool.ps1": "function Get-Tool { Format-Tool }\n",
      "Tools/Private/Format-Tool.ps1": "function Format-Tool { }\n",
      "Other/Format-Tool.ps1": "function Format-Tool { }\n",
      "Deploy.ps1": "Import-Module \"$PSScriptRoot/Tools\"\nGet-Tool\nFormat-Tool\n"
    });
    expect(await wires("Tools/Public/Get-Tool.ps1")).toEqual({ "Tools/Private/Format-Tool.ps1": ["Format-Tool"] });
    expect(await wires("Deploy.ps1")).toEqual({ "Tools/Tools.psd1": [], "Tools/Public/Get-Tool.ps1": ["Get-Tool"], "Tools/Private/Format-Tool.ps1": ["Format-Tool"] });
  });
});

describe("loads the text fixes", () => {
  it("read a dot-source or Import-Module of Join-Path from $PSScriptRoot, positionally or by name, with -Resolve", async () => {
    await write({
      "lib/A.ps1": "", "lib/B.ps1": "", "Mods/Tools/Tools.psm1": "", "Mods/Log.psm1": "",
      "Deploy.ps1": [
        ". (Join-Path $PSScriptRoot 'lib\\A.ps1')",
        ". (Join-Path -Path $PSScriptRoot -ChildPath \"lib/B.ps1\" -Resolve)",
        "Import-Module (Join-Path $PSScriptRoot 'Mods/Tools') -Force",
        "Import-Module (Join-Path -Path $PSScriptRoot \"Mods/Log.psm1\" -Resolve)",
        ". (Join-Path $env:ROOT 'lib/A.ps1')"
      ].join("\n")
    });
    expect(await wires("Deploy.ps1")).toEqual({ "lib/A.ps1": [], "lib/B.ps1": [], "Mods/Tools/Tools.psm1": [], "Mods/Log.psm1": [] });
  });

  it("read a variable assigned once at the file's own level from such a path, and not one assigned twice", async () => {
    await write({
      "lib/A.ps1": "", "lib/B.ps1": "",
      "Deploy.ps1": [
        "$script:Root = $PSScriptRoot",
        "$a = Join-Path $script:Root 'lib/A.ps1'",
        ". $a",
        "$b = Join-Path $PSScriptRoot 'lib/B.ps1'",
        "$b = 'elsewhere.ps1'",
        ". $b"
      ].join("\n")
    });
    expect(Object.keys(await wires("Deploy.ps1"))).toEqual(["lib/A.ps1"]);
  });

  it("read an assignment that carries an attribute on the line before it as PowerShell does, in a program and in a library", async () => {
    const suppress = "[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments', '', Justification = 'Read by a dot-sourced script.')]";
    await write({
      "lib/A.ps1": "",
      "Deploy.ps1": [suppress, "$libFolder = Join-Path $PSScriptRoot 'lib'", ". (Join-Path $libFolder 'A.ps1')"].join("\n"),
      // AL-Go's Actions/AL-Go-Helper.ps1 opens so: a library every action dot-sources.
      "Helper.ps1": [suppress, "$ALGoFolderName = '.AL-Go'", "function Get-A { }"].join("\n")
    });
    expect(Object.keys(await wires("Deploy.ps1"))).toEqual(["lib/A.ps1"]);
    expect(await analyzeFile("Helper.ps1")).not.toHaveProperty("program");
  });
  it("read a variable assigned once in the block that holds the load or one enclosing it, before the load, and not elsewhere", async () => {
    await write({
      "Actions/Helper.ps1": "", "Actions/Other.ps1": "", "Actions/Third.ps1": "", "lib/Late.ps1": "",
      "Tests/Helper.Test.ps1": [
        "Describe 'helper' {",
        "    BeforeAll {",
        "        $scriptRoot = Join-Path $PSScriptRoot '..\\Actions' -Resolve",
        "        . (Join-Path $scriptRoot 'Helper.ps1')",
        "        & { . \"$scriptRoot\\Third.ps1\" }",
        "    }",
        "    & { . \"$scriptRoot\\Other.ps1\" }",
        "}",
        ". $late",
        "$late = Join-Path $PSScriptRoot '../lib/Late.ps1'"
      ].join("\n")
    });
    expect(Object.keys(await wires("Tests/Helper.Test.ps1")).sort()).toEqual(["Actions/Helper.ps1", "Actions/Third.ps1"]);
  });

  it("follow what Pester's BeforeAll and BeforeEach assign into the It blocks beneath them, and nothing Pester 5 would not", async () => {
    await write({
      "Actions/A.ps1": "", "Actions/B.ps1": "", "Actions/C.ps1": "", "Actions/D.ps1": "", "Actions/E.ps1": "", "Actions/F.ps1": "",
      "Tests/Pester.Test.ps1": [
        "$here = Join-Path $PSScriptRoot '..\\Actions'",
        "Describe 'actions' {",
        "    BeforeAll { $scriptRoot = Join-Path $PSScriptRoot '..\\Actions' }",
        "    BeforeEach { $each = Join-Path $PSScriptRoot '..\\Actions' }",
        "    $body = Join-Path $PSScriptRoot '..\\Actions'",
        "    It 'loads' { . (Join-Path $scriptRoot 'A.ps1') }",
        "    Context 'inner' {",
        "        It 'loads' { . (Join-Path $each 'B.ps1') }",
        "    }",
        // Pester 3 and 4 run these as written; Pester 5 runs a Describe's body and the file's own level only to discover the tests.
        "    It 'loads from the body' { . (Join-Path $body 'C.ps1') }",
        "    It 'loads from the file' { . (Join-Path $here 'D.ps1') }",
        "    BeforeAll { . (Join-Path $here 'E.ps1') }",
        "}",
        "Describe 'another' { It 'loads' { . (Join-Path $scriptRoot 'F.ps1') } }"
      ].join("\n")
    });
    expect(Object.keys(await wires("Tests/Pester.Test.ps1")).sort()).toEqual(["Actions/A.ps1", "Actions/B.ps1"]);
  });

  it("read Split-Path of the script's own path as its folder, and of another fixed path as its parent", async () => {
    await write({
      "scripts/lib.ps1": "", "scripts/b.ps1": "", "c.ps1": "", "scripts/d.ps1": "",
      "scripts/Run.ps1": [
        "$here = Split-Path -Parent $MyInvocation.MyCommand.Path",
        ". \"$here\\lib.ps1\"",
        ". (Join-Path (Split-Path $PSCommandPath) 'b.ps1')",
        "$root = Split-Path $PSScriptRoot -Parent",
        ". \"$root/c.ps1\"",
        "$name = Split-Path -Leaf $MyInvocation.MyCommand.Definition",
        ". \"$PSScriptRoot/$name\""
      ].join("\n")
    });
    expect(Object.keys(await wires("scripts/Run.ps1")).sort()).toEqual(["c.ps1", "scripts/b.ps1", "scripts/lib.ps1"]);
  });

  it("read a loop over names written out, in a foreach, piped to ForEach-Object, or through a variable assigned the list", async () => {
    await write({
      "M/a.ps1": "", "M/b.ps1": "", "M/c.ps1": "", "M/d.ps1": "", "M/E.psm1": "",
      "M/M.psm1": [
        "foreach ($s in @('a.ps1', 'b.ps1')) { . (Join-Path $PSScriptRoot $s) }",
        "'c.ps1', 'd.ps1' | ForEach-Object { . \"$PSScriptRoot\\$_\" }",
        "$modules = @('E.psm1')",
        "foreach ($m in $modules) { Import-Module \"$PSScriptRoot/$m\" }",
        "foreach ($x in (Get-Content names.txt)) { . (Join-Path $PSScriptRoot $x) }"
      ].join("\n")
    });
    expect(Object.keys(await wires("M/M.psm1")).sort()).toEqual(["M/E.psm1", "M/a.ps1", "M/b.ps1", "M/c.ps1", "M/d.ps1"]);
  });

  it("read a foreach over Get-ChildItem of a fixed folder, by its filter and recursion, written in place or through variables", async () => {
    await write({
      "M/Public/Get-A.ps1": "", "M/Public/Deep/Get-B.ps1": "", "M/Public/notes.txt": "", "M/Private/Set-C.ps1": "", "M/Private/Skip.psm1": "",
      "M/One.psm1": "$script:ModuleRoot = $PSScriptRoot\nforeach ($f in (Get-ChildItem -Path \"$script:ModuleRoot/Public/\" -Recurse -Filter *.ps1)) { . $f.FullName }\n",
      "M/Two.psm1": "$public = @(Get-ChildItem -Path $PSScriptRoot\\Public\\*.ps1)\n$private = @(Get-ChildItem -Path \"$PSScriptRoot\\Private\" -Filter *.ps1)\nforeach ($import in @($public + $private)) { . $import.FullName }\n"
    });
    expect(Object.keys(await wires("M/One.psm1")).sort()).toEqual(["M/Public/Deep/Get-B.ps1", "M/Public/Get-A.ps1"]);
    expect(Object.keys(await wires("M/Two.psm1")).sort()).toEqual(["M/Private/Set-C.ps1", "M/Public/Get-A.ps1"]);
  });

  it("read Get-ChildItem piped to ForEach-Object that dot-sources each item", async () => {
    await write({
      "M/Private/Set-C.ps1": "", "M/Private/Get-D.ps1": "",
      "M/M.psm1": "Get-ChildItem \"$PSScriptRoot\\Private\\*.ps1\" | ForEach-Object { . $_.FullName }\n"
    });
    expect(Object.keys(await wires("M/M.psm1")).sort()).toEqual(["M/Private/Get-D.ps1", "M/Private/Set-C.ps1"]);
  });

  it("read a script run by its path, and not a path only a run knows", async () => {
    await write({
      "scripts/Run-Step.ps1": "", "scripts/Other.ps1": "", "scripts/Third.ps1": "",
      "Deploy.ps1": [
        "& \"$PSScriptRoot\\scripts\\Run-Step.ps1\" -Step publish",
        "& (Join-Path $PSScriptRoot 'scripts/Other.ps1')",
        "scripts\\Third.ps1",
        "& \"$env:TEMP\\Run-Step.ps1\""
      ].join("\n")
    });
    expect(Object.keys(await wires("Deploy.ps1")).sort()).toEqual(["scripts/Other.ps1", "scripts/Run-Step.ps1", "scripts/Third.ps1"]);
  });

  it("read a script run or dot-sourced by a path without its extension as PowerShell finds it: the file so named, else its .ps1", async () => {
    // PowerShell's own answers (pwsh 7.7.0, `pwsh -NoProfile -NonInteractive -File run.ps1`, run from the folder): with
    // only `a/build.ps1`, `a/build`, `& a/build`, `& "$PSScriptRoot/a/build"` and `. a/build` each "a/build.ps1 ran";
    // with only `d/build.psm1`, `d/build` is `CommandNotFoundException`: no other extension is tried. And a name without
    // a folder is a command: from `g/Use.ps1`, `. Stop-It` and `& Stop-It` beside `g/Stop-It.ps1` are
    // `CommandNotFoundException`. With `b/build` and `b/build.ps1` both, the platforms differ, and the reader follows
    // Windows: a relative `b/build` is `b/build.ps1` (the owner's run on their Windows machine, 2026-11-21, `Get-Command
    // ./build` beside both was `build.ps1`), where pwsh on Linux found `b/build`; a rooted `"$PSScriptRoot/b/build"` is
    // `b/build` on both, as PowerShell's source has it.
    await write({
      "a/build.ps1": "", "b/build": "", "b/build.ps1": "", "d/build.psm1": "", "g/Stop-It.ps1": "",
      "Deploy.ps1": ["a/build", "& \"$PSScriptRoot/a/build\" -Step publish", "b/build", "d/build"].join("\n"),
      "Library.ps1": ". \"$PSScriptRoot/a/build\"\nfunction Get-Thing { }\n",
      "Rooted.ps1": ". \"$PSScriptRoot/b/build\"\n",
      "g/Use.ps1": ". Stop-It\n"
    });
    const analysis = await analyzeFile("Deploy.ps1");
    expect(Object.keys(await wires("Deploy.ps1")).sort()).toEqual(["a/build.ps1", "b/build.ps1"]);
    expect(Object.keys(await wires("Rooted.ps1"))).toEqual(["b/build"]);
    expect(analysis?.notices).toEqual([{ reason: "loads whose path the text fixes but no file of the workspace holds, left unlinked", subject: "d/build" }]);
    expect(Object.keys(await wires("Library.ps1"))).toEqual(["a/build.ps1"]);
    expect(await wires("g/Use.ps1")).toEqual({});
  });

  // A reviewer's case of 2026-11-21, red when committed. Windows tries `.ps1` first only for a name without an
  // extension: PowerShell's `ConstructSearchPatternsFromName` adds the name itself first when `Path.HasExtension(name)`
  // is true, and `build.v2` has the extension `.v2`, so beside both `build.v2` and `build.v2.ps1` Windows runs
  // `build.v2`; Unix does too (pwsh 7.7.0 on Linux, `Get-Command ./build.v2` beside both: `…/build.v2`, `Application`).
  // The reader read it so before the change that follows Windows for `./build`.
  it("read a relative path whose name has an extension of its own, `./build.v2`, as the file so named on both platforms", async () => {
    await write({ "v/build.v2": "", "v/build.v2.ps1": "", "v/Use.ps1": ". ./build.v2\n", "v/Run.ps1": "& ./build.v2\n" });
    expect(Object.keys(await wires("v/Use.ps1"))).toEqual(["v/build.v2"]);
    expect(Object.keys(await wires("v/Run.ps1"))).toEqual(["v/build.v2"]);
  });
});

describe("programs and libraries", () => {
  it("call a script whose own level only defines functions and classes a library, not a program", async () => {
    await write({ "lib/Strict.ps1": "function Get-A { }\nfilter Select-B { $_ }\nclass C { }\n" });
    expect(await analyzeFile("lib/Strict.ps1")).not.toHaveProperty("program");
  });

  it("let a library also set up its scope: dot-sources, module imports, strict mode, exports, aliases and assignments that call nothing", async () => {
    await write({
      "lib/Other.ps1": "",
      "lib/Lenient.ps1": [
        "Set-StrictMode -Version Latest",
        ". \"$PSScriptRoot/Other.ps1\"",
        "Import-Module Microsoft.PowerShell.Archive",
        "$script:Cache = @{}",
        "function Get-A { }",
        "Set-Alias -Name ga -Value Get-A"
      ].join("\n")
    });
    expect(await analyzeFile("lib/Lenient.ps1")).not.toHaveProperty("program");
  });

  it("call a script a program when its own level runs anything, or defines nothing", async () => {
    await write({
      "Run.ps1": "function Get-A { }\nGet-A\n",
      "Assign.ps1": "function Get-A { }\n$now = Get-Date\n",
      "Hide.ps1": "function global:Get-A { }\n(Get-Item Function:\\Get-A).Visibility = 'Private'\n",
      "Unread.ps1": "function Get-A { }\n)\n",
      "Empty.ps1": ""
    });
    for (const file of ["Run.ps1", "Assign.ps1", "Hide.ps1", "Unread.ps1", "Empty.ps1"]) expect((await analyzeFile(file))?.program, file).toEqual({});
  });

  it("keep two kinds of library programs, as measured: one that imports inside an if, and an include that only assigns a variable", async () => {
    // Known misses, pinned: both are dot-sourced, never run, and the rule errs toward calling a library a program.
    await write({
      "lib/Helper.ps1": "if (-not (Get-Module X)) { Import-Module X }\nfunction Get-A { }\n",
      "lib/Settings.inc.ps1": "$Settings = @{ Region = 'west' }\n"
    });
    expect((await analyzeFile("lib/Helper.ps1"))?.program).toEqual({});
    expect((await analyzeFile("lib/Settings.inc.ps1"))?.program).toEqual({});
  });
});

describe("a manifest's FunctionsToExport", () => {
  it("offers each function from the one file of its module that defines it, and no name the module does not define once, nor a wildcard", async () => {
    await write({
      "Tools/Tools.psd1": "@{ RootModule = 'Tools.psm1'; FunctionsToExport = @('get-tool', 'Remove-Tool', 'Set-*', 'Format-Twice') }",
      "Tools/Tools.psm1": "foreach ($f in (Get-ChildItem \"$PSScriptRoot/Public\" -Filter *.ps1)) { . $f.FullName }\n",
      "Tools/Public/Get-Tool.ps1": "function Get-Tool { }\n",
      "Tools/Public/Set-Tool.ps1": "function Set-Tool { }\n",
      "Tools/Public/Format-A.ps1": "function Format-Twice { }\n",
      "Tools/Public/Format-B.ps1": "function Format-Twice { }\n",
      "Elsewhere/Remove-Tool.ps1": "function Remove-Tool { }\n"
    });
    const analysis = await analyzeFile("Tools/Tools.psd1");
    expect(analysis?.reExportedSymbols).toEqual([{ name: "Get-Tool", kind: "function", sourceModulePath: "Tools/Public/Get-Tool.ps1" }]);
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["Tools/Tools.psm1"]);
  });
});

describe("what a load draws nothing for, said as a notice", () => {
  const UNFIXED = "dot-sources and imports whose path the text does not fix, left unlinked";
  const UNFOUND = "loads whose path the text fixes but no file of the workspace holds, left unlinked";

  it("names a dot-source and an import whose path the text does not fix, by line and command, and draws nothing for them", async () => {
    await write({
      "Run.ps1": ["param($Settings, $Module)", ". $Settings.Path", "Import-Module -Name $Module -Force", ". \"$PSScriptRoot/lib/Helper.ps1\"", ". $Settings\\Extra.ps1"].join("\n"),
      "lib/Helper.ps1": "function Get-Help2 { }\n"
    });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.notices).toEqual([
      { reason: UNFIXED, subject: "line 2: . $Settings.Path" },
      { reason: UNFIXED, subject: "line 3: Import-Module -Name $Module -Force" }
    ]);
    // A path that begins with a variable no assignment fixes keeps its text, as it always has, and says nothing.
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["lib/Helper.ps1", "$Settings\\Extra.ps1"]);
  });

  it("names a load built with Join-Path or a variable that no file of the workspace holds, by its path", async () => {
    await write({ "Run.ps1": ". (Join-Path $PSScriptRoot 'missing.ps1')\n$m = Join-Path $PSScriptRoot 'Gone.psm1'\nImport-Module $m\n" });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.notices?.map((notice) => notice.reason)).toEqual([UNFOUND, UNFOUND]);
    expect(analysis?.notices?.map((notice) => notice.subject.toLowerCase())).toEqual(["$psscriptroot/missing.ps1", "$psscriptroot/gone.psm1"]);
    expect(analysis?.dependencies).toEqual([]);
  });

  it("keeps a module named through a variable the file assigns once from a constant, and says nothing of it", async () => {
    // PowerShell's own answer, `pwsh -NoProfile -NonInteractive -File run.ps1` over `$m = 'Pester'` then `Import-Module $m`,
    // on a machine without Pester: "The specified module 'Pester' was not loaded because no valid module file was found
    // in any module directory." The module it looks for is the one the assignment names.
    await write({ "Run.ps1": "$m = 'Pester'\nImport-Module $m\n$n = \"PSReadLine\"\nImport-Module -Name \"$n\"\n" });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.notices).toBeUndefined();
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["Pester", "PSReadLine"]);
  });

  it("keeps each module a loop over written-out names imports, and says nothing of it; a name a run computes stays a notice", async () => {
    // PowerShell's own answer (`pwsh -NoProfile -NonInteractive -File run.ps1`, pwsh 7.7.0) over
    // `foreach ($m in 'Alpha.Missing', 'Beta.Missing') { Import-Module $m }`: "The specified module 'Alpha.Missing' was not
    // loaded …" then the same of 'Beta.Missing', each name of the list in turn; and of 'Gamma.Missing' piped to ForEach-Object.
    await write({
      "Run.ps1": [
        "foreach ($m in 'Alpha.Missing', 'Beta.Missing') { Import-Module $m }",
        "'Gamma.Missing' | ForEach-Object { Import-Module -Name $_ }",
        "foreach ($m in (Get-Content modules.txt)) { Import-Module $m }"
      ].join("\n")
    });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["Alpha.Missing", "Beta.Missing", "Gamma.Missing"]);
    expect(analysis?.notices).toEqual([{ reason: "dot-sources and imports whose path the text does not fix, left unlinked", subject: "line 3: Import-Module $m" }]);
  });

  it("reads no name of a loop whose body sets its item, which only a run can read, and keeps the plain loops' names", async () => {
    // PowerShell's own answers (`pwsh -NoProfile -NonInteractive -File run.ps1`, pwsh 7.7.0, each module missing, so its
    // error names what was looked for): `$m = "$m.Extra"` before the load looked for ModE.Extra and ModF.Extra;
    // `$m += '.Plus'` for ModH.Plus; a nested `foreach ($m in 'Inner')` for Inner; `$_ = …` and `$PSItem = …` in
    // ForEach-Object for what they set; and `$m = 'Other'` after the load, ModG and ModG2. The plain loops looked for
    // ModA, ModB, ModC and ModD. A body that sets its item is not read as a loop, after the load too; what is left is
    // read as any variable is: `$_` assigned once, before its one use, holds 'ModJ.Changed', as pwsh says, and the rest
    // are notices.
    await write({
      "Run.ps1": [
        "foreach ($m in 'ModE', 'ModF') { $m = \"$m.Extra\"; Import-Module $m }",
        "foreach ($m in 'ModH') { $m += '.Plus'; Import-Module $m }",
        "foreach ($m in 'ModI') { foreach ($m in 'Inner') { }; Import-Module $m }",
        "'ModJ' | ForEach-Object { $_ = 'ModJ.Changed'; Import-Module $_ }",
        "'ModK' | ForEach-Object { $PSItem = 'ModK.Changed'; Import-Module $_ }",
        "foreach ($n in 'ModG', 'ModG2') { Import-Module $n; $n = 'Other' }",
        "'ModA', 'ModB' | ForEach-Object { Import-Module $_ }",
        "foreach ($p in 'ModC', 'ModD') { Import-Module $p }"
      ].join("\n")
    });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.dependencies.map((dependency) => dependency.specifier)).toEqual(["ModJ.Changed", "ModA", "ModB", "ModC", "ModD"]);
    expect(analysis?.notices?.map((notice) => notice.subject)).toEqual([
      "line 1: Import-Module $m", "line 2: Import-Module $m", "line 3: Import-Module $m", "line 5: Import-Module $_", "line 6: Import-Module $n"
    ]);
  });

  it("takes a command qualified by its module for a command, not a script's path, unless the workspace holds that script", async () => {
    // PowerShell's own answers (pwsh 7.7.0, `pwsh -NoProfile -NonInteractive -File run.ps1` from a folder holding
    // `Microsoft.PowerShell.Utility/New-Object.ps1`, and a function `New-Object` defined first): the qualified name runs
    // the shipped cmdlet ("Microsoft.PowerShell.Utility\New-Object gave a StringBuilder"), never the function nor the
    // script; and a name qualified by a module nothing loads, `TabExpansionPlusPlus\Register-ArgumentCompleter`, is a
    // module's command PowerShell tries to load ("CouldNotAutoLoadModule"), not a path. dbatools writes both.
    await write({
      "Run.ps1": [
        "Microsoft.PowerShell.Utility\\New-Object -TypeName System.Text.StringBuilder",
        "TabExpansionPlusPlus\\Register-ArgumentCompleter -CommandName x -ScriptBlock { }",
        "lib\\Helpers",
        "lib\\Build.ps1"
      ].join("\n"),
      "Microsoft.PowerShell.Utility/New-Object.ps1": "'a script'\n",
      "lib/Helpers.ps1": "'a script'\n",
      "lib/Build.ps1": "'a script'\n"
    });
    const analysis = await analyzeFile("Run.ps1");
    expect(analysis?.notices).toBeUndefined();
    // On Windows, where a backslash separates folders, `lib\Helpers` is a path when the workspace holds the script, which
    // PowerShell runs without its extension written (pwsh here, where only `/` separates: `lib/Helpers` gave "the script
    // lib/Helpers.ps1 ran"). pwsh on Linux reads `lib\Helpers` as a module's command, which no Windows run would.
    expect(analysis?.dependencies.map((dependency) => dependency.resolvedPath)).toEqual(["lib/Helpers.ps1", "lib/Build.ps1"]);
  });

  it("says nothing of a load a loop reads, nor of a script block run in the caller's scope", async () => {
    await write({
      "Module.psm1": [
        "foreach ($file in (Get-ChildItem -Path \"$PSScriptRoot/Public\" -Filter *.ps1)) { . $file.FullName }",
        "Get-ChildItem \"$PSScriptRoot/Private\" -Filter *.ps1 | ForEach-Object { . $_.FullName }",
        "foreach ($name in @('One.ps1', 'Two.ps1')) { . (Join-Path $PSScriptRoot $name) }",
        ". { $script:ready = $true }"
      ].join("\n"),
      "Public/Get-A.ps1": "function Get-A { }\n",
      "Private/Get-B.ps1": "function Get-B { }\n",
      "One.ps1": "function Get-One { }\n",
      "Two.ps1": "function Get-Two { }\n"
    });
    const analysis = await analyzeFile("Module.psm1");
    expect(analysis?.notices).toBeUndefined();
    expect(analysis?.dependencies.map((dependency) => dependency.specifier).sort()).toEqual(["One.ps1", "Private/Get-B.ps1", "Public/Get-A.ps1", "Two.ps1"]);
  });
});

describe("the archetype the generator's index carries", () => {
  it("passes over a file the workspace's configuration calls a test when working code reaches the only definition", async () => {
    await write({ "harness/Stubs.ps1": "function Get-External { }\n", "lib/Run.ps1": "Get-External\n" });
    const files = await fileIndex();
    const read = (index: Set<string>) => analyzePowerShellSource({ content: "Get-External\n", absolutePath: path.join(workspaceRoot, "lib/Run.ps1"), workspaceRoot, fileIndex: index });
    // By the default configuration `harness/` holds working code, so the call reaches it.
    expect((await read(files)).dependencies.map((dependency) => dependency.resolvedPath)).toEqual(["harness/Stubs.ps1"]);
    // A configuration that names `harness/` a test folder, as the generator's index answers, leaves the call unwired.
    const configured = Object.assign(new Set(files), { archetypeOf: (file: string) => (file.startsWith("harness/") ? "test" as const : "implementation" as const) });
    expect((await read(configured)).dependencies).toEqual([]);
  });
});
