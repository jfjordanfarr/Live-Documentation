# tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs
- Generated At: 2026-09-27T23:21:33.029Z

## Authored
### Purpose
Backs the Razor telemetry page by promoting `appsettings.json` values into view data so the LD-402 pathfinder can observe the script → markup → configuration dependency chain.

### Notes
- Mirrors the Blazor `_Host` model to keep parity across ASP.NET fixtures; future coverage comparing the two will rely on this doc’s dependency links.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IndexModel (class)` {#symbol-indexmodel-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs#L4)
- Extends: `PageModel`

#### `IndexModel (constructor)` {#symbol-indexmodel-constructor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs#L8)
- Parameters: `configuration`: `IConfiguration`

#### `InstrumentationKey` {#symbol-instrumentationkey}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs#L13)

#### `OnGet` {#symbol-onget}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.AspNetCore.Mvc.RazorPages`
- `Microsoft.Extensions.Configuration`
- [`appsettings.Telemetry:InstrumentationKey`](../appsettings.json.mdmd.md#symbol-telemetryinstrumentationkey)
<!-- LIVE-DOC:END Dependencies -->
