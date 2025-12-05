# packages/shared/src/live-docs/parse.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/parse.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-parse-ts
- Generated At: 2025-12-05T20:44:57.744Z

## Authored
### Purpose
Centralises Live Doc markdown parsing so CLI utilities can obtain consistent metadata, symbol listings, and dependency edges without duplicating regex logic.

### Notes
Outputs workspace-relative paths and filters Live Doc links down to their underlying code artefacts, keeping downstream scripts agnostic of mirror layout conventions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T20:44:57.744Z","inputHash":"0460045e6f6e29c2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ParsedTypeReference` {#symbol-parsedtypereference}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L16)

##### `ParsedTypeReference` — Summary
Represents a type reference extracted from a Live Doc's Public Symbols section.

##### `ParsedTypeReference` — Remarks
This mirrors the structure rendered by the Live Doc generator when a symbol's
return type, parameter type, extends clause, or implements clause references
another type defined in the workspace. The `targetDocPath` and `targetAnchor`
fields enable navigation in the Explorer's Local Map.

#### `ParsedLiveDoc` {#symbol-parsedlivedoc}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L51)

#### `ParsedSymbolDocumentationEntry` {#symbol-parsedsymboldocumentationentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L60)

#### `ParsedDependency` {#symbol-parseddependency}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L71)

#### `parseLiveDocMarkdown` {#symbol-parselivedocmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L81)
- Returns: [`ParsedLiveDoc`](./parse.d.ts.mdmd.md#symbol-parsedlivedoc)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension) (type-only)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
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
