# packages/explorer/src/client/views/fileConnections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/fileConnections.ts
- Generated At: 2026-10-03T02:21:29.014Z

## Authored
### Purpose
Projects canonical references into counted, undirected file pairs for the Force Graph overview.

### Notes
Parallel symbol references and reciprocal dependencies share one visible file relationship. Internal references do not connect different files; the canonical graph retains every original edge.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileConnection` {#symbol-fileconnection}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/fileConnections.ts#L2)

##### `FileConnection` — Summary
A file-pair summary for a connectivity overview; canonical symbol edges remain untouched.

#### `fileConnections` {#symbol-fileconnections}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/fileConnections.ts#L10)
- Returns: [`FileConnection`](#symbol-fileconnection)[]

##### `fileConnections` — Summary
Collapse parallel and reciprocal references to one undirected file-level relationship.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
