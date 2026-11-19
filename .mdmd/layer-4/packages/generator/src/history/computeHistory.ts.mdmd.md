# packages/generator/src/history/computeHistory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/computeHistory.ts
- Generated At: 2026-11-19T08:59:55.158Z

## Authored
### Purpose
The history command: the mainline read and sampled, every sampled commit the cache lacks regenerated in a scratch tree by a process of its own, several at a time, and the sequence derived from consecutive summaries and git's word between them, written to `<root>/history/history.json` beside the cache.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its shape reads: for every commit not yet in the cache under the current lens, check it out into a detached worktree, generate the docs there with the lens's configuration, read the derived index, write a compact summary and remove the worktree. [The probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) ran the same by hand over 122 commits, three at a time, in ten minutes of wall clock. The decisions it carries are in [Turn 3 of October 16](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5) of October 17.
- One process per commit, so that no process holds more than one graph (scenario 4); the pool's size is the caller's to give, or this module's to derive (below). Since 2026-11-19 a scratch tree registers nothing with the repository (`git.ts`), so trees are made at once; each summarizing process is given the tree's environment, through which git answers what the tree tracks and ignores. A failed Git cleanup preserves the scratch directory and reports its location; only an empty scratch parent is removed here.
- The lens's configuration is the file given, or the workspace's own as it stands, applied to every commit, so that a change of the tool never looks like a change of the code (scenario 5, and the plan's recommendation of the configuration at the head). Its docs root must lie inside the workspace.
- The cache is `<root>/history/<lens>/<commit>.json.gz` since 2026-11-19 (`<commit>.json` before), with `<commit>.index.json.gz` under `--keep-index` and the lens's text store under `texts/`; a commit counts as cached when its summary, and its index when asked for, are there.
- Since 2026-11-19, for the owner's three rungs of history in 2D ([Turn 35](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18, "How do we mitigate these costs and risks?"): the sequence is built from each summary's shape and rows, its texts given ids as they are first met; the words of every step are written beside the sequence (`history-words/`), each read from the text store, which checks it against its hash; and where the generator runs unmodified from the commit the history ends at, as it does over this repository, the last step's rows and links are held to the graph derived afresh from the Live Docs committed there, read from a checkout of it, its links read straight from the graph's edges (`headDifferences`). A difference stops the run as a replay's does; the message names the likely cause, a mirror not regenerated after the last change of the source, which the repository's own freshness check also refuses.
- The pool, without `--jobs`, is as many processes as half the machine's memory holds at the peak one last took on the repository, at most one fewer than its processors (`poolSize`). Each process sends its peak resident memory when it ends; a run records its largest in `<root>/history/pool.json`, the largest of every run under the same lens, so that a run regenerating only the newest commit does not shrink it. Before any measurement it expects 768 MiB, the 526 MB measured over this repository rounded up. Until 2026-11-19 the CLI chose two processes under 8 GiB and else at most three, whatever the machine.
- Every run lists the cache folders of other lenses (sixteen hexadecimal digits, not the current key) with their sizes, and `--remove-superseded` removes them; nothing is removed unasked. The history folder writes its own `.gitignore`, so that no repository commits it: nothing derived from local history is committed (the owner, 2025-11-10).
- A run stopped by a signal removes its scratch trees before it exits.
- Each scratch tree's folder has a name of its own, its temporary folder's: while trees were worktrees git named a record after the folder, and the first run over this repository two at a time (2026-10-17), every tree named `tree`, raced two adds for one record and failed at a removal.
- What the generator warns is gathered and said once for each message, with the number of changes that gave it, when the regeneration ends; over this repository it would otherwise repeat the scans inside the test fixtures at every commit.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryOptions` {#symbol-historyoptions}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L64)

##### `HistoryOptions` — Summary
What to compute.

#### `SupersededCache` {#symbol-supersededcache}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L90)

##### `SupersededCache` — Summary
A cache folder under the history folder that belongs to another lens than the current one.

#### `HistoryRun` {#symbol-historyrun}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L102)

##### `HistoryRun` — Summary
What a run did.

#### `HistoryStopped` {#symbol-historystopped}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L129)

##### `HistoryStopped` — Summary
A run that stopped, as asked, before the cache held every sampled change: no sequence was written.

#### `HEAD_CHECK_RULE` {#symbol-head_check_rule}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L134)

##### `HEAD_CHECK_RULE` — Summary
When the check at the head applies, in the words the command prints when it skips it.

#### `UNMEASURED_PEAK_MEMORY` {#symbol-unmeasured_peak_memory}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L151)

##### `UNMEASURED_PEAK_MEMORY` — Summary
What one summarizing process is expected to take before any has been measured on a repository: the largest peak
measured on 2026-11-19 over every 25th commit of this repository's history and its head (1,064 files), 526 MB,
rounded up to 768 MiB. A larger repository takes more, which its first run measures and records.

#### `poolSize` {#symbol-poolsize}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L158)

##### `poolSize` — Summary
How many summarizing processes a machine runs at once: as many as half its memory holds at the measured peak of
one, since the person's own work goes on beside the run, and one fewer than its processors, since each process
keeps one busy and the command and git need one; never fewer than one.

#### `usableMachine` {#symbol-usablemachine}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L169)

##### `usableMachine` — Summary
The memory and the processors this process may use: the machine's, or less where the operating system says so. In
a container whose memory is limited, `process.constrainedMemory` reads the limit from the control group; the
processors are those the process may be scheduled on, `os.availableParallelism`, which a limit of processor time
(`docker run --cpus`) does not lower.

#### `computeHistory` {#symbol-computehistory}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L175)
- Parameters: `options`: [`HistoryOptions`](#symbol-historyoptions)

##### `computeHistory` — Summary
Computes the history and writes the sequence.

#### `PoolRecord` {#symbol-poolrecord}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L479)

##### `PoolRecord` — Summary
What runs measured of a summarizing process's peak memory on this repository.

#### `nextPoolRecord` {#symbol-nextpoolrecord}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L507)
- Returns: [`PoolRecord`](#symbol-poolrecord)
- Parameters: `previous`: [`PoolRecord`](#symbol-poolrecord)

##### `nextPoolRecord` — Summary
The record after a run measured `peakMemory` over `changes` changes under `lens`. Under the same lens the record
keeps the largest peak of every run, since a run that regenerates only the newest change sees one change's peak and
not the history's. Under a new lens the generator has changed, and the run's peak replaces the record's only when it
was measured over at least as many changes; until then the larger of the two stands, so that a small sampled run
never shrinks the estimate a whole history was measured to need.

#### `formatBytes` {#symbol-formatbytes}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L731)

##### `formatBytes` — Summary
A size in the units a person reads it in.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- `node:zlib` - `gunzipSync`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graphFiles.readLiveDocGraph`](../../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`codec.Interner`](../../../engine/src/live-docs/history/codec.ts.mdmd.md#symbol-interner)
- [`format.CommitInfo`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo)
- [`format.HISTORY_DIRECTORY`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_directory)
- [`format.HISTORY_FILE`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_file)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens)
- [`format.HistorySequence`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)
- [`format.Sampling`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-sampling)
- [`git.openGitRepository`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`lens.lensOf`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-lensof)
- [`rows.linksOf`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-linksof)
- [`rows.rowsOfSummary`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-rowsofsummary)
- [`sampling.sampleChanges`](../../../engine/src/live-docs/history/sampling.ts.mdmd.md#symbol-samplechanges)
- [`sequence.SequenceBuilder`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`sequence.momentAt`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-momentat)
- [`shape.shapeOfSummary`](../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shapeofsummary)
- [`summary.CommitSummary`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-commitsummary)
- [`summary.HISTORY_SUMMARY_FORMAT`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-history_summary_format)
- [`summary.textHash`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-texthash)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`textStore.textPath`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-textpath)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`words.WORDS_DIRECTORY`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-words_directory)
- [`words.WordsHead`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-wordshead)
- [`words.textsOfFile`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-textsoffile)
- [`words.wordsStore`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-wordsstore)
- [`generatorIdentity`](./generatorIdentity.ts.mdmd.md#symbol-generatoridentity)
- [`headCheck.headDifferences`](./headCheck.ts.mdmd.md#symbol-headdifferences)
- [`regenerate.Scratch`](./regenerate.ts.mdmd.md#symbol-scratch)
- [`regenerate.indexPath`](./regenerate.ts.mdmd.md#symbol-indexpath)
- [`regenerate`](./regenerate.ts.mdmd.md#symbol-regenerate)
- [`regenerate.summaryPath`](./regenerate.ts.mdmd.md#symbol-summarypath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
