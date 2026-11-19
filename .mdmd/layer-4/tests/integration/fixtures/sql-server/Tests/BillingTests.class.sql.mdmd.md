# tests/integration/fixtures/sql-server/Tests/BillingTests.class.sql

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/fixtures/sql-server/Tests/BillingTests.class.sql
- Entry: opening [`BillingTests.`](#symbol-billingtests)
- Generated At: 2026-11-19T19:25:52.606Z

## Authored
### Purpose
A test class in tSQLt's shape: a schema made by `tSQLt.NewTestClass`, and test procedures whose names are sentences in brackets, one holding an apostrophe and one a dot, one of which creates a table inside its body.

### Notes
- Written on 2026-11-19 for the SQL oracle ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The apostrophe is the cold run's crash: in five tSQLt files a name such as `[test that it doesn't fail]` stopped generation. A table created inside a procedure's body is made when the procedure runs, not by the script.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BillingTests.` {#symbol-billingtests}
- Type: procedure
- Source: [source](../../../../../../../tests/integration/fixtures/sql-server/Tests/BillingTests.class.sql#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `tSQLt.AssertEquals` (contract)
- `tSQLt.NewTestClass` (contract)
- [`Billing.Invoice`](../Schema/Billing.Invoice.sql.mdmd.md#symbol-billinginvoice)
<!-- LIVE-DOC:END Dependencies -->
