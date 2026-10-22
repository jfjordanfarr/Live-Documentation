# scripts/oracle/index-fixture.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/index-fixture.ts
- Entry: command `oracle:index` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-22T16:47:57.762Z

## Authored
### Purpose
The `oracle:index` command: picks the indexer a sample program calls for, a SCIP indexer by its project file or PowerShell's own parser for a program of PowerShell files, runs it over a temporary copy, and writes every file-to-file edge it resolved to the program's `expected/compiler-edges.json`.

### Notes
- The indexer table is the one place that knows each tool's command line and quirks: `scip-dotnet` needs `DOTNET_ROLL_FORWARD=Major` and misreports its version inside the index, `scip-python` crashes without a `--project-version`, `scip-typescript` is run from this repository's `node_modules`, and `scip-clang` (since 2026-10-16) is selected by a `compile_commands.json` at the fixture root, whose `"directory": "."` entries the indexer's `prepare` step rewrites to the working copy, since a fixture cannot know where it will be copied.
- PowerShell (since 2026-10-16, [Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)) has no SCIP indexer: an indexer may read the working copy itself instead of running a command, and keep the rest of what its tool said beside the edges. `pwsh` runs [`powershell-ast.ps1`](./powershell-ast.ps1.mdmd.md) over the copy's `.ps1`, `.psm1` and `.psd1` files, [`powershell-edges.ts`](./powershell-edges.ts.mdmd.md) draws the edges, and the parser's whole record is written as `expected/powershell-ast.json`. It is tried last, on any `.ps1` or `.psm1`, so a program with another indexer's marker keeps that indexer.
- Ruby programs have no indexer here (`scip-ruby` needs a Sorbet project), so the command refuses them rather than guessing. scip-clang is installed by the devcontainer's post-create script, a release binary pinned by version and checksum, and PowerShell by a devcontainer feature, both for this project's development only.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`files.writeOracleEdges`](./files.ts.mdmd.md#symbol-writeoracleedges)
- [`files.writePowerShellAst`](./files.ts.mdmd.md#symbol-writepowershellast)
- [`fixture.copyFixture`](./fixture.ts.mdmd.md#symbol-copyfixture)
- [`fixture.listFixtureFiles`](./fixture.ts.mdmd.md#symbol-listfixturefiles)
- [`powershell-edges.POWERSHELL_EXTENSIONS`](./powershell-edges.ts.mdmd.md#symbol-powershell_extensions)
- [`powershell-edges.edgesFromPowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-edgesfrompowershellast)
- [`powershell-edges.parsePowerShellFixture`](./powershell-edges.ts.mdmd.md#symbol-parsepowershellfixture)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)
- [`scip-edges.OracleProject`](./scip-edges.ts.mdmd.md#symbol-oracleproject)
- [`scip-edges.cargoProjects`](./scip-edges.ts.mdmd.md#symbol-cargoprojects)
- [`scip-edges.convertScipIndex`](./scip-edges.ts.mdmd.md#symbol-convertscipindex)
- [`scip-edges.readProjects`](./scip-edges.ts.mdmd.md#symbol-readprojects)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
