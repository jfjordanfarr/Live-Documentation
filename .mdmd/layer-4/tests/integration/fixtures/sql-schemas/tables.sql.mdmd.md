# `tests/integration/fixtures/sql-schemas/tables.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/tables.sql`
- Entry: opening [`dbo.Orders`](#symbol-dboorders)
- Entry: opening [`dbo.Customers`](#symbol-dbocustomers)
- Generated At: 2026-11-21T04:55:45.808Z

## Authored
### Purpose
The dbo schema's tables of the fixture on how T-SQL binds a name across schemas: `dbo.Orders`, whose name an archive table shares, and `dbo.Customers`, which only dbo holds.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dbo.Orders` {#symbol-dboorders}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/tables.sql#L2)

#### `dbo.Customers` {#symbol-dbocustomers}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/tables.sql#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
