# tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Scripts/app-insights.js

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Scripts/app-insights.js
- Live Doc ID: LD-implementation-tests-integration-fixtures-webforms-appsettings-workspace-packages-site-scripts-app-insights-js
- Generated At: 2025-12-06T22:49:55.272Z

## Authored
### Purpose
Fixture JavaScript demonstrating how telemetry scripts consume configuration injected by the WebForms page during integration tests.

### Notes
- Used by ripple diagnostics to prove configuration updates flow from server-side fields into the browser runtime.
- Keeps instrumentation key wiring intentionally simple so tests can focus on configuration change detection rather than telemetry implementation details.
- Update this file in tandem with `Default.aspx.cs` and `Web.config` to keep dependency mappings accurate.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:55.272Z","inputHash":"edb0146c06f314bd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `initializeTelemetry` {#symbol-initializetelemetry}
- Type: unknown
- Source: [source](../../../../../../../../../../tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Scripts/app-insights.js#L12)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Default.AppInsightsInstrumentationKey`](../Default.aspx.mdmd.md#symbol-appinsightsinstrumentationkey)
<!-- LIVE-DOC:END Dependencies -->
