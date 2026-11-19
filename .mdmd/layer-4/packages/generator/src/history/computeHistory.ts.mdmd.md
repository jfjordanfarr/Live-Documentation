# packages/generator/src/history/computeHistory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/computeHistory.ts
- Generated At: 2026-10-22T16:47:56.943Z

## Authored
### Purpose
The history command: the mainline read and sampled, every sampled commit the cache lacks regenerated in a scratch worktree by a process of its own, a few at a time, and the sequence derived from consecutive summaries and git's word between them, written to `<root>/history/history.json` beside the cache.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its shape reads: for every commit not yet in the cache under the current lens, check it out into a detached worktree, generate the docs there with the lens's configuration, read the derived index, write a compact summary and remove the worktree. [The probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) ran the same by hand over 122 commits, three at a time, in ten minutes of wall clock. The decisions it carries are in [Turn 3 of October 16](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5) of October 17.
- One process per commit, so that no process holds more than one graph (scenario 4); the pool's size is the caller's to give, or this module's to derive (below). The Git seam serializes worktree registry mutations while the summary workers run concurrently. A failed Git cleanup preserves the scratch directory and reports its location; only an empty scratch parent is removed here.
- The lens's configuration is the file given, or the workspace's own as it stands, applied to every commit, so that a change of the tool never looks like a change of the code (scenario 5, and the plan's recommendation of the configuration at the head). Its docs root must lie inside the workspace.
- The cache is `<root>/history/<lens>/<commit>.json.gz` since 2026-11-19 (`<commit>.json` before), with `<commit>.index.json.gz` under `--keep-index` and the lens's text store under `texts/`; a commit counts as cached when its summary, and its index when asked for, are there.
- Since 2026-11-19, for the owner's three rungs of history in 2D ([Turn 35](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18, "How do we mitigate these costs and risks?"): the sequence is built from each summary's shape and rows, its texts given ids as they are first met; the words of every step are written beside the sequence (`history-words/`), each read from the text store, which checks it against its hash; and where the generator runs unmodified from the commit the history ends at, as it does over this repository, the last step's rows and links are held to the graph derived afresh from the Live Docs committed there, read from a checkout of it, its links read straight from the graph's edges (`headDifferences`). A difference stops the run as a replay's does; the message names the likely cause, a mirror not regenerated after the last change of the source, which the repository's own freshness check also refuses.
- The pool, without `--jobs`, is as many processes as half the machine's memory holds at the peak one last took on the repository, at most one fewer than its processors (`poolSize`). Each process sends its peak resident memory when it ends; a run records its largest in `<root>/history/pool.json`, the largest of every run under the same lens, so that a run regenerating only the newest commit does not shrink it. Before any measurement it expects 768 MiB, the 526 MB measured over this repository rounded up. Until 2026-11-19 the CLI chose two processes under 8 GiB and else at most three, whatever the machine.
- Every run lists the cache folders of other lenses (sixteen hexadecimal digits, not the current key) with their sizes, and `--remove-superseded` removes them; nothing is removed unasked. The history folder writes its own `.gitignore`, so that no repository commits it: nothing derived from local history is committed (the owner, 2025-11-10).
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
