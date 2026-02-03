# packages/server/src/features/knowledge/directoryScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/directoryScanner.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-directoryscanner-ts
- Generated At: 2026-02-03T21:55:37.570Z

## Authored
### Purpose
Directory scanning utilities for the knowledge layer. Provides recursive file discovery with automatic exclusion of non-content directories (node_modules, .git, dist, etc.) and binary file detection via byte sampling heuristics.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- `scanDirectory()` is async and parallelizes directory traversal via `Promise.all`
- `isLikelyBinaryFile()` samples first 2KB, checking for NUL bytes or >20% non-printable characters
- Allows UTF-8 multi-byte sequences (0x80-0xF4) so Unicode files aren't falsely flagged as binary

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.570Z","inputHash":"ae28f2e09f30f5e9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createGitignoreFilter` {#symbol-creategitignorefilter}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L10)

##### `createGitignoreFilter` — Summary
Creates a gitignore filter from .gitignore patterns at the workspace root.
Falls back to basic hardcoded patterns if no .gitignore is found.

#### `scanDirectory` {#symbol-scandirectory}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L42)

##### `scanDirectory` — Summary
Recursively scans a directory, invoking the callback for each file found.
Respects .gitignore patterns when gitignoreFilter is provided.

#### `shouldSkipDir` {#symbol-shouldskipdir}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L91)

##### `shouldSkipDir` — Summary
Returns true if a directory name should be excluded from scanning.

#### `shouldSkipPath` {#symbol-shouldskippath}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L111)

##### `shouldSkipPath` — Summary
Returns true if a file path should be excluded from indexing based on its full path.
If a gitignoreFilter is provided, uses that for matching; otherwise falls back to hardcoded patterns.

#### `isLikelyBinaryFile` {#symbol-islikelybinaryfile}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L136)

##### `isLikelyBinaryFile` — Summary
Heuristically determines if a file is binary by sampling its first 2KB.
Returns true if NUL bytes are found or if >20% of bytes are non-printable.

#### `fileExists` {#symbol-fileexists}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/directoryScanner.ts#L173)

##### `fileExists` — Summary
Checks if a file exists at the given path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `ignore` - `Ignore`, `ignore`
- `node:fs` - `Dirent`
- `node:fs/promises`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
