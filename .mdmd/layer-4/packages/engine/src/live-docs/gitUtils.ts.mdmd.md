# packages/engine/src/live-docs/gitUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/gitUtils.ts
- Generated At: 2026-10-22T16:47:52.929Z

## Authored
### Purpose
Git-related utilities for Live Documentation: the files git marks as changed, for the generator's `--changed` flag.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `detectChangedFiles()` reads NUL-delimited `git status --porcelain=v1` records, keeping path whitespace intact and both the destination and origin of a rename/copy. A deleted or renamed source's old path lets changed-only generation remove its stale Live Doc.
- The status call accepts output up to the same 256 MiB limit as discovery's `git check-ignore` call, so a large changed working tree does not silently become an empty change set; status errors still fail `--changed`.
- Porcelain paths are relative to Git's repository root even when the scanned workspace is a nested folder. The status call limits itself to that folder; `git rev-parse --show-prefix` then removes the repository prefix so discovery receives workspace-relative paths. A dirty sibling outside the scanned folder cannot select a source inside it.
- `execFileAsync()` wraps Node.js `execFile` in a Promise for async/await usage. Since 2026-10-17 it also runs the history command's git calls ([history/git.ts](./history/git.ts.mdmd.md)) and the generator's identity for the history's lens, and takes variables for the environment the command inherits, so that a scratch checkout can tell Git LFS to leave its pointers rather than fetch from a remote.
- `--changed` fails with Git's status error when the folder is not a repository or Git cannot report changes; an unknown change set is never treated as a clean tree. Full generation remains available without Git.
- `listTrackedFiles()` lived here for one day (2026-10-16): discovery used it to keep a tracked file the root `.gitignore` would have dropped, until the same day's regeneration documented two nested agent worktrees and discovery moved to `git check-ignore` (`tooling/gitIgnored.ts`), which never reports a tracked file and needs no list of them ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L22)

##### `detectChangedFiles` — Summary
Detects files changed in the git working tree, including both paths of a rename.

##### `detectChangedFiles` — Parameters
- `workspaceRoot`: Absolute path to the scanned workspace, which may lie below Git's repository root

##### `detectChangedFiles` — Returns
Set of workspace-relative paths that have changes

##### `detectChangedFiles` — Exceptions
- _Unknown_: When Git cannot report status; an unknown change set is not a clean tree.

#### `execFileAsync` {#symbol-execfileasync}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L71)

##### `execFileAsync` — Summary
Promise wrapper for Node.js execFile.

##### `execFileAsync` — Parameters
- `args`: Command arguments
- `command`: The command to execute
- `options`: Execution options: the working directory, the largest output accepted (Node's default is 1 MiB, which a listing of a large repository exceeds), and variables to set in the environment the command inherits

##### `execFileAsync` — Returns
Promise resolving to stdout/stderr
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
