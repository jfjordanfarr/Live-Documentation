# packages/explorer/src/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/pathfind.ts
- Generated At: 2026-09-30T16:22:04.250Z

## Authored
### Purpose
Pathfinding module providing FROM/TO omnisearch UI, BFS graph traversal, and path result computation for the Explorer Local Map visualization.

### Notes
- Created 2025-12-17 (Dev Day 48) in chat 2025-12-17.2.md Turn 07 as complete FROM/TO pathfind toolbar implementation
- BFS is bidirectional: builds both outbound (source→dependencies) and inbound (target→dependents) adjacency lists, tries outbound first then falls back to inbound
- `PathfindResult.direction` field (added 2025-12-18) indicates whether path was found via "outbound" or "inbound" traversal — essential for correct arrow directionality
- Fuzzy search over artifact names/paths with type icons (📦 implementation, 🧪 test) in dropdown
- Symbol dropdown populated from selected artifact's `publicSymbols` metadata
- Integrates with URL state for shareable pathfind queries (`from`, `to`, `fromSymbol`, `toSymbol` params)

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathfindEndpoint` {#symbol-pathfindendpoint}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L12)

##### `PathfindEndpoint` — Summary
Pathfind endpoint selection

#### `PathfindState` {#symbol-pathfindstate}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L18)

##### `PathfindState` — Summary
Pathfind state

#### `PathHop` {#symbol-pathhop}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L24)

##### `PathHop` — Summary
A hop in a path result

#### `PathfindResult` {#symbol-pathfindresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L31)

##### `PathfindResult` — Summary
Result of a pathfinding operation

#### `DEFAULT_MAX_HOPS` {#symbol-default_max_hops}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L48)

##### `DEFAULT_MAX_HOPS` — Summary
Default maximum hops to search

#### `PathfindCallbacks` {#symbol-pathfindcallbacks}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L51)

##### `PathfindCallbacks` — Summary
Callbacks for pathfind events

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L62)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
BFS pathfinding between two nodes in the explorer graph.
Returns the shortest path from source to target.

#### `parsePathfindFromUrl` {#symbol-parsepathfindfromurl}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L222)

##### `parsePathfindFromUrl` — Summary
Parse pathfind state from URL parameters.

#### `updatePathfindUrl` {#symbol-updatepathfindurl}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L253)
- Parameters: `state`: [`PathfindState`](#symbol-pathfindstate)

##### `updatePathfindUrl` — Summary
Update URL with pathfind state.

#### `PathfindApi` {#symbol-pathfindapi}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L283)

##### `PathfindApi` — Summary
Return type for initPathfind

#### `initPathfind` {#symbol-initpathfind}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/pathfind.ts#L294)
- Returns: [`PathfindApi`](#symbol-pathfindapi)
- Parameters: `nodes`: [`ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `callbacks`: [`PathfindCallbacks`](#symbol-pathfindcallbacks)

##### `initPathfind` — Summary
Initialize the pathfind toolbar with search and symbol selection
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
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
