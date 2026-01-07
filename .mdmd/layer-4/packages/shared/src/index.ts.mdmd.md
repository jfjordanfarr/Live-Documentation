# packages/shared/src/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-index-ts
- Generated At: 2026-01-07T22:04:53.912Z

## Authored
### Purpose
Provides the single `@live-documentation/shared` entrypoint that re-exports inference, telemetry, and tooling surfaces so extension, server, and CLI code consume a consistent API ([link inference orchestrator rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-11-build-link-inference-orchestrator-lines-515-657)).

### Notes
- Carries new Live Documentation configuration exports introduced during the Stage 0 adoption push, letting downstream commands honour the configurable base layer without bespoke wiring ([Stage 0 configuration pass](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T22:04:53.912Z","inputHash":"c1bf0c8e5f4f3312"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RelationshipExtractor` {#symbol-relationshipextractor}
- Type: unknown
- Source: [source](../../../../../packages/shared/src/index.ts#L29)

#### `RelationshipExtractorError` {#symbol-relationshipextractorerror}
- Type: unknown
- Source: [source](../../../../../packages/shared/src/index.ts#L30)

#### `RelationshipExtractorLogger` {#symbol-relationshipextractorlogger}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L31)

#### `RelationshipExtractionBatch` {#symbol-relationshipextractionbatch}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L32)

#### `RelationshipExtractionPrompt` {#symbol-relationshipextractionprompt}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L33)

#### `RelationshipExtractionRequest` {#symbol-relationshipextractionrequest}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L34)

#### `RawRelationshipCandidate` {#symbol-rawrelationshipcandidate}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L35)

#### `ModelInvocationRequest` {#symbol-modelinvocationrequest}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L36)

#### `ModelInvocationResult` {#symbol-modelinvocationresult}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L37)

#### `ModelInvoker` {#symbol-modelinvoker}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L38)

#### `ModelUsage` {#symbol-modelusage}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L39)

#### `calibrateConfidence` {#symbol-calibrateconfidence}
- Type: unknown
- Source: [source](../../../../../packages/shared/src/index.ts#L43)

#### `CalibratedRelationship` {#symbol-calibratedrelationship}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L44)

#### `LlmConfidenceTier` {#symbol-llmconfidencetier}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L45)

#### `CalibrationContext` {#symbol-calibrationcontext}
- Type: type (type-only)
- Source: [source](../../../../../packages/shared/src/index.ts#L46)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md) (re-export)
- [`dependencies`](./contracts/dependencies.ts.mdmd.md) (re-export)
- [`diagnostics`](./contracts/diagnostics.ts.mdmd.md) (re-export)
- [`llm`](./contracts/llm.ts.mdmd.md) (re-export)
- [`lsif`](./contracts/lsif.ts.mdmd.md) (re-export)
- [`maintenance`](./contracts/maintenance.ts.mdmd.md) (re-export)
- [`overrides`](./contracts/overrides.ts.mdmd.md) (re-export)
- [`scip`](./contracts/scip.ts.mdmd.md) (re-export)
- [`symbols`](./contracts/symbols.ts.mdmd.md) (re-export)
- [`telemetry`](./contracts/telemetry.ts.mdmd.md) (re-export)
- [`graphStore`](./db/graphStore.ts.mdmd.md) (re-export)
- [`artifacts`](./domain/artifacts.ts.mdmd.md) (re-export)
- [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md) (re-export)
- [`linkInference`](./inference/linkInference.ts.mdmd.md) (re-export)
- [`confidenceCalibrator.CalibratedRelationship`](./inference/llm/confidenceCalibrator.ts.mdmd.md#symbol-calibratedrelationship) (re-export)
- [`confidenceCalibrator.CalibrationContext`](./inference/llm/confidenceCalibrator.ts.mdmd.md#symbol-calibrationcontext) (re-export)
- [`confidenceCalibrator.LlmConfidenceTier`](./inference/llm/confidenceCalibrator.ts.mdmd.md#symbol-confidencetier) (re-export)
- [`confidenceCalibrator.calibrateConfidence`](./inference/llm/confidenceCalibrator.ts.mdmd.md#symbol-calibrateconfidence) (re-export)
- [`relationshipExtractor.ModelInvocationRequest`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-modelinvocationrequest) (re-export)
- [`relationshipExtractor.ModelInvocationResult`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-modelinvocationresult) (re-export)
- [`relationshipExtractor.ModelInvoker`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-modelinvoker) (re-export)
- [`relationshipExtractor.ModelUsage`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-modelusage) (re-export)
- [`relationshipExtractor.RawRelationshipCandidate`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-rawrelationshipcandidate) (re-export)
- [`relationshipExtractor.RelationshipExtractionBatch`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractionbatch) (re-export)
- [`relationshipExtractor.RelationshipExtractionPrompt`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractionprompt) (re-export)
- [`relationshipExtractor.RelationshipExtractionRequest`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractionrequest) (re-export)
- [`relationshipExtractor.RelationshipExtractor`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractor) (re-export)
- [`relationshipExtractor.RelationshipExtractorError`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractorerror) (re-export)
- [`relationshipExtractor.RelationshipExtractorLogger`](./inference/llm/relationshipExtractor.ts.mdmd.md#symbol-relationshipextractorlogger) (re-export)
- [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md) (re-export)
- [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md) (re-export)
- [`parse`](./live-docs/parse.ts.mdmd.md) (re-export)
- [`testReport`](./reporting/testReport.ts.mdmd.md) (re-export)
- [`relationshipResolvers`](./rules/relationshipResolvers.ts.mdmd.md) (re-export)
- [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md) (re-export)
- [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md) (re-export)
- [`relationshipRuleProvider`](./rules/relationshipRuleProvider.ts.mdmd.md) (re-export)
- [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md) (re-export)
- [`symbolCorrectnessProfiles`](./rules/symbolCorrectnessProfiles.ts.mdmd.md) (re-export)
- [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md) (re-export)
- [`assetPaths`](./tooling/assetPaths.ts.mdmd.md) (re-export)
- [`markdownLinks`](./tooling/markdownLinks.ts.mdmd.md) (re-export)
- [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md) (re-export)
- [`ollamaEndpoint`](./tooling/ollamaEndpoint.ts.mdmd.md) (re-export)
- [`ollamaMock`](./tooling/ollamaMock.ts.mdmd.md) (re-export)
- [`pathUtils`](./tooling/pathUtils.ts.mdmd.md) (re-export)
- [`safeFetch`](./tooling/safeFetch.ts.mdmd.md) (re-export)
- [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md) (re-export)
- [`normalizeFileUri`](./uri/normalizeFileUri.ts.mdmd.md) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

<!-- LIVE-DOC:BEGIN Re-Exported Symbol Anchors -->
### Re-Exported Symbol Anchors
#### `AccuracySample` {#symbol-accuracysample}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-accuracysample)

#### `AccuracyTotals` {#symbol-accuracytotals}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-accuracytotals)

#### `ACKNOWLEDGE_DIAGNOSTIC_REQUEST` {#symbol-acknowledge_diagnostic_request}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-acknowledge_diagnostic_request)

#### `AcknowledgeDiagnosticParams` {#symbol-acknowledgediagnosticparams}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-acknowledgediagnosticparams)

#### `AcknowledgeDiagnosticResult` {#symbol-acknowledgediagnosticresult}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-acknowledgediagnosticresult)

#### `AcknowledgeDiagnosticStatus` {#symbol-acknowledgediagnosticstatus}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-acknowledgediagnosticstatus)

#### `AcknowledgementAction` {#symbol-acknowledgementaction}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-acknowledgementaction)

#### `AcknowledgementActionType` {#symbol-acknowledgementactiontype}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-acknowledgementactiontype)

#### `ArtifactLayer` {#symbol-artifactlayer}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-artifactlayer)

#### `ArtifactSeed` {#symbol-artifactseed}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)

#### `AssetAuditOptions` {#symbol-assetauditoptions}
- Re-exported from [`assetPaths`](./tooling/assetPaths.ts.mdmd.md#symbol-assetauditoptions)

#### `AssetReferenceIssue` {#symbol-assetreferenceissue}
- Re-exported from [`assetPaths`](./tooling/assetPaths.ts.mdmd.md#symbol-assetreferenceissue)

#### `AstAccuracyData` {#symbol-astaccuracydata}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-astaccuracydata)

#### `AstAccuracyFixture` {#symbol-astaccuracyfixture}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-astaccuracyfixture)

#### `AstAccuracyTotals` {#symbol-astaccuracytotals}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-astaccuracytotals)

#### `BenchmarkAccuracySummary` {#symbol-benchmarkaccuracysummary}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-benchmarkaccuracysummary)

#### `BenchmarkEnvironment` {#symbol-benchmarkenvironment}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-benchmarkenvironment)

#### `BenchmarkRecord` {#symbol-benchmarkrecord}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-benchmarkrecord)

#### `buildTestReportMarkdown` {#symbol-buildtestreportmarkdown}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-buildtestreportmarkdown)

#### `ChangeEvent` {#symbol-changeevent}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-changeevent)

#### `ChangeEventProvenance` {#symbol-changeeventprovenance}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-changeeventprovenance)

#### `ChangeEventRange` {#symbol-changeeventrange}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-changeeventrange)

#### `ChangeEventType` {#symbol-changeeventtype}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-changeeventtype)

#### `COLLECT_WORKSPACE_SYMBOLS_REQUEST` {#symbol-collect_workspace_symbols_request}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-collect_workspace_symbols_request)

#### `collectIdentifierUsage` {#symbol-collectidentifierusage}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-collectidentifierusage)

#### `CollectWorkspaceSymbolsParams` {#symbol-collectworkspacesymbolsparams}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-collectworkspacesymbolsparams)

#### `CollectWorkspaceSymbolsResult` {#symbol-collectworkspacesymbolsresult}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-collectworkspacesymbolsresult)

#### `CollectWorkspaceSymbolsResultSummary` {#symbol-collectworkspacesymbolsresultsummary}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-collectworkspacesymbolsresultsummary)

#### `CompiledRelationshipRule` {#symbol-compiledrelationshiprule}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprule)

#### `CompiledRelationshipRulePropagation` {#symbol-compiledrelationshiprulepropagation}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulepropagation)

#### `CompiledRelationshipRules` {#symbol-compiledrelationshiprules}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules)

#### `CompiledRelationshipRuleStep` {#symbol-compiledrelationshiprulestep}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulestep)

#### `CompiledSymbolProfile` {#symbol-compiledsymbolprofile}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofile)

#### `CompiledSymbolProfileRequirement` {#symbol-compiledsymbolprofilerequirement}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilerequirement)

#### `CompiledSymbolProfileSource` {#symbol-compiledsymbolprofilesource}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilesource)

#### `CompiledSymbolProfileTarget` {#symbol-compiledsymbolprofiletarget}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofiletarget)

#### `compileRelationshipRules` {#symbol-compilerelationshiprules}
- Re-exported from [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md#symbol-compilerelationshiprules)

#### `compileSymbolProfiles` {#symbol-compilesymbolprofiles}
- Re-exported from [`symbolCorrectnessProfiles`](./rules/symbolCorrectnessProfiles.ts.mdmd.md#symbol-compilesymbolprofiles)

#### `CompileSymbolProfilesResult` {#symbol-compilesymbolprofilesresult}
- Re-exported from [`symbolCorrectnessProfiles`](./rules/symbolCorrectnessProfiles.ts.mdmd.md#symbol-compilesymbolprofilesresult)

#### `createBuiltInResolvers` {#symbol-createbuiltinresolvers}
- Re-exported from [`relationshipResolvers`](./rules/relationshipResolvers.ts.mdmd.md#symbol-createbuiltinresolvers)

#### `createMockOllamaResponse` {#symbol-createmockollamaresponse}
- Re-exported from [`ollamaMock`](./tooling/ollamaMock.ts.mdmd.md#symbol-createmockollamaresponse)

#### `CreateMockOllamaResponseOptions` {#symbol-createmockollamaresponseoptions}
- Re-exported from [`ollamaMock`](./tooling/ollamaMock.ts.mdmd.md#symbol-createmockollamaresponseoptions)

#### `createRelationshipRuleProvider` {#symbol-createrelationshipruleprovider}
- Re-exported from [`relationshipRuleProvider`](./rules/relationshipRuleProvider.ts.mdmd.md#symbol-createrelationshipruleprovider)

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)

#### `DEFAULT_OLLAMA_ENDPOINT` {#symbol-default_ollama_endpoint}
- Re-exported from [`ollamaEndpoint`](./tooling/ollamaEndpoint.ts.mdmd.md#symbol-default_ollama_endpoint)

#### `DependencyGraphEdge` {#symbol-dependencygraphedge}
- Re-exported from [`dependencies`](./contracts/dependencies.ts.mdmd.md#symbol-dependencygraphedge)

#### `DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION` {#symbol-diagnostic_acknowledged_notification}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-diagnostic_acknowledged_notification)

#### `DiagnosticAcknowledgedPayload` {#symbol-diagnosticacknowledgedpayload}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-diagnosticacknowledgedpayload)

#### `DiagnosticArtifactSummary` {#symbol-diagnosticartifactsummary}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-diagnosticartifactsummary)

#### `DiagnosticRecord` {#symbol-diagnosticrecord}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord)

#### `DiagnosticSeverity` {#symbol-diagnosticseverity}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-diagnosticseverity)

#### `DiagnosticStatus` {#symbol-diagnosticstatus}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-diagnosticstatus)

#### `DriftHistoryEntry` {#symbol-drifthistoryentry}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-drifthistoryentry)

#### `DriftHistoryStatus` {#symbol-drifthistorystatus}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-drifthistorystatus)

#### `DriftHistorySummary` {#symbol-drifthistorysummary}
- Re-exported from [`graphStore`](./db/graphStore.ts.mdmd.md#symbol-drifthistorysummary)

#### `evaluateRelationshipCoverage` {#symbol-evaluaterelationshipcoverage}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-evaluaterelationshipcoverage)

#### `EvaluateRelationshipCoverageOptions` {#symbol-evaluaterelationshipcoverageoptions}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-evaluaterelationshipcoverageoptions)

#### `EXPORT_DIAGNOSTICS_REQUEST` {#symbol-export_diagnostics_request}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-export_diagnostics_request)

#### `ExportDiagnosticsResult` {#symbol-exportdiagnosticsresult}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-exportdiagnosticsresult)

#### `ExternalArtifact` {#symbol-externalartifact}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalartifact)

#### `ExternalLink` {#symbol-externallink}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externallink)

#### `ExternalSnapshot` {#symbol-externalsnapshot}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalsnapshot)

#### `ExternalStreamEvent` {#symbol-externalstreamevent}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalstreamevent)

#### `extractLocalImportNames` {#symbol-extractlocalimportnames}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-extractlocalimportnames)

#### `FallbackGraphInput` {#symbol-fallbackgraphinput}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-fallbackgraphinput)

#### `FallbackGraphOptions` {#symbol-fallbackgraphoptions}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-fallbackgraphoptions)

#### `FallbackInferenceResult` {#symbol-fallbackinferenceresult}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-fallbackinferenceresult)

#### `FallbackLLMBridge` {#symbol-fallbackllmbridge}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-fallbackllmbridge)

#### `FEEDS_READY_REQUEST` {#symbol-feeds_ready_request}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-feeds_ready_request)

#### `FeedsReadyResult` {#symbol-feedsreadyresult}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-feedsreadyresult)

#### `findBrokenAssetReferences` {#symbol-findbrokenassetreferences}
- Re-exported from [`assetPaths`](./tooling/assetPaths.ts.mdmd.md#symbol-findbrokenassetreferences)

#### `findBrokenMarkdownLinks` {#symbol-findbrokenmarkdownlinks}
- Re-exported from [`markdownLinks`](./tooling/markdownLinks.ts.mdmd.md#symbol-findbrokenmarkdownlinks)

#### `findSymbolReferenceAnomalies` {#symbol-findsymbolreferenceanomalies}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-findsymbolreferenceanomalies)

#### `formatRelationshipDiagnostics` {#symbol-formatrelationshipdiagnostics}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-formatrelationshipdiagnostics)

#### `generateRelationshipEvidences` {#symbol-generaterelationshipevidences}
- Re-exported from [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md#symbol-generaterelationshipevidences)

#### `GenerateRelationshipEvidencesOptions` {#symbol-generaterelationshipevidencesoptions}
- Re-exported from [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md#symbol-generaterelationshipevidencesoptions)

#### `GraphStore` {#symbol-graphstore}
- Re-exported from [`graphStore`](./db/graphStore.ts.mdmd.md#symbol-graphstore)

#### `GraphStoreOptions` {#symbol-graphstoreoptions}
- Re-exported from [`graphStore`](./db/graphStore.ts.mdmd.md#symbol-graphstoreoptions)

#### `hasRuntimeUsage` {#symbol-hasruntimeusage}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-hasruntimeusage)

#### `hasTypeUsage` {#symbol-hastypeusage}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-hastypeusage)

#### `IdentifierUsage` {#symbol-identifierusage}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-identifierusage)

#### `InferenceAccuracySummary` {#symbol-inferenceaccuracysummary}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracysummary)

#### `InferenceAccuracyTracker` {#symbol-inferenceaccuracytracker}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracytracker)

#### `InferenceAccuracyTrackerOptions` {#symbol-inferenceaccuracytrackeroptions}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracytrackeroptions)

#### `InferenceOutcome` {#symbol-inferenceoutcome}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceoutcome)

#### `InferenceTraceEntry` {#symbol-inferencetraceentry}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)

#### `InferenceTraceOrigin` {#symbol-inferencetraceorigin}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-inferencetraceorigin)

#### `inferFallbackGraph` {#symbol-inferfallbackgraph}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)

#### `INSPECT_DEPENDENCIES_REQUEST` {#symbol-inspect_dependencies_request}
- Re-exported from [`dependencies`](./contracts/dependencies.ts.mdmd.md#symbol-inspect_dependencies_request)

#### `INSPECT_SYMBOL_NEIGHBORS_REQUEST` {#symbol-inspect_symbol_neighbors_request}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-inspect_symbol_neighbors_request)

#### `InspectDependenciesParams` {#symbol-inspectdependenciesparams}
- Re-exported from [`dependencies`](./contracts/dependencies.ts.mdmd.md#symbol-inspectdependenciesparams)

#### `InspectDependenciesResult` {#symbol-inspectdependenciesresult}
- Re-exported from [`dependencies`](./contracts/dependencies.ts.mdmd.md#symbol-inspectdependenciesresult)

#### `InspectDependenciesSummary` {#symbol-inspectdependenciessummary}
- Re-exported from [`dependencies`](./contracts/dependencies.ts.mdmd.md#symbol-inspectdependenciessummary)

#### `InspectSymbolNeighborsParams` {#symbol-inspectsymbolneighborsparams}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-inspectsymbolneighborsparams)

#### `InspectSymbolNeighborsResult` {#symbol-inspectsymbolneighborsresult}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-inspectsymbolneighborsresult)

#### `InspectSymbolNeighborsSummary` {#symbol-inspectsymbolneighborssummary}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-inspectsymbolneighborssummary)

#### `INVOKE_LLM_REQUEST` {#symbol-invoke_llm_request}
- Re-exported from [`llm`](./contracts/llm.ts.mdmd.md#symbol-invoke_llm_request)

#### `InvokeLlmRequest` {#symbol-invokellmrequest}
- Re-exported from [`llm`](./contracts/llm.ts.mdmd.md#symbol-invokellmrequest)

#### `InvokeLlmResult` {#symbol-invokellmresult}
- Re-exported from [`llm`](./contracts/llm.ts.mdmd.md#symbol-invokellmresult)

#### `invokeOllamaChat` {#symbol-invokeollamachat}
- Re-exported from [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md#symbol-invokeollamachat)

#### `isLikelyTypeDefinitionSpecifier` {#symbol-islikelytypedefinitionspecifier}
- Re-exported from [`typeScriptAstUtils`](./language/typeScriptAstUtils.ts.mdmd.md#symbol-islikelytypedefinitionspecifier)

#### `isLocalhostHost` {#symbol-islocalhosthost}
- Re-exported from [`safeFetch`](./tooling/safeFetch.ts.mdmd.md#symbol-islocalhosthost)

#### `KnowledgeArtifact` {#symbol-knowledgeartifact}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)

#### `KnowledgeFeed` {#symbol-knowledgefeed}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-knowledgefeed)

#### `KnowledgeFeedSnapshotSource` {#symbol-knowledgefeedsnapshotsource}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-knowledgefeedsnapshotsource)

#### `KnowledgeFeedStreamSource` {#symbol-knowledgefeedstreamsource}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-knowledgefeedstreamsource)

#### `KnowledgeFeedSummary` {#symbol-knowledgefeedsummary}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-knowledgefeedsummary)

#### `KnowledgeGraphBridge` {#symbol-knowledgegraphbridge}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-knowledgegraphbridge)

#### `KnowledgeSnapshot` {#symbol-knowledgesnapshot}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-knowledgesnapshot)

#### `LATENCY_SUMMARY_REQUEST` {#symbol-latency_summary_request}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latency_summary_request)

#### `LatencyChangeKind` {#symbol-latencychangekind}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latencychangekind)

#### `LatencySample` {#symbol-latencysample}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latencysample)

#### `LatencySummary` {#symbol-latencysummary}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latencysummary)

#### `LatencySummaryRequest` {#symbol-latencysummaryrequest}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latencysummaryrequest)

#### `LatencySummaryResponse` {#symbol-latencysummaryresponse}
- Re-exported from [`telemetry`](./contracts/telemetry.ts.mdmd.md#symbol-latencysummaryresponse)

#### `LinkedArtifactSummary` {#symbol-linkedartifactsummary}
- Re-exported from [`graphStore`](./db/graphStore.ts.mdmd.md#symbol-linkedartifactsummary)

#### `LinkEvidence` {#symbol-linkevidence}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkevidence)

#### `LinkInferenceError` {#symbol-linkinferenceerror}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferenceerror)

#### `LinkInferenceOrchestrator` {#symbol-linkinferenceorchestrator}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferenceorchestrator)

#### `LinkInferenceRunInput` {#symbol-linkinferenceruninput}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferenceruninput)

#### `LinkInferenceRunResult` {#symbol-linkinferencerunresult}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferencerunresult)

#### `LinkInferenceTraceEntry` {#symbol-linkinferencetraceentry}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferencetraceentry)

#### `LinkInferenceTraceOrigin` {#symbol-linkinferencetraceorigin}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-linkinferencetraceorigin)

#### `LinkOverrideReason` {#symbol-linkoverridereason}
- Re-exported from [`overrides`](./contracts/overrides.ts.mdmd.md#symbol-linkoverridereason)

#### `LinkRelationship` {#symbol-linkrelationship}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-linkrelationship)

#### `LinkRelationshipKind` {#symbol-linkrelationshipkind}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)

#### `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST` {#symbol-list_outstanding_diagnostics_request}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-list_outstanding_diagnostics_request)

#### `ListDriftHistoryOptions` {#symbol-listdrifthistoryoptions}
- Re-exported from [`graphStore`](./db/graphStore.ts.mdmd.md#symbol-listdrifthistoryoptions)

#### `ListOutstandingDiagnosticsResult` {#symbol-listoutstandingdiagnosticsresult}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-listoutstandingdiagnosticsresult)

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_base_layer)

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_globs)

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_root)

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)

#### `LiveDocumentationArchetype` {#symbol-livedocumentationarchetype}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)

#### `LiveDocumentationConfig` {#symbol-livedocumentationconfig}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

#### `LiveDocumentationConfigInput` {#symbol-livedocumentationconfiginput}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)

#### `LiveDocumentationEvidenceConfig` {#symbol-livedocumentationevidenceconfig}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationevidenceconfig)

#### `LiveDocumentationEvidenceStrictMode` {#symbol-livedocumentationevidencestrictmode}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationevidencestrictmode)

#### `LiveDocumentationSlugDialect` {#symbol-livedocumentationslugdialect}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationslugdialect)

#### `LlmAssessment` {#symbol-llmassessment}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-llmassessment)

#### `LlmEdgeProvenance` {#symbol-llmedgeprovenance}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-llmedgeprovenance)

#### `LlmModelMetadata` {#symbol-llmmodelmetadata}
- Re-exported from [`artifacts`](./domain/artifacts.ts.mdmd.md#symbol-llmmodelmetadata)

#### `LLMRelationshipRequest` {#symbol-llmrelationshiprequest}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-llmrelationshiprequest)

#### `LLMRelationshipSuggestion` {#symbol-llmrelationshipsuggestion}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-llmrelationshipsuggestion)

#### `loadRelationshipRuleConfig` {#symbol-loadrelationshipruleconfig}
- Re-exported from [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md#symbol-loadrelationshipruleconfig)

#### `loadSymbolCorrectnessProfiles` {#symbol-loadsymbolcorrectnessprofiles}
- Re-exported from [`symbolCorrectnessProfiles`](./rules/symbolCorrectnessProfiles.ts.mdmd.md#symbol-loadsymbolcorrectnessprofiles)

#### `LSIFContainsEdge` {#symbol-lsifcontainsedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifcontainsedge)

#### `LSIFDefinitionEdge` {#symbol-lsifdefinitionedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifdefinitionedge)

#### `LSIFDefinitionResult` {#symbol-lsifdefinitionresult}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifdefinitionresult)

#### `LSIFDocument` {#symbol-lsifdocument}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifdocument)

#### `LSIFEdge` {#symbol-lsifedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifedge)

#### `LSIFEdgeLabel` {#symbol-lsifedgelabel}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifedgelabel)

#### `LSIFElement` {#symbol-lsifelement}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifelement)

#### `LSIFEntry` {#symbol-lsifentry}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifentry)

#### `LSIFItemEdge` {#symbol-lsifitemedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifitemedge)

#### `LSIFMetaData` {#symbol-lsifmetadata}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifmetadata)

#### `LSIFNextEdge` {#symbol-lsifnextedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifnextedge)

#### `LSIFProject` {#symbol-lsifproject}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifproject)

#### `LSIFRange` {#symbol-lsifrange}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifrange)

#### `LSIFReferenceResult` {#symbol-lsifreferenceresult}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifreferenceresult)

#### `LSIFReferencesEdge` {#symbol-lsifreferencesedge}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifreferencesedge)

#### `LSIFResultSet` {#symbol-lsifresultset}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifresultset)

#### `LSIFVertex` {#symbol-lsifvertex}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifvertex)

#### `LSIFVertexLabel` {#symbol-lsifvertexlabel}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-lsifvertexlabel)

#### `MarkdownLinkAuditOptions` {#symbol-markdownlinkauditoptions}
- Re-exported from [`markdownLinks`](./tooling/markdownLinks.ts.mdmd.md#symbol-markdownlinkauditoptions)

#### `MarkdownLinkIssue` {#symbol-markdownlinkissue}
- Re-exported from [`markdownLinks`](./tooling/markdownLinks.ts.mdmd.md#symbol-markdownlinkissue)

#### `MOCK_OLLAMA_MODEL_ID` {#symbol-mock_ollama_model_id}
- Re-exported from [`ollamaMock`](./tooling/ollamaMock.ts.mdmd.md#symbol-mock_ollama_model_id)

#### `MockOllamaResponse` {#symbol-mockollamaresponse}
- Re-exported from [`ollamaMock`](./tooling/ollamaMock.ts.mdmd.md#symbol-mockollamaresponse)

#### `NetworkPolicyViolation` {#symbol-networkpolicyviolation}
- Re-exported from [`safeFetch`](./tooling/safeFetch.ts.mdmd.md#symbol-networkpolicyviolation)

#### `normalizeFileUri` {#symbol-normalizefileuri}
- Re-exported from [`normalizeFileUri`](./uri/normalizeFileUri.ts.mdmd.md#symbol-normalizefileuri)

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Re-exported from [`liveDocumentationConfig`](./config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)

#### `normalizeWorkspacePath` {#symbol-normalizeworkspacepath}
- Re-exported from [`pathUtils`](./tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)

#### `OllamaChatRequest` {#symbol-ollamachatrequest}
- Re-exported from [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md#symbol-ollamachatrequest)

#### `OllamaChatResult` {#symbol-ollamachatresult}
- Re-exported from [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md#symbol-ollamachatresult)

#### `OllamaChatUsage` {#symbol-ollamachatusage}
- Re-exported from [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md#symbol-ollamachatusage)

#### `OllamaInvocationError` {#symbol-ollamainvocationerror}
- Re-exported from [`ollamaClient`](./tooling/ollamaClient.ts.mdmd.md#symbol-ollamainvocationerror)

#### `OutstandingDiagnosticSummary` {#symbol-outstandingdiagnosticsummary}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-outstandingdiagnosticsummary)

#### `OVERRIDE_LINK_REQUEST` {#symbol-override_link_request}
- Re-exported from [`overrides`](./contracts/overrides.ts.mdmd.md#symbol-override_link_request)

#### `OverrideLinkArtifactInput` {#symbol-overridelinkartifactinput}
- Re-exported from [`overrides`](./contracts/overrides.ts.mdmd.md#symbol-overridelinkartifactinput)

#### `OverrideLinkRequest` {#symbol-overridelinkrequest}
- Re-exported from [`overrides`](./contracts/overrides.ts.mdmd.md#symbol-overridelinkrequest)

#### `OverrideLinkResponse` {#symbol-overridelinkresponse}
- Re-exported from [`overrides`](./contracts/overrides.ts.mdmd.md#symbol-overridelinkresponse)

#### `ParsedDependency` {#symbol-parseddependency}
- Re-exported from [`parse`](./live-docs/parse.ts.mdmd.md#symbol-parseddependency)

#### `ParsedLiveDoc` {#symbol-parsedlivedoc}
- Re-exported from [`parse`](./live-docs/parse.ts.mdmd.md#symbol-parsedlivedoc)

#### `ParsedLSIFIndex` {#symbol-parsedlsifindex}
- Re-exported from [`lsif`](./contracts/lsif.ts.mdmd.md#symbol-parsedlsifindex)

#### `ParsedSCIPIndex` {#symbol-parsedscipindex}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-parsedscipindex)

#### `ParsedSymbolDocumentationEntry` {#symbol-parsedsymboldocumentationentry}
- Re-exported from [`parse`](./live-docs/parse.ts.mdmd.md#symbol-parsedsymboldocumentationentry)

#### `ParsedTypeReference` {#symbol-parsedtypereference}
- Re-exported from [`parse`](./live-docs/parse.ts.mdmd.md#symbol-parsedtypereference)

#### `parseLiveDocMarkdown` {#symbol-parselivedocmarkdown}
- Re-exported from [`parse`](./live-docs/parse.ts.mdmd.md#symbol-parselivedocmarkdown)

#### `RebindImpactedArtifact` {#symbol-rebindimpactedartifact}
- Re-exported from [`maintenance`](./contracts/maintenance.ts.mdmd.md#symbol-rebindimpactedartifact)

#### `RebindReason` {#symbol-rebindreason}
- Re-exported from [`maintenance`](./contracts/maintenance.ts.mdmd.md#symbol-rebindreason)

#### `RebindRequiredArtifact` {#symbol-rebindrequiredartifact}
- Re-exported from [`maintenance`](./contracts/maintenance.ts.mdmd.md#symbol-rebindrequiredartifact)

#### `RebindRequiredPayload` {#symbol-rebindrequiredpayload}
- Re-exported from [`maintenance`](./contracts/maintenance.ts.mdmd.md#symbol-rebindrequiredpayload)

#### `RebuildStabilityData` {#symbol-rebuildstabilitydata}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-rebuildstabilitydata)

#### `RecordOutcomeOptions` {#symbol-recordoutcomeoptions}
- Re-exported from [`inferenceAccuracy`](./telemetry/inferenceAccuracy.ts.mdmd.md#symbol-recordoutcomeoptions)

#### `RelationshipCoverageChain` {#symbol-relationshipcoveragechain}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoveragechain)

#### `RelationshipCoverageDiagnostic` {#symbol-relationshipcoveragediagnostic}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoveragediagnostic)

#### `RelationshipCoverageIssue` {#symbol-relationshipcoverageissue}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoverageissue)

#### `RelationshipCoverageIssueKind` {#symbol-relationshipcoverageissuekind}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoverageissuekind)

#### `RelationshipCoverageResult` {#symbol-relationshipcoverageresult}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoverageresult)

#### `RelationshipCoverageRuleResult` {#symbol-relationshipcoverageruleresult}
- Re-exported from [`relationshipRuleAudit`](./rules/relationshipRuleAudit.ts.mdmd.md#symbol-relationshipcoverageruleresult)

#### `RelationshipEvidenceGenerationResult` {#symbol-relationshipevidencegenerationresult}
- Re-exported from [`relationshipRuleEngine`](./rules/relationshipRuleEngine.ts.mdmd.md#symbol-relationshipevidencegenerationresult)

#### `RelationshipHint` {#symbol-relationshiphint}
- Re-exported from [`fallbackInference`](./inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)

#### `RelationshipResolver` {#symbol-relationshipresolver}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolver)

#### `RelationshipResolverOptions` {#symbol-relationshipresolveroptions}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolveroptions)

#### `RelationshipResolverResult` {#symbol-relationshipresolverresult}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolverresult)

#### `RelationshipRuleChain` {#symbol-relationshiprulechain}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulechain)

#### `RelationshipRuleChainStep` {#symbol-relationshiprulechainstep}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulechainstep)

#### `RelationshipRuleConfig` {#symbol-relationshipruleconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfig)

#### `RelationshipRuleConfigLoadResult` {#symbol-relationshipruleconfigloadresult}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfigloadresult)

#### `RelationshipRulePropagationConfig` {#symbol-relationshiprulepropagationconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulepropagationconfig)

#### `RelationshipRuleProviderLogger` {#symbol-relationshipruleproviderlogger}
- Re-exported from [`relationshipRuleProvider`](./rules/relationshipRuleProvider.ts.mdmd.md#symbol-relationshipruleproviderlogger)

#### `RelationshipRuleProviderOptions` {#symbol-relationshipruleprovideroptions}
- Re-exported from [`relationshipRuleProvider`](./rules/relationshipRuleProvider.ts.mdmd.md#symbol-relationshipruleprovideroptions)

#### `RelationshipRulesConfig` {#symbol-relationshiprulesconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)

#### `RelationshipRuleStepConfig` {#symbol-relationshiprulestepconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulestepconfig)

#### `RelationshipRuleWarning` {#symbol-relationshiprulewarning}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning)

#### `ReportSection` {#symbol-reportsection}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-reportsection)

#### `RESET_DIAGNOSTIC_STATE_NOTIFICATION` {#symbol-reset_diagnostic_state_notification}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-reset_diagnostic_state_notification)

#### `resolveOllamaEndpoint` {#symbol-resolveollamaendpoint}
- Re-exported from [`ollamaEndpoint`](./tooling/ollamaEndpoint.ts.mdmd.md#symbol-resolveollamaendpoint)

#### `ResolveOllamaEndpointOptions` {#symbol-resolveollamaendpointoptions}
- Re-exported from [`ollamaEndpoint`](./tooling/ollamaEndpoint.ts.mdmd.md#symbol-resolveollamaendpointoptions)

#### `safeFetch` {#symbol-safefetch}
- Re-exported from [`safeFetch`](./tooling/safeFetch.ts.mdmd.md#symbol-safefetch)

#### `SCIPDiagnostic` {#symbol-scipdiagnostic}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipdiagnostic)

#### `SCIPDocument` {#symbol-scipdocument}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipdocument)

#### `SCIPIndex` {#symbol-scipindex}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipindex)

#### `SCIPMetadata` {#symbol-scipmetadata}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipmetadata)

#### `SCIPOccurrence` {#symbol-scipoccurrence}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipoccurrence)

#### `SCIPRelationship` {#symbol-sciprelationship}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-sciprelationship)

#### `SCIPSignature` {#symbol-scipsignature}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipsignature)

#### `SCIPSymbolInformation` {#symbol-scipsymbolinformation}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipsymbolinformation)

#### `SCIPSymbolKind` {#symbol-scipsymbolkind}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipsymbolkind)

#### `SCIPSymbolRole` {#symbol-scipsymbolrole}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-scipsymbolrole)

#### `SCIPToolInfo` {#symbol-sciptoolinfo}
- Re-exported from [`scip`](./contracts/scip.ts.mdmd.md#symbol-sciptoolinfo)

#### `SET_DIAGNOSTIC_ASSESSMENT_REQUEST` {#symbol-set_diagnostic_assessment_request}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-set_diagnostic_assessment_request)

#### `SetDiagnosticAssessmentParams` {#symbol-setdiagnosticassessmentparams}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-setdiagnosticassessmentparams)

#### `SetDiagnosticAssessmentResult` {#symbol-setdiagnosticassessmentresult}
- Re-exported from [`diagnostics`](./contracts/diagnostics.ts.mdmd.md#symbol-setdiagnosticassessmentresult)

#### `StreamCheckpoint` {#symbol-streamcheckpoint}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-streamcheckpoint)

#### `StreamEventKind` {#symbol-streameventkind}
- Re-exported from [`knowledgeGraphBridge`](./knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-streameventkind)

#### `SymbolAuditOptions` {#symbol-symbolauditoptions}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-symbolauditoptions)

#### `SymbolCorrectnessProfileConfig` {#symbol-symbolcorrectnessprofileconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolcorrectnessprofileconfig)

#### `SymbolIssueKind` {#symbol-symbolissuekind}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-symbolissuekind)

#### `SymbolIssueSeverity` {#symbol-symbolissueseverity}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-symbolissueseverity)

#### `SymbolNeighborGroup` {#symbol-symbolneighborgroup}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-symbolneighborgroup)

#### `SymbolNeighborNode` {#symbol-symbolneighbornode}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-symbolneighbornode)

#### `SymbolNeighborPath` {#symbol-symbolneighborpath}
- Re-exported from [`symbols`](./contracts/symbols.ts.mdmd.md#symbol-symbolneighborpath)

#### `SymbolProfileEnforcementMode` {#symbol-symbolprofileenforcementmode}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileenforcementmode)

#### `SymbolProfileLoadResult` {#symbol-symbolprofileloadresult}
- Re-exported from [`symbolCorrectnessProfiles`](./rules/symbolCorrectnessProfiles.ts.mdmd.md#symbol-symbolprofileloadresult)

#### `SymbolProfileLookup` {#symbol-symbolprofilelookup}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilelookup)

#### `SymbolProfileOverrideConfig` {#symbol-symbolprofileoverrideconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileoverrideconfig)

#### `SymbolProfileRequirementConfig` {#symbol-symbolprofilerequirementconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementconfig)

#### `SymbolProfileRequirementDirection` {#symbol-symbolprofilerequirementdirection}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementdirection)

#### `SymbolProfileSourceConfig` {#symbol-symbolprofilesourceconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilesourceconfig)

#### `SymbolProfileTargetConfig` {#symbol-symbolprofiletargetconfig}
- Re-exported from [`relationshipRuleTypes`](./rules/relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofiletargetconfig)

#### `SymbolReferenceIssue` {#symbol-symbolreferenceissue}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-symbolreferenceissue)

#### `SymbolRuleSetting` {#symbol-symbolrulesetting}
- Re-exported from [`symbolReferences`](./tooling/symbolReferences.ts.mdmd.md#symbol-symbolrulesetting)

#### `TestReportContext` {#symbol-testreportcontext}
- Re-exported from [`testReport`](./reporting/testReport.ts.mdmd.md#symbol-testreportcontext)

#### `toWorkspaceFileUri` {#symbol-toworkspacefileuri}
- Re-exported from [`pathUtils`](./tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)

#### `toWorkspaceRelativePath` {#symbol-toworkspacerelativepath}
- Re-exported from [`pathUtils`](./tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)

#### `validateNetworkPolicy` {#symbol-validatenetworkpolicy}
- Re-exported from [`safeFetch`](./tooling/safeFetch.ts.mdmd.md#symbol-validatenetworkpolicy)

#### `WorkspaceConfigurationLike` {#symbol-workspaceconfigurationlike}
- Re-exported from [`ollamaEndpoint`](./tooling/ollamaEndpoint.ts.mdmd.md#symbol-workspaceconfigurationlike)

#### `WorkspaceLinkContribution` {#symbol-workspacelinkcontribution}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-workspacelinkcontribution)

#### `WorkspaceLinkProvider` {#symbol-workspacelinkprovider}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)

#### `WorkspaceLinkProviderContext` {#symbol-workspacelinkprovidercontext}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovidercontext)

#### `WorkspaceProviderSummary` {#symbol-workspaceprovidersummary}
- Re-exported from [`linkInference`](./inference/linkInference.ts.mdmd.md#symbol-workspaceprovidersummary)
<!-- LIVE-DOC:END Re-Exported Symbol Anchors -->
