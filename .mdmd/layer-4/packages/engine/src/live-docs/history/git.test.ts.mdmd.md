# packages/engine/src/live-docs/history/git.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/git.test.ts
- Generated At: 2026-11-19T12:44:36.996Z

## Authored
### Purpose
Vitest over a commit's tree for the history and the parsers of git's output: the mainline's records after rev-list's commit lines, the renames and in-place changes of a NUL-separated name-status listing with paths holding a tab and a newline, and the tags' commits.

### Notes
Since 2026-11-19 a tree is written through an index of its own and registers no worktree ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37), the cost of the history's rebuild), so the case that held the worktree registry's serialization, added for the [October 23 concurrent cleanup failure](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-23/2026-10-23.1.record.md#history-failure-investigation), gave way to two: two trees read their commits at once, each through its own index file, with no `worktree` command, a process in a tree is given the repository, the tree and its index, signal and worker removals join one operation that removes the tree and its index; and a commit that cannot be read leaves nothing behind.

- Written 2026-10-17 for C1. The git calls themselves are exercised over a real repository in [history.test.ts](../../../../../tests/integration/live-docs/history.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`git.DiskEntry`](./git.ts.mdmd.md#symbol-diskentry)
- [`git.TreeDisk`](./git.ts.mdmd.md#symbol-treedisk)
- [`git.openGitRepository`](./git.ts.mdmd.md#symbol-opengitrepository)
- [`git.parseMainline`](./git.ts.mdmd.md#symbol-parsemainline)
- [`git.parseNameStatus`](./git.ts.mdmd.md#symbol-parsenamestatus)
- [`git.parseTags`](./git.ts.mdmd.md#symbol-parsetags)
- [`git.placeEntry`](./git.ts.mdmd.md#symbol-placeentry)
- [`git.writeStoredTree`](./git.ts.mdmd.md#symbol-writestoredtree)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
