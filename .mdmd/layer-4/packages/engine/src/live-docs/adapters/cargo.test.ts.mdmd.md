# packages/engine/src/live-docs/adapters/cargo.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/cargo.test.ts
- Generated At: 2026-10-16T16:21:40.092Z

## Authored
### Purpose
Keeps the Cargo adapter's reading: every dependency table in both forms, a renamed crate, a git dependency by name; a path dependency linked, a missing one kept by name; a name linked through the index to a crate and never to an npm package; `workspace = true` read from the root manifest, nearest or named; the targets declared on their paths and Cargo's defaults; and a malformed manifest read as empty.

### Notes
- The manifests are written to a temporary folder; the published names come from hand-built symbol indexes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`cargo.cargoAdapter`](./cargo.ts.mdmd.md#symbol-cargoadapter)
- [`coreTypes.ResolvedSymbolLocation`](../coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
