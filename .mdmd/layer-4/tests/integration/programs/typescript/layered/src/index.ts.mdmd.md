# tests/integration/programs/typescript/layered/src/index.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/layered/src/index.ts
- Live Doc ID: LD-test-tests-integration-programs-typescript-layered-src-index-ts
- Generated At: 2026-09-27T18:53:08.519Z

## Authored
### Purpose
Serves as the orchestration entrypoint for the `ts-layered` benchmark, exercising multi-hop runtime imports validated by the TypeScript oracle work in [2025-11-03 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Forces analyzer traces through services, repositories, and utils so transitive runtime edges surface in AST accuracy reports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.519Z","inputHash":"42670546b5d7ce87"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run` {#symbol-run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/layered/src/index.ts#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Widget`](./models/widget.ts.mdmd.md#symbol-widget)
- [`reportService.generateReport`](./services/reportService.ts.mdmd.md#symbol-generatereport)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
