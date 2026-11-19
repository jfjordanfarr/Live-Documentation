# packages/generator/src/history/regenerate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/regenerate.ts
- Generated At: 2026-11-19T08:59:55.183Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L97)

##### `RegenerationContext` — Summary
What regenerating needs.

#### `regenerate` {#symbol-regenerate}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/regenerate.ts#L116)
- Parameters: `context`: [`RegenerationContext`](#symbol-regenerationcontext)

##### `regenerate` — Summary
Regenerates the changes, `jobs` at a time, each in a scratch tree under the system's temporary folder and a process
of its own, starting none after the deadline when there is one.

##### `regenerate` — Returns
How long each change regenerated took, in milliseconds, and the largest peak memory a process reported.
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
