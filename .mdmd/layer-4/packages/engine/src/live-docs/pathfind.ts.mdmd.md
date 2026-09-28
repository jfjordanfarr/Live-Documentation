# packages/engine/src/live-docs/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/pathfind.ts
- Generated At: 2026-09-28T01:11:42.634Z

## Authored
### Purpose
Pathfinding over the graph index: the breadth-first search for the shortest path between two files, the same search by symbol, and the enumeration of every terminal path away from a file. Pure functions over a `LiveDocGraph`, for the CLI and the Explorer alike.

### Notes
- Gathered here on 2026-09-28 from the three pathfinding modules that lived beside the Explorer in `packages/scripts`; the searches were extracted from the inspect CLI on 2025-12-19. They are engine code because the Explorer client's own pathfinding (`client/pathfind.ts`) does the same job over a different shape and should read the graph through these next.
- A symbol-level hop follows an edge by anchor at both ends (`from` and `toSymbol`), so a multi-hop symbol path stays on symbols across files; without a symbol, the file-level neighbours are added as well.
- An outbound search that finds nothing also reports what could not be followed: the dependencies that resolved to no file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Direction` {#symbol-direction}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L16)

##### `Direction` — Summary
Traversal direction for graph searches.

#### `FrontierEntry` {#symbol-frontierentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L19)

##### `FrontierEntry` — Summary
Entry in the search frontier, representing a node that couldn't be explored further.

#### `PathSearchResult` {#symbol-pathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L27)

##### `PathSearchResult` — Summary
Result of a file-level path search.

#### `FanoutPath` {#symbol-fanoutpath}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L34)

##### `FanoutPath` — Summary
A terminal path in fanout enumeration.

#### `SymbolReference` {#symbol-symbolreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L39)

##### `SymbolReference` — Summary
A reference that may include a symbol (e.g., "file.ts#SymbolName").

#### `SymbolHop` {#symbol-symbolhop}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L45)

##### `SymbolHop` — Summary
A node in a symbol-aware path, tracking both file and symbol at each hop.

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L51)

##### `SymbolPathSearchResult` — Summary
Result of a symbol-aware path search.

#### `MAX_ENUMERATED_PATHS` {#symbol-max_enumerated_paths}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L57)

##### `MAX_ENUMERATED_PATHS` — Summary
Maximum number of paths to enumerate to avoid combinatorial explosion.

#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L73)
- Returns: [`PathSearchResult`](#symbol-pathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](#symbol-direction)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L153)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](#symbol-direction)

##### `getNeighbors` — Summary
Gets the neighbors of a node based on traversal direction.

##### `getNeighbors` — Parameters
- `direction`: "outbound" for dependencies, "inbound" for dependents
- `graph`: The Live Doc graph
- `node`: The node to get neighbors for

##### `getNeighbors` — Returns
The neighbouring code paths

#### `enumerateTerminalPaths` {#symbol-enumerateterminalpaths}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L187)
- Returns: [`FanoutPath`](#symbol-fanoutpath)[]
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`Direction`](#symbol-direction)

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

#### `searchSymbolPath` {#symbol-searchsymbolpath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L233)
- Returns: [`SymbolPathSearchResult`](#symbol-symbolpathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `from`: [`SymbolReference`](#symbol-symbolreference); `to`: [`SymbolReference`](#symbol-symbolreference); `direction`: [`Direction`](#symbol-direction)

##### `searchSymbolPath` — Summary
Symbol-aware path search using BFS.

When both from and to have symbols, finds a path where the first hop
originates from the fromSymbol (the edge's `from`) and the last hop arrives
at the toSymbol (the edge's `toSymbol`), following the graph's edges by
symbol anchor at both ends.

##### `searchSymbolPath` — Parameters
- `direction`: "outbound" or "inbound"
- `from`: Source symbol reference
- `graph`: The Live Doc graph
- `maxDepth`: Maximum traversal depth
- `to`: Target symbol reference

##### `searchSymbolPath` — Returns
Search result with path and found status

#### `symbolMatchesAnchor` {#symbol-symbolmatchesanchor}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L331)

##### `symbolMatchesAnchor` — Summary
Whether a symbol name or anchor matches an anchor slug: exactly, or by name
once the `symbol-` prefix is removed and case ignored.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
