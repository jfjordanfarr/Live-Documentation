# `scripts/oracle/powershell-compare.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/oracle/powershell-compare.test.ts`
- Generated At: 2026-11-21T03:07:38.004Z

## Authored
### Purpose
Holds the PowerShell grader of a folder, [`powershell-compare.ts`](./powershell-compare.ts.mdmd.md), without PowerShell: which files of a folder it reads, and, over the `powershell-wires` fixture's kept parser record standing in for `pwsh`, that it sets the adapter's wires, calls and programs beside the parser's and names the one wire the grammar misses there.

### Notes
- Written on 2026-11-21 with the grader ([the work item](../../../../AI-Agent-Workspace/Work/readers-on-main.md)). The miss it names, `Deploy.ps1 → scripts/Clean.ps1`, is the grammar's reading of a script run as `./scripts/Clean.ps1`, the same one `tests/integration/live-docs/powershell-oracle.test.ts` registers for the fixture, so the two hold each other: a mend of the grammar turns both red until both say so.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`files.readPowerShellAst`](./files.ts.mdmd.md#symbol-readpowershellast)
- [`powershell-compare.comparePowerShell`](./powershell-compare.ts.mdmd.md#symbol-comparepowershell)
- [`powershell-compare.folderFiles`](./powershell-compare.ts.mdmd.md#symbol-folderfiles)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
