# packages/shared/src/tooling/ollamaMock.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaMock.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamamock-ts
- Generated At: 2025-12-11T02:38:02.398Z

## Authored
### Purpose
Provides a deterministic Ollama chat payload so the extension and CLI can fall back gracefully when no local model is available ([Local Ollama Bridge rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).

### Notes
- Supplies the JSON echo/rationale block consumed by `invokeLocalOllamaBridge`, letting integration tests run without real `vscode.lm` registrations ([bridge summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1109)).
- Shared with `run-chat.ts` so both manual and automated flows report identical mock usage metadata instead of ad hoc CLI scaffolding ([bridge summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1109-L1112)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.398Z","inputHash":"a65a6fc4268bad0d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MockOllamaResponse` {#symbol-mockollamaresponse}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L6)

#### `CreateMockOllamaResponseOptions` {#symbol-createmockollamaresponseoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L12)

#### `createMockOllamaResponse` {#symbol-createmockollamaresponse}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L17)
- Returns: [`MockOllamaResponse`](#symbol-mockollamaresponse)
- Parameters: `options`: [`CreateMockOllamaResponseOptions`](#symbol-createmockollamaresponseoptions)

#### `MOCK_OLLAMA_MODEL_ID` {#symbol-mock_ollama_model_id}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L45)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ollamaClient.OllamaChatUsage`](./ollamaClient.ts.mdmd.md#symbol-ollamachatusage) (type-only)
<!-- LIVE-DOC:END Dependencies -->
