# tests/integration/fixtures/sql-server/Schema/Billing.fn_Balance.sql

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/sql-server/Schema/Billing.fn_Balance.sql
- Entry: opening [`Billing.fn_Balance`](#symbol-billingfn_balance)
- Entry: opening [`Billing.fn_OpenInvoices`](#symbol-billingfn_openinvoices)
- Generated At: 2026-11-19T19:50:03.555Z

## Authored
### Purpose
Two functions of the SQL Server fixture in one file: a scalar function after a comment of two lines, and an inline table-valued function whose query reads through a common table expression.

### Notes
- Written on 2026-11-19 for the SQL oracle ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The common table expression `open_invoices` is a name the statement defines, not an object of the database.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Billing.fn_Balance` {#symbol-billingfn_balance}
- Type: sql-function
- Source: [source](../../../../../../../tests/integration/fixtures/sql-server/Schema/Billing.fn_Balance.sql#L3)

#### `Billing.fn_OpenInvoices` {#symbol-billingfn_openinvoices}
- Type: sql-function
- Source: [source](../../../../../../../tests/integration/fixtures/sql-server/Schema/Billing.fn_Balance.sql#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Billing.Invoice`](./Billing.Invoice.sql.mdmd.md#symbol-billinginvoice)
<!-- LIVE-DOC:END Dependencies -->
