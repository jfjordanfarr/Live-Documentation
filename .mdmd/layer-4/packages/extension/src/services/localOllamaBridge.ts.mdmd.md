# packages/extension/src/services/localOllamaBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/services/localOllamaBridge.ts
- Live Doc ID: LD-implementation-packages-extension-src-services-localollamabridge-ts
- Generated At: 2025-12-05T04:16:17.154Z

## Authored
### Purpose
Implements the BYOK fallback for local Ollama so the extension can keep Analyze-with-AI prompts running even when no `vscode.lm` providers are registered, delivering deterministic mock output on failure as described in Turn 13 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-13-better-warnings-context-windows-and-tests-lines-1655-1832](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-13-better-warnings-context-windows-and-tests-lines-1655-1832).

### Notes
- Extension wiring from that day routes `llmProviderMode: local-only` through `invokeLocalOllamaBridge` so fallback mocks keep integration tests deterministic while real workspaces hit the daemon, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1100-L1130](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1100-L1130).
- The helper now prefers workspace settings before environment variables and emits clear warnings when models are missing or context windows are overridden, as captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1920-L1950](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1920-L1950) and reinforced during the day-end recap at [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5500-L5535](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5500-L5535).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.154Z","inputHash":"14af6a864fef9d88"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `invokeLocalOllamaBridge` {#symbol-invokelocalollamabridge}
- Type: function
- Source: [source](../../../../../../packages/extension/src/services/localOllamaBridge.ts#L22)
- Parameters: `options`: `LocalInvocationOptions`

##### `invokeLocalOllamaBridge` — Summary
Attempt to call a workspace-local Ollama server. Falls back to a deterministic mock response when
the model is undefined or the request fails so integration tests stay reproducible.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `InvokeLlmResult`, `OllamaInvocationError`, `createMockOllamaResponse`, `invokeOllamaChat`, `resolveOllamaEndpoint`
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [localOllamaBridge.test.ts](./localOllamaBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
