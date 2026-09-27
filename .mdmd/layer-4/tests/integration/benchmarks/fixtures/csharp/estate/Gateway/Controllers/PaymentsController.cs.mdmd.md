# tests/integration/benchmarks/fixtures/csharp/estate/Gateway/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/estate/Gateway/Controllers/PaymentsController.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-estate-gateway-controllers-paymentscontroller-cs
- Generated At: 2026-09-27T18:34:28.156Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:28.156Z","inputHash":"db012ff96a7233b8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsController` {#symbol-paymentscontroller}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Gateway/Controllers/PaymentsController.cs#L9)
- Extends: `ApiController`

##### `PaymentsController` — Summary
Bridges the portal's REST calls into WCF calls on the on-prem hub.

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Gateway/Controllers/PaymentsController.cs#L15)
- Returns: `IHttpActionResult`
- Parameters: `request`: [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Gateway/Controllers/PaymentsController.cs#L24)
- Returns: `IHttpActionResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentQuery`](../../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`GatewaySettings`](../GatewaySettings.cs.mdmd.md#symbol-gatewaysettings)
- [`HubProxy`](../Wcf/HubProxy.cs.mdmd.md#symbol-hubproxy)
<!-- LIVE-DOC:END Dependencies -->
