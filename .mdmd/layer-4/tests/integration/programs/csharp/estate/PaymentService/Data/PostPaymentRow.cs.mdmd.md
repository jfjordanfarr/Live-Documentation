# tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs
- Generated At: 2026-10-02T20:20:05.088Z

## Authored
### Purpose
The single row `dbo.usp_PostPayment` returns, as Entity Framework materialises it: the payment's id and status and the account balance from Oracle.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Its hand-verified hop to the procedure rests on the result columns alone, which no scan of the files gives; it is one of the three edges the estate keeps missing so that the measure stays honest.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PostPaymentRow` {#symbol-postpaymentrow}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs#L4)

##### `PostPaymentRow` — Summary
The single row dbo.usp_PostPayment returns.

#### `PaymentId` {#symbol-paymentid}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs#L6)

#### `Status` {#symbol-status}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs#L7)

#### `AccountBalance` {#symbol-accountbalance}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/PostPaymentRow.cs#L8)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
