# tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json
- Live Doc ID: LD-asset-tests-integration-fixtures-blazor-telemetry-workspace-appsettings-json
- Generated At: 2026-02-03T21:55:47.018Z

## Authored
### Purpose
Carries the telemetry endpoint and instrumentation key that the Blazor host page surfaces for JavaScript consumption during the LD-402 scenario.

### Notes
- Referenced by `_Host.cshtml.cs` via `IConfiguration`, which in turn binds the values into markup for `blazor-telemetry.js` to collect.
#### TelemetryEndpoint {#symbol-telemetryendpoint}
- `BlazorTelemetry:Endpoint` publishes the service URL that `_Host.cshtml` writes into `data-telemetry-endpoint`.
#### TelemetryInstrumentationKey {#symbol-telemetryinstrumentationkey}
- `BlazorTelemetry:InstrumentationKey` mirrors the Application Insights key exposed to the JavaScript bootstrapper.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:47.018Z","inputHash":"7b6308e6c454a8de"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
