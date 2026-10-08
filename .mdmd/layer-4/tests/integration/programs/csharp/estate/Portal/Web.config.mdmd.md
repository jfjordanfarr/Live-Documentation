# tests/integration/programs/csharp/estate/Portal/Web.config

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Portal/Web.config
- Generated At: 2026-10-02T20:20:05.347Z

## Authored
### Purpose
The portal's configuration: the gateway's base URL and whether payments are enabled, the two appSettings that `Globals.cs` reads through constants.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The configuration adapter publishes the two keys as settings; `Globals.cs`'s hand-verified hop to them is the C# adapter's configuration-key case.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Portal.GatewayBaseUrl` {#symbol-portalgatewaybaseurl}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Portal/Web.config#L4)

#### `Portal.PaymentsEnabled` {#symbol-portalpaymentsenabled}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Portal/Web.config#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
