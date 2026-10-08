# packages/engine/src/live-docs/adapters/project.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/project.test.ts
- Generated At: 2026-09-28T16:48:38.479Z

## Authored
### Purpose
Keeps the project adapter's reading of one SDK-style project: the project as a library; a project reference linked to its file and to the name that file publishes, a missing one dropped; package references with their version from an attribute or an element and one without; assembly references by name with their version and culture cut off. Then the kind of a web SDK, a classic web-application GUID, an executable and a library, and the assembly name taken over the file's stem.

### Notes
- The project files are written to a temporary folder; the referenced project's published name comes from a hand-built symbol index.

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
- [`project.projectAdapter`](./project.ts.mdmd.md#symbol-projectadapter)
- [`project.projectKind`](./project.ts.mdmd.md#symbol-projectkind)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
