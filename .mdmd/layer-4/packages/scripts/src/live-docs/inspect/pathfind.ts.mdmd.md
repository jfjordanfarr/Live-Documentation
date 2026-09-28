# packages/scripts/src/live-docs/inspect/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/pathfind.ts
- Generated At: 2026-09-28T01:00:43.350Z

## Authored
### Purpose
Implements the breadth-first search for the shortest path between two files of the graph, the pathfinding that answers how artifact A reaches artifact B through the dependency graph.

### Notes
- Extracted from inspect.ts on 2025-12-19. `searchGraph()` walks a file's `outbound` or `inbound` list from the graph index; symbol-level pathfinding is in pathfind-symbol.ts.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L24)
- Returns: [`PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

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
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L105)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `getNeighbors` — Summary
Gets the neighbors of a node based on traversal direction.

##### `getNeighbors` — Parameters
- `direction`: "outbound" for dependencies, "inbound" for dependents
- `graph`: The Live Doc graph
- `node`: The node to get neighbors for

##### `getNeighbors` — Returns
The neighbouring code paths

#### `reconstructPath` {#symbol-reconstructpath}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind.ts#L125)

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
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.FrontierEntry`](./types.ts.mdmd.md#symbol-frontierentry) (type-only)
- [`types.PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->
