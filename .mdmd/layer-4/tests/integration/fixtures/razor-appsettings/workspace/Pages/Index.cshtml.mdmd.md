# tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml
- Live Doc ID: LD-implementation-tests-integration-fixtures-razor-appsettings-workspace-pages-index-cshtml
- Generated At: 2026-09-27T10:16:32.094Z

## Authored
### Purpose
Renders the Razor telemetry page that exposes the instrumentation key for client scripts to bootstrap Application Insights.

### Notes
- Keeps markup intentionally sparse (hidden field and script loader) to isolate DOM dependency detection in tests.
- The hidden input `app-insights-key` surfaces the current instrumentation key so the page's script can read it. Its id is the page's public symbol, published by the markup adapter since 2026-09-27.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:32.094Z","inputHash":"89bfcaee9bdb882b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `app-insights-key` {#symbol-appinsightskey}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Index.cshtml`](./Index.cshtml.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
