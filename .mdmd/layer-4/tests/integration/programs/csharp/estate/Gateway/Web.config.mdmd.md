# tests/integration/programs/csharp/estate/Gateway/Web.config

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Gateway/Web.config
- Generated At: 2026-10-02T20:20:04.938Z

## Authored
### Purpose
The gateway's configuration: the workload and environment this deployment serves as appSettings, and the `PaymentHub` client endpoint whose address reaches the on-prem hub over the tunnel, with the hub's contract.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The configuration adapter publishes the two keys as settings and the endpoint by name; `GatewaySettings.cs` reads the keys through constants and `HubProxy.cs` names the endpoint, both hand-verified hops the C# adapter finds. The client address matches the hub's listening address in `Hub/App.config`, the remote hop observed from configuration, and the contract links to `IPaymentHub.cs`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Gateway.Workload` {#symbol-gatewayworkload}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Web.config#L4)

#### `Gateway.Environment` {#symbol-gatewayenvironment}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Web.config#L5)

#### `PaymentHub` {#symbol-paymenthub}
- Type: endpoint
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Web.config#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentHub`](../Contracts/IPaymentHub.cs.mdmd.md#symbol-ipaymenthub)
- [`App.net.tcp://hub.onprem.example:8731/PaymentHub`](../Hub/App.config.mdmd.md#symbol-nettcphubonpremexample8731paymenthub) (configuration)
<!-- LIVE-DOC:END Dependencies -->
