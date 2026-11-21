# `tests/integration/fixtures/sql-schemas/procs.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/procs.sql`
- Entry: opening [`dbo.ListOrders`](#symbol-dbolistorders)
- Entry: opening [`dbo.ListSisterOrders`](#symbol-dbolistsisterorders)
- Generated At: 2026-11-21T05:04:27.010Z

## Authored
### Purpose
The case the fixture was written for: a dbo procedure naming `Orders` by one part, which T-SQL binds to `dbo.Orders` and never to `archive.Orders`, and one naming `SisterDb..Orders` and `SisterDb.dbo.Orders`, which differ only in leaving the schema to its default and so name the same object.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dbo.ListOrders` {#symbol-dbolistorders}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/procs.sql#L3)

#### `dbo.ListSisterOrders` {#symbol-dbolistsisterorders}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/procs.sql#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tables.dbo.Orders`](./tables.sql.mdmd.md#symbol-dboorders)
<!-- LIVE-DOC:END Dependencies -->
