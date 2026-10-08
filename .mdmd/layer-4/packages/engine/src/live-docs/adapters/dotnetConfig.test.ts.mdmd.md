# packages/engine/src/live-docs/adapters/dotnetConfig.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/dotnetConfig.test.ts
- Generated At: 2026-09-28T16:48:38.205Z

## Authored
### Purpose
Keeps the configuration adapter's readings on the estate's hub configuration and three smaller files: the five symbol kinds in document order, contracts and services linked to their types, and an unmatched client address kept as an external observed from configuration; a client endpoint linked to the configuration that listens on its address when the index knows it; a relative service address joined to the host's base address, an empty one giving the base itself; single-quoted attribute values; and a `packages.config` as a list of externals.

### Notes
- The configuration and two C# files are written to a temporary folder, so the type resolution runs over real files; the listener case uses a hand-built symbol index with the estate's path.

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
- [`dotnetConfig.dotnetConfigAdapter`](./dotnetConfig.ts.mdmd.md#symbol-dotnetconfigadapter)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
