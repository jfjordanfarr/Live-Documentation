# packages/server/src/features/knowledge/llmIngestionOrchestrator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/llmIngestionOrchestrator.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-llmingestionorchestrator-test-ts
- Generated At: 2025-12-11T02:38:00.725Z

## Authored
### Purpose
Exercises the orchestrator’s persistence and dry-run modes end-to-end, confirming calibrated relationships land in the graph with provenance while low-confidence edges remain excluded.

### Notes
- Authored alongside the orchestrator rollout captured in [2025-10-24 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md) to lock in the expected auditing surface (edge provenance plus snapshot emission).
- Keeps regression pressure on ProviderGuard integration by ensuring disabled providers would block work and by asserting dry runs avoid GraphStore mutation even when snapshots are produced.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.725Z","inputHash":"2948a3fa5ab06f8c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`
- `node:fs` - `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`llmIngestionOrchestrator.LlmIngestionOrchestrator`](./llmIngestionOrchestrator.ts.mdmd.md#symbol-llmingestionorchestrator)
- [`providerGuard.ProviderGuard`](../settings/providerGuard.ts.mdmd.md#symbol-providerguard)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
- `vscode-languageserver` - `Connection` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [llmIngestionOrchestrator.ts](./llmIngestionOrchestrator.ts.mdmd.md)
- packages/server/src/features/settings: [providerGuard.ts](../settings/providerGuard.ts.mdmd.md)
- packages/server/src/prompts/llm-ingestion: [relationshipTemplate.ts](../../prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
