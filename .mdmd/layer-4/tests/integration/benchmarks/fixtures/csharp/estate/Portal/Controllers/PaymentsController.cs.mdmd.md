# tests/integration/benchmarks/fixtures/csharp/estate/Portal/Controllers/PaymentsController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/estate/Portal/Controllers/PaymentsController.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-estate-portal-controllers-paymentscontroller-cs
- Generated At: 2026-09-27T18:34:28.428Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:28.428Z","inputHash":"022deed499fe7260"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsController` {#symbol-paymentscontroller}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Controllers/PaymentsController.cs#L10)
- Extends: `ApiController`

##### `PaymentsController` — Summary
Receives the browser's payment requests and forwards them to the gateway.

#### `Post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Controllers/PaymentsController.cs#L16)
- Returns: `IHttpActionResult`
- Parameters: `request`: [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)

#### `Get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Controllers/PaymentsController.cs#L28)
- Returns: `IHttpActionResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Globals`](../App_Code/Globals.cs.mdmd.md#symbol-globals)
- [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)
- [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
- [`GatewayClient`](../Services/GatewayClient.cs.mdmd.md#symbol-gatewayclient-class)
<!-- LIVE-DOC:END Dependencies -->
