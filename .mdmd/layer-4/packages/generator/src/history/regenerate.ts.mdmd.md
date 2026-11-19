# packages/generator/src/history/regenerate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/regenerate.ts
- Generated At: 2026-11-19T12:44:39.339Z

## Authored
### Purpose
What the history command does on a summary's behalf before the summarizing process runs: each sampled commit's tree written into a scratch folder by the version control, the summarizing process (`summarizeChange.ts`) started in it with its task and environment, and the folder removed after, a pool of them at once. It is in the lens's key, since what it writes and what it passes decide what a summary says.

### Notes
- Split from `computeHistory.ts` on 2026-11-19 after [the independent review of the history's data](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the code deciding which files and which environment a summary sees ran outside the key, where the guard in `generatorIdentity.test.ts` could not see it: the environment that let a file git tracks though an ignore file names into a summary had changed summaries without changing the key. `computeHistory.ts`, which reads summaries into a sequence, stays out of the key.
- The summarizing process is given the person's environment without git's own variables, then the tree's (`WorkingTree.environment`), so git's answer of what the tree tracks is the tree's whatever the person's shell set.
- `Scratch` holds every scratch folder from the moment it is made and every process started, so that a SIGINT or SIGTERM during the run, the check at the head included, ends the processes and removes the folders before the command exits; a tree being written when the signal came is no longer left behind.
- The pool starts no commit after the run's deadline (`--stop-after`) and lets the running ones finish.
- What the generator warns is gathered and said once for each message, with the number of commits that gave it, when the regeneration ends; over this repository it would otherwise repeat the scans inside the test fixtures at every commit (carried from `computeHistory.ts`, where it was written on 2026-10-17).
- Since [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) the task goes to the summarizing process in a file of the scratch folder, `task.json`, not on the command line, whose length the platform limits: a commit leaving about a thousand entries out had failed with `spawn E2BIG` at every run. The process is given a named environment (`summarizingEnvironment`: `PATH`, the temporary folders, Windows's system folders and `TSX_TSCONFIG_PATH`), and nothing else of the person's, `NODE_OPTIONS` included. Every entry a tree left out is printed, not the first three.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summaryPath` {#symbol-summarypath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L38)

##### `summaryPath` — Summary
Where a change's summary lies in the lens's cache folder.

#### `indexPath` {#symbol-indexpath}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L43)

##### `indexPath` — Summary
Where a change's full graph index lies in the lens's cache folder, when the cache keeps it.

#### `Scratch` {#symbol-scratch}
- Type: class
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L51)

##### `Scratch` — Summary
The scratch folders of a run under the system's temporary folder and the processes it started, all removed or ended
when a signal stops it: a folder is held from the moment it is made, before anything is written into it.

#### `RegenerationContext` {#symbol-regenerationcontext}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L102)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L121)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes, `jobs` at a time, each in a scratch tree under the system's temporary folder and a process
of its own, starting none after the deadline when there is one.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a process reported.

#### `summarizingEnvironment` {#symbol-summarizingenvironment}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L190)
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `summarizingEnvironment` — Summary
The environment the summarizing process is given: {@link SUMMARIZING_VARIABLES} from the command's, where set.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `ChildProcess`, `fork`
- `node:fs` - `promises`, `rmSync`
- `node:os` - `os`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`textStore.TEXT_STORE_DIRECTORY`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-text_store_directory)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`VersionControl`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`summarizeChange.SummaryReport`](./summarizeChange.ts.mdmd.md#symbol-summaryreport) (type-only)
- [`summarizeChange.SummaryTask`](./summarizeChange.ts.mdmd.md#symbol-summarytask) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
