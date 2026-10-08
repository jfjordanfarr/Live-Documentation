# tests/integration/programs/csharp/estate/Hub/PaymentHub.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Hub/PaymentHub.cs
- Generated At: 2026-10-02T20:20:04.986Z

## Authored
### Purpose
The on-prem WCF hub: it does no payment work itself, but picks the payment service for the request's workload and environment and forwards the operation over a channel it opens and closes per call.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Implements `IPaymentHub`; `App.config` names it as its hosted service, which the configuration adapter links. Its `ChannelFactory<IPaymentService>(ServiceRouting.EndpointNameFor(...))` names its endpoint by concatenation at run time, so the hand-verified hop to `App.config` is one of the three the estate keeps missing on purpose.

## Generated
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
