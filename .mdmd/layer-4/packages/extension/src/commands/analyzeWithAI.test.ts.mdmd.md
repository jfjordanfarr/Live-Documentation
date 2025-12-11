# packages/extension/src/commands/analyzeWithAI.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/commands/analyzeWithAI.test.ts
- Live Doc ID: LD-test-packages-extension-src-commands-analyzewithai-test-ts
- Generated At: 2025-12-11T02:37:59.702Z

## Authored
### Purpose
Validates the Analyze-with-AI command’s registration, disabled-provider guard, and happy-path persistence so the Oct 26 feature ship stays covered, matching Turn 13 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000).

### Notes
- Exercised the VS Code mock harness to cover disabled-provider messaging, quick-pick selection, and assessment upload, as summarized in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795).
- Coverage reports on Oct 28 kept citing this suite when verifying T047 completion, so maintain these tests as the first line of defense before leaning on integration runs; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L1390-L1475](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L1390-L1475).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:37:59.702Z","inputHash":"501af647914b6d9a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`llmInvoker.InvokeChatResult`](../services/llmInvoker.ts.mdmd.md#symbol-invokechatresult) (type-only)
- [`llmInvoker.LlmInvoker`](../services/llmInvoker.ts.mdmd.md#symbol-llminvoker) (type-only)
- [`configService.LinkDiagnosticsSettings`](../settings/configService.ts.mdmd.md#symbol-linkdiagnosticssettings) (type-only)
- [`vscodeMock.SharedVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-sharedvscodemock)
- [`vscodeMock.createVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-createvscodemock)
- `vitest` - `afterAll`, `beforeAll`, `beforeEach`, `describe`, `expect`, `it`, `vi`
- `vscode-languageclient/node` - `LanguageClient` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/commands: [analyzeWithAI.ts](./analyzeWithAI.ts.mdmd.md)
- packages/extension/src/services: [llmInvoker.ts](../services/llmInvoker.ts.mdmd.md)
- packages/extension/src/settings: [configService.ts](../settings/configService.ts.mdmd.md)
- packages/extension/src/testUtils: [vscodeMock.ts](../testUtils/vscodeMock.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
