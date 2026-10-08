# tests/integration/programs/csharp/estate/Portal/Models/PaymentRequestModel.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Models/PaymentRequestModel.cs
- Generated At: 2026-10-02T20:20:05.189Z

## Authored
### Purpose
What the browser sends to post a payment: account number and amount. The gateway's request contract is a separate class; the two meet only as JSON, as in the real portal.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). A compiler-visible type; no scan links it to the gateway's contract, and none should.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentRequestModel` {#symbol-paymentrequestmodel}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Models/PaymentRequestModel.cs#L4)

##### `PaymentRequestModel` — Summary
What the browser sends. The gateway's own request type is a separate class; the two meet only as JSON.

#### `AccountNumber` {#symbol-accountnumber}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Models/PaymentRequestModel.cs#L6)

#### `Amount` {#symbol-amount}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Models/PaymentRequestModel.cs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
