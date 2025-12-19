# packages/scripts/src/live-docs/explorer/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/pathfind.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-pathfind-ts
- Generated At: 2025-12-19T04:50:47.319Z

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
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T04:50:47.319Z","inputHash":"603b7d850309e55e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathfindEndpoint` {#symbol-pathfindendpoint}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L11)

##### `PathfindEndpoint` — Summary
Pathfind endpoint selection

#### `PathfindState` {#symbol-pathfindstate}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L17)

##### `PathfindState` — Summary
Pathfind state

#### `PathHop` {#symbol-pathhop}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L23)

##### `PathHop` — Summary
A hop in a path result

#### `PathfindResult` {#symbol-pathfindresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L30)

##### `PathfindResult` — Summary
Result of a pathfinding operation

#### `DEFAULT_MAX_HOPS` {#symbol-default_max_hops}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L47)

##### `DEFAULT_MAX_HOPS` — Summary
Default maximum hops to search

#### `PathfindCallbacks` {#symbol-pathfindcallbacks}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L50)

##### `PathfindCallbacks` — Summary
Callbacks for pathfind events

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L61)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `links`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
BFS pathfinding between two nodes in the explorer graph.
Returns the shortest path from source to target.

#### `parsePathfindFromUrl` {#symbol-parsepathfindfromurl}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L220)

##### `parsePathfindFromUrl` — Summary
Parse pathfind state from URL parameters.

#### `updatePathfindUrl` {#symbol-updatepathfindurl}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L251)
- Parameters: `state`: [`PathfindState`](#symbol-pathfindstate)

##### `updatePathfindUrl` — Summary
Update URL with pathfind state.

#### `PathfindApi` {#symbol-pathfindapi}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L281)

##### `PathfindApi` — Summary
Return type for initPathfind

#### `initPathfind` {#symbol-initpathfind}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L292)
- Returns: [`PathfindApi`](#symbol-pathfindapi)
- Parameters: `nodes`: [`ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload)[]; `callbacks`: [`PathfindCallbacks`](#symbol-pathfindcallbacks)

##### `initPathfind` — Summary
Initialize the pathfind toolbar with search and symbol selection
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
