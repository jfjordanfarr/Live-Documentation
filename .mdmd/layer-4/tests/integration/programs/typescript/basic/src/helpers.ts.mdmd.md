# tests/integration/programs/typescript/basic/src/helpers.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/basic/src/helpers.ts
- Live Doc ID: LD-test-tests-integration-programs-typescript-basic-src-helpers-ts
- Generated At: 2026-09-27T18:53:08.418Z

## Authored
### Purpose
Acts as the negative-control file for the `ts-basic` benchmark so the analyzer proves it no longer fabricates edges to unused helpers, a regression we addressed in [2025-11-03 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Remains unreferenced by design; any dependency surfaced here signals fallback heuristics leaking type-only speculation back into runtime accuracy scores.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.418Z","inputHash":"9982dfe9f4a3eac2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `unusedHelper` {#symbol-unusedhelper}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/basic/src/helpers.ts#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
