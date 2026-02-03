# tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml
- Live Doc ID: LD-implementation-tests-integration-fixtures-blazor-telemetry-workspace-pages-host-cshtml
- Generated At: 2026-02-03T21:55:46.981Z

## Authored
### Purpose
Models the Blazor Server host page that renders hidden telemetry attributes consumed by the fixture’s JavaScript so we can validate markup-to-script pathfinding.

### Notes
- Keeps the markup minimal—layout, script include, and `data-` attributes—so changes in Roslyn-generated scaffolding do not mask the heuristics we are trying to test.
#### TelemetryEndpoint {#symbol-telemetryendpoint}
- `data-telemetry-endpoint` reflects the configuration value consumed by `blazor-telemetry.js` for runtime hydration.
#### TelemetryInstrumentationKey {#symbol-telemetryinstrumentationkey}
- `data-telemetry-instrumentation-key` exposes the App Insights key so the client bootstrapper matches instrumentation boundaries.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.981Z","inputHash":"995ac5cf7c53b7cd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`_Host.cshtml`](./_Host.cshtml.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
