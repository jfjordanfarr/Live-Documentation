# tests/integration/core/llm/llmIngestionDryRun.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/core/llm/llmIngestionDryRun.test.ts
- Live Doc ID: LD-test-tests-integration-core-llm-llmingestiondryrun-test-ts
- Generated At: 2026-01-07T20:20:40.044Z

## Authored
### Purpose
Validates the LLM ingestion dry-run mode: the orchestrator processes relationship extraction results and emits a snapshot file without mutating the graph store. Essential for previewing LLM-discovered edges before committing them.

### Notes
- Originally `us5/llmIngestionDryRun.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- Uses CommonJS require() pattern due to `@ts-nocheck` header — test predates full TypeScript migration
- Creates temporary harness with mock LLM responses from `__fixtures__/llm-ingestion/dry-run.sample.json`
- Tests both "high" and "low" confidence label handling for relationship filtering
- Part of the **core/llm** test category for LLM integration validation

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.044Z","inputHash":"d3cf2d3fd65db97f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
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
