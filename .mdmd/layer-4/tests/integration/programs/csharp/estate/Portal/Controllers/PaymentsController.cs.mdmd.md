# tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Controllers/PaymentsController.cs
- Generated At: 2026-10-02T20:20:05.170Z

## Authored
### Purpose
The portal's own Web API 2 controller: receives the browser's payment requests, refuses them when payments are disabled, and forwards them to the gateway through `GatewayClient`. Serves `POST api/payments` and `GET api/payments/{paymentId}`, the same templates the gateway serves.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Its routes are the portal's doors on the board, and `portal.js` reaches them at home by `fetch`, a hand-verified hop the routes heuristic finds. Because the gateway serves the same two templates, this controller is half of the estate's one ambiguity, decided by home and away ([Openings](../../../../../../../../layer-3/openings.mdmd.md)).

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
