# scripts/oracle/scip-edges.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/scip-edges.ts
- Live Doc ID: LD-implementation-scripts-oracle-scip-edges-ts
- Generated At: 2026-09-27T20:50:50.386Z

## Authored
### Purpose
Turns a SCIP index into the file-to-file edges a fixture's `expected/compiler-edges.json` records: every reference in one document that resolves to a definition in another, with the symbols that carry it.

### Notes
- Nothing is filtered to fit an analyzer. The indexer quirks it handles are recorded in the output instead of hidden: scip-dotnet's namespace-only type names are disambiguated by project visibility with the leftovers listed under `ambiguous`, scip-go's generated test binaries are listed under `outside` with no edges, and rust-analyzer's one `crate/` symbol for every crate root of a package is narrowed to the referencing file's own crate, with crates read from Cargo's layout by `cargoProjects`.
- Symbols are shown by their descriptors alone, with the scheme, package manager, package name and version stripped, so one converter reads every indexer's output.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:50.386Z","inputHash":"e998d560e0bca95a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScipIndex` {#symbol-scipindex}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L33)

##### `ScipIndex` — Summary
The parts of a SCIP index this module reads.

#### `ScipDocument` {#symbol-scipdocument}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L39)

##### `ScipDocument` — Summary
One indexed file and its symbol occurrences.

#### `OracleProject` {#symbol-oracleproject}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L45)

##### `OracleProject` — Summary
A project of the solution, by name, with the directory its files live under.

#### `OracleEdge` {#symbol-oracleedge}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L54)

##### `OracleEdge` — Summary
`from` references at least one symbol that `to` defines.

#### `OracleAmbiguity` {#symbol-oracleambiguity}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L61)

##### `OracleAmbiguity` — Summary
A reference the solution structure could not narrow to one defining file.

#### `OracleEdges` {#symbol-oracleedges}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L68)

##### `OracleEdges` — Summary
The written form of a fixture's `expected/compiler-edges.json`.

#### `IndexContext` {#symbol-indexcontext}
- Type: interface
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L81)

##### `IndexContext` — Summary
What the caller knows about the fixture that the index does not.

#### `readProjects` {#symbol-readprojects}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L110)
- Returns: [`OracleProject`](#symbol-oracleproject)[]

##### `readProjects` — Summary
Reads the projects of a .sln, or the one project of a .csproj, with their direct project references.

#### `cargoProjects` {#symbol-cargoprojects}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L175)
- Returns: [`OracleProject`](#symbol-oracleproject)[]

##### `cargoProjects` — Summary
Cargo's conventional targets of the package at `packageDir`: the library owns every other file under `src/`; each binary, test, example and bench is its own crate that sees the library.

#### `edgesFromIndex` {#symbol-edgesfromindex}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L195)
- Returns: [`OracleEdges`](#symbol-oracleedges)
- Parameters: `index`: [`ScipIndex`](#symbol-scipindex); `context`: [`IndexContext`](#symbol-indexcontext)

##### `edgesFromIndex` — Summary
Derives the edges from an already-decoded index. Pure; the unit test drives it with plain objects.

#### `convertScipIndex` {#symbol-convertscipindex}
- Type: function
- Source: [source](../../../../scripts/oracle/scip-edges.ts#L277)
- Returns: [`OracleEdges`](#symbol-oracleedges)
- Parameters: `context`: [`IndexContext`](#symbol-indexcontext)

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
