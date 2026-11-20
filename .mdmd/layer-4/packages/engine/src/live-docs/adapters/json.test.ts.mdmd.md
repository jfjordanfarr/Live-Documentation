# `packages/engine/src/live-docs/adapters/json.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/json.test.ts`
- Generated At: 2026-11-19T21:10:09.998Z

## Authored
### Purpose
Unit tests for the JSON adapter, verifying file reference detection, non-path filtering, and file index validation.

### Notes
- Tests cover: file index requirement (empty index returns empty deps), relative path resolution (./path, ../path), workspace-relative paths, bare filenames, nested JSON structures, non-path filtering (URLs, versions, globs, npm scopes), file index validation (only known files produce deps), deduplication, and error handling.
- Uses temp directories to simulate workspace structure without polluting the real workspace.
- Created 2026-01-15 alongside the JSON adapter implementation. The `package.json` case holds, since 2026-10-16, that a crate of a dependency's name in the symbol index is not linked.
- Since 2026-11-19 the script cases of [the measurement](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/script-entries/README.md) are two tables. The first holds each constructed row and each changed real script, with its answer under the shell's reading; eleven of those were red against the reading before. The second holds the answers still known to be wrong, under names that say so. Each is pinned as it is, together with the right answer it does not give, so that nobody takes one for the intent. One more case, the engine's own copying build of late September to October 16, fails if `(` and `)` are ever split as a shell splits them.

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
