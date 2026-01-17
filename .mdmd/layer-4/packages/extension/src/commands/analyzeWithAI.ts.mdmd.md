# packages/extension/src/commands/analyzeWithAI.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/analyzeWithAI.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-analyzewithai-ts
- Generated At: 2026-01-17T18:11:29.185Z

## Authored
### Purpose
Registers the `linkDiagnostics.analyzeWithAI` command so reviewers can run an LLM over outstanding diagnostics, capture JSON summaries, and persist them back to the server - the core T047 deliverable recorded in Turn 13 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-26.SUMMARIZED.md#turn-13-analyze-with-ai-command-lands-lines-1501-2000).

### Notes
- The Oct 26 change list details the quick-pick selection, prompt hashing, and assessment persistence that make this command observable and repeatable; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1740-L1795).
- Spec tracking on Oct 28 confirmed T047 was fully implemented and unit-tested even though tasks.md still needed its checkbox flipped, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L1390-L1475](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L1390-L1475); keep this command aligned with that spec entry.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.185Z","inputHash":"096b0b5f450c0652"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerAnalyzeWithAICommand` {#symbol-registeranalyzewithaicommand}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/analyzeWithAI.ts#L31)
- Returns: `vscode.Disposable`
- Parameters: `options`: `AnalyzeWithAIOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- [`llmInvoker.InvokeChatResult`](../services/llmInvoker.ts.mdmd.md#symbol-invokechatresult)
- [`llmInvoker.LlmInvocationError`](../services/llmInvoker.ts.mdmd.md#symbol-llminvocationerror)
- [`LlmInvoker`](../services/llmInvoker.ts.mdmd.md#symbol-llminvoker)
- [`configService.LinkDiagnosticsSettings`](../settings/configService.ts.mdmd.md#symbol-linkdiagnosticssettings) (type-only)
- [`diagnostics.LIST_OUTSTANDING_DIAGNOSTICS_REQUEST`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-list_outstanding_diagnostics_request)
- [`diagnostics.ListOutstandingDiagnosticsResult`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-listoutstandingdiagnosticsresult)
- [`diagnostics.OutstandingDiagnosticSummary`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-outstandingdiagnosticsummary)
- [`diagnostics.SET_DIAGNOSTIC_ASSESSMENT_REQUEST`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-set_diagnostic_assessment_request)
- [`diagnostics.SetDiagnosticAssessmentParams`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-setdiagnosticassessmentparams)
- [`diagnostics.SetDiagnosticAssessmentResult`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-setdiagnosticassessmentresult)
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](./analyzeWithAI.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
