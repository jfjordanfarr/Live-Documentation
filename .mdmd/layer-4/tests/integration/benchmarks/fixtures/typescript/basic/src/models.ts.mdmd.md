# tests/integration/benchmarks/fixtures/typescript/basic/src/models.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/basic/src/models.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-basic-src-models-ts
- Generated At: 2025-12-19T04:50:48.682Z

## Authored
### Purpose
Produces runtime widget instances that feed the `ts-basic` benchmark’s import graph, anchoring the oracle-aligned updates recorded in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Couples runtime creation with enum imports so regressions that demote these edges to “type-only” status are immediately caught by AST accuracy reports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T04:50:48.682Z","inputHash":"54edfc45d5b742e0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createWidget` {#symbol-createwidget}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/basic/src/models.ts#L3)
- Returns: [`Widget`](../../layered/src/models/widget.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Widget`](./types.ts.mdmd.md#symbol-widget)
- [`types.WidgetState`](./types.ts.mdmd.md#symbol-widgetstate)
<!-- LIVE-DOC:END Dependencies -->
