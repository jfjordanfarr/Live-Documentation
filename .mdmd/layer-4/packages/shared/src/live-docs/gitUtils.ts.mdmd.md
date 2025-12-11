# packages/shared/src/live-docs/gitUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/gitUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-gitutils-ts
- Generated At: 2025-12-11T02:38:02.132Z

## Authored
### Purpose
Git-related utilities for Live Documentation. Supports the `--changed` flag in the generator CLI by detecting which files have been modified in the git working tree.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `detectChangedFiles()` runs `git status --porcelain` and parses the output to a Set of paths
- `parsePorcelainLine()` handles renamed/copied files by extracting the destination path from `R old -> new` format
- `execFileAsync()` wraps Node.js `execFile` in a Promise for async/await usage
- Returns empty Set on git errors (e.g., not a git repository) rather than throwing

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.132Z","inputHash":"b30e305f5e82da82"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/gitUtils.ts#L21)

##### `detectChangedFiles` — Summary
Detects files that have been changed in the git working tree.

##### `detectChangedFiles` — Parameters
- `workspaceRoot`: Absolute path to the repository root

##### `detectChangedFiles` — Returns
Set of workspace-relative paths that have changes

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/gitUtils.ts#L52)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/gitUtils.ts#L82)

##### `execFileAsync` — Summary
Promise wrapper for Node.js execFile.

##### `execFileAsync` — Parameters
- `args`: Command arguments
- `command`: The command to execute
- `options`: Execution options (cwd is required)

##### `execFileAsync` — Returns
Promise resolving to stdout/stderr
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
