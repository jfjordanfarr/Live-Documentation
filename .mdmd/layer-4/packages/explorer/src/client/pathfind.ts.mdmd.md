# packages/explorer/src/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/pathfind.ts
- Generated At: 2026-10-08T16:03:27.887Z

## Authored
### Purpose

The pathfinder of the Local Map: the FROM and TO toolbar with its fuzzy search and symbol dropdowns, the breadth-first search between two files, the address parameters that make a path shareable, and the count of what a drawn path leaves out.

### Notes

- A path is drawn only in the direction the Local Map reads, what offers on the left and what uses on the right, so `findPath` walks FROM's dependents and finds a path exactly when TO depends on FROM. When only FROM depends on TO it returns the same files as `reversePath`, provider first, which the client offers as a link instead of a drawing; `swap` on the API asks that reverse question. This is the owner's rule of [2025-12-18](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-18.3.md): "show no results and offer the reverse (via hyperlink)" rather than draw a path against the direction. Until [Turn 10 of 2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the search accepted either direction and the map laid the files out in search order, so every wire ran backward; the still-picture instrument measured it.
- `referencesAgainstPath` counts the references between a drawn path's files that run against it, an earlier file depending on a later one; the path drawer leaves them out, so the status says how many.
- Created on 2025-12-17 as the FROM/TO pathfind toolbar; the search results show the file's name, path and archetype; the symbol dropdowns come from the file's `publicSymbols`.
- The address carries `from`, `to`, `fromSymbol` and `toSymbol`; `pathfindHref` writes them into the current address and `updatePathfindUrl` commits that to the history.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathfindEndpoint` {#symbol-pathfindendpoint}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L13)

##### `PathfindEndpoint` — Summary
Pathfind endpoint selection

#### `PathfindState` {#symbol-pathfindstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L19)

##### `PathfindState` — Summary
Pathfind state

#### `PathHop` {#symbol-pathhop}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L25)

##### `PathHop` — Summary
A hop in a path result

#### `PathfindResult` {#symbol-pathfindresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L32)

##### `PathfindResult` — Summary
What a search between two files found.

#### `PathfindCallbacks` {#symbol-pathfindcallbacks}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L56)

##### `PathfindCallbacks` — Summary
Callbacks for pathfind events

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L77)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
Finds the shortest path the Local Map can draw between two files, or the
reverse of it when only the reverse exists.

A link runs from the file that depends to the file it depends on, so the map's
reading direction, offers on the left and uses on the right, walks a file's
dependents. The search from FROM along dependents reaches TO exactly when TO
depends on FROM; the same search from TO reaches FROM when FROM depends on TO,
and that path is returned as `reversePath`, provider first, never drawn.

#### `referencesAgainstPath` {#symbol-referencesagainstpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L129)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `referencesAgainstPath` — Summary
The references between the files of a drawn path that run against it: an
earlier file, which the picture shows offering, depending on a later one.
The path drawer leaves them out, so the toolbar counts them aloud.

#### `parsePathfindFromUrl` {#symbol-parsepathfindfromurl}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L199)

##### `parsePathfindFromUrl` — Summary
Parse pathfind state from URL parameters.

#### `pathfindHref` {#symbol-pathfindhref}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L228)
- Parameters: `state`: [`PathfindState`](#symbol-pathfindstate)

##### `pathfindHref` — Summary
The page's address with the pathfind state written into it and everything else kept.

#### `updatePathfindUrl` {#symbol-updatepathfindurl}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L258)
- Parameters: `state`: [`PathfindState`](#symbol-pathfindstate)

##### `updatePathfindUrl` — Summary
Update URL with pathfind state.

#### `PathfindApi` {#symbol-pathfindapi}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L263)

##### `PathfindApi` — Summary
Return type for initPathfind

#### `initPathfind` {#symbol-initpathfind}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L276)
- Returns: [`PathfindApi`](#symbol-pathfindapi)
- Parameters: `nodes`: [`ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `callbacks`: [`PathfindCallbacks`](#symbol-pathfindcallbacks)

##### `initPathfind` — Summary
Initialize the pathfind toolbar with search and symbol selection
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`history.commitUrl`](./persistence/history.ts.mdmd.md#symbol-commiturl)
- [`template.pathfind-clear`](../shared/template.html.mdmd.md#symbol-pathfind-clear)
- [`template.pathfind-from`](../shared/template.html.mdmd.md#symbol-pathfind-from)
- [`template.pathfind-from-clear`](../shared/template.html.mdmd.md#symbol-pathfind-from-clear)
- [`template.pathfind-from-results`](../shared/template.html.mdmd.md#symbol-pathfind-from-results)
- [`template.pathfind-from-symbol`](../shared/template.html.mdmd.md#symbol-pathfind-from-symbol)
- [`template.pathfind-go`](../shared/template.html.mdmd.md#symbol-pathfind-go)
- [`template.pathfind-to`](../shared/template.html.mdmd.md#symbol-pathfind-to)
- [`template.pathfind-to-clear`](../shared/template.html.mdmd.md#symbol-pathfind-to-clear)
- [`template.pathfind-to-results`](../shared/template.html.mdmd.md#symbol-pathfind-to-results)
- [`template.pathfind-to-symbol`](../shared/template.html.mdmd.md#symbol-pathfind-to-symbol)
- [`template.pathfind-toolbar`](../shared/template.html.mdmd.md#symbol-pathfind-toolbar)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
