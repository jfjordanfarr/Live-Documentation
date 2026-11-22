# `packages/engine/src/live-docs/pathfind.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/pathfind.ts`
- Generated At: 2026-11-22T05:46:12.606Z

## Authored
### Purpose
Pathfinding over the graph index: one breadth-first walk over a neighbour function, and what the CLI and the Explorer ask of it: the shortest path between files, every file a path reaches and how far, the same search by symbol, the enumeration of every terminal path away from a file, what the graph's entry points reach, and the disconnected groups the files fall into. Pure functions: the CLI feeds the walk the graph's edges, the Explorer the links the Local Map draws.

### Notes
- Gathered here on 2026-09-28 from the three pathfinding modules that lived beside the Explorer in `packages/scripts`; the searches were extracted from the inspect CLI on 2025-12-19. They are engine code because the Explorer client's own pathfinding (`client/pathfind.ts`) did the same job over a different shape. Since 2026-10-14 ([Turn 7](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-7); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)) the walk is the one implementation under both, on the owner's condition that "only one pure implementation should underlie both": `searchGraph` is a wrapper over `walk` that keeps the CLI's frontier and visited set as they were, and the client reads its links through `walk` and `reachFrom`.
- A walk ends at the first target taken from the queue, a start among the targets at once, which is the CLI's reading: a file is its own zero-hop path. The Explorer leaves its starts out of the targets, since there a file in both sets is not its own path. `reachFrom` lists every file reached with the fewest hops to it, the starts left out.
- `getNeighbors`, the terminal paths and the symbol search take one way. "both" had read as inbound in the neighbour function, so a fan-out asked both ways silently listed the inbound paths (found 2026-10-14); the CLI answers "both" by two searches, and refuses it for a fan-out.
- A symbol-level hop follows an edge by anchor at both ends (`from` and `toSymbol`), so a multi-hop symbol path stays on symbols across files; without a symbol, the file-level neighbours are added as well.
- An outbound search that finds nothing also reports what could not be followed: the dependencies that resolved to no file.
- `isEntry` and `reachability` (2026-10-15, [Turn 4](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)): the walk from the docs' entry points, a file with an `Entry` line or a test, or from the files asked for, along what each depends on, with the files no start reaches and, from the entries, a second walk from the entries that are not tests so that what only a test reaches is told apart. `inspect --reachable` without `--from` and the Knowledge Sources panel share it, and the panel's JSON export is the same object.
- Since 2026-10-17 (C9 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)) `reachability` takes the predicate that names the entries, `isEntry` by default: `inspect --at` walks a past commit's graph, made from the history's shape, whose files carry entry marks and no Entry lines, and passes the marks.
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)) `reachability` lists a file no path reaches whose kind no reader handles as `unread`, apart from `unreachable`: once every file got a doc, a CI workflow, a shell script or a solution file had no wires only because nothing reads them yet, and calling them unreachable would have called them dead code. A file no reader handles that a path does reach, or that is an entry, is reached or a start like any other. The rule is `noReaderHandles` in the configuration module, which has no imports, so the Explorer client walks by it too.
- `components` and `fileGroups` (2026-11-02, the owner's ask that the disconnected groups be findable, which only the 3D view had computed): `components` partitions ids into connected components over a neighbour function, each with its seed, the member with the most distinct neighbours, ties by id ascending, largest first and then by seed, so the answer is the same on every machine and for the ids in any order. A link joins its two ends whichever end names it, so a one-way neighbour function gives the same groups as a two-way one; a neighbour outside the ids and a self-link are ignored. `fileGroups` is the one computation over a graph's dependencies: the groups of two or more with their sizes and members, and the files joined to none. `inspect --groups` prints it and the Knowledge Sources panel lists it; its JSON is the CLI's `--json` and the panel's export alike. The ask and the owner's answers are in [Turns 2 to 4 of the November 2 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-02/2026-11-02.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Direction` {#symbol-direction}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L20)

##### `Direction` — Summary
Traversal direction for graph searches.

#### `OneWay` {#symbol-oneway}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L23)

##### `OneWay` — Summary
One way through the graph: outbound follows what a file depends on, inbound what depends on it.

#### `Neighbours` {#symbol-neighbours}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L26)
- Returns: `Iterable`

##### `Neighbours` — Summary
The files one step from a file, in the direction of a walk.

#### `WalkStop` {#symbol-walkstop}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L29)

##### `WalkStop` — Summary
A file the walk did not go on from: nothing new lay beyond it, or it stood at the depth limit.

#### `Walk (interface)` {#symbol-walk-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L35)

##### `Walk (interface)` — Summary
What one breadth-first walk from a set of files found.

#### `walk (function)` {#symbol-walk-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L53)
- Returns: [`Walk`](#symbol-walk-interface)
- Parameters: `starts`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours); `targets`: `ReadonlySet`

##### `walk (function)` — Summary
Walks breadth-first from a set of files along the neighbours given: every
start at depth 0, each file visited once. A target is recognised as it is
taken from the queue, a start among the targets at once, and the walk ends
at the first. A file at the depth limit is not expanded and is a `max-depth`
stop; a file with nothing new beyond it is a `terminal` stop.

#### `walkBetween` {#symbol-walkbetween}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L104)
- Returns: [`Walk`](#symbol-walk-interface)
- Parameters: `starts`: `Iterable`; `targets`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours)

##### `walkBetween` — Summary
The walk from one set of files to another, as a path between two ends is asked on either surface: an end is one
file or every file under a directory (see {@link under}), and a file in both sets is not its own path, so the starts
are never targets. The Explorer's path and the command line's both walk through here (2026-11-22).

#### `under` {#symbol-under}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L114)

##### `under` — Summary
Whether a path is the directory or stands under it; the scan root, "", holds everything. The files a directory
stands for as the end of a path, on the page and at the command line (moved here from the Explorer on 2026-11-22,
so that both read one rule).

#### `pathTo` {#symbol-pathto}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L118)
- Parameters: `found`: [`Walk`](#symbol-walk-interface)

##### `pathTo` — Summary
The files from a start of the walk to a file it reached, the start first.

#### `reachFrom` {#symbol-reachfrom}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L127)
- Parameters: `starts`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours)

##### `reachFrom` — Summary
Every file a path reaches from the starts, with the fewest hops to it; the starts themselves are not listed.

#### `isEntry` {#symbol-isentry}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L141)
- Parameters: `file`: [`GraphFile`](./graph.ts.mdmd.md#symbol-graphfile)

##### `isEntry` — Summary
True when something outside the code starts the file: its doc carries an Entry line, or it is a test, which a runner starts.

#### `Start` {#symbol-start}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L146)

##### `Start` — Summary
A file a reachability walk starts from: an entry of the docs with its lines, or a file asked for.

#### `Reachability (interface)` {#symbol-reachability-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L154)

##### `Reachability (interface)` — Summary
What is reachable along dependencies from the graph's entry points, or from the files asked for.

#### `reachability (function)` {#symbol-reachability-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L187)
- Returns: [`Reachability`](#symbol-reachability-interface)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `file`: [`GraphFile`](./graph.ts.mdmd.md#symbol-graphfile)

##### `reachability (function)` — Summary
Walks from the graph's entry points, or from the files asked for, along what
each depends on: one walk from every start, and, from the entries, a second
from the entries that are not tests, so that what only a test reaches is told
apart. A file asked for that the graph does not hold is left out. A file no
path reaches whose kind no reader handles is listed as not read, apart from
the unreachable: a workflow or a shell script is not dead code because
nothing yet reads its wires.

##### `reachability (function)` — Parameters
- `asked`: The files to walk from; the graph's entry points when absent.
- `entry`: Which files are entry points: by default {@link isEntry}; a graph that carries entry marks without their Entry lines, as a past change's shape does, names its own.
- `graph`: The graph to walk.
- `maxDepth`: The most hops a path takes.

#### `Component` {#symbol-component}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L220)

##### `Component` — Summary
One connected component: files each joined to every other by some chain of links, whichever way each link runs.

#### `components` {#symbol-components}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L236)
- Returns: [`Component`](#symbol-component)[]
- Parameters: `ids`: `Iterable`; `neighbours`: [`Neighbours`](#symbol-neighbours)

##### `components` — Summary
Partitions ids into connected components over the neighbours given. A link
joins its two ends whichever end names it, so a one-way neighbour function
gives the same groups as one that runs both ways, and the result does not
depend on the order of the ids. A neighbour outside the ids, or an id named
as its own neighbour, is ignored; a file with no link is a component of one.
The components come largest first, then by seed; the seed is chosen by
{@link Component.seed}'s rule, so that it is the same on every machine.

#### `FileGroups (interface)` {#symbol-filegroups-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L267)

##### `FileGroups (interface)` — Summary
A graph's files as its disconnected groups: the groups of two or more, and the files joined to none.

#### `fileGroups (function)` {#symbol-filegroups-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L279)
- Returns: [`FileGroups`](#symbol-filegroups-interface)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)

##### `fileGroups (function)` — Summary
The disconnected groups of a graph's files over their dependencies, either
way: what `inspect --groups` prints and the Knowledge Sources panel lists,
so that the two give one answer.

#### `FrontierEntry` {#symbol-frontierentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L288)

##### `FrontierEntry` — Summary
Entry in the search frontier, representing a node that couldn't be explored further.

#### `PathSearchResult` {#symbol-pathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L296)

##### `PathSearchResult` — Summary
Result of a file-level path search.

#### `SymbolReference` {#symbol-symbolreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L303)

##### `SymbolReference` — Summary
A reference that may include a symbol (e.g., "file.ts#SymbolName").

#### `SymbolHop` {#symbol-symbolhop}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L309)

##### `SymbolHop` — Summary
A node in a symbol-aware path, tracking both file and symbol at each hop.

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L315)

##### `SymbolPathSearchResult` — Summary
Result of a symbol-aware path search.

#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L336)
- Returns: [`PathSearchResult`](#symbol-pathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`OneWay`](#symbol-oneway)

##### `searchGraph` — Summary
The shortest path from one file to another, by the walk, with the frontier
the CLI reports when there is none: where the walk stopped and why, and, on
an outbound search, the dependencies that resolved to no file.

##### `searchGraph` — Parameters
- `direction`: "outbound" follows dependencies, "inbound" follows dependents
- `from`: Source node code path, or the files of a directory
- `graph`: The Live Doc graph
- `maxDepth`: Maximum traversal depth
- `to`: Target node code path, or the files of a directory

##### `searchGraph` — Returns
Search result with path (if found), visited nodes, and frontier

#### `getNeighbors` {#symbol-getneighbors}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L388)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `direction`: [`OneWay`](#symbol-oneway)

##### `getNeighbors` — Summary
Gets the neighbors of a node based on traversal direction.

##### `getNeighbors` — Parameters
- `direction`: "outbound" for dependencies, "inbound" for dependents
- `graph`: The Live Doc graph
- `node`: The node to get neighbors for

##### `getNeighbors` — Returns
The neighbouring code paths

#### `searchSymbolPath` {#symbol-searchsymbolpath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L415)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/pathfind.ts#L513)

##### `symbolMatchesAnchor` — Summary
Whether a symbol name or anchor matches an anchor slug: exactly, or by name
once the `symbol-` prefix is removed and case ignored.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.noReaderHandles`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`document.Entry`](./document.ts.mdmd.md#symbol-entry) (type-only)
- [`graph.GraphFile`](./graph.ts.mdmd.md#symbol-graphfile)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.fileAt`](./graph.ts.mdmd.md#symbol-fileat)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
