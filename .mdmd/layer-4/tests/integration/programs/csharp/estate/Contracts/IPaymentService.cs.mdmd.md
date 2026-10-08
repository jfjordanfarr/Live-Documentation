# tests/integration/programs/csharp/estate/Contracts/IPaymentService.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Contracts/IPaymentService.cs
- Generated At: 2026-10-02T20:20:04.741Z

## Authored
### Purpose
The payment service's WCF contract, one deployment per workload and environment: posting and looking up a payment with the shared data contracts. The hub forwards to it and the payment service implements it.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The hub's configuration names it as the `contract` of its two client endpoints and the service's configuration as the contract of its listening endpoint; the configuration adapter links both files here. The hub reaches the service by a name it builds at run time, one of the three estate hops no scan of the files honestly gives.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IPaymentService` {#symbol-ipaymentservice}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentService.cs#L7)

##### `IPaymentService` — Summary
The payment service's contract, one deployment per workload and environment.

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentService.cs#L10)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/IPaymentService.cs#L13)
- Returns: [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentQuery`](./PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](./PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](./PaymentResult.cs.mdmd.md#symbol-paymentresult)
<!-- LIVE-DOC:END Dependencies -->
