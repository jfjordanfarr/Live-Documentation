# packages/shared/src/rules/relationshipRuleTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleTypes.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruletypes-ts
- Generated At: 2025-12-05T04:16:20.032Z

## Authored
### Purpose
Defines the configuration and compiled contract types that power relationship rules, symbol-correctness profiles, and diagnosis of missing links across the workspace graph.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Shared by both the profile compiler and the relationship rule engine so audits and the language server evaluate identical structures.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.032Z","inputHash":"d4297f1950a27e5c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolProfileRequirementDirection` {#symbol-symbolprofilerequirementdirection}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L4)

#### `RelationshipRuleStepConfig` {#symbol-relationshiprulestepconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L6)

#### `RelationshipRulePropagationConfig` {#symbol-relationshiprulepropagationconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L16)

#### `RelationshipRuleConfig` {#symbol-relationshipruleconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L23)

#### `RelationshipRulesConfig` {#symbol-relationshiprulesconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L31)

#### `RelationshipRuleConfigLoadResult` {#symbol-relationshipruleconfigloadresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L39)

#### `RelationshipRuleWarning` {#symbol-relationshiprulewarning}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L45)

#### `RelationshipResolverResult` {#symbol-relationshipresolverresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L51)

#### `RelationshipResolverOptions` {#symbol-relationshipresolveroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L56)

#### `RelationshipResolver` {#symbol-relationshipresolver}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L64)

#### `CompiledRelationshipRuleStep` {#symbol-compiledrelationshiprulestep}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L69)

#### `CompiledRelationshipRulePropagation` {#symbol-compiledrelationshiprulepropagation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L80)

#### `CompiledRelationshipRule` {#symbol-compiledrelationshiprule}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L87)

#### `CompiledRelationshipRules` {#symbol-compiledrelationshiprules}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L95)

#### `RelationshipRuleChain` {#symbol-relationshiprulechain}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L101)

#### `RelationshipRuleChainStep` {#symbol-relationshiprulechainstep}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L106)

#### `SymbolProfileSourceConfig` {#symbol-symbolprofilesourceconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L112)

#### `SymbolProfileTargetConfig` {#symbol-symbolprofiletargetconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L120)

#### `SymbolProfileEnforcementMode` {#symbol-symbolprofileenforcementmode}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L126)

#### `SymbolProfileOverrideConfig` {#symbol-symbolprofileoverrideconfig}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L128)
- Returns: `SymbolProfileEnforcementMode`

#### `SymbolProfileRequirementConfig` {#symbol-symbolprofilerequirementconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L136)

#### `SymbolCorrectnessProfileConfig` {#symbol-symbolcorrectnessprofileconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L147)

#### `CompiledSymbolProfileTarget` {#symbol-compiledsymbolprofiletarget}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L158)

#### `CompiledSymbolProfileRequirement` {#symbol-compiledsymbolprofilerequirement}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L165)

#### `CompiledSymbolProfileSource` {#symbol-compiledsymbolprofilesource}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L176)

#### `CompiledSymbolProfile` {#symbol-compiledsymbolprofile}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L184)

#### `SymbolProfileLookup` {#symbol-symbolprofilelookup}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L194)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
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
