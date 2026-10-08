# tests/integration/programs/csharp/estate/Database/SqlServer/dbo.Payment.sql

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Database/SqlServer/dbo.Payment.sql
- Generated At: 2026-10-02T20:20:04.826Z

## Authored
### Purpose
The payments table in the on-prem SQL Server database: one row per posted payment with its account, amount, status and time. The posting procedure inserts into it and the payment service's entity maps to it.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Published as a `table` symbol by the SQL adapter. Two edges land on it: the procedure's `INSERT INTO`, read from source within the same database, and the entity class's `[Table("Payment", Schema = "dbo")]`, read by the C# adapter as a contract and a hand-verified remote hop.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dbo.Payment` {#symbol-dbopayment}
- Type: table
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Database/SqlServer/dbo.Payment.sql#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
