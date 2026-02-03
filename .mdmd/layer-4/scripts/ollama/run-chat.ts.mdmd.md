# scripts/ollama/run-chat.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/ollama/run-chat.ts
- Live Doc ID: LD-implementation-scripts-ollama-run-chat-ts
- Generated At: 2026-02-03T21:55:42.004Z

## Authored
### Purpose
Bridges integration tooling to a local Ollama server by reading the workspace endpoint, posting chat prompts, and echoing structured JSON so VS Code harnesses can exercise real LLM calls instead of mocks, as planned during the Ollama bridge design session on 2025-10-29 ([chat reference](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L696-L755)).

### Notes
- Created 2025-10-29 alongside `ollamaEndpoint.ts` and `ollamaClient.ts` to supply the CLI half of the bridge, with repeated rewrites to stabilise stdin handling and keep the schema aligned with the extension ([chat build log](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L801-L1120)).
- Onboarded into the new workspace 2025-11-14 when we reconnected qwen3-coder:30b: set persistent environment variables, created the `ollama-traces/` audit directory, invoked this script directly, and reran `npm run test:integration` to confirm real responses flowed through ([environment restore runbook](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3506-L3579)).
- Subsequent summary captured the regression-fix outcome: integration tests now consume this CLI during local-only provider runs without the “[ollama-bridge] No model configured” warning ([11-14 recap](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-restore-ollama-bridge-for-integration-tests-lines-3301-3600)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.004Z","inputHash":"75fc1b8d097358ac"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ollamaClient.OllamaChatUsage`](../../packages/shared/src/tooling/ollamaClient.ts.mdmd.md#symbol-ollamachatusage)
- [`ollamaClient.OllamaInvocationError`](../../packages/shared/src/tooling/ollamaClient.ts.mdmd.md#symbol-ollamainvocationerror)
- [`ollamaClient.invokeOllamaChat`](../../packages/shared/src/tooling/ollamaClient.ts.mdmd.md#symbol-invokeollamachat)
- [`ollamaEndpoint.resolveOllamaEndpoint`](../../packages/shared/src/tooling/ollamaEndpoint.ts.mdmd.md#symbol-resolveollamaendpoint)
- [`ollamaMock.createMockOllamaResponse`](../../packages/shared/src/tooling/ollamaMock.ts.mdmd.md#symbol-createmockollamaresponse)
<!-- LIVE-DOC:END Dependencies -->
