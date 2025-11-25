# packages/server/src/main.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/main.ts
- Live Doc ID: LD-implementation-packages-server-src-main-ts
- Generated At: 2025-11-24T15:19:58.917Z

## Authored
### Purpose
Hosts the language server entrypoint, wiring the LSP connection, runtime services, and diagnostics pipelines that the extension relies on for Live Documentation guidance ([server bootstrap commits](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Spins up the GraphStore, drift history tracker, acknowledgement service, and change processor so diagnostics remain stateful across sessions ([drift history rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Registers dependency inspection, symbol neighbors, override, and latency routes exposed to the extension once those commands shipped ([symbol neighbor integration](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Keeps telemetry and ingestion services alive during integration runs, which is why the benchmark and US suites exercise this file whenever the language server boots ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.917Z","inputHash":"5fc1e88d6eb8826d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ACKNOWLEDGE_DIAGNOSTIC_REQUEST`, `AcknowledgeDiagnosticParams`, `AcknowledgeDiagnosticResult`, `DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION`, `DiagnosticAcknowledgedPayload`, `FEEDS_READY_REQUEST`, `FeedsReadyResult`, `GraphStore`, `INSPECT_DEPENDENCIES_REQUEST`, `INSPECT_SYMBOL_NEIGHBORS_REQUEST`, `InspectDependenciesParams`, `InspectDependenciesResult`, `InspectSymbolNeighborsParams`, `InspectSymbolNeighborsResult`, `LATENCY_SUMMARY_REQUEST`, `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST`, `LatencySummaryRequest`, `LatencySummaryResponse`, `LinkInferenceOrchestrator`, `ListOutstandingDiagnosticsResult`, `OVERRIDE_LINK_REQUEST`, `OverrideLinkRequest`, `OverrideLinkResponse`, `RESET_DIAGNOSTIC_STATE_NOTIFICATION`, `SET_DIAGNOSTIC_ASSESSMENT_REQUEST`, `SetDiagnosticAssessmentParams`, `SetDiagnosticAssessmentResult`, `createRelationshipRuleProvider`
- `node:path` - `path`
- [`changeQueue.ChangeQueue`](./features/changeEvents/changeQueue.ts.mdmd.md#symbol-changequeue)
- [`changeQueue.QueuedChange`](./features/changeEvents/changeQueue.ts.mdmd.md#symbol-queuedchange)
- [`inspectDependencies.inspectDependencies`](./features/dependencies/inspectDependencies.ts.mdmd.md#symbol-inspectdependencies)
- [`symbolNeighbors.inspectSymbolNeighbors`](./features/dependencies/symbolNeighbors.ts.mdmd.md#symbol-inspectsymbolneighbors)
- [`acknowledgementService.AcknowledgementService`](./features/diagnostics/acknowledgementService.ts.mdmd.md#symbol-acknowledgementservice)
- [`diagnosticPublisher.DiagnosticPublisher`](./features/diagnostics/diagnosticPublisher.ts.mdmd.md#symbol-diagnosticpublisher)
- [`hysteresisController.HysteresisController`](./features/diagnostics/hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller)
- [`listOutstandingDiagnostics.buildOutstandingDiagnosticsResult`](./features/diagnostics/listOutstandingDiagnostics.ts.mdmd.md#symbol-buildoutstandingdiagnosticsresult)
- [`llmIngestionOrchestrator.LlmIngestionOrchestrator`](./features/knowledge/llmIngestionOrchestrator.ts.mdmd.md#symbol-llmingestionorchestrator)
- [`staticFeedWorkspaceProvider.createStaticFeedWorkspaceProvider`](./features/knowledge/staticFeedWorkspaceProvider.ts.mdmd.md#symbol-createstaticfeedworkspaceprovider)
- [`symbolBridgeProvider.createSymbolBridgeProvider`](./features/knowledge/symbolBridgeProvider.ts.mdmd.md#symbol-createsymbolbridgeprovider)
- [`workspaceIndexProvider.createWorkspaceIndexProvider`](./features/knowledge/workspaceIndexProvider.ts.mdmd.md#symbol-createworkspaceindexprovider)
- [`removeOrphans.handleArtifactDeleted`](./features/maintenance/removeOrphans.ts.mdmd.md#symbol-handleartifactdeleted)
- [`removeOrphans.handleArtifactRenamed`](./features/maintenance/removeOrphans.ts.mdmd.md#symbol-handleartifactrenamed)
- [`overrideLink.applyOverrideLink`](./features/overrides/overrideLink.ts.mdmd.md#symbol-applyoverridelink)
- [`providerGuard.ExtensionSettings`](./features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)
- [`providerGuard.ProviderGuard`](./features/settings/providerGuard.ts.mdmd.md#symbol-providerguard)
- [`settingsBridge.DEFAULT_RUNTIME_SETTINGS`](./features/settings/settingsBridge.ts.mdmd.md#symbol-default_runtime_settings)
- [`settingsBridge.RuntimeSettings`](./features/settings/settingsBridge.ts.mdmd.md#symbol-runtimesettings)
- [`settingsBridge.deriveRuntimeSettings`](./features/settings/settingsBridge.ts.mdmd.md#symbol-deriveruntimesettings)
- [`artifactWatcher.ArtifactWatcher`](./features/watchers/artifactWatcher.ts.mdmd.md#symbol-artifactwatcher)
- [`changeProcessor.createChangeProcessor`](./runtime/changeProcessor.ts.mdmd.md#symbol-createchangeprocessor)
- [`environment.ensureDirectory`](./runtime/environment.ts.mdmd.md#symbol-ensuredirectory)
- [`environment.resolveDatabasePath`](./runtime/environment.ts.mdmd.md#symbol-resolvedatabasepath)
- [`environment.resolveWorkspaceRoot`](./runtime/environment.ts.mdmd.md#symbol-resolveworkspaceroot)
- [`knowledgeFeeds.KnowledgeFeedController`](./runtime/knowledgeFeeds.ts.mdmd.md#symbol-knowledgefeedcontroller)
- [`llmIngestion.LlmIngestionManager`](./runtime/llmIngestion.ts.mdmd.md#symbol-llmingestionmanager)
- [`llmIngestion.createDefaultRelationshipExtractor`](./runtime/llmIngestion.ts.mdmd.md#symbol-createdefaultrelationshipextractor)
- [`settings.extractExtensionSettings`](./runtime/settings.ts.mdmd.md#symbol-extractextensionsettings)
- [`settings.extractTestModeOverrides`](./runtime/settings.ts.mdmd.md#symbol-extracttestmodeoverrides)
- [`settings.mergeExtensionSettings`](./runtime/settings.ts.mdmd.md#symbol-mergeextensionsettings)
- [`driftHistoryStore.DriftHistoryStore`](./telemetry/driftHistoryStore.ts.mdmd.md#symbol-drifthistorystore)
- [`latencyTracker.LatencyTracker`](./telemetry/latencyTracker.ts.mdmd.md#symbol-latencytracker)
- `vscode-languageserver-textdocument` - `TextDocument`
- `vscode-languageserver/node` - `Connection`, `DidChangeConfigurationNotification`, `DidChangeConfigurationParams`, `DocumentDiagnosticParams`, `DocumentDiagnosticRequest`, `InitializeParams`, `InitializeResult`, `ProposedFeatures`, `TextDocumentChangeEvent`, `TextDocumentSyncKind`, `TextDocuments`, `TextDocumentsConfiguration`, `createConnection`
<!-- LIVE-DOC:END Dependencies -->
