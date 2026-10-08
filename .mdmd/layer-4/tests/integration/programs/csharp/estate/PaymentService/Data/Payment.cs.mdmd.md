# tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs
- Generated At: 2026-10-02T20:20:05.036Z

## Authored
### Purpose
The entity for a row of `dbo.Payment`, mapped to the table by `[Table("Payment", Schema = "dbo")]` and keyed by the payment id.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The table attribute is how the C# adapter reads the hand-verified remote hop from this entity to the table's script, as a contract; the key and the properties are the compiler's business.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Payment` {#symbol-payment}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L9)

##### `Payment` — Summary
A row of dbo.Payment.

#### `PaymentId` {#symbol-paymentid}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L12)

#### `AccountNumber` {#symbol-accountnumber}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L13)

#### `Amount` {#symbol-amount}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L14)

#### `Status` {#symbol-status}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L15)

#### `PostedAt` {#symbol-postedat}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/Data/Payment.cs#L16)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dbo.Payment`](../../Database/SqlServer/dbo.Payment.sql.mdmd.md#symbol-dbopayment) (contract)
<!-- LIVE-DOC:END Dependencies -->
