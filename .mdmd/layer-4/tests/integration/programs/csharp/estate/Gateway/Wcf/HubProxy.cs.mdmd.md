# tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs
- Live Doc ID: LD-test-tests-integration-programs-csharp-estate-gateway-wcf-hubproxy-cs
- Generated At: 2026-09-27T21:43:43.933Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:43.933Z","inputHash":"19b8724fc0a2c6ec"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HubProxy` {#symbol-hubproxy}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs#L12)

##### `HubProxy` — Summary
Client side of the hub contract. The endpoint address lives in Web.config under the
"PaymentHub" client endpoint; the hub itself is another deployment, on-prem.

#### `EndpointName` {#symbol-endpointname}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs#L14)

#### `PostPayment` {#symbol-postpayment}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs#L16)
- Returns: [`PaymentResult`](../../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `request`: [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)

#### `GetPayment` {#symbol-getpayment}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs#L18)
- Returns: [`PaymentResult`](../../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- Parameters: `query`: [`PaymentQuery`](../../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentHub`](../../Contracts/IPaymentHub.cs.mdmd.md#symbol-ipaymenthub)
- [`PaymentQuery`](../../Contracts/PaymentQuery.cs.mdmd.md#symbol-paymentquery)
- [`PaymentRequest`](../../Contracts/PaymentRequest.cs.mdmd.md#symbol-paymentrequest)
- [`PaymentResult`](../../Contracts/PaymentResult.cs.mdmd.md#symbol-paymentresult)
- [`Web.PaymentHub`](../Web.config.mdmd.md#symbol-paymenthub)
<!-- LIVE-DOC:END Dependencies -->
