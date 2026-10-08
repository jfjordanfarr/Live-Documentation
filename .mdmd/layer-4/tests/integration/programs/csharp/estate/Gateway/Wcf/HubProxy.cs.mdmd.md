# tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Gateway/Wcf/HubProxy.cs
- Generated At: 2026-10-02T20:20:04.922Z

## Authored
### Purpose
The client side of the hub contract: opens a channel on the `PaymentHub` client endpoint named in `Web.config` for each call and closes it after. The hub itself is another deployment, on-prem.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). `ChannelFactory<IPaymentHub>(EndpointName)` with the name in a constant is the C# adapter's WCF client case, linking this file to the endpoint `Web.config` publishes; a hand-verified hop.

## Generated
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
