# packages/extension/src/services/llmInvoker.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/services/llmInvoker.ts
- Live Doc ID: LD-implementation-packages-extension-src-services-llminvoker-ts
- Generated At: 2025-12-05T04:16:17.116Z

## Authored
### Purpose
Provides the Analyze-with-AI command a reusable wrapper around `vscode.lm` so diagnostics can request summaries, confidence, and recommendations, as introduced in Turn 13 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000).

### Notes
- Captures the Oct 26 implementation details - caching the last model, interactive quick pick, and routing assessment storage - per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795).
- Respects the governance decisions from Oct 21 to default sensitive workspaces to `llmProviderMode: local-only` and to block diagnostics when the provider is disabled, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L120-L190](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L120-L190); keep the filter and error reasons aligned with those consent requirements.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.116Z","inputHash":"30259e3c0d423ed1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LlmProviderMode` {#symbol-llmprovidermode}
- Type: type
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L5)
- Returns: `LinkDiagnosticsSettings`

#### `LlmInvocationFailureReason` {#symbol-llminvocationfailurereason}
- Type: type
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L7)

#### `LlmInvocationError` {#symbol-llminvocationerror}
- Type: class
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L9)

#### `InvokeChatOptions` {#symbol-invokechatoptions}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L16)

#### `InvokeChatResult` {#symbol-invokechatresult}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L25)

#### `LlmInvoker` {#symbol-llminvoker}
- Type: class
- Source: [source](../../../../../../packages/extension/src/services/llmInvoker.ts#L30)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`configService.LinkDiagnosticsSettings`](../settings/configService.ts.mdmd.md#symbol-linkdiagnosticssettings) (type-only)
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../commands/analyzeWithAI.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
