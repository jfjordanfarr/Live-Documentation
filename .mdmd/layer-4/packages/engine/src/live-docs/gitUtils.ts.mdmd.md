# packages/engine/src/live-docs/gitUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/gitUtils.ts
- Generated At: 2026-10-16T17:10:16.409Z

## Authored
### Purpose
Git-related utilities for Live Documentation: the files git marks as changed, for the generator's `--changed` flag.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `detectChangedFiles()` runs `git status --porcelain` and parses the output to a Set of paths
- `parsePorcelainLine()` handles renamed/copied files by extracting the destination path from `R old -> new` format
- `execFileAsync()` wraps Node.js `execFile` in a Promise for async/await usage
- Returns empty Set on git errors (e.g., not a git repository) rather than throwing
- `listTrackedFiles()` lived here for one day (2026-10-16): discovery used it to keep a tracked file the root `.gitignore` would have dropped, until the same day's regeneration documented two nested agent worktrees and discovery moved to `git check-ignore` (`tooling/gitIgnored.ts`), which never reports a tracked file and needs no list of them ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L21)

##### `detectChangedFiles` — Summary
Detects files that have been changed in the git working tree.

##### `detectChangedFiles` — Parameters
- `workspaceRoot`: Absolute path to the repository root

##### `detectChangedFiles` — Returns
Set of workspace-relative paths that have changes

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L52)

##### `parsePorcelainLine` — Summary
Parses a git status --porcelain line to extract the file path.

##### `parsePorcelainLine` — Remarks
Handles renamed/copied files by extracting the destination path.

##### `parsePorcelainLine` — Parameters
- `line`: A line from `git status --porcelain` output

##### `parsePorcelainLine` — Returns
The normalized workspace-relative path, or undefined if invalid

#### `execFileAsync` {#symbol-execfileasync}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L82)

##### `execFileAsync` — Summary
Promise wrapper for Node.js execFile.

##### `execFileAsync` — Parameters
- `args`: Command arguments
- `command`: The command to execute
- `options`: Execution options: the working directory, and the largest output accepted (Node's default is 1 MiB, which a listing of a large repository exceeds)

##### `execFileAsync` — Returns
Promise resolving to stdout/stderr
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
