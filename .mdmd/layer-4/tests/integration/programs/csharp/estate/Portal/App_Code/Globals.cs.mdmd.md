# tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs
- Generated At: 2026-10-02T20:20:05.151Z

## Authored
### Purpose
The one place the portal reads `Web.config`: every appSettings key is a constant here so that a renamed key breaks in one file, and the page and the controller read the typed values.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The owner's own convention, "a common C# configuration reference file (we tend to call ours `Globals.cs`)" (2025-11-06, quoted in [Sample Programs](../../../../../../../../layer-3/sample-programs.mdmd.md)); the hop to `Web.config` through the constants is hand-verified and found since the C# rewrite.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Globals` {#symbol-globals}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs#L9)

##### `Globals` — Summary
The one place the portal reads Web.config. Every appSettings key is a constant
here so that a renamed key breaks in one file.

#### `GatewayBaseUrlKey` {#symbol-gatewaybaseurlkey}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs#L11)

#### `PaymentsEnabledKey` {#symbol-paymentsenabledkey}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs#L12)

#### `GatewayBaseUrl` {#symbol-gatewaybaseurl}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs#L14)

#### `PaymentsEnabled` {#symbol-paymentsenabled}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Portal/App_Code/Globals.cs#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Web.Portal.GatewayBaseUrl`](../Web.config.mdmd.md#symbol-portalgatewaybaseurl)
- [`Web.Portal.PaymentsEnabled`](../Web.config.mdmd.md#symbol-portalpaymentsenabled)
<!-- LIVE-DOC:END Dependencies -->
