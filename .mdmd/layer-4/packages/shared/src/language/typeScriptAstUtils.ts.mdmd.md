# packages/shared/src/language/typeScriptAstUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/language/typeScriptAstUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-language-typescriptastutils-ts
- Generated At: 2025-12-05T04:16:19.666Z

## Authored
### Purpose
Tracks TypeScript identifier usage so fallback inference and workspace indexing can distinguish runtime imports from type-only references, preserving accurate dependency edges. Introduced during the November 3 analyzer hardening pass documented in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367).

### Notes
The ripple semantics review the same day captured why we route TypeScript compiler events through these helpers instead of trusting raw LSIF output—see [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504) for the rationale that guides future adjustments.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.666Z","inputHash":"6b40e5cd7efd33a7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IdentifierUsage` {#symbol-identifierusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L3)

#### `extractLocalImportNames` {#symbol-extractlocalimportnames}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L8)
- Parameters: `importClause`: `ts.ImportClause`

#### `collectIdentifierUsage` {#symbol-collectidentifierusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L34)
- Parameters: `sourceFile`: `ts.SourceFile`

#### `hasRuntimeUsage` {#symbol-hasruntimeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L64)

#### `hasTypeUsage` {#symbol-hastypeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L75)

#### `isLikelyTypeDefinitionSpecifier` {#symbol-islikelytypedefinitionspecifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L86)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
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
- [fallbackInference.languages.test.ts](../inference/fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../inference/fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
- [typeScriptFixtureOracle.test.ts](../testing/fixtureOracles/typeScriptFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
