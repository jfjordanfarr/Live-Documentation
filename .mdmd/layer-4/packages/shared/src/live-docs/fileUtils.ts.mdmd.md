# packages/shared/src/live-docs/fileUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/fileUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-fileutils-ts
- Generated At: 2025-12-07T04:00:25.758Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.758Z","inputHash":"af3018c08ace9068"}]} -->
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
