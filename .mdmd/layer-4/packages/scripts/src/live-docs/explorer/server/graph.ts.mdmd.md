# packages/scripts/src/live-docs/explorer/server/graph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/server/graph.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-server-graph-ts
- Generated At: 2026-02-18T21:27:51.992Z

## Authored
### Purpose
Transforms the raw `LiveDocGraph` into an `ExplorerGraphPayload` enriched with inheritance links, type references, and resolved symbol documentation for the Explorer client.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Performs inheritance detection by parsing `extends`/`implements` clauses from Public Symbols sections.
- Extended in December 2025 to build `publicSymbolsExtended` with type-reference metadata for Local Map rendering.
- Contains the barrel-file deprioritisation heuristic (`isBarrelFile`) to prefer origin files for inheritance links.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.992Z","inputHash":"431f5fad76693150"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildExplorerGraph` {#symbol-buildexplorergraph}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/graph.ts#L39)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `buildExplorerGraph` — Summary
Builds the full Explorer graph payload from the Live Doc graph,
including nodes, dependency/inheritance links, and statistics.

#### `normalizeDocPath` {#symbol-normalizedocpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/graph.ts#L171)

##### `normalizeDocPath` — Summary
Resolves a doc-relative path to an absolute, normalised file-system path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
- [`LiveDocGraph`](../../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)
- [`liveDocGraph.LiveDocGraphNode`](../../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode)
- [`liveDocGraph.buildLiveDocGraph`](../../graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraph)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`coreUtils.isBarrelFilePath`](../../../../../shared/src/live-docs/coreUtils.ts.mdmd.md#symbol-isbarrelfilepath)
- [`parse.ParsedTypeReference`](../../../../../shared/src/live-docs/parse.ts.mdmd.md#symbol-parsedtypereference) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
