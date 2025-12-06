# tests/integration/benchmarks/fixtures/typescript/basic/src/helpers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/basic/src/helpers.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-basic-src-helpers-ts
- Generated At: 2025-12-06T22:49:48.644Z

## Authored
### Purpose
Acts as the negative-control file for the `ts-basic` benchmark so the analyzer proves it no longer fabricates edges to unused helpers, a regression we addressed in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Remains unreferenced by design; any dependency surfaced here signals fallback heuristics leaking type-only speculation back into runtime accuracy scores.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.644Z","inputHash":"05f77796b235b2cc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `unusedHelper` {#symbol-unusedhelper}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/basic/src/helpers.ts#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
