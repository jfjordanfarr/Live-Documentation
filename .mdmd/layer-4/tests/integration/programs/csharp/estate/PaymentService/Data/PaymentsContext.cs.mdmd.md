# tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs
- Generated At: 2026-10-02T20:20:05.069Z

## Authored
### Purpose
The Entity Framework context over the on-prem Payments database: its connection string is `App.config`'s `PaymentsDb`, named through a constant; posting a payment calls `dbo.usp_PostPayment` by a name held in a constant, and the linked-server read of the Oracle balance happens there.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Two hand-verified hops leave this file and the C# adapter reads both by folding the constants: `base("name=" + ConnectionName)` to the connection string the configuration publishes, and the `EXEC` of the procedure's name in `SqlQuery` to the procedure's script as a contract, a remote hop. The row type it returns is matched to the procedure by columns alone, the hop that stays missing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsContext (class)` {#symbol-paymentscontext-class}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L12)
- Extends: `DbContext`

##### `PaymentsContext (class)` — Summary
Entity Framework context over the on-prem Payments database. The connection string
is App.config's "PaymentsDb". Posting a payment calls dbo.usp_PostPayment, which is
where the linked-server read of the Oracle account balance happens.

#### `ConnectionName` {#symbol-connectionname}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L14)

#### `PostPaymentProcedure` {#symbol-postpaymentprocedure}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L15)

#### `PaymentsContext (constructor)` {#symbol-paymentscontext-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L17)

#### `Payments` {#symbol-payments}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L21)

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs#L23)
- Returns: [`PostPaymentRow`](./PostPaymentRow.cs.mdmd.md#symbol-postpaymentrow)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dbo.usp_PostPayment`](../../Database/SqlServer/dbo.usp_PostPayment.sql.mdmd.md#symbol-dbousp_postpayment) (contract)
- [`App.PaymentsDb`](../App.config.mdmd.md#symbol-paymentsdb)
- [`Payment`](./Payment.cs.mdmd.md#symbol-payment)
- [`PostPaymentRow`](./PostPaymentRow.cs.mdmd.md#symbol-postpaymentrow)
<!-- LIVE-DOC:END Dependencies -->
