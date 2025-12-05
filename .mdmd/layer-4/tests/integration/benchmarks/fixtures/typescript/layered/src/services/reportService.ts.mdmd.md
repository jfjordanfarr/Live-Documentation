# tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-typescript-layered-src-services-reportservice-ts
- Generated At: 2025-12-05T04:16:22.035Z

## Authored
### Purpose
Coordinates the service layer for the `ts-layered` benchmark so the analyzer proves it can follow chained runtime calls through data access and formatting, a requirement reinforced in [2025-11-03 summary](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Keeps dependencies explicit (`loadWidgetMetrics`, `formatReport`) to highlight transitive edges the oracle compares against analyzer output.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:22.035Z","inputHash":"d4eb6cda6f0668d9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `generateReport` {#symbol-generatereport}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts#L5)
- Parameters: `widget`: `Widget`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`widget.Widget`](../models/widget.ts.mdmd.md#symbol-widget)
- [`dataService.loadWidgetMetrics`](./dataService.ts.mdmd.md#symbol-loadwidgetmetrics)
- [`format.formatReport`](../utils/format.ts.mdmd.md#symbol-formatreport)
<!-- LIVE-DOC:END Dependencies -->
