# packages/shared/src/rules/relationshipRuleEngine.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleEngine.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleengine-ts
- Generated At: 2025-12-05T15:37:25.631Z

## Authored
### Purpose
Loads, compiles, and executes relationship rules to produce link evidence that seeds diagnostics, Live Docs, and knowledge ingestion pipelines.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Introduced alongside symbol correctness work so graph audits could reason about rule provenance and warn on malformed configs before they reach the provider.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.631Z","inputHash":"b52507ea53a86b21"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadRelationshipRuleConfig` {#symbol-loadrelationshipruleconfig}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L30)
- Returns: [`RelationshipRuleConfigLoadResult`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfigloadresult)

#### `compileRelationshipRules` {#symbol-compilerelationshiprules}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L105)
- Returns: [`CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules)
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)

#### `GenerateRelationshipEvidencesOptions` {#symbol-generaterelationshipevidencesoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L128)

#### `RelationshipEvidenceGenerationResult` {#symbol-relationshipevidencegenerationresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L135)

#### `generateRelationshipEvidences` {#symbol-generaterelationshipevidences}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L140)
- Returns: `RelationshipEvidenceGenerationResult`
- Parameters: `options`: `GenerateRelationshipEvidencesOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `Minimatch`
- `node:fs` - `fs`
- `node:path` - `path`
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`linkInference.LinkEvidence`](../inference/linkInference.ts.mdmd.md#symbol-linkevidence) (type-only)
- [`relationshipResolvers.createBuiltInResolvers`](./relationshipResolvers.ts.mdmd.md#symbol-createbuiltinresolvers)
- [`relationshipRuleTypes.CompiledRelationshipRule`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprule) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRulePropagation`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulepropagation) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRuleStep`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulestep) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules) (type-only)
- [`relationshipRuleTypes.RelationshipResolver`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolver) (type-only)
- [`relationshipRuleTypes.RelationshipRuleChain`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulechain) (type-only)
- [`relationshipRuleTypes.RelationshipRuleConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleConfigLoadResult`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfigloadresult) (type-only)
- [`relationshipRuleTypes.RelationshipRulePropagationConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulepropagationconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleStepConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulestepconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
- [`relationshipRuleTypes.RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig) (type-only)
- [`pathUtils.toWorkspaceRelativePath`](../tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
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
