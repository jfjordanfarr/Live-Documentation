# packages/shared/src/rules/symbolCorrectnessProfiles.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/symbolCorrectnessProfiles.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-symbolcorrectnessprofiles-ts
- Generated At: 2025-12-05T15:37:25.661Z

## Authored
### Purpose
Compiles symbol-correctness profiles from relationship-rules config so diagnostics can enforce required inbound/outbound links for documented artifacts.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Emits warnings for malformed profile definitions and returns lookup helpers consumed by the server validator, closing the audit gap identified during the October 30 safe-commit pass.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]
- Continuous runs of `npm run graph:audit` after October 30 rely on these compiled profiles to report satisfied vs missing relationships per artifact.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-10.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.661Z","inputHash":"6415f4099bcf581c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolProfileLoadResult` {#symbol-symbolprofileloadresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L23)

#### `CompileSymbolProfilesResult` {#symbol-compilesymbolprofilesresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L28)

#### `loadSymbolCorrectnessProfiles` {#symbol-loadsymbolcorrectnessprofiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L34)
- Returns: `SymbolProfileLoadResult`
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)

#### `compileSymbolProfiles` {#symbol-compilesymbolprofiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L55)
- Returns: `CompileSymbolProfilesResult`
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `Minimatch`
- [`relationshipRuleTypes.CompiledSymbolProfile`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofile) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileRequirement`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilerequirement) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileSource`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilesource) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileTarget`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofiletarget) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
- [`relationshipRuleTypes.RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig) (type-only)
- [`relationshipRuleTypes.SymbolCorrectnessProfileConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolcorrectnessprofileconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileEnforcementMode`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileenforcementmode) (type-only)
- [`relationshipRuleTypes.SymbolProfileLookup`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilelookup) (type-only)
- [`relationshipRuleTypes.SymbolProfileOverrideConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileoverrideconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileRequirementConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileRequirementDirection`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementdirection) (type-only)
- [`relationshipRuleTypes.SymbolProfileSourceConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilesourceconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileTargetConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofiletargetconfig) (type-only)
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
<!-- LIVE-DOC:END Observed Evidence -->
