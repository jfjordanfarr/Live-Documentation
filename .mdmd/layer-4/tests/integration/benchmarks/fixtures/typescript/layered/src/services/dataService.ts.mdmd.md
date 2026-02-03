# tests/integration/benchmarks/fixtures/typescript/layered/src/services/dataService.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/layered/src/services/dataService.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-layered-src-services-dataservice-ts
- Generated At: 2026-02-03T21:55:46.632Z

## Authored
### Purpose
Provides the intermediate service layer for the `ts-layered` benchmark so dependency analysis must traverse repository classes before returning metrics, aligning with the TypeScript remediation captured in [2025-11-03 summary](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Instantiates `StorageClient` at module scope to highlight runtime evaluation and ensure static analyzers respect constructor side effects.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.632Z","inputHash":"6ec12e4c236bd9da"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadWidgetMetrics` {#symbol-loadwidgetmetrics}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/layered/src/services/dataService.ts#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`storage.MetricRecord`](../repositories/storage.ts.mdmd.md#symbol-metricrecord)
- [`storage.StorageClient`](../repositories/storage.ts.mdmd.md#symbol-storageclient)
<!-- LIVE-DOC:END Dependencies -->
