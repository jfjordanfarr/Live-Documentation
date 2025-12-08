# packages/server/src/features/knowledge/directoryScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/directoryScanner.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-directoryscanner-ts
- Generated At: 2025-12-08T19:22:38.737Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T19:22:38.737Z","inputHash":"6929fef05f26e499"}]} -->
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
