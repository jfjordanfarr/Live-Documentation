# packages/scripts/src/live-docs/graph/liveDocGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/graph/liveDocGraph.ts
- Generated At: 2026-09-27T23:21:29.676Z

## Authored
### Purpose
Builds an in-memory graph of Live Documentation by reading every doc through the grammar. Powers the Explorer visualization, the `live-docs:inspect` CLI and the lint connectivity check.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 during the `packages/scripts` package scaffold.
- Returns a `LiveDocGraph` with `nodes`, `inbound` adjacency map, and `docToCode` lookup for resolving dependencies.
- The `rawDependencies` field preserves structured `ParsedDependency` objects to enable symbol-level connection rendering.
- Since 2026-09-27 the docs are read with `parseLiveDoc`; a doc the grammar refuses stops the build with its path and line. The node shape (`rawDependencies`, `symbolDocumentation`, `publicSymbols`) is derived from the model and kept as the Explorer and `inspect` expect it until they read the derived index.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ParsedTypeReference` {#symbol-parsedtypereference}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L23)

##### `ParsedTypeReference` — Summary
A type reference of a public symbol, as the graph's consumers read it.

#### `ParsedSymbolDocumentationEntry` {#symbol-parsedsymboldocumentationentry}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L39)

##### `ParsedSymbolDocumentationEntry` — Summary
Documentation of a public symbol, as the graph's consumers read it.

#### `ParsedDependency` {#symbol-parseddependency}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L47)

##### `ParsedDependency` — Summary
A single dependency edge as the graph's consumers read it.

#### `LiveDocGraphNode` {#symbol-livedocgraphnode}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L67)

##### `LiveDocGraphNode` — Summary
A single node in the Live Doc dependency graph, representing one tracked
workspace artifact and its extracted metadata.

Nodes are keyed by `codePath` (workspace-relative source path) and carry
resolved dependency edges, public symbol names, and per-symbol documentation
extracted from the corresponding Live Doc file.

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L87)

##### `LiveDocGraph` — Summary
The complete Live Documentation dependency graph.

Built by {@link buildLiveDocGraph}, this structure powers the Explorer
visualizations, the `inspect` pathfinder CLI, and the lint disconnected-node check.

- `nodes` — forward lookup by source path.
- `inbound` — reverse index: for a given target, which sources depend on it.
- `docToCode` — maps Live Doc paths back to their source paths.

#### `BuildLiveDocGraphOptions` {#symbol-buildlivedocgraphoptions}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L100)

##### `BuildLiveDocGraphOptions` — Summary
Options accepted by {@link buildLiveDocGraph}.

##### `BuildLiveDocGraphOptions` — Additional Documentation
- @property config - Optional resolved Live Docs config; defaults to
{@link DEFAULT_LIVE_DOCUMENTATION_CONFIG} if omitted.
- @property workspaceRoot - Absolute path to the workspace root directory.

#### `buildLiveDocGraph` {#symbol-buildlivedocgraph}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/graph/liveDocGraph.ts#L121)
- Parameters: `options`: [`BuildLiveDocGraphOptions`](../../index.ts.mdmd.md#symbol-buildlivedocgraphoptions)

##### `buildLiveDocGraph` — Summary
Reads every Live Doc under the configured root and assembles the dependency graph.

A doc that the grammar refuses stops the build with its path and line, since
a doc no one may hand-edit can only be malformed by a generator bug.

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
- [`document.LiveDoc`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.SymbolBlock`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-symbolblock)
- [`document.TypeRef`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-typeref)
- [`document.linkTarget`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-linktarget-function)
- [`document.parseLiveDoc`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
<!-- LIVE-DOC:END Dependencies -->
