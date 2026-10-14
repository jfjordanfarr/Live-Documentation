# packages/explorer/src/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/pathfind.ts
- Generated At: 2026-10-14T18:27:57.438Z

## Authored
### Purpose

The pathfinder of the Local Map: the breadth-first search between two sets of files, in the direction the map can draw, and the count of what a drawn path leaves out. The bar that asks the question is `search/search-bar.ts`.

### Notes

- A path is drawn only in the direction the Local Map reads, what offers on the left and what uses on the right, so `findPath` walks the start's dependents and finds a path exactly when the end depends on the start. When only the start depends on the end it returns the same files as `reversePath`, provider first, which the client offers as a link instead of a drawing. This is the owner's rule of [2025-12-18](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.3.md): "show no results and offer the reverse (via hyperlink)" rather than draw a path against the direction. Until [Turn 10 of 2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the search accepted either direction and the map laid the files out in search order, so every wire ran backward; the still-picture instrument measured it.
- `referencesAgainstPath` counts the references between a drawn path's files that run against it, an earlier file depending on a later one; the path drawer leaves them out, so the status says how many.
- Created on 2025-12-17 as the FROM/TO pathfind toolbar, with its own fuzzy search, symbol dropdowns and the address parameters `from`, `to`, `fromSymbol` and `toSymbol`. On 2026-10-14 ([Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) the toolbar went into the search bar and the parameters into the compressed snapshot's destination, and the search became one between sets: a start or an end may be a directory, standing for every file inside it, and a file in both sets is not its own path.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathHop` {#symbol-pathhop}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L9)

##### `PathHop` — Summary
A hop in a path result

#### `PathfindResult` {#symbol-pathfindresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L16)

##### `PathfindResult` — Summary
What a search between two sets of files found.

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L49)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `fromIds`: `Iterable`; `toIds`: `Iterable`; `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
Finds the shortest path the Local Map can draw from any file of one set to any file of another, or the reverse of
it when only the reverse exists. A set is one file, or every file of a directory.

A link runs from the file that depends to the file it depends on, so the map's reading direction, offers on the
left and uses on the right, walks a file's dependents. The search from the start along dependents reaches the end
exactly when the end depends on the start; the same search from the end reaches the start when the start depends
on the end, and that path is returned as `reversePath`, provider first, never drawn. A path has at least one hop:
a file that is in both sets is not its own path.

#### `referencesAgainstPath` {#symbol-referencesagainstpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L92)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `referencesAgainstPath` — Summary
The references between the files of a drawn path that run against it: an
earlier file, which the picture shows offering, depending on a later one.
The path drawer leaves them out, so the bar counts them aloud.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
