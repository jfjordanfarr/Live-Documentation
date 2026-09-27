# tests/integration/programs/typescript/layered/src/services/reportService.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/layered/src/services/reportService.ts
- Live Doc ID: LD-test-tests-integration-programs-typescript-layered-src-services-reportservice-ts
- Generated At: 2026-09-27T18:53:08.595Z

## Authored
### Purpose
Coordinates the service layer for the `ts-layered` benchmark so the analyzer proves it can follow chained runtime calls through data access and formatting, a requirement reinforced in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Keeps dependencies explicit (`loadWidgetMetrics`, `formatReport`) to highlight transitive edges the oracle compares against analyzer output.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.595Z","inputHash":"b225762590ae6f6b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `generateReport` {#symbol-generatereport}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/layered/src/services/reportService.ts#L5)
- Parameters: `widget`: [`Widget`](../models/widget.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Widget`](../models/widget.ts.mdmd.md#symbol-widget)
- [`dataService.loadWidgetMetrics`](./dataService.ts.mdmd.md#symbol-loadwidgetmetrics)
- [`format.formatReport`](../utils/format.ts.mdmd.md#symbol-formatreport)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
