# packages/explorer/src/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/pathfind.ts
- Generated At: 2026-10-22T16:47:54.639Z

## Authored
### Purpose

The pathfinder of the Local Map: the engine's breadth-first walk over the links the map draws, asked for the shortest path between two sets of files in the direction the map can draw, for every file a path can reach from a set, and for the count of what a drawn path leaves out. The bar that asks is `search/search-bar.ts`.

### Notes

- A path is drawn only in the direction the Local Map reads, what offers on the left and what uses on the right, so `findPath` walks the start's dependents and finds a path exactly when the end depends on the start. When only the start depends on the end it returns the same files as `reversePath`, provider first, which the client offers as a link instead of a drawing. This is the owner's rule of [2025-12-18](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.3.md): "show no results and offer the reverse (via hyperlink)" rather than draw a path against the direction. Until [Turn 10 of 2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the search accepted either direction and the map laid the files out in search order, so every wire ran backward; the still-picture instrument measured it.
- Since 2026-10-14 ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)) the walk is the engine's, on the owner's condition that one pure implementation underlie the Explorer and the CLI: `adjacencyOf` reads the bundle's links both ways, `findPath` asks the walk forward and then in reverse with the starts left out of the targets, and `reachOf` lists every file a path reaches from a set, forward and in reverse, by the files the path would show, which is what the destination field offers. The adjacency is the links the map draws, not the graph's edges, so what the field offers is what the map can draw to.
- `referencesAgainstPath` counts the references between a drawn path's files that run against it, an earlier file depending on a later one; the path drawer leaves them out, so the status says how many.
- Created on 2025-12-17 as the FROM/TO pathfind toolbar, with its own fuzzy search, symbol dropdowns and the address parameters `from`, `to`, `fromSymbol` and `toSymbol`. On 2026-10-14 ([Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) the toolbar went into the search bar and the parameters into the compressed snapshot's destination, and the search became one between sets: a start or an end may be a directory, standing for every file inside it, and a file in both sets is not its own path.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathHop` {#symbol-pathhop}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L12)

##### `PathHop` — Summary
A hop in a path result

#### `PathfindResult` {#symbol-pathfindresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L19)

##### `PathfindResult` — Summary
What a search between two sets of files found.

#### `Reach` {#symbol-reach}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L39)

##### `Reach` — Summary
Every file a path can reach from a set of files, by the number of files on the path, in each direction.

#### `Adjacency` {#symbol-adjacency}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L47)

##### `Adjacency` — Summary
The two readings of the bundle's links: a file's dependents, and the files it depends on.

#### `adjacencyOf` {#symbol-adjacencyof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L59)
- Returns: [`Adjacency`](#symbol-adjacency)

##### `adjacencyOf` — Summary
The links read both ways. A link runs from the file that depends to the file it depends on.

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L93)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `fromIds`: `Iterable`; `toIds`: `Iterable`; `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
Finds the shortest path the Local Map can draw from any file of one set to any file of another, or the reverse of
it when only the reverse exists. A set is one file, or every file of a directory.

A link runs from the file that depends to the file it depends on, so the map's reading direction, offers on the
left and uses on the right, walks a file's dependents. The walk from the start along dependents reaches the end
exactly when the end depends on the start; the same walk from the end reaches the start when the start depends on
the end, and that path is returned as `reversePath`, provider first, never drawn. A path has at least one hop:
a file that is in both sets is not its own path.

#### `reachOf` {#symbol-reachof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L124)
- Returns: [`Reach`](#symbol-reach)
- Parameters: `fromIds`: `Iterable`

##### `reachOf` — Summary
Every file a path can reach from a set of files, forward along dependents, which the map draws, and in reverse
along dependencies, which the reverse question offers, each with the number of files the path would show. The
set's own files are not listed.

#### `referencesAgainstPath` {#symbol-referencesagainstpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L141)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `referencesAgainstPath` — Summary
The references between the files of a drawn path that run against it: an
earlier file, which the picture shows offering, depending on a later one.
The path drawer leaves them out, so the bar counts them aloud.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pathfind.Neighbours`](../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-neighbours)
- [`pathfind.pathTo`](../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathto)
- [`pathfind.reachFrom`](../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachfrom)
- [`pathfind.walk`](../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-walk-function)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
