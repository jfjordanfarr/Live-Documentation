# packages/scripts/src/live-docs/explorer/shared/graph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/graph.ts
- Generated At: 2026-09-27T23:21:29.413Z

## Authored
### Purpose

Builds the `ExplorerGraphPayload` from the Live Doc graph — the canonical JSON data structure that powers all Explorer views. Walks every `LiveDocGraphNode`, extracts public symbols, dependency links, archetype metadata, and graph-wide statistics, producing the self-contained payload embedded in the static bundle.

### Notes

- Created [2025-11-22](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as `server/graph.ts` during initial Explorer scaffolding (`f1e2dec0`).
- Relocated from `server/` to `shared/` on [2026-03-09](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during server retirement — this file was always a build-time graph transformer, not server runtime code.
- `normalizeDocPath` is the single path-resolution function shared between graph construction and static output; keeping it colocated prevents divergence.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildExplorerGraph` {#symbol-buildexplorergraph}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/graph.ts#L25)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `buildExplorerGraph` — Summary
Builds the full Explorer graph payload from the Live Doc graph,
including nodes, dependency/inheritance links, and statistics.

#### `normalizeDocPath` {#symbol-normalizedocpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/graph.ts#L156)

##### `normalizeDocPath` — Summary
Resolves a doc-relative path to an absolute, normalised file-system path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](./types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](./types.ts.mdmd.md#symbol-explorertypereference) (type-only)
- [`LiveDocGraph`](../../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)
- [`liveDocGraph.LiveDocGraphNode`](../../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode)
- [`liveDocGraph.ParsedTypeReference`](../../graph/liveDocGraph.ts.mdmd.md#symbol-parsedtypereference)
- [`liveDocGraph.buildLiveDocGraph`](../../graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraph)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
