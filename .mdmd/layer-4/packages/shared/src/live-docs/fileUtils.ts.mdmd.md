# packages/shared/src/live-docs/fileUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/fileUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-fileutils-ts
- Generated At: 2025-12-11T02:38:02.123Z

## Authored
### Purpose
File system utilities for Live Documentation. Provides helpers for checking directory existence and cleaning up empty parent directories when Live Doc files are deleted.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `directoryExists()` wraps `fs.stat` with a boolean return for directory checks
- `cleanupEmptyParents()` prevents orphaned empty directories from accumulating in the Live Doc mirror
- Both functions handle errors gracefully with try/catch, returning `false` or breaking the loop on failure

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.123Z","inputHash":"af3018c08ace9068"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `directoryExists` {#symbol-directoryexists}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/fileUtils.ts#L20)

##### `directoryExists` — Summary
Checks if a path is an existing directory.

##### `directoryExists` — Parameters
- `candidate`: Absolute path to check

##### `directoryExists` — Returns
True if the path exists and is a directory

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/fileUtils.ts#L40)

##### `cleanupEmptyParents` — Summary
Recursively removes empty directories from `startDir` up to (but excluding) `stopDir`.

##### `cleanupEmptyParents` — Remarks
The walk stops as soon as a directory contains any entries or when the
`stopDir` boundary is reached, preventing accidental deletion outside the Live
Doc mirror.

##### `cleanupEmptyParents` — Parameters
- `startDir`: Directory that was just emptied (for example, a deleted Live Doc path).
- `stopDir`: Absolute directory boundary that must remain intact.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
