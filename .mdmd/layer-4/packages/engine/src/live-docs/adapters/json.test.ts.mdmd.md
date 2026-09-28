# packages/engine/src/live-docs/adapters/json.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/json.test.ts
- Generated At: 2026-09-27T23:21:30.786Z

## Authored
### Purpose
Unit tests for the JSON adapter, verifying file reference detection, non-path filtering, and file index validation.

### Notes
- Tests cover: file index requirement (empty index returns empty deps), relative path resolution (./path, ../path), workspace-relative paths, bare filenames, nested JSON structures, non-path filtering (URLs, versions, globs, npm scopes), file index validation (only known files produce deps), deduplication, and error handling.
- Uses temp directories to simulate workspace structure without polluting the real workspace.
- Created 2026-01-15 alongside the JSON adapter implementation.

## Generated
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
