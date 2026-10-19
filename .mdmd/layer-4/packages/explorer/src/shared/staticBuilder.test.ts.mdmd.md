# packages/explorer/src/shared/staticBuilder.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/staticBuilder.test.ts
- Generated At: 2026-10-19T17:42:51.385Z

## Authored
### Purpose
Holds the static folder export to its existing HTML, data, and asset layout while proving that temporary client assets are released after successful and failed output writes.

### Notes
- Uses a test-owned workspace and temporary-asset root. The empty graph keeps the test focused on output and resource ownership; graph, board, and history content have separate integration coverage.

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
- [`staticBuilder.buildStaticExplorer`](./staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- `vitest` - `afterEach`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
