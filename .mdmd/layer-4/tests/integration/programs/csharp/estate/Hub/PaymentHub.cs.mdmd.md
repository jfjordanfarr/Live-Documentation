# tests/integration/programs/csharp/estate/Hub/PaymentHub.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/estate/Hub/PaymentHub.cs
- Live Doc ID: LD-test-tests-integration-programs-csharp-estate-hub-paymenthub-cs
- Generated At: 2026-09-27T18:53:05.655Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:05.655Z","inputHash":"c6d078722ace0ee1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentHub` {#symbol-paymenthub}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/PaymentHub.cs#L13)
- Implements: [`IPaymentHub`](../Contracts/IPaymentHub.cs.mdmd.md#symbol-ipaymenthub)

##### `PaymentHub` — Summary
The on-prem WCF hub. It does no payment work itself: it picks the payment service
for the request's workload and environment and forwards the operation.

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/PaymentHub.cs#L15)
- Returns: [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `GetPayment` {#symbol-getpayment}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/PaymentHub.cs#L20)
- Returns: [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentHub`](../Contracts/IPaymentHub.cs.mdmd.md#symbol-ipaymenthub)
- [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md#symbol-ipaymentservice)
- [`PaymentQuery`](../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- [`ServiceRouting`](./ServiceRouting.cs.mdmd.md#symbol-servicerouting)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
