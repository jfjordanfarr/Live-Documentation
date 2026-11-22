# `packages/generator/src/history/computeHistory.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/computeHistory.ts`
- Generated At: 2026-11-22T07:12:57.044Z

## Authored
### Purpose
The history command: the mainline read and sampled, every sampled commit the cache lacks regenerated in a scratch tree by a process of its own, several at a time, and the sequence derived from consecutive summaries and git's word between them, written to `<root>/history/history.json` beside the cache.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its shape reads: for every commit not yet in the cache under the current lens, check it out into a detached worktree, generate the docs there with the lens's configuration, read the derived index, write a compact summary and remove the worktree. [The probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) ran the same by hand over 122 commits, three at a time, in ten minutes of wall clock. The decisions it carries are in [Turn 3 of October 16](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5) of October 17.
- One process per commit, so that no process holds more than one graph (scenario 4); the pool's size is the caller's to give, or this module's to derive (below). Since 2026-11-19 a scratch tree registers nothing with the repository (`git.ts`), so trees are made at once. Since a later edit that day ([the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md)) the trees and the summarizing processes are `regenerate.ts`'s, which keys the lens, since what it writes and passes decides what a summary says; this module, which reads summaries into a sequence, does not.
- The lens's configuration is the file given, or the workspace's own as it stands, applied to every commit, so that a change of the tool never looks like a change of the code (scenario 5, and the plan's recommendation of the configuration at the head). Its docs root must lie inside the workspace.
- The cache is `<root>/history/<lens>/<commit>.json.gz` since 2026-11-19 (`<commit>.json` before), with `<commit>.index.json.gz` under `--keep-index` and the lens's text store under `texts/`; a commit counts as cached when its summary, and its index when asked for, are there, and since the review the summary reads as this lens's and every text it names is in the store and is the text of its hash; any other is summarized again, a changed text removed first, so that a store damaged or copied in part mends itself rather than failing every later run. Until 2026-11-20 every summary was read for this at the run's start; since, it is found where the sequence reads a summary (below).
- Since 2026-11-19, for the owner's three rungs of history in 2D ([Turn 35](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18, "How do we mitigate these costs and risks?"): the sequence is built from each summary's shape and rows, its texts given ids as they are first met; the words of every step are written beside the sequence, each read from the text store and held to its hash, in a folder named by their content (`history-words-<hash>/`) written before the sequence that names it, so that a run stopped between the two never leaves a sequence naming parts that are gone; and the last step is held to the graph read afresh from the Live Docs committed at the head (`headCheck.ts`) when asked with `--check-head`, or when the generator runs unmodified from that commit under the workspace's own configuration, as over this repository (`HEAD_CHECK_RULE`). Elsewhere the run says the check was skipped and why; where it applies, a difference, or docs that do not read, stop the run. The message names the likely cause, a mirror not regenerated after the last change of the source, which the repository's own freshness check also refuses.
- The pool, without `--jobs`, is as many processes as half the memory this process may use holds at the peak one was measured to take on the repository, at most one fewer than the processors it may run on (`poolSize`, `usableMachine`): a container's memory limit is read through `process.constrainedMemory`, and the processors are `os.availableParallelism`, which a limit of processor time (`docker run --cpus`) does not lower. Each process sends its peak resident memory when it ends; a run records its largest in `<root>/history/pool.json` (`nextPoolRecord`), the largest of every run under the same lens, so that a run regenerating only the newest commit does not shrink it, and under a new lens the larger of the old and new until the new lens has measured as many commits. Before any measurement it expects 768 MiB, the 526 MB measured over this repository rounded up. Until 2026-11-19 the CLI chose two processes under 8 GiB and else at most three, whatever the machine.
- Every run lists the cache folders of other lenses (sixteen hexadecimal digits, not the current key) with their sizes, and `--remove-superseded` removes them, only once the current lens holds every sampled commit; nothing is removed unasked. One run at a time writes under a history folder: it holds `run.lock` there, refuses while a live process on this machine holds it, and takes over a lock whose process has ended or that came from another machine with a restored cache. At its start it removes every `*.partial` a stopped run left. `--stop-after` starts no commit past a budget; a run stopped so writes no history and throws `HistoryStopped`, which the CLI turns into exit code 3, so that the Pages workflow deploys the site without a history rather than not at all. The history folder writes its own `.gitignore`, so that no repository commits it: nothing derived from local history is committed (the owner, 2025-11-10).
- A run stopped by a signal removes its scratch trees before it exits (`Scratch` in `regenerate.ts`).
- Since [the second review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/second-review.md) the lock is a claim per run (`holdLock`): an empty file named `run.<host>.<pid>.<nonce>.lock`, made in one step, after which the run lists the claims and holds the folder only when no other live one stands, else withdraws, waits a random moment and tries again. Two runs meeting a dead lock had both been able to proceed under the old single file. A signal removes the claim (`Scratch.hold`). With `--remove-superseded`, the run keeps beside the current lens only the newest whole one, marked by the `whole.json` a run writes once it wrote a history from a lens.
- Since [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) the run lists beside the sequence, in `unwritten.txt`, every file a summary says its tree did not hold, the commit, the path and the reason a line, and says where (the list's header speaks of what this disk could not hold, though some reasons, a link in the commit or a name that is not UTF-8, hold on every disk); the sequence does not carry them, so such a file reads in it as gone at that commit.
- Since 2026-11-19 each summary is read through `bundledSummary` with the configuration's `bundleExclude`, the one place the bundle's exclusions are applied to the history. The run's line and `unwritten.txt` say an entry was not written into its tree, with the reason, no longer that the disk could not hold it.

- Since 2026-11-20 ([the record of making a run fast](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) a run reads each summary it needs once and every text once: whether a cached summary reads, and whether the texts it names are sound, is found where the sequence reads it (`deriveSequence`), and such a commit is summarized again and the sequence read again, where before every summary was read twice and every text twice. A run goes on from the sequence the last run wrote, when the record beside it (`history-resume.json`) names its bytes under this run's key (the lens, `sequenceCodeIdentity` of the code that reads summaries into a sequence, and the whole configuration) and its every commit is the first of those sampled now as this run would write it; then only the last written commit's summary and the new ones are read, and the bytes written are those of a whole derivation (`--rederive`), which the integration test and the record hold to each other. The steps' git words are asked before any summary is read, eight at once, since starting a process from a large heap was most of their cost; the check at the head reads the committed docs from git's object store (`headCheck.ts`) instead of writing the head's whole tree. None of it moves the lens's key: this module, `headCheck.ts`, `sequence.ts` and `generatorIdentity.ts` are not keyed.
- Mended the same day after [an independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-independent-review-and-its-mends): the code's identity, git's version now in it, is taken at the run's start beside the generator's, so that code changed during a long run never keys a record of what the old code wrote; the record is checked to be its shape and to hold its own hash before it is believed (format `live-docs-history-resume/2`); a run that goes on and meets damage summarizing again does not mend derives every step instead, once, and says so; the check at the head compares no file the head's summary lists as left out of its tree, and names each; a change both missing and summarized again counts once. The key is broad: any commit that touches the engine or the generator derives every step once at the next run, and a repository that only uses the tool goes on every time. For a change that shows only at early steps the key is the only guard, and the integration tests hold it, the code's half and the configuration's.
- Later on 2026-11-20 ([the sixth round of the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-sixth-round-what-the-person-is-told-of-a-file-not-mapped-november-20-from-1530-utc)), on a review's finding that the files a summary names as not mapped (`unmapped`) were read back by nothing: both kinds of what the history did not read at a commit, the entries its tree did not hold and the files the generator could not map, take one path through this module (`NOT_READ`), each with its list beside the sequence (`unwritten.txt`, `unmapped.txt`), its line on every run, its place in the record a run goes on from (format `live-docs-history-resume/3`) and its clause in the check at the head's passing over. The run's line counts each file once and each commit once, where it had counted a file at every commit it stood unread through. The sequence still reads such a file as removed at that commit; a sign of its own is put to the owner.
- Since the evening of 2026-11-20 ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-worker-summarizes-one-commit-unless-asked-to-keep-going-recorded-2026-11-20)) `keepWorkers` (the CLI's `--keep-workers`) is handed to `lensOf`, which keys it where it is true, and the pool reads it from the lens; without it every commit is summarized by a process of its own, as the note above on one process per commit first said. The record a run goes on from is keyed by the lens, so a run with the other choice derives every step again; the pool's sizing and `--jobs` are the same either way.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryOptions` {#symbol-historyoptions}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L102)

##### `HistoryOptions` — Summary
What to compute.

#### `SupersededCache` {#symbol-supersededcache}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L139)

##### `SupersededCache` — Summary
A cache folder under the history folder that belongs to another lens than the current one and its twin.

#### `HistoryRun` {#symbol-historyrun}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L151)

##### `HistoryRun` — Summary
What a run did.

#### `HistoryStopped` {#symbol-historystopped}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L178)

##### `HistoryStopped` — Summary
A run that stopped, as asked, before the cache held every sampled change: no sequence was written.

#### `HEAD_CHECK_RULE` {#symbol-head_check_rule}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L183)

##### `HEAD_CHECK_RULE` — Summary
When the check at the head applies, in the words the command prints when it skips it.

#### `UNMEASURED_PEAK_MEMORY` {#symbol-unmeasured_peak_memory}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L245)

##### `UNMEASURED_PEAK_MEMORY` — Summary
What one summarizing process is expected to take before any has been measured on a repository: the largest peak
measured on 2026-11-19 over every 25th commit of this repository's history and its head (1,064 files), 526 MB,
rounded up to 768 MiB. A larger repository takes more, which its first run measures and records.

#### `poolSize` {#symbol-poolsize}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L252)

##### `poolSize` — Summary
How many summarizing processes a machine runs at once: as many as half its memory holds at the measured peak of
one, since the person's own work goes on beside the run, and one fewer than its processors, since each process
keeps one busy and the command and git need one; never fewer than one.

#### `poolMemory` {#symbol-poolmemory}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L258)

##### `poolMemory` — Summary
The memory the pool may hold, half the machine's, by which it is sized ({@link poolSize}) and each worker bounded (`workerBound`).

#### `usableMachine` {#symbol-usablemachine}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L268)

##### `usableMachine` — Summary
The memory and the processors this process may use: the machine's, or less where the operating system says so. In
a container whose memory is limited, `process.constrainedMemory` reads the limit from the control group; the
processors are those the process may be scheduled on, `os.availableParallelism`, which a limit of processor time
(`docker run --cpus`) does not lower.

#### `computeHistory` {#symbol-computehistory}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L274)
- Parameters: `options`: [`HistoryOptions`](#symbol-historyoptions)

##### `computeHistory` — Summary
Computes the history and writes the sequence.

#### `holdLock` {#symbol-holdlock}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L520)

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
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L643)

##### `PoolRecord` — Summary
What runs measured of a summarizing process's peak memory on this repository.

#### `nextPoolRecord` {#symbol-nextpoolrecord}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L685)
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
- Source: [source](../../../../../../packages/generator/src/history/computeHistory.ts#L1220)

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
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput) (type-only)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`liveDocumentationConfig.parseLiveDocumentationConfigBytes`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-parselivedocumentationconfigbytes)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`bundled.bundledSummary`](../../../engine/src/live-docs/history/bundled.ts.mdmd.md#symbol-bundledsummary)
- [`codec.Interner`](../../../engine/src/live-docs/history/codec.ts.mdmd.md#symbol-interner)
- [`format.CommitInfo`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`format.HISTORY_DIRECTORY`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_directory)
- [`format.HISTORY_FILE`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_file)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`format.HistorySequence`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`format.Sampling`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-sampling) (type-only)
- [`git.openGitRepository`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`lens.canonicalJson`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-canonicaljson)
- [`lens.lensOf`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-lensof)
- [`rows.linksOf`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-linksof)
- [`rows.rowsOfSummary`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-rowsofsummary)
- [`sampling.sampleChanges`](../../../engine/src/live-docs/history/sampling.ts.mdmd.md#symbol-samplechanges)
- [`sequence.SequenceBuilder`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`sequence.momentAt`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-momentat)
- [`shape.shapeOfSummary`](../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shapeofsummary)
- [`summary.CommitSummary`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-commitsummary) (type-only)
- [`summary.HISTORY_SUMMARY_FORMAT`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-history_summary_format)
- [`summary.textHash`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-texthash)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`textStore.textPath`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-textpath)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`words.WORDS_DIRECTORY`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-words_directory)
- [`words.WordsHead`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-wordshead) (type-only)
- [`words.wordsStore`](../../../engine/src/live-docs/history/words.ts.mdmd.md#symbol-wordsstore)
- [`sourceText.throwIfMachineFailure`](../../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`generatorIdentity`](./generatorIdentity.ts.mdmd.md#symbol-generatoridentity)
- [`generatorIdentity.sequenceCodeIdentity`](./generatorIdentity.ts.mdmd.md#symbol-sequencecodeidentity)
- [`headCheck.committedLiveDocGraph`](./headCheck.ts.mdmd.md#symbol-committedlivedocgraph)
- [`headCheck.headDifferences`](./headCheck.ts.mdmd.md#symbol-headdifferences)
- [`headCheck.leftOutAtHead`](./headCheck.ts.mdmd.md#symbol-leftoutathead)
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
