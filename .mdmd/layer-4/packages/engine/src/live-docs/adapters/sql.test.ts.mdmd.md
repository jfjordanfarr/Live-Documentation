# packages/engine/src/live-docs/adapters/sql.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/sql.test.ts
- Generated At: 2026-09-28T16:48:38.714Z

## Authored
### Purpose
Keeps the SQL adapter's two claims on written scripts: the estate's posting procedure publishes itself and links to the table it inserts into from source and to the Oracle table it reads through a linked server as a contract, a `FROM` inside a string ignored; and a schema script publishes a table, a view and a function with brackets off and the kinds the docs use, `sql-function` among them.

### Notes
- The scripts are written to a temporary folder and the symbol index is hand-built with the estate's paths, as the other adapter tests do.

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
- [`sql.sqlAdapter`](./sql.ts.mdmd.md#symbol-sqladapter)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
