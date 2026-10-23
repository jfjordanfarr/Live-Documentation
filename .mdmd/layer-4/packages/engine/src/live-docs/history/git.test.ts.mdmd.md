# packages/engine/src/live-docs/history/git.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/git.test.ts
- Generated At: 2026-10-23T20:17:42.911Z

## Authored
### Purpose
Vitest over the serialized worktree lifecycle and the parsers of git's output: the mainline's records after rev-list's commit lines, the renames and in-place changes of a NUL-separated name-status listing with paths holding a tab and a newline, and the tags' commits.

### Notes
The lifecycle case holds a registry operation open while other creates and removes are requested. It checks that those mutations cannot overlap, that multiple trees remain available for concurrent analysis, that signal/worker removal requests join one operation and that a failed operation does not prevent queued cleanup. It was added for the [October 23 concurrent cleanup failure](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#history-failure-investigation).

- Written 2026-10-17 for C1. The git calls themselves are exercised over a real repository in [history.test.ts](../../../../../tests/integration/live-docs/history.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`gitUtils`](../gitUtils.ts.mdmd.md)
- [`git.openGitRepository`](./git.ts.mdmd.md#symbol-opengitrepository)
- [`git.parseMainline`](./git.ts.mdmd.md#symbol-parsemainline)
- [`git.parseNameStatus`](./git.ts.mdmd.md#symbol-parsenamestatus)
- [`git.parseTags`](./git.ts.mdmd.md#symbol-parsetags)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
