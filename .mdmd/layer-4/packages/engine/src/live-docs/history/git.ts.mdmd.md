# packages/engine/src/live-docs/history/git.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/git.ts
- Generated At: 2026-10-23T20:17:42.934Z

## Authored
### Purpose
The seam's git implementation, through the `git` executable on the local clone: the first-parent mainline with its committer dates, a detached worktree for a commit's tree, `diff --name-status -M50%` for the renames and the content changes, the tags' commits and the shallow flag; and the parsers of git's output.

### Notes
- Written 2026-10-17 for C1 and C13 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The executable, never `.git` by hand: a `.git` can be a file pointing elsewhere and a pack is deltas (the plan's failed ideas).
- Each call states what its reading depends on, so that a person's git configuration does not change the history: `-z` for paths holding any character, `diff.relative=false`, `-l0` so that git weighs every rename however large the commit (its default limit would read a large rename as deaths and births without a word), and for the worktrees the repository's hooks switched off (`core.hooksPath` set to the null device), so that no checkout runs a stranger's code.
- A worktree holds the tree as the repository stores it and its own `.gitattributes` declare it, `core.autocrlf=false` whatever the person's setting: on the dev box the global `core.autocrlf=true` checked the fixture's files out with CRLF, which the integration test met as a committed doc the grammar refused (2026-10-17). Git LFS is told to leave its pointers (`GIT_LFS_SKIP_SMUDGE`), since its smudge filter would fetch from a remote; a file kept in LFS is read as its pointer.
- The date is the committer's, when the change entered the mainline; the author's name is as git records it (C8).
- A workspace below the repository's top level is refused rather than read: its history is the repository's, and a mainline limited to its folder would miss what changes it from outside, such as a root `.gitignore`.
- Git names a worktree's record after its folder's name, so each scratch tree needs a distinct folder name. Registry changes are serialized within a history run: Git reads sibling worktree metadata during removal, and concurrent teardown can remove a sibling's `commondir` while it is being read. Analysis of already-created trees remains parallel. Duplicate removal requests share one promise; a failed removal is reported without deleting the working directory behind Git's back. This follows the owner's [October 23 failure report](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#history-failure-investigation), reproduced with three simultaneous removals in a disposable repository.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `openGitRepository` {#symbol-opengitrepository}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L44)

##### `openGitRepository` — Summary
The git repository whose top level is `workspaceRoot`, as the history
command's version control.

##### `openGitRepository` — Exceptions
- _Unknown_: When `workspaceRoot` is not in a git repository, or is a folder below its top level: the history of a repository is read whole.

#### `parseMainline` {#symbol-parsemainline}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L118)
- Returns: [`MainlineChange`](./versionControl.ts.mdmd.md#symbol-mainlinechange)[]

##### `parseMainline` — Summary
The changes of `git rev-list --format` with the mainline's format, oldest first as listed.

#### `parseTags` {#symbol-parsetags}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L130)

##### `parseTags` — Summary
The changes the tags of `git for-each-ref --format='%(objectname) %(*objectname)'` name: an annotated tag's peeled change, a light tag's own.

#### `parseNameStatus` {#symbol-parsenamestatus}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L142)
- Returns: [`VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges)

##### `parseNameStatus` — Summary
The renames and content changes of `git diff --name-status -z`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`gitUtils.execFileAsync`](../gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`versionControl.MainlineChange`](./versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`versionControl.MainlineEnd`](./versionControl.ts.mdmd.md#symbol-mainlineend) (type-only)
- [`versionControl.VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges) (type-only)
- [`VersionControl`](./versionControl.ts.mdmd.md#symbol-versioncontrol) (type-only)
- [`versionControl.WorkingTree`](./versionControl.ts.mdmd.md#symbol-workingtree) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
