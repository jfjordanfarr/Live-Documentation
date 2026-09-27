# tests/integration/programs/typescript/basic/src/util.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/basic/src/util.ts
- Generated At: 2026-09-27T23:21:39.355Z

## Authored
### Purpose
Formats runtime widget output for the `ts-basic` benchmark so the analyzer must follow value-bearing imports into `types.ts`, as exercised in [2025-11-03 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Imports `Widget` as a type to confirm the oracle distinguishes runtime usage (this function) from the helper-only module, exposing type-only edges if fallback heuristics regress.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `formatWidget` {#symbol-formatwidget}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/basic/src/util.ts#L3)
- Parameters: `widget`: [`Widget`](./types.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Widget`](./types.ts.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Dependencies -->
