# packages/generator/src/history/computeHistory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/computeHistory.ts
- Generated At: 2026-11-19T12:01:27.304Z

## Authored
### Purpose
The history command: the mainline read and sampled, every sampled commit the cache lacks regenerated in a scratch tree by a process of its own, several at a time, and the sequence derived from consecutive summaries and git's word between them, written to `<root>/history/history.json` beside the cache.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its shape reads: for every commit not yet in the cache under the current lens, check it out into a detached worktree, generate the docs there with the lens's configuration, read the derived index, write a compact summary and remove the worktree. [The probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) ran the same by hand over 122 commits, three at a time, in ten minutes of wall clock. The decisions it carries are in [Turn 3 of October 16](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5) of October 17.
- One process per commit, so that no process holds more than one graph (scenario 4); the pool's size is the caller's to give, or this module's to derive (below). Since 2026-11-19 a scratch tree registers nothing with the repository (`git.ts`), so trees are made at once. Since a later edit that day ([the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md)) the trees and the summarizing processes are `regenerate.ts`'s, which keys the lens, since what it writes and passes decides what a summary says; this module, which reads summaries into a sequence, does not.
- The lens's configuration is the file given, or the workspace's own as it stands, applied to every commit, so that a change of the tool never looks like a change of the code (scenario 5, and the plan's recommendation of the configuration at the head). Its docs root must lie inside the workspace.
- The cache is `<root>/history/<lens>/<commit>.json.gz` since 2026-11-19 (`<commit>.json` before), with `<commit>.index.json.gz` under `--keep-index` and the lens's text store under `texts/`; a commit counts as cached when its summary, and its index when asked for, are there, and since the review the summary reads as this lens's and every text it names is in the store and is the text of its hash; any other is summarized again, a changed text removed first, so that a store damaged or copied in part mends itself rather than failing every later run.
- Since 2026-11-19, for the owner's three rungs of history in 2D ([Turn 35](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18, "How do we mitigate these costs and risks?"): the sequence is built from each summary's shape and rows, its texts given ids as they are first met; the words of every step are written beside the sequence, each read from the text store and held to its hash, in a folder named by their content (`history-words-<hash>/`) written before the sequence that names it, so that a run stopped between the two never leaves a sequence naming parts that are gone; and the last step is held to the graph read afresh from the Live Docs committed at the head (`headCheck.ts`) when asked with `--check-head`, or when the generator runs unmodified from that commit under the workspace's own configuration, as over this repository (`HEAD_CHECK_RULE`). Elsewhere the run says the check was skipped and why; where it applies, a difference, or docs that do not read, stop the run. The message names the likely cause, a mirror not regenerated after the last change of the source, which the repository's own freshness check also refuses.
- The pool, without `--jobs`, is as many processes as half the memory this process may use holds at the peak one was measured to take on the repository, at most one fewer than the processors it may run on (`poolSize`, `usableMachine`): a container's memory limit is read through `process.constrainedMemory`, and the processors are `os.availableParallelism`, which a limit of processor time (`docker run --cpus`) does not lower. Each process sends its peak resident memory when it ends; a run records its largest in `<root>/history/pool.json` (`nextPoolRecord`), the largest of every run under the same lens, so that a run regenerating only the newest commit does not shrink it, and under a new lens the larger of the old and new until the new lens has measured as many commits. Before any measurement it expects 768 MiB, the 526 MB measured over this repository rounded up. Until 2026-11-19 the CLI chose two processes under 8 GiB and else at most three, whatever the machine.
- Every run lists the cache folders of other lenses (sixteen hexadecimal digits, not the current key) with their sizes, and `--remove-superseded` removes them, only once the current lens holds every sampled commit; nothing is removed unasked. One run at a time writes under a history folder: it holds `run.lock` there, refuses while a live process on this machine holds it, and takes over a lock whose process has ended or that came from another machine with a restored cache. At its start it removes every `*.partial` a stopped run left. `--stop-after` starts no commit past a budget; a run stopped so writes no history and throws `HistoryStopped`, which the CLI turns into exit code 3, so that the Pages workflow deploys the site without a history rather than not at all. The history folder writes its own `.gitignore`, so that no repository commits it: nothing derived from local history is committed (the owner, 2025-11-10).
- A run stopped by a signal removes its scratch trees, the check at the head's included, before it exits (`Scratch` in `regenerate.ts`).
- Since [the second review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/second-review.md) the lock is a claim per run (`holdLock`): an empty file named `run.<host>.<pid>.<nonce>.lock`, made in one step, after which the run lists the claims and holds the folder only when no other live one stands, else withdraws, waits a random moment and tries again. Two runs meeting a dead lock had both been able to proceed under the old single file. A signal removes the claim (`Scratch.hold`). With `--remove-superseded`, the run keeps beside the current lens only the newest whole one, marked by the `whole.json` a run writes once it wrote a history from a lens.
- Since [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) the run lists beside the sequence, in `unwritten.txt`, every file a summary says its tree did not hold, the commit, the path and the reason a line, and says where; the sequence does not carry them, so such a file reads in it as gone at that commit.

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
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L160)

##### `UNMEASURED_PEAK_MEMORY` — Summary
What one summarizing process is expected to take before any has been measured on a repository: the largest peak
measured on 2026-11-19 over every 25th commit of this repository's history and its head (1,064 files), 526 MB,
rounded up to 768 MiB. A larger repository takes more, which its first run measures and records.

#### `poolSize` {#symbol-poolsize}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L167)

##### `poolSize` — Summary
How many summarizing processes a machine runs at once: as many as half its memory holds at the measured peak of
one, since the person's own work goes on beside the run, and one fewer than its processors, since each process
keeps one busy and the command and git need one; never fewer than one.

#### `usableMachine` {#symbol-usablemachine}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L178)

##### `usableMachine` — Summary
The memory and the processors this process may use: the machine's, or less where the operating system says so. In
a container whose memory is limited, `process.constrainedMemory` reads the limit from the control group; the
processors are those the process may be scheduled on, `os.availableParallelism`, which a limit of processor time
(`docker run --cpus`) does not lower.

#### `computeHistory` {#symbol-computehistory}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L184)
- Parameters: `options`: [`HistoryOptions`](#symbol-historyoptions)

##### `computeHistory` — Summary
Computes the history and writes the sequence.

#### `holdLock` {#symbol-holdlock}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L350)

##### `holdLock` — Summary
Claims the history folder for this run, or refuses while another run on this machine holds a claim.

##### `holdLock` — Remarks
Each run makes a claim of its own, an empty file whose name says the machine and the process, and only then lists
the claims there are: it holds the folder when no other claim of a live run stands, and otherwise withdraws its own,
waits a short random while and tries again, refusing after {@link LOCK_ATTEMPTS} tries. Two runs can never both
hold the folder: each made its claim before it looked, so the later to look always sees the other's. A claim whose
process has ended on this machine, or that a run on another machine left in a folder copied here, as a restored
cache is, is removed by whoever meets it, which is safe whoever else removes it too. Until a second review of
2026-11-19 one lock file was written and then taken over by removing it, and two runs meeting a dead lock at once
could both proceed, one removing the other's fresh lock.

##### `holdLock` — Returns
The claim's path, which the caller removes when the run ends.

#### `PoolRecord` {#symbol-poolrecord}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L521)

##### `PoolRecord` — Summary
What runs measured of a summarizing process's peak memory on this repository.

#### `nextPoolRecord` {#symbol-nextpoolrecord}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L549)
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
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L773)

##### `formatBytes` — Summary
A size in the units a person reads it in.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`, `randomBytes`
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
