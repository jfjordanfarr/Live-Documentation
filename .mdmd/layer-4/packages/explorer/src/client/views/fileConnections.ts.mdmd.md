# packages/explorer/src/client/views/fileConnections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/fileConnections.ts
- Generated At: 2026-10-30T15:43:44.239Z

## Authored
### Purpose
Projects canonical references into counted, undirected file pairs for the Force Graph overview.

### Notes
Parallel symbol references and reciprocal dependencies share one visible file relationship. Internal references do not connect different files; the canonical graph retains every original edge.

A projected edge may represent several documented references sharing endpoints. Pair counts sum that multiplicity (one for older inputs), including reciprocal directions, without multiplying it again through display aliases. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileConnection` {#symbol-fileconnection}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/fileConnections.ts#L8)

##### `FileConnection` — Summary
A file-pair summary for a connectivity overview; the canonical symbol edges remain untouched. One pair stands for
both directions between two files, its endpoints in path order so that the pair's identity does not depend on which
way the references run: `forward` counts the references in which `source` uses `target`, `backward` those in which
`target` uses `source`, and `count` is their sum. The 3D map draws the pair as one wire coloured by its directions
(2026-10-30; before, the directions were merged away and no wire could say which file used which).

#### `fileConnections` {#symbol-fileconnections}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/fileConnections.ts#L21)
- Returns: [`FileConnection`](#symbol-fileconnection)[]

##### `fileConnections` — Summary
Collapse parallel and reciprocal references to one file-level relationship that remembers its directions.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
