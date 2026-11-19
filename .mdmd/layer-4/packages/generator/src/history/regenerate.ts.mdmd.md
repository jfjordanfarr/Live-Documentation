# packages/generator/src/history/regenerate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/regenerate.ts
- Generated At: 2026-11-19T19:05:09.606Z

## Authored
### Purpose
What the history command does on a summary's behalf before the summarizing process runs: each sampled commit's tree written into a scratch folder by the version control, the summarizing process (`summarizeChange.ts`) started in it with its task and environment, and the folder removed after, a pool of them at once. It is in the lens's key, since what it writes and what it passes decide what a summary says.

### Notes
- Split from `computeHistory.ts` on 2026-11-19 after [the independent review of the history's data](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the code deciding which files and which environment a summary sees ran outside the key, where the guard in `generatorIdentity.test.ts` could not see it: the environment that let a file git tracks though an ignore file names into a summary had changed summaries without changing the key. `computeHistory.ts`, which reads summaries into a sequence, stays out of the key.
- The summarizing process is given a named environment (`summarizingEnvironment`), then the tree's (`WorkingTree.environment`), so git's answer of what the tree tracks is the tree's whatever the person's shell set; until the third review it was given the person's whole environment less git's variables, and its own comment said so until 2026-11-19. Since 2026-11-19 it is started with node flags of its own (`summarizingFlags`): none for the built JavaScript, and tsx's loader alone for the TypeScript module; `fork` had passed the command's `execArgv`, which the guard could not see.
- `Scratch` holds every scratch folder from the moment it is made and every process started, so that a SIGINT or SIGTERM during the run, the check at the head included, ends the processes and removes the folders before the command exits; a tree being written when the signal came is no longer left behind.
- The pool starts no commit after the run's deadline (`--stop-after`) and lets the running ones finish.
- What the generator warns is gathered and said once for each message, with the number of commits that gave it, when the regeneration ends; over this repository it would otherwise repeat the scans inside the test fixtures at every commit (carried from `computeHistory.ts`, where it was written on 2026-10-17).
- Since [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) the task goes to the summarizing process in a file of the scratch folder, `task.json`, not on the command line, whose length the platform limits: a commit leaving about a thousand entries out had failed with `spawn E2BIG` at every run. The process is given a named environment (`summarizingEnvironment`: `PATH`, the temporary folders, Windows's system folders and `TSX_TSCONFIG_PATH`), and nothing else of the person's, `NODE_OPTIONS` included. Every entry a tree left out is printed, not the first three.
- Since 2026-11-19 ([the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/engine-round-review/README.md) of the engine round) the tree is written as `treeOptions` asks: every name stands, and an excluded file no reader handles (`hasReader`), outside the docs root as discovery reads it (`docsRootWithin`), is written empty. A first build that day left excluded files out on the strength of one measurement over this repository, and the review showed by runs that the generator does read excluded files included code imports; the rule is held to the whole tree as the oracle over every sample workspace (`history-tree-equivalence.test.ts`). At this repository's head the tree is 29 MB where a checkout is 1,017 MB.
- The summarizing process is handed `summarizedConfiguration` of the lens's configuration, the one the key holds, and its node flags carry the command's own `--max-old-space-size` and no other of the command's (`summarizingFlags`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summaryPath` {#symbol-summarypath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L45)

##### `summaryPath` — Summary
Where a change's summary lies in the lens's cache folder.

#### `indexPath` {#symbol-indexpath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L50)

##### `indexPath` — Summary
Where a change's full graph index lies in the lens's cache folder, when the cache keeps it.

#### `Scratch` {#symbol-scratch}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L58)

##### `Scratch` — Summary
The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
when a signal stops it: a folder is held from the moment it is made, before anything is written into it.

#### `RegenerationContext` {#symbol-regenerationcontext}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L109)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L128)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes, `jobs` at a time, each in a scratch tree under the system's temporary folder and a process
of its own, starting none after the deadline when there is one.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a process reported.

#### `treeOptions` {#symbol-treeoptions}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L201)
- Returns: [`WorkingTreeOptions`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtreeoptions)
- Parameters: `configuration`: [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `treeOptions` — Summary
What the history asks of a change's tree written at `tree`: every name stands, and every file a reader can read
holds its content. A file is written empty only when the configuration's `exclude` names it (by discovery's own
rule, `matchesPathPattern`), no reader handles it (`hasReader`), and it lies outside the docs root (discovery's
`docsRootWithin`), which the generator reads and rewrites whatever `exclude` says: so an import of an asset, a
resolver's probe or a search for nested scans finds what it finds over a checkout, and the bytes no reader reads,
which were 511 of the 521 GB a rebuild of this repository wrote (2026-11-19), are not written. A symbolic link at,
above or beneath the docs root is not written even as a copy.

Until a review of 2026-11-19 the excluded files were left out altogether, on the strength of one measurement over
this repository that the summarizing process opened none; the generator does read excluded files that included
code imports or re-exports, and probes the disk for others.

#### `summarizingEnvironment` {#symbol-summarizingenvironment}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L220)
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `summarizingEnvironment` — Summary
The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set.

#### `summarizingFlags` {#symbol-summarizingflags}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L239)

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
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.hasReader`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-hasreader)
- [`archetype.matchesPathPattern`](../../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`discovery.docsRootWithin`](../../../engine/src/live-docs/discovery.ts.mdmd.md#symbol-docsrootwithin)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`lens.summarizedConfiguration`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`versionControl.WorkingTreeOptions`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtreeoptions) (type-only)
- [`summarizeChange.SummaryReport`](./summarizeChange.ts.mdmd.md#symbol-summaryreport) (type-only)
- [`summarizeChange.SummaryTask`](./summarizeChange.ts.mdmd.md#symbol-summarytask) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
