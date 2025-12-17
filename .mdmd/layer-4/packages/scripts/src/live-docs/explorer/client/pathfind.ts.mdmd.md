# packages/scripts/src/live-docs/explorer/client/pathfind.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/pathfind.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-pathfind-ts
- Generated At: 2025-12-17T21:56:07.812Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-17T21:56:07.812Z","inputHash":"9676b724d6c4f3a4"}]} -->
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
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L40)

##### `DEFAULT_MAX_HOPS` — Summary
Default maximum hops to search

#### `PathfindCallbacks` {#symbol-pathfindcallbacks}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L43)

##### `PathfindCallbacks` — Summary
Callbacks for pathfind events

#### `findPath` {#symbol-findpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L54)
- Returns: [`PathfindResult`](#symbol-pathfindresult)
- Parameters: `links`: [`ExplorerLinkPayload`](../../../index.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `findPath` — Summary
BFS pathfinding between two nodes in the explorer graph.
Returns the shortest path from source to target.

#### `parsePathfindFromUrl` {#symbol-parsepathfindfromurl}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L156)

##### `parsePathfindFromUrl` — Summary
Parse pathfind state from URL parameters.

#### `updatePathfindUrl` {#symbol-updatepathfindurl}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L187)
- Parameters: `state`: [`PathfindState`](#symbol-pathfindstate)

##### `updatePathfindUrl` — Summary
Update URL with pathfind state.

#### `PathfindApi` {#symbol-pathfindapi}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L217)

##### `PathfindApi` — Summary
Return type for initPathfind

#### `initPathfind` {#symbol-initpathfind}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/pathfind.ts#L228)
- Returns: [`PathfindApi`](#symbol-pathfindapi)
- Parameters: `nodes`: [`ExplorerNodePayload`](../../../index.ts.mdmd.md#symbol-explorernodepayload)[]; `callbacks`: [`PathfindCallbacks`](#symbol-pathfindcallbacks)

##### `initPathfind` — Summary
Initialize the pathfind toolbar with search and symbol selection
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
