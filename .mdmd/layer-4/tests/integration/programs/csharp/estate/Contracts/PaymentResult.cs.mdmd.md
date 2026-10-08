# tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs
- Generated At: 2026-10-02T20:20:04.794Z

## Authored
### Purpose
The data contract for the outcome of a payment operation: the payment's id and status, and the account balance read from the system of record, the Oracle database at the end of the chain.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The balance is what the chain exists to carry back: `dbo.usp_PostPayment` reads it through the linked server and it travels up through the service, the hub and the gateway to the portal's own result model. The compiler oracle sees every use of this type.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentResult` {#symbol-paymentresult}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs#L7)

##### `PaymentResult` — Summary
The outcome of a payment operation, including the account balance read from the system of record.

#### `PaymentId` {#symbol-paymentid}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs#L9)

#### `Status` {#symbol-status}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs#L10)

#### `AccountBalance` {#symbol-accountbalance}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentResult.cs#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
