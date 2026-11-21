# `tests/integration/fixtures/sql-server/Procedures/Billing.usp_Statement.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-server/Procedures/Billing.usp_Statement.sql`
- Entry: opening [`Billing.usp_Statement`](#symbol-billingusp_statement)
- Generated At: 2026-11-21T02:15:35.138Z

## Authored
### Purpose
The SQL Server fixture's busiest procedure, after a comment of seven lines: it executes another procedure into a return variable, reads `sys.objects`, fills a table variable and a temporary table, reads through a common table expression and an `xml` column's `value` method, updates through an alias, calls a scalar function, applies a table-valued function and executes a string that names a table.

### Notes
- Written on 2026-11-19 for the SQL oracle ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). Each construct is one the cold run found misread on tSQLt.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Billing.usp_Statement` {#symbol-billingusp_statement}
- Type: procedure
- Source: [source](../../../../../../../tests/integration/fixtures/sql-server/Procedures/Billing.usp_Statement.sql#L8)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Billing.usp_Archive`](./Billing.usp_Archive.sql.mdmd.md#symbol-billingusp_archive)
- [`Billing.Customer`](../Schema/Billing.Customer.sql.mdmd.md#symbol-billingcustomer)
- [`Billing.Invoice`](../Schema/Billing.Invoice.sql.mdmd.md#symbol-billinginvoice)
- [`Billing.fn_Balance`](../Schema/Billing.fn_Balance.sql.mdmd.md#symbol-billingfn_balance)
- [`Billing.fn_Balance.Billing.fn_OpenInvoices`](../Schema/Billing.fn_Balance.sql.mdmd.md#symbol-billingfn_openinvoices)
<!-- LIVE-DOC:END Dependencies -->
