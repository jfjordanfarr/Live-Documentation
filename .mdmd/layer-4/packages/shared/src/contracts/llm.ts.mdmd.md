# packages/shared/src/contracts/llm.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/llm.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-llm-ts
- Generated At: 2025-12-11T02:38:01.538Z

## Authored
### Purpose
Declares the `linkDiagnostics/llm/invoke` contract that lets the extension trigger shared LLM ingestion, first exercised when wiring the local Ollama bridge during [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-12-enabling-real-ollama-models-in-tests-lines-1507-1654](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-12-enabling-real-ollama-models-in-tests-lines-1507-1654).

### Notes
`InvokeLlmResult.usage` mirrors the confidence calibration work from [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460), so any schema changes must stay aligned with the inference accuracy tracker and ingestion orchestrator expectations.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.538Z","inputHash":"8d0605ea52731c7c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INVOKE_LLM_REQUEST` {#symbol-invoke_llm_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/llm.ts#L3)

#### `InvokeLlmRequest` {#symbol-invokellmrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/llm.ts#L5)

#### `InvokeLlmResult` {#symbol-invokellmresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/llm.ts#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`relationshipExtractor.ModelUsage`](../inference/llm/relationshipExtractor.ts.mdmd.md#symbol-modelusage) (type-only)
<!-- LIVE-DOC:END Dependencies -->
