# packages/generator/src/history/computeHistory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/computeHistory.ts
- Generated At: 2026-10-18T00:39:23.804Z

## Authored
### Purpose
The history command: the mainline read and sampled, every sampled commit the cache lacks regenerated in a scratch worktree by a process of its own, a few at a time, and the sequence derived from consecutive summaries and git's word between them, written to `<root>/history/history.json` beside the cache.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its shape reads: for every commit not yet in the cache under the current lens, check it out into a detached worktree, generate the docs there with the lens's configuration, read the derived index, write a compact summary and remove the worktree. [The probe](../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) ran the same by hand over 122 commits, three at a time, in ten minutes of wall clock. The decisions it carries are in [Turn 3 of October 16](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5) of October 17.
- One process per commit, so that no process holds more than one graph (scenario 4); the pool's size is the CLI's to choose.
- The lens's configuration is the file given, or the workspace's own as it stands, applied to every commit, so that a change of the tool never looks like a change of the code (scenario 5, and the plan's recommendation of the configuration at the head). Its docs root must lie inside the workspace.
- The cache is `<root>/history/<lens>/<commit>.json`, with `<commit>.index.json.gz` under `--keep-index`; a commit counts as cached when its summary, and its index when asked for, are there. The history folder writes its own `.gitignore`, so that no repository commits it: nothing derived from local history is committed (the owner, 2025-11-10).
- A run stopped by a signal removes its scratch worktrees before it exits, so that the repository keeps no worktree of it.
- Each scratch tree's folder has a name of its own, its temporary folder's: git names a worktree's record after the folder, and the first run over this repository two at a time (2026-10-17), every tree named `tree`, raced two adds for one record and failed at a removal.
- What the generator warns is gathered and said once for each message, with the number of changes that gave it, when the regeneration ends; over this repository it would otherwise repeat the scans inside the test fixtures at every commit.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryOptions` {#symbol-historyoptions}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L51)

##### `HistoryOptions` — Summary
What to compute.

#### `HistoryRun` {#symbol-historyrun}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L68)

##### `HistoryRun` — Summary
What a run did.

#### `computeHistory` {#symbol-computehistory}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L83)
- Parameters: `options`: [`HistoryOptions`](#symbol-historyoptions)

##### `computeHistory` — Summary
Computes the history and writes the sequence.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `ChildProcess`, `fork`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`format.CommitInfo`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo)
- [`format.CommitSummary`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitsummary)
- [`format.HISTORY_DIRECTORY`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_directory)
- [`format.HISTORY_FILE`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_file)
- [`format.HISTORY_SUMMARY_FORMAT`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_summary_format)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens)
- [`format.HistorySequence`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)
- [`format.Sampling`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-sampling)
- [`git.openGitRepository`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`lens.lensOf`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-lensof)
- [`sampling.sampleChanges`](../../../engine/src/live-docs/history/sampling.ts.mdmd.md#symbol-samplechanges)
- [`sequence.SequenceBuilder`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`summary.shapeOfSummary`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-shapeofsummary)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`versionControl.WorkingTree`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtree) (type-only)
- [`generatorIdentity`](./generatorIdentity.ts.mdmd.md#symbol-generatoridentity)
- [`summarizeChange.SummaryTask`](./summarizeChange.ts.mdmd.md#symbol-summarytask) (type-only)
<!-- LIVE-DOC:END Dependencies -->
