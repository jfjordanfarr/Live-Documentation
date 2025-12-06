# tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml
- Live Doc ID: LD-implementation-tests-integration-fixtures-razor-appsettings-workspace-pages-index-cshtml
- Generated At: 2025-12-06T22:49:55.210Z

## Authored
### Purpose
Renders the Razor telemetry page that exposes the instrumentation key for client scripts to bootstrap Application Insights during the LD-402 scenario.

### Notes
- Keeps markup intentionally sparse—hidden field and script loader—to isolate DOM dependency detection in tests.
#### AppInsightsKey {#symbol-appinsightskey}
- Hidden input `appinsightskey` surfaces the current instrumentation key so downstream scripts can discover it via standard form field lookup.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:55.210Z","inputHash":"37805a6bce7aa525"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Index.cshtml`](./Index.cshtml.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
