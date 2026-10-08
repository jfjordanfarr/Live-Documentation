# tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs
- Generated At: 2026-10-02T20:20:05.106Z

## Authored
### Purpose
The on-prem WCF payment service, the implementation of `IPaymentService`: posting goes through the stored procedure by way of the data context, lookups through Entity Framework, and both answer with the shared result contract.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). `App.config` names it as its hosted service, which the configuration adapter links. Every other edge from it, to the context, the entity, the row type and the contracts, is one the compiler sees.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentService` {#symbol-paymentservice}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs#L7)
- Implements: [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md#symbol-ipaymentservice)

##### `PaymentService` — Summary
The on-prem WCF payment service. Posting goes through a stored procedure; lookups go through Entity Framework.

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs#L9)
- Returns: [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs#L23)
- Returns: [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md#symbol-ipaymentservice)
- [`PaymentQuery`](../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- [`Payment`](./Data/Payment.cs.mdmd.md#symbol-payment)
- [`PaymentsContext`](./Data/PaymentsContext.cs.mdmd.md#symbol-paymentscontext-class)
- [`PostPaymentRow`](./Data/PostPaymentRow.cs.mdmd.md#symbol-postpaymentrow)
<!-- LIVE-DOC:END Dependencies -->
