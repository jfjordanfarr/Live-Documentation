# packages/generator/src/history/regenerate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/regenerate.ts
- Generated At: 2026-11-19T18:15:33.552Z

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
- Since 2026-11-19 the tree leaves out the files the summarizing process never opens (`unread`): those the configuration's `exclude` names, by discovery's own rule, but never a file under the docs root, which the generator rewrites whatever `exclude` says, nor one that marks a nested scan (`marksScan`, from `generator.ts`), which the generator looks for by name. Measured that day, the process at this repository's head opened no file of the excluded `AI-Agent-Workspace/`, which held 511 of the 521 GB a cold rebuild wrote ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-cost/README.md), [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-historys-tree-holds-only-what-is-read-and-the-bundles-exclusions-apply-where-summaries-are-read-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summaryPath` {#symbol-summarypath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L44)

##### `summaryPath` — Summary
Where a change's summary lies in the lens's cache folder.

#### `indexPath` {#symbol-indexpath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L49)

##### `indexPath` — Summary
Where a change's full graph index lies in the lens's cache folder, when the cache keeps it.

#### `Scratch` {#symbol-scratch}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L57)

##### `Scratch` — Summary
The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
when a signal stops it: a folder is held from the moment it is made, before anything is written into it.

#### `RegenerationContext` {#symbol-regenerationcontext}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L108)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L127)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes, `jobs` at a time, each in a scratch tree under the system's temporary folder and a process
of its own, starting none after the deadline when there is one.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a process reported.

#### `unread` {#symbol-unread}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L195)
- Parameters: `configuration`: [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `unread` — Summary
The files of a change's tree the summarizing process never opens, by their repository-relative paths, which the tree
writer leaves out: those the configuration's `exclude` names, by discovery's own rule (`matchesPathPattern`), but
never a file under the docs root, which the generator reads and rewrites whatever `exclude` says, nor a file that
marks a scan nested in the workspace (`marksScan`, by the rule the generator's own search for one reads), whose
warning holds wherever the scan lies. The tree's listing still holds them all, which is how the summary asks whether
a linked document stands. Measured on 2026-11-19 over this repository: the process opened no file of the excluded
`AI-Agent-Workspace/`, which held 511 of the 521 GB a rebuild wrote.

#### `summarizingEnvironment` {#symbol-summarizingenvironment}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L210)
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `summarizingEnvironment` — Summary
The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set.

#### `summarizingFlags` {#symbol-summarizingflags}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L225)

##### `summarizingFlags` — Summary
The flags node is started with for the summarizing process, and no other: none for the built JavaScript, and for
the TypeScript module, under tsx, tsx's loader alone. Until 2026-11-19 `fork` passed on the command's own flags
(`process.execArgv`), so that a flag given to node or tsx, as `--conditions` or `--stack-size`, reached the process
that makes a summary, where the lens could not see it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `ChildProcess`, `fork`
- `node:fs` - `promises`, `rmSync`
- `node:os` - `os`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`archetype.matchesPathPattern`](../../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`generator.marksScan`](../generator.ts.mdmd.md#symbol-marksscan)
- [`summarizeChange.SummaryReport`](./summarizeChange.ts.mdmd.md#symbol-summaryreport) (type-only)
- [`summarizeChange.SummaryTask`](./summarizeChange.ts.mdmd.md#symbol-summarytask) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
