# packages/server/src/features/knowledge/directoryScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/directoryScanner.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-directoryscanner-ts
- Generated At: 2025-12-08T20:03:27.466Z

## Authored
### Purpose
Directory scanning utilities for the knowledge layer. Provides recursive file discovery with automatic exclusion of non-content directories (node_modules, .git, dist, etc.) and binary file detection via byte sampling heuristics.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- `scanDirectory()` is async and parallelizes directory traversal via `Promise.all`
- `isLikelyBinaryFile()` samples first 2KB, checking for NUL bytes or >20% non-printable characters
- Allows UTF-8 multi-byte sequences (0x80-0xF4) so Unicode files aren't falsely flagged as binary

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T20:03:27.466Z","inputHash":"6929fef05f26e499"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `scanDirectory` {#symbol-scandirectory}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L9)

##### `scanDirectory` — Summary
Recursively scans a directory, invoking the callback for each file found.
Automatically skips common non-content directories (node_modules, .git, dist, etc.).

#### `shouldSkipDir` {#symbol-shouldskipdir}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L39)

##### `shouldSkipDir` — Summary
Returns true if a directory name should be excluded from scanning.

#### `shouldSkipPath` {#symbol-shouldskippath}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L58)

##### `shouldSkipPath` — Summary
Returns true if a file path should be excluded from indexing based on its full path.

#### `isLikelyBinaryFile` {#symbol-islikelybinaryfile}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L72)

##### `isLikelyBinaryFile` — Summary
Heuristically determines if a file is binary by sampling its first 2KB.
Returns true if NUL bytes are found or if >20% of bytes are non-printable.

#### `fileExists` {#symbol-fileexists}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L109)

##### `fileExists` — Summary
Checks if a file exists at the given path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `Dirent`
- `node:fs/promises` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [workspaceIndexProvider.test.ts](./workspaceIndexProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
