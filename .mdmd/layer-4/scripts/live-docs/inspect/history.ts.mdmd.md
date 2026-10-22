# scripts/live-docs/inspect/history.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect/history.ts
- Generated At: 2026-10-22T16:47:57.615Z

## Authored
### Purpose
What `inspect --at` and `inspect --between` answer from the history, in text and JSON: a file at a commit with its wires, the walk from a commit's entries, and what changed between two commits; and the refusals, naming the command to run when there is no history.

### Notes
- Written 2026-10-17 for C9 of [the plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md). Every answer's first line, or its `answeredFrom: "shape"`, says that it comes from the shape alone, as C9 recommended.
- A commit is named by a prefix of its id among the sampled commits; a commit between two samples is not in the sequence, and the refusal says how the history was sampled.
- The walk's starts carry the entry mark and the test flag, not the Entry lines, which the history does not keep.

`--between` prints the directories renamed whole across the span as "Renamed whole" (2026-10-18, the plan's C4), the same fact the Explorer's step panel shows.

Since 2026-10-20 ([Turn 9](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) `--at` lists a file's linked documents and `--between` the documents linked and unlinked, from the shape alone as before.
Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)) the walk from a commit's entries lists the files not read apart from the unreachable, in text and as `unread` in its JSON, as the present's walk does.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryRefusal` {#symbol-historyrefusal}
- Type: class
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L27)

##### `HistoryRefusal` — Summary
A question the history cannot answer as asked, said plainly.

#### `readHistory` {#symbol-readhistory}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L30)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `readHistory` — Summary
The sequence the history command wrote for this workspace; a refusal naming the command when there is none.

#### `resolveStep` {#symbol-resolvestep}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L49)
- Parameters: `sequence`: [`HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `resolveStep` — Summary
The step of the commit a reference names: a prefix of its id.

#### `emitFileAt` {#symbol-emitfileat}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L65)
- Parameters: `sequence`: [`HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `emitFileAt` — Summary
What a file was at a commit: whether it existed, its shape, and its wires either way.

#### `emitReachableAt` {#symbol-emitreachableat}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L92)
- Parameters: `sequence`: [`HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence); `config`: [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `emitReachableAt` — Summary
What the entries of a commit reach, by the pathfinder over the graph the commit's shape makes.

#### `emitBetween` {#symbol-emitbetween}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/history.ts#L127)
- Parameters: `sequence`: [`HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `emitBetween` — Summary
What changed from one commit to a later one, each file followed through every rename between.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`format.CommitInfo`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo)
- [`format.HISTORY_DIRECTORY`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_directory)
- [`format.HISTORY_FILE`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_file)
- [`format.HISTORY_FORMAT`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_format)
- [`format.HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)
- [`queries.changesBetween`](../../../packages/engine/src/live-docs/history/queries.ts.mdmd.md#symbol-changesbetween-function)
- [`queries.entryMarked`](../../../packages/engine/src/live-docs/history/queries.ts.mdmd.md#symbol-entrymarked)
- [`queries.fileOfShape`](../../../packages/engine/src/live-docs/history/queries.ts.mdmd.md#symbol-fileofshape)
- [`queries.graphOfShape`](../../../packages/engine/src/live-docs/history/queries.ts.mdmd.md#symbol-graphofshape)
- [`queries.stepsMatching`](../../../packages/engine/src/live-docs/history/queries.ts.mdmd.md#symbol-stepsmatching)
- [`sequence.commitAt`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.seek`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`pathfind.reachability`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-function)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
