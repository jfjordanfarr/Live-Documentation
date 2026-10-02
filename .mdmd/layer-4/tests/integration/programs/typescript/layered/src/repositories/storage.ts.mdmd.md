# tests/integration/programs/typescript/layered/src/repositories/storage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/layered/src/repositories/storage.ts
- Generated At: 2026-10-02T20:20:09.019Z

## Authored
### Purpose
Defines the repository layer for the `ts-layered` benchmark so the analyzer must follow class-based imports into `models/widget.ts`, reflecting the stack decomposition described in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Returns hard-coded metric records to isolate dependency traversal from data variability while still proving constructor-level runtime edges.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MetricRecord` {#symbol-metricrecord}
- Type: interface
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/layered/src/repositories/storage.ts#L3)

#### `StorageClient` {#symbol-storageclient}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/layered/src/repositories/storage.ts#L8)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Widget`](../models/widget.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Dependencies -->
