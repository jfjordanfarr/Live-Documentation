# tests/integration/programs/csharp/estate/Database/SqlServer/dbo.usp_PostPayment.sql

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Database/SqlServer/dbo.usp_PostPayment.sql
- Generated At: 2026-10-02T20:20:04.842Z

## Authored
### Purpose
The procedure that posts a payment and returns the account balance from the system of record: it inserts the payment into `dbo.Payment` and selects the balance from `CENTRAL.ACCOUNT` through the `ORACLE_CENTRAL` linked server, returning one row of id, status and balance.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The chain's last hop in code: the payment service calls it by name through Entity Framework's `SqlQuery`, a hand-verified remote hop the C# adapter reads from the constant that holds the name. Its own two references are the SQL adapter's two kinds of edge: the insert into the local table from source, the four-part Oracle name as a contract. The row type it returns, `PostPaymentRow`, is matched to it only by its result columns, which no scan gives; that hop stays hand-verified and missing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dbo.usp_PostPayment` {#symbol-dbousp_postpayment}
- Type: procedure
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Database/SqlServer/dbo.usp_PostPayment.sql#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`CENTRAL.ACCOUNT`](../Oracle/CENTRAL.ACCOUNT.sql.mdmd.md#symbol-centralaccount) (contract)
- [`dbo.Payment`](./dbo.Payment.sql.mdmd.md#symbol-dbopayment)
<!-- LIVE-DOC:END Dependencies -->
