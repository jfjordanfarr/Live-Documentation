# tests/integration/programs/typescript/basic/src/models.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/basic/src/models.ts
- Live Doc ID: LD-test-tests-integration-programs-typescript-basic-src-models-ts
- Generated At: 2026-09-27T18:53:08.453Z

## Authored
### Purpose
Produces runtime widget instances that feed the `ts-basic` benchmark’s import graph, anchoring the oracle-aligned updates recorded in [2025-11-03 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Couples runtime creation with enum imports so regressions that demote these edges to “type-only” status are immediately caught by AST accuracy reports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.453Z","inputHash":"530ce5d3d7ddace6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createWidget` {#symbol-createwidget}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/basic/src/models.ts#L3)
- Returns: [`Widget`](./types.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Widget`](./types.ts.mdmd.md#symbol-widget)
- [`types.WidgetState`](./types.ts.mdmd.md#symbol-widgetstate)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
