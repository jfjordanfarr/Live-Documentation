# tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs
- Generated At: 2026-10-02T20:20:05.332Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GatewayClient (class)` {#symbol-gatewayclient-class}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs#L13)

##### `GatewayClient (class)` — Summary
HTTP client for the payments gateway. The gateway is a separate deployment in the
same cloud; the only ties are the base URL in Web.config and the route strings here.

#### `GatewayClient (constructor)` {#symbol-gatewayclient-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs#L19)

#### `PostPaymentAsync` {#symbol-postpaymentasync}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs#L24)
- Returns: [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
- Parameters: `request`: [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)

#### `GetPaymentAsync` {#symbol-getpaymentasync}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs#L31)
- Returns: [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentsController.GET api/payments/{paymentId}`](../../Gateway/Controllers/PaymentsController.cs.mdmd.md#symbol-get-apipaymentspaymentid) (contract)
- [`PaymentsController.POST api/payments`](../../Gateway/Controllers/PaymentsController.cs.mdmd.md#symbol-post-apipayments) (contract)
- [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)
- [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
<!-- LIVE-DOC:END Dependencies -->
