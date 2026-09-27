# tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json
- Generated At: 2026-09-27T23:21:32.514Z

## Authored
### Purpose
Carries the telemetry endpoint and instrumentation key that the Blazor host page surfaces for JavaScript consumption.

### Notes
- Referenced by `_Host.cshtml.cs` via `IConfiguration`, which in turn binds the values into markup for `blazor-telemetry.js` to collect.
- `Telemetry:Endpoint` is the service URL that `_Host.cshtml` writes into `data-telemetry-endpoint`; `Telemetry:InstrumentationKey` is the Application Insights key exposed to the JavaScript bootstrapper. Both key paths are the file's public symbols, published by the JSON adapter since 2026-09-27.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Telemetry` {#symbol-telemetry}
- Type: key

#### `Telemetry:Endpoint` {#symbol-telemetryendpoint}
- Type: key

#### `Telemetry:InstrumentationKey` {#symbol-telemetryinstrumentationkey}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
