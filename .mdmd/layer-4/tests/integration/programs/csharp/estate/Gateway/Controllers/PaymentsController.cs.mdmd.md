# tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/estate/Gateway/Controllers/PaymentsController.cs
- Generated At: 2026-09-28T17:02:52.063Z

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
