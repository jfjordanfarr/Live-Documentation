import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { readPowerShellAst } from "./files";
import { comparePowerShell, folderFiles } from "./powershell-compare";

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

  // The fixture's kept record stands in for `pwsh`, so that the comparison is held without PowerShell; its one miss is
  // the one `powershell-oracle.test.ts` registers for this fixture, the grammar's reading of `./scripts/Clean.ps1`.
  it("sets the adapter's wires, calls and programs beside the parser's, naming the one wire the grammar misses", async () => {
    const ast = readPowerShellAst(path.join(fixture, "expected", "powershell-ast.json"), fixture)!;
    const report = await comparePowerShell(fixture, ast);
    expect(report.wires.parserOnly).toEqual(["Deploy.ps1 → scripts/Clean.ps1"]);
    expect(report.wires.adapterOnly).toEqual([]);
    expect(report.wires.both).toBe(report.wires.adapter);
    expect(report.calls.parserOnly).toEqual([]);
    expect(report.calls.adapterOnly).toEqual([]);
    expect(report.calls.both).toBeGreaterThan(0);
    expect(report.programs.differ).toEqual([]);
  });
});
