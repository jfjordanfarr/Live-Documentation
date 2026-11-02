# packages/explorer/src/client/history/file-identity.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/file-identity.ts
- Generated At: 2026-11-01T21:06:14.368Z

## Authored
### Purpose
Give a file from the displayed history a portable identity that search, pins, evidence and shared addresses can keep even after the file has been deleted. A surviving file uses its ordinary current id; a past-only file is anchored to its creation or the known base so that renames preserve identity and a later file at the same path remains distinct.

### Notes
Created for the [November 1 review and authorized repairs](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2): GraphStore existed in the displayed pre-removal snapshot but search offered only today's files. Identity follows the engine's existing lifetime-aware path walk. A shared historical reference is checked against its named snapshot before entering the selection lookup; it never adds a file to today's canonical graph. Historical snapshots provide counts and relationships, not old symbol names or prose.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `historicalOrigin` {#symbol-historicalorigin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/file-identity.ts#L18)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `historicalOrigin` — Summary
The known moment and path a portable historical file names; malformed or foreign references are absent.

#### `referenceAt` {#symbol-referenceat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/file-identity.ts#L31)
- Returns: [`FollowedPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followedpath)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `referenceAt` — Summary
Follow either an ordinary current-file id or a portable historical identity to the requested moment.

#### `referenceFor` {#symbol-referencefor}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/file-identity.ts#L38)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `referenceFor` — Summary
A file selected at a moment, as a stable id suitable for pins, inspection, paths and sharing.

#### `historicalNode` {#symbol-historicalnode}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/file-identity.ts#L49)
- Returns: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `historicalNode` — Summary
Validate and recover a historical selection from canonical snapshot facts, never from its untrusted address alone.

#### `historicalDirectories` {#symbol-historicaldirectories}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/file-identity.ts#L58)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `historicalDirectories` — Summary
Directory names actually containing source files somewhere in the sequence; citation targets do not create folders.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`ticks.FollowedPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followedpath)
- [`ticks.followPath`](../../../../engine/src/live-docs/history/ticks.ts.mdmd.md#symbol-followpath)
- [`snapshot.snapshotGraphOf`](./snapshot.ts.mdmd.md#symbol-snapshotgraphof)
- [`graph-search.directoriesOf`](../search/graph-search.ts.mdmd.md#symbol-directoriesof)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
