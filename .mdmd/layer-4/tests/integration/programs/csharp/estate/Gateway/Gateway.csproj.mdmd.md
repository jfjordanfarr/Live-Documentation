# tests/integration/programs/csharp/estate/Gateway/Gateway.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Gateway/Gateway.csproj
- Generated At: 2026-10-02T20:20:04.876Z

## Authored
### Purpose
The cloud gateway's project: a .NET Framework 4.8 Web API 2 application, standing on the contracts library, the Web API package and the configuration and WCF assemblies.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Read by the project adapter: a `library` by its SDK, since none of the estate's projects carries a web SDK or an output type, so every one reads as a library and the board names their kinds itself; its project reference links to the contracts project's doc, and its package and assembly references are the externals the board's join lists as what the `gateway` thing stands on.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Gateway` {#symbol-gateway}
- Type: library
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Gateway/Gateway.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.AspNet.WebApi.Core@5.3.0`
- `System.Configuration`
- `System.ServiceModel`
- [`Contracts`](../Contracts/Contracts.csproj.mdmd.md#symbol-contracts)
<!-- LIVE-DOC:END Dependencies -->
