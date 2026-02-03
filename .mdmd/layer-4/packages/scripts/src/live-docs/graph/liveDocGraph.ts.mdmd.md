# packages/scripts/src/live-docs/graph/liveDocGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/graph/liveDocGraph.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-graph-livedocgraph-ts
- Generated At: 2026-02-03T21:55:37.194Z

## Authored
### Purpose
Builds an in-memory graph of Live Documentation by parsing all `.mdmd.md` files in the workspace. Powers the Explorer visualization and the `live-docs inspect` CLI.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 during the `packages/scripts` package scaffold.
- Returns a `LiveDocGraph` with `nodes`, `inbound` adjacency map, and `docToCode` lookup for resolving dependencies.
- The `rawDependencies` field preserves structured `ParsedDependency` objects to enable symbol-level connection rendering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.194Z","inputHash":"d20acf78734d6648"}]} -->
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
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`parse.ParsedDependency`](../../../../shared/src/live-docs/parse.ts.mdmd.md#symbol-parseddependency)
- [`parse.ParsedSymbolDocumentationEntry`](../../../../shared/src/live-docs/parse.ts.mdmd.md#symbol-parsedsymboldocumentationentry)
- [`parse.parseLiveDocMarkdown`](../../../../shared/src/live-docs/parse.ts.mdmd.md#symbol-parselivedocmarkdown)
<!-- LIVE-DOC:END Dependencies -->
