# packages/shared/src/live-docs/adapters/json.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/json.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-json-test-ts
- Generated At: 2026-02-03T21:55:39.946Z

## Authored
### Purpose
Unit tests for the JSON adapter, verifying file reference detection, non-path filtering, and file index validation.

### Notes
- Tests cover: file index requirement (empty index returns empty deps), relative path resolution (./path, ../path), workspace-relative paths, bare filenames, nested JSON structures, non-path filtering (URLs, versions, globs, npm scopes), file index validation (only known files produce deps), deduplication, and error handling.
- Uses temp directories to simulate workspace structure without polluting the real workspace.
- Created 2026-01-15 alongside the JSON adapter implementation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.946Z","inputHash":"68181fa373f5e2ec"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`json.jsonAdapter`](./json.ts.mdmd.md#symbol-jsonadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [json.ts](./json.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
