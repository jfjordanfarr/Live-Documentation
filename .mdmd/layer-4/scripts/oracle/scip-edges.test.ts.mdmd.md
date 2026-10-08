# scripts/oracle/scip-edges.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/oracle/scip-edges.test.ts
- Generated At: 2026-09-27T23:21:31.977Z

## Authored
### Purpose
Keeps the converter from a SCIP index to file-to-file edges honest on hand-built indexes: an edge from a reference to a definition in another file carries the symbol; local symbols and a file's references to its own definitions make no edge; a symbol is shown by its descriptors alone whichever indexer wrote it; documents outside the fixture are listed and given no edges; a code-behind is linked to the designer peer that declares the field it uses; a symbol two projects define is resolved by what the referencing project can see, through transitive references, and reported as ambiguous with every candidate kept when two visible files define it; a crate-root reference is narrowed to the referencing file's own crate. Then the readers: Cargo's layout into crates, and a solution or a lone project file into projects with their references.

### Notes
- Written on 2026-09-27 with the oracle ([Turn 2](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-2)) and grown as each indexer's quirk was met: scip-dotnet's namespace-only type names that day, scip-go's generated test binaries and rust-analyzer's one `crate/` symbol per crate root with the tree-sitter adapters that followed. Each case is a quirk's record, and each quirk is met by resolution or by listing, never by dropping an edge: ground truth is never filtered.

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
- [`scip-edges.OracleProject`](./scip-edges.ts.mdmd.md#symbol-oracleproject)
- [`scip-edges.ScipIndex`](./scip-edges.ts.mdmd.md#symbol-scipindex)
- [`scip-edges.cargoProjects`](./scip-edges.ts.mdmd.md#symbol-cargoprojects)
- [`scip-edges.edgesFromIndex`](./scip-edges.ts.mdmd.md#symbol-edgesfromindex)
- [`scip-edges.readProjects`](./scip-edges.ts.mdmd.md#symbol-readprojects)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
