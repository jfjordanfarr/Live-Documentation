# packages/scripts/src/live-docs/graph/liveDocGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/graph/liveDocGraph.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-graph-livedocgraph-ts
- Generated At: 2026-02-23T21:32:12.783Z

## Authored
### Purpose
Builds an in-memory graph of Live Documentation by parsing all `.mdmd.md` files in the workspace. Powers the Explorer visualization and the `live-docs inspect` CLI.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 during the `packages/scripts` package scaffold.
- Returns a `LiveDocGraph` with `nodes`, `inbound` adjacency map, and `docToCode` lookup for resolving dependencies.
- The `rawDependencies` field preserves structured `ParsedDependency` objects to enable symbol-level connection rendering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T21:32:12.783Z","inputHash":"9292ce3f3866681b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGraphNode` {#symbol-livedocgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L25)

##### `LiveDocGraphNode` — Summary
A single node in the Live Doc dependency graph, representing one tracked
workspace artifact and its extracted metadata.

Nodes are keyed by `codePath` (workspace-relative source path) and carry
resolved dependency edges, public symbol names, and per-symbol documentation
extracted from the corresponding Live Doc file.

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L46)

##### `LiveDocGraph` — Summary
The complete Live Documentation dependency graph.

Built by {@link buildLiveDocGraph}, this structure powers the Explorer
visualizations (Circuit Board, Force Graph, Local Map), the `inspect`
pathfinder CLI, and the lint disconnected-node check.

- `nodes` — forward lookup by source path.
- `inbound` — reverse index: for a given target, which sources depend on it.
- `docToCode` — maps Live Doc paths back to their source paths.

#### `BuildLiveDocGraphOptions` {#symbol-buildlivedocgraphoptions}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L59)

##### `BuildLiveDocGraphOptions` — Summary
Options accepted by {@link buildLiveDocGraph}.

##### `BuildLiveDocGraphOptions` — Additional Documentation
- @property config - Optional resolved Live Docs config; defaults to
{@link DEFAULT_LIVE_DOCUMENTATION_CONFIG} if omitted.
- @property workspaceRoot - Absolute path to the workspace root directory.

#### `buildLiveDocGraph` {#symbol-buildlivedocgraph}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L85)
- Parameters: `options`: [`BuildLiveDocGraphOptions`](../../index.ts.mdmd.md#symbol-buildlivedocgraphoptions)

##### `buildLiveDocGraph` — Summary
Scans all staged Live Doc markdown files, parses their `Dependencies` and
`Public Symbols` sections, and assembles a complete dependency graph.

The resulting {@link LiveDocGraph} is consumed by the Explorer server/static
builder, the `inspect` CLI pathfinder, and the lint pipeline's disconnected-
node check.

##### `buildLiveDocGraph` — Parameters
- `options`: Workspace root and optional config overrides.

##### `buildLiveDocGraph` — Returns
A fully-resolved graph with forward edges, reverse (inbound) index,
and doc-to-code path mapping.
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
