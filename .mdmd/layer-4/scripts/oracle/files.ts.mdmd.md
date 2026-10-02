# scripts/oracle/files.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/files.ts
- Generated At: 2026-10-02T20:20:02.627Z

## Authored
### Purpose
Keeps the oracle’s persisted JSON self-contained by translating filesystem locations between the containing JSON directory and the fixture root used for comparison.

### Notes
Only filesystem locations are rebased. Compiler symbol identifiers, project reference names, ambiguity records and hand-verified evidence remain intact. The indexer writes through this module and the comparison reads through it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HandVerifiedEdge` {#symbol-handverifiededge}
- Type: interface
- Source: [source](../../../../scripts/oracle/files.ts#L8)

##### `HandVerifiedEdge` — Summary
A manually verified source relationship, with its evidence and optional deployment crossing.

#### `HandVerifiedEdges` {#symbol-handverifiededges}
- Type: interface
- Source: [source](../../../../scripts/oracle/files.ts#L16)

##### `HandVerifiedEdges` — Summary
The manually verified relationships stored alongside compiler expectations.

#### `rebasePath` {#symbol-rebasepath}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L22)

##### `rebasePath` — Summary
Express a relative filesystem location from another directory, preserving absolute locations.

#### `rebaseOracleEdges` {#symbol-rebaseoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L28)
- Returns: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)
- Parameters: `graph`: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `rebaseOracleEdges` — Summary
Change only filesystem locations; keep all relationships, symbols, project references and ambiguity evidence.

#### `rebaseHandVerifiedEdges` {#symbol-rebasehandverifiededges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L46)
- Returns: [`HandVerifiedEdges`](#symbol-handverifiededges)
- Parameters: `graph`: [`HandVerifiedEdges`](#symbol-handverifiededges)

##### `rebaseHandVerifiedEdges` — Summary
Change the path coordinates of hand-verified edges without changing their evidence.

#### `writeOracleEdges` {#symbol-writeoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L58)
- Parameters: `graph`: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `writeOracleEdges` — Summary
Write every compiler observation with locations relative to the file containing them.

#### `readOracleEdges` {#symbol-readoracleedges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L64)
- Returns: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)

##### `readOracleEdges` — Summary
Read persisted compiler observations into the fixture-relative coordinates used by the comparison.

#### `readHandVerifiedEdges` {#symbol-readhandverifiededges}
- Type: function
- Source: [source](../../../../scripts/oracle/files.ts#L71)
- Returns: [`HandVerifiedEdges`](#symbol-handverifiededges)

##### `readHandVerifiedEdges` — Summary
Read hand-verified observations into fixture-relative coordinates.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->
