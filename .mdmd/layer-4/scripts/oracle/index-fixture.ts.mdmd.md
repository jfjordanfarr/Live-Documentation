# scripts/oracle/index-fixture.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/index-fixture.ts
- Generated At: 2026-10-02T20:20:02.647Z

## Authored
### Purpose
The `oracle:index` command: picks the SCIP indexer a sample program's project file calls for, runs it over a temporary copy, and writes every compiler-resolved edge to the program's `expected/compiler-edges.json`.

### Notes
- The indexer table is the one place that knows each tool's command line and quirks: `scip-dotnet` needs `DOTNET_ROLL_FORWARD=Major` and misreports its version inside the index, `scip-python` crashes without a `--project-version`, and `scip-typescript` is run from this repository's `node_modules`.
- C and Ruby programs have no indexer here (`scip-clang` needs a compilation database, `scip-ruby` a Sorbet project), so the command refuses them rather than guessing.

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
- [`fixture.copyFixture`](./fixture.ts.mdmd.md#symbol-copyfixture)
- [`fixture.listFixtureFiles`](./fixture.ts.mdmd.md#symbol-listfixturefiles)
- [`scip-edges.IndexContext`](./scip-edges.ts.mdmd.md#symbol-indexcontext)
- [`scip-edges.OracleProject`](./scip-edges.ts.mdmd.md#symbol-oracleproject)
- [`scip-edges.cargoProjects`](./scip-edges.ts.mdmd.md#symbol-cargoprojects)
- [`scip-edges.convertScipIndex`](./scip-edges.ts.mdmd.md#symbol-convertscipindex)
- [`scip-edges.readProjects`](./scip-edges.ts.mdmd.md#symbol-readprojects)
<!-- LIVE-DOC:END Dependencies -->
