# `packages/engine/src/live-docs/adapters/sql.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/sql.test.ts`
- Generated At: 2026-11-19T21:10:10.862Z

## Authored
### Purpose
Keeps the SQL adapter's two claims on written scripts: the estate's posting procedure publishes itself and links to the table it inserts into from source and to the Oracle table it reads through a linked server as a contract, a `FROM` inside a string ignored; and a schema script publishes a table, a view and a function with brackets off and the kinds the docs use, `sql-function` among them.

### Notes
- The scripts are written to a temporary folder and the symbol index is hand-built with the estate's paths, as the other adapter tests do.
- Since 2026-11-19 a third claim: a test procedure in tSQLt's shape publishes itself, not the table its body creates, and keeps no name for that table where it uses it ([the SQL reader's probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The reader itself is measured against ScriptDom by `tests/integration/live-docs/sql-oracle.test.ts`.
- Since 2026-11-21 two more, read over several scripts as the generator reads them: a one-part name binds as T-SQL binds it, by its module's schema and then `dbo`, by the caller's default schema in a module's DDL, in a string it executes and outside any module, and to nothing when neither schema holds it; and `SisterDb..Orders` is read as `SisterDb.dbo.Orders` is ([the account](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
