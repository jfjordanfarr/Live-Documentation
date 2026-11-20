# `packages/engine/src/live-docs/history/versionControl.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/history/versionControl.ts`
- Generated At: 2026-11-20T14:11:49.492Z

## Authored
### Purpose
The seam between the history command and a version control: where the mainline ends and whether the copy is truncated, the mainline's changes oldest first, the tagged changes, a working tree at a change removed after, and the renames and in-place content changes between two changes.

### Notes
- Written 2026-10-17 for C13 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), the owner's question of that day ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3)) how the machinery of change can be "sufficiently decoupled from the source control mechanism that we can aim to support TFS and other versioning systems' change formats later". The interface is the plan's first reading of C13, the mainline, a tree at a change and the renames between two, with what the command also needs: the truncation, the tags and the content changes. C13 waits on the survey the plan names, and this interface changes with it.
- No method reaches a remote or asks for credentials, the owner's rule of 2025-11-08, re-affirmed on 2026-10-16.
- Since 2026-11-19 `workingTree` takes what its caller asks of the tree (`WorkingTreeOptions`): the files whose names must stand but whose content no reader reads, written empty, and the docs root, at or above which no symbolic link is written even as a copy.
- Since 2026-11-20 ([the record of that day](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) a working tree can be brought to another change at a new folder (`WorkingTree.bringTo`), holding exactly what `workingTree` writes there, and says whether it was (`broughtForward`), for the history's workers that live across changes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MainlineChange` {#symbol-mainlinechange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L25)
- Extends: [`CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo)

##### `MainlineChange` — Summary
One change on the mainline, with its author's name as the version control records it.

#### `VersionChanges` {#symbol-versionchanges}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L30)

##### `VersionChanges` — Summary
What the version control says happened between two changes, by workspace-relative path.

#### `MainlineEnd` {#symbol-mainlineend}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L38)

##### `MainlineEnd` — Summary
Where the mainline ends, and whether the copy holds all of it.

#### `WorkingTree` {#symbol-workingtree}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L52)

##### `WorkingTree` — Summary
A working tree at one change, in a directory of the caller's choosing, until it is removed.

#### `WorkingTreeOptions` {#symbol-workingtreeoptions}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L82)

##### `WorkingTreeOptions` — Summary
What the caller asks of a change's tree beyond the change's own entries.

#### `VersionControl` {#symbol-versioncontrol}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/versionControl.ts#L97)

##### `VersionControl` — Summary
What the history command needs of a version control.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
