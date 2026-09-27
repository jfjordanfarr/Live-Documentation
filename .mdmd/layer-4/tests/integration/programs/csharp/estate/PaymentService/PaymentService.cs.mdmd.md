# tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs
- Generated At: 2026-09-27T23:21:34.939Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
