# packages/extension/src/extension.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/extension.ts
- Live Doc ID: LD-implementation-packages-extension-src-extension-ts
- Generated At: 2025-11-24T15:19:58.328Z

## Authored
### Purpose
Bootstraps the Live Documentation extension by spinning up the language client, wiring telemetry, and registering every workspace command exposed to end users ([extension activation sweep](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Cleans up the language client lifecycle—feeds handshake, diagnostics clearing, and connection retries—to satisfy the lint/verification gates after the 2025-10-22 rebuild incident ([lint recovery log](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L4320-L4380)).
- Registers command handlers (acknowledge diagnostics, symbol neighbors, override links, latency summary, etc.) as they landed so the activation surface mirrors the server feature set ([command rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Orchestrates onboarding prompts, file watchers, and diagnostics views that coordinate with the language server, which is why integration suites always touch this module during activation ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.328Z","inputHash":"e830163ec531a2cd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `activate` {#symbol-activate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L45)

#### `deactivate` {#symbol-deactivate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L285)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `FEEDS_READY_REQUEST`, `FeedsReadyResult`, `INVOKE_LLM_REQUEST`, `InvokeLlmRequest`, `InvokeLlmResult`, `RESET_DIAGNOSTIC_STATE_NOTIFICATION`, `RebindRequiredPayload`
- [`acknowledgeDiagnostic.registerAcknowledgementWorkflow`](./commands/acknowledgeDiagnostic.ts.mdmd.md#symbol-registeracknowledgementworkflow)
- [`analyzeWithAI.registerAnalyzeWithAICommand`](./commands/analyzeWithAI.ts.mdmd.md#symbol-registeranalyzewithaicommand)
- [`exportDiagnostics.registerExportDiagnosticsCommand`](./commands/exportDiagnostics.ts.mdmd.md#symbol-registerexportdiagnosticscommand)
- [`inspectSymbolNeighbors.registerInspectSymbolNeighborsCommand`](./commands/inspectSymbolNeighbors.ts.mdmd.md#symbol-registerinspectsymbolneighborscommand)
- [`latencySummary.registerLatencyTelemetryCommands`](./commands/latencySummary.ts.mdmd.md#symbol-registerlatencytelemetrycommands)
- [`overrideLink.registerOverrideLinkCommand`](./commands/overrideLink.ts.mdmd.md#symbol-registeroverridelinkcommand)
- [`dependencyQuickPick.registerDependencyQuickPick`](./diagnostics/dependencyQuickPick.ts.mdmd.md#symbol-registerdependencyquickpick)
- [`docDiagnosticProvider.registerDocDiagnosticProvider`](./diagnostics/docDiagnosticProvider.ts.mdmd.md#symbol-registerdocdiagnosticprovider)
- [`providerGate.ensureProviderSelection`](./onboarding/providerGate.ts.mdmd.md#symbol-ensureproviderselection)
- [`rebindPrompt.showRebindPrompt`](./prompts/rebindPrompt.ts.mdmd.md#symbol-showrebindprompt)
- [`llmInvoker.LlmInvocationError`](./services/llmInvoker.ts.mdmd.md#symbol-llminvocationerror)
- [`llmInvoker.LlmInvoker`](./services/llmInvoker.ts.mdmd.md#symbol-llminvoker)
- [`localOllamaBridge.invokeLocalOllamaBridge`](./services/localOllamaBridge.ts.mdmd.md#symbol-invokelocalollamabridge)
- [`symbolBridge.registerSymbolBridge`](./services/symbolBridge.ts.mdmd.md#symbol-registersymbolbridge)
- [`configService.ConfigService`](./settings/configService.ts.mdmd.md#symbol-configservice)
- [`diagnosticsTree.registerDiagnosticsTreeView`](./views/diagnosticsTree.ts.mdmd.md#symbol-registerdiagnosticstreeview)
- [`fileMaintenance.registerFileMaintenanceWatcher`](./watchers/fileMaintenance.ts.mdmd.md#symbol-registerfilemaintenancewatcher)
- `path` - `path`
- `process` - `process`
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`, `LanguageClientOptions`, `ServerOptions`, `TransportKind`
<!-- LIVE-DOC:END Dependencies -->
