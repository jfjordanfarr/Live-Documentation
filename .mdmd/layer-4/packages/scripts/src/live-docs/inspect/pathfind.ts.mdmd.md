# packages/scripts/src/live-docs/inspect/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/pathfind.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-pathfind-ts
- Generated At: 2026-02-03T21:55:37.375Z

## Authored
### Purpose
Implements the core BFS/DFS graph traversal for finding shortest paths between Live Doc nodes. This is the "Oracle of Bacon" style pathfinding that answers "how does artifact A reach artifact B through the dependency graph?"

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). The `searchGraph()` function is the workhorse for file-level pathfinding. Symbol-level pathfinding is handled by pathfind-symbol.ts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.375Z","inputHash":"ade8cae2a46058b5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L24)
- Returns: [`PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `searchGraph` — Summary
Performs a BFS search from a source node to a target node.

##### `searchGraph` — Parameters
- `direction`: "outbound" follows dependencies, "inbound" follows dependents
- `from`: Source node code path
- `graph`: The Live Doc graph
- `maxDepth`: Maximum traversal depth
- `to`: Target node code path

##### `searchGraph` — Returns
Search result with path (if found), visited nodes, and frontier

#### `getNeighbors` {#symbol-getneighbors}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L107)
- Parameters: `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `getNeighbors` — Summary
Gets the neighbors of a node based on traversal direction.

##### `getNeighbors` — Parameters
- `direction`: "outbound" for dependencies, "inbound" for dependents
- `graph`: The Live Doc graph
- `node`: The node to get neighbors for

##### `getNeighbors` — Returns
Set of neighbor node code paths

#### `reconstructPath` {#symbol-reconstructpath}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L126)

##### `reconstructPath` — Summary
Reconstructs a path from the parent map built during BFS.

##### `reconstructPath` — Parameters
- `parents`: Map from node to its parent in the BFS tree
- `start`: Start node
- `target`: End node

##### `reconstructPath` — Returns
Array of node IDs from start to target
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.FrontierEntry`](./types.ts.mdmd.md#symbol-frontierentry) (type-only)
- [`types.PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->
