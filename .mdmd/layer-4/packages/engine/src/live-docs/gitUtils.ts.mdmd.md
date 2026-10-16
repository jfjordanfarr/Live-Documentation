# packages/engine/src/live-docs/gitUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/gitUtils.ts
- Generated At: 2026-10-16T00:58:43.103Z

## Authored
### Purpose
Git-related utilities for Live Documentation: the files git marks as changed, for the generator's `--changed` flag, and the files git tracks, so that discovery keeps a tracked file the `.gitignore` would otherwise drop.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `detectChangedFiles()` runs `git status --porcelain` and parses the output to a Set of paths
- `parsePorcelainLine()` handles renamed/copied files by extracting the destination path from `R old -> new` format
- `execFileAsync()` wraps Node.js `execFile` in a Promise for async/await usage
- Returns empty Set on git errors (e.g., not a git repository) rather than throwing
- `listTrackedFiles()` (2026-10-16) runs `git ls-files -z` once per discovery and returns the paths; empty when the workspace is not a repository or git is absent, in which case the `.gitignore` is the only word. Git itself never ignores a tracked file, and a file committed under an ignored folder (`.vscode/settings.json`) is part of the repository.

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

#### `listTrackedFiles` {#symbol-listtrackedfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L53)

##### `listTrackedFiles` — Summary
The files git tracks, as workspace-relative paths, so that discovery keeps a
tracked file the `.gitignore` would otherwise drop: git itself ignores a
tracked file's ignore rules, and a file committed on purpose (a
`.vscode/settings.json` under an ignored `.vscode/`) is part of the
repository. Empty when the workspace is not a git repository or git is not
available, in which case the `.gitignore` is the only word.

##### `listTrackedFiles` — Parameters
- `workspaceRoot`: Absolute path to the repository root

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L77)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/gitUtils.ts#L107)

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
