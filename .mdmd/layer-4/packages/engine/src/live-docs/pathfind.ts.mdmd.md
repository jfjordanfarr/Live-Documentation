# packages/engine/src/live-docs/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/pathfind.ts
- Generated At: 2026-10-14T21:04:58.029Z

## Authored
### Purpose
Pathfinding over the graph index: one breadth-first walk over a neighbour function, and what the CLI and the Explorer ask of it: the shortest path between files, every file a path reaches and how far, the same search by symbol, and the enumeration of every terminal path away from a file. Pure functions: the CLI feeds the walk the graph's edges, the Explorer the links the Local Map draws.

### Notes
- Gathered here on 2026-09-28 from the three pathfinding modules that lived beside the Explorer in `packages/scripts`; the searches were extracted from the inspect CLI on 2025-12-19. They are engine code because the Explorer client's own pathfinding (`client/pathfind.ts`) did the same job over a different shape. Since 2026-10-14 ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)) the walk is the one implementation under both, on the owner's condition that "only one pure implementation should underlie both": `searchGraph` is a wrapper over `walk` that keeps the CLI's frontier and visited set as they were, and the client reads its links through `walk` and `reachFrom`.
- A walk ends at the first target taken from the queue, a start among the targets at once, which is the CLI's reading: a file is its own zero-hop path. The Explorer leaves its starts out of the targets, since there a file in both sets is not its own path. `reachFrom` lists every file reached with the fewest hops to it, the starts left out.
- `getNeighbors`, the terminal paths and the symbol search take one way. "both" had read as inbound in the neighbour function, so a fan-out asked both ways silently listed the inbound paths (found 2026-10-14); the CLI answers "both" by two searches, and refuses it for a fan-out.
- A symbol-level hop follows an edge by anchor at both ends (`from` and `toSymbol`), so a multi-hop symbol path stays on symbols across files; without a symbol, the file-level neighbours are added as well.
- An outbound search that finds nothing also reports what could not be followed: the dependencies that resolved to no file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Direction` {#symbol-direction}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L17)

##### `Direction` — Summary
Traversal direction for graph searches.

#### `OneWay` {#symbol-oneway}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L20)

##### `OneWay` — Summary
One way through the graph: outbound follows what a file depends on, inbound what depends on it.

#### `Neighbours` {#symbol-neighbours}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L23)
- Returns: `Iterable`

##### `Neighbours` — Summary
The files one step from a file, in the direction of a walk.

#### `WalkStop` {#symbol-walkstop}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L26)

##### `WalkStop` — Summary
A file the walk did not go on from: nothing new lay beyond it, or it stood at the depth limit.

#### `Walk (interface)` {#symbol-walk-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L32)

##### `Walk (interface)` — Summary
What one breadth-first walk from a set of files found.

#### `walk (function)` {#symbol-walk-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L50)
- Returns: [`Walk`](#symbol-walk-interface)
- Parameters: `starts`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours); `targets`: `ReadonlySet`

##### `walk (function)` — Summary
Walks breadth-first from a set of files along the neighbours given: every
start at depth 0, each file visited once. A target is recognised as it is
taken from the queue, a start among the targets at once, and the walk ends
at the first. A file at the depth limit is not expanded and is a `max-depth`
stop; a file with nothing new beyond it is a `terminal` stop.

#### `pathTo` {#symbol-pathto}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L97)
- Parameters: `found`: [`Walk`](#symbol-walk-interface)

##### `pathTo` — Summary
The files from a start of the walk to a file it reached, the start first.

#### `reachFrom` {#symbol-reachfrom}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L106)
- Parameters: `starts`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours)

##### `reachFrom` — Summary
Every file a path reaches from the starts, with the fewest hops to it; the starts themselves are not listed.

#### `FrontierEntry` {#symbol-frontierentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L116)

##### `FrontierEntry` — Summary
Entry in the search frontier, representing a node that couldn't be explored further.

#### `PathSearchResult` {#symbol-pathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L124)

##### `PathSearchResult` — Summary
Result of a file-level path search.

#### `FanoutPath` {#symbol-fanoutpath}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L131)

##### `FanoutPath` — Summary
A terminal path in fanout enumeration.

#### `SymbolReference` {#symbol-symbolreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L136)

##### `SymbolReference` — Summary
A reference that may include a symbol (e.g., "file.ts#SymbolName").

#### `SymbolHop` {#symbol-symbolhop}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L142)

##### `SymbolHop` — Summary
A node in a symbol-aware path, tracking both file and symbol at each hop.

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L148)

##### `SymbolPathSearchResult` — Summary
Result of a symbol-aware path search.

#### `MAX_ENUMERATED_PATHS` {#symbol-max_enumerated_paths}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L154)

##### `MAX_ENUMERATED_PATHS` — Summary
Maximum number of paths to enumerate to avoid combinatorial explosion.

#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L172)
- Returns: [`PathSearchResult`](#symbol-pathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`OneWay`](#symbol-oneway)

##### `searchGraph` — Summary
The shortest path from one file to another, by the walk, with the frontier
the CLI reports when there is none: where the walk stopped and why, and, on
an outbound search, the dependencies that resolved to no file.

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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L224)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`OneWay`](#symbol-oneway)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L244)
- Returns: [`FanoutPath`](#symbol-fanoutpath)[]
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`OneWay`](#symbol-oneway)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L291)
- Returns: [`SymbolPathSearchResult`](#symbol-symbolpathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `from`: [`SymbolReference`](#symbol-symbolreference); `to`: [`SymbolReference`](#symbol-symbolreference); `direction`: [`OneWay`](#symbol-oneway)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L389)

##### `symbolMatchesAnchor` — Summary
Whether a symbol name or anchor matches an anchor slug: exactly, or by name
once the `symbol-` prefix is removed and case ignored.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
