# packages/shared/src/live-docs/adapters/csharp.dependencies.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.dependencies.unit.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-csharp-dependencies-unit-test-ts
- Generated At: 2026-02-03T21:55:39.631Z

## Authored
### Purpose
Unit tests for the C# dependency extraction module, validating correct detection of using directives, configuration keys, reflection targets, and Hangfire job targets.

### Notes
- **36 Tests:** Covers `collectConfigKeys`, `collectConfigurationIndexerKeys`, `collectTypeNameLiterals`, `collectHangfireTargets`, `collectTypeIdentifiers`, `locateNearestFile`, `fileExists`, `readFileSafe`, and `resolveReflectionTarget`.
- **File System Fixtures:** Tests for `locateNearestFile`, `fileExists`, and `readFileSafe` create actual temp directories with test files to validate real file system behavior.
- **Edge Cases:** Includes tests for malformed patterns, empty content, non-existent paths, and namespace aliasing.
- **Created:** 2025-12-10 during the `csharp.ts` refactoring to ensure the extracted module is test-backed.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.631Z","inputHash":"efb8d00a0a305291"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./csharp.dependencies` - `collectConfigKeys`, `collectConfigurationIndexerKeys`, `collectHangfireTargets`, `collectTypeIdentifiers`, `collectTypeNameLiterals`, `fileExists`, `locateNearestFile`, `readFileSafe`, `resolveReflectionTarget`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
