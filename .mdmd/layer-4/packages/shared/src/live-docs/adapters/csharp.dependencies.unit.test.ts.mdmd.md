# packages/shared/src/live-docs/adapters/csharp.dependencies.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.dependencies.unit.test.ts
- Generated At: 2026-09-27T23:21:30.343Z

## Authored
### Purpose
Unit tests for the C# dependency extraction module, validating correct detection of using directives, configuration keys, reflection targets, and Hangfire job targets.

### Notes
- **36 Tests:** Covers `collectConfigKeys`, `collectConfigurationIndexerKeys`, `collectTypeNameLiterals`, `collectHangfireTargets`, `collectTypeIdentifiers`, `locateNearestFile`, `fileExists`, `readFileSafe`, and `resolveReflectionTarget`.
- **File System Fixtures:** Tests for `locateNearestFile`, `fileExists`, and `readFileSafe` create actual temp directories with test files to validate real file system behavior.
- **Edge Cases:** Includes tests for malformed patterns, empty content, non-existent paths, and namespace aliasing.
- **Created:** 2025-12-10 during the `csharp.ts` refactoring to ensure the extracted module is test-backed.

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
- [`csharp.dependencies.collectConfigKeys`](./csharp.dependencies.ts.mdmd.md#symbol-collectconfigkeys)
- [`csharp.dependencies.collectConfigurationIndexerKeys`](./csharp.dependencies.ts.mdmd.md#symbol-collectconfigurationindexerkeys)
- [`csharp.dependencies.collectHangfireTargets`](./csharp.dependencies.ts.mdmd.md#symbol-collecthangfiretargets)
- [`csharp.dependencies.collectTypeIdentifiers`](./csharp.dependencies.ts.mdmd.md#symbol-collecttypeidentifiers)
- [`csharp.dependencies.collectTypeNameLiterals`](./csharp.dependencies.ts.mdmd.md#symbol-collecttypenameliterals)
- [`csharp.dependencies.fileExists`](./csharp.dependencies.ts.mdmd.md#symbol-fileexists)
- [`csharp.dependencies.locateNearestFile`](./csharp.dependencies.ts.mdmd.md#symbol-locatenearestfile)
- [`csharp.dependencies.resolveReflectionTargets`](./csharp.dependencies.ts.mdmd.md#symbol-resolvereflectiontargets)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
