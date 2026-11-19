# packages/engine/src/live-docs/history/git.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/git.ts
- Generated At: 2026-11-19T08:59:53.280Z

## Authored
### Purpose
The seam's git implementation, through the `git` executable on the local clone: the first-parent mainline with its committer dates, a commit's tree written through an index of its own with nothing registered, `diff --name-status -M50%` for the renames and the content changes, the tags' commits and the shallow flag; and the parsers of git's output.

### Notes
- Written 2026-10-17 for C1 and C13 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The executable, never `.git` by hand: a `.git` can be a file pointing elsewhere and a pack is deltas (the plan's failed ideas).
- Each call states what its reading depends on, so that a person's git configuration does not change the history: `-z` for paths holding any character, `diff.relative=false`, `-l0` so that git weighs every rename however large the commit (its default limit would read a large rename as deaths and births without a word), and no hook of the repository runs, so that no checkout runs a stranger's code: a tree is written by `read-tree` and `checkout-index`, which run none (until 2026-11-19 a worktree's checkout, with `core.hooksPath` set to the null device).
- A tree holds the files as the repository stores them and its own `.gitattributes` declare it, `core.autocrlf=false` whatever the person's setting: on the dev box the global `core.autocrlf=true` checked the fixture's files out with CRLF, which the integration test met as a committed doc the grammar refused (2026-10-17). Git LFS is told to leave its pointers (`GIT_LFS_SKIP_SMUDGE`), since its smudge filter would fetch from a remote; a file kept in LFS is read as its pointer.
- The date is the committer's, when the change entered the mainline; the author's name is as git records it (C8).
- A workspace below the repository's top level is refused rather than read: its history is the repository's, and a mainline limited to its folder would miss what changes it from outside, such as a root `.gitignore`.
- Since 2026-11-19 ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37), the cost of the history's rebuild) a tree is no worktree: the commit's tree is read into an index of its own beside the tree, `<tree>.index`, and its files written from it, so that nothing is registered with the repository and trees are made at once. The generator asks git what a tree tracks and ignores (`gitIgnored`), so the tree gives a process run in it the repository, the tree and its index (`environment`): without them a tracked file a `.gitignore` names, as `.vscode/settings.json`, was left out. Over the same 48 commits of this repository the summaries and their texts were identical to those the worktrees gave, and eight processes regenerated them in 281 s against 332, four in 378 s against 551, on a machine other builders were also using. Until then git named a worktree's record after its folder's name, so each scratch tree needed a distinct folder name, and registry changes were serialized within a history run: Git reads sibling worktree metadata during removal, and concurrent teardown can remove a sibling's `commondir` while it is being read. Duplicate removal requests share one promise, as they still do. This follows the owner's [October 23 failure report](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-23/2026-10-23.1.record.md#history-failure-investigation), reproduced with three simultaneous removals in a disposable repository.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `openGitRepository` {#symbol-opengitrepository}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L54)

##### `openGitRepository` — Summary
The git repository whose top level is `workspaceRoot`, as the history
command's version control.

##### `openGitRepository` — Exceptions
- _Unknown_: When `workspaceRoot` is not in a git repository, or is a folder below its top level: the history of a repository is read whole.

#### `writeStoredTree` {#symbol-writestoredtree}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L143)

##### `writeStoredTree` — Summary
Writes every entry of a change's tree under `directory` as the repository stores it: a file's blob bytes, executable
where its mode says so; a symbolic link to the target its blob holds; an empty folder where another repository's
commit stands, as a checkout leaves a submodule it has not initialized.

##### `writeStoredTree` — Exceptions
- _Unknown_: When an entry's path would leave the directory or name a `.git`, which git itself refuses to check out.

#### `parseMainline` {#symbol-parsemainline}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L230)
- Returns: [`MainlineChange`](./versionControl.ts.mdmd.md#symbol-mainlinechange)[]

##### `parseMainline` — Summary
The changes of `git rev-list --format` with the mainline's format, oldest first as listed.

#### `parseTags` {#symbol-parsetags}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L242)

##### `parseTags` — Summary
The changes the tags of `git for-each-ref --format='%(objectname) %(*objectname)'` name: an annotated tag's peeled change, a light tag's own.

#### `parseNameStatus` {#symbol-parsenamestatus}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/git.ts#L254)
- Returns: [`VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges)

##### `parseNameStatus` — Summary
The renames and content changes of `git diff --name-status -z`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
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
