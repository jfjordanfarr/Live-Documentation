# tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-estate-portal-services-gatewayclient-cs
- Generated At: 2026-09-27T18:34:28.566Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:28.566Z","inputHash":"7094bccdaff4439e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GatewayClient (class)` {#symbol-gatewayclient-class}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs#L13)

##### `GatewayClient (class)` — Summary
HTTP client for the payments gateway. The gateway is a separate deployment in the
same cloud; the only ties are the base URL in Web.config and the route strings here.

#### `GatewayClient (constructor)` {#symbol-gatewayclient-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs#L19)

#### `PostPaymentAsync` {#symbol-postpaymentasync}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs#L24)
- Returns: [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
- Parameters: `request`: [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)

#### `GetPaymentAsync` {#symbol-getpaymentasync}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/estate/Portal/Services/GatewayClient.cs#L31)
- Returns: [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentRequestModel`](../Models/PaymentRequestModel.cs.mdmd.md#symbol-paymentrequestmodel)
- [`PaymentResultModel`](../Models/PaymentResultModel.cs.mdmd.md#symbol-paymentresultmodel)
<!-- LIVE-DOC:END Dependencies -->
