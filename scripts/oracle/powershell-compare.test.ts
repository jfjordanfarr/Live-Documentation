import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { readPowerShellAst } from "./files";
import { comparePowerShell, folderFiles, parserReading } from "./powershell-compare";
import { ParserWorkspace, recordedShippedNames } from "./powershell-wires";

const fixture = path.resolve(__dirname, "..", "..", "tests", "integration", "fixtures", "powershell-wires");
const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

describe("the PowerShell comparison of a folder", () => {
  it("reads every file of a folder but the version control's and a folder of Live Docs, build outputs among them", () => {
    const folder = mkdtempSync(path.join(tmpdir(), "powershell-compare-"));
    folders.push(folder);
    for (const file of ["a.ps1", "bin/b.ps1", ".git/HEAD", ".live-documentation/source/a.ps1.md", "lib/c.psm1"]) {
      mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
      writeFileSync(path.join(folder, file), "\n");
    }
    expect(folderFiles(folder)).toEqual(["a.ps1", "bin/b.ps1", "lib/c.psm1"]);
  });

  // The fixture's kept record stands in for `pwsh`, so that the comparison is held without PowerShell; its misses are
  // those `powershell-oracle.test.ts` registers for this fixture: the grammar's reading of `./scripts/Clean.ps1`, and
  // `. ./build` beside `build` and `build.ps1`, which pwsh on Linux, the record's, reads as Unix does and the adapter as
  // Windows does (`expected/windows-runs.json`, the owner's run).
  it("sets the adapter's wires, calls and programs beside the parser's, naming the wires the grammar and the platform make differ", async () => {
    const ast = readPowerShellAst(path.join(fixture, "expected", "powershell-ast.json"), fixture)!;
    const report = await comparePowerShell(fixture, ast);
    expect(report.wires.parserOnly).toEqual(["Build/Use-Build.ps1 → Build/build", "Deploy.ps1 → scripts/Clean.ps1"]);
    expect(report.wires.adapterOnly).toEqual(["Build/Use-Build.ps1 → Build/build.ps1"]);
    expect(report.wires.both).toBe(report.wires.adapter);
    expect(report.calls.parserOnly).toEqual([]);
    expect(report.calls.adapterOnly).toEqual([]);
    expect(report.calls.both).toBeGreaterThan(0);
    expect(report.programs.differ).toEqual([]);
  });

  // The names PowerShell answers by itself are pwsh's, given to the rules, not the adapter's list: a name pwsh ships, or
  // an alias pwsh defines, changes what the rules draw, whatever the adapter's list holds.
  it("reads the parser's calls with pwsh's own names, so that the adapter's list of them is graded", () => {
    const ast = readPowerShellAst(path.join(fixture, "expected", "powershell-ast.json"), fixture)!;
    const recorded = recordedShippedNames();
    const workspace = new ParserWorkspace(ast, recorded);
    const unique = Object.keys(ast.files).sort().flatMap((file) => Array.from(workspace.wiresOf(file), ([to, names]) => ({ file, to, names: Array.from(names) })))
      .find((wire) => !workspace.loadsFile(wire.file, wire.to));
    // The fixture must hold a call wired by "else unique", or this proves nothing.
    expect(unique).toBeDefined();
    const [name] = unique!.names;
    const count = (reading: { calls: Set<string> }): number => Array.from(reading.calls).filter((call) => call === `${unique!.file} → ${name} → ${unique!.to}`).length;
    expect(count(parserReading(ast, recorded))).toBe(1);
    expect(count(parserReading(ast, { ...recorded, functions: [...recorded.functions, name] }))).toBe(0);
    expect(count(parserReading(ast, { ...recorded, aliases: [...recorded.aliases, { name, definition: "Out-Null" }] }))).toBe(0);
  });

  it("keeps pwsh's own names as pwsh gives them: commands, functions without a module and aliases", () => {
    const recorded = recordedShippedNames();
    expect(recorded.commands).toContain("Select-Object");
    expect(recorded.functions).toContain("Pause");
    expect(recorded.aliases).toContainEqual({ name: "select", definition: "Select-Object" });
  });
});
