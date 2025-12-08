# packages/shared/src/rules/relationshipRuleProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleProvider.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleprovider-ts
- Generated At: 2025-12-07T21:41:19.492Z

## Authored
### Purpose
Loads relationship-rule configs, compiles them, and exposes a workspace link provider so relationship evidence flows into diagnostics and knowledge ingestion.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

### Notes
- Returns structured warnings and contributions consumed by the language server’s graph builders and symbol-correctness checks introduced alongside the profile compiler.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.492Z","inputHash":"113da85c9def0953"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RelationshipRuleProviderLogger` {#symbol-relationshipruleproviderlogger}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L5)

#### `RelationshipRuleProviderOptions` {#symbol-relationshipruleprovideroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L10)

#### `createRelationshipRuleProvider` {#symbol-createrelationshipruleprovider}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L22)
- Returns: [`WorkspaceLinkProvider`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- Parameters: `options`: [`RelationshipRuleProviderOptions`](#symbol-relationshipruleprovideroptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`linkInference.WorkspaceLinkContribution`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkcontribution) (type-only)
- [`linkInference.WorkspaceLinkProvider`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider) (type-only)
- [`relationshipRuleEngine.compileRelationshipRules`](./relationshipRuleEngine.ts.mdmd.md#symbol-compilerelationshiprules)
- [`relationshipRuleEngine.generateRelationshipEvidences`](./relationshipRuleEngine.ts.mdmd.md#symbol-generaterelationshipevidences)
- [`relationshipRuleEngine.loadRelationshipRuleConfig`](./relationshipRuleEngine.ts.mdmd.md#symbol-loadrelationshipruleconfig)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [inspectSymbolNeighbors.test.ts](../../../extension/src/commands/inspectSymbolNeighbors.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](./relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
