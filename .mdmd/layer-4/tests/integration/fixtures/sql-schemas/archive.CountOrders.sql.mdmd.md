# `tests/integration/fixtures/sql-schemas/archive.CountOrders.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/archive.CountOrders.sql`
- Entry: opening [`archive.CountOrders`](#symbol-archivecountorders)
- Generated At: 2026-11-21T05:00:41.264Z

## Authored
### Purpose
A string a module executes is a batch of its own, bound by the caller's default schema, so its `Orders` is `dbo.Orders` though the procedure is archive's.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `archive.CountOrders` {#symbol-archivecountorders}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/archive.CountOrders.sql#L2)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tables.dbo.Orders`](./tables.sql.mdmd.md#symbol-dboorders)
<!-- LIVE-DOC:END Dependencies -->
