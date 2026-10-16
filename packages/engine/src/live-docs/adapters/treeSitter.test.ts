import { describe, expect, it } from "vitest";

import { parseSource, type SyntaxNode } from "./treeSitter";

/** Every ERROR and MISSING node of a tree, by its text. */
function errors(node: SyntaxNode): string[] {
  const found = node.type === "ERROR" || node.isMissing ? [node.text] : [];
  return found.concat(node.children.flatMap(errors));
}

/** The named node types of a tree, in document order. */
function types(node: SyntaxNode): string[] {
  return [node.type, ...node.namedChildren.flatMap(types)];
}

async function parse(grammar: string, source: string): Promise<{ errors: string[]; types: string[] }> {
  const tree = await parseSource(grammar, source);
  try {
    return { errors: errors(tree.rootNode), types: types(tree.rootNode) };
  } finally {
    tree.delete();
  }
}

describe("the PowerShell grammar the engine builds", () => {
  it("reads a comma list of bare words as one argument, and the statements after it", async () => {
    const parsed = await parse("powershell", [
      "Export-ModuleMember -Function Get-Alpha, Get-Beta",
      "Format-Table Name, Status -AutoSize",
      "Select-Object @{ n = 'x'; e = { 1 } }, Name",
      "function Get-Alpha { }"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
    expect(parsed.types.filter((type) => type === "command_argument_list")).toHaveLength(3);
    expect(parsed.types).toContain("function_statement");
  });

  it("reads a bare word that begins with a variable as one argument, and as a dot-source's path", async () => {
    const parsed = await parse("powershell", [
      "Import-Module $PSScriptRoot\\..\\modules\\Tools\\Tools.psm1 -Force",
      "Import-Module ${PSScriptRoot}/Tools.psm1",
      ". ${PSScriptRoot}/lib/Logging.ps1",
      ". $PSScriptRoot/lib/Settings.ps1"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
  });

  it("reads using statements, before a param block", async () => {
    const parsed = await parse("powershell", [
      "using namespace System.Text",
      "using module ./Tools.psm1",
      "using module @{ ModuleName = 'Tools'; ModuleVersion = '1.0' }",
      "using assembly System.Windows.Forms",
      "[CmdletBinding()]",
      "param($Name)",
      "Write-Output $Name"
    ].join("\n"));
    expect(parsed.errors).toEqual([]);
    expect(parsed.types.filter((type) => type === "using_statement")).toHaveLength(4);
    expect(parsed.types).toContain("param_block");
  });

  it("leaves the grammars it does not build to the bundled ones", async () => {
    expect((await parse("python", "import os\n")).errors).toEqual([]);
  });
});
