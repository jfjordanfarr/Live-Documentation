# packages/engine/src/live-docs/history/format.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/format.ts
- Generated At: 2026-10-18T00:39:18.816Z

## Authored
### Purpose
The format of `history.json`, the sequence a repository's history is read into under one lens, and of one commit's summary in the history command's cache: the head (the lens, the source with its sampling, an export's window), the paths and archetypes written once, the base snapshot in full, one delta per later commit, and a keyframe every 256 steps.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), from its shape: one file with the shape, not the docs, of every sampled commit, each file with its archetype, symbol count and entry mark and each directed file-to-file edge with its count, as [the probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) measured it (272,627 bytes for 121 steps of this repository, 58 KB gzipped). The decisions it carries are in [Turn 3 of October 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5) of October 17: "One lens. One generator over old snapshots", "Trust what git says", and the export's window and authors as the exporter's choice.
- Never committed: on 2025-11-10 the owner retired git-derived numbers from the committed docs because two clones' histories differ, and on 2025-11-11 allowed local history for views nothing permanent depends on; the sequence is such a view, and lives beside the graph index under the docs root.
- A delta's renames are applied first and a renamed file keeps its edges under its new path, so an edge that only followed its file neither comes nor goes. `touched` holds the files git saw change in content while nothing of their shape did: C3's minor ticks.
- The entry mark is one boolean per file, as C1 recommended, so that the walk from a past commit's entries can run; the Entry lines' reasons were in the docs of that day, which the sequence does not keep.
- `HistoryHead` is what the bundle's data says of the history it carries, so that the client knows the lens, the window and where knowledge begins before it fetches the file.
- The format's version is `live-docs-history/1`; the CLI and the static builder refuse another and name the command that writes this one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HISTORY_FORMAT` {#symbol-history_format}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L25)

##### `HISTORY_FORMAT` — Summary
The version of the sequence's format, written first in every `history.json`.

#### `HISTORY_SUMMARY_FORMAT` {#symbol-history_summary_format}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L28)

##### `HISTORY_SUMMARY_FORMAT` — Summary
The version of the format of one change's summary in the cache.

#### `HISTORY_DIRECTORY` {#symbol-history_directory}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L31)

##### `HISTORY_DIRECTORY` — Summary
The folder under the docs root that holds the cache and the sequence.

#### `HISTORY_FILE` {#symbol-history_file}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L34)

##### `HISTORY_FILE` — Summary
The name of the sequence's file, under {@link HISTORY_DIRECTORY}.

#### `KEYFRAME_INTERVAL` {#symbol-keyframe_interval}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L37)

##### `KEYFRAME_INTERVAL` — Summary
How many steps lie between two keyframes: a seek replays at most one fewer.

#### `FileTuple` {#symbol-filetuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L40)

##### `FileTuple` — Summary
One file in a snapshot: its path's id, its archetype's id, its symbol count, and 1 when its doc carries an Entry line.

#### `EdgeTuple` {#symbol-edgetuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L43)

##### `EdgeTuple` — Summary
One directed edge in a snapshot: the files' path ids and how many of the source's references land on the target.

#### `EdgeEnds` {#symbol-edgeends}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L46)

##### `EdgeEnds` — Summary
The two ends of a directed edge, by path id.

#### `SnapshotTuples` {#symbol-snapshottuples}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L49)

##### `SnapshotTuples` — Summary
A whole snapshot: every file and every edge, sorted by id.

#### `CommitInfo` {#symbol-commitinfo}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L55)

##### `CommitInfo` — Summary
One change of the version control, as the sequence names it.

#### `StepDelta` {#symbol-stepdelta}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L74)

##### `StepDelta` — Summary
What one step changed, by id; an empty list is left out. Applied in this
order: the renames first (a renamed file keeps its shape and its edges under
the new path), then the edges removed, the files dead and born, the files
resized, rekinded and re-marked, and the edges added and changed.

#### `HistoryStep` {#symbol-historystep}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L100)

##### `HistoryStep` — Summary
One sampled change after the base: the change and what it did to the shape.

#### `Keyframe` {#symbol-keyframe}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L106)
- Extends: [`SnapshotTuples`](#symbol-snapshottuples)

##### `Keyframe` — Summary
A snapshot repeated whole after a step, so that a seek need not replay from the base.

#### `GeneratorIdentity` {#symbol-generatoridentity}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L112)

##### `GeneratorIdentity` — Summary
Which generator made the summaries: its package version, its commit and any uncommitted change to it.

#### `HistoryLens` {#symbol-historylens}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L122)

##### `HistoryLens` — Summary
The lens: one generator and one configuration, applied to every change of the sequence.

#### `Sampling` {#symbol-sampling}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L131)

##### `Sampling` — Summary
Which changes of the mainline were regenerated.

#### `HistorySource` {#symbol-historysource}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L146)

##### `HistorySource` — Summary
Where the sequence was read from.

#### `HistoryWindow` {#symbol-historywindow}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L165)

##### `HistoryWindow` — Summary
The part of a sequence an export carries, when it carries less than the whole.

#### `HistorySequence` {#symbol-historysequence}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L168)

##### `HistorySequence` — Summary
The sequence: `history.json`.

#### `HistoryHead` {#symbol-historyhead}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L186)

##### `HistoryHead` — Summary
What a sequence says of itself without its body, which the bundle's data carries beside the history file's name.

#### `CommitSummary` {#symbol-commitsummary}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L200)

##### `CommitSummary` — Summary
One change's shape as the cache keeps it: `<docsRoot>/history/<lens>/<change>.json`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->
