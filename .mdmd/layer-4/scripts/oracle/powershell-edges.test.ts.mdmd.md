# scripts/oracle/powershell-edges.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/oracle/powershell-edges.test.ts
- Generated At: 2026-10-16T16:49:41.528Z

## Authored
### Purpose
Keeps the PowerShell oracle's converter and persistence honest on a hand-built record: every reference that resolves to another file is an edge carried by its text, two references to one file merge, a self-reference, a dynamic one and a `using namespace` make none, and a manifest's root module is an edge; the record is written with every file key and resolved path relative to its own JSON file and read back unchanged, a data file's table left as written even where it holds a key named `resolved`.

### Notes
- Written on 2026-10-16 with the oracle ([Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)); it runs without `pwsh`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- [`files.readPowerShellAst`](./files.ts.mdmd.md#symbol-readpowershellast)
- [`files.writePowerShellAst`](./files.ts.mdmd.md#symbol-writepowershellast)
- [`powershell-edges.PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast)
- [`powershell-edges.PowerShellScriptFacts`](./powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts)
- [`powershell-edges.edgesFromPowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-edgesfrompowershellast)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
