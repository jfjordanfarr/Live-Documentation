# packages/shared/src/inference/llm/relationshipExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/llm/relationshipExtractor.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-llm-relationshipextractor-ts
- Generated At: 2026-02-03T21:55:39.164Z

## Authored
### Purpose
Normalizes LLM prompt responses into validated relationship batches so the ingestion orchestrator can persist or preview link edges without trusting raw JSON straight from the model <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1794> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6944-L6954>.

### Notes
- The dry-run harness and `llmIngestionOrchestrator` tests assert that this extractor raises on malformed payloads and records provenance for calibrated relationships—keep that contract intact when evolving the schema <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160>.
- We intentionally ship with a stub model invoker (logs once, yields empty relationships) to let the change processor exercise ingestion without mutating the graph; replace it only alongside real `vscode.lm` wiring and updated fixtures <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6944-L6954>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.164Z","inputHash":"9de442eefeffaa26"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfidenceTier` {#symbol-confidencetier}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L3)

#### `RelationshipExtractionPrompt` {#symbol-relationshipextractionprompt}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L5)

#### `ModelInvocationRequest` {#symbol-modelinvocationrequest}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L13)

#### `ModelUsage` {#symbol-modelusage}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L19)

#### `ModelInvocationResult` {#symbol-modelinvocationresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L25)

#### `ModelInvoker` {#symbol-modelinvoker}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L31)
- Parameters: `request`: [`ModelInvocationRequest`](#symbol-modelinvocationrequest)

#### `RelationshipExtractionRequest` {#symbol-relationshipextractionrequest}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L33)

#### `RawRelationshipCandidate` {#symbol-rawrelationshipcandidate}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L39)

#### `RelationshipExtractionBatch` {#symbol-relationshipextractionbatch}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L49)

#### `RelationshipExtractorOptions` {#symbol-relationshipextractoroptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L59)

#### `RelationshipExtractorLogger` {#symbol-relationshipextractorlogger}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L64)

#### `RelationshipExtractorError` {#symbol-relationshipextractorerror}
- Type: class
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L69)

#### `RelationshipExtractor` {#symbol-relationshipextractor}
- Type: class
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L75)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.LinkRelationshipKind`](../../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [localOllamaBridge.test.ts](../../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [confidenceCalibrator.test.ts](./confidenceCalibrator.test.ts.mdmd.md)
- [relationshipExtractor.test.ts](./relationshipExtractor.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
