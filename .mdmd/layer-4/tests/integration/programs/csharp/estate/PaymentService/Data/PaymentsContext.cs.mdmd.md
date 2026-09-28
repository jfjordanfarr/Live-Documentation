# tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/estate/PaymentService/Data/PaymentsContext.cs
- Generated At: 2026-09-28T16:48:42.730Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
