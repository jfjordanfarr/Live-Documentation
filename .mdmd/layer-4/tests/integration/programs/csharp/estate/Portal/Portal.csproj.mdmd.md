# tests/integration/programs/csharp/estate/Portal/Portal.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Portal/Portal.csproj
- Generated At: 2026-10-02T20:20:05.283Z

## Authored
### Purpose
The cloud portal's project: a .NET Framework 4.8 WebForms substrate with Web API 2 controllers, standing on the `System.Web`, configuration and HTTP assemblies and the Web API package, with no project references: the portal talks JSON to the gateway and shares no code with it.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Read by the project adapter as a library, since no web SDK marks it; the board calls it `web`. The portal is also the estate's form of the owner's WebForms scenario of 2025-11-06, told in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Portal` {#symbol-portal}
- Type: library
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Portal/Portal.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.AspNet.WebApi.Core@5.3.0`
- `System.Configuration`
- `System.Net.Http`
- `System.Web`
<!-- LIVE-DOC:END Dependencies -->
