# tests/integration/benchmarks/fixtures/csharp/estate/Contracts/IPaymentHub.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/estate/Contracts/IPaymentHub.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-estate-contracts-ipaymenthub-cs
- Generated At: 2026-09-27T18:34:28.063Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:28.063Z","inputHash":"d67b5c855825ca60"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IPaymentHub` {#symbol-ipaymenthub}
- Type: interface
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Contracts/IPaymentHub.cs#L11)

##### `IPaymentHub` — Summary
The on-prem hub's contract. The gateway calls it over WCF; the hub forwards
each operation to the payment service that serves the request's workload
and environment.

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Contracts/IPaymentHub.cs#L14)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `GetPayment` {#symbol-getpayment}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Contracts/IPaymentHub.cs#L17)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
<!-- LIVE-DOC:END Dependencies -->
