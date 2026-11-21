# `tests/integration/fixtures/sql-schemas/linked.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/linked.sql`
- Generated At: 2026-11-21T07:20:23.009Z

## Authored
### Purpose
A linked server's object, named two ways, of the fixture on how T-SQL binds a name across schemas: `Srv...Orders`, which leaves its schema to the default of the login the linked server is reached by and so binds to nothing any file states, and `Srv.Sales.archive.Orders`, which writes its schema and is that schema's object.

### Notes
- Written on 2026-11-21 after an independent review's second pass found the SQL reader binding `Srv...Orders` to the local `dbo.Orders`, which the T-SQL grader already expected kept as written ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Srv...Orders` (contract)
- [`archive.archive.Orders`](./archive.sql.mdmd.md#symbol-archiveorders) (contract)
<!-- LIVE-DOC:END Dependencies -->
