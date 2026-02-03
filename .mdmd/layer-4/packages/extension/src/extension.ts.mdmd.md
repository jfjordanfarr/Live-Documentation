# packages/extension/src/extension.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/extension.ts
- Live Doc ID: LD-implementation-packages-extension-src-extension-ts
- Generated At: 2026-02-03T21:55:35.349Z

## Authored
### Purpose
Bootstraps the Live Documentation extension by spinning up the language client, wiring telemetry, and registering every workspace command exposed to end users ([extension activation sweep](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Cleans up the language client lifecycle—feeds handshake, diagnostics clearing, and connection retries—to satisfy the lint/verification gates after the 2025-10-22 rebuild incident ([lint recovery log](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L4320-L4380)).
- Registers command handlers (acknowledge diagnostics, symbol neighbors, override links, latency summary, etc.) as they landed so the activation surface mirrors the server feature set ([command rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Orchestrates onboarding prompts, file watchers, and diagnostics views that coordinate with the language server, which is why integration suites always touch this module during activation ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.349Z","inputHash":"a175154f3c09e171"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `activate` {#symbol-activate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L46)
- Parameters: `context`: `vscode.ExtensionContext`

#### `deactivate` {#symbol-deactivate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L285)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`acknowledgeDiagnostic.registerAcknowledgementWorkflow`](./commands/acknowledgeDiagnostic.ts.mdmd.md#symbol-registeracknowledgementworkflow)
- [`analyzeWithAI.registerAnalyzeWithAICommand`](./commands/analyzeWithAI.ts.mdmd.md#symbol-registeranalyzewithaicommand)
- [`exportDiagnostics.registerExportDiagnosticsCommand`](./commands/exportDiagnostics.ts.mdmd.md#symbol-registerexportdiagnosticscommand)
- [`latencySummary.registerLatencyTelemetryCommands`](./commands/latencySummary.ts.mdmd.md#symbol-registerlatencytelemetrycommands)
- [`overrideLink.registerOverrideLinkCommand`](./commands/overrideLink.ts.mdmd.md#symbol-registeroverridelinkcommand)
- [`dependencyQuickPick.registerDependencyQuickPick`](./diagnostics/dependencyQuickPick.ts.mdmd.md#symbol-registerdependencyquickpick)
- [`docDiagnosticProvider.registerDocDiagnosticProvider`](./diagnostics/docDiagnosticProvider.ts.mdmd.md#symbol-registerdocdiagnosticprovider)
- [`providerGate.ensureProviderSelection`](./onboarding/providerGate.ts.mdmd.md#symbol-ensureproviderselection)
- [`rebindPrompt.showRebindPrompt`](./prompts/rebindPrompt.ts.mdmd.md#symbol-showrebindprompt)
- [`llmInvoker.LlmInvocationError`](./services/llmInvoker.ts.mdmd.md#symbol-llminvocationerror)
- [`LlmInvoker`](./services/llmInvoker.ts.mdmd.md#symbol-llminvoker)
- [`localOllamaBridge.invokeLocalOllamaBridge`](./services/localOllamaBridge.ts.mdmd.md#symbol-invokelocalollamabridge)
- [`symbolBridge.registerSymbolBridge`](./services/symbolBridge.ts.mdmd.md#symbol-registersymbolbridge)
- [`ConfigService`](./settings/configService.ts.mdmd.md#symbol-configservice)
- [`diagnosticsTree.registerDiagnosticsTreeView`](./views/diagnosticsTree.ts.mdmd.md#symbol-registerdiagnosticstreeview)
- [`fileMaintenance.registerFileMaintenanceWatcher`](./watchers/fileMaintenance.ts.mdmd.md#symbol-registerfilemaintenancewatcher)
- [`diagnostics.FEEDS_READY_REQUEST`](../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-feeds_ready_request)
- [`diagnostics.FeedsReadyResult`](../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-feedsreadyresult)
- [`diagnostics.RESET_DIAGNOSTIC_STATE_NOTIFICATION`](../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-reset_diagnostic_state_notification)
- [`llm.INVOKE_LLM_REQUEST`](../../shared/src/contracts/llm.ts.mdmd.md#symbol-invoke_llm_request)
- [`llm.InvokeLlmRequest`](../../shared/src/contracts/llm.ts.mdmd.md#symbol-invokellmrequest)
- [`llm.InvokeLlmResult`](../../shared/src/contracts/llm.ts.mdmd.md#symbol-invokellmresult)
- [`maintenance.RebindRequiredPayload`](../../shared/src/contracts/maintenance.ts.mdmd.md#symbol-rebindrequiredpayload)
- `path`
- `process` - `process`
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`, `LanguageClientOptions`, `ServerOptions`, `TransportKind`
<!-- LIVE-DOC:END Dependencies -->
