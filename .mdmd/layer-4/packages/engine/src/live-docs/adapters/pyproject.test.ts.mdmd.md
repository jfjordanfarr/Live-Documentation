# packages/engine/src/live-docs/adapters/pyproject.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/pyproject.test.ts
- Generated At: 2026-10-16T16:21:41.266Z

## Authored
### Purpose
Keeps the pyproject adapter's reading: PEP 508 requirements reduced to name and specifier, direct references, names compared as Python does; the dependency lists, optional lists and groups, with what builds the distribution left out; Poetry's tables, groups and the precedence of `[project]`'s list; path sources linked through Poetry and uv; and the scripts declared on their modules under the manifest's folder or its `src/`.

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
- [`pyproject.normalizeDistributionName`](./pyproject.ts.mdmd.md#symbol-normalizedistributionname)
- [`pyproject.parseRequirement`](./pyproject.ts.mdmd.md#symbol-parserequirement)
- [`pyproject.pyprojectAdapter`](./pyproject.ts.mdmd.md#symbol-pyprojectadapter)
- [`coreTypes.ResolvedSymbolLocation`](../coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
