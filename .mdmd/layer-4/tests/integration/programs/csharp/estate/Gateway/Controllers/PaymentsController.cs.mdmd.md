# tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs
- Generated At: 2026-10-02T20:20:04.860Z

## Authored
### Purpose
The gateway's Web API 2 controller: bridges the portal's REST calls into WCF calls on the on-prem hub, stamping the workload and environment onto each request and query. Serves `POST api/payments` and `GET api/payments/{paymentId}`.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The two routes are the gateway's doors on the board, published by the C# adapter from the attributes; the portal's `GatewayClient.cs` reaches them away from home, the hand-verified remote hop between the two cloud deployments. The portal's own controller serves the same two templates, the one ambiguity the home-and-away presumption decides ([Openings](../../../../../../../../layer-3/openings.mdmd.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsController` {#symbol-paymentscontroller}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs#L9)
- Extends: `ApiController`

##### `PaymentsController` — Summary
Bridges the portal's REST calls into WCF calls on the on-prem hub.

#### `POST api/payments` {#symbol-post-apipayments}
- Type: route
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs#L13)

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs#L15)
- Returns: `IHttpActionResult`
- Parameters: `request`: [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `GET api/payments/{paymentId}` {#symbol-get-apipaymentspaymentid}
- Type: route
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs#L22)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs#L24)
- Returns: `IHttpActionResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentQuery`](../../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`GatewaySettings`](../GatewaySettings.cs.mdmd.md#symbol-gatewaysettings)
- [`HubProxy`](../Wcf/HubProxy.cs.mdmd.md#symbol-hubproxy)
<!-- LIVE-DOC:END Dependencies -->
