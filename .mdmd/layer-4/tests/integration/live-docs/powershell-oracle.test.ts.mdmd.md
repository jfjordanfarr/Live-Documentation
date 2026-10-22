# tests/integration/live-docs/powershell-oracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/powershell-oracle.test.ts
- Generated At: 2026-10-22T16:48:01.003Z

## Authored
### Purpose
The PowerShell adapter held to PowerShell's own parser, without `pwsh`: over every fixture that carries `expected/powershell-ast.json`, each file is read through the adapter as the generator reads it, with the fixture's files as the index, and compared with the parser's record. Of a script or module: the functions it publishes and the classes and enums it defines (by name, kind, line and column, the functions with their help), its dependencies (by specifier and resolved file) and a script's program mark. Of a `.psd1`: whether PowerShell's reading of its table makes it a manifest, and then its module, what it names and the root module it declares; a data file must be read for nothing. The disagreements must equal a register of measured misses exactly, so a miss fixed or a new one fails the test.

### Notes
- Written on 2026-10-16 when the adapter moved to the grammar ([Turn 3 of the October 16 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). The register then held the bundled grammar's three misses on the rollout program, a bare-word comma list given to `Export-ModuleMember` (twice) and an unquoted `$PSScriptRoot\...` path given to `Import-Module`; the same evening the engine built its own grammar ([Turn 4](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)) and the register is empty on both fixtures. With the bundled grammar put back it lists five misses on the rollout program and two on the compendium, which is how the test was shown to fail.
- Proved to run with `pwsh` off the path (`PATH=/usr/local/bin`, 2026-10-16). `npm run oracle:index` rewrites the records after a fixture changes; the register changes only by a reading of what changed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- [`powershell.powershellAdapter`](../../../packages/engine/src/live-docs/adapters/powershell.ts.mdmd.md#symbol-powershelladapter)
- [`core.DependencyEntry`](../../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`files.readPowerShellAst`](../../../scripts/oracle/files.ts.mdmd.md#symbol-readpowershellast)
- [`powershell-edges.PowerShellDataFileFacts`](../../../scripts/oracle/powershell-edges.ts.mdmd.md#symbol-powershelldatafilefacts)
- [`powershell-edges.PowerShellHelp`](../../../scripts/oracle/powershell-edges.ts.mdmd.md#symbol-powershellhelp)
- [`powershell-edges.PowerShellScriptFacts`](../../../scripts/oracle/powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts)
- [`powershell-edges.isDataFileFacts`](../../../scripts/oracle/powershell-edges.ts.mdmd.md#symbol-isdatafilefacts)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
