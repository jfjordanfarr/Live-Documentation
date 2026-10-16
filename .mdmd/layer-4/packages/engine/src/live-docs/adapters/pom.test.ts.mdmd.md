# packages/engine/src/live-docs/adapters/pom.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/pom.test.ts
- Generated At: 2026-10-16T16:21:41.073Z

## Authored
### Purpose
Keeps the pom adapter's reading: the element reader on nested, commented, CDATA, prefixed and unbalanced input; the artifact with an inherited groupId; the parent linked by its relative path to a file or a folder, or external; property-resolved versions; managed, plugin and profile dependencies left out; and the main class declared once from the plugins and the `start-class` property, under the default or a written source folder.

### Notes
- The project files are written to a temporary folder; the published names come from hand-built symbol indexes.

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
- [`pom.childAt`](./pom.ts.mdmd.md#symbol-childat)
- [`pom.childrenAt`](./pom.ts.mdmd.md#symbol-childrenat)
- [`pom.pomAdapter`](./pom.ts.mdmd.md#symbol-pomadapter)
- [`pom.readXmlElements`](./pom.ts.mdmd.md#symbol-readxmlelements)
- [`pom.textAt`](./pom.ts.mdmd.md#symbol-textat)
- [`coreTypes.ResolvedSymbolLocation`](../coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
