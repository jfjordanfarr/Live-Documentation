# packages/server/src/features/knowledge/llmIngestionOrchestrator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/llmIngestionOrchestrator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-llmingestionorchestrator-ts
- Generated At: 2025-12-15T00:38:06.383Z

## Authored
### Purpose
Coordinates LLM-assisted relationship ingestion by batching queued artifacts, generating extraction prompts, and persisting calibrated graph links so downstream diagnostics can trust the captured evidence, mirroring the orchestrator delivered during the Oct 24 knowledge ingestion push documented in [2025-10-24 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md).

### Notes
Implements a guarded queue that respects administrator LLM settings, supports dry-run snapshots for auditability, and funnels extraction results through `calibrateConfidence` before storing provenance-rich edges; concurrency and chunk sizing remain tunable to balance throughput against context window limits.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.383Z","inputHash":"85abf27a618af707"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LlmIngestionLogger` {#symbol-llmingestionlogger}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts#L35)

#### `EnqueueOptions` {#symbol-enqueueoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts#L41)

#### `LlmIngestionResult` {#symbol-llmingestionresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts#L45)

#### `LlmIngestionOrchestratorOptions` {#symbol-llmingestionorchestratoroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts#L53)

#### `LlmIngestionOrchestrator` {#symbol-llmingestionorchestrator}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts#L76)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`, `randomUUID`
- `node:fs` - `promises`
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`providerGuard.ProviderGuard`](../settings/providerGuard.ts.mdmd.md#symbol-providerguard)
- [`relationshipTemplate.PromptArtifactSummary`](../../prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md#symbol-promptartifactsummary)
- [`relationshipTemplate.PromptChunkSummary`](../../prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md#symbol-promptchunksummary)
- [`relationshipTemplate.RELATIONSHIP_RESPONSE_SCHEMA`](../../prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md#symbol-relationship_response_schema)
- [`relationshipTemplate.renderRelationshipExtractionPrompt`](../../prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md#symbol-renderrelationshipextractionprompt)
- [`index.CalibratedRelationship`](../../../../shared/src/index.ts.mdmd.md#symbol-calibratedrelationship)
- [`index.CalibrationContext`](../../../../shared/src/index.ts.mdmd.md#symbol-calibrationcontext)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.RawRelationshipCandidate`](../../../../shared/src/index.ts.mdmd.md#symbol-rawrelationshipcandidate)
- [`index.RelationshipExtractionBatch`](../../../../shared/src/index.ts.mdmd.md#symbol-relationshipextractionbatch)
- [`index.RelationshipExtractionPrompt`](../../../../shared/src/index.ts.mdmd.md#symbol-relationshipextractionprompt)
- [`index.RelationshipExtractionRequest`](../../../../shared/src/index.ts.mdmd.md#symbol-relationshipextractionrequest)
- [`index.RelationshipExtractor`](../../../../shared/src/index.ts.mdmd.md#symbol-relationshipextractor)
- [`index.calibrateConfidence`](../../../../shared/src/index.ts.mdmd.md#symbol-calibrateconfidence)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [llmIngestionOrchestrator.test.ts](./llmIngestionOrchestrator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
