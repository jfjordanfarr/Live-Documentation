# tests/integration/fixtures/blazor-telemetry/workspace/wwwroot/js/blazor-telemetry.js

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/blazor-telemetry/workspace/wwwroot/js/blazor-telemetry.js
- Live Doc ID: LD-implementation-tests-integration-fixtures-blazor-telemetry-workspace-wwwroot-js-blazor-telemetry-js
- Generated At: 2025-12-06T22:49:48.886Z

## Authored
### Purpose
Captures an interop script that reads telemetry attributes from `_Host.cshtml` and forwards them to the client telemetry sink, mirroring real Blazor Server patterns.

### Notes
- Mirrors the Razor telemetry script so the DOM heuristic is forced to discriminate between host shells; this keeps the LD-402 regression suite honest once additional Blazor fixtures arrive.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.886Z","inputHash":"a703d0e031e34038"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`_Host.telemetry-endpoint`](../../Pages/_Host.cshtml.mdmd.md#symbol-telemetryendpoint)
<!-- LIVE-DOC:END Dependencies -->
