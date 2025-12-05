# packages/shared/src/rules/relationshipRuleAudit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleAudit.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleaudit-ts
- Generated At: 2025-12-05T04:16:20.000Z

## Authored
### Purpose
Evaluates compiled relationship rules against the graph to surface coverage diagnostics and human-readable gaps, feeding both CLI audits and Live Doc evidence.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Formats JSON and text diagnostics used by `graph-tools/audit-doc-coverage.ts` after symbol-correctness profiles landed, ensuring missing relationships can be triaged quickly.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.000Z","inputHash":"ebe2d1978bcf89a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RelationshipCoverageChain` {#symbol-relationshipcoveragechain}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L11)

#### `RelationshipCoverageIssueKind` {#symbol-relationshipcoverageissuekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L17)

#### `RelationshipCoverageIssue` {#symbol-relationshipcoverageissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L19)

#### `RelationshipCoverageRuleResult` {#symbol-relationshipcoverageruleresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L31)

#### `RelationshipCoverageResult` {#symbol-relationshipcoverageresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L38)

#### `EvaluateRelationshipCoverageOptions` {#symbol-evaluaterelationshipcoverageoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L42)

#### `evaluateRelationshipCoverage` {#symbol-evaluaterelationshipcoverage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L48)
- Returns: `RelationshipCoverageResult`
- Parameters: `options`: `EvaluateRelationshipCoverageOptions`

#### `RelationshipCoverageDiagnostic` {#symbol-relationshipcoveragediagnostic}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L345)

#### `formatRelationshipDiagnostics` {#symbol-formatrelationshipdiagnostics}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L354)
- Returns: `RelationshipCoverageDiagnostic`[]
- Parameters: `result`: `RelationshipCoverageResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graphStore.GraphStore`](../db/graphStore.ts.mdmd.md#symbol-graphstore) (type-only)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRule`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprule) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRuleStep`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulestep) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
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
