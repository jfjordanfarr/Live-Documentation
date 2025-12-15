# packages/server/src/main.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/main.ts
- Live Doc ID: LD-implementation-packages-server-src-main-ts
- Generated At: 2025-12-15T00:38:06.627Z

## Authored
### Purpose
Hosts the language server entrypoint, wiring the LSP connection, runtime services, and diagnostics pipelines that the extension relies on for Live Documentation guidance ([server bootstrap commits](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Spins up the GraphStore, drift history tracker, acknowledgement service, and change processor so diagnostics remain stateful across sessions ([drift history rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Registers dependency inspection, symbol neighbors, override, and latency routes exposed to the extension once those commands shipped ([symbol neighbor integration](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Keeps telemetry and ingestion services alive during integration runs, which is why the benchmark and US suites exercise this file whenever the language server boots ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.627Z","inputHash":"0c229df0aa6a1b97"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
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
- [`index.ACKNOWLEDGE_DIAGNOSTIC_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-acknowledge_diagnostic_request)
- [`index.AcknowledgeDiagnosticParams`](../../shared/src/index.ts.mdmd.md#symbol-acknowledgediagnosticparams)
- [`index.AcknowledgeDiagnosticResult`](../../shared/src/index.ts.mdmd.md#symbol-acknowledgediagnosticresult)
- [`index.DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION`](../../shared/src/index.ts.mdmd.md#symbol-diagnostic_acknowledged_notification)
- [`index.DiagnosticAcknowledgedPayload`](../../shared/src/index.ts.mdmd.md#symbol-diagnosticacknowledgedpayload)
- [`index.FEEDS_READY_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-feeds_ready_request)
- [`index.FeedsReadyResult`](../../shared/src/index.ts.mdmd.md#symbol-feedsreadyresult)
- [`index.GraphStore`](../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.INSPECT_DEPENDENCIES_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-inspect_dependencies_request)
- [`index.INSPECT_SYMBOL_NEIGHBORS_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-inspect_symbol_neighbors_request)
- [`index.InspectDependenciesParams`](../../shared/src/index.ts.mdmd.md#symbol-inspectdependenciesparams)
- [`index.InspectDependenciesResult`](../../shared/src/index.ts.mdmd.md#symbol-inspectdependenciesresult)
- [`index.InspectSymbolNeighborsParams`](../../shared/src/index.ts.mdmd.md#symbol-inspectsymbolneighborsparams)
- [`index.InspectSymbolNeighborsResult`](../../shared/src/index.ts.mdmd.md#symbol-inspectsymbolneighborsresult)
- [`index.LATENCY_SUMMARY_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-latency_summary_request)
- [`index.LIST_OUTSTANDING_DIAGNOSTICS_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-list_outstanding_diagnostics_request)
- [`index.LatencySummaryRequest`](../../shared/src/index.ts.mdmd.md#symbol-latencysummaryrequest)
- [`index.LatencySummaryResponse`](../../shared/src/index.ts.mdmd.md#symbol-latencysummaryresponse)
- [`index.LinkInferenceOrchestrator`](../../shared/src/index.ts.mdmd.md#symbol-linkinferenceorchestrator)
- [`index.ListOutstandingDiagnosticsResult`](../../shared/src/index.ts.mdmd.md#symbol-listoutstandingdiagnosticsresult)
- [`index.OVERRIDE_LINK_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-override_link_request)
- [`index.OverrideLinkRequest`](../../shared/src/index.ts.mdmd.md#symbol-overridelinkrequest)
- [`index.OverrideLinkResponse`](../../shared/src/index.ts.mdmd.md#symbol-overridelinkresponse)
- [`index.RESET_DIAGNOSTIC_STATE_NOTIFICATION`](../../shared/src/index.ts.mdmd.md#symbol-reset_diagnostic_state_notification)
- [`index.SET_DIAGNOSTIC_ASSESSMENT_REQUEST`](../../shared/src/index.ts.mdmd.md#symbol-set_diagnostic_assessment_request)
- [`index.SetDiagnosticAssessmentParams`](../../shared/src/index.ts.mdmd.md#symbol-setdiagnosticassessmentparams)
- [`index.SetDiagnosticAssessmentResult`](../../shared/src/index.ts.mdmd.md#symbol-setdiagnosticassessmentresult)
- [`index.createRelationshipRuleProvider`](../../shared/src/index.ts.mdmd.md#symbol-createrelationshipruleprovider)
- `vscode-languageserver-textdocument` - `TextDocument`
- `vscode-languageserver/node` - `Connection`, `DidChangeConfigurationNotification`, `DidChangeConfigurationParams`, `DocumentDiagnosticParams`, `DocumentDiagnosticRequest`, `InitializeParams`, `InitializeResult`, `ProposedFeatures`, `TextDocumentChangeEvent`, `TextDocumentSyncKind`, `TextDocuments`, `TextDocumentsConfiguration`, `createConnection`
<!-- LIVE-DOC:END Dependencies -->
