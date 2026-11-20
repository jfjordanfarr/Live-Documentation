# `packages/generator/src/history/regenerate.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/regenerate.ts`
- Generated At: 2026-11-20T14:11:52.482Z

## Authored
### Purpose
What the history command does on a summary's behalf: a pool of workers (`summarizeChange.ts --worker`) started with their environment and node flags, each in a scratch folder of its own, and handed the sampled commits one at a time, a run of consecutive commits after another, and handed the repository's git directory, which the command found in the person's environment, so that no worker looks for the repository itself; a worker lives until the pool ends, until something threw while it took, read or released a tree-sitter tree (`runtimeFaulted`), a commit after its first in which that happened going again to a fresh worker, or until it holds more than its share of the memory the pool was sized by (`workerBound`) or half its heap's limit, and its folder is removed with it, the removal retried where it is refused. Until the independent review of 2026-11-20 ([the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md), its last section) a worker was ended after a hundred commits and after any commit in which the generator failed a file, working round the language adapters' caches, which now live for one generation. It is in the lens's key, since what it starts and what it passes decide what a summary says.

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

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summaryPath` {#symbol-summarypath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L49)

##### `summaryPath` — Summary
Where a change's summary lies in the lens's cache folder.

#### `indexPath` {#symbol-indexpath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L54)

##### `indexPath` — Summary
Where a change's full graph index lies in the lens's cache folder, when the cache keeps it.

#### `Scratch` {#symbol-scratch}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L62)

##### `Scratch` — Summary
The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
when a signal stops it: a folder is held from the moment it is made, before anything is written into it.

#### `RegenerationContext` {#symbol-regenerationcontext}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L116)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L154)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes in a pool of `jobs` workers, starting none after the deadline when there is one: processes
each started once, each taking runs of the line's consecutive changes in turn and keeping its tree from one change
to the next (`WorkingTree.bringTo`), so that a change costs what differs from the worker's last one, and not a
process and a tree of its own.

##### `regenerate` — Remarks
Until 2026-11-20 each change had a process of its own, and this module wrote every tree on the command's one main
thread, which is what the pool waited for; the record of that day (`Probes/history-rebuild-fast`) measures both. The
runs are short, about four to a worker, so that changes costing more at the line's end than at its start still
spread over every worker.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a worker reported.

#### `workerBound` {#symbol-workerbound}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L252)

##### `workerBound` — Summary
The resident memory past which a worker is replaced after a change: its share of the memory the pool was sized by,
so that the workers together never hold more than the pool planned for, whatever grows in them.

#### `Worker` {#symbol-worker}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L257)

##### `Worker` — Summary
A summarizing process started once, which summarizes changes one at a time in a tree it keeps.

#### `summarizingEnvironment` {#symbol-summarizingenvironment}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L341)
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `summarizingEnvironment` — Summary
The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set, and of
the command's `NODE_OPTIONS` only its heap limit, `--max-old-space-size`, the way a person raises it through `npm run`
(`NODE_OPTIONS=--max-old-space-size=8192 npm run live-docs:history`), which decides whether a summary of a large
repository is made at all, never what it says. Any other option in it stays out.

#### `summarizingFlags` {#symbol-summarizingflags}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L372)

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
- [`summarizeChange.WorkerReport`](./summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](./summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
