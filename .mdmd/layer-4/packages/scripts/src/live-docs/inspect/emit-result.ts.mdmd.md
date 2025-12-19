# packages/scripts/src/live-docs/inspect/emit-result.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/emit-result.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-emit-result-ts
- Generated At: 2025-12-19T21:55:44.620Z

## Authored
### Purpose
Formats and outputs file-level pathfinding results for the inspect CLI. Handles markdown table rendering, JSON output, and human-readable summaries for paths between Live Doc nodes.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). This module focuses on file-level output; symbol-level output is handled by emit-result-symbol.ts, and bidirectional results by emit-result-dual.ts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.620Z","inputHash":"a06b354d49059a24"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `emitPathResult` {#symbol-emitpathresult}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result.ts#L25)
- Parameters: `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

##### `emitPathResult` — Summary
Emits a successful path result.

##### `emitPathResult` — Parameters
- `direction`: Traversal direction used
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `pathNodes`: Array of node IDs in the path
- `verbose`: If true, include symbol details

#### `emitNotFound` {#symbol-emitnotfound}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result.ts#L78)
- Parameters: `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph); `result`: [`PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult)

##### `emitNotFound` — Summary
Emits a "path not found" result with frontier information.

##### `emitNotFound` — Parameters
- `direction`: Traversal direction used
- `from`: Source node code path
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `result`: The search result with frontier information
- `to`: Target node code path
- `verbose`: If true, include symbol details

#### `emitFanoutResult` {#symbol-emitfanoutresult}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result.ts#L128)
- Parameters: `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction); `fanout`: [`FanoutPath`](./types.ts.mdmd.md#symbol-fanoutpath)[]; `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

##### `emitFanoutResult` — Summary
Emits fanout (terminal paths) result.

##### `emitFanoutResult` — Parameters
- `direction`: Traversal direction used
- `fanout`: Array of terminal paths
- `from`: Source node code path
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `maxDepth`: Maximum depth used
- `verbose`: If true, include symbol details
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocGraph.LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`describe-node.describeNode`](./describe-node.ts.mdmd.md#symbol-describenode)
- [`pathfind-fanout.MAX_ENUMERATED_PATHS`](./pathfind-fanout.ts.mdmd.md#symbol-max_enumerated_paths)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.FanoutPath`](./types.ts.mdmd.md#symbol-fanoutpath) (type-only)
- [`types.HopDescriptor`](./types.ts.mdmd.md#symbol-hopdescriptor) (type-only)
- [`types.PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->
