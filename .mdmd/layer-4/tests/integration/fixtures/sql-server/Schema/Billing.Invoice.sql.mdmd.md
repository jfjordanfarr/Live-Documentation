# tests/integration/fixtures/sql-server/Schema/Billing.Invoice.sql

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/sql-server/Schema/Billing.Invoice.sql
- Entry: opening [`Billing.Invoice`](#symbol-billinginvoice)
- Generated At: 2026-11-19T20:05:49.520Z

## Authored
### Purpose
A table of the SQL Server fixture, its name in brackets, whose foreign key references the customer table.

### Notes
- Written on 2026-11-19 for the SQL oracle ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The foreign key is a use of `Billing.Customer` the parser sees and the reader first did not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Billing.Invoice` {#symbol-billinginvoice}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-server/Schema/Billing.Invoice.sql#L2)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Billing.Customer`](./Billing.Customer.sql.mdmd.md#symbol-billingcustomer)
<!-- LIVE-DOC:END Dependencies -->
