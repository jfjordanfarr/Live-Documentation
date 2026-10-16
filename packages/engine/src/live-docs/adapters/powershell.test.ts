import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { analyzePowerShellSource, powershellAdapter } from "./powershell";

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
      { specifier: "powershell-compendium/common/logging.ps1", resolvedPath: "powershell-compendium/common/logging.ps1", symbols: [], kind: "import" }
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
      symbols: [],
      kind: "import"
    });
  });

  it("reports every script as the program entry, even one with nothing else to report, and no module", async () => {
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
