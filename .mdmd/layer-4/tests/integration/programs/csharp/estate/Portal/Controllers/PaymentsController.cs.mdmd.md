# tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs
- Generated At: 2026-10-02T20:20:05.170Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsController` {#symbol-paymentscontroller}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs#L10)
- Extends: `ApiController`

##### `PaymentsController` — Summary
Receives the browser's payment requests and forwards them to the gateway.

#### `POST api/payments` {#symbol-post-apipayments}
- Type: route
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs#L14)

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs#L16)
- Returns: `IHttpActionResult`
- Parameters: `request`: [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)

#### `GET api/payments/{paymentId}` {#symbol-get-apipaymentspaymentid}
- Type: route
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs#L26)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs#L28)
- Returns: `IHttpActionResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Globals`](../App_Code/Globals.cs.mdmd.md#symbol-globals)
- [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)
- [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
- [`GatewayClient`](../Services/GatewayClient.cs.mdmd.md#symbol-gatewayclient-class)
<!-- LIVE-DOC:END Dependencies -->
