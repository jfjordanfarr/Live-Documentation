# packages/shared/src/tooling/symbolReferences.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/symbolReferences.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-symbolreferences-ts
- Generated At: 2025-12-05T04:16:20.282Z

## Authored
### Purpose
Implements the shared detector SlopCop uses to spot duplicate heading slugs and unresolved anchors across markdown artifacts ([symbol audit rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes
- Exercised via the opt-in `slopcop:symbols` CLI and its integration fixture, which asserts the analyzer raises exit code 3 until the docs are repaired ([fixture validation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6048-L6073)).
- Relies on the vendored GitHub slugger and shared markdown parsing helpers so reported slugs match GitHub’s anchor rules when we fix MDMD/spec links ([slug alignment plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1089-L1244)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.282Z","inputHash":"493aa765e393ea46"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolIssueKind` {#symbol-symbolissuekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L12)

#### `SymbolIssueSeverity` {#symbol-symbolissueseverity}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L13)

#### `SymbolRuleSetting` {#symbol-symbolrulesetting}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L14)
- Returns: `SymbolIssueSeverity`

#### `SymbolReferenceIssue` {#symbol-symbolreferenceissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L16)

#### `SymbolAuditOptions` {#symbol-symbolauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L29)

#### `findSymbolReferenceAnomalies` {#symbol-findsymbolreferenceanomalies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L68)
- Returns: `SymbolReferenceIssue`[]
- Parameters: `options`: `SymbolAuditOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`githubSlugger.GitHubSlugger`](./githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.parseLinkTarget`](./markdownShared.ts.mdmd.md#symbol-parselinktarget)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
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
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
