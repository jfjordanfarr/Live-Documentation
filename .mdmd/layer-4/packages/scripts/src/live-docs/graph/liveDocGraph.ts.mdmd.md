# packages/scripts/src/live-docs/graph/liveDocGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/graph/liveDocGraph.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-graph-livedocgraph-ts
- Generated At: 2025-12-05T15:37:23.213Z

## Authored
### Purpose
Builds an in-memory graph of Live Documentation by parsing all `.mdmd.md` files in the workspace. Powers the Explorer visualization and the `live-docs inspect` CLI.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 during the `packages/scripts` package scaffold.
- Returns a `LiveDocGraph` with `nodes`, `inbound` adjacency map, and `docToCode` lookup for resolving dependencies.
- The `rawDependencies` field preserves structured `ParsedDependency` objects to enable symbol-level connection rendering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:23.213Z","inputHash":"1f9fdb8d157a6811"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGraphNode` {#symbol-livedocgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L17)

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L27)

#### `BuildLiveDocGraphOptions` {#symbol-buildlivedocgraphoptions}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L33)

#### `buildLiveDocGraph` {#symbol-buildlivedocgraph}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L47)
- Parameters: `options`: [`BuildLiveDocGraphOptions`](../../index.ts.mdmd.md#symbol-buildlivedocgraphoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LIVE_DOCUMENTATION_FILE_EXTENSION`, `LiveDocumentationConfig`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/live-docs/parse` - `ParsedDependency`, `ParsedSymbolDocumentationEntry`, `parseLiveDocMarkdown`
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
