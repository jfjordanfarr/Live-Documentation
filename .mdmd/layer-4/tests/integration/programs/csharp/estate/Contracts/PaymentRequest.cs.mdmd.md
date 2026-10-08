# tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs
- Generated At: 2026-10-02T20:20:04.777Z

## Authored
### Purpose
The data contract for a payment to post: account number and amount from the browser, workload and environment stamped by the gateway and never by the browser.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). A plain data contract: the compiler oracle sees every use of it and the C# adapter matches those edges. The portal's own request model is a separate class, as in the real portal.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentRequest` {#symbol-paymentrequest}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs#L7)

##### `PaymentRequest` — Summary
A payment to post. Workload and Environment are stamped by the gateway, never by the browser.

#### `AccountNumber` {#symbol-accountnumber}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs#L9)

#### `Amount` {#symbol-amount}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs#L10)

#### `Workload` {#symbol-workload}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs#L11)

#### `Environment` {#symbol-environment}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs#L12)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
