# packages/scripts/src/live-docs/inspect/pathfind-fanout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/pathfind-fanout.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-pathfind-fanout-ts
- Generated At: 2026-02-03T21:55:37.337Z

## Authored
### Purpose
Enumerates all terminal paths from a starting node when no destination is specified. Used for "what does this file ultimately impact?" queries where the user wants to see the full downstream fanout.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). The `enumerateTerminalPaths()` function walks the graph to leaf nodes, useful for understanding the blast radius of changes to foundational utilities.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.337Z","inputHash":"cab63dc7cfdee509"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MAX_ENUMERATED_PATHS` {#symbol-max_enumerated_paths}
- Type: const
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind-fanout.ts#L18)

##### `MAX_ENUMERATED_PATHS` — Summary
Maximum number of paths to enumerate to avoid combinatorial explosion.

#### `enumerateTerminalPaths` {#symbol-enumerateterminalpaths}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind-fanout.ts#L32)
- Returns: [`FanoutPath`](./types.ts.mdmd.md#symbol-fanoutpath)[]
- Parameters: `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `enumerateTerminalPaths` — Summary
Enumerates all paths from a source node to terminal nodes.

A terminal node is one that has no neighbors in the specified direction,
or the path has reached the maximum depth.

##### `enumerateTerminalPaths` — Parameters
- `direction`: Traversal direction
- `graph`: The Live Doc graph
- `maxDepth`: Maximum traversal depth
- `start`: Starting node code path

##### `enumerateTerminalPaths` — Returns
Array of terminal paths (limited to MAX_ENUMERATED_PATHS)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.getNeighbors`](./pathfind.ts.mdmd.md#symbol-getneighbors)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.FanoutPath`](./types.ts.mdmd.md#symbol-fanoutpath) (type-only)
<!-- LIVE-DOC:END Dependencies -->
