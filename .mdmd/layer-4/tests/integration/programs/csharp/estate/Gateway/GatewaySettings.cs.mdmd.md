# tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs
- Generated At: 2026-10-02T20:20:04.894Z

## Authored
### Purpose
Which workload and environment this gateway deployment serves, read from `Web.config` through constants that hold the keys, so that a renamed key breaks in one file. The controller stamps both onto every request before it reaches the hub.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The hand-verified hop to `Web.config` through `WorkloadKey` and `EnvironmentKey` is the C# adapter's configuration-key case: a key held in a constant, resolved to the setting the configuration file publishes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GatewaySettings` {#symbol-gatewaysettings}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs#L6)

##### `GatewaySettings` — Summary
Which workload and environment this gateway deployment serves, from Web.config.

#### `WorkloadKey` {#symbol-workloadkey}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs#L8)

#### `EnvironmentKey` {#symbol-environmentkey}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs#L9)

#### `Workload` {#symbol-workload}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs#L11)

#### `Environment` {#symbol-environment}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/GatewaySettings.cs#L12)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Web.Gateway.Environment`](./Web.config.mdmd.md#symbol-gatewayenvironment)
- [`Web.Gateway.Workload`](./Web.config.mdmd.md#symbol-gatewayworkload)
<!-- LIVE-DOC:END Dependencies -->
