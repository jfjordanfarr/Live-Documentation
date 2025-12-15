# scripts/graph-tools/inspect-symbol.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/graph-tools/inspect-symbol.ts
- Live Doc ID: LD-implementation-scripts-graph-tools-inspect-symbol-ts
- Generated At: 2025-12-15T00:38:07.418Z

## Authored
### Purpose
Explores neighbor relationships for a given symbol ID, URI, or path by querying the graph snapshot and printing JSON/pretty views, enabling developers to audit link-aware edges interactively as delivered with the symbol inspector CLI on 2025-10-24 ([chat record](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L456-L468)).

### Notes
- Authored 2025-10-24 alongside the graph snapshot tooling; initial version exposed filters for kinds, depth, and output format plus exit-code guards when the SQLite cache is missing ([initial rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L456-L468)).
- Refined 2025-10-30 to export `parseArgs`, `printResult`, and `main` so the implementation matched its Layer-4 documentation and remained script/test friendly ([export alignment](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L3738-L3750)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.418Z","inputHash":"d2d45151c825f16f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/graph-tools/inspect-symbol.ts#L42)
- Returns: `ParsedArgs`

#### `printResult` {#symbol-printresult}
- Type: function
- Source: [source](../../../../scripts/graph-tools/inspect-symbol.ts#L233)
- Parameters: `options`: `ParsedArgs`

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/graph-tools/inspect-symbol.ts#L259)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `pathToFileURL`
- [`symbolNeighbors.inspectSymbolNeighbors`](../../packages/server/src/features/dependencies/symbolNeighbors.ts.mdmd.md#symbol-inspectsymbolneighbors)
- [`index.GraphStore`](../../packages/shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../packages/shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkRelationshipKind`](../../packages/shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.SymbolNeighborGroup`](../../packages/shared/src/index.ts.mdmd.md#symbol-symbolneighborgroup)
<!-- LIVE-DOC:END Dependencies -->
