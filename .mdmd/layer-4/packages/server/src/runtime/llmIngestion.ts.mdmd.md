# packages/server/src/runtime/llmIngestion.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/runtime/llmIngestion.ts
- Live Doc ID: LD-implementation-packages-server-src-runtime-llmingestion-ts
- Generated At: 2025-11-24T15:19:58.945Z

## Authored
### Purpose
Runs the language-server side of the Analyze-with-AI pipeline, queuing artifacts for `LlmIngestionOrchestrator` and relaying `INVOKE_LLM_REQUEST` calls back to the extension so AI assessments get persisted, a workflow introduced in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000).

### Notes
`createDefaultRelationshipExtractor` gates remote invocation behind `providerGuard` so disabled or local-only modes short-circuit gracefully; tune the provider policy alongside the analyzer contract touched in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1754-L1789](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1754-L1789) to avoid regressions. Logging only emits the first successful dispatch per session to keep the extension host output readable while still surfacing failures during the ingestion loop.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.945Z","inputHash":"e9dd4566d4a46329"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LlmIngestionManagerOptions` {#symbol-llmingestionmanageroptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/llmIngestion.ts#L14)

#### `LlmIngestionManager` {#symbol-llmingestionmanager}
- Type: class
- Source: [source](../../../../../../packages/server/src/runtime/llmIngestion.ts#L19)

#### `CreateRelationshipExtractorOptions` {#symbol-createrelationshipextractoroptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/llmIngestion.ts#L80)

#### `createDefaultRelationshipExtractor` {#symbol-createdefaultrelationshipextractor}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/llmIngestion.ts#L85)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `INVOKE_LLM_REQUEST`, `InvokeLlmRequest`, `InvokeLlmResult`, `ModelInvoker`, `RelationshipExtractor`
- [`llmIngestionOrchestrator.LlmIngestionOrchestrator`](../features/knowledge/llmIngestionOrchestrator.ts.mdmd.md#symbol-llmingestionorchestrator)
- [`llmIngestionOrchestrator.LlmIngestionResult`](../features/knowledge/llmIngestionOrchestrator.ts.mdmd.md#symbol-llmingestionresult)
- [`providerGuard.ProviderGuard`](../features/settings/providerGuard.ts.mdmd.md#symbol-providerguard) (type-only)
- `vscode-languageserver/node` - `Connection` (type-only)
<!-- LIVE-DOC:END Dependencies -->
