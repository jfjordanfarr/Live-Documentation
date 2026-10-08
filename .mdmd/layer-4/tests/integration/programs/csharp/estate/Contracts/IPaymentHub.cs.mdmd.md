# tests/integration/programs/csharp/estate/Contracts/IPaymentHub.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Contracts/IPaymentHub.cs
- Generated At: 2026-10-02T20:20:04.725Z

## Authored
### Purpose
The hub's WCF service contract: two operations, posting a payment and looking one up, each taking and returning the shared data contracts. The gateway's proxy opens a channel on it and the hub implements it.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The contract is the name both sides of the gateway-to-hub hop carry: the gateway's and the hub's configuration name it as their endpoint's `contract`, which is how the configuration adapter links each of those files here. The compiler sees the gateway's and the hub's uses of the interface; what it cannot see, the address those endpoints share, is the hand-verified remote hop between `Gateway/Web.config` and `Hub/App.config`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IPaymentHub` {#symbol-ipaymenthub}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentHub.cs#L11)

##### `IPaymentHub` — Summary
The on-prem hub's contract. The gateway calls it over WCF; the hub forwards
each operation to the payment service that serves the request's workload
and environment.

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentHub.cs#L14)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `GetPayment` {#symbol-getpayment}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentHub.cs#L17)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
<!-- LIVE-DOC:END Dependencies -->
