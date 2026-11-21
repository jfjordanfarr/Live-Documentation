# `tests/integration/fixtures/sql-schemas/archive.ListOrders.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/archive.ListOrders.sql`
- Entry: opening [`archive.ListOrders`](#symbol-archivelistorders)
- Generated At: 2026-11-21T05:00:41.268Z

## Authored
### Purpose
An archive procedure's one-part names: `Orders` binds to `archive.Orders`, its own schema's, and `Customers`, which archive does not hold, to `dbo.Customers`.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `archive.ListOrders` {#symbol-archivelistorders}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/archive.ListOrders.sql#L2)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`archive.archive.Orders`](./archive.sql.mdmd.md#symbol-archiveorders)
- [`tables.dbo.Customers`](./tables.sql.mdmd.md#symbol-dbocustomers)
<!-- LIVE-DOC:END Dependencies -->
