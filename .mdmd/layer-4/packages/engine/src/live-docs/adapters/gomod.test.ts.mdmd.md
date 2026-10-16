# packages/engine/src/live-docs/adapters/gomod.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/gomod.test.ts
- Generated At: 2026-10-16T16:21:40.543Z

## Authored
### Purpose
Keeps the go.mod adapter's reading: the module, quoted or not; requires in both forms with indirect ones left out; replacements by folder and by module, a versioned one applying only to its version; the directives that are not read; and links to a module a workspace `go.mod` publishes, never to a package of another ecosystem.

### Notes
- The module files are written to a temporary folder; the published names come from hand-built symbol indexes.

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
- [`gomod.goModAdapter`](./gomod.ts.mdmd.md#symbol-gomodadapter)
- [`gomod.readGoMod`](./gomod.ts.mdmd.md#symbol-readgomod)
- [`coreTypes.ResolvedSymbolLocation`](../coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
