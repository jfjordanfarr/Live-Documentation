import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readPowerShellAst, writePowerShellAst } from "./files";
import { edgesFromPowerShellAst, type PowerShellAst, type PowerShellScriptFacts } from "./powershell-edges";

const emptyScript: PowerShellScriptFacts = {
  parseErrors: [], functions: [], published: [], types: [], exportModuleMembers: [], dotSources: [], importModules: [], usingStatements: [], requiredModules: []
};

const ast: PowerShellAst = {
  tool: "pwsh 7.5.4",
  files: {
    "Run Me.ps1": {
      ...emptyScript,
      dotSources: [
        { line: 1, column: 1, text: ". \"$PSScriptRoot/lib/Log.ps1\"", target: "$PSScriptRoot/lib/Log.ps1", resolved: "lib/Log.ps1" },
        { line: 2, column: 1, text: ". $PSScriptRoot\\lib\\Log.ps1", target: "$PSScriptRoot\\lib\\Log.ps1", resolved: "lib/Log.ps1" },
        { line: 3, column: 1, text: ". $helper", target: null, resolved: null },
        { line: 4, column: 1, text: ". \"$PSScriptRoot/Run Me.ps1\"", target: "$PSScriptRoot/Run Me.ps1", resolved: "Run Me.ps1" }
      ],
      importModules: [{
        line: 5, column: 1, text: "Import-Module ./mods/Tools -Force", command: "Import-Module",
        names: [{ name: "./mods/Tools", text: "./mods/Tools", resolved: "mods/Tools/Tools.psd1" }],
        parameters: { Force: { text: null, values: null }, Name: { text: "./mods/Tools", values: ["./mods/Tools"] } },
        bindingErrors: []
      }],
      usingStatements: [
        { line: 6, column: 1, text: "using module ./mods/Types.psm1", kind: "Module", name: "./mods/Types.psm1", resolved: "mods/Types.psm1" },
        { line: 7, column: 1, text: "using namespace System.Text", kind: "Namespace", name: "System.Text", resolved: null }
      ],
      requiredModules: [{ name: "Az.Accounts", version: "2.0", requiredVersion: null, maximumVersion: null, guid: null, resolved: null }]
    },
    "lib/Log.ps1": emptyScript,
    "mods/Tools/Tools.psd1": {
      parseErrors: [],
      data: { RootModule: "Tools.psm1", resolved: "a key of the table, not a location" },
      references: [{ key: "RootModule", value: "Tools.psm1", version: null, resolved: "mods/Tools/Tools.psm1" }, { key: "RequiredModules", value: "Az.Accounts", version: "2.0", resolved: null }]
    },
    "mods/Tools/Tools.psm1": emptyScript,
    "mods/Types.psm1": emptyScript
  }
};

describe("PowerShell's parser record as oracle edges", () => {
  it("draws an edge for every reference that resolves to another file, carried by the text that makes it", () => {
    const edges = edgesFromPowerShellAst(ast, [{ name: "fixture", directory: ".", references: [] }]);
    expect(edges.tool).toBe("pwsh 7.5.4");
    expect(edges.documents).toEqual(["Run Me.ps1", "lib/Log.ps1", "mods/Tools/Tools.psd1", "mods/Tools/Tools.psm1", "mods/Types.psm1"]);
    expect(edges.edges).toEqual([
      { from: "mods/Tools/Tools.psd1", to: "mods/Tools/Tools.psm1", symbols: ["RootModule = 'Tools.psm1'"] },
      { from: "Run Me.ps1", to: "lib/Log.ps1", symbols: [". \"$PSScriptRoot/lib/Log.ps1\"", ". $PSScriptRoot\\lib\\Log.ps1"] },
      { from: "Run Me.ps1", to: "mods/Tools/Tools.psd1", symbols: ["Import-Module ./mods/Tools -Force"] },
      { from: "Run Me.ps1", to: "mods/Types.psm1", symbols: ["using module ./mods/Types.psm1"] }
    ]);
    expect(edges.outside).toEqual([]);
    expect(edges.ambiguous).toEqual([]);
  });

  it("writes every location relative to the record's own file and reads it back into fixture coordinates, leaving a table's own keys alone", () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "powershell-ast-"));
    try {
      const file = path.join(fixture, "expected", "powershell-ast.json");
      writePowerShellAst(file, fixture, ast);
      const stored = JSON.parse(fs.readFileSync(file, "utf8")) as PowerShellAst;
      expect(Object.keys(stored.files)).toEqual(["../Run Me.ps1", "../lib/Log.ps1", "../mods/Tools/Tools.psd1", "../mods/Tools/Tools.psm1", "../mods/Types.psm1"]);
      const run = stored.files["../Run Me.ps1"] as PowerShellScriptFacts;
      expect(run.dotSources.map((dotSource) => dotSource.resolved)).toEqual(["../lib/Log.ps1", "../lib/Log.ps1", null, "../Run Me.ps1"]);
      expect(run.importModules[0].names[0].resolved).toBe("../mods/Tools/Tools.psd1");
      expect(run.usingStatements.map((using) => using.resolved)).toEqual(["../mods/Types.psm1", null]);
      expect(stored.files["../mods/Tools/Tools.psd1"]).toEqual({
        parseErrors: [],
        data: { RootModule: "Tools.psm1", resolved: "a key of the table, not a location" },
        references: [{ key: "RootModule", value: "Tools.psm1", version: null, resolved: "../mods/Tools/Tools.psm1" }, { key: "RequiredModules", value: "Az.Accounts", version: "2.0", resolved: null }]
      });
      expect(readPowerShellAst(file, fixture)).toEqual(ast);
      expect(readPowerShellAst(path.join(fixture, "absent.json"), fixture)).toBeUndefined();
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });
});
