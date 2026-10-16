# scripts/oracle/files.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/files.ts
- Generated At: 2026-10-16T16:49:41.447Z

## Authored
### Purpose
Keeps the oracle's persisted JSON self-contained by translating filesystem locations between the containing JSON directory and the fixture root used for comparison.

### Notes
- Only filesystem locations are rebased. Compiler symbol identifiers, project reference names, ambiguity records and hand-verified evidence remain intact. The indexer writes through this module and the comparison reads through it.
- PowerShell's parser record (`powershell-ast.json`, since 2026-10-16) is written and read here too: its files' keys and every `resolved` path move, while a data file's own table, which may hold any key, is left as written.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HandVerifiedEdge` {#symbol-handverifiededge}
- Type: interface
- Source: [source](../../../../scripts/oracle/files.ts#L9)

##### `HandVerifiedEdge` — Summary
A manually verified source relationship, with its evidence and optional deployment crossing.

#### `HandVerifiedEdges` {#symbol-handverifiededges}
- Type: interface
- Source: [source](../../../../scripts/oracle/files.ts#L17)

##### `HandVerifiedEdges` — Summary
The manually verified relationships stored alongside compiler expectations.

#### `rebasePath` {#symbol-rebasepath}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L23)

##### `rebasePath` — Summary
Express a relative filesystem location from another directory, preserving absolute locations.

#### `rebaseOracleEdges` {#symbol-rebaseoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L29)
- Returns: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)
- Parameters: `graph`: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `rebaseOracleEdges` — Summary
Change only filesystem locations; keep all relationships, symbols, project references and ambiguity evidence.

#### `rebaseHandVerifiedEdges` {#symbol-rebasehandverifiededges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L47)
- Returns: [`HandVerifiedEdges`](#symbol-handverifiededges)
- Parameters: `graph`: [`HandVerifiedEdges`](#symbol-handverifiededges)

##### `rebaseHandVerifiedEdges` — Summary
Change the path coordinates of hand-verified edges without changing their evidence.

#### `writeOracleEdges` {#symbol-writeoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L59)
- Parameters: `graph`: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `writeOracleEdges` — Summary
Write every compiler observation with locations relative to the file containing them.

#### `readOracleEdges` {#symbol-readoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L65)
- Returns: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `readOracleEdges` — Summary
Read persisted compiler observations into the fixture-relative coordinates used by the comparison.

#### `writePowerShellAst` {#symbol-writepowershellast}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L72)
- Parameters: `ast`: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast)

##### `writePowerShellAst` — Summary
Write PowerShell's parser record with every file and resolved path relative to the JSON file.

#### `readPowerShellAst` {#symbol-readpowershellast}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L79)
- Returns: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast)

##### `readPowerShellAst` — Summary
Read PowerShell's parser record into fixture-relative coordinates.

#### `readHandVerifiedEdges` {#symbol-readhandverifiededges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L86)
- Returns: [`HandVerifiedEdges`](#symbol-handverifiededges)

##### `readHandVerifiedEdges` — Summary
Read hand-verified observations into fixture-relative coordinates.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`powershell-edges.PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast)
- [`powershell-edges.rebasePowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-rebasepowershellast)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->
