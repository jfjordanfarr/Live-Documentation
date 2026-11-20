# `packages/generator/src/history/regenerate.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/regenerate.ts`
- Generated At: 2026-11-20T19:52:27.042Z

## Authored
### Purpose
What the history command does on a summary's behalf: a pool of workers (`summarizeChange.ts --worker`) started with their environment and node flags, each in a scratch folder of its own, and handed one sampled commit, after which it is ended, and the repository's git directory, which the command found in the person's environment, so that no worker looks for the repository itself. Where the lens says workers are kept (`--keep-workers`), a worker is handed the sampled commits one at a time, a run of consecutive commits after another, and lives until the pool ends, until something threw while it took, read or released a tree-sitter tree (`runtimeFaulted`), a commit after its first in which that happened going again to a fresh worker, or until it holds more than its share of the memory the pool was sized by (`workerBound`) or half its heap's limit, and its folder is removed with it, the removal retried where it is refused. Until the independent review of 2026-11-20 ([the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md), its last section) a worker was ended after a hundred commits and after any commit in which the generator failed a file, working round the language adapters' caches, which now live for one generation. It is in the lens's key, since what it starts and what it passes decide what a summary says.

### Notes
- Split from `computeHistory.ts` on 2026-11-19 after [the independent review of the history's data](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the code deciding which files and which environment a summary sees ran outside the key, where the guard in `generatorIdentity.test.ts` could not see it: the environment that let a file git tracks though an ignore file names into a summary had changed summaries without changing the key. `computeHistory.ts`, which reads summaries into a sequence, stays out of the key.
- The summarizing process is given a named environment (`summarizingEnvironment`), then the tree's (`WorkingTree.environment`), so git's answer of what the tree tracks is the tree's whatever the person's shell set; until the third review it was given the person's whole environment less git's variables, and its own comment said so until 2026-11-19. Since 2026-11-19 it is started with node flags of its own (`summarizingFlags`): none for the built JavaScript, and tsx's loader alone for the TypeScript module; `fork` had passed the command's `execArgv`, which the guard could not see.
- `Scratch` holds every scratch folder from the moment it is made and every process started, so that a SIGINT or SIGTERM during the run, the check at the head included, ends the processes and removes the folders before the command exits; a tree being written when the signal came is no longer left behind.
- The pool starts no commit after the run's deadline (`--stop-after`) and lets the running ones finish.
- What the generator warns is gathered and said once for each message, with the number of commits that gave it, when the regeneration ends; over this repository it would otherwise repeat the scans inside the test fixtures at every commit (carried from `computeHistory.ts`, where it was written on 2026-10-17).
- Since [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) the task goes to the summarizing process in a file of the scratch folder, `task.json`, not on the command line, whose length the platform limits: a commit leaving about a thousand entries out had failed with `spawn E2BIG` at every run. The process is given a named environment (`summarizingEnvironment`: `PATH`, the temporary folders, Windows's system folders and `TSX_TSCONFIG_PATH`), and nothing else of the person's, `NODE_OPTIONS` included. Every entry a tree left out is printed, not the first three.
- Since 2026-11-19 ([the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/engine-round-review/README.md) of the engine round) the tree is written as `treeOptions` asks: every name stands, and an excluded image, font or recording (`isMediaAsset`), outside the docs root as discovery reads it (`docsRootWithin`), is written empty; every other file is whole. For a few hours that day every excluded file no reader handles (`hasReader`) was written empty, until the review's second pass found the C reader opening the `.def` and `.inc` files an include names (`tests/integration/fixtures/c-include-excluded`). A first build that day left excluded files out on the strength of one measurement over this repository, and the review showed by runs that the generator does read excluded files included code imports; the rule is held to the whole tree as the oracle over every sample workspace (`history-tree-equivalence.test.ts`). At this repository's head 3,554 files, 867 MB, are written empty, and the tree is about 150 MB where a checkout is 1,017 MB.
- The summarizing process is handed `summarizedConfiguration` of the lens's configuration, the one the key holds, and its node flags carry the command's own `--max-old-space-size` and no other of the command's (`summarizingFlags`).
- Since 2026-11-20 ([the record of that day](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) the workers live across commits and write their own trees; before, this module wrote every commit's tree on the command's one main thread and started a process for each, and a rebuild waited on that thread. The task file, the one-process pool (`inPool`, `runSummary`) and the version control in `RegenerationContext` went with it; the context names the repository each worker opens. The notes above on the tree's environment and on `treeOptions` describe what the worker now does (`summarizeChange.ts`). A worker that cannot be ended, or whose folder cannot be removed, fails the run once every lane has stopped, and a worker's folder is removed only once its process has exited.
- Later on 2026-11-20 ([the sixth round of the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-sixth-round-what-the-person-is-told-of-a-file-not-mapped-november-20-from-1530-utc)) a review found two of the run's last lines counting what they did not say: the files the generator could not map were counted once at every commit that held one, and a commit counted as decided by a fresh process only where the fresh process was itself marked, so that a commit a warm worker was refused for a mark the fresh one does not repeat was missing from the totals. The files are now counted once each, with the number of commits at which any was, and every commit a fresh process decided is counted by what the worker that first took it was marked for, and by a failure of the machine's where that sent it there (`DECIDED_WORDS`). A failure of the machine's counts under its own reason alone: the generator's catch marks every failure as a file not mapped before anyone knows whose it is, so that mark counts only where another file of the commit could not be mapped (the root's ruling on the round's handback). The stand-in pool's cases in `regenerate.test.ts` hold both and the gathered warning that names a file not mapped.
- The task a worker is sent is made by `workerTask` since the review of the cache's key, the same day ([the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-commands-end-of-the-case-setting-november-20-from-1617-utc)), which cut the route of git's `core.ignorecase` from the lens to a worker's tree here with no test of the history going red: it sends the lens's `ignoresCase`, `true` where the lens says so and `false` where it does not, and a case of `regenerate.test.ts` holds it.
- Since the evening of 2026-11-20 ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-worker-summarizes-one-commit-unless-asked-to-keep-going-recorded-2026-11-20), [the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#one-commit-a-worker-by-default-november-20-from-1915-utc)) a worker summarizes one commit and is ended, which is a fresh process summarizing a commit, unless the lens says workers are kept (`keepWorkers`, the command's `--keep-workers`, off by default and not yet shown to make the summaries a fresh process makes): three reviews of the count of nesting that let a kept worker go on (`processMark.ts`) each found valid code it called shallow. The pool reads the choice from the lens, so the key and the run cannot disagree. The run says once, at its start, which way it runs; "its tree written anew" on each commit's line, the closing count of trees written anew, a worker's replacement for its memory and the lines of commits a fresh process decided for a mark are said only where workers are kept, while a failure of the machine's, tried once more in another fresh worker, is said and counted either way.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summaryPath` {#symbol-summarypath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L56)

##### `summaryPath` — Summary
Where a change's summary lies in the lens's cache folder.

#### `indexPath` {#symbol-indexpath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L61)

##### `indexPath` — Summary
Where a change's full graph index lies in the lens's cache folder, when the cache keeps it.

#### `Scratch` {#symbol-scratch}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L69)

##### `Scratch` — Summary
The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
when a signal stops it: a folder is held from the moment it is made, before anything is written into it.

#### `RegenerationContext` {#symbol-regenerationcontext}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L123)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L160)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes in a pool of `jobs` workers, starting none after the deadline when there is one: a process
and a tree of its own for each change, unless the lens says workers are kept (`keepWorkers`), when processes each
started once take runs of the line's consecutive changes in turn and keep their tree from one change to the next
(`WorkingTree.bringTo`), so that a change costs what differs from the worker's last one.

##### `regenerate` — Remarks
Until 2026-11-20 this module wrote every tree on the command's one main thread, which is what the pool waited for;
the record of that day (`Probes/history-rebuild-fast`) measures both. The runs are short, about four to a worker,
so that changes costing more at the line's end than at its start still spread over every kept worker.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a worker reported.

#### `workerBound` {#symbol-workerbound}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L298)

##### `workerBound` — Summary
The resident memory past which a worker is replaced after a change: its share of the memory the pool was sized by,
so that the workers together never hold more than the pool planned for, whatever grows in them.

#### `Worker` {#symbol-worker}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L303)

##### `Worker` — Summary
A summarizing process, which summarizes the changes it is handed one at a time in a tree it keeps until it is ended.

#### `workerTask` {#symbol-workertask}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L370)
- Returns: [`WorkerTask`](./summarizeChange.ts.mdmd.md#symbol-workertask)
- Parameters: `change`: [`MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange)

##### `workerTask` — Summary
What a worker is sent for one change: the lens's configuration as a summary is made under it, its key, the change, and
where the summary, its texts and its index go; and whether the repository matches names without regard to case, as
the lens keyed it, `true` where the lens says so and `false` where it does not (never absent), to which the worker's
trees pin git's `core.ignorecase`, so that the generator reads the value the key holds. Made apart from {@link
 * startWorker} since the review of the cache's key (2026-11-20), so that a case holds the command's end of that route.

#### `summarizingEnvironment` {#symbol-summarizingenvironment}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L398)
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `summarizingEnvironment` — Summary
The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set, and of
the command's `NODE_OPTIONS` only its heap limit, `--max-old-space-size`, the way a person raises it through `npm run`
(`NODE_OPTIONS=--max-old-space-size=8192 npm run live-docs:history`), which decides whether a summary of a large
repository is made at all, never what it says. Any other option in it stays out.

#### `summarizingFlags` {#symbol-summarizingflags}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L429)

##### `summarizingFlags` — Summary
The flags node is started with for the summarizing process, and no other: for the TypeScript module, under tsx,
tsx's loader; and the command's own `--max-old-space-size`, when it was given one, which decides whether a summary
of a large repository is made at all, never what it says. Until 2026-11-19 `fork` passed on every flag of the
command's (`process.execArgv`), so that a flag such as `--conditions` or `--stack-size` reached the process that
makes a summary, where the lens could not see it; for a while after, none was passed, and a summary that outgrew
node's default heap could not be made by any means.

##### `summarizingFlags` — Parameters
- `commandFlags`: The command's own flags, `process.execArgv` unless a test gives others.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `ChildProcess`, `fork`
- `node:fs` - `promises`, `rmSync`
- `node:os` - `os`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`lens.summarizedConfiguration`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`ProcessMark`](../../../engine/src/live-docs/processMark.ts.mdmd.md#symbol-processmark) (type-only)
- [`summarizeChange.WorkerReport`](./summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](./summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
