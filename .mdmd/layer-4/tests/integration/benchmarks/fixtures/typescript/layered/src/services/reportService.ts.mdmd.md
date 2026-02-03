# tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-layered-src-services-reportservice-ts
- Generated At: 2026-02-03T21:55:46.663Z

## Authored
### Purpose
Coordinates the service layer for the `ts-layered` benchmark so the analyzer proves it can follow chained runtime calls through data access and formatting, a requirement reinforced in [2025-11-03 summary](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Keeps dependencies explicit (`loadWidgetMetrics`, `formatReport`) to highlight transitive edges the oracle compares against analyzer output.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.663Z","inputHash":"dbfb300f5d6f4643"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `generateReport` {#symbol-generatereport}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts#L5)
- Parameters: `widget`: [`Widget`](../models/widget.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Widget`](../models/widget.ts.mdmd.md#symbol-widget)
- [`dataService.loadWidgetMetrics`](./dataService.ts.mdmd.md#symbol-loadwidgetmetrics)
- [`format.formatReport`](../utils/format.ts.mdmd.md#symbol-formatreport)
<!-- LIVE-DOC:END Dependencies -->
