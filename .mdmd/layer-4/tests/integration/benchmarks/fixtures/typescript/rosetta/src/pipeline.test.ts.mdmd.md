# tests/integration/benchmarks/fixtures/typescript/rosetta/src/pipeline.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/fixtures/typescript/rosetta/src/pipeline.test.ts
- Live Doc ID: LD-test-tests-integration-benchmarks-fixtures-typescript-rosetta-src-pipeline-test-ts
- Generated At: 2026-02-03T21:55:46.845Z

## Authored
### Purpose
Integration tests for the TypeScript Rosetta data processing pipeline. Validates end-to-end processing through processor and models modules.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection: `pipeline.test.ts` imports processor/models, so those files appear as "test-backed" without a directly name-matched test file.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.845Z","inputHash":"fb063b589e80956e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.Record`](./models.ts.mdmd.md#symbol-record)
- [`models.Report`](./models.ts.mdmd.md#symbol-report)
- [`models.createRecord`](./models.ts.mdmd.md#symbol-createrecord)
- [`models.validateConfig`](./models.ts.mdmd.md#symbol-validateconfig)
- [`processor.run`](./processor.ts.mdmd.md#symbol-run)
- [`processor.summarize`](./processor.ts.mdmd.md#symbol-summarize)
- [`types.ProcessorConfig`](./types.ts.mdmd.md#symbol-processorconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
- Mocha Integration Tests - [tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts)
- Mocha Integration Tests - [tests/integration/benchmarks/fixtures/typescript/rosetta/src/processor.ts](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/processor.ts)
- Mocha Integration Tests - [tests/integration/benchmarks/fixtures/typescript/rosetta/src/types.ts](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/types.ts)
<!-- LIVE-DOC:END Supporting Fixtures -->
