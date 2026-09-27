# tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml
- Live Doc ID: LD-implementation-tests-integration-fixtures-blazor-telemetry-workspace-pages-host-cshtml
- Generated At: 2026-09-27T10:16:29.787Z

## Authored
### Purpose
Models the Blazor Server host page that renders hidden telemetry attributes consumed by the fixture’s JavaScript so we can validate markup-to-script pathfinding.

### Notes
- Keeps the markup minimal (layout, script include, and `data-` attributes) so changes in Roslyn-generated scaffolding do not mask the heuristics under test.
- The `telemetry-endpoint` element carries `data-telemetry-endpoint` and `data-telemetry-instrumentation-key`, the configuration values `blazor-telemetry.js` reads at runtime. Its id is the page's one public symbol; the markup adapter publishes it since 2026-09-27, so the heading that used to fake the anchor here is gone.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:29.787Z","inputHash":"f15e437c4bdd6527"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `telemetry-endpoint` {#symbol-telemetryendpoint}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`_Host.cshtml`](./_Host.cshtml.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
