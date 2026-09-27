# scripts/oracle/scip-edges.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/scip-edges.ts
- Live Doc ID: LD-implementation-scripts-oracle-scip-edges-ts
- Generated At: 2026-09-27T10:16:24.384Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:24.384Z","inputHash":"3567f175cdafe5e4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScipIndex` {#symbol-scipindex}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L23)

##### `ScipIndex` — Summary
The parts of a SCIP index this module reads.

#### `ScipDocument` {#symbol-scipdocument}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L29)

##### `ScipDocument` — Summary
One indexed file and its symbol occurrences.

#### `OracleProject` {#symbol-oracleproject}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L35)

##### `OracleProject` — Summary
A project of the solution, by name, with the directory its files live under.

#### `OracleEdge` {#symbol-oracleedge}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L42)

##### `OracleEdge` — Summary
`from` references at least one symbol that `to` defines.

#### `OracleAmbiguity` {#symbol-oracleambiguity}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L49)

##### `OracleAmbiguity` — Summary
A reference the solution structure could not narrow to one defining file.

#### `OracleEdges` {#symbol-oracleedges}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L56)

##### `OracleEdges` — Summary
The written form of a fixture's `expected/compiler-edges.json`.

#### `readProjects` {#symbol-readprojects}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L74)
- Returns: [`OracleProject`](#symbol-oracleproject)[]

##### `readProjects` — Summary
Reads the projects of a .sln, or the one project of a .csproj, with their direct project references.

#### `edgesFromIndex` {#symbol-edgesfromindex}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L140)
- Returns: [`OracleEdges`](#symbol-oracleedges)
- Parameters: `index`: [`ScipIndex`](#symbol-scipindex); `projects`: [`OracleProject`](#symbol-oracleproject)[]

##### `edgesFromIndex` — Summary
Derives the edges from an already-decoded index. Pure; the unit test drives it with plain objects.

#### `convertScipIndex` {#symbol-convertscipindex}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L216)
- Returns: [`OracleEdges`](#symbol-oracleedges)
- Parameters: `projects`: [`OracleProject`](#symbol-oracleproject)[]

##### `convertScipIndex` — Summary
Decodes an index file and derives its edges.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Integration Tests
- [oracle.test.ts](../../tests/integration/live-docs/oracle.test.ts.mdmd.md)

#### Vitest Unit Tests
- [scip-edges.test.ts](./scip-edges.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
